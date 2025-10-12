<script setup lang="ts">
import { createErrorLog, updateGroup } from '@/apis/supabase';
import { useToast } from '@/hooks/useToast';
import type { Category } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import CategoryForm, { type CategoryFormData, type ExposedCategoryForm } from './CategoryForm.vue';

const { group } = useGroupContext();
const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateGroup,
});
const { refetchGroup } = useGroupQueryControl();
const toast = useToast();
const formRef = ref<ExposedCategoryForm>();

const handleAddNewCategory = async (form: CategoryFormData) => {
	const now = new Date();
	const newCategories: Category[] = [
		{ ...form, id: generateUUID(), createdAt: now.toISOString() },
		...(group.value.categories ?? []),
	];

	const [error] = await to(
		updateMutateAsync({
			updated: { categories: newCategories },
			id: group.value.id,
		}),
	);

	if (error) {
		void createErrorLog({ error: error?.message });
		return toast.errorWithRetry('Chỉnh sửa thất bại', () => handleAddNewCategory(form));
	}

	formRef.value?.resetForm({ values: { label: '', color: form.color } }); // reset but keep color
	refetchGroup();
};
</script>

<template>
	<CategoryForm
		ref="formRef"
		@submit="handleAddNewCategory"
		:is-submitting="isUpdating"
		submit-label="Thêm" />
</template>
