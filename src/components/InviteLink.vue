<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import FormControl from '@/components/FormControl.vue';
import Loading from '@/components/Loading.vue';
import { PATH } from '@/constants/path';
import type { Group } from '@/types/entities';
import { getEnv } from '@/utils/get-env';
import { saveFileAs } from '@/utils/helpers';
import { Button, Divider, InputText } from 'primevue';
import QRCode from 'qrcode';
import { computed, onWatcherCleanup, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{ id: Group['id']; hideViewGroup?: boolean }>();
const emit = defineEmits<{ close: [] }>();

const inviteLink = computed(
	() => `${getEnv('VITE_BASE_URL')}${PATH.GROUP.replace(':id', props.id)}`,
);
const qrBase64 = ref('');
const copied = ref(false);
const router = useRouter();

const copyToClipboard = () => {
	navigator.clipboard?.writeText(inviteLink.value);
	copied.value = true;
};

const viewGroup = () => {
	router.push({ path: PATH.GROUP.replace(':id', props.id) });
	emit('close');
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
	<Flex class="gap-2 items-end">
		<FormControl class="grow" label="Link mời tham gia">
			<InputText :value="inviteLink" readonly fluid />
		</FormControl>
		<Button
			:icon="copied ? 'icon msi-check-rounded' : 'icon msi-content-copy-outline'"
			:label="copied ? 'Đã sao chép' : 'Sao chép'"
			:severity="copied ? 'success' : 'primary'"
			variant="outlined"
			@click="copyToClipboard" />
	</Flex>

	<Divider align="center">
		<strong>OR chia sẻ mã QR</strong>
	</Divider>

	<Flex stack center>
		<Flex v-if="qrBase64" stack class="gap-1">
			<img :src="qrBase64" class="size-44 mx-auto" />
			<Button
				variant="link"
				label="Tải xuống"
				severity="help"
				icon="icon msi-download size-5"
				class="!p-0 !text-blue-500"
				@click="downloadQR" />
		</Flex>
		<Loading v-else />
	</Flex>

	<Flex class="justify-end gap-2 mt-4">
		<Button variant="outlined" label="Đóng" @click="$emit('close')" />
		<Button
			v-if="!hideViewGroup"
			label="Xem nhóm"
			icon="icon msi-open-in-new"
			icon-pos="right"
			@click="viewGroup" />
	</Flex>
</template>
