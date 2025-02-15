import { v4 as uuidv4 } from 'uuid';

export function generateUUID(): string {
	return uuidv4();
}

export function safeJSONParse<T = unknown>(data: string | T, fallback?: T): T {
	try {
		return (typeof data === 'string' ? JSON.parse(data) : data) as T;
	} catch {
		return (fallback || data) as T;
	}
}

export function toVND(amount: number): string {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
