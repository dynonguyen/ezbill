<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import { Button, InputText } from 'primevue'

// const input = useTemplateRef<HTMLInputElement>('invite-link')

const handleJoinGroup = () => {
	// const value = input.value
}
</script>

<template>
	<Flex class="gap-4">
		<InputText ref="invite-link" autofocus placeholder="Enter group id or invite link" fluid />
		<Button class="shrink-0" @click="handleJoinGroup">Join group</Button>
	</Flex>
</template>
