export type VietQRData = {
	bin: string; // Bank Identification Number
	accountNumber: string;
	amount: string;
	content?: string;
};

function calculateCRC16(data: string) {
	let crc = 0xffff;

	for (let i = 0; i < data.length; i++) {
		crc ^= data.charCodeAt(i);
		for (let j = 0; j < 8; j++) {
			if (crc & 0x0001) {
				crc = (crc >> 1) ^ 0x8408;
			} else {
				crc >>= 1;
			}
		}
	}

	return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildVietQRData(data: VietQRData): string {
	const { bin, accountNumber, amount, content } = data;

	// Chuỗi dữ liệu VietQR
	let payload = '000201'; // Payload Format Indicator
	payload += '010212'; // Point of Initiation Method (12: động)

	// Thông tin VietQR (ID 38)
	const bankInfo = `0010A00000072701${String(bin.length + accountNumber.length + 12).padStart(2, '0')}00${String(bin.length).padStart(2, '0')}${bin}01${String(accountNumber.length).padStart(2, '0')}${accountNumber}0208QRIBFTTA`;
	payload += `38${String(bankInfo.length).padStart(2, '0')}${bankInfo}`;

	// Mã tiền tệ
	payload += '5303704'; // VND

	// Số tiền (nếu có)
	if (amount) {
		payload += `54${String(amount.length).padStart(2, '0')}${amount}`;
	}

	// Nội dung (nếu có)
	if (content) {
		payload += `62${String(content.length + 8).padStart(2, '0')}08${String(content.length).padStart(2, '0')}${content}`;
	}

	// Tính checksum CRC16
	const crc = calculateCRC16(payload + '6304');
	payload += `6304${crc}`;

	return payload;
}
