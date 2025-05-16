import { CONTEXT_KEY } from '@/constants/key';
import type { BillMember, Member } from '@/types/entities';
import { inject, type Ref } from 'vue';

export type BillFormContextValue = {
	amount: Ref<number, number>;
	memberAmounts: Ref<BillMember>;
	participants: Ref<Member['id'][]>;
	toggleParticipant(id: Member['id']): void;
};

export const useBillFormContext = () => {
	return inject<BillFormContextValue>(CONTEXT_KEY.BILL_FORM, {} as BillFormContextValue);
};
