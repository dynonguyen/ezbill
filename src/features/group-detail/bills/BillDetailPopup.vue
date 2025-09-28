<script setup lang="ts">
import { createErrorLog, updateBill } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill, BillId } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { computed, ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import BillForm from './BillForm.vue';
import ReadonlyBillDetail from './ReadonlyBillDetail.vue';

const bills = useBillsContext();
const toast = useToast();
const { isAccountantMode } = useGroupContext();

const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateBill,
});
const { refetchBills } = useGroupQueryControl();

const detailId = defineModel<BillId | null>({ default: null });
const isDirty = ref(false);

const handleCloseDetail = () => {
	detailId.value = null;
};

const handleUpdateBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	if (!detailId.value) return;

	const [error] = await to(updateMutateAsync({ id: detailId.value, ...form }));

	if (error) {
		void createErrorLog({ error: error?.message });
		return toast.errorWithRetry('Chỉnh sửa bill thất bại', () => handleUpdateBill(form));
	}

	detailId.value = null;
	refetchBills();
};

const bill = computed(() => {
	return bills.value.find((b) => b.id === detailId.value);
});

const readOnly = computed(
	() => !isAccountantMode.value && Number(bill.value?.paymentTracking.length) > 0,
);
</script>

<template>
	<Dialog
		header="Chi tiết hoá đơn"
		:open="Boolean(detailId)"
		@close="handleCloseDetail"
		:confirm-on-close="isDirty">
		<ReadonlyBillDetail v-if="readOnly && bill" :bill="bill" />
		<BillForm
			v-else
			v-model:form-dirty="isDirty"
			:default-bill="bill"
			@submit="handleUpdateBill"
			mode="view-detail"
			id="bill-form" />

		<template #action v-if="!readOnly">
			<Button type="submit" form="bill-form" :loading="isUpdating">Cập nhật</Button>
		</template>
	</Dialog>
</template>
