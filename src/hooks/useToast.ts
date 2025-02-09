import { useToast as usePrimeToast, type ToastMessageOptions } from 'primevue'

export function useToast() {
	const toast = usePrimeToast()

	const showMessage =
		(severity: ToastMessageOptions['severity'], defaultOptions?: ToastMessageOptions) =>
		(options: ToastMessageOptions) => {
			toast.add({ life: 5000, ...defaultOptions, ...options, severity })
		}

	return {
		error: showMessage('error', { summary: 'Đã xảy ra lỗi' }),
		success: showMessage('success'),
		info: showMessage('info'),
	}
}
