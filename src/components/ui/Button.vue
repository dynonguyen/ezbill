<script setup lang="ts">
type ButtonProps = {
	variant?: 'contained' | 'outlined' | 'soft' | 'text' | 'link';
	shape?: 'rounded' | 'pill' | 'circle' | 'square';
	color?:
		| 'primary'
		| 'secondary'
		| 'info'
		| 'accent'
		| 'neutral'
		| 'danger'
		| 'success'
		| 'warning'
		| 'grey';
	size?: 'xs' | 'sm' | 'md' | 'lg';
	disabled?: boolean;
	loading?: boolean;
	startIcon?: string;
	endIcon?: string;
};

withDefaults(defineProps<ButtonProps>(), {
	variant: 'contained',
	shape: 'rounded',
	size: 'md',
	color: 'primary',
});

defineOptions({ inheritAttrs: false });

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
	contained: 'btn-primary',
	outlined: 'btn-outline',
	text: 'btn-ghost',
	link: 'btn-link',
	soft: '', // DaisyUI default
};

const shapes: Record<NonNullable<ButtonProps['shape']>, string> = {
	rounded: '', // DaisyUI default
	pill: 'rounded-full',
	circle: 'btn-circle',
	square: 'btn-square',
};

const colors: Record<NonNullable<ButtonProps['color']>, string> = {
	primary: 'btn-primary',
	secondary: 'btn-secondary',
	danger: 'btn-error',
	success: 'btn-success',
	warning: 'btn-warning',
	info: 'btn-info',
	accent: 'btn-accent',
	neutral: 'btn-neutral',
	grey: '',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
	xs: 'btn-xs',
	sm: 'btn-sm',
	md: 'btn-md',
	lg: 'btn-lg',
};

const iconSizes: Record<NonNullable<ButtonProps['size']>, string> = {
	xs: 'size-4',
	sm: 'size-4',
	md: 'size-5',
	lg: 'size-6',
};
</script>

<template>
	<button
		class="btn"
		:class="[variants[variant!], shapes[shape!], colors[color!], sizes[size!]]"
		:disabled="disabled || loading"
		type="button"
		v-bind="$attrs">
		<span v-if="loading" class="loading loading-spinner" :class="iconSizes[size!]"></span>

		<span v-if="startIcon && !loading" :class="['icon', iconSizes[size!], startIcon]"></span>

		<slot></slot>

		<span v-if="endIcon && !loading" :class="['icon', iconSizes[size!], endIcon]"></span>
	</button>
</template>

<style>
.btn-md {
	@apply text-sm font-normal py-3.5 px-4;
}
</style>
