<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import Feedback from '../components/Feedback.vue';
import Loading from '../components/Loading.vue';
import Button from '../components/ui/Button.vue';
import Flex from '../components/ui/Flex.vue';
import { QUERY_KEY } from '../constants/key';
import { useApiClient } from '../hooks/useApiClient';
import { useToast } from '../hooks/useToast';
import { getImgUrl } from '../utils/get-asset';

const MAX_RETRIES = 5;

const apiClient = useApiClient();
const toast = useToast();

const loading = ref(true);
const isSessionReady = ref(false);
const retries = ref(0);
const isError = ref(false);

const sessionQuery = useQuery({
	queryKey: [QUERY_KEY.CHECK_SESSION],
	queryFn: apiClient.checkSession,
});
const { mutateAsync: createSession } = useMutation({
	mutationFn: apiClient.createSession,
});

const handleSessionReady = () => {
	loading.value = false;
	isSessionReady.value = true;
};

const handleCreateSession = async () => {
	const resp = await createSession();
	if (resp.success) {
		handleSessionReady();
		return;
	}

	if (retries.value >= MAX_RETRIES) {
		isError.value = true;
		return;
	}

	retries.value++;
	toast.errorWithRetry('Đã có lỗi xảy ra, vui lòng thử lại', () => handleCreateSession());
};

const handleReload = () => {
	location.reload();
};

watch([sessionQuery.isPending, sessionQuery.data], ([isPending, resp]) => {
	if (isPending) return;
	if (resp?.success) {
		handleSessionReady();
		return;
	}

	handleCreateSession();
});
</script>

<template>
	<slot v-if="isSessionReady"></slot>
	<Feedback
		v-else-if="isError"
		:img="getImgUrl('server-error.svg')"
		title="Vui lòng thử lại sau hoặc tải lại trang."
		class="h-dvh px-4">
		<template #action>
			<Button start-icon="icon msi-refresh-rounded" size="sm" @click="handleReload">
				Tải lại trang
			</Button>
		</template>
	</Feedback>
	<Flex v-else-if="loading" stack center class="h-dvh">
		<Loading />
	</Flex>
</template>
