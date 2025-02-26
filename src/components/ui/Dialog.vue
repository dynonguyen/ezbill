<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type HTMLAttributes } from 'vue';
import Flex from './Flex.vue';
import Typography from './Typography.vue';

defineProps<{ header?: string; pt?: { body?: HTMLAttributes } }>();

const emit = defineEmits<{ close: [] }>();
const open = defineModel<boolean>('open');

const dialog = ref<HTMLDialogElement | null>(null);

watch(
	[open, dialog],
	() => {
		if (!dialog.value) return;

		if (open.value && !dialog.value.open) return dialog.value.showModal();
		if (!open.value && dialog.value.open) return dialog.value.close();
	},
	{ immediate: true },
);

const handleDialogClose = () => {
	open.value = false;
	emit('close');
};

const handleDialogClick = (ev: MouseEvent) => {
	if (ev.target === dialog.value) handleDialogClose();
};

onMounted(() => {
	dialog.value?.addEventListener('click', handleDialogClick);
	dialog.value?.addEventListener('close', handleDialogClose);
});

onUnmounted(() => {
	dialog.value?.removeEventListener('click', handleDialogClick);
	dialog.value?.removeEventListener('close', handleDialogClose);
});
</script>

<template>
	<dialog ref="dialog" class="modal">
		<div v-if="open" class="modal-box dialog">
			<Flex stack class="max-h-[80vh] overflow-hidden py-4">
				<slot name="header">
					<Typography v-if="header" variant="displaySemiBold" class="px-4 text-center">
						{{ header }}
					</Typography>
				</slot>

				<div
					class="grow overflow-auto px-4"
					:class="{ 'pt-4': $slots.header || header, 'pb-4': $slots.action }"
					v-bind="pt?.body">
					<slot></slot>
				</div>

				<div v-if="$slots.action" class="px-4">
					<slot name="action"></slot>
				</div>
			</Flex>
		</div>
	</dialog>
</template>

<style>
.modal {
	@apply transition-none duration-0;
	scrollbar-color: none;
}

.modal-box.dialog {
	@apply rounded-2xl bg-white shadow-2xl p-0 border border-base-200 w-full max-w-[calc(100vw-32px)] sm:max-w-[480px];
}
</style>
