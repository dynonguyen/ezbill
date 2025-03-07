import { useToastStore, type ToastOptions, type ToastType } from '../stores/toast';

type ShowToastFn = (message: string, options?: ToastOptions) => void;

export const useToast = (): Record<ToastType, ShowToastFn> => {
	const store = useToastStore();

	const show = (type: ToastType) => (message: string, options?: ToastOptions) => {
		store.show({ message, type }, options);
	};

	return {
		error: show('error'),
		info: show('info'),
		success: show('success'),
		warning: show('warning'),
	};
};
