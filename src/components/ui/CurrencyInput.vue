<script setup lang="ts">
import { useCurrencyInput, type CurrencyInputOptions } from 'vue-currency-input';

const props = withDefaults(defineProps<{ options?: CurrencyInputOptions }>(), {
	options: {
		currency: 'VND',
		locale: 'vi-VN',
		autoDecimalDigits: false,
		precision: 0, // No decimals since VND doesn’t use cents
		distractionFree: false,
		accountingSign: false,
	} as CurrencyInputOptions,
});
const { inputRef } = useCurrencyInput(props.options);

defineOptions({ inheritAttrs: false });
</script>

<template>
	<input ref="inputRef" type="text" />
</template>
