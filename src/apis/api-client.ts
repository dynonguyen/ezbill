import type { ImportedBackup } from '../features/group-detail/helpers/group-backup';
import type {
	Bill,
	BillId,
	Category,
	CategoryId,
	Group,
	GroupId,
	GroupStats,
	Member,
	MemberId,
} from '../types/entities';

// DEPRECATED: Remove this after migration
/** @deprecated Use IApiClient instead */
export interface ILegacyApiClient {
	// Group
	fetchGroups(ids: GroupId[]): Promise<{ groups: Group[]; notFoundIds: GroupId[] }>;
	createGroup(
		group: Pick<Group, 'name' | 'id' | 'paymentTrackingMode'> & Partial<Group>,
	): Promise<void>;
	fetchGroup(id: GroupId): Promise<Group>;
	updateGroup(data: { id: GroupId; updated: Partial<Group> }): Promise<void>;
	deleteGroup(id: GroupId): Promise<void>;

	// Member
	addMember(data: { groupId: GroupId; member: Member }): Promise<void>;
	removeMember(data: { groupId: GroupId; memberId: MemberId }): Promise<void>;
	updateMember(data: { groupId: GroupId; newValue: Member }): Promise<void>;

	// Bill
	fetchBills(groupId: GroupId): Promise<Bill[]>;
	createBill(bill: Omit<Bill, 'id' | 'createdAt'>): Promise<void>;
	updateBill(updated: Omit<Bill, 'createdAt'>): Promise<void>;
	deleteBill(data: { groupId: GroupId; billId: BillId }): Promise<void>;
	markBillsAsPaid(data: { groupId: GroupId; memberId: MemberId; billIds: BillId[] }): Promise<void>;

	// Category
	deleteCategory(data: { groupId: GroupId; categoryId: CategoryId }): Promise<void>;

	// Import
	importGroup(data: {
		imported: ImportedBackup;
		newGroupInfo: Pick<Group, 'name' | 'id' | 'paymentTrackingMode'>;
	}): Promise<void>;

	// Error log
	createErrorLog(error: any): Promise<void>;
}

// -- Base API Response ---
export type BaseApiResp<Data> = {
	statusCode: number;
	errorCode: number | null;
	errorDetails: string[] | null;
	success: boolean;
	message: string;
	data: Data | null;
};

export enum SortOrder {
	Asc = 'asc',
	Desc = 'desc',
}
export type PaginatedReq = {
	offset: number;
	limit: number;
	sortBy: string;
	sortOrder: SortOrder;
};

type MustResolvedPromise<T> = Promise<T>;
export type ResolvedApiResp<Data> = MustResolvedPromise<BaseApiResp<Data>>;

// Models
// --- Sessions ---
export type ApiCreateSessionData = { value: string };

// --- Groups ---
export type ApiCreateGroupReq = Pick<Group, 'name' | 'paymentTrackingMode'>;
export type ApiCreateGroupData = Pick<Group, 'id'>;

export type ApiFetchGroupsReq = PaginatedReq;
export type ApiFetchGroupsData = {
	total: number;
	limit: number;
	data: Group[];
};

export type ApiUpdateGroupReq = Partial<Pick<Group, 'name' | 'paymentTrackingMode'>>;

export type ApiImportGroupReq = {
	group: Group;
	bills: Bill[];
};
export type ApiImportGroupData = Pick<Group, 'id'>;
export type BillListPaymentStatus = 'paid' | 'unpaid' | 'partiallyPaid';
export type ApiFetchBillsReq = PaginatedReq & {
	keyword?: string;
	createdBy?: MemberId;
	participant?: MemberId;
	paymentStatus?: BillListPaymentStatus;
	categoryIds?: CategoryId[];
};
export type ApiFetchBillsData = {
	total: number;
	limit: number;
	data: Bill[];
};

export type ApiCreateInviteKeyReq = {
	expiresIn?: number;
};

export type ApiCreateInviteKeyData = {
	value: string;
	expiresAt?: Date;
};

export type ApiCreateBillReq = Omit<Bill, 'id' | 'createdAt'>;
export type ApiCreateBillData = Pick<Bill, 'id'>;

