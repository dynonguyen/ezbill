<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import Flex from '@/components/ui/Flex.vue';
</script>

<template>
	<Flex
		stack
		id="app-layout"
		class="mx-auto max-w-screen-sm h-dvh overflow-hidden relative bg-base-100 sm:border-l sm:border-r sm:border-base-300">
		<ErrorBoundary>
			<RouterView />
		</ErrorBoundary>
	</Flex>
</template>
