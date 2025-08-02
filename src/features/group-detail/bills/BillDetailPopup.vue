<script setup lang="ts">
import { createErrorLog, updateBill } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import BillForm from './BillForm.vue';

const bills = useBillsContext();
const toast = useToast();

const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateBill,
});
const { refetchBills } = useGroupQueryControl();

const detailId = defineModel<Bill['id'] | null>({ default: null });
const isDirty = ref(false);

const handleCloseDetail = () => {
	detailId.value = null;
};

const handleUpdateBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	if (!detailId.value) return;

	const [error] = await to(updateMutateAsync({ id: detailId.value, ...form }));

	if (error) {
		void createErrorLog({ error: error?.message });
		return toast.error('Chỉnh sửa bill thất bại');
	}

	detailId.value = null;
	refetchBills();
};
</script>

<template>
	<Dialog
		header="Chi tiết hoá đơn"
		:open="Boolean(detailId)"
		@close="handleCloseDetail"
		:confirm-on-close="isDirty">
		<BillForm
			v-model:form-dirty="isDirty"
			:default-bill="bills.find((b) => b.id === detailId)"
			@submit="handleUpdateBill"
			mode="view-detail"
			id="bill-form" />

		<template #action>
			<Button type="submit" form="bill-form" :loading="isUpdating">Cập nhật</Button>
		</template>
	</Dialog>
</template>
