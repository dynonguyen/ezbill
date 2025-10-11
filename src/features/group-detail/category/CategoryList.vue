<script setup lang="ts">
import { updateGroup } from '@/apis/supabase';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { CategoryId } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';

const { group } = useGroupContext();
const { isPending: isDeleting, mutateAsync: updateGroupAsync } = useMutation({
	mutationFn: updateGroup,
});
const { refetchGroup } = useGroupQueryControl();

const handleDeleteCategory = (id: CategoryId) => {
	if (isDeleting.value) return;

	const newCategories = group.value.categories?.filter((category) => category.id !== id) || [];

	updateGroupAsync({ id: group.value.id, updated: { categories: newCategories } }).then(() => {
		refetchGroup();
	});
};
</script>

<template>
	<Flex v-if="group.categories?.length" class="gap-2" wrap>
		<Flex
			v-for="category in group.categories"
			:key="category.id"
			class="gap-1 px-2 py-1 rounded-lg !items-start"
			:style="{ backgroundColor: category.color }">
			<Typography contenteditable variant="smRegular" class="break-all">
				{{ category.label }}
			</Typography>
			<span
				class="icon msi-close size-5 cursor-pointer hover:opacity-80 shrink-0 mt-0.5"
				@click="handleDeleteCategory(category.id)"></span>
		</Flex>
	</Flex>
</template>
