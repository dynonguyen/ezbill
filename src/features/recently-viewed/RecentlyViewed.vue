<script setup lang="ts">
import Feedback from '@/components/Feedback.vue'
import Flex from '@/components/Flex.vue'
import Typography from '@/components/Typography.vue'
import { getImgUrl } from '@/utils/get-asset'
</script>

<template>
	<Flex stack class="gap-4">
		<Typography variant="xlSemiBold">Recent groups</Typography>
		<Feedback
			:img="getImgUrl('no-groups-found.svg')"
			title="No groups found"
			:attrs="{ img: { class: 'w-1/2' } }"
		/>
	</Flex>
</template>
