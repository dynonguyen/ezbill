import { transformSnakeToCamel } from '@/utils/transformer';
import to from 'await-to-js';
import { merge } from 'es-toolkit';
import type { Primitive } from 'zod';
import { ERROR_CODES, HTTP_STATUS_CODES } from '../constants/code';
import type { Group, GroupId } from '../types/entities';
import { getEnv } from '../utils/get-env';
import { buildQueryString } from '../utils/querystring';
import type {
	ApiCreateGroupData,
	ApiCreateGroupReq,
	ApiCreateSessionData,
	ApiFetchBillsData,
	ApiFetchBillsReq,
	ApiFetchGroupsData,
	ApiFetchGroupsReq,
	ApiUpdateGroupReq,
	BaseApiResp,
	IApiClient,
	PaginatedReq,
	ResolvedApiResp,
} from './api-client';

// --- Error codes ---
const fetcher = (function () {
	type FetcherConfig = {
		baseUrl: string;
		transformer: <T>(data: unknown) => T;
	};

	type RequestOptions<D = unknown, P = unknown> = Partial<{
		queries: Record<string, Primitive>;
		payload: P;
		transformer: (data: unknown) => D;
		onError(err: Error, resp: BaseApiResp<D>): void;
		onSuccess(resp: BaseApiResp<D>): void;
	}>;

	/**
	 * Transform snake_case to camelCase by default
	 */
	const config: FetcherConfig = {
		baseUrl: getEnv('VITE_API_BASE_URL'),
		transformer: transformSnakeToCamel,
	};

	async function fetchFn<D, P = Primitive>(
		endpoint: string,
		init: RequestInit,
		options?: RequestOptions<D, P>,
	): ResolvedApiResp<D> {
		let url = `${config.baseUrl}${endpoint}`;

		// Build request options
		const requestOptions: RequestInit = merge(
			{
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				credentials: 'include',
			} as RequestInit,
			init,
		);

		// Build query string
		if (options?.queries) {
			const qs = buildQueryString(options.queries);
			url = `${url}?${qs}`;
		}

		// Parse payload
		if (options?.payload) {
			const body = options.payload;
			if (body === undefined || body === null || typeof body === 'string') {
				requestOptions.body = body;
			} else {
				requestOptions.body = JSON.stringify(body);
			}
		}

		const [err, resp] = await to(fetch(url, requestOptions));
		type EzbiuBaseResp = {
			success: boolean;
			status_code: number;
			error_code: number | null;
			message: string;
			error_details: string[] | null;
			data: D;
		};
		async function safeGetJsonData(): Promise<EzbiuBaseResp | null> {
			if (!resp?.json) return null;

			const [err, jsonResp] = await to(resp.json());
			if (err) return null;
			return jsonResp;
		}

		// Network, CORS, Timeout, AbortController, etc. errors.
		if (err) {
			const jsonResp = await safeGetJsonData();
			const response: BaseApiResp<D> = {
				success: jsonResp?.success ?? false,
				statusCode:
					jsonResp?.status_code ??
					(resp as unknown as Response)?.status ??
					HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
				errorCode: jsonResp?.error_code ?? ERROR_CODES.NETWORK_ERROR,
				errorDetails: jsonResp?.error_details ?? null,
				message: jsonResp?.message ?? err?.message ?? '',
				data: jsonResp?.data ?? null,
			};

			options?.onError?.(err ?? new Error('Network error'), response);
			return response;
		}

		const jsonResp = await safeGetJsonData();
		const transformer =
			options?.transformer ?? config.transformer<D> ?? ((data: unknown) => data as D);
		const data: D | null = jsonResp?.data ? transformer(jsonResp.data) : null;
		const response: BaseApiResp<D> = {
			success: jsonResp?.success ?? false,
			statusCode: jsonResp?.status_code ?? resp.status,
			errorCode: jsonResp?.error_code ?? null,
			errorDetails: jsonResp?.error_details ?? null,
			message: jsonResp?.message ?? '',
			data,
		};

		if (resp.ok) options?.onSuccess?.(response);
		else options?.onError?.(new Error(response.message), response);

		return response;
	}

	return {
		configure(newConfig: Partial<FetcherConfig>) {
			if (newConfig.baseUrl !== undefined) config.baseUrl = newConfig.baseUrl;
			if (newConfig.transformer !== undefined) config.transformer = newConfig.transformer;
		},

		get<D = unknown>(
			endpoint: string,
			options?: Pick<RequestOptions<D, null>, 'queries' | 'transformer'>,
		) {
			return fetchFn<D>(endpoint, { method: 'GET' }, options);
		},

		post<D = unknown, P = unknown>(endpoint: string, options?: RequestOptions<D, P>) {
			return fetchFn<D, P>(endpoint, { method: 'POST' }, options);
		},

		put<D = unknown, P = unknown>(endpoint: string, options?: RequestOptions<D, P>) {
			return fetchFn<D, P>(endpoint, { method: 'PUT' }, options);
		},

		patch<D = unknown, P = unknown>(endpoint: string, options?: RequestOptions<D, P>) {
			return fetchFn<D, P>(endpoint, { method: 'PATCH' }, options);
		},

		delete<D = unknown>(endpoint: string, options?: RequestOptions<D, null>) {
			return fetchFn<D>(endpoint, { method: 'DELETE' }, options);
		},
	};
})();

// --- Implementations for IApiClient ---
function parseEzbiuPaginatedReq(req: PaginatedReq): Record<string, Primitive> {
	return {
		limit: req.limit,
		sort_by: req.sortBy,
		order: req.order,
		offset: req.offset,
	};
}

const checkSession = (): ResolvedApiResp<null> => {
	return fetcher.get<null>('/sessions');
};

const createSession = (): ResolvedApiResp<ApiCreateSessionData> => {
	return fetcher.post<ApiCreateSessionData>('/sessions');
};

const createGroup = (req: ApiCreateGroupReq): ResolvedApiResp<ApiCreateGroupData> => {
	const payload = {
		name: req.name,
		payment_tracking_mode: req.paymentTrackingMode,
	};

	return fetcher.post<ApiCreateGroupData>('/groups', { payload });
};

const fetchGroups = (req: ApiFetchGroupsReq): ResolvedApiResp<ApiFetchGroupsData> => {
	const queries = parseEzbiuPaginatedReq(req);

	return fetcher.get<ApiFetchGroupsData>('/groups', { queries });
};

const fetchGroup = (id: GroupId): ResolvedApiResp<Group> => {
	return fetcher.get<Group>(`/groups/${id}`);
};

const updateGroup = (id: GroupId, req: ApiUpdateGroupReq): ResolvedApiResp<null> => {
	const payload = {
		name: req.name,
		payment_tracking_mode: req.paymentTrackingMode,
	};

	console.log(`☕ DYNO DEBUG ~ ezbiu-be.ts:181 🦫\n`, payload);

	return fetcher.patch<null>(`/groups/${id}`, { payload });
};

const fetchBills = (
	groupId: GroupId,
	req: ApiFetchBillsReq,
): ResolvedApiResp<ApiFetchBillsData> => {
	const queries = parseEzbiuPaginatedReq(req);

	return fetcher.get<ApiFetchBillsData>(`/groups/${groupId}/bills`, { queries });
};

export const ezbiuApiClient: IApiClient = {
	checkSession,
	createSession,

	createGroup,
	fetchGroups,
	fetchGroup,
	updateGroup,

	fetchBills,
};
