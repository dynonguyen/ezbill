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
import { computed, ref } from 'vue';
import { useApiClient } from '../../../../hooks/useApiClient';
import BillDetailPopup from '../../bills/BillDetailPopup.vue';
import BillItem from '../../bills/BillItem.vue';
import { getMemberAmount } from '../../helpers/utils';
import { useGroupContext } from '../../hooks/useGroupContext';

type Tab = 'all' | BillByMemberStatus;

const props = defineProps<{ id: MemberId }>();

const detailId = ref<BillId | null>(null);
const activeTab = ref<Tab>('all');

const apiClient = useApiClient();
const { group } = useGroupContext();

const fetchOptions = computed<ApiListBillsByMemberReq>(() => {
	const status: BillByMemberStatus | undefined =
		activeTab.value === 'all' ? undefined : activeTab.value;

	return {
		offset: 0,
		limit: 100,
		sortBy: 'created_at',
		sortOrder: SortOrder.Desc,
		...(status ? { status } : {}),
	};
});

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
		const isPayer = b.createdBy === props.id;
		const memberAmount = getMemberAmount(b.members, props.id);
		const spentAmount = memberAmount || (isPayer ? 0 : b.amount);

		return {
			...b,
			amount: isPayer ? b.amount - spentAmount : -spentAmount,
			isPayer,
		};
	});
});

const tabs: Array<{ value: Tab; label: string }> = [
	{ value: 'all', label: 'Tất cả' },
	{ value: 'paid', label: 'Nhận lại' },
	{ value: 'owed', label: 'Cần trả' },
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

			<BillDetailPopup v-if="detailId" v-model="detailId" />
		</template>
		<template v-else>
			<Typography class="text-center text-gray-500 my-8">Không có hoá đơn</Typography>
		</template>
	</Flex>
</template>
