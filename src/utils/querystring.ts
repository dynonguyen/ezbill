export function buildQueryString(queries: Record<string, any>) {
	if (!queries) return '';

	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(queries)) {
		if (value === undefined || value === null) continue;

		// Support array of values: tags[]=1&tags[]=2
		if (Array.isArray(value)) {
			value.forEach((v) => searchParams.append(key, String(v)));
		} else {
			searchParams.append(key, String(value));
		}
	}

	return searchParams.toString();
}
