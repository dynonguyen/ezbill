import { PaymentTrackingMode } from '@/types/entities';

export const PAYMENT_TRACKING_LABEL_MAPPING: Record<
	PaymentTrackingMode,
	{ label: string; icon: string }
> = {
	[PaymentTrackingMode.Accountant]: {
		label: 'Có kế toán',
		icon: 'icon msi-person-check-rounded',
	},
	[PaymentTrackingMode.Tracking]: {
		label: 'Không có kế toán',
		icon: 'icon msi-list-alt-check-rounded',
	},
};
