import type { Ref } from 'vue';
import { watch } from 'vue';

export function useExpandLimit(
	limitRef: Ref<number>,
	getResponse: () => { total?: number } | null | undefined,
	refetch: () => void,
) {
	watch(
		() => getResponse(),
		(response) => {
			const total = response?.total;
			if (total != null && total > limitRef.value) {
				limitRef.value = total;
				refetch();
			}
		},
		{ immediate: true },
	);
}
