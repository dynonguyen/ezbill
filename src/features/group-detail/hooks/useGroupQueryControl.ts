import { useQueryClient } from '@tanstack/vue-query';
import { QUERY_KEY } from '../../../constants/key';
import { useGroupContext } from './useGroupContext';

export function useGroupQueryControl() {
	const queryClient = useQueryClient();
	const { group } = useGroupContext();

	const refetchGroup = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
	};

	const refetchBills = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
	};

	const refetchGroupStats = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP_STATS, group.value.id] });
	};

	const refetchBillsByMember = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILLS_BY_MEMBER, group.value.id] });
	};

	return { refetchGroup, refetchBills, refetchGroupStats, refetchBillsByMember };
}
