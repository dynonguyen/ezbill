<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import { vFocus } from '@/directives/v-focus';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, useId } from 'vue';
import { z } from 'zod';
import AvatarSelect from '../AvatarSelect.vue';

const emit = defineEmits<{ submit: [form: MemberFormData] }>();
const props = defineProps<{ initialValues?: MemberFormData }>();

const nameInputId = useId();

const MAX = { NAME: 512 };

const schema = z.object({
	name: z.string().trim().nonempty('Bắt buộc').default(''),
	avatar: z.string().optional(),
});
export type MemberFormData = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, values, defineField, setFieldValue } = useForm<MemberFormData>({
	validationSchema,
	initialValues: props.initialValues,
});

const openAvatarSelect = ref(false);

const handleAddMember = handleSubmit(async (form) => {
	emit('submit', form);
});

const handleChangeAvatar = (avt: string) => {
	setFieldValue('avatar', avt);
	openAvatarSelect.value = false;
};

const [name, nameProps] = defineField('name');
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddMember">
		<div class="size-20 relative mx-auto cursor-pointer" @click="openAvatarSelect = true">
			<MemberAvatar
				:show-tooltip="false"
				id="_"
				:name="values.name || 'Unknown'"
				:avatar="values.avatar"
				size="full"
				class="size-20 text-2xl" />

			<Flex center class="bg-white p-1 absolute bottom-0 right-0 rounded-full">
				<span class="icon msi-photo-camera-rounded size-4 text-black"></span>
			</Flex>
		</div>

		<FormControl :error="Boolean(errors.name)" :helper-text="errors.name" class="grow w-full">
			<input
				class="input input-bordered w-full"
				placeholder="Nhập tên thành viên"
				:id="nameInputId"
				v-model="name"
				v-bind="nameProps"
				v-focus
				:maxlength="MAX.NAME" />
		</FormControl>

		<slot name="action-btn"></slot>
	</Flex>

	<AvatarSelect v-model:open="openAvatarSelect" @change="handleChangeAvatar" />
</template>
