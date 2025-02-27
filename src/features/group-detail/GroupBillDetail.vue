<script setup lang="ts">
import { fetchBills } from '@/apis/supabase';
import CurrencyText from '@/components/CurrencyText.vue';
import Loading from '@/components/Loading.vue';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { CONTEXT_KEY, QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import { useQuery } from '@tanstack/vue-query';
import { computed, defineAsyncComponent, provide, ref, watch } from 'vue';
import GroupMenu from './GroupMenu.vue';
import { useGroupContext } from './hooks/useGroupContext';
import MemberList from './members/MemberList.vue';

const NewBillPopup = defineAsyncComponent(() => import('./bills/NewBillPopup.vue'));

const { group } = useGroupContext();

const {
	data: bills,
	isPending,
	error,
} = useQuery({
	queryKey: [QUERY_KEY.BILL_LIST, group.value.id],
	queryFn: () => fetchBills(group.value.id),
});

const openNewBill = ref(false);

watch(error, () => {
	if (error.value) throw error.value;
});

const total = computed(() => bills.value?.reduce((acc, bill) => acc + bill.amount, 0) || 0);

provide(CONTEXT_KEY.BILLS, bills);
</script>

<template>
	<Flex v-if="isPending || error" center class="h-full">
		<Loading />
	</Flex>
	<Flex v-else stack class="bg-indigo-50 min-h-full">
		<!-- Header -->
		<Flex class="px-4 py-2 gap-2 justify-between">
			<Button
				variant="soft"
				color="grey"
				shape="circle"
				size="sm"
				class="bg-base-300 border-base-300 shrink-0"
				start-icon="icon msi-home-rounded"
				@click="$router.push(PATH.HOME)" />

			<Flex stack class="grow" center>
				<Typography
					variant="mdSemiBold"
					class="text-black line-clamp-1 break-all"
					:title="group.name">
					{{ group.name }}
				</Typography>
				<Flex class="gap-4">
					<Flex class="gap-1 text-slate-500">
						<span class="icon msi-group-rounded"></span>
						<Typography variant="xsRegular">{{ group.members.length }}</Typography>
					</Flex>

					<Flex class="gap-1 text-slate-500">
						<span class="icon msi-receipt-long-rounded"></span>
						<Typography variant="xsRegular">{{ bills?.length || 0 }}</Typography>
					</Flex>
				</Flex>
			</Flex>

			<GroupMenu />
		</Flex>

		<!-- Group statistic -->
		<Flex stack class="p-4">
			<Flex stack class="p-4 gap-2 bg-gray-800">
				<Typography variant="smRegular" class="text-white">Tổng chi tiêu nhóm:</Typography>
				<Flex class="gap-1 text-white !items-end">
					<CurrencyText
						:amount="total"
						amount-class="font-black text-[40px] leading-[43px]"
						unit-class="text-2xl" />
				</Flex>
			</Flex>

			<Flex class="w-full h-4 justify-between bg-gray-800">
				<span :class="$style['half-circle']" class="rotate-90 relative right-1"></span>
				<div class="h-1 border-t border-dashed text-gray-100 w-full relative top-[1px]"></div>
				<span :class="$style['half-circle']" class="-rotate-90 relative left-1"></span>
			</Flex>

			<Flex stack class="p-4 gap-2 bg-gray-800 rounded-b-2xl shadow-lg">
				<Button start-icon="icon msi-add-rounded" @click="openNewBill = true">Thêm hoá đơn</Button>
			</Flex>
		</Flex>

		<!-- Members -->
		<MemberList />
	</Flex>

	<!-- New bill -->
	<Suspense>
		<NewBillPopup v-if="openNewBill" v-model:open="openNewBill" @close="openNewBill = false" />
	</Suspense>
</template>

<style module>
.half-circle {
	width: 12px;
	height: 6px;
	border-top-left-radius: 100px;
	border-top-right-radius: 100px;
	@apply bg-white;
}
</style>
