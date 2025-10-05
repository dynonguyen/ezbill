export type VietQRData = {
	bin: string; // Bank Identification Number
	accountNumber: string;
	amount: number;
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

const DEFAULT_TRANSFER_CONTENT = 'Thanh toan ezb';

export function buildVietQRData(data: VietQRData): string {
	const { bin, accountNumber, amount, content } = data;

	// VietQR data string
	let payload = '000201'; // Payload Format Indicator
	payload += '010212'; // Point of Initiation Method (12: dynamic)

	// VietQR information (ID 38)
	const bankInfo = `0010A00000072701${String(bin.length + accountNumber.length + 12).padStart(2, '0')}00${String(bin.length).padStart(2, '0')}${bin}01${String(accountNumber.length).padStart(2, '0')}${accountNumber}0208QRIBFTTA`;
	payload += `38${String(bankInfo.length).padStart(2, '0')}${bankInfo}`;

	// Currency code
	payload += '5303704'; // VND

	// Amount (if provided)
	if (amount) {
		payload += `54${String(`${amount}`.length).padStart(2, '0')}${amount}`;
	}

	// Content (if provided) - prioritize content, otherwise use default content
	const transferContent = content || DEFAULT_TRANSFER_CONTENT;
	if (transferContent) {
		payload += `62${String(transferContent.length + 8).padStart(2, '0')}08${String(transferContent.length).padStart(2, '0')}${transferContent}`;
	}

	// Calculate CRC16 checksum
	const crc = calculateCRC16(payload + '6304');
	payload += `6304${crc}`;

	return payload;
}
