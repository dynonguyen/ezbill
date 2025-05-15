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
		class="gap-1 ez-form-control"
		:class="{
			'[&_.input]:!border-error [&_.input]:!outline-error [&_.select]:!outline-error [&_.select]:!border-error ez-form-control--error':
				error,
		}">
		<slot name="label">
			<Typography
				as="label"
				v-if="label"
				:variant="size === 'large' ? 'mdRegular' : 'smRegular'"
				:for="htmlFor"
				v-bind="pt?.label">
				{{ label }}
			</Typography>
		</slot>

		<slot></slot>

		<Typography
			v-if="$props.helperText"
			variant="smRegular"
			:class="{ 'text-error': $props.error }">
			{{ $props.helperText }}
		</Typography>
	</Flex>
</template>
