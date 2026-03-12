<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import type { CategoryId } from '@/types/entities';
import { computed } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupStatsContext } from '../hooks/useGroupStatsContext';
import CategoryItem from './CategoryItem.vue';

const { group } = useGroupContext();
const groupStats = useGroupStatsContext();

const countBillMap = computed<Record<CategoryId, number>>(() => {
	return groupStats.value?.categoryBillCounts ?? {};
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
