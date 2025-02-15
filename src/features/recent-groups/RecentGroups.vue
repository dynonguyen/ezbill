<script setup lang="ts">
import Feedback from '@/components/Feedback.vue';
import Flex from '@/components/Flex.vue';
import Typography from '@/components/Typography.vue';
import { useLocalDBStore } from '@/stores/local-db';
import { getImgUrl } from '@/utils/get-asset';
import RecentGroupItem from './RecentGroupItem.vue';

const localStore = useLocalDBStore();
</script>

<template>
	<div class="grow overflow-auto">
		<Flex stack class="gap-4 px-4">
			<Typography variant="xlSemiBold">Nhóm đã tham gia</Typography>

			<Feedback
				v-if="!localStore.joinedGroups.length"
				:img="getImgUrl('no-groups.svg')"
				title="Không có nhóm nào"
				:attrs="{ img: { class: 'w-1/2' } }" />
			<Flex v-else class="gap-4" stack>
				<RecentGroupItem
					v-for="group in localStore.joinedGroups"
					:key="group.groupId"
					:id="group.groupId" />
			</Flex>
		</Flex>
	</div>
</template>
