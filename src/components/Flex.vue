<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

interface FlexProps extends /* @vue-ignore */ HTMLAttributes {
	as?: keyof HTMLElementTagNameMap
	wrap?: boolean
	stack?: boolean
	center?: boolean
}

const props = withDefaults(defineProps<FlexProps>(), {
	wrap: false,
	stack: false,
	center: false,
	as: 'div',
})

defineOptions({ inheritAttrs: false })
</script>

<template>
	<component
		:is="props.as"
		class="flex"
		:class="{
			'flex-wrap': props.wrap,
			'flex-col': props.stack,
			'items-center': !stack && !center,
			'items-center justify-center': props.center,
		}"
		v-bind="$attrs"
	>
		<slot></slot>
	</component>
</template>
