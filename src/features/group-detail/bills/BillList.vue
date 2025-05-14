<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import type { Bill } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { debounce } from '@/utils/helpers';
import { computed, ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import BillDeletePopup from './BillDeletePopup.vue';
import BillDetailPopup from './BillDetailPopup.vue';
import BillItem from './BillItem.vue';

const bills = useBillsContext();

const detailId = ref<Bill['id'] | null>(null);
const deleteId = ref<Bill['id'] | null>(null);
const keyword = ref<string>('');

const displayedBills = computed<Bill[]>(() => {
	const rawBills = [...(bills.value || [])];

	if (keyword.value) {
		console.log(keyword.value);
	}

	return rawBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const handleSearchChange = debounce((ev: Event) => {
	const value = (ev.target as HTMLInputElement).value?.trim();
	keyword.value = value;
}, 350);
</script>

<template>
	<Flex stack class="gap-4">
		<!-- Filter bar -->
		<Flex class="gap-2 justify-between">
			<Flex as="label" class="input input-bordered input-sm gap-2 w-full max-w-80">
				<span class="icon msi-search-rounded size-4 opacity-70"></span>
				<input
					type="text"
					class="grow"
					placeholder="Tìm kiếm theo tên, mô tả"
					@change="handleSearchChange" />
			</Flex>

			<Button shape="rounded" variant="outlined" size="sm" class="shrink-0" color="neutral">
				<span class="icon msi-filter-alt"></span>
			</Button>
		</Flex>

		<!-- List of bill -->
		<Flex v-if="!displayedBills.length" center>
			<img :src="getImgUrl('no-bills.svg')" class="size-[300px]" />
		</Flex>
		<template v-else>
			<BillItem
				v-for="bill in displayedBills"
				:key="bill.id"
				:bill="bill"
				@delete="deleteId = bill.id"
				@view-detail="detailId = bill.id" />

			<BillDetailPopup v-model="detailId" />
			<BillDeletePopup v-model="deleteId" />
		</template>
	</Flex>
</template>
