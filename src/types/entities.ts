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
export type MemberId = Member['id'];

export enum PaymentTrackingMode {
	Accountant = 'accountant',
	Tracking = 'tracking',
}

export type Category = {
	id: string;
	color?: string;
	label: string;
	createdAt: string;
};
export type CategoryId = Category['id'];

export type PaymentTracking = {
	createdAt: string;
	memberId: MemberId;
};

export type Group = {
	id: string;
	name: string;
	members: Member[];
	deleted: boolean;
	paymentTrackingMode: PaymentTrackingMode;
	createdAt: string;
	updatedAt: string;
	categories?: Category[];
};
export type GroupId = Group['id'];

export enum BillType {
	Equally = 'equally',
	Exact = 'exact',
	Percentage = 'percentage',
	Share = 'share',
}
export type BillMember = Record<MemberId, number>;
export type Bill = {
	id: number;
	name: string;
	groupId: GroupId;
	type: BillType;
	amount: number;
	note?: string | null;
	createdAt: string;
	members: BillMember;
	createdBy: MemberId;
	paymentTracking: PaymentTracking[];
	categoryIds?: CategoryId[];
};
export type BillId = Bill['id'];
