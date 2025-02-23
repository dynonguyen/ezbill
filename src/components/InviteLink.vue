<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import { PATH } from '@/constants/path';
import type { Group } from '@/types/entities';
import { getEnv } from '@/utils/get-env';
import { saveFileAs } from '@/utils/helpers';
import QRCode from 'qrcode';
import { computed, onWatcherCleanup, ref, watch } from 'vue';
import Button from './ui/Button.vue';

const props = defineProps<{ id: Group['id'] }>();

const inviteLink = computed(
	() => `${getEnv('VITE_BASE_URL')}${PATH.GROUP.replace(':id', props.id)}`,
);
const qrBase64 = ref('');
const copied = ref(false);

const copyToClipboard = () => {
	navigator.clipboard?.writeText(inviteLink.value);
	copied.value = true;
};

const downloadQR = () => {
	saveFileAs(qrBase64.value, 'QR.jpeg');
};

watch(
	inviteLink,
	async () => {
		navigator.clipboard?.writeText(inviteLink.value);
		qrBase64.value = await QRCode.toDataURL(inviteLink.value, { width: 500, type: 'image/jpeg' });
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
	<Flex class="gap-2 !items-end">
		<FormControl class="grow" label="Link mời tham gia">
			<input class="input input-bordered" :value="inviteLink" readonly fluid />
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
