<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import GroupInvitation from '@/features/group-invitation/GroupInvitation.vue'
import NewGroupButton from '@/features/new-group/NewGroupButton.vue'
import RecentlyViewed from '@/features/recently-viewed/RecentlyViewed.vue'
</script>

<template>
	<Flex stack class="gap-6">
		<GroupInvitation />
		<RecentlyViewed />
		<div class="absolute bottom-12 right-4">
			<NewGroupButton />
		</div>
	</Flex>
</template>
