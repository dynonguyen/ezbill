<script setup lang="ts">
import { fetchGroup } from '@/apis/supabase';
import Feedback from '@/components/Feedback.vue';
import Flex from '@/components/Flex.vue';
import GoHomeArrow from '@/components/GoHomeArrow.vue';
import Loading from '@/components/Loading.vue';
import Typography from '@/components/Typography.vue';
import { CONTEXT_KEY, QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import { useLocalDBStore } from '@/stores/local-db';
import { getImgUrl } from '@/utils/get-asset';
import { useQuery } from '@tanstack/vue-query';
import { storeToRefs } from 'pinia';
import { Button } from 'primevue';
import { computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import BillList from './bills/BillList.vue';
import NewBillButton from './bills/NewBillButton.vue';
import JoinGroup from './join-group/JoinGroup.vue';
import MemberList from './members/MemberList.vue';
import UserSwitcher from './members/UserSwitcher.vue';
import Statistics from './Statistics.vue';

const route = useRoute();
const groupId = computed(() => route.params.id as string);
const localDBStore = useLocalDBStore();
const { joinedGroups } = storeToRefs(localDBStore);

const {
	data: group,
	isPending,
	isError,
} = useQuery({
	queryKey: [QUERY_KEY.GROUP, groupId],
	queryFn: () => fetchGroup(groupId.value),
});

const isJoined = computed(() =>
	joinedGroups.value.some(
		(g) => g.groupId === groupId.value && group.value?.members.some((m) => m.id === g.userId),
	),
);

const user = computed(() => {
	const userId = joinedGroups.value.find(
		(g) => g.groupId === groupId.value && group.value?.members.some((m) => m.id === g.userId),
	)?.userId;

	return group.value?.members.find((m) => m.id === userId);
});

provide(CONTEXT_KEY.GROUP, group);
provide(CONTEXT_KEY.GROUP_USER, user);
</script>

<template>
	<Flex v-if="isPending" center class="h-full px-4">
		<Loading />
	</Flex>
	<Feedback
		v-else-if="isError || !group"
		:img="getImgUrl('no-groups-found.svg')"
		title="Nhóm không tồn tại hoặc đã xảy ra lỗi."
		class="px-4">
		<template #action>
			<Button
				class="w-fit"
				icon="icon msi-home-outline-rounded"
				label="Về trang chủ"
				@click="$router.push(PATH.HOME)" />
		</template>
	</Feedback>
	<template v-else>
		<JoinGroup v-if="!isJoined" class="h-full px-4" />
		<Flex v-else stack class="h-full">
			<div class="grow overflow-auto max-h-full px-4">
				<Flex class="justify-between gap-2">
					<Flex class="gap-4">
						<GoHomeArrow />
						<Typography variant="xlMedium" class="break-all whitespace-pre-wrap">
							{{ group.name }}
						</Typography>
					</Flex>
					<UserSwitcher />
				</Flex>

				<Flex class="gap-8 mt-6" stack>
					<Statistics />
					<MemberList />

					<Flex stack class="gap-4">
						<Typography variant="displaySemiBold">Bills</Typography>
						<BillList />
					</Flex>
				</Flex>
			</div>

			<Flex center class="shrink-0">
				<NewBillButton />
			</Flex>
		</Flex>
	</template>
</template>
