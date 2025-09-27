<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import Flex from '@/components/ui/Flex.vue';
import { APP_NAME } from '@/constants/common';
import type { GroupId } from '@/types/entities';
import { getGroupLink, saveFileAs } from '@/utils/helpers';
import { computed, onWatcherCleanup, ref, watch } from 'vue';
import Button from './ui/Button.vue';
import FormControl from './ui/FormControl.vue';

const props = defineProps<{ id: GroupId }>();

const inviteLink = computed(() => getGroupLink(props.id));
const qrBase64 = ref('');
const copied = ref(false);

const copyToClipboard = () => {
	navigator.clipboard?.writeText(inviteLink.value);
	copied.value = true;
};

const downloadQR = () => {
	saveFileAs(qrBase64.value, `${APP_NAME}_${props.id}.jpeg`);
};

watch(
	inviteLink,
	async () => {
		if (inviteLink.value) {
			navigator.clipboard?.writeText(inviteLink.value);
			import('qrcode').then(async (QRCode) => {
				qrBase64.value = await QRCode.toDataURL(inviteLink.value, {
					width: 500,
					type: 'image/jpeg',
				});
			});
		}
	},
	{ immediate: true },
);

watch(copied, () => {
	if (copied.value) {
		const timeout = setTimeout(() => {
			copied.value = false;
		}, 6000);

		onWatcherCleanup(() => {
			timeout && clearTimeout(timeout);
		});
	}
});
</script>

<template>
	<Flex class="gap-2 !items-end justify-between">
		<FormControl class="grow" label="Link mời tham gia">
			<input class="input input-bordered w-full" :value="inviteLink" readonly />
		</FormControl>
		<Button
			:start-icon="
				copied
					? 'icon msi-check-rounded shrink-0 !size-5 text-success'
					: 'icon msi-content-copy-outline shrink-0 !size-5'
			"
			color="grey"
			variant="soft"
			shape="square"
			class="shrink-0"
			@click="copyToClipboard"></Button>
	</Flex>

	<div class="divider" align="center">
		<strong>OR chia sẻ mã QR</strong>
	</div>

	<Flex stack center>
		<Flex v-if="qrBase64" stack class="gap-1">
			<img :src="qrBase64" class="size-44 mx-auto" />
			<Button
				variant="link"
				color="info"
				start-icon="icon msi-download size-5"
				class="!p-0 !text-blue-500"
				size="sm"
				@click="downloadQR">
				Tải xuống
			</Button>
		</Flex>
		<Loading v-else />
	</Flex>

	<slot name="action"></slot>
</template>
