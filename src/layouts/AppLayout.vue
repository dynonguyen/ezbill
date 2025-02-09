<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<template>
	<div
		id="app-layout"
		class="mx-auto md:max-w-140 py-4 h-dvh overflow-hidden relative md:border-x md:border-gray-300">
		<ErrorBoundary>
			<RouterView />
		</ErrorBoundary>
	</div>
</template>
