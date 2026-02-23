<script setup lang="ts">
import { computed, watch } from 'vue';
import Button from './ui/Button.vue';
import Flex from './ui/Flex.vue';

type PaginationProps = {
	total: number;
	limit: number;
	page: number;
};

const props = defineProps<PaginationProps>();

const emit = defineEmits<{
	(e: 'update:page', value: number): void;
}>();

const totalPages = computed(() => {
	if (!props.limit) return 1;
	const p = Math.ceil(props.total / props.limit);
	return p > 0 ? p : 1;
});

const displayPages = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1));

watch(
	() => [props.page, totalPages.value],
	([page, pages]) => {
		const safe = Math.max(1, Math.min(Number(page), Number(pages)));
		if (safe !== page) emit('update:page', safe);
	},
	{ immediate: true },
);

function handleClick(pageNumber: number) {
	if (pageNumber === props.page) return;
	emit('update:page', pageNumber);
}
</script>

<template>
	<div class="min-h-10 flex items-center justify-center">
		<Flex wrap class="gap-2 justify-center">
			<Button
				v-for="pageNumber of displayPages"
				:key="pageNumber"
				:variant="pageNumber === page ? 'contained' : 'text'"
				:color="pageNumber === page ? 'primary' : 'neutral'"
				size="md"
				shape="circle"
				@click="handleClick(pageNumber)">
				{{ pageNumber }}
			</Button>
		</Flex>
	</div>
</template>