export type ApiAddMemberReq = Omit<Member, 'id'>;

export type ApiUpdateMemberReq = Partial<Omit<Member, 'id'>>;

export type ApiUpdateBillReq = Partial<Omit<Bill, 'id' | 'createdAt'>> & {
	unsetNote?: boolean;
	unsetMembers?: MemberId[];
};

export type ApiMarkBillAsPaidReq = {
	groupId: GroupId;
	billId: BillId;
	memberId: MemberId;
};
export type ApiMarkBillsAsPaidReq = {
	groupId: GroupId;
	memberId: MemberId;
	billIds: BillId[];
};

export type ApiFetchGroupStatsReq = {
	groupId: GroupId;
};
export type ApiFetchGroupStatsData = GroupStats;

export type BillByMemberStatus = 'paid' | 'owed' | 'to_pay' | 'to_receive';
export type ApiListBillsByMemberReq = PaginatedReq & { status?: BillByMemberStatus };
export type ApiListBillsByMemberData = {
	total: number;
	limit: number;
	data: Bill[];
};

export type ApiCreateCategoryReq = Omit<Category, 'id' | 'createdAt'>;
export type ApiCreateCategoryData = Pick<Category, 'id'>;

export type ApiUpdateCategoryReq = Partial<Omit<Category, 'id' | 'createdAt'>>;

export interface IApiClient {
	// Sessions
	checkSession(): ResolvedApiResp<null>;
	createSession(): ResolvedApiResp<ApiCreateSessionData>;

	// Groups
	createGroup(req: ApiCreateGroupReq): ResolvedApiResp<ApiCreateGroupData>;
	fetchGroups(req: ApiFetchGroupsReq): ResolvedApiResp<ApiFetchGroupsData>;
	fetchGroup(id: GroupId): ResolvedApiResp<Group>;
	updateGroup(id: GroupId, req: ApiUpdateGroupReq): ResolvedApiResp<null>;
	importGroup(req: ApiImportGroupReq): ResolvedApiResp<ApiImportGroupData>;
	fetchGroupStats(req: ApiFetchGroupStatsReq): ResolvedApiResp<ApiFetchGroupStatsData>;

	createInviteKey(
		id: GroupId,
		req?: ApiCreateInviteKeyReq,
	): ResolvedApiResp<ApiCreateInviteKeyData>;

	joinGroup(id: GroupId, inviteKey: string): ResolvedApiResp<null>;
	leaveGroup(id: GroupId): ResolvedApiResp<null>;

	// Bills
	fetchBills(groupId: GroupId, req: ApiFetchBillsReq): ResolvedApiResp<ApiFetchBillsData>;
	createBill(groupId: GroupId, req: ApiCreateBillReq): ResolvedApiResp<ApiCreateBillData>;
	updateBill(groupId: GroupId, id: BillId, req: ApiUpdateBillReq): ResolvedApiResp<null>;
	deleteBill(groupId: GroupId, id: BillId): ResolvedApiResp<null>;
	markBillsAsPaid(req: ApiMarkBillsAsPaidReq): ResolvedApiResp<null>;
	listBillsByMember(
		groupId: GroupId,
		memberId: MemberId,
		req: ApiListBillsByMemberReq,
	): ResolvedApiResp<ApiListBillsByMemberData>;

	// Members
	addMember(groupId: GroupId, req: ApiAddMemberReq): ResolvedApiResp<null>;
	updateMember(
		groupId: GroupId,
		memberId: MemberId,
		req: ApiUpdateMemberReq,
	): ResolvedApiResp<null>;
	removeMember(groupId: GroupId, memberId: MemberId): ResolvedApiResp<null>;

	// Categories
	createCategory(
		groupId: GroupId,
		req: ApiCreateCategoryReq,
	): ResolvedApiResp<ApiCreateCategoryData>;
	updateCategory(
		groupId: GroupId,
		categoryId: CategoryId,
		req: ApiUpdateCategoryReq & { unsetLabel?: boolean },
	): ResolvedApiResp<null>;
	deleteCategory(groupId: GroupId, categoryId: CategoryId): ResolvedApiResp<null>;

	createErrorLog(error: any): ResolvedApiResp<null>;
}
