<script setup lang="ts">
import { fetchBills } from '@/apis/supabase';
import CurrencyText from '@/components/CurrencyText.vue';
import Loading from '@/components/Loading.vue';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { CONTEXT_KEY, QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useQuery } from '@tanstack/vue-query';
import { computed, nextTick, onUnmounted, provide, ref, watch } from 'vue';
import BalanceList from './balances/BalanceList.vue';
import BillList from './bills/BillList.vue';
import NewBillPopup from './bills/NewBillPopup.vue';
import GroupMenu from './GroupMenu.vue';
import { useGroupContext } from './hooks/useGroupContext';
import MemberList from './members/MemberList.vue';

type BillTabValue = 'bills' | 'balances';

const { group } = useGroupContext();

const {
	data: bills,
	isPending,
	error,
} = useQuery({
	queryKey: [QUERY_KEY.BILL_LIST, group.value.id],
	queryFn: () => fetchBills(group.value.id),
});

const openNewBill = ref(true); // MOCK
const billTab = ref<BillTabValue>('bills');

watch(error, () => {
	if (error.value) throw error.value;
});

const total = computed(() => bills.value?.reduce((acc, bill) => acc + bill.amount, 0) || 0);
const billTabs = computed<Array<[BillTabValue, string]>>(() => [
	['bills', `Hoá đơn (${bills.value?.length || 0})`],
	['balances', 'Số dư'],
]);
const loading = computed(() => isPending.value || error.value);

const handleToggleStatistic = () => {
	const stickyStatistic = document.getElementById('sticky-statistic');

	if (!stickyStatistic) return;

	if (stickyStatistic.classList.contains('first-render')) {
		return stickyStatistic.classList.remove('first-render');
	}

	if (stickyStatistic.classList.contains('hidden')) {
		stickyStatistic.classList.remove('hidden');
	} else {
		stickyStatistic.classList.add('hidden');
	}
};

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
	const target = document.getElementById('observer-target');

	if (target) {
		observer && observer.disconnect();
		observer = new IntersectionObserver(handleToggleStatistic, { threshold: 1 });

		observer.observe(target);
	}
};

watch(loading, () => {
	if (!loading.value) {
		nextTick(setupObserver);
	} else {
		observer?.disconnect();
	}
});

onUnmounted(() => observer?.disconnect());
usePageTitle(group.value.name);

provide(CONTEXT_KEY.BILLS, bills);
</script>

<template>
	<Flex v-if="loading" center class="h-dvh">
		<Loading />
	</Flex>
	<Flex v-else stack class="bg-indigo-50 min-h-dvh overflow-auto" id="group-detail">
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
		<Flex stack class="p-4" id="statistic">
			<Flex stack class="p-4 gap-2 bg-gray-800">
				<Typography variant="smRegular" class="text-white">Tổng chi tiêu nhóm:</Typography>
				<Flex class="gap-1 text-white !items-end">
					<CurrencyText
						:amount="total"
						amount-class="font-black text-[40px] leading-[43px]"
						:fixed="0"
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

			<div id="observer-target" class="invisible"></div>
		</Flex>

		<!-- Sticky statistic -->
		<Flex
			id="sticky-statistic"
			class="hidden gap-2 justify-between fixed top-0 left-1/2 -translate-x-1/2 p-4 bg-gray-800 rounded-b-2xl w-full z-10 first-render max-w-screen-sm"
			center>
			<CurrencyText
				:amount="total"
				amount-class="text-2xl font-semibold text-white"
				unit-class="text-2xl text-white"
				:fixed="0" />
			<Button start-icon="icon msi-add-rounded" size="sm" @click="openNewBill = true">
				Thêm hoá đơn
			</Button>
		</Flex>

		<!-- Members -->
		<MemberList />

		<!-- Bills & Balances -->
		<Flex stack class="p-4 gap-3.5 bg-white rounded-t-2xl grow h-full">
			<div role="tablist" class="tabs tabs-boxed grid-cols-2">
				<a
					v-for="[value, label] in billTabs"
					:key="value"
					role="tab"
					class="tab"
					:class="{ 'tab-active': billTab === value }"
					@click="billTab = value">
					{{ label }}
				</a>
			</div>

			<div class="grow">
				<BillList v-if="billTab === 'bills'" />
				<BalanceList v-if="billTab === 'balances'" />
			</div>
		</Flex>
	</Flex>

	<!-- New bill -->
	<NewBillPopup v-if="openNewBill" v-model:open="openNewBill" />
</template>

<style module>
.half-circle {
	width: 12px;
	height: 6px;
	border-top-left-radius: 100px;
	border-top-right-radius: 100px;
	@apply bg-indigo-50;
}
</style>
