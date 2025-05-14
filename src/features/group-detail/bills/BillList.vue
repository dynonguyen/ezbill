<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import type { Bill } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { debounce } from '@/utils/helpers';
import { computed, ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import MemberSelect from '../MemberSelect.vue';
import BillDeletePopup from './BillDeletePopup.vue';
import BillDetailPopup from './BillDetailPopup.vue';
import BillItem from './BillItem.vue';

const bills = useBillsContext();

const detailId = ref<Bill['id'] | null>(null);
const deleteId = ref<Bill['id'] | null>(null);
const keyword = ref<string>('');
const showFilterDialog = ref(false);
const filter = ref<{ createdBy?: Bill['createdBy'] }>({});

const displayedBills = computed<Bill[]>(() => {
	const rawBills = [...(bills.value || [])];

	if (keyword.value) {
		const kw = keyword.value.toLowerCase();

		return rawBills.filter((bill) => {
			const { name, note } = bill;
			return name.toLowerCase().includes(kw) || note?.toLowerCase().includes(kw);
		});
	}

	return rawBills.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const handleSearchChange = debounce((ev: Event) => {
	keyword.value = (ev.target as HTMLInputElement).value?.trim();
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
					@input="handleSearchChange" />
			</Flex>

			<Button
				shape="rounded"
				variant="outlined"
				size="sm"
				class="shrink-0"
				color="neutral"
				@click="showFilterDialog = true">
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

	<!-- Filter dialog -->
	<Dialog v-model:open="showFilterDialog" header="Bộ lọc">
		<FormControl label="Theo người trả">
			<MemberSelect placeholder="Chọn người trả" v-model:value="filter.createdBy!" />
		</FormControl>

		<template #action>
			<Flex class="gap-4" items-fluid>
				<Button variant="soft" color="grey" @click="showFilterDialog = false">Đóng</Button>
				<Button color="danger" @click="filter = {}">Đặt lại</Button>
			</Flex>
		</template>
	</Dialog>
</template>
