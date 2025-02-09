<script setup lang="ts">
import { addMember } from '@/apis/supabase'
import Flex from '@/components/Flex.vue'
import FormControl from '@/components/FormControl.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import Typography from '@/components/Typography.vue'
import { useToast } from '@/hooks/useToast'
import type { Member } from '@/types/entities'
import { generateUUID } from '@/utils/helpers'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import to from 'await-to-js'
import { Button, InputText } from 'primevue'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { z } from 'zod'
import AvatarSelect from '../AvatarSelect.vue'
import { useGroupContext } from '../hooks/useGroupContext'

const emit = defineEmits<{
	success: [member: Member]
}>()

const MAX = {
	NAME: 512,
}

const schema = z.object({
	name: z.string().trim().nonempty('Bắt buộc').default(''),
	avatar: z.string().optional(),
})
type FormData = z.infer<typeof schema>
const validationSchema = toTypedSchema(schema)

const { errors, handleSubmit, values, defineField, setFieldValue } = useForm<FormData>({
	validationSchema,
})
const { mutateAsync } = useMutation({ mutationFn: addMember })

const group = useGroupContext()
const toast = useToast()

const openAvatarSelect = ref(false)

const handleAddMember = handleSubmit(async (form) => {
	const newMember: Member = { id: generateUUID(), ...form }

	const [error] = await to(mutateAsync({ groupId: group.value.id, member: newMember }))

	if (error) {
		return toast.error({ detail: error.message })
	}

	emit('success', newMember)
})

const handleChangeAvatar = (index: string) => {
	setFieldValue('avatar', index)
	openAvatarSelect.value = false
}

const [name, nameProps] = defineField('name')
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
					v-model="name"
					v-bind="nameProps"
					:maxlength="MAX.NAME" />
			</FormControl>
		</Flex>

		<Button type="submit" label="Tham gia" :loading="false" />
	</Flex>

	<AvatarSelect v-model:visible="openAvatarSelect" @change="handleChangeAvatar" />
</template>
