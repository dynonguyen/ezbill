<script setup lang="ts">
import Dialog from '@/components/ui/Dialog.vue';
import JoinGroupForm from './JoinGroupForm.vue';

const open = defineModel<boolean>({ default: false });
</script>

<template>
	<Dialog v-model:open="open" header="Tham gia nhóm">
		<JoinGroupForm v-if="open" @close="open = false" />
		<div v-else class="h-36" />
	</Dialog>
</template>
