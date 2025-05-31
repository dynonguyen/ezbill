<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { APP_NAME } from '@/constants/common';
import type { ImportedBackup } from '@/features/group-detail/helpers/group-backup';
import { useToast } from '@/hooks/useToast';
import to from 'await-to-js';
import { useTemplateRef } from 'vue';

const MAX_FILE_SIZE = 2; // MB
export type ImportedModel = { filename: string; data: ImportedBackup } | null;

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');
const toast = useToast();
const imported = defineModel<ImportedModel>();

const handleFileChange = (event: Event) => {
	const file = (event.target as HTMLInputElement)?.files?.[0];
	if (!file) return;

	if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
		return toast.error(`Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn ${MAX_FILE_SIZE}MB.`);
	}

	import('@/features/group-detail/helpers/group-backup').then(async ({ readBackupFromExcel }) => {
		const [error, data] = await to(readBackupFromExcel(file));

		if (error) {
			return toast.error(
				`File không hợp lệ hoặc không thể đọc được. Vui lòng chọn file được xuất từ ${APP_NAME}.`,
			);
		}

		imported.value = { filename: file.name, data };
	});
};
</script>

<template>
	<Flex
		v-if="!imported"
		class="gap-1 text-slate-500 hover:text-slate-600 cursor-pointer"
		@click="inputRef?.click()">
		<span class="icon msi-upload-file-rounded size-5"></span>
		<Typography>Nhập nhóm từ file excel</Typography>
	</Flex>
	<Flex v-else stack class="gap-1 text-slate-500">
		<Typography class="shrink-0" variant="mdSemiBold">Nhập thông tin nhóm từ:</Typography>
		<Typography class="line-clamp-1">
			File:
			<span class="underline" :title="imported.filename">{{ imported.filename }}</span>
		</Typography>
		<Typography>Số thành viên: {{ imported.data.group.members.length }}</Typography>
		<Typography>Số hoá đơn: {{ imported.data.bills.length }}</Typography>
		<Button size="sm" variant="outlined" color="danger" class="self-start" @click="imported = null">
			Xoá
		</Button>
	</Flex>

	<input
		type="file"
		accept=".xlsx, .xls"
		class="hidden"
		ref="inputRef"
		@change="handleFileChange" />
</template>
