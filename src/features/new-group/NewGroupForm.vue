<script setup lang="ts">
import { createGroup } from '@/apis/supabase';
import Flex from '@/components/Flex.vue';
import FormControl from '@/components/FormControl.vue';
import type { Group } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import { toTypedSchema } from '@vee-validate/zod';
import to from 'await-to-js';
import { Button, InputText } from 'primevue';
import { useForm } from 'vee-validate';
import { useToast } from 'vue-toastification';
import { z } from 'zod';

const emit = defineEmits<{ close: []; success: [group: Pick<Group, 'id'>] }>();

const MAX = {
	NAME: 512,
};

const schema = z.object({
	name: z.string().trim().nonempty('Bắt buộc').default(''),
});

type GroupForm = z.infer<typeof schema>;

const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, defineField } = useForm<GroupForm>({ validationSchema });

const toast = useToast();

const { isPending, mutateAsync } = useMutation({ mutationFn: createGroup });

const handleAddGroup = handleSubmit(async (form) => {
	const { name } = form;
	const groupId = generateUUID();

	const [error] = await to(mutateAsync({ name, id: groupId }));

	if (error) {
		return toast.error(error?.message || 'Tạo nhóm thất bại');
	}

	emit('success', { id: groupId });
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
				:maxlength="MAX.NAME" />
		</FormControl>

		<Flex class="justify-end gap-2">
			<Button variant="outlined" label="Đóng" @click="$emit('close')" />
			<Button class="min-w-20" type="submit" label="Tạo" :loading="isPending" />
		</Flex>
	</Flex>
</template>
