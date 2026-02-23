import { useRoute, useRouter } from 'vue-router';
import { computed, ref, type MaybeRefOrGetter, toValue, watch } from 'vue';

export type UsePaginationOptions = {
	limit: number;
	total: MaybeRefOrGetter<number>;
	syncWithRoute?: boolean;
	queryKey?: string;
};

export function usePagination(options: UsePaginationOptions) {
	const { limit, total, syncWithRoute = true, queryKey = 'page' } = options;
	const route = useRoute();
	const router = useRouter();

	const pageRef = ref(1);
	const page = syncWithRoute
		? computed({
				get: () => Number(route.query[queryKey] ?? 1) || 1,
				set: (value: number) => {
					const current = Number(route.query[queryKey] ?? 1) || 1;
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
		if (!limit) return 1;
		const p = Math.ceil(t / limit);
		return p > 0 ? p : 1;
	});

	watch(
		[page, totalPages],
		([p, max]) => {
			const current = Number(p);
			const safe = Math.max(1, Math.min(current, Number(max)));
			if (safe !== current) page.value = safe;
		},
		{ immediate: true },
	);

	const offset = computed(() => (page.value - 1) * limit);

	return { page, totalPages, offset, limit };
}
