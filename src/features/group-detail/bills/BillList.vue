<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import { Button } from 'primevue';
import { computed, ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import BillItem from './BillItem.vue';

const bills = useBillsContext();
const showAll = ref(false);

const displayBills = computed(() =>
	(showAll.value ? bills.value : bills.value.slice(0, 4)).sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	),
);
</script>

<template>
	<Flex stack class="gap-4">
		<BillItem v-for="bill in displayBills" :key="bill.id" :bill="bill" />
		<Button
			:label="showAll ? 'Thu gọn' : 'Hiển thị tất cả'"
			variant="outlined"
			class="mx-auto"
			@click="showAll = !showAll" />
	</Flex>
</template>
