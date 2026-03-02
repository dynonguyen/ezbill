import { useQueryClient } from '@tanstack/vue-query';
import { QUERY_KEY } from '@/constants/key';
import type { ApiGroupPreference } from '@/apis/api-client';

export function useGroupsQueryControl() {
	const queryClient = useQueryClient();

	const refetchGroups = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUPS] });
	};

	const refetchSessionStats = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SESSION_STATS] });
	};

	const handleGroupPreferenceUpdated = (updates: ApiGroupPreference) => {
		refetchGroups();
		if (updates.hidden !== undefined) {
			refetchSessionStats();
		}
	};

	const handleGroupCreated = () => {
		refetchGroups();
	};

	const handleGroupLeft = () => {
		refetchGroups();
	};

	return {
		refetchGroups,
		refetchSessionStats,
		handleGroupPreferenceUpdated,
		handleGroupCreated,
		handleGroupLeft,
	};
}

