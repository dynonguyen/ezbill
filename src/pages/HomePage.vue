<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import GroupInvitation from '@/features/group-invitation/GroupInvitation.vue'
import NewGroupButton from '@/features/new-group/NewGroupButton.vue'
import RecentGroups from '@/features/recent-groups/RecentGroups.vue'
</script>

<template>
	<Flex stack class="gap-6 h-full">
		<GroupInvitation />
		<RecentGroups />
		<div class="mt-auto mx-auto">
			<NewGroupButton />
		</div>
	</Flex>
</template>
