<script lang="ts">
export const sortOptions = [
	{ by: 'updatedAt', order: 'desc', label: 'Cập nhật gần nhất' },
	{ by: 'name', order: 'asc', label: 'Tên A-Z' },
	{ by: 'name', order: 'desc', label: 'Tên Z-A' },
	{ by: 'createdAt', order: 'desc', label: 'Mới nhất trước' },
	{ by: 'createdAt', order: 'asc', label: 'Cũ nhất trước' },
].map((opt) => ({ ...opt, key: `${opt.by}-${opt.order}` })) as SortOption<keyof Group>[];
</script>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { LS_KEY } from '@/constants/key';
import type { SortOption } from '@/types/common';
import type { Group } from '@/types/entities';
import { ref } from 'vue';

const showSortDialog = ref(false);
const sortModel = defineModel<SortOption>();

const handleSortChange = (opt: SortOption) => {
	sortModel.value = opt;
	localStorage.setItem(LS_KEY.RECENT_GROUP_SORT_KEY, opt.key);
};
</script>

<template>
	<Button
		variant="outlined"
		color="primary"
		shape="rounded"
		size="sm"
		class="shrink-0"
		@click="showSortDialog = true">
		<span class="icon other-sort"></span>
	</Button>

	<!-- Sort dialog -->
	<Dialog v-model:open="showSortDialog" header="Sắp xếp">
		<Flex stack>
			<Flex v-for="opt of sortOptions" :key="opt.key" class="gap-3 py-2 cursor-pointer">
				<input
					:id="`sort-opt-${opt.key}`"
					type="radio"
					name="sort-option"
					class="radio radio-primary"
					:value="opt.key"
					:checked="sortModel?.key === opt.key"
					@change="handleSortChange(opt)" />
				<Typography class="cursor-pointer grow" as="label" :for="`sort-opt-${opt.key}`">
					{{ opt.label }}
				</Typography>
			</Flex>
		</Flex>
	</Dialog>
</template>
