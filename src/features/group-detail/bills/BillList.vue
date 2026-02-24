<script setup lang="ts">
import Autocomplete, { type AutocompleteOption } from '@/components/ui/Autocomplete.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import { CONTEXT_KEY } from '@/constants/key';
import type { BillId, CategoryId, MemberId } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { debounce } from 'es-toolkit';
import { computed, inject, ref, useTemplateRef, watch } from 'vue';
import CategoryItem from '../category/CategoryItem.vue';
import CategoryList from '../category/CategoryList.vue';
import NewCategory from '../category/NewCategory.vue';
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

const billListParams = inject<{
	sort: { value: { by: 'createdAt' | 'name' | 'amount'; order: 'asc' | 'desc' } };
	filter: {
		value: Partial<{
			keyword: string;
			createdBy: MemberId;
			participant: MemberId;
			paymentStatus: string;
			categoryIds: CategoryId[];
		}>;
	};
	setSort(by: 'createdAt' | 'name' | 'amount', order: 'asc' | 'desc'): void;
	setFilter(
		updates: Partial<{
			keyword?: string;
			createdBy?: MemberId;
			participant?: MemberId;
			paymentStatus?: string;
			categoryIds?: CategoryId[];
		}>,
	): void;
}>(CONTEXT_KEY.BILL_LIST_PARAMS)!;

type SortOption = {
	key: string;
	by: 'createdAt' | 'name' | 'amount';
	order: 'asc' | 'desc';
	label: string;
};
const sortOptions: SortOption[] = [
	{ by: 'createdAt', order: 'desc', label: 'Mới nhất trước', key: 'createdAtdesc' },
	{ by: 'createdAt', order: 'asc', label: 'Cũ nhất trước', key: 'createdAtasc' },
	{ by: 'name', order: 'asc', label: 'Tên sự kiện A-Z', key: 'nameasc' },
	{ by: 'name', order: 'desc', label: 'Tên sự kiện Z-A', key: 'namedesc' },
	{ by: 'amount', order: 'asc', label: 'Tổng tiền thấp đến cao', key: 'amountasc' },
	{ by: 'amount', order: 'desc', label: 'Tổng tiền cao đến thấp', key: 'amountdesc' },
];

const detailId = ref<BillId | null>(null);
const deleteId = ref<BillId | null>(null);
const showSortDialog = ref(false);
const showFilterDialog = ref(false);
const showCategory = ref(false);

const sortKey = computed(() => {
	const { by, order } = billListParams.sort.value;
	return `${by}${order}`;
});

const hasFilter = computed(() => filterCount.value > 0);

const filterCount = computed(() => {
	const f = billListParams.filter.value;
	return [f.keyword, f.createdBy, f.participant, f.paymentStatus, f.categoryIds?.length].filter(
		Boolean,
	).length;
});

const displayedBills = computed(() => bills.value ?? []);

const keywordInput = ref('');
watch(
	() => billListParams.filter.value.keyword,
	(k) => {
		keywordInput.value = k ?? '';
	},
	{ immediate: true },
);

const applyKeywordFilter = () => {
	billListParams.setFilter({ keyword: keywordInput.value.trim() || undefined });
};
const debouncedApplyKeyword = debounce(applyKeywordFilter, 350);

const handleSearchInput = () => {
	debouncedApplyKeyword();
};

const paymentStatusOptions = computed<AutocompleteOption[]>(() => [
	{ label: 'Đã thanh toán', value: 'paid' },
	{ label: 'Chưa thanh toán', value: 'unpaid' },
	{ label: 'Thanh toán một phần', value: 'partiallyPaid' },
]);

const handleResetSearchFilter = () => {
	billListParams.setFilter({});
	keywordInput.value = '';
};

const handleSelectSort = (opt: SortOption) => {
	billListParams.setSort(opt.by, opt.order);
};

