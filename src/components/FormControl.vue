<script setup lang="ts">
import Flex from './Flex.vue'
import Typography from './Typography.vue'

type FormControlProps = {
	label?: string
	helperText?: string
	error?: boolean
	htmlFor?: string
}

defineProps<FormControlProps>()
</script>

<template>
	<Flex
		stack
		class="gap-1"
		:class="{
			'[&>.p-inputtext]:!border-error': $props.error,
		}">
		<Typography
			as="label"
			v-if="$props.label"
			variant="smSemiBold"
			:for="$props.htmlFor"
			:class="{ 'text-error': $props.error }">
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
