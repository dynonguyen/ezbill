<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { ref } from 'vue';

type SortOption = { key: string; order: 'asc' | 'desc'; label: string };
const sortOptions = [
	{ by: 'updatedAt', order: 'desc', label: 'Cập nhật gần nhất' },
	{ by: 'name', order: 'asc', label: 'Tên Z-A' },
	{ by: 'name', order: 'desc', label: 'Tên A-Z' },
	{ by: 'createdAt', order: 'desc', label: 'Mới nhất trước' },
	{ by: 'createdAt', order: 'asc', label: 'Cũ nhất trước' },
].map((opt) => ({ ...opt, key: `${opt.by}${opt.order}` })) as SortOption[];

const showSortDialog = ref(false);
const sort = ref<SortOption['key']>(sortOptions[0].key);
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
</template>
