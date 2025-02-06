<script setup lang="ts">
import Feedback from '@/components/Feedback.vue'
import Flex from '@/components/Flex.vue'
import Typography from '@/components/Typography.vue'
import { getImgUrl } from '@/utils/get-asset'

const groups: string[] = []
</script>

<template>
	<Flex stack class="gap-4 grow overflow-hidden">
		<Typography variant="xlSemiBold">Recent groups</Typography>

		<div class="overflow-auto">
			<Feedback
				v-if="!groups.length"
				:img="getImgUrl('no-groups-found.svg')"
				title="No groups found"
				:attrs="{ img: { class: 'w-1/2' } }"
			/>
			<div v-else class="h-400">Hello</div>
		</div>
	</Flex>
</template>
