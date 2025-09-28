import { useToastStore, type ToastOptions, type ToastType } from '../stores/toast';

export const useToast = () => {
	const store = useToastStore();

	const show = (type: ToastType) => (message: string, options?: ToastOptions) => {
		store.show({ message, type }, options);
	};

	const showErrorWithRetry = (message: string, onRetry: () => void, options?: ToastOptions) => {
		store.show({ message, type: 'error' }, { ...options, retryOnFailure: onRetry });
	};

	return {
		error: show('error'),
		info: show('info'),
		success: show('success'),
		warning: show('warning'),
		errorWithRetry: showErrorWithRetry,
	};
};
