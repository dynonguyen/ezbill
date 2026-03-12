<script setup lang="ts">
import { SortOrder, type ApiFetchGroupsReq } from '@/apis/api-client';
import Pagination from '@/components/Pagination.vue';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { LS_KEY, QUERY_KEY } from '@/constants/key';
import { useApiClient } from '@/hooks/useApiClient';
import { usePagination } from '@/hooks/usePagination';
import { getImgUrl } from '@/utils/get-asset';
import { useQuery } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import RecentGroupItem from './RecentGroupItem.vue';
import Sorting, { sortOptions } from './Sorting.vue';

const FIRST_PAGE_LIMIT = 10;

const apiClient = useApiClient();
const showHidden = ref(Boolean(localStorage.getItem(LS_KEY.SHOW_HIDDEN_GROUPS)));

const totalRef = ref(0);
const { page, totalPages, offset, limit } = usePagination({
	limit: FIRST_PAGE_LIMIT,
	total: totalRef,
});

const sortOpt = ref(
	(() => {
		const savedSortKey = localStorage.getItem(LS_KEY.RECENT_GROUP_SORT_KEY);
		if (!savedSortKey) return sortOptions[0];
		return sortOptions.find((opt) => opt.key === savedSortKey) || sortOptions[0];
	})(),
);

const hiddenRef = computed(() => (showHidden.value ? true : undefined));
const fetchOpts = computed<ApiFetchGroupsReq>(() => ({
	offset: offset.value,
	limit,
	sortOrder: sortOpt.value?.order === 'asc' ? SortOrder.Asc : SortOrder.Desc,
	sortBy: sortOpt.value?.by as string,
	includeHidden: hiddenRef.value,
}));

const queryKey = computed(() => [QUERY_KEY.GROUPS, sortOpt.value, page.value, hiddenRef.value]);

const { isPending, data, isError } = useQuery({
	queryKey,
	queryFn: () => apiClient.fetchGroups(fetchOpts.value).then((res) => res.data),
});

const groups = computed(() => data.value?.data ?? []);
const total = computed(() => data.value?.total ?? 0);

watch(
	data,
	(v) => {
		if (v != null) totalRef.value = v.total ?? 0;
	},
	{ immediate: true },
);

const { data: sessionStats } = useQuery({
	queryKey: [QUERY_KEY.SESSION_STATS],
	queryFn: () => apiClient.fetchSessionStats().then((res) => res.data),
});

const totalHiddenGroups = computed(() => sessionStats.value?.totalHiddenGroups ?? 0);

const toggleShowHidden = () => {
	showHidden.value = !showHidden.value;
	showHidden.value
		? localStorage.setItem(LS_KEY.SHOW_HIDDEN_GROUPS, '1')
		: localStorage.removeItem(LS_KEY.SHOW_HIDDEN_GROUPS);
};
</script>

<template>
	<Flex stack class="gap-4 h-full py-4 grow overflow-hidden">
		<Flex class="justify-between px-4 gap-1">
			<Typography variant="lgSemiBold" class="text-black">Nhóm của bạn</Typography>
			<Flex class="gap-2 shrink-0">
				<Button
					v-if="totalHiddenGroups > 0"
					variant="outlined"
					shape="rounded"
					color="neutral"
					size="sm"
					class="shrink-0 border-gray-400 gap-1"
					@click="toggleShowHidden">
					<span
						class="icon"
						:class="showHidden ? 'msi-visibility-off-rounded' : 'msi-visibility-rounded'"></span>
					({{ totalHiddenGroups }})
				</Button>
				<Sorting v-model="sortOpt" />
			</Flex>
		</Flex>

		<Flex v-if="isPending" stack class="gap-4 px-4">
			<div v-for="i in 4" :key="i" class="skeleton h-24 w-full rounded-2xl"></div>
			<Flex class="gap-2 justify-center min-h-10 items-center">
				<div v-for="i in 5" :key="i" class="skeleton size-9 shrink-0 rounded-full"></div>
			</Flex>
		</Flex>
		<Typography v-else-if="isError" variant="smMedium" class="text-red-400 text-center">
			Đã có lỗi xảy ra, vui lòng thử lại sau
		</Typography>
		<img
			v-else-if="!groups?.length"
			:src="getImgUrl('no-groups.svg')"
			class="size-[300px] mx-auto" />
		<Flex v-else stack class="gap-4 px-4 pb-4 overflow-auto">
			<RecentGroupItem v-for="group in groups" :key="group.id" :group="group" />
			<Pagination v-if="totalPages > 1" v-model:page="page" :total="total" :limit="limit" />
		</Flex>
	</Flex>
</template>
