import type { ApiGroupPreference } from '@/apis/api-client';
import { QUERY_KEY } from '@/constants/key';
import { useQueryClient } from '@tanstack/vue-query';

export function useGroupsQueryControl() {
	const queryClient = useQueryClient();

	const refetchGroups = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUPS] });
	};

	const refetchSessionStats = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SESSION_STATS] });
	};

	const refetchGroupStats = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP_STATS] });
	};

	const handleGroupPreferenceUpdated = (updates: ApiGroupPreference) => {
		refetchGroups();
		if (updates.hidden !== undefined) {
			refetchSessionStats();
		}
	};

	return {
		refetchGroups,
		refetchSessionStats,
		refetchGroupStats,
		handleGroupPreferenceUpdated,
	};
}
