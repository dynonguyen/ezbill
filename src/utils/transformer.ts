const MAX_DEPTH = 3;

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

	if (typeof data === 'object' && data.constructor === Object) {
		const transformed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(data)) {
			const camelKey = snakeToCamel(key);
			transformed[camelKey] = transformSnakeToCamel(value, maxDepth - 1);
		}
		return transformed as T;
	}

	return data as T;
};
