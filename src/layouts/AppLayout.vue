<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<template>
	<div class="mx-auto max-w-120 lg:max-w-140 p-4 lg:p-8 h-screen overflow-hidden relative">
		<ErrorBoundary>
			<RouterView />
		</ErrorBoundary>
	</div>
</template>
