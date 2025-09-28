import type { Bill, BillMember, Group, Member, MemberId } from '@/types/entities';
import { getGroupLink, saveFileAs } from '@/utils/helpers';
import dayjs from 'dayjs';
import { Workbook, type Column, type Font } from 'exceljs';

const BACKUP_SHEET_NAME = 'Backup';

const generateInformationSheet = (wb: Workbook, group: Group) => {
	const ROW_HEIGHT = 16;
	const COL_COMMON_STYLE: { font: Partial<Font> } = { font: { name: 'Arial', size: 12 } };

	const ws = wb.addWorksheet('Thông tin nhóm');

	// Define columns
	ws.columns = [
		{
			key: 'name',
			header: 'Tên nhóm',
			width: 40,
			style: COL_COMMON_STYLE,
		},
		{
			key: 'link',
			header: 'Link nhóm',
			width: 60,
			style: COL_COMMON_STYLE,
		},
		{
			key: 'createdAt',
			header: 'Ngày tạo',
			width: 30,
			style: COL_COMMON_STYLE,
		},
		{
			key: 'members',
			header: 'Số thành viên',
			width: 15,
			style: COL_COMMON_STYLE,
		},
	];

	// Styling
	ws.getRow(1).height = ROW_HEIGHT;

	['A', 'B', 'C', 'D'].forEach((col) => {
		const headerCell = ws.getCell(`${col}1`);
		const summaryCell = ws.getCell(`${col}${ws.rowCount}`);

		headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3E85C6' } };
		headerCell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFF' } };

		summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B6D7A8' } };
		summaryCell.font = { name: 'Arial', bold: col === 'A', size: 12, color: { argb: '000000' } };
	});

	ws.getCell('A2').value = group.name;

	const groupLink = getGroupLink(group.id);
	ws.getCell('B2').value = { text: groupLink, hyperlink: groupLink };

	ws.getCell('C2').value = dayjs(group.createdAt).format('DD/MM/YYYY HH:mm');
	ws.getCell('D2').value = group.members?.length;
};

const generateOverviewSheet = (wb: Workbook, group: Group, bills: Bill[]) => {
	const ROW_HEIGHT = 16;
	const COL_WIDTH = 30,
		CURRENCY_FMT = '#,##0 [$₫-vi-VN]',
		COL_COMMON_STYLE: { font: Partial<Font> } = { font: { name: 'Arial', size: 12 } };

	const ws = wb.addWorksheet('Tổng quan');

	// Define columns
	ws.columns = [
		{ key: 'name', header: 'Tên', width: COL_WIDTH, style: { ...COL_COMMON_STYLE } },
		{
			key: 'paid',
			header: 'Đã trả',
			width: COL_WIDTH,
			style: { ...COL_COMMON_STYLE, numFmt: CURRENCY_FMT },
		},
		{
			key: 'spent',
			header: 'Đã chi',
			width: COL_WIDTH,
			style: { ...COL_COMMON_STYLE, numFmt: CURRENCY_FMT },
		},
		{
			key: 'balance',
			header: 'Trả thêm / Nhận lại',
			width: COL_WIDTH,
			style: { ...COL_COMMON_STYLE, numFmt: CURRENCY_FMT },
		},
	];

	// Prepare data
	type RowValue = { name: string; paid: number; spent: number; balance: number };

	const rows = group.members.reduce(
		(acc, member) => {
			acc[member.id] = { name: member.name, paid: 0, spent: 0, balance: 0 };
			return acc;
		},
		{} as Record<MemberId, RowValue>,
	);

	bills.forEach((bill) => {
		if (rows[bill.createdBy]) {
			rows[bill.createdBy].paid += bill.amount;
		}

		Object.entries(bill.members).forEach(([id, amount]) => {
			if (rows[id]) rows[id].spent += amount;
		});
	});

	const summary: RowValue = { name: 'Tổng chi tiêu nhóm', paid: 0, spent: 0, balance: 0 };
	Object.values(rows).forEach((row) => {
		row.balance = row.paid - row.spent;

		summary.paid += row.paid;
		summary.spent += row.spent;
		summary.balance += row.balance;
	});

	// Add rows to the sheet
	Object.values(rows).forEach((rowVal, index) => {
		const row = ws.getRow(index + 2);
		row.values = rowVal;
		row.height = ROW_HEIGHT;
	});

	// Add summary row
	const summaryRow = ws.getRow(ws.rowCount + 1);
	summaryRow.values = summary;

	// Styling
	ws.getRow(1).height = ROW_HEIGHT;
	ws.getRow(ws.rowCount).height = ROW_HEIGHT;

	['A', 'B', 'C', 'D'].forEach((col) => {
		const headerCell = ws.getCell(`${col}1`);
		const summaryCell = ws.getCell(`${col}${ws.rowCount}`);

		headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3E85C6' } };
		headerCell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFF' } };

		summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'B6D7A8' } };
		summaryCell.font = { name: 'Arial', bold: col === 'A', size: 12, color: { argb: '000000' } };
	});

	// Conditional formatting
	ws.addConditionalFormatting({
		ref: 'D2:D1048576',
		rules: [
			{
				type: 'expression',
				priority: 1,
				formulae: ['D2>0'],
				style: { font: { color: { argb: '6AA84F' } } },
			},
			{
				type: 'expression',
				priority: 2,
				formulae: ['D2<0'],
				style: { font: { color: { argb: 'CC0000' } } },
			},
		],
	});
};

