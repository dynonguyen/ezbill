<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import Flex from './ui/Flex.vue';
import Typography from './ui/Typography.vue';

defineProps<{ label: any; value?: any; labelWidth?: number }>();
</script>

<template>
	<Flex v-if="value" class="gap-2 !items-start">
		<Typography
			variant="smRegular"
			class="text-slate-500 shrink-0"
			:style="{ width: labelWidth ? `${labelWidth}px` : '100px' }">
			{{ label }}:
		</Typography>
		<Typography variant="smRegular">
			{{ value }}
		</Typography>
	</Flex>
</template>
