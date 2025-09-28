import type { ImportedBackup } from '@/features/group-detail/helpers/group-backup';
import { getTotalMemberAmount } from '@/features/group-detail/helpers/utils';
import { retryOnFailure } from '@/utils/helpers';
import { createClient } from '@supabase/supabase-js';
import to from 'await-to-js';
import dayjs from 'dayjs';
import { omit } from 'es-toolkit';
import type { Bill, BillId, Group, GroupId, Member, MemberId } from '../types/entities';
import { getEnv } from '../utils/get-env';

export const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_KEY'));

const getGroupView = (groupId: GroupId) => `group_${groupId}`;
const getBillView = (groupId: GroupId) => `bill_${groupId}`;

// Group
export const createGroup = async (
	group: Pick<Group, 'name' | 'id' | 'paymentTrackingMode'> & Partial<Group>,
) => {
	const gData = await supabase.from('groups').insert(group);
	if (gData.error) throw gData.error;

	const gvData = await supabase.rpc('create_group_view', { group_id: group.id });
	if (gvData.error) throw gvData.error;

	const bvData = await supabase.rpc('create_bill_view', { group_id: group.id });
	if (bvData.error) throw bvData.error;
};

export const fetchGroup = async (id: string): Promise<Group> => {
	const { data, error } = await supabase
		.from(getGroupView(id))
		.select()
		.eq('deleted', false)
		.single();

	if (error) throw error;

	return data as Group;
};

const updateGroupUpdatedAt = async (id: GroupId, updatedAt?: Date) => {
	const resp = await supabase
		.from(getGroupView(id))
		.update({ updatedAt: updatedAt ?? new Date().toISOString() })
		.eq('id', id);
	if (resp.error) throw resp.error;
};

export const updateGroup = async (data: { id: string; updated: Partial<Group> }) => {
	const { id, updated } = data;

	const resp = await supabase.from(getGroupView(id)).update(updated).eq('id', id);

	if (resp.error) throw resp.error;

	void updateGroupUpdatedAt(id);
};

export const deleteGroup = async (id: GroupId) => {
	const resp = await supabase.from(getGroupView(id)).update({ deleted: true }).eq('id', id);
	if (resp.error) throw resp.error;
};

export const fetchGroups = async (
	ids: GroupId[],
): Promise<{
	groups: Group[];
	notFoundIds: GroupId[];
}> => {
	const groups: Group[] = [];
	const notFoundIds: GroupId[] = [];

	await Promise.allSettled(
		ids.map((id) =>
			fetchGroup(id)
				.then((g) => {
					groups.push(g);
				})
				.catch((err) => {
					if (err?.message?.includes('does not exist')) {
						notFoundIds.push(id);
					}
				}),
		),
	);

	return { groups, notFoundIds };
};

// Member
export const addMember = async (data: { groupId: GroupId; member: Member }) => {
	const { groupId, member } = data;

	const [error, currentGroup] = await to(fetchGroup(groupId));

	if (error) {
		throw new Error('Không thể tham gia nhóm');
	}

	const { name } = member;
	const isExist = currentGroup.members?.some((member) => member.name === name);

	if (isExist) {
		throw new Error('Thành viên đã tồn tại trong nhóm. Vui lòng nhập một tên khác');
	}

	const currentMembers = !member.isAccounting
		? currentGroup.members
		: currentGroup.members.map((m) => ({ ...m, isAccounting: false }));

	const resp = await supabase
		.from(getGroupView(groupId))
		.update({ members: [...currentMembers, member] })
		.eq('id', groupId);

	if (resp.error) throw resp.error;

	void updateGroupUpdatedAt(groupId);
};

export const removeMember = async (data: { groupId: GroupId; memberId: MemberId }) => {
	const { groupId, memberId } = data;

	const [gError, group] = await to(fetchGroup(groupId));
	const [bError, bills] = await to(fetchBills(groupId));

	if (gError || bError) {
		throw new Error('Không thể Xoá thành viên');
	}

	if (bills.some((bill) => bill.createdBy === memberId || bill.members[memberId])) {
		throw new Error(
			'Thành viên đã tạo hoặc tham gia vào một số bill. Vui lòng Xoá bill trước khi Xoá thành viên',
		);
	}

	const newMembers = group.members?.filter((member) => member.id !== memberId);

	const resp = await supabase
		.from(getGroupView(groupId))
		.update({ members: newMembers })
		.eq('id', groupId);

	if (resp.error) throw resp.error;

	void updateGroupUpdatedAt(groupId);
};

