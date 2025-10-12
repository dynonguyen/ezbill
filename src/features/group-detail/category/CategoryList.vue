<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import type { CategoryId } from '@/types/entities';
import { computed } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import CategoryItem from './CategoryItem.vue';

const { group } = useGroupContext();
const bills = useBillsContext();

const countBillMap = computed<Record<CategoryId, number>>(() => {
	return bills.value.reduce(
		(acc, bill) => {
			bill.categoryIds?.forEach((id) => {
				acc[id] = (acc[id] ?? 0) + 1;
			});
			return acc;
		},
		{} as Record<CategoryId, number>,
	);
});
</script>

<template>
	<Flex v-if="group.categories?.length" class="gap-2" wrap>
		<CategoryItem
			v-for="category in group.categories"
			:key="category.id"
			:category="category"
			:bill-count="countBillMap[category.id] ?? 0"
			editable />
	</Flex>
</template>
