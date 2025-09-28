<script setup lang="ts">
import { fetchGroups } from '@/apis/supabase';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { LS_KEY, QUERY_KEY } from '@/constants/key';
import { useLocalDBStore } from '@/stores/local-db';
import type { Group } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { useQuery } from '@tanstack/vue-query';
import { match } from 'ts-pattern';
import { computed, ref, toRaw, watch } from 'vue';
import RecentGroupItem from './RecentGroupItem.vue';
import Sorting, { sortOptions } from './Sorting.vue';

const localStoreDB = useLocalDBStore();
const groupIds = computed(() => localStoreDB.joinedGroups.map((group) => group.groupId));
const queryKey = computed(() => [QUERY_KEY.GROUP, groupIds]);

const { isPending, data, isError } = useQuery({
	queryKey,
	queryFn: () => fetchGroups(groupIds.value),
});

const getDefaultSort = () => {
	const savedSortKey = localStorage.getItem(LS_KEY.RECENT_GROUP_SORT_KEY);
	if (!savedSortKey) return sortOptions[0];
	return sortOptions.find((opt) => opt.key === savedSortKey) || sortOptions[0];
};

const sort = ref(getDefaultSort());

// Remove not found groups from local store
watch(
	() => data.value?.notFoundIds,
	(notFoundIds) => {
		notFoundIds?.length && localStoreDB.removeFromGroups(notFoundIds);
	},
);

const sortGroups = (groups: Group[]) => {
	const { by, order } = sort.value;

	const compareFn = match([by, order])
		.returnType<((a: Group, b: Group) => number) | null>()
		.with(
			['createdAt', 'desc'],
			() => (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.with(
			['createdAt', 'asc'],
			() => (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)
		.with(['name', 'asc'], () => (a, b) => a.name.localeCompare(b.name))
		.with(['name', 'desc'], () => (a, b) => b.name.localeCompare(a.name))
		.with(
			['updatedAt', 'desc'],
			() => (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		)
		.with(['lastOpened', 'desc'], () => {
			const lastOpened = toRaw(localStoreDB.lastOpenedGroups);
			if (!Object.keys(lastOpened).length) return null;

			return (a, b) => {
				return (lastOpened[b.id] || 0) - (lastOpened[a.id] || 0);
			};
		})
		.otherwise(() => null);

	return compareFn ? [...groups].sort(compareFn) : groups;
};

const groups = computed<Group[]>(() => {
	const result = data.value?.groups || [];

	return sort.value ? sortGroups(result) : result;
});
</script>

<template>
	<Flex stack class="gap-4 h-full py-4 grow overflow-hidden">
		<Flex class="justify-between px-4 gap-1">
			<Typography variant="lgSemiBold" class="text-black">Nhóm của bạn</Typography>
			<Flex class="gap-2 shrink-0">
				<Sorting v-model="sort" />
			</Flex>
		</Flex>

		<Flex v-if="isPending" stack class="gap-4 px-4">
			<div v-for="i in 4" :key="i" class="skeleton h-24 w-full rounded-2xl"></div>
		</Flex>
		<Typography v-else-if="isError" variant="smMedium" class="text-red-400 text-center">
			Đã có lỗi xảy ra, vui lòng thử lại sau
		</Typography>
		<img
			v-else-if="!groups.length"
			:src="getImgUrl('no-groups.svg')"
			class="size-[300px] mx-auto" />
		<Flex v-else stack class="gap-4 px-4 pb-4 overflow-auto">
			<RecentGroupItem v-for="group in groups" :key="group.id" :group="group" />
		</Flex>
	</Flex>
</template>
