<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Bill, Member } from '@/types/entities';
import { match, P } from 'ts-pattern';
import { computed, ref } from 'vue';
import BillDetailPopup from '../../bills/BillDetailPopup.vue';
import BillItem from '../../bills/BillItem.vue';
import { isAllPaid, isMemberPaid } from '../../helpers/utils';
import { useBillsContext } from '../../hooks/useBillsContext';

type Tab = 'to-pay' | 'received' | 'transferred';

const props = defineProps<{ id: Member['id'] }>();
const bills = useBillsContext();
const activeTab = ref<Tab>('to-pay');
const detailId = ref<Bill['id'] | null>(null);

const memberBills = computed(() => {
	return bills.value
		.filter((b) => {
			return match(activeTab.value)
				.with(
					'to-pay',
					() => b.createdBy !== props.id && b.members[props.id] > 0 && !isMemberPaid(b, props.id),
				)
				.with('received', () => b.createdBy === props.id && !isAllPaid(b))
				.with(
					'transferred',
					() => b.createdBy !== props.id && b.members[props.id] > 0 && isMemberPaid(b, props.id),
				)
				.exhaustive();
		})
		.map((b) => {
			const amount = match(activeTab.value)
				.with(P.union('to-pay', 'transferred'), () => -b.members[props.id])
				.with('received', () =>
					Object.entries(b.members).reduce((sum, [id, amount]) => {
						if (id === props.id || isMemberPaid(b, id)) return sum;
						return sum + amount;
					}, 0),
				)
				.exhaustive();
			return { ...b, amount };
		});
});

const tabs: Array<{ value: Tab; label: string }> = [
	{ value: 'to-pay', label: 'Cần trả' },
	{ value: 'received', label: 'Nhận lại' },
	{ value: 'transferred', label: 'Đã trả' },
];
</script>

<template>
	<Flex stack class="gap-2">
		<div role="tablist" class="tabs tabs-boxed">
			<a
				v-for="tab in tabs"
				:key="tab.value"
				role="tab"
				class="tab"
				:class="{ 'tab-active': tab.value === activeTab }"
				@click="activeTab = tab.value">
				{{ tab.label + (activeTab === tab.value ? ` (${memberBills.length})` : '') }}
			</a>
		</div>

		<template v-if="memberBills.length">
			<BillItem
				v-for="bill in memberBills"
				:key="bill.id"
				:bill="bill"
				@view-detail="detailId = bill.id"
				:pt="{
					currencyText: {
						showSign: true,
						class: bill.amount > 0 ? 'text-green-600' : 'text-red-500',
					},
				}" />
			<BillDetailPopup v-model="detailId" />
		</template>
		<template v-else>
			<Typography class="text-center text-gray-500 my-8">Không có hoá đơn</Typography>
		</template>
	</Flex>
</template>
