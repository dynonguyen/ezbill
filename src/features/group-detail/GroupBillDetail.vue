<script setup lang="ts">
import { fetchBills } from '@/apis/supabase';
import Feedback from '@/components/Feedback.vue';
import Flex from '@/components/Flex.vue';
import Loading from '@/components/Loading.vue';
import Typography from '@/components/Typography.vue';
import { CONTEXT_KEY, QUERY_KEY } from '@/constants/key';
import { getImgUrl } from '@/utils/get-asset';
import { useQuery } from '@tanstack/vue-query';
import { provide, watch } from 'vue';
import BillList from './bills/BillList.vue';
import NewBill from './bills/NewBill.vue';
import GroupMenu from './GroupMenu.vue';
import { useGroupContext } from './hooks/useGroupContext';
import MemberList from './members/MemberList.vue';
import UserSwitcher from './members/UserSwitcher.vue';
import Statistics from './Statistics.vue';

const { group } = useGroupContext();
const {
	data: bills,
	isPending,
	error,
} = useQuery({
	queryKey: [QUERY_KEY.BILL_LIST, group.value.id],
	queryFn: () => fetchBills(group.value.id),
});

watch(error, () => {
	if (error.value) throw error.value;
});

provide(CONTEXT_KEY.BILLS, bills);
</script>

<template>
	<Flex v-if="isPending || error" center class="h-full">
		<Loading />
	</Flex>
	<Flex v-else stack class="h-full">
		<div class="grow overflow-auto max-h-full px-4">
			<Flex class="justify-between gap-2">
				<Flex class="gap-4">
					<GroupMenu />
					<Typography variant="xlMedium" class="break-all whitespace-pre-wrap">
						{{ group.name }}
					</Typography>
				</Flex>
				<UserSwitcher />
			</Flex>

			<Flex class="gap-8 mt-6" stack>
				<Statistics />
				<MemberList />

				<Flex stack class="gap-4 mb-8">
					<Typography variant="displaySemiBold">
						Bills {{ bills?.length ? `(${bills.length})` : '' }}
					</Typography>

					<Feedback
						v-if="!bills?.length"
						:img="getImgUrl('no-bills.svg')"
						title="Chưa có bill nào"
						:attrs="{ img: { class: 'w-40' } }" />
					<BillList v-else />
				</Flex>
			</Flex>
		</div>

		<Flex center class="shrink-0">
			<NewBill />
		</Flex>
	</Flex>
</template>
