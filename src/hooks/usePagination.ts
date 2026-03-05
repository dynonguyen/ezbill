import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export type UsePaginationOptions = {
	limit: number;
	total: MaybeRefOrGetter<number>;
	syncWithRoute?: boolean;
	queryKey?: string;
};

const DEFAULT_PAGE = 1;

export function usePagination(options: UsePaginationOptions) {
	const { limit, total, syncWithRoute = true, queryKey = 'page' } = options;
	const route = useRoute();
	const router = useRouter();

	const pageRef = ref(DEFAULT_PAGE);
	const page = syncWithRoute
		? computed({
				get: () => Number(route.query[queryKey] ?? DEFAULT_PAGE) || DEFAULT_PAGE,
				set: (value: number) => {
					const current = Number(route.query[queryKey] ?? DEFAULT_PAGE) || DEFAULT_PAGE;
					if (value === current) return;
					router.replace({ query: { ...route.query, [queryKey]: value } });
				},
			})
		: computed({
				get: () => pageRef.value,
				set: (value: number) => {
					pageRef.value = value;
				},
			});

	const totalPages = computed(() => {
		const t = toValue(total);
		if (!limit) return DEFAULT_PAGE;
		const p = Math.ceil(t / limit);
		return p > 0 ? p : DEFAULT_PAGE;
	});

	watch(
		[page, totalPages],
		([p, max]) => {
			const current = Number(p);
			const safe = Math.max(DEFAULT_PAGE, Math.min(current, Number(max)));
			if (safe !== current) page.value = safe;
		},
		{ immediate: true },
	);

	const offset = computed(() => (page.value - 1) * limit);

	return { page, totalPages, offset, limit };
}
