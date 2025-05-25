<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useToast } from '@/hooks/useToast';
import imageCompression from 'browser-image-compression';
import { ref, useTemplateRef } from 'vue';

/** Max file size by MB */
const MAX_FILE_SIZE = 2;
const MAX_IMG_WIDTH = 128; // px

const maxSizeText = (mbSize: number) => {
	if (mbSize >= 1) {
		return `${mbSize}MB`;
	}
	return `${mbSize * 1024}KB`;
};

const toast = useToast();
const input = useTemplateRef<HTMLInputElement>('input');
const base64Image = defineModel<string>();
const uploading = ref(false);

async function handleFileChange(event: Event) {
	const file = (event.target as HTMLInputElement)?.files?.[0];
	if (!file) return;

	if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
		return toast.error(
			`Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn ${maxSizeText(MAX_FILE_SIZE)}.`,
		);
	}

	try {
		uploading.value = true;

		const compressedFile = await imageCompression(file, {
			maxSizeMB: MAX_FILE_SIZE,
			maxWidthOrHeight: MAX_IMG_WIDTH,
			useWebWorker: true,
		});

		const reader = new FileReader();
		reader.onload = () => {
			base64Image.value = reader.result as string;
			uploading.value = false;
		};
		reader.readAsDataURL(compressedFile);
	} catch {
		toast.error('Upload ảnh không thành công.');
		uploading.value = false;
	}
}
</script>

<template>
	<Flex center stack class="gap-3">
		<img v-if="base64Image" :srcset="base64Image" class="rounded-full size-24 object-cover" />

		<Flex v-if="uploading" stack center class="min-h-[140px] gap-3">
			<Loading />
			<Typography variant="smRegular" class="text-gray-500">Đang tải ảnh lên...</Typography>
		</Flex>
		<Flex
			v-else
			center
			class="w-full rounded-lg border border-dashed border-gray-400 p-4 gap-3 cursor-pointer bg-gray-50 hover:bg-gray-100"
			stack
			@click="input?.click()">
			<span class="icon msi-image-arrow-up-rounded size-12 text-gray-400"></span>
			<Flex center stack class="gap-1">
				<Typography variant="mdMedium" class="text-slate-700">
					Nhấn để tải ảnh đại diện lên
				</Typography>
				<Typography variant="smRegular" class="text-gray-400">
					(Kích cỡ tối đa: {{ maxSizeText(MAX_FILE_SIZE) }})
				</Typography>
			</Flex>
		</Flex>

		<input
			ref="input"
			type="file"
			class="hidden"
			accept="image/jpeg, image/png, image/jpg"
			@change="handleFileChange" />
	</Flex>
</template>
