import { inject, type Ref } from 'vue';
import { CONTEXT_KEY } from '../../../constants/key';
import type { Bill } from '../../../types/entities';

export const useBillsContext = () => {
	return inject<Ref<Bill[]>>(CONTEXT_KEY.BILLS, { value: [] as Bill[] } as Ref<Bill[]>);
};
