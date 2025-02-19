<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import FormControl from '@/components/FormControl.vue';
import { toTypedSchema } from '@vee-validate/zod';
import { Button, InputText } from 'primevue';
import { useForm } from 'vee-validate';
import { z } from 'zod';

const emit = defineEmits<{ close: []; submit: [form: GroupForm] }>();
const props = defineProps<{ initialValues?: GroupForm }>();

const MAX = {
	NAME: 512,
};

const schema = z.object({
	name: z.string().trim().nonempty('Bắt buộc').default(''),
});

type GroupForm = z.infer<typeof schema>;

const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, defineField } = useForm<GroupForm>({
	validationSchema,
	initialValues: props.initialValues,
});

const handleAddGroup = handleSubmit(async (form) => {
	emit('submit', form);
});

const [name, nameProps] = defineField('name');
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddGroup">
		<FormControl
			html-for="name"
			label="Tên nhóm"
			:error="Boolean(errors.name)"
			:helper-text="errors.name">
			<InputText
				id="name"
				placeholder="Nhập tên nhóm"
				v-model="name"
				v-bind="nameProps"
				autofocus
				:maxlength="MAX.NAME" />
		</FormControl>

		<Flex class="justify-end gap-2">
			<Button variant="outlined" label="Đóng" @click="$emit('close')" />
			<slot name="submit-btn"></slot>
		</Flex>
	</Flex>
</template>
