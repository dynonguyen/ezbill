<script setup lang="ts">
import type { ApiCreateCategoryReq } from '@/apis/api-client';
import { useApiClient } from '@/hooks/useApiClient';
import { useToast } from '@/hooks/useToast';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupDetailQueryControl } from '../hooks/useGroupDetailQueryControl';
import CategoryForm, { type CategoryFormData, type ExposedCategoryForm } from './CategoryForm.vue';

const apiClient = useApiClient();
const { group } = useGroupContext();
const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: (req: ApiCreateCategoryReq) => apiClient.createCategory(group.value.id, req),
});
const { refetchGroup } = useGroupDetailQueryControl();
const toast = useToast();
const formRef = ref<ExposedCategoryForm>();

const handleAddNewCategory = async (form: CategoryFormData) => {
	const [error] = await to(updateMutateAsync({ label: form.label, color: form.color }));

	if (error) {
		void apiClient.createErrorLog({ error: error?.message });
		return toast.errorWithRetry('Thêm danh mục thất bại', () => handleAddNewCategory(form));
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
