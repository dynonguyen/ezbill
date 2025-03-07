<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import type { Bill } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import BillDeletePopup from './BillDeletePopup.vue';
import BillDetailPopup from './BillDetailPopup.vue';
import BillItem from './BillItem.vue';

const bills = useBillsContext();

const detailId = ref<Bill['id'] | null>(null);
const deleteId = ref<Bill['id'] | null>(null);

const getDisplayBills = () => {
	return [...bills.value].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
};
</script>

<template>
	<Flex v-if="!bills.length" center>
		<img :src="getImgUrl('no-bills.svg')" class="size-[300px]" />
	</Flex>
	<template v-else>
		<BillItem
			v-for="bill in getDisplayBills()"
			:key="bill.id"
			:bill="bill"
			@delete="deleteId = bill.id"
			@view-detail="detailId = bill.id" />

		<BillDetailPopup v-model="detailId" />
		<BillDeletePopup v-model="deleteId" />
	</template>
</template>
