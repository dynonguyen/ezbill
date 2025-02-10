<script setup lang="ts">
import Typography from '@/components/Typography.vue';

defineProps<{ label?: string }>();
</script>

<template>
	<div class="rounded-2xl p-4 bg-white shadow-lg shadow-neutral-200/25 w-full">
		<Typography v-if="$props.label" variant="lgSemiBold">{{ $props.label }}</Typography>
		<slot></slot>
	</div>
</template>
