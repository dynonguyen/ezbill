import { CONTEXT_KEY } from '@/constants/key';
import { PaymentTrackingMode, type Group } from '@/types/entities';
import { computed, inject, type Ref } from 'vue';

export function useGroupContext() {
	const group = inject<Ref<Group>>(CONTEXT_KEY.GROUP, { value: {} } as Ref<Group>);
	const isAccountantMode = computed(
		() => group.value.paymentTrackingMode === PaymentTrackingMode.Accountant,
	);

	return { group, isAccountantMode };
}
