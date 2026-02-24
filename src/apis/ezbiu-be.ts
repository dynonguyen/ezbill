import {
	camelToSnake,
	transformCamelToSnake,
	transformId,
	transformSnakeToCamel,
} from '@/utils/transformer';
import to from 'await-to-js';
import { merge } from 'es-toolkit';
import type { Primitive } from 'zod';
import { ERROR_CODES, HTTP_STATUS_CODES } from '../constants/code';
import type { Bill, BillId, CategoryId, Group, GroupId, MemberId } from '../types/entities';
import { getEnv } from '../utils/get-env';
import { buildQueryString } from '../utils/querystring';
import type {
	ApiAddMemberReq,
	ApiCreateBillData,
	ApiCreateBillReq,
	ApiCreateCategoryData,
	ApiCreateCategoryReq,
	ApiCreateGroupData,
	ApiCreateGroupReq,
	ApiCreateInviteKeyData,
	ApiCreateInviteKeyReq,
	ApiCreateSessionData,
	ApiFetchBillsData,
	ApiFetchBillsReq,
	ApiFetchGroupsData,
	ApiFetchGroupsReq,
	ApiFetchGroupStatsData,
	ApiFetchGroupStatsReq,
	ApiImportGroupData,
	ApiImportGroupReq,
	ApiListBillsByMemberData,
	ApiListBillsByMemberReq,
	ApiMarkBillsAsPaidReq,
	ApiUpdateBillReq,
	ApiUpdateCategoryReq,
	ApiUpdateGroupReq,
	ApiUpdateMemberReq,
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

const normalizeBill = (bill: Bill): Bill => ({
	...bill,
	members: bill.members ?? [],
	paymentTracking: bill.paymentTracking ?? [],
});

function parseEzbiuPaginatedReq(req: PaginatedReq): Record<string, Primitive> {
	return {
		limit: req.limit,
		sort_by: camelToSnake(req.sortBy),
		sort_order: req.sortOrder,
		offset: req.offset,
	};
}

function parseEzbiuFetchBillsReq(req: ApiFetchBillsReq): Record<string, Primitive> {
	const queries: Record<string, Primitive> = parseEzbiuPaginatedReq(req);
	if (req.keyword != null && req.keyword !== '') queries.keyword = req.keyword;
	if (req.createdBy != null) queries.created_by = req.createdBy;
	if (req.participant != null) queries.participant = req.participant;
	if (req.paymentStatus != null) queries.payment_status = camelToSnake(req.paymentStatus);
	if (req.categoryIds?.length) queries.category_ids = req.categoryIds.join(',');
	return queries;
}

function parseEzbiuBillsByMemberReq(req: ApiListBillsByMemberReq): Record<string, Primitive> {
	const queries = parseEzbiuPaginatedReq(req);
	return {
		...queries,
		status: req.status ? camelToSnake(req.status) : undefined,
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
	return fetcher.patch<null>(`/groups/${id}`, { payload });
};

const importGroup = (req: ApiImportGroupReq): ResolvedApiResp<ApiImportGroupData> => {
	const payload = {
		group: transformCamelToSnake(req.group),
		bills: req.bills.map((bill) => transformCamelToSnake(transformId(bill))),
	};

	return fetcher.post<ApiImportGroupData>('/groups/import', { payload });
};

const fetchGroupStats = (req: ApiFetchGroupStatsReq): ResolvedApiResp<ApiFetchGroupStatsData> => {
	return fetcher.get<ApiFetchGroupStatsData>(`/groups/${req.groupId}/stats`);
};

const createInviteKey = (
	id: GroupId,
	req?: ApiCreateInviteKeyReq,
): ResolvedApiResp<ApiCreateInviteKeyData> => {
	return fetcher.post<ApiCreateInviteKeyData>(`/groups/${id}/invite`, {
		payload: transformCamelToSnake(req),
	});
};

const joinGroup = (id: GroupId, inviteKey: string): ResolvedApiResp<null> => {
	const queries = {
		invite_key: inviteKey,
	};

	return fetcher.post<null>(`/groups/${id}/join`, { queries });
};

const leaveGroup = (id: GroupId): ResolvedApiResp<null> => {
	return fetcher.post<null>(`/groups/${id}/leave`);
};

const fetchBills = (
	groupId: GroupId,
	req: ApiFetchBillsReq,
): ResolvedApiResp<ApiFetchBillsData> => {
	const queries = parseEzbiuFetchBillsReq(req);

	return fetcher.get<ApiFetchBillsData>(`/groups/${groupId}/bills`, {
		queries,
		transformer: (raw) => {
			const data = transformSnakeToCamel<ApiFetchBillsData>(raw);
			return { ...data, data: data.data.map(normalizeBill) };
		},
	});
};

const createBill = (
	groupId: GroupId,
	req: ApiCreateBillReq,
): ResolvedApiResp<ApiCreateBillData> => {
	return fetcher.post<ApiCreateBillData>(`/groups/${groupId}/bills`, {
		payload: transformCamelToSnake(req),
	});
};

const updateBill = (groupId: GroupId, id: BillId, req: ApiUpdateBillReq): ResolvedApiResp<null> => {
	return fetcher.patch<null>(`/groups/${groupId}/bills/${id}`, {
		payload: transformCamelToSnake(req),
	});
};

const deleteBill = (groupId: GroupId, id: BillId): ResolvedApiResp<null> => {
	return fetcher.delete<null>(`/groups/${groupId}/bills/${id}`);
};

const markBillsAsPaid = (req: ApiMarkBillsAsPaidReq): ResolvedApiResp<null> => {
	const { groupId, memberId, billIds } = req;
	return fetcher.post<null>(`/groups/${groupId}/bills/members/${memberId}/paid`, {
		payload: transformCamelToSnake({ billIds }),
	});
};

const listBillsByMember = (
	groupId: GroupId,
	memberId: MemberId,
	req: ApiListBillsByMemberReq,
): ResolvedApiResp<ApiListBillsByMemberData> => {
	const queries = parseEzbiuBillsByMemberReq(req);
	const transformer = (raw: unknown) => {
		const data = transformSnakeToCamel<ApiListBillsByMemberData>(raw);
		return { ...data, data: data.data.map(normalizeBill) };
	};

	return fetcher.get<ApiListBillsByMemberData>(
		`/groups/${groupId}/bills/members/${memberId}/stats`,
		{
			queries,
			transformer,
		},
	);
};

const addMember = (groupId: GroupId, req: ApiAddMemberReq): ResolvedApiResp<null> => {
	return fetcher.post<null>(`/groups/${groupId}/members`, { payload: transformCamelToSnake(req) });
};

const updateMember = (
	groupId: GroupId,
	memberId: MemberId,
	req: ApiUpdateMemberReq,
): ResolvedApiResp<null> => {
	return fetcher.patch<null>(`/groups/${groupId}/members/${memberId}`, {
		payload: transformCamelToSnake(req),
	});
};

const removeMember = (groupId: GroupId, memberId: MemberId): ResolvedApiResp<null> => {
	return fetcher.delete<null>(`/groups/${groupId}/members/${memberId}`);
};

const createCategory = (
	groupId: GroupId,
	req: ApiCreateCategoryReq,
): ResolvedApiResp<ApiCreateCategoryData> => {
	return fetcher.post<ApiCreateCategoryData>(`/groups/${groupId}/categories`, {
		payload: transformCamelToSnake(req),
	});
};

const updateCategory = (
	groupId: GroupId,
	categoryId: CategoryId,
	req: ApiUpdateCategoryReq,
): ResolvedApiResp<null> => {
	return fetcher.patch<null>(`/groups/${groupId}/categories/${categoryId}`, {
		payload: transformCamelToSnake(req),
	});
};

const deleteCategory = (groupId: GroupId, categoryId: CategoryId): ResolvedApiResp<null> => {
	return fetcher.delete<null>(`/groups/${groupId}/categories/${categoryId}`);
};

const createErrorLog = (error: any): ResolvedApiResp<null> => {
	return fetcher.post<null>('/error-logs', { payload: transformCamelToSnake(error) });
};

export const ezbiuApiClient: IApiClient = {
	checkSession,
	createSession,

	createGroup,
	fetchGroups,
	fetchGroup,
	updateGroup,
	importGroup,
	fetchGroupStats,
	createInviteKey,
	joinGroup,
	leaveGroup,

	fetchBills,
	createBill,
	updateBill,
	deleteBill,
	markBillsAsPaid,
	listBillsByMember,

	addMember,
	updateMember,
	removeMember,

	createCategory,
	updateCategory,
	deleteCategory,

	createErrorLog,
};
