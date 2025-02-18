<script setup lang="ts">
import { deleteBill, updateBill } from '@/apis/supabase';
import Flex from '@/components/Flex.vue';
import { QUERY_KEY } from '@/constants/key';
import { type Bill } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Button, ConfirmPopup, Dialog, useConfirm } from 'primevue';
import { computed, defineAsyncComponent, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import BillItem from './BillItem.vue';

const BillForm = defineAsyncComponent(() => import('./BillForm.vue'));

const { group } = useGroupContext();
const bills = useBillsContext();

const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateBill,
});

const { isPending: isDeleting, mutateAsync: deleteMutateAsync } = useMutation({
	mutationFn: deleteBill,
});

const queryClient = useQueryClient();
const toast = useToast();
const confirm = useConfirm();

const showAll = ref(false);
const detailId = ref<Bill['id'] | null>(null);

const MAX_DISPLAY_BILLS = 4;

const displayBills = computed(() => {
	const rawBills = [...bills.value].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	return showAll.value ? rawBills : rawBills.slice(0, MAX_DISPLAY_BILLS);
});

const handleUpdateBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	if (!detailId.value) return;

	const [error] = await to(updateMutateAsync({ id: detailId.value, ...form }));

	if (error) {
		return toast.error(error?.message || 'Chỉnh sửa bill thất bại');
	}

	detailId.value = null;
	toast.success('Chỉnh sửa bill thành công');
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
};

const handleDeleteBill = async () => {
	if (!detailId.value) return;

	const [error] = await to(deleteMutateAsync({ groupId: group.value.id, billId: detailId.value }));

	if (error) {
		return toast.error(error?.message || 'Xoá bill thất bại');
	}

	detailId.value = null;
	toast.success('Xoá bill thành công');
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
};

const deleteConfirm = (event: MouseEvent) => {
	confirm.require({
		target: event.currentTarget as HTMLElement,
		message: 'Bạn thật sự muốn xoá bill này?',
		icon: 'icon msi-warning-outline-rounded',
		rejectProps: { label: 'Huỷ', severity: 'secondary', outlined: true },
		acceptProps: { label: 'Xoá', severity: 'danger' },
		accept: handleDeleteBill,
	});
};
</script>

<template>
	<Flex stack class="gap-4">
		<BillItem
			v-for="bill in displayBills"
			:key="bill.id"
			:bill="bill"
			@click="detailId = bill.id" />

		<Button
			v-if="bills.length > MAX_DISPLAY_BILLS"
			:label="showAll ? 'Thu gọn' : 'Hiển thị tất cả'"
			variant="outlined"
			class="mx-auto"
			@click="showAll = !showAll" />
	</Flex>

	<Dialog
		:draggable="false"
		:visible="Boolean(detailId)"
		modal
		:header="`Bill &quot;${bills.find((b) => b.id === detailId)?.name}&quot; `"
		class="!w-120"
		:pt="{ content: { class: '!p-0' } }"
		@hide="detailId = null"
		@update:visible="
			(visible) => {
				if (!visible) detailId = null;
			}
		">
		<Suspense>
			<BillForm
				v-if="detailId"
				mode="view-detail"
				:default-bill="bills.find((b) => b.id === detailId)"
				@close="detailId = null"
				@submit="handleUpdateBill">
				>
				<template #other-actions>
					<ConfirmPopup></ConfirmPopup>
					<Flex class="grow">
						<Button
							@click="deleteConfirm($event)"
							label="Xoá"
							severity="danger"
							:loading="isDeleting"></Button>
					</Flex>
				</template>
				<template #submit-button>
					<Button type="submit" label="Chỉnh sửa" :loading="isUpdating" />
				</template>
			</BillForm>
		</Suspense>
	</Dialog>
</template>
