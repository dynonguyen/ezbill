<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useLocalDBStore } from '@/stores/local-db';
import { getImgUrl } from '@/utils/get-asset';
import RecentGroupItem from './RecentGroupItem.vue';

const localStore = useLocalDBStore();
</script>

<template>
	<Flex stack class="gap-4 h-full py-4 grow overflow-auto">
		<Typography variant="mdSemiBold" class="px-4">Nhóm của bạn</Typography>

		<img
			v-if="!localStore.joinedGroups.length"
			:src="getImgUrl('no-groups.svg')"
			class="size-[300px] mx-auto" />
		<Flex v-else stack class="gap-4 px-4">
			<RecentGroupItem
				v-for="group in localStore.joinedGroups"
				:key="group.groupId"
				:id="group.groupId" />
		</Flex>
	</Flex>
</template>
