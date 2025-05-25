import { v4 as uuidv4 } from 'uuid';
import { getCurrentInstance } from 'vue';
import { PATH } from '../constants/path';
import { getEnv } from './get-env';

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

export function toVND(amount: number, options?: Intl.NumberFormatOptions): string {
	return new Intl.NumberFormat('vi-VN', options ?? { style: 'currency', currency: 'VND' }).format(
		amount,
	);
}

export function saveFileAs(data: Blob | string, filename: string) {
	const url = typeof data === 'string' ? data : URL.createObjectURL(data);
	const a = document.createElement('a');

	a.download = filename;
	a.href = url;
	document.body.appendChild(a);

	a.click();
	a.remove();
}

export function getGroupLink(groupId: string): string {
	return `${getEnv('VITE_BASE_URL')}${PATH.GROUP.replace(':id', groupId)}`;
}

export function hasEventPassed(evName: string): boolean {
	return getCurrentInstance()?.vnode?.props?.[evName];
}

export function debounce<T extends (...args: any[]) => any>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;

	return function (this: unknown, ...args: Parameters<T>) {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
}

export const veeValidateFocusOnError = ({ errors }: any) => {
	const firstField = Object.keys(errors)[0];
	(document.querySelector(`input[name="${firstField}"]`) as HTMLInputElement)?.focus();
};
