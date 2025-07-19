import { PaymentTrackingMode } from '@/types/entities';

export const PAYMENT_TRACKING_LABEL_MAPPING: Record<
	PaymentTrackingMode,
	{ label: string; icon: string }
> = {
	[PaymentTrackingMode.Accountant]: {
		label: 'Thanh toán tập trung',
		icon: 'icon msi-person-check-rounded',
	},
	[PaymentTrackingMode.Tracking]: {
		label: 'Thanh toán linh hoạt',
		icon: 'icon msi-playlist-add-check-circle-rounded',
	},
};
