<script setup lang="ts">
import LabelValue, { type LabelValueProps } from '@/components/LabelValue.vue';
import Loading from '@/components/Loading.vue';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { APP_NAME } from '@/constants/common';
import type { ImportedBackup } from '@/features/group-detail/helpers/group-backup';
import { useToast } from '@/hooks/useToast';
import { toVND } from '@/utils/helpers';
import to from 'await-to-js';
import { computed, ref, useTemplateRef } from 'vue';

const MAX_FILE_SIZE = 2; // MB
export type ImportedModel = { filename: string; data: ImportedBackup } | null;

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');
const toast = useToast();
const imported = defineModel<ImportedModel>();
const isImporting = ref(false);

const handleFileChange = (event: Event) => {
	const file = (event.target as HTMLInputElement)?.files?.[0];
	if (!file) return;

	if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
		return toast.error(`Kích thước tệp quá lớn. Vui lòng chọn tệp nhỏ hơn ${MAX_FILE_SIZE}MB.`);
	}

	import('@/features/group-detail/helpers/group-backup').then(async ({ readBackupFromExcel }) => {
		isImporting.value = true;
		const [error, data] = await to(readBackupFromExcel(file));
		isImporting.value = false;

		if (error) {
			return toast.error(
				`File không hợp lệ hoặc không thể đọc được. Vui lòng chọn file được xuất từ ${APP_NAME}.`,
			);
		}

		imported.value = { filename: file.name, data };
	});
};

const importedInfo = computed<Array<[string, string | number, LabelValueProps['pt']?]>>(() => {
	return imported.value
		? [
				['Tệp', imported.value.filename, { value: { class: 'line-clamp-1 underline' } }],
				['Số thành viên', imported.value.data.group.members.length],
				['Số hoá đơn', imported.value.data.bills.length],
				[
					'Tổng tiền',
					toVND(imported.value.data.bills?.reduce((acc, bill) => acc + bill.amount, 0)),
				],
			]
		: [];
});
</script>

<template>
	<Flex v-if="isImporting" center>
		<Loading />
	</Flex>
	<template v-else>
		<Flex
			v-if="!imported"
			class="gap-1 text-slate-500 hover:text-slate-600 cursor-pointer"
			@click="inputRef?.click()">
			<span class="icon msi-upload-file-rounded size-5"></span>
			<Typography>Nhập nhóm từ file excel</Typography>
		</Flex>
		<Flex v-else stack class="gap-2">
			<Typography class="shrink-0" variant="mdSemiBold">Nhập thông tin nhóm từ:</Typography>
			<LabelValue
				v-for="([label, value, pt], idx) in importedInfo"
				:key="idx"
				:label="label"
				:value="value"
				:pt="pt" />

			<Flex class="gap-2">
				<Button size="sm" variant="soft" color="grey" @click="inputRef?.click()">Chọn lại</Button>
				<Button size="sm" variant="outlined" color="danger" @click="imported = null">Xoá</Button>
			</Flex>
		</Flex>

		<input
			type="file"
			accept=".xlsx, .xls"
			class="hidden"
			ref="inputRef"
			@change="handleFileChange" />
	</template>
</template>
