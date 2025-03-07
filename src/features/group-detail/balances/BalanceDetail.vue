<script setup lang="ts">
import type { Bill, Member } from '@/types/entities';
import { computed, ref } from 'vue';
import BillDetailPopup from '../bills/BillDetailPopup.vue';
import BillItem from '../bills/BillItem.vue';
import { useBillsContext } from '../hooks/useBillsContext';

const props = defineProps<{ id: Member['id'] }>();

const bills = useBillsContext();

const detailId = ref<Bill['id'] | null>(null);

const memberBills = computed(() => {
	return bills.value
		.filter((b) => b.members[props.id])
		.map((b) => ({ ...b, amount: b.members[props.id] }));
});
</script>

<template>
	<BillItem
		v-for="bill in memberBills"
		:key="bill.id"
		:bill="bill"
		@view-detail="detailId = bill.id" />

	<BillDetailPopup v-model="detailId" />
</template>
