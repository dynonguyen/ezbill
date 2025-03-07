<script setup lang="ts">
import { toVND } from '@/utils/helpers';

defineProps<{
	amount: number;
	amountClass?: string;
	unitClass?: string;
	showSign?: boolean;
}>();
</script>

<template>
	<div class="flex gap-1 items-end">
		<span :class="amountClass">
			{{ (showSign ? (amount > 0 ? '+' : '') : '') + toVND(amount, {}) }}
		</span>
		<span :class="unitClass">₫</span>
	</div>
</template>
