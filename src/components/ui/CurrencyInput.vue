<script setup lang="ts">
import { useCurrencyInput, type CurrencyInputOptions } from 'vue-currency-input';

export type CurrencyInputProps = { options?: Partial<CurrencyInputOptions> };

const props = defineProps<CurrencyInputProps>();

const { inputRef } = useCurrencyInput({
	currency: 'VND',
	locale: 'vi-VN',
	autoDecimalDigits: false,
	precision: 0, // No decimals since VND doesn’t use cents
	accountingSign: false,
	valueRange: { min: 0, max: 100_000_000_000 },
	...props.options,
});
</script>

<template>
	<input ref="inputRef" type="text" class="input input-bordered" />
</template>
