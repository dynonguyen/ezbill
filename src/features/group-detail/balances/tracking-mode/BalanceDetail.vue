<script setup lang="ts">
import {
	SortOrder,
	type ApiListBillsByMemberReq,
	type BillByMemberStatus,
} from '@/apis/api-client';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import type { BillId, MemberId } from '@/types/entities';
import { useQuery } from '@tanstack/vue-query';
import { match, P } from 'ts-pattern';
import { computed, ref } from 'vue';
import { useApiClient } from '../../../../hooks/useApiClient';
import BillDetailPopup from '../../bills/BillDetailPopup.vue';
import BillItem from '../../bills/BillItem.vue';
import { getMemberAmount } from '../../helpers/utils';
import { useGroupContext } from '../../hooks/useGroupContext';

const props = defineProps<{ id: MemberId }>();
const activeTab = ref<BillByMemberStatus>('to_pay');
const detailId = ref<BillId | null>(null);

const apiClient = useApiClient();
const { group } = useGroupContext();

const fetchOptions = computed<ApiListBillsByMemberReq>(() => ({
	offset: 0,
	limit: 1000,
	sortBy: 'created_at',
	order: SortOrder.Desc,
	status: activeTab.value,
}));

const billsByMemberQueryKey = computed(() => [
	QUERY_KEY.BILLS_BY_MEMBER,
	group.value.id,
	props.id,
	activeTab.value,
]);

const { data: billsByMember } = useQuery({
	queryKey: billsByMemberQueryKey,
	queryFn: () =>
		apiClient
			.listBillsByMember(group.value.id, props.id, fetchOptions.value)
			.then((res) => res.data),
});

const memberBills = computed(() => {
	const bills = billsByMember.value?.data ?? [];
	return bills.map((b) => {
		const amount = match<BillByMemberStatus, number>(activeTab.value)
			.with(P.union('to_pay', 'paid'), () => -getMemberAmount(b.members, props.id))
			.with('to_receive', () => {
				const paidMemberIds = new Set(b.paymentTracking.map((t) => t.memberId));
				return b.members.reduce((sum, m) => {
					if (m.memberId === props.id || paidMemberIds.has(m.memberId)) return sum;
					return sum + m.shareAmount;
				}, 0);
			})
			.otherwise(() => 0);

		return { ...b, amount } as typeof b & { amount: number };
	});
});

const tabs: Array<{ value: BillByMemberStatus; label: string }> = [
	{ value: 'to_pay', label: 'Cần trả' },
	{ value: 'to_receive', label: 'Nhận lại' },
	{ value: 'paid', label: 'Đã trả' },
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
			<BillDetailPopup v-if="detailId" v-model="detailId" />
		</template>
		<template v-else>
			<Typography class="text-center text-gray-500 my-8">Không có hoá đơn</Typography>
		</template>
	</Flex>
</template>
