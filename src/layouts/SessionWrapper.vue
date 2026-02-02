<script setup lang="ts">
import { useMutation, useQuery } from '@tanstack/vue-query';
import { ref, watch } from 'vue';
import Feedback from '../components/Feedback.vue';
import Loading from '../components/Loading.vue';
import Button from '../components/ui/Button.vue';
import Flex from '../components/ui/Flex.vue';
import { ERROR_CODES, HTTP_STATUS_CODES } from '../constants/code';
import { QUERY_KEY } from '../constants/key';
import { useApiClient } from '../hooks/useApiClient';
import { useToast } from '../hooks/useToast';
import { getImgUrl } from '../utils/get-asset';

const MAX_RETRIES = 5;

const apiClient = useApiClient();
const toast = useToast();

const loading = ref(true);
const isSessionReady = ref(false);
const checkSessionRetries = ref(0);
const createSessionRetries = ref(0);
const isError = ref(false);

const sessionQuery = useQuery({
	queryKey: [QUERY_KEY.CHECK_SESSION],
	queryFn: apiClient.checkSession,
	retry: false,
});
const { mutateAsync: createSession } = useMutation({
	mutationFn: apiClient.createSession,
});

const handleSessionReady = () => {
	loading.value = false;
	isSessionReady.value = true;
};

const handleRetryCheckSession = () => {
	if (checkSessionRetries.value >= MAX_RETRIES) {
		isError.value = true;
		return;
	}

	checkSessionRetries.value++;
	toast.errorWithRetry('Không thể kết nối đến máy chủ, vui lòng thử lại', () =>
		sessionQuery.refetch(),
	);
};

const handleCreateSession = async () => {
	const resp = await createSession();
	if (resp.success) {
		handleSessionReady();
		return;
	}

	if (createSessionRetries.value >= MAX_RETRIES) {
		isError.value = true;
		return;
	}

	createSessionRetries.value++;
	toast.errorWithRetry('Đã có lỗi xảy ra, vui lòng thử lại', () => handleCreateSession());
};

const handleReload = () => {
	location.reload();
};

const retryable = (statusCode?: number, errorCode?: number | null) => {
	if (errorCode === ERROR_CODES.NETWORK_ERROR) return true;
	if (statusCode && statusCode >= HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) return true;
	return false;
};

watch([sessionQuery.isPending, sessionQuery.data], ([isPending, resp]) => {
	if (isPending) return;

	if (resp?.success) {
		handleSessionReady();
		return;
	}

	if (retryable(resp?.statusCode, resp?.errorCode)) {
		handleRetryCheckSession();
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
