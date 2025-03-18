<script setup lang="ts">
import Typography from '@/components/ui/Typography.vue';
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
	<template v-if="memberBills.length">
		<BillItem
			v-for="bill in memberBills"
			:key="bill.id"
			:bill="bill"
			@view-detail="detailId = bill.id" />

		<BillDetailPopup v-model="detailId" />
	</template>
	<template v-else>
		<Typography class="text-center text-gray-500">Thành viên này có hoá đơn nào</Typography>
	</template>
</template>
