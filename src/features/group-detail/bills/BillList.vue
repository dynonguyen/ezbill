<script setup lang="ts">
import Autocomplete, { type AutocompleteOption } from '@/components/ui/Autocomplete.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Bill, BillId, CategoryId, MemberId } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import dayjs from 'dayjs';
import { debounce } from 'es-toolkit';
import { match } from 'ts-pattern';
import { computed, ref, useTemplateRef } from 'vue';
import CategoryItem from '../category/CategoryItem.vue';
import CategoryList from '../category/CategoryList.vue';
import NewCategory from '../category/NewCategory.vue';
import { isAllPaid } from '../helpers/utils';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberSelect from '../MemberSelect.vue';
import BillDeletePopup from './BillDeletePopup.vue';
import BillDetailPopup from './BillDetailPopup.vue';
import BillItem from './BillItem.vue';
import FilterItemReset from './FilterItemReset.vue';

const bills = useBillsContext();
const { group, isAccountantMode } = useGroupContext();
const searchRef = useTemplateRef<HTMLInputElement>('searchRef');

type PaymentStatus = 'paid' | 'unpaid' | 'partiallyPaid';
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

const detailId = ref<BillId | null>(null);
const deleteId = ref<BillId | null>(null);
const keyword = ref<string>('');
const showSortDialog = ref(false);
const showFilterDialog = ref(false);
const filter = ref<
	Partial<{
		createdBy: MemberId;
		participant: MemberId;
		paymentStatus: PaymentStatus;
		categories: Set<CategoryId>;
	}>
>({});
const sort = ref<SortOption['key']>(sortOptions[0].key);
const isViewAll = ref(false);
const showCategory = ref(false);

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
				const { createdBy, participant, paymentStatus } = filter.value;

				if (createdBy) {
					result.push(bill.createdBy === createdBy);
				}

				if (participant) {
					result.push(Boolean(bill.members[participant]));
				}

				if (paymentStatus) {
					result.push(
						match(paymentStatus)
							.with('paid', () => isAllPaid(bill))
							.with('unpaid', () => bill.paymentTracking.length === 0)
							.with('partiallyPaid', () => bill.paymentTracking.length > 0 && !isAllPaid(bill))
							.otherwise(() => true),
					);
				}

				if (filter.value.categories?.size) {
					if (!bill.categoryIds?.length) return false;
					result.push(bill.categoryIds.some((id) => filter.value.categories?.has(id)));
				}
			}

			return result.every((r) => r);
		});

		return sortBills(filtered);
	}

	return sortBills(bills.value);
});

const paymentStatusOptions = computed<AutocompleteOption[]>(() => {
	return [
		{ label: 'Đã thanh toán', value: 'paid' },
		{ label: 'Chưa thanh toán', value: 'unpaid' },
		{ label: 'Thanh toán một phần', value: 'partiallyPaid' },
	];
});

const handleSearchChange = debounce((ev: Event) => {
	keyword.value = (ev.target as HTMLInputElement).value?.trim();
}, 350);

const handleResetSearchFilter = () => {
	keyword.value = '';
	filter.value = {};
	if (searchRef.value) searchRef.value.value = '';
};

const handleFilterCategory = (categoryId: CategoryId) => {
	filter.value.categories = filter.value.categories || new Set();
	if (filter.value.categories.has(categoryId)) {
		filter.value.categories.delete(categoryId);
		filter.value.categories.size === 0 && handleResetFilter('categories');
	} else {
		filter.value.categories.add(categoryId);
	}
};

const handleResetFilter = (field: keyof typeof filter.value) => {
	delete filter.value[field];
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
					<span class="icon other-filter"></span>
					<Flex
						v-if="hasFilter"
						center
						class="size-4 rounded-full bg-secondary text-[8px] text-white">
						{{ Object.keys(filter).length }}
					</Flex>
				</Button>

				<Button
					variant="soft"
					color="grey"
					shape="rounded"
					size="sm"
					class="shrink-0"
					@click="showCategory = true">
					<span class="icon msi-category-outline-rounded"></span>
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

			<BillDetailPopup v-if="detailId" v-model="detailId" />
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
					<FilterItemReset @click="handleResetFilter('createdBy')" label="Theo người trả" />
				</template>
				<MemberSelect placeholder="Chọn người trả" v-model:value="filter.createdBy!" />
			</FormControl>

			<FormControl label="Theo người tham gia">
				<template #label>
					<FilterItemReset @click="handleResetFilter('participant')" label="Theo người tham gia" />
				</template>
				<MemberSelect placeholder="Chọn thành viên" v-model:value="filter.participant!" />
			</FormControl>

			<FormControl v-if="!isAccountantMode" label="Theo trạng thái thanh toán">
				<template #label>
					<FilterItemReset
						@click="handleResetFilter('paymentStatus')"
						label="Theo trạng thái thanh toán" />
				</template>
				<Autocomplete
					:options="paymentStatusOptions"
					v-model:value="filter.paymentStatus"
					placeholder="Chọn trạng thái" />
			</FormControl>

			<Flex stack class="gap-2" v-if="group.categories?.length">
				<FilterItemReset label="Theo danh mục" @click="handleResetFilter('categories')" />
				<Flex class="gap-2" wrap>
					<CategoryItem
						v-for="category in group.categories"
						:key="category.id"
						:category="category"
						@click="handleFilterCategory(category.id)">
						<template #end v-if="filter.categories?.has(category.id)">
							<span class="icon msi-check-rounded size-4 self-center"></span>
						</template>
					</CategoryItem>
				</Flex>
			</Flex>
		</Flex>

		<template #action>
			<Button color="danger" @click="filter = {}">Thiết lập lại</Button>
		</template>
	</Dialog>

	<!-- Category dialog -->
	<Dialog v-model:open="showCategory" header="Danh mục">
		<Flex stack class="gap-4">
			<Flex stack class="gap-1">
				<Typography variant="mdMedium">Thêm danh mục mới</Typography>
				<NewCategory :group-id="group.id" />
			</Flex>
			<div v-if="group.categories?.length" class="max-h-60 overflow-y-auto">
				<CategoryList />
			</div>
		</Flex>
	</Dialog>
</template>
