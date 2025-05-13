<!-- https://github.com/joserick/v-money-spinner/ -->
<script setup lang="ts">
export type CurrencyInputProps = { options?: object };
import { VMoneySpinner } from '@/components/v-money-spinner/index';

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
	<VMoneySpinner class="currency-input" v-bind="config"></VMoneySpinner>
</template>

<style>
.currency-input {
	& input {
		@apply input input-bordered bg-transparent;
	}
}

.ez-form-control--error {
	& .currency-input input {
		@apply !border-error !outline-error;
	}
}
</style>
