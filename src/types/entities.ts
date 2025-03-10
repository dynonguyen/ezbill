export type BankInfo = {
	name: string;
	code: string;
	bin: string;
	shortname: string;
};

export type MemberBankInfo = {
	bin: BankInfo['bin'];
	accountNumber: string;
};

export type Member = {
	id: string;
	name: string;
	avatar?: string;
	bankInfo?: MemberBankInfo;
	isAccounting?: boolean; // isAccounting: true means this member is responsible for accounting
};

export type Group = {
	id: string;
	name: string;
	members: Member[];
	createdAt: string;
	deleted: boolean;
};

export type BillMember = Record<Member['id'], number>;
export type Bill = {
	id: number;
	name: string;
	groupId: Group['id'];
	amount: number;
	note?: string | null;
	createdAt: string;
	members: BillMember;
	createdBy: Member['id'];
};
