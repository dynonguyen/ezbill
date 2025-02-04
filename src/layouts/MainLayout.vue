<script setup lang="ts">
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { RouterView } from 'vue-router'
</script>

<template>
	<ErrorBoundary>
		<RouterView />
	</ErrorBoundary>
</template>
