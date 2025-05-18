<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';

defineProps<{ amount: number }>();
</script>

<template>
	<CurrencyText :amount="amount" class="text-slate-600 h-10 !items-center" />
</template>
