import { CONTEXT_KEY } from '@/constants/key';
import type { Group, Member } from '@/types/entities';
import { inject, type Ref } from 'vue';

export function useGroupContext() {
	const group = inject<Ref<Group>>(CONTEXT_KEY.GROUP, { value: {} } as Ref<Group>);
	const user = inject<Ref<Member>>(CONTEXT_KEY.GROUP_USER, { value: {} } as Ref<Member>);

	return { group, user };
}
