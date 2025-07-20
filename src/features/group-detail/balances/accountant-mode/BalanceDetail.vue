<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Bill, Member } from '@/types/entities';
import { match } from 'ts-pattern';
import { computed, ref } from 'vue';
import BillDetailPopup from '../../bills/BillDetailPopup.vue';
import BillItem from '../../bills/BillItem.vue';
import { useBillsContext } from '../../hooks/useBillsContext';

type Tab = 'all' | 'paid' | 'spent';
const props = defineProps<{ id: Member['id'] }>();

const bills = useBillsContext();

const detailId = ref<Bill['id'] | null>(null);
const activeTab = ref<Tab>('all');

const memberBills = computed(() => {
	return bills.value
		.filter((b) => {
			return (
				(b.members[props.id] > 0 || b.createdBy === props.id) &&
				match(activeTab.value)
					.with('all', () => true)
					.with('paid', () => b.createdBy === props.id)
					.with('spent', () => b.createdBy !== props.id)
					.exhaustive()
			);
		})
		.map((b) => {
			const isPayer = b.createdBy === props.id;
			const spentAmount = b.members[props.id] || (isPayer ? 0 : b.amount);
			return { ...b, amount: isPayer ? b.amount - spentAmount : -spentAmount, isPayer };
		});
});

const tabs: Array<{ value: Tab; label: string }> = [
	{ value: 'all', label: 'Tất cả' },
	{ value: 'paid', label: 'Nhận lại' },
	{ value: 'spent', label: 'Cần trả' },
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
					currencyText: { showSign: true, class: bill.isPayer ? 'text-green-600' : 'text-red-500' },
				}" />

			<BillDetailPopup v-model="detailId" />
		</template>
		<template v-else>
			<Typography class="text-center text-gray-500 my-8">Không có hoá đơn</Typography>
		</template>
	</Flex>
</template>
