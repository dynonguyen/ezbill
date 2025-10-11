<script setup lang="ts">
import { createErrorLog, updateGroup } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import { useToast } from '@/hooks/useToast';
import type { Category } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import { toTypedSchema } from '@vee-validate/zod';
import to from 'await-to-js';
import { useForm } from 'vee-validate';
import { ref } from 'vue';
import { z } from 'zod';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';

type CategoryForm = Pick<Category, 'label' | 'color'>;

const COLORS = [
	'#fca5a5',
	'#6ee7b7',
	'#93c5fd',
	'#fbbf24',
	'#c4b5fd',
	'#f9a8d4',
	'#67e8f9',
	'#fdba74',
	'#d8b4fe',
	'#86efac',
	'#60a5fa',
	'#f472b6',
	'#a78bfa',
	'#22d3ee',
	'#fde047',
];

const schema = z.object({ label: z.string().trim().nonempty(), color: z.string().optional() });
const initialValues = ref<CategoryForm>({ label: '', color: COLORS[0] });
const validationSchema = toTypedSchema(schema);
const { handleSubmit, defineField, setValues, resetForm } = useForm<CategoryForm>({
	validationSchema: validationSchema,
	initialValues: initialValues.value,
});

const { group } = useGroupContext();
const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateGroup,
});
const { refetchGroup } = useGroupQueryControl();
const toast = useToast();

const [labelField, labelProps] = defineField('label');
const [colorField] = defineField('color');

const addNewCategory = async (form: CategoryForm) => {
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
		return toast.errorWithRetry('Chỉnh sửa thất bại', () => addNewCategory(form));
	}

	resetForm({ values: { ...initialValues, color: form.color } });
	refetchGroup();
};
const handleAddCategory = handleSubmit(addNewCategory);
</script>

<template>
	<Flex stack class="gap-2" as="form" @submit="handleAddCategory">
		<Flex class="gap-1 justify-around" wrap>
			<Flex
				v-for="color in COLORS"
				:key="color"
				stack
				center
				:style="{ backgroundColor: color }"
				class="size-7 bg-red-500 cursor-pointer rounded-md shrink-0"
				@click="setValues({ color })">
				<span v-if="colorField === color" class="icon msi-check size-3"></span>
			</Flex>
		</Flex>

		<Flex class="gap-2">
			<input
				ref="name"
				type="text"
				class="input input-bordered input-sm w-full"
				placeholder="Tên danh mục"
				v-bind="labelProps"
				v-model="labelField" />
			<Button size="sm" type="submit" :loading="isUpdating">Thêm</Button>
		</Flex>
	</Flex>
</template>
