<script setup lang="ts">
import { fetchGroups } from '@/apis/supabase';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import { useLocalDBStore } from '@/stores/local-db';
import { getImgUrl } from '@/utils/get-asset';
import { useQuery } from '@tanstack/vue-query';
import { computed, watch } from 'vue';
import RecentGroupItem from './RecentGroupItem.vue';
import Sorting from './Sorting.vue';

const localStoreDB = useLocalDBStore();
const groupIds = localStoreDB.joinedGroups.map((group) => group.groupId);
const queryKey = computed(() => [QUERY_KEY.GROUP, groupIds]);

const { isPending, data, isError } = useQuery({ queryKey, queryFn: () => fetchGroups(groupIds) });

// Remove not found groups from local store
watch(
	() => data.value?.notFoundIds,
	(notFoundIds) => {
		notFoundIds?.length && localStoreDB.removeFromGroups(notFoundIds);
	},
);
</script>

<template>
	<Flex stack class="gap-4 h-full py-4 grow overflow-auto">
		<Flex class="justify-between px-4 gap-1">
			<Typography variant="mdSemiBold" class="text-black">Nhóm của bạn</Typography>
			<Flex class="gap-2 shrink-0">
				<Sorting />
			</Flex>
		</Flex>

		<Flex v-if="isPending" stack class="gap-4 px-4">
			<div v-for="i in 4" :key="i" class="skeleton h-24 w-full rounded-2xl"></div>
		</Flex>
		<Typography v-else-if="isError" variant="smMedium" class="text-red-400 text-center">
			Đã có lỗi xảy ra, vui lòng thử lại sau
		</Typography>
		<img
			v-else-if="!data?.groups?.length"
			:src="getImgUrl('no-groups.svg')"
			class="size-[300px] mx-auto" />
		<Flex v-else stack class="gap-4 px-4">
			<RecentGroupItem v-for="group in data.groups" :key="group.id" :group="group" />
		</Flex>
	</Flex>
</template>
