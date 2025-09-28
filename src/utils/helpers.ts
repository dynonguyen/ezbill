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

export const veeValidateFocusOnError = ({ errors }: any) => {
	const firstField = Object.keys(errors)[0];
	(document.querySelector(`input[name="${firstField}"]`) as HTMLInputElement)?.focus();
};

export const isDesktopByResolution = (): boolean => {
	return window.innerWidth >= 1024;
};

export const retryOnFailure = async <T>(
	fn: () => Promise<T>,
	retries = 3,
	delay = 1000,
): Promise<T> => {
	let lastError: Error | null = null;

	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			if (i < retries - 1) {
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError;
};

export const copyToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		try {
			const successful = document.execCommand('copy');
			document.body.removeChild(textarea);
			return successful;
		} catch (err) {
			document.body.removeChild(textarea);
			console.error('Copy failed:', err);
			return false;
		}
	}
};
