import { createClient } from '@supabase/supabase-js';
import to from 'await-to-js';
import type { Bill, Group, Member } from '../types/entities';
import { getEnv } from '../utils/get-env';

export const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_KEY'));

const getGroupView = (groupId: string) => `group_${groupId}`;
const getBillView = (groupId: string) => `bill_${groupId}`;

// Group
export const createGroup = async (group: Pick<Group, 'name' | 'id'>) => {
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

export const updateGroup = async (data: { id: string; updated: Partial<Group> }) => {
	const { id, updated } = data;

	const resp = await supabase.from(getGroupView(id)).update(updated).eq('id', id);

	if (resp.error) throw resp.error;
};

export const deleteGroup = async (id: Group['id']) => {
	const resp = await supabase.from(getGroupView(id)).update({ deleted: true }).eq('id', id);
	if (resp.error) throw resp.error;
};

// Member
export const addMember = async (data: { groupId: Group['id']; member: Member }) => {
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
};

export const removeMember = async (data: { groupId: Group['id']; memberId: Member['id'] }) => {
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
};

export const updateMember = async (data: { groupId: Group['id']; newValue: Member }) => {
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
};

// Bill
export const fetchBills = async (groupId: string): Promise<Bill[]> => {
	const { data, error } = await supabase.from(getBillView(groupId)).select();

	if (error) throw error;

	return data as Bill[];
};

export const createBill = async (bill: Omit<Bill, 'id' | 'createdAt'>) => {
	const resp = await supabase.from(getBillView(bill.groupId)).insert(bill);

	if (resp.error) throw resp.error;
};

export const updateBill = async (updated: Omit<Bill, 'createdAt'>) => {
	const resp = await supabase
		.from(getBillView(updated.groupId))
		.update(updated)
		.eq('id', updated.id);

	if (resp.error) throw resp.error;
};

export const deleteBill = async (data: { groupId: Group['id']; billId: Bill['id'] }) => {
	const { groupId, billId } = data;

	const resp = await supabase.from(getBillView(groupId)).delete().eq('id', billId);

	if (resp.error) throw resp.error;
};
