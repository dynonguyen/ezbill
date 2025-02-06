<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<template>
	<div
		class="mx-auto md:max-w-140 p-4 md:p-6 h-screen overflow-hidden relative md:border-x md:border-gray-300"
	>
		<ErrorBoundary>
			<RouterView />
		</ErrorBoundary>
	</div>
</template>
