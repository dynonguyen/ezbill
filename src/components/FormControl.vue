<script setup lang="ts">
import type { LabelHTMLAttributes } from 'vue';
import Flex from './Flex.vue';
import Typography from './Typography.vue';

type FormControlProps = {
	label?: string;
	helperText?: string;
	error?: boolean;
	htmlFor?: string;
	size?: 'small' | 'large';
	pt?: { label?: LabelHTMLAttributes };
};

defineProps<FormControlProps>();
</script>

<template>
	<Flex
		stack
		class="gap-1"
		:class="{
			'[&_.p-inputtext]:!border-error': $props.error,
		}">
		<Typography
			as="label"
			v-if="$props.label"
			:variant="$props.size === 'large' ? 'mdSemiBold' : 'smSemiBold'"
			:for="$props.htmlFor"
			:class="{ 'text-error': $props.error }"
			v-bind="$props.pt?.label">
			{{ $props.label }}
		</Typography>

		<slot></slot>

		<Typography
			v-if="$props.helperText"
			variant="smRegular"
			:class="{ 'text-error': $props.error }">
			{{ $props.helperText }}
		</Typography>
	</Flex>
</template>
