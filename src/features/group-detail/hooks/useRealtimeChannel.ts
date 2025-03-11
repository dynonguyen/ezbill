import type { RealtimeChannel } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/vue-query';
import { inject, type Ref } from 'vue';
import { CONTEXT_KEY, QUERY_KEY, REALTIME_EVENT } from '../../../constants/key';
import { useGroupContext } from './useGroupContext';

export function useGroupQueryControl() {
	const channel = inject<Ref<RealtimeChannel>>(CONTEXT_KEY.REALTIME_CLIENT, {
		value: {},
	} as Ref<RealtimeChannel>);

	const queryClient = useQueryClient();
	const { group } = useGroupContext();

	const refetchGroup = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
		channel.value.send({ type: 'broadcast', event: REALTIME_EVENT.GROUP_UPDATED, payload: {} });
	};

	const refetchBills = () => {
		queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
		channel.value.send({ type: 'broadcast', event: REALTIME_EVENT.BILL_UPDATED, payload: {} });
	};

	return { refetchGroup, refetchBills };
}
