import { BillType, type Bill, type BillMember, type Member } from '@/types/entities';
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

export function splitEqually(amount: number, participants: Member['id'][]): BillMember {
	const len = participants.length;
	return participants.reduce((acc, id) => {
		acc[id] = amount / len;
		return acc;
	}, {} as BillMember);
}

export function getTotalMemberAmount(memberAmounts: BillMember): number {
	return Object.values(memberAmounts).reduce((acc, amount) => acc + (amount || 0), 0);
}

export function omitZeroMemberAmounts(memberAmounts: BillMember): BillMember {
	return Object.fromEntries(
		Object.entries(memberAmounts).filter(([_, amount]) => amount !== 0),
	) as BillMember;
}

export function splitExactly(amount: number, memberAmounts: BillMember): BillMember {
	const result = { ...memberAmounts };

	const remaining = Object.values(result).reduce(
		(acc, amount) => {
			if (!amount) acc.nMember++;
			else acc.amount -= amount;

			return acc;
		},
		{ amount, nMember: 0 },
	);

	if (remaining.nMember) {
		const remainingAmount = remaining.amount / remaining.nMember;

		Object.keys(result).forEach((id) => {
			if (!result[id]) {
				result[id] = remainingAmount;
			}
		});
	}

	return result;
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
	return Object.entries(bill.members).every(([memberId, amount]) => {
		return amount <= 0 || memberId === bill.createdBy || isMemberPaid(bill, memberId);
	});
};