export const updateMember = async (data: { groupId: GroupId; newValue: Member }) => {
	const { groupId, newValue } = data;

	const [error, group] = await to(fetchGroup(groupId));

	if (error) {
		throw new Error('Không thể cập nhật thành viên');
	}

	const newMembers = group.members?.map((member) => {
		return member.id === newValue.id
			? newValue
			: newValue.isAccounting
				? { ...member, isAccounting: false }
				: member;
	});

	const resp = await supabase
		.from(getGroupView(groupId))
		.update({ members: newMembers })
		.eq('id', groupId);

	if (resp.error) throw resp.error;

	void updateGroupUpdatedAt(groupId);
};

// Bill
const isAmountValid = (bill: Partial<Bill>) => {
	if (
		!bill.amount ||
		Math.round(bill.amount) !== Math.round(getTotalMemberAmount(bill.members || {}))
	) {
		throw Error('Tổng số tiền không khớp với số tiền của các thành viên');
	}

	return true;
};

export const fetchBills = async (groupId: GroupId): Promise<Bill[]> => {
	const { data, error } = await supabase.from(getBillView(groupId)).select();

	if (error) throw error;

	return data as Bill[];
};

export const createBill = async (bill: Omit<Bill, 'id' | 'createdAt'>) => {
	if (isAmountValid(bill)) {
		const resp = await supabase.from(getBillView(bill.groupId)).insert(bill);

		if (resp.error) throw resp.error;

		void updateGroupUpdatedAt(bill.groupId);
	}
};

export const updateBill = async (updated: Omit<Bill, 'createdAt'>) => {
	if (isAmountValid(updated)) {
		const resp = await supabase
			.from(getBillView(updated.groupId))
			.update(updated)
			.eq('id', updated.id);

		if (resp.error) throw resp.error;

		void updateGroupUpdatedAt(updated.groupId);
	}
};

export const deleteBill = async (data: { groupId: GroupId; billId: BillId }) => {
	const { groupId, billId } = data;

	const resp = await supabase.from(getBillView(groupId)).delete().eq('id', billId);

	if (resp.error) throw resp.error;

	void updateGroupUpdatedAt(groupId);
};

export const markBillsAsPaid = async (data: {
	groupId: GroupId;
	memberId: MemberId;
	billIds: BillId[];
}) => {
	const { groupId, memberId, billIds } = data;

	// Use RPC function for batch update
	const resp = await supabase.rpc('mark_bills_as_paid', {
		bill_view_name: getBillView(groupId),
		member_id: memberId,
		bill_ids: billIds,
		payment_timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
	});

	if (resp.error) throw resp.error;

	void updateGroupUpdatedAt(groupId);
};

// Import data
export const importGroup = async (data: {
	imported: ImportedBackup;
	newGroupInfo: Pick<Group, 'name' | 'id' | 'paymentTrackingMode'>;
}) => {
	const { imported, newGroupInfo } = data;

	const { id } = newGroupInfo;

	// Create group and views
	await createGroup({ ...imported.group, ...newGroupInfo });

	const billView = getBillView(id);
	const bills = imported.bills.map((bill) => ({
		...omit(bill, ['id', 'groupId']),
		groupId: id,
	}));

	// Await to bill view creation before inserting bills
	await retryOnFailure(
		async () => {
			const resp = await supabase.from(billView).insert(bills);
			if (resp.status === 404) throw new Error('Failed to import bills');
			if (resp.error) throw resp.error;
		},
		10,
		500,
	);

	await updateGroupUpdatedAt(id);
};

// Error logs
export const createErrorLog = async (error: any) => {
	const createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
	await supabase.from('error_logs').insert({
		createdAt,
		log: { path: window.location.href, ua: navigator.userAgent, error },
	});
};
