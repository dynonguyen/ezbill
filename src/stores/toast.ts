import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FlexProps } from '../components/ui/Flex.vue';
import type { TypographyProps } from '../components/ui/Typography.vue';
import { STORE_KEY } from '../constants/key';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export type ToastOptions = {
	header?: string;
	hideCloseBtn?: boolean;
	hideIcon?: boolean;
	hideHeader?: boolean;
	htmlMsg?: boolean;
	pt?: { root?: FlexProps; message?: TypographyProps };
	retryOnFailure?: () => void;
};

export type Toast = {
	open: boolean;
	message?: string;
	type?: ToastType;
	options?: ToastOptions;
};

export const useToastStore = defineStore(STORE_KEY.TOAST, () => {
	const toast = ref<Toast>({ open: false });

	function show(content: Required<Omit<Toast, 'open' | 'options'>>, options?: ToastOptions) {
		toast.value = { open: true, ...content, options };
	}

	function close() {
		toast.value = { open: false };
	}

	return { show, close, toast };
});
