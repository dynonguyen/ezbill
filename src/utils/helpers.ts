import { v4 as uuidv4 } from 'uuid'

export const generateUUID = () => {
	return uuidv4()
}

export function safeJSONParse<T = unknown>(data: T, fallback?: T): T {
	try {
		return (typeof data === 'string' ? JSON.parse(data) : data) as T
	} catch {
		return fallback || data
	}
}
