import { CONTEXT_KEY } from '@/constants/key';
import type { BillMember, MemberId } from '@/types/entities';
import { inject, type Ref } from 'vue';

export type BillFormContextValue = {
	amount: Ref<number, number>;
	memberAmounts: Ref<BillMember>;
	participants: Ref<MemberId[]>;
	hideNonParticipants: Ref<boolean>;
	toggleParticipant(id: MemberId): void;
};

export const useBillFormContext = () => {
	return inject<BillFormContextValue>(CONTEXT_KEY.BILL_FORM, {} as BillFormContextValue);
};
