<script setup lang="ts">
import { toVND } from '@/utils/helpers';

defineProps<{
	amount: number;
	amountClass?: string;
	unitClass?: string;
}>();
</script>

<template>
	<div class="flex gap-1 items-end">
		<span :class="amountClass">{{ toVND(amount, {}) }}</span>
		<span :class="unitClass">₫</span>
	</div>
</template>
