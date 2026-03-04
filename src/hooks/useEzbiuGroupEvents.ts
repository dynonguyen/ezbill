import { QUERY_KEY, REALTIME_EVENT } from '@/constants/key';
import { useGroupsQueryControl } from '@/hooks/useGroupsQueryControl';
import { getEnv } from '@/utils/get-env';
import { useQueryClient } from '@tanstack/vue-query';
import type { Ref } from 'vue';

type EzbiuEventType = (typeof REALTIME_EVENT)[keyof typeof REALTIME_EVENT];

type EzbiuEventPayload = {
	type: EzbiuEventType;
	group_id: string;
	bill_ids?: string[];
};

const MAX_RETRY_ATTEMPTS = 5;

export function useEzbiuGroupEvents(groupId: Ref<string>) {
	const queryClient = useQueryClient();
	const { refetchGroups, refetchGroupStats } = useGroupsQueryControl();
	const baseUrl = getEnv('VITE_API_BASE_URL');

	let source: EventSource | null = null;
	let retryAttempts = 0;
	let retryTimeoutId: number | null = null;

	const resetRetryState = () => {
		retryAttempts = 0;
		if (retryTimeoutId != null) {
			clearTimeout(retryTimeoutId);
			retryTimeoutId = null;
		}
	};

	const scheduleReconnect = () => {
		if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
			return;
		}

		const baseDelay = 1000;
		const maxDelay = 30_000;
		const delay = Math.min(maxDelay, baseDelay * 2 ** retryAttempts); // Exponential backoff in milliseconds
		retryAttempts += 1;

		retryTimeoutId = window.setTimeout(() => {
			retryTimeoutId = null;
			connect();
		}, delay);
	};

	const connect = () => {
		const id = groupId.value;
		if (!id || source) return;

		const url = `${baseUrl}/groups/${encodeURIComponent(id)}/events`;

		source = new EventSource(url, { withCredentials: true });

		source.onmessage = (event: MessageEvent) => {
			resetRetryState();

			let payload: EzbiuEventPayload | null = null;

			try {
				payload = JSON.parse(event.data) as EzbiuEventPayload;
			} catch {
				return;
			}

			if (!payload || payload.group_id !== id) return;

			if (payload.type === REALTIME_EVENT.GROUP_UPDATED) {
				refetchGroups();
				refetchGroupStats();
			}

			if (payload.type === REALTIME_EVENT.BILL_UPDATED) {
				queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, id] });
			}
		};

		source.onerror = () => {
			source?.close();
			source = null;
			scheduleReconnect();
		};
	};

	const disconnect = () => {
		if (retryTimeoutId != null) {
			clearTimeout(retryTimeoutId);
			retryTimeoutId = null;
		}
		source?.close();
		source = null;
		retryAttempts = 0;
	};

	return { connect, disconnect };
}
