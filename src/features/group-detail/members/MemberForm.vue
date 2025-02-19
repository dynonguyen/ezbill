<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import FormControl from '@/components/FormControl.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import { toTypedSchema } from '@vee-validate/zod';
import { InputText } from 'primevue';
import { useForm } from 'vee-validate';
import { onMounted, ref, useId } from 'vue';
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

onMounted(() => document.getElementById(nameInputId)?.focus());
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddMember">
		<Flex class="gap-3 items-start">
			<Flex stack center class="gap-1">
				<div v-tooltip="'Thay đổi ảnh đại diện'">
					<MemberAvatar
						:show-tooltip="false"
						id="_"
						:name="values.name || 'Unknown'"
						:avatar="values.avatar"
						class="!size-11 shrink-0 cursor-pointer"
						@click="openAvatarSelect = true" />
				</div>

				<Typography
					v-if="values.avatar"
					variant="xsMedium"
					class="text-gray-500 cursor-pointer hover:text-error"
					@click="setFieldValue('avatar', undefined)">
					Xoá
				</Typography>
			</Flex>

			<FormControl :error="Boolean(errors.name)" :helper-text="errors.name" class="grow w-full">
				<InputText
					placeholder="Nhập tên của bạn"
					fluid
					:id="nameInputId"
					v-model="name"
					v-bind="nameProps"
					autofocus
					:maxlength="MAX.NAME" />
			</FormControl>

			<slot name="right-submit-btn"></slot>
		</Flex>

		<slot name="bottom-submit-btn"></slot>
	</Flex>

	<AvatarSelect v-model:visible="openAvatarSelect" @change="handleChangeAvatar" />
</template>
