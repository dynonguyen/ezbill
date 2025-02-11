<script setup lang="ts">
import { Button, Dialog } from 'primevue';
import { defineAsyncComponent, ref } from 'vue';

const NewBillForm = defineAsyncComponent(() => import('./NewBillForm.vue'));

const open = ref(true);
</script>

<template>
	<Button
		v-tooltip.top="'Tạo bill mới'"
		icon="icon msi-add-2-rounded shrink-0 size-5"
		rounded
		size="large"
		class="!size-14"
		@click="open = true" />

	<Dialog
		:draggable="false"
		v-model:visible="open"
		modal
		header="Tạo bill mới"
		class="w-120 max-w-full"
		:pt="{ content: { class: '!p-0' } }">
		<Suspense>
			<NewBillForm v-if="open" @close="open = false" />
		</Suspense>
	</Dialog>
</template>
