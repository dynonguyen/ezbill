<script setup lang="ts">
import { getAssetUrl } from '@/utils/get-asset';
import { Button } from 'primevue';
import { onErrorCaptured, ref } from 'vue';
import Flex from './Flex.vue';
import Typography from './Typography.vue';

const error = ref<Error | null>(null);

onErrorCaptured((err) => {
	error.value = err;
	console.error('ErrorBoundary:', error);
	return false;
});

const handleReload = () => {
	window.location.reload();
};
</script>

<template>
	<slot v-if="Boolean(error)" name="fallback">
		<Flex stack class="max-w-md mx-auto my-12 gap-6">
			<img :src="getAssetUrl('img/server-error.svg')" />
			<Typography variant="displayMedium" class="text-center">
				Đã có lỗi xảy ra!
				<Typography variant="lgMedium" class="text-gray-600">Reload trang để thử lại.</Typography>
			</Typography>
			<Flex center class="w-full">
				<Button icon="icon msi-refresh-rounded" label="Reload" @click="handleReload" />
			</Flex>
		</Flex>
	</slot>
	<slot v-else></slot>
</template>
