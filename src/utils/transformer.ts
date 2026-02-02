const MAX_DEPTH = 10;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	if (typeof value !== 'object' || value === null) return false;
	if (Array.isArray(value)) return false;
	if (typeof value === 'function') return false;

	const tag = Object.prototype.toString.call(value);
	return tag === '[object Object]';
};

const snakeToCamel = (str: string): string => {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const transformSnakeToCamel = <T = unknown>(
	data: unknown,
	maxDepth: number = MAX_DEPTH,
): T => {
	if (data === null || data === undefined) {
		return data as T;
	}

	if (maxDepth <= 0) {
		return data as T;
	}

	if (Array.isArray(data)) {
		return data.map((item) => transformSnakeToCamel(item, maxDepth - 1)) as T;
	}

	if (isPlainObject(data)) {
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			const camelKey = snakeToCamel(key);
			transformed[camelKey] = transformSnakeToCamel(value, maxDepth - 1);
		}
		return transformed as T;
	}

	return data as T;
};

const camelToSnake = (str: string): string => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

export const transformCamelToSnake = <T = unknown>(
	data: unknown,
	maxDepth: number = MAX_DEPTH,
): T => {
	if (data === null || data === undefined) {
		return data as T;
	}

	if (maxDepth <= 0) {
		return data as T;
	}

	if (Array.isArray(data)) {
		return data.map((item) => transformCamelToSnake(item, maxDepth - 1)) as T;
	}

	if (isPlainObject(data)) {
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			const snakeKey = camelToSnake(key);
			transformed[snakeKey] = transformCamelToSnake(value, maxDepth - 1);
		}
		return transformed as T;
	}

	return data as T;
};

/**
 * Transform fields with key postfix _id to string if the value is a number
 */
export const transformId = <T = unknown>(data: unknown, maxDepth: number = MAX_DEPTH): T => {
	if (data === null || data === undefined) {
		return data as T;
	}

	if (maxDepth <= 0) {
		return data as T;
	}

	if (Array.isArray(data)) {
		return data.map((item) => transformId(item, maxDepth - 1)) as T;
	}

	if (isPlainObject(data)) {
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			if (key.toLowerCase().endsWith('id') && typeof value === 'number') {
				transformed[key] = String(value);
			} else {
				transformed[key] = transformId(value, maxDepth - 1);
			}
		}
		return transformed as T;
	}

	return data as T;
};
