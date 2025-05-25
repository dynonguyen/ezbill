<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import { vFocus } from '@/directives/v-focus';
import { veeValidateFocusOnError } from '@/utils/helpers';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

const emit = defineEmits<{ submit: [form: GroupForm] }>();
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
}, veeValidateFocusOnError);

const [name, nameProps] = defineField('name');
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddGroup">
		<FormControl html-for="name" :error="Boolean(errors.name)" :helper-text="errors.name">
			<input
				type="text"
				class="input input-bordered w-full"
				id="name"
				name="name"
				placeholder="Nhập tên nhóm"
				v-model="name"
				v-bind="nameProps"
				v-focus
				:maxlength="MAX.NAME" />
		</FormControl>

		<slot name="form-action"></slot>
	</Flex>
</template>
