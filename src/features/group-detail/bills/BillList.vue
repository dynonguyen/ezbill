<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Bill, Member } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { debounce } from '@/utils/helpers';
import dayjs from 'dayjs';
import { match } from 'ts-pattern';
import { computed, ref, useTemplateRef } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import MemberSelect from '../MemberSelect.vue';
import BillDeletePopup from './BillDeletePopup.vue';
import BillDetailPopup from './BillDetailPopup.vue';
import BillItem from './BillItem.vue';
import FilterItemReset from './FilterItemReset.vue';

const bills = useBillsContext();

type SortOption = { key: string; by: keyof Bill; order: 'asc' | 'desc'; label: string };
const sortOptions = [
	{ by: 'createdAt', order: 'desc', label: 'Mới nhất trước' },
	{ by: 'createdAt', order: 'asc', label: 'Cũ nhất trước' },
	{ by: 'name', order: 'asc', label: 'Tên sự kiện A-Z' },
	{ by: 'name', order: 'desc', label: 'Tên sự kiện Z-A' },
	{ by: 'amount', order: 'asc', label: 'Tổng tiền thấp đến cao' },
	{ by: 'amount', order: 'desc', label: 'Tổng tiền cao đến thấp' },
].map((opt) => ({ ...opt, key: `${opt.by}${opt.order}` })) as SortOption[];
const FIRST_VIEW_LIMIT = 10;

const detailId = ref<Bill['id'] | null>(null);
const deleteId = ref<Bill['id'] | null>(null);
const keyword = ref<string>('');
const showSortDialog = ref(false);
const showFilterDialog = ref(false);
const filter = ref<{ createdBy?: Member['id']; participant?: Member['id'] }>({});
const searchRef = useTemplateRef<HTMLInputElement>('searchRef');
const sort = ref<SortOption['key']>(sortOptions[0].key);
const isViewAll = ref(false);

const hasFilter = computed(() => Object.keys(filter.value).length > 0);

