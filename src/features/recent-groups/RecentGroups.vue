<script setup lang="ts">
import Feedback from '@/components/Feedback.vue'
import Flex from '@/components/Flex.vue'
import Typography from '@/components/Typography.vue'
import { useLocalDBStore } from '@/stores/local-db'
import { getImgUrl } from '@/utils/get-asset'
import RecentGroupItem from './RecentGroupItem.vue'

const localStore = useLocalDBStore()
</script>

<template>
	<Flex stack class="gap-4 grow overflow-hidden">
		<Typography variant="xlSemiBold">Recent groups</Typography>

		<div class="overflow-auto grow">
			<Feedback
				v-if="!localStore.joinedGroups.length"
				:img="getImgUrl('no-groups-found.svg')"
				title="No groups found"
				:attrs="{ img: { class: 'w-1/2' } }" />
			<Flex v-else class="gap-4" stack>
				<RecentGroupItem
					v-for="group in localStore.joinedGroups"
					:key="group.groupId"
					:id="group.groupId" />
			</Flex>
		</div>
	</Flex>
</template>
