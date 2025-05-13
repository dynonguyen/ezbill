<!-- https://github.com/joserick/v-money-spinner/ -->
<script setup lang="ts">
export type CurrencyInputProps = { options?: object };

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
	<v-money-spinner class="currency-input" v-bind="config"></v-money-spinner>
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
