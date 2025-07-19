<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useLocalDBStore } from '@/stores/local-db';
import { getImgUrl } from '@/utils/get-asset';
import RecentGroupItem from './RecentGroupItem.vue';

const localStoreDB = useLocalDBStore();
</script>

<template>
	<Flex stack class="gap-4 h-full py-4 grow overflow-auto">
		<Typography variant="mdSemiBold" class="px-4 text-black">
			Nhóm của bạn ({{ localStoreDB.joinedGroups.length }})
		</Typography>

		<img
			v-if="!localStoreDB.joinedGroups.length"
			:src="getImgUrl('no-groups.svg')"
			class="size-[300px] mx-auto" />
		<Flex v-else stack class="gap-4 px-4">
			<RecentGroupItem
				v-for="group in localStoreDB.joinedGroups"
				:key="group.groupId"
				:id="group.groupId" />
		</Flex>
	</Flex>
</template>