const generateDetailSheet = (wb: Workbook, group: Group, bills: Bill[]) => {
	const ROW_HEIGHT = 16,
		CURRENCY_FMT = '#,##0 [$₫-vi-VN]',
		DATE_FMT = 'dd/mm/yyyy hh:mm',
		COL_COMMON_STYLE: { font: Partial<Font> } = { font: { name: 'Arial', size: 12 } };

	const ws = wb.addWorksheet('Chi tiết');

	// Define columns
	const columns: Partial<Column>[] = [
		{ key: 'name', header: 'Sự kiện', width: 40, style: { ...COL_COMMON_STYLE } },
		{
			key: 'createdAt',
			header: 'Thời gian',
			width: 24,
			style: { ...COL_COMMON_STYLE, numFmt: DATE_FMT },
		},
		{
			key: 'amount',
			header: 'Tổng bill',
			width: 20,
			style: { ...COL_COMMON_STYLE, numFmt: CURRENCY_FMT },
		},
		{ key: 'createdBy', header: 'Trả bởi', width: 24, style: { ...COL_COMMON_STYLE } },
	];

	const headerRow = ws.getRow(1);

	group.members.forEach((member) => {
		columns.push({
			key: member.id,
			header: member.name,
			width: 20,
			style: { ...COL_COMMON_STYLE, numFmt: CURRENCY_FMT },
		});
	});

	ws.columns = columns;

	// Prepare data
	const groupMember = group.members.reduce(
		(acc, member) => ({ ...acc, [member.id]: member.name }),
		{} as Record<MemberId, Member['name']>,
	);
	bills.forEach((bill) => {
		ws.addRow({
			name: bill.name,
			createdAt: new Date(bill.createdAt),
			amount: bill.amount,
			createdBy: groupMember[bill.createdBy],
			...group.members.reduce((acc, { id }) => {
				acc[id] = bill.members[id] ?? 0;
				return acc;
			}, {} as BillMember),
		}).height = ROW_HEIGHT;

		if (bill.note) {
			const nameCell = ws.getCell(`A${ws.rowCount}`);
			nameCell.note = bill.note;
		}
	});

	// Styling
	headerRow.height = ROW_HEIGHT;

	Array(5)
		.fill(1)
		.forEach((_, index) => {
			const cell = headerRow.getCell(index + 1);
			cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '3C78D8' } };
			cell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFF' } };
		});

	group.members.forEach((_, index) => {
		const cell = headerRow.getCell(index + 5);
		cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '6AA84F' } };
		cell.font = { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFF' } };
	});
};

const generateBackupSheet = (wb: Workbook, group: Group, bills: Bill[]) => {
	const ws = wb.addWorksheet(BACKUP_SHEET_NAME, { state: 'hidden' });

	ws.getCell('A1').value = JSON.stringify(group || {});
	ws.getCell('A2').value = JSON.stringify(bills || []);
};

export const exportGroupToExcel = async (group: Group, bills: Bill[]) => {
	const wb = new Workbook();

	generateOverviewSheet(wb, group, bills);
	generateDetailSheet(wb, group, bills);
	generateInformationSheet(wb, group);
	generateBackupSheet(wb, group, bills);

	const buffer = await wb.xlsx.writeBuffer();
	saveFileAs(new Blob([buffer]), `${group.name}.xlsx`);
};

export type ImportedBackup = { group: Group; bills: Bill[] };
export async function readBackupFromExcel(file: File): Promise<ImportedBackup> {
	const wb = new Workbook();

	const buffer = await file.arrayBuffer();

	await wb.xlsx.load(buffer);
	const ws = wb.getWorksheet(BACKUP_SHEET_NAME);

	if (!ws) throw new Error('Backup sheet not found');

	const groupCell = ws.getCell('A1').value;
	const billsCell = ws.getCell('A2').value;

	try {
		const group = typeof groupCell === 'string' ? JSON.parse(groupCell) : {};
		const bills = typeof billsCell === 'string' ? JSON.parse(billsCell) : [];
		return { group, bills };
	} catch {
		throw new Error('Invalid backup data format');
	}
}
