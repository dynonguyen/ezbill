export type Member = {
	id: string;
	name: string;
	avatar?: string;
};

export type Group = {
	id: string;
	name: string;
	members: Member[];
	createdAt: string;
};

export type BillMember = Record<Member['id'], number>;
export type Bill = {
	id: number;
	name: string;
	groupId: Group['id'];
	amount: number;
	note?: string;
	createdAt: string;
	members: BillMember;
	createdBy: Member['id'];
};
