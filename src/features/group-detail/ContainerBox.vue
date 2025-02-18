<script setup lang="ts">
import Typography from '@/components/Typography.vue';

defineProps<{ label?: string }>();
</script>

<template>
	<div class="rounded-2xl p-4 bg-white shadow-sm shadow-neutral-200/25 w-full">
		<slot name="label">
			<Typography v-if="$props.label" variant="lgSemiBold" class="mb-4">
				{{ $props.label }}
			</Typography>
		</slot>
		<slot></slot>
	</div>
</template>
