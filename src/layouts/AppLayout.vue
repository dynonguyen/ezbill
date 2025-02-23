<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue';
</script>

<template>
	<div id="app-layout" class="mx-auto max-w-screen-sm h-dvh overflow-hidden relative bg-base-100">
		<ErrorBoundary>
			<RouterView />
		</ErrorBoundary>
	</div>
</template>
