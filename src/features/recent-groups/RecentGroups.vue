<script setup lang="ts">
import Feedback from '@/components/Feedback.vue'
import Flex from '@/components/Flex.vue'
import Typography from '@/components/Typography.vue'
import { useLocalDBStore } from '@/stores/local-db'
import { Group } from '@/types/entities'
import { getImgUrl } from '@/utils/get-asset'
import { ref } from 'vue'

const localStore = useLocalDBStore()
const groups = ref<Group[]>([])
</script>

<template>
	<Flex stack class="gap-4 grow overflow-hidden">
		<Typography variant="xlSemiBold">Recent groups</Typography>

		<div class="overflow-auto">
			<Feedback
				v-if="!localStore.joinedGroups.length"
				:img="getImgUrl('no-groups-found.svg')"
				title="No groups found"
				:attrs="{ img: { class: 'w-1/2' } }" />
			<div v-else class="h-400">Hello</div>
		</div>
	</Flex>
</template>