const sortBills = (bills: Bill[]) => {
	const { by, order } = sortOptions.find((opt) => opt.key === sort.value) || sortOptions[0];

	const compareFn = match([by, order])
		.returnType<(a: Bill, b: Bill) => number>()
		.with(
			['createdAt', 'desc'],
			() => (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		)
		.with(
			['createdAt', 'asc'],
			() => (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		)
		.with(['name', 'asc'], () => (a, b) => a.name.localeCompare(b.name))
		.with(['name', 'desc'], () => (a, b) => b.name.localeCompare(a.name))
		.with(['amount', 'asc'], () => (a, b) => a.amount - b.amount)
		.with(['amount', 'desc'], () => (a, b) => b.amount - a.amount)
		.otherwise(() => () => 0);

	return [...bills].sort(compareFn);
};

const sliceBills = (bills: Bill[]) => {
	if (isViewAll.value) return bills;
	return bills.slice(0, FIRST_VIEW_LIMIT);
};

const displayedBills = computed<Bill[]>(() => {
	if (keyword.value || hasFilter.value) {
		const filtered = [...(bills.value || [])].filter((bill) => {
			const result: boolean[] = [];

			if (keyword.value) {
				const query = keyword.value.toLowerCase();
				result.push(
					Boolean(
						bill.name.toLowerCase().includes(query) ||
							bill.note?.toLowerCase().includes(query) ||
							dayjs(bill.createdAt).format('DD/MM/YYYY HH:mm').includes(query),
					),
				);
			}

			if (hasFilter.value) {
				const { createdBy, participant } = filter.value;

				if (createdBy) {
					result.push(bill.createdBy === createdBy);
				}

				if (participant) {
					result.push(Boolean(bill.members[participant]));
				}
			}

			return result.every((r) => r);
		});

		return sortBills(filtered);
	}

	return sortBills(bills.value);
});

const handleSearchChange = debounce((ev: Event) => {
	keyword.value = (ev.target as HTMLInputElement).value?.trim();
}, 350);

const handleResetSearchFilter = () => {
	keyword.value = '';
	filter.value = {};
	if (searchRef.value) searchRef.value.value = '';
};
</script>

<template>
	<Flex stack class="gap-4">
		<!-- Filter bar -->
		<Flex class="gap-2 justify-between">
			<Flex as="label" class="input input-bordered input-sm gap-2 w-full max-w-80">
				<span class="icon msi-search-rounded size-4 opacity-70"></span>
				<input
					ref="searchRef"
					type="text"
					class="grow"
					placeholder="Tìm kiếm theo tên, mô tả, ngày tạo"
					@input="handleSearchChange" />
			</Flex>

			<Flex class="gap-2 shrink-0">
				<Button
					variant="soft"
					color="grey"
					shape="rounded"
					size="sm"
					class="shrink-0"
					@click="showSortDialog = true">
					<span class="icon other-sort"></span>
				</Button>

				<Button
					variant="soft"
					color="grey"
					shape="rounded"
					size="sm"
					class="shrink-0 gap-1"
					@click="showFilterDialog = true">
					<span class="icon msi-filter-alt"></span>
					<Flex
						v-if="hasFilter"
						center
						class="size-4 rounded-full bg-secondary text-[8px] text-white">
						{{ Object.keys(filter).length }}
					</Flex>
				</Button>
			</Flex>
		</Flex>

		<!-- List of bill -->
		<Flex v-if="!displayedBills.length" center stack class="gap-4">
			<img :src="getImgUrl('no-bills.svg')" class="size-[300px]" />
			<Button
				v-if="keyword || hasFilter"
				size="sm"
				variant="outlined"
				color="neutral"
				@click="handleResetSearchFilter">
				<span class="icon msi-filter-alt-off"></span>
				Đặt lại bộ lọc và tìm kiếm
			</Button>
		</Flex>
		<template v-else>
			<BillItem
				v-for="bill in sliceBills(displayedBills)"
				:key="bill.id"
				:bill="bill"
				@delete="deleteId = bill.id"
				@view-detail="detailId = bill.id" />

			<Flex class="py-2 justify-end" v-if="displayedBills.length > FIRST_VIEW_LIMIT">
				<Button size="sm" variant="outlined" color="neutral" @click="isViewAll = !isViewAll">
					<span>{{ isViewAll ? 'Thu gọn' : 'Xem tất cả' }}</span>
					<span
						:class="`icon ${isViewAll ? 'msi-keyboard-arrow-up-rounded' : 'msi-keyboard-arrow-down-rounded'}`"></span>
				</Button>
			</Flex>

			<BillDetailPopup v-model="detailId" />
			<BillDeletePopup v-model="deleteId" />
		</template>
	</Flex>

	<!-- Sort dialog -->
	<Dialog v-model:open="showSortDialog" header="Sắp xếp">
		<Flex stack>
			<Flex v-for="{ key, label } of sortOptions" :key="key" class="gap-3 py-2 cursor-pointer">
				<input
					:id="`sort-opt-${key}`"
					type="radio"
					name="sort-option"
					class="radio radio-primary"
					:value="key"
					v-model="sort"
					:checked="sort === key" />
				<Typography class="cursor-pointer grow" as="label" :for="`sort-opt-${key}`">
					{{ label }}
				</Typography>
			</Flex>
		</Flex>
	</Dialog>

	<!-- Filter dialog -->
	<Dialog v-model:open="showFilterDialog" header="Bộ lọc">
		<Flex stack class="gap-4">
			<FormControl label="Theo người trả">
				<template #label>
					<FilterItemReset @click="delete filter.createdBy" label="Theo người trả" />
				</template>
				<MemberSelect placeholder="Chọn người trả" v-model:value="filter.createdBy!" />
			</FormControl>

			<FormControl label="Theo người tham gia">
				<template #label>
					<FilterItemReset @click="delete filter.participant" label="Theo người tham gia" />
				</template>
				<MemberSelect placeholder="Chọn thành viên" v-model:value="filter.participant!" />
			</FormControl>
		</Flex>

		<template #action>
			<Button color="danger" @click="filter = {}">Thiết lập lại</Button>
		</template>
	</Dialog>
</template>
