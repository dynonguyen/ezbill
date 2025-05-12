<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { computed, useTemplateRef, type HTMLAttributes } from 'vue';
import Flex from './Flex.vue';
import Typography from './Typography.vue';

defineProps<{ header?: string; pt?: { body?: HTMLAttributes } }>();

const emit = defineEmits<{ close: [] }>();
const open = defineModel<boolean>('open');
const outsideClickTarget = useTemplateRef<HTMLElement>('target');

const handleDialogClose = () => {
	open.value = false;
	emit('close');
};

const nDialog = computed(() => {
	if (open.value) return document.querySelectorAll('.dialog').length || 0;

	return 0;
});

onClickOutside(outsideClickTarget, (ev) => {
	const index = Number((ev.target as HTMLElement)?.getAttribute('data-modal-index'));
	if (index === nDialog.value + 1) handleDialogClose();
});

defineOptions({ inheritAttrs: false });
</script>

<template>
	<Teleport to="body">
		<div
			v-if="open"
			class="dialog fixed w-screen h-screen inset-0"
			v-bind="$attrs"
			:style="{ zIndex: 1000 + nDialog }"
			:data-modal-index="nDialog + 1">
			<div
				ref="target"
				class="modal-box dialog-content absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
				<Flex stack class="max-h-[80vh] overflow-hidden py-4">
					<slot name="header">
						<Typography v-if="header" variant="displaySemiBold" class="px-4 text-center">
							{{ header }}
						</Typography>
					</slot>

					<div
						class="grow overflow-auto px-4 dialog-body"
						:class="{ 'pt-4': $slots.header || header, 'pb-4': $slots.action }"
						v-bind="pt?.body">
						<slot></slot>
					</div>

					<div v-if="$slots.action" class="px-4">
						<slot name="action"></slot>
					</div>
				</Flex>
			</div>
		</div>
	</Teleport>
</template>

<style>
.modal {
	@apply transition-none duration-0;
	scrollbar-color: none;
}

.dialog::before {
	@apply absolute inset-0 w-screen h-screen bg-black opacity-50;
	content: '';
}

.modal-box.dialog-content {
	@apply rounded-2xl bg-white shadow-2xl p-0 border border-base-200 w-full max-w-[calc(100vw-32px)] sm:max-w-[480px];
}
</style>
