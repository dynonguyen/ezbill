<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const variants = {
	xsRegular: 'text-xs font-normal',
	xsMedium: 'text-xs font-medium',
	xsSemibold: 'text-xs font-semibold',
	smRegular: 'text-sm font-normal',
	smMedium: 'text-sm font-medium',
	smSemiBold: 'text-sm font-semibold',
	mdRegular: 'text-md font-normal',
	mdMedium: 'text-md font-medium',
	mdSemiBold: 'text-md font-semibold',
	lgRegular: 'text-lg font-normal',
	lgMedium: 'text-lg font-medium',
	lgSemiBold: 'text-lg font-semibold',
	xlRegular: 'text-xl font-normal',
	xlMedium: 'text-xl font-medium',
	xlSemiBold: 'text-xl font-semibold',
	displayRegular: 'text-2xl font-normal',
	displayMedium: 'text-2xl font-medium',
	displaySemiBold: 'text-2xl font-semibold',
}

interface TypographyProps extends /* @vue-ignore */ HTMLAttributes {
	as?: keyof HTMLElementTagNameMap
	variant?: keyof typeof variants
}

const props = withDefaults(defineProps<TypographyProps>(), {
	as: 'div',
	variant: 'mdRegular',
})

defineOptions({ inheritAttrs: false })
</script>

<template>
	<component :is="props.as" :class="variants[props.variant]" v-bind="$attrs">
		<slot></slot>
	</component>
</template>
