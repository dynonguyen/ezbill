<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import Flex from './ui/Flex.vue';
import Typography, { type TypographyProps } from './ui/Typography.vue';

export type LabelValueProps = {
	label: any;
	value?: any;
	labelWidth?: number;
	variant?: TypographyProps['variant'];
	pt?: {
		label?: TypographyProps & HTMLAttributes;
		value?: TypographyProps & HTMLAttributes;
	};
};

withDefaults(defineProps<LabelValueProps>(), { variant: 'smRegular' });
</script>

<template>
	<Flex v-if="value || $slots.value" class="gap-2 !items-start">
		<Typography
			:variant="variant"
			class="text-slate-500 shrink-0"
			:style="{ width: labelWidth ? `${labelWidth}px` : '100px' }"
			v-bind="pt?.label">
			{{ label }}:
		</Typography>
		<slot name="value" :value="value">
			<Typography :variant="variant" v-bind="pt?.value">
				{{ value }}
			</Typography>
		</slot>
	</Flex>
</template>
