<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import type { Category } from '@/types/entities';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

export type CategoryFormData = Pick<Category, 'label' | 'color'>;

const props = defineProps<{
	initialValues?: CategoryFormData;
	isSubmitting?: boolean;
	submitLabel: string;
}>();
const emit = defineEmits<{ submit: [form: CategoryFormData] }>();

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
const validationSchema = toTypedSchema(schema);
const { handleSubmit, defineField, setValues, resetForm } = useForm<CategoryFormData>({
	validationSchema: validationSchema,
	initialValues: props.initialValues ?? { label: '', color: COLORS[0] },
});

const [labelField, labelProps] = defineField('label');
const [colorField] = defineField('color');

const handleAddCategory = handleSubmit((form) => emit('submit', form));

export type ExposedCategoryForm = {
	resetForm: typeof resetForm;
};
defineExpose<ExposedCategoryForm>({ resetForm });
</script>

<template>
	<Flex stack class="gap-2" as="form" @submit="handleAddCategory">
		<Flex class="gap-1 justify-around overflow-auto">
			<Flex
				v-for="color in COLORS"
				:key="color"
				stack
				center
				:style="{ backgroundColor: color }"
				class="size-8 bg-red-500 cursor-pointer rounded-md shrink-0"
				@click="setValues({ color })">
				<span v-if="colorField === color" class="icon msi-check size-4"></span>
			</Flex>
		</Flex>

		<Flex class="gap-2">
			<input
				ref="name"
				type="text"
				class="input input-bordered input-sm w-full"
				placeholder="Tên danh mục"
				v-bind="labelProps"
				v-model="labelField"
				autocomplete="off"
				v-desktop-focus />
			<Button size="sm" type="submit" :loading="isSubmitting">{{ submitLabel }}</Button>
			<slot name="action"></slot>
		</Flex>
	</Flex>
</template>
