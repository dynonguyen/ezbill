<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import { PATH } from '@/constants/path'
import { getEnv } from '@/utils/get-env'
import { Button, InputText, useToast } from 'primevue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const inviteLink = ref('')
const router = useRouter()
const toast = useToast()

const handleJoinGroup = async () => {
	const linkOrId = inviteLink.value.trim()
	if (!linkOrId) return

	const baseUrl = getEnv('VITE_BASE_URL')

	if (linkOrId.startsWith(baseUrl)) {
		const isValid = linkOrId.includes(`${baseUrl}${PATH.GROUP.replace(':id', '')}`)
		if (!isValid) {
			toast.add({
				severity: 'error',
				summary: 'Invalid link',
				detail: 'Please enter a valid group invite link',
			})
			return
		}

		router.push(`${linkOrId.replace(baseUrl, '')}`)
	} else {
		router.push(`${PATH.GROUP.replace(':id', linkOrId)}`)
	}
}
</script>

<template>
	<Flex class="gap-4">
		<InputText v-model="inviteLink" autofocus placeholder="Enter group id or invite link" fluid />
		<Button class="shrink-0" @click="handleJoinGroup">Join group</Button>
	</Flex>
</template>
