import { BillType } from '@/types/entities';
import { match } from 'ts-pattern';

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
			icon: 'msi-pie-chart',
		}))
		.exhaustive();
}
