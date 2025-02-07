<script setup lang="ts">
import { createGroup } from '@/apis/supabase'
import Flex from '@/components/Flex.vue'
import FormControl from '@/components/FormControl.vue'
import type { Group } from '@/types/entities'
import { generateUUID } from '@/utils/helpers'
import { useMutation } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import to from 'await-to-js'
import { Button, InputText, useToast } from 'primevue'
import { useForm } from 'vee-validate'
import { z } from 'zod'

const emit = defineEmits<{ close: []; success: [group: Pick<Group, 'id'>] }>()

const MAX = {
	NAME: 512,
}

const schema = z.object({
	name: z.string().trim().nonempty('Name is required').default(''),
})

type GroupForm = z.infer<typeof schema>

const validationSchema = toTypedSchema(schema)

const { errors, handleSubmit, defineField } = useForm<GroupForm>({ validationSchema })

const toast = useToast()

const { isPending, mutateAsync } = useMutation({ mutationFn: createGroup })

const handleAddGroup = handleSubmit(async (form) => {
	const { name } = form
	const groupId = generateUUID()

	const [error] = await to(mutateAsync({ name, id: groupId }))

	if (error) {
		return toast.add({
			severity: 'error',
			summary: 'Failed to create group',
			detail: error?.message,
			life: 3000,
		})
	}

	emit('success', { id: groupId })
})

const [name, nameProps] = defineField('name')
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddGroup">
		<FormControl
			html-for="name"
			label="Name"
			:error="Boolean(errors.name)"
			:helper-text="errors.name">
			<InputText
				id="name"
				placeholder="Enter group name"
				v-model="name"
				v-bind="nameProps"
				:maxlength="MAX.NAME" />
		</FormControl>

		<Flex class="justify-end gap-2">
			<Button variant="outlined" label="Close" @click="$emit('close')" />
			<Button type="submit" label="Submit" :loading="isPending" />
		</Flex>
	</Flex>
</template>
