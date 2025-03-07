import { CONTEXT_KEY } from '@/constants/key';
import type { Group } from '@/types/entities';
import { inject, type Ref } from 'vue';

export function useGroupContext() {
	const group = inject<Ref<Group>>(CONTEXT_KEY.GROUP, { value: {} } as Ref<Group>);

	return { group };
}
