<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import { Button, InputText } from 'primevue'
</script>

<template>
	<Flex class="gap-4">
		<InputText autofocus placeholder="Enter group id or invite link" fluid />
		<Button class="shrink-0">Join group</Button>
	</Flex>
</template>
