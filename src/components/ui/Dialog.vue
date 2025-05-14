<script setup lang="ts">
import { lockScroll, unlockScroll } from '@/utils/scrolling';
import { onClickOutside, onKeyDown } from '@vueuse/core';
import { computed, onUnmounted, useTemplateRef, watch, type HTMLAttributes } from 'vue';
import Flex from './Flex.vue';
import Typography from './Typography.vue';

defineProps<{ header?: string; pt?: { body?: HTMLAttributes } }>();
defineOptions({ inheritAttrs: false });

const emit = defineEmits<{ close: [] }>();
const open = defineModel<boolean>('open');
const outsideClickTarget = useTemplateRef<HTMLElement>('target');

const handleDialogClose = () => {
	open.value = false;
	emit('close');
};

const countDialogs = () => {
	return document.querySelectorAll('.dialog').length || 0;
};

const nDialog = computed(() => {
	if (open.value) return document.querySelectorAll('.dialog').length || 0;

	return 0;
});

onClickOutside(outsideClickTarget, (ev) => {
	const index = Number((ev.target as HTMLElement)?.getAttribute('data-modal-index'));
	if (index === nDialog.value + 1) handleDialogClose();
});

onKeyDown('Escape', () => {
	if (open.value) {
		const numOfDialogs = document.querySelectorAll('.dialog').length;
		if (nDialog.value + 1 === numOfDialogs) {
			handleDialogClose();
		}
	}
});

const conditionalUnlockScroll = () => {
	if (!countDialogs()) {
		unlockScroll();
	}
};

watch(
	[open],
	() => {
		if (open.value) lockScroll();
		else conditionalUnlockScroll();
	},
	{ immediate: true, flush: 'post' },
);

onUnmounted(conditionalUnlockScroll);
</script>

<template>
	<Teleport v-if="open" to="body">
		<div
			class="dialog fixed w-screen h-screen inset-0"
			v-bind="$attrs"
			:style="{ zIndex: 1000 + nDialog }"
			:data-modal-index="nDialog + 1">
			<div
				ref="target"
				class="dialog-content absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
				<Flex stack class="max-h-[80dvh] overflow-hidden py-4">
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

.dialog-content {
	@apply rounded-2xl bg-white shadow-2xl p-0 border border-base-200 w-full max-w-[calc(100vw-32px)] sm:max-w-[480px];
}

/* body {
	@apply pr-3;
} */

.lock-scroll {
	@apply overflow-hidden mr-4;
}
</style>
