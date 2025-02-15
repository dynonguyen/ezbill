import { createClient } from '@supabase/supabase-js';
import to from 'await-to-js';
import type { Bill, Group, Member } from '../types/entities';
import { getEnv } from '../utils/get-env';

export const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_KEY'));

const getGroupView = (groupId: string) => `group_${groupId}`;
const getBillView = (groupId: string) => `bill_${groupId}`;

export const createGroup = async (group: Pick<Group, 'name' | 'id'>) => {
	const gData = await supabase.from('groups').insert(group);
	if (gData.error) throw gData.error;

	const gvData = await supabase.rpc('create_group_view', { group_id: group.id });
	if (gvData.error) throw gvData.error;

	const bvData = await supabase.rpc('create_bill_view', { group_id: group.id });
	if (bvData.error) throw bvData.error;
};

export const fetchGroup = async (id: string): Promise<Group> => {
	const { data, error } = await supabase.from(getGroupView(id)).select().single();

	if (error) throw error;

	return data as Group;
};

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

	const resp = await supabase
		.from(getGroupView(groupId))
		.update({ members: [...currentGroup.members, member] })
		.eq('id', groupId);

	if (resp.error) throw resp.error;
};

export const createBill = async (bill: Omit<Bill, 'id' | 'createdAt'>) => {
	const resp = await supabase.from(getBillView(bill.groupId)).insert(bill);

	if (resp.error) throw resp.error;
};

export const fetchBills = async (groupId: string): Promise<Bill[]> => {
	const { data, error } = await supabase.from(getBillView(groupId)).select();

	if (error) throw error;

	return data as Bill[];
};
