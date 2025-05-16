<!-- https://github.com/joserick/v-money-spinner/ -->
<script setup lang="ts">
import { VMoneySpinner } from '@/components/v-money-spinner';
import type { InputHTMLAttributes } from 'vue';

export type CurrencyInputProps = {
	options?: object;
	inputProps?: InputHTMLAttributes;
};

const props = defineProps<CurrencyInputProps>();

const config = {
	spinner: false,
	min: 0,
	max: 1000_000_000_000,
	suffix: ' ₫',
	precision: 0,
	decimal: ',',
	thousands: '.',
	template: '',
	masked: false,
	disableNegative: true,
	align: 'left',
	step: 1000,
	allowBlank: true,
	...props.options,
};
</script>

<template>
	<VMoneySpinner
		:pt="{
			input: {
				...inputProps,
				class: `input input-bordered bg-transparent ${inputProps?.class ? ' ' + inputProps.class : ''}`,
			},
		}"
		v-bind="config"></VMoneySpinner>
</template>
