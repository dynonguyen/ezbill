<script setup lang="ts">
import Dialog from '@/components/ui/Dialog.vue';
import { defineAsyncComponent } from 'vue';

const JoinGroupForm = defineAsyncComponent(() => import('./JoinGroupForm.vue'));

const open = defineModel<boolean>({ default: false });
</script>

<template>
	<Dialog v-model:open="open" header="Tham gia nhóm">
		<Suspense>
			<JoinGroupForm v-if="open" @close="open = false" />
			<div v-else class="h-36" />
		</Suspense>
	</Dialog>
</template>
