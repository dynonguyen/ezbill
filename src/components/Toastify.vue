<script setup lang="ts">
import { useToastStore, type ToastType } from '../stores/toast';
import Button from './ui/Button.vue';
import Dialog from './ui/Dialog.vue';
import Flex from './ui/Flex.vue';
import Typography from './ui/Typography.vue';

const store = useToastStore();

const getIconClass = (type: ToastType) => {
	const iconClass: Record<ToastType, string> = {
		error: 'msi-error-rounded text-red-500',
		warning: 'msi-warning-rounded text-yellow-500',
		success: 'msi-check-circle-rounded text-green-500',
		info: 'msi-info-rounded text-blue-500',
	};

	return iconClass[type];
};

const getHeader = (type: ToastType) => {
	const header: Record<ToastType, string> = {
		error: 'Đã có lỗi xảy ra',
		warning: 'Cảnh báo',
		success: 'Thành công',
		info: 'Thông báo',
	};

	return header[type];
};
</script>

<template>
	<Dialog v-model:open="store.toast.open" :class="$style.toastify" hide-close-button>
		<template #header v-if="store.toast.type">
			<Flex class="gap-2" stack center>
				<span
					class="icon size-12"
					:class="getIconClass(store.toast.type)"
					v-if="!store.toast.options?.hideIcon"></span>

				<Typography variant="xlSemiBold" v-if="!store.toast.options?.hideHeader">
					{{ store.toast.options?.header ?? getHeader(store.toast.type) }}
				</Typography>
			</Flex>
		</template>

		<Flex center stack class="gap-4" v-bind="store.toast.options?.pt?.root">
			<Typography class="text-center" v-bind="store.toast.options?.pt?.message">
				{{ store.toast.message }}
			</Typography>
		</Flex>

		<template #action v-if="!store.toast.options?.hideCloseBtn">
			<Button variant="soft" color="grey" class="w-full" @click="store.close">Đóng</Button>
		</template>
	</Dialog>
</template>

<style module>
.toastify :global(.modal-box.dialog) {
	@apply max-w-[300px] md:max-w-[400px];
}
</style>
