<script setup lang="ts">
export type FlexProps = {
	as?: keyof HTMLElementTagNameMap;
	wrap?: boolean;
	stack?: boolean;
	center?: boolean;
	itemsFluid?: boolean;
};

withDefaults(defineProps<FlexProps>(), {
	wrap: false,
	stack: false,
	center: false,
	as: 'div',
});
defineOptions({ inheritAttrs: false });
</script>

<template>
	<component
		:is="as"
		class="flex"
		:class="{
			'flex-wrap': wrap,
			'flex-col': stack,
			'items-center': !stack && !center,
			'items-center justify-center': center,
			'justify-evenly [&>*]:flex-1': itemsFluid,
		}"
		v-bind="$attrs">
		<slot></slot>
	</component>
</template>
