import { BillType, type Bill, type BillMember, type MemberId } from '@/types/entities';
import { isDesktopByResolution } from '@/utils/helpers';
import { match } from 'ts-pattern';
import { nextTick } from 'vue';

type BillTypeMappingResult = {
	type: BillType;
	label: string;
	helperText: string;
	icon: string;
};
export function billTypeMapping(type: BillType): BillTypeMappingResult {
	return match<BillType, BillTypeMappingResult>(type)
		.with(BillType.Equally, () => ({
			type: BillType.Equally,
			label: 'Chia đều',
			helperText: 'Số tiền sẽ được chia đều cho các thành viên.',
			icon: 'msi-equal-rounded',
		}))
		.with(BillType.Exact, () => ({
			type: BillType.Exact,
			label: 'Chia theo số tiền cụ thể',
			helperText:
				'Nhập chi tiết số tiền của các thành viên. Số tiền còn lại sẽ được chia đều cho các thành viên không được nhập.',
			icon: 'other-not-equal',
		}))
		.with(BillType.Percentage, () => ({
			type: BillType.Percentage,
			label: 'Chia theo tỷ lệ',
			helperText:
				'Nhập tỷ lệ phần trăm mà mỗi thành viên phải trả. Tỉ lệ còn lại sẽ được chia đều cho các thành viên không được nhập.',
			icon: 'msi-percent-rounded',
		}))
		.with(BillType.Share, () => ({
			type: BillType.Share,
			label: 'Chia theo phần',
			helperText: 'Nhập số phần mà mỗi thành viên phải trả.',
			icon: 'msi-browse-outline',
		}))
		.exhaustive();
}

export function splitEqually(amount: number, participants: MemberId[]): BillMember[] {
	const len = participants.length;
	const shareAmount = len > 0 ? amount / len : 0;
	return participants.map((memberId) => ({ memberId, shareAmount }));
}

export function getTotalMemberAmount(memberAmounts: BillMember[]): number {
	return memberAmounts.reduce((acc, m) => acc + (m.shareAmount || 0), 0);
}

export function omitZeroMemberAmounts(memberAmounts: BillMember[]): BillMember[] {
	return memberAmounts.filter((m) => m.shareAmount !== 0);
}

export function splitExactly(amount: number, memberAmounts: BillMember[]): BillMember[] {
	const remaining = memberAmounts.reduce(
		(acc, m) => {
			if (!m.shareAmount) acc.nMember++;
			else acc.amount -= m.shareAmount;
			return acc;
		},
		{ amount, nMember: 0 },
	);

	const remainingAmount = remaining.nMember > 0 ? remaining.amount / remaining.nMember : 0;

	return memberAmounts.map((m) => ({
		memberId: m.memberId,
		shareAmount: m.shareAmount || remainingAmount,
	}));
}

export function getMemberAmount(memberAmounts: BillMember[], memberId: MemberId): number {
	return memberAmounts.find((m) => m.memberId === memberId)?.shareAmount ?? 0;
}

export function setMemberAmount(
	memberAmounts: BillMember[],
	memberId: MemberId,
	shareAmount: number,
): BillMember[] {
	const existing = memberAmounts.find((m) => m.memberId === memberId);
	if (existing) {
		return memberAmounts.map((m) => (m.memberId === memberId ? { ...m, shareAmount } : m));
	}
	return [...memberAmounts, { memberId, shareAmount }];
}

export function focusOnToggleForDesktop(id: string) {
	if (isDesktopByResolution()) {
		nextTick(() => {
			document.getElementById(id)?.focus();
		});
	}
}

export const isMemberPaid = (bill: Bill, memberId: string): boolean => {
	return bill.paymentTracking.some((tracking) => tracking.memberId === memberId);
};

export const isAllPaid = (bill: Bill): boolean => {
	const paidMemberIds = new Set(bill.paymentTracking.map((t) => t.memberId));
	return bill.members.every((m) => {
		return m.shareAmount <= 0 || m.memberId === bill.createdBy || paidMemberIds.has(m.memberId);
	});
};

export const getPaidStatus = (bill: Bill): string => {
	const total = bill.members.reduce((acc, m) => {
		if (bill.createdBy === m.memberId) return acc;
		return acc + 1;
	}, 0);
	const paidCount = bill.paymentTracking.length;

	let result = `${paidCount}/${total}`;
	if (paidCount === total) result += ' ✅';

	return result;
};
