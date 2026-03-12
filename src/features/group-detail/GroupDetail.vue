<script setup lang="ts">
import Feedback from '@/components/Feedback.vue';
import Loading from '@/components/Loading.vue';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import { CONTEXT_KEY, QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import router from '@/routes/router';
import { useLocalDBStore } from '@/stores/local-db';
import { getImgUrl } from '@/utils/get-asset';
import { retryOnFailure } from '@/utils/helpers';
import { useQuery } from '@tanstack/vue-query';
import { computed, onMounted, onUnmounted, provide, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useApiClient } from '../../hooks/useApiClient';
import { useEzbiuGroupEvents } from '../../hooks/useEzbiuGroupEvents';
import GroupBillDetail from './GroupBillDetail.vue';

const route = useRoute();
const groupId = computed(() => route.params.id as string);
const localDBStore = useLocalDBStore();

const apiClient = useApiClient();

const {
	data: group,
	isPending,
	isError,
	refetch,
} = useQuery({
	queryKey: [QUERY_KEY.GROUP, groupId],
	queryFn: () => apiClient.fetchGroup(groupId.value).then((resp) => resp.data),
});

const handleJoinGroup = async (refetchGroup: () => void) => {
	const inviteKey = route.query.invite_key as string | undefined;
	if (!inviteKey) return;

	await retryOnFailure(() => apiClient.joinGroup(groupId.value, inviteKey));

	router.replace({ query: { invite_key: undefined } });
	refetchGroup();
};

provide(CONTEXT_KEY.GROUP, group);
watch(group, () => {
	if (group.value) {
		localDBStore.joinGroup(groupId.value);
	}
});
const { connect, disconnect } = useEzbiuGroupEvents(groupId);

onMounted(async () => {
	document.getElementById('app-layout')?.classList.remove('h-dvh');
	await handleJoinGroup(refetch);

	connect();
});

onUnmounted(() => {
	document.getElementById('app-layout')?.classList.add('h-dvh');
	disconnect();
});
</script>

<template>
	<Flex v-if="isPending" center class="h-dvh px-4">
		<Loading />
	</Flex>
	<Feedback
		v-else-if="isError || !group"
		:img="getImgUrl('no-groups.svg')"
		title="Nhóm không tồn tại hoặc đã xảy ra lỗi."
		class="h-dvh px-4">
		<template #action>
			<Button
				class="w-fit"
				start-icon="icon msi-home-outline-rounded"
				size="sm"
				@click="$router.push(PATH.HOME)">
				Về trang chủ
			</Button>
		</template>
	</Feedback>
	<GroupBillDetail v-else />
</template>
