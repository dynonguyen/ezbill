import { CONTEXT_KEY } from '@/constants/key';
import type { GroupStats } from '@/types/entities';
import { inject, type Ref } from 'vue';

export function useGroupStatsContext() {
	return inject<Ref<GroupStats | null>>(CONTEXT_KEY.GROUP_STATS, {
		value: null,
	} as Ref<GroupStats | null>);
}