const handleFilterCategory = (categoryId: CategoryId) => {
	const ids = billListParams.filter.value.categoryIds ?? [];
	const next = ids.includes(categoryId)
		? ids.filter((id) => id !== categoryId)
		: [...ids, categoryId];
	billListParams.setFilter({ categoryIds: next.length ? next : undefined });
};

const handleResetFilter = (
	field: 'createdBy' | 'participant' | 'paymentStatus' | 'categoryIds',
) => {
	billListParams.setFilter({ [field]: undefined });
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
					v-model="keywordInput"
					placeholder="Tìm kiếm theo tên, mô tả, ngày tạo"
					@input="handleSearchInput" />
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
						{{ filterCount }}
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
				v-if="hasFilter"
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
				v-for="bill in displayedBills"
				:key="bill.id"
				:bill="bill"
				@delete="deleteId = bill.id"
				@view-detail="detailId = bill.id" />

			<BillDetailPopup v-if="detailId" v-model="detailId" />
			<BillDeletePopup v-model="deleteId" />
		</template>
	</Flex>

	<!-- Sort dialog -->
	<Dialog v-model:open="showSortDialog" header="Sắp xếp">
		<Flex stack>
			<Flex
				v-for="opt of sortOptions"
				:key="opt.key"
				class="gap-3 py-2 cursor-pointer"
				@click="handleSelectSort(opt)">
				<input
					:id="`sort-opt-${opt.key}`"
					type="radio"
					name="sort-option"
					class="radio radio-primary"
					:checked="sortKey === opt.key" />
				<Typography class="cursor-pointer grow" as="label" :for="`sort-opt-${opt.key}`">
					{{ opt.label }}
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
				<MemberSelect
					placeholder="Chọn người trả"
					:value="billListParams.filter.value.createdBy"
					@update:value="(v: string | null | undefined) => billListParams.setFilter({ createdBy: v ?? undefined })" />
			</FormControl>

			<FormControl label="Theo người tham gia">
				<template #label>
					<FilterItemReset @click="handleResetFilter('participant')" label="Theo người tham gia" />
				</template>
				<MemberSelect
					placeholder="Chọn thành viên"
					:value="billListParams.filter.value.participant"
					@update:value="(v: string | null | undefined) => billListParams.setFilter({ participant: v ?? undefined })" />
			</FormControl>

			<FormControl v-if="!isAccountantMode" label="Theo trạng thái thanh toán">
				<template #label>
					<FilterItemReset
						@click="handleResetFilter('paymentStatus')"
						label="Theo trạng thái thanh toán" />
				</template>
				<Autocomplete
					:options="paymentStatusOptions"
					:value="billListParams.filter.value.paymentStatus"
					@update:value="(v: string | number | null | undefined) => billListParams.setFilter({ paymentStatus: v != null ? String(v) : undefined })"
					placeholder="Chọn trạng thái" />
			</FormControl>

			<Flex stack class="gap-2" v-if="group.categories?.length">
				<FilterItemReset label="Theo danh mục" @click="handleResetFilter('categoryIds')" />
				<Flex class="gap-2" wrap>
					<CategoryItem
						v-for="category in group.categories"
						:key="category.id"
						:category="category"
						@click="handleFilterCategory(category.id)">
						<template #end v-if="billListParams.filter.value.categoryIds?.includes(category.id)">
							<span class="icon msi-check-rounded size-4 self-center"></span>
						</template>
					</CategoryItem>
				</Flex>
			</Flex>
		</Flex>

		<template #action>
			<Button color="danger" @click="billListParams.setFilter({})">Thiết lập lại</Button>
		</template>
	</Dialog>

	<!-- Category dialog -->
	<Dialog v-model:open="showCategory" header="Danh mục">
		<Flex stack class="gap-4">
			<Flex stack class="gap-1">
				<Typography variant="mdMedium">Thêm danh mục mới</Typography>
				<NewCategory />
			</Flex>
			<div v-if="group.categories?.length" class="max-h-60 overflow-y-auto">
				<CategoryList />
			</div>
		</Flex>
	</Dialog>
</template>
