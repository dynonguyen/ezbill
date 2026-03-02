<script setup lang="ts">
import type { ApiUpdateBillReq } from '@/apis/api-client';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill, BillId, GroupId } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { computed, ref } from 'vue';
import { useApiClient } from '../../../hooks/useApiClient';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useGroupQueryControl';
import BillForm from './BillForm.vue';
import ReadonlyBillDetail from './ReadonlyBillDetail.vue';

const bills = useBillsContext();
const toast = useToast();
const { isAccountantMode, group } = useGroupContext();

const apiClient = useApiClient();
const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: ({ groupId, id, req }: { groupId: GroupId; id: BillId; req: ApiUpdateBillReq }) =>
		apiClient.updateBill(groupId, id, req),
});
const { refetchBills, refetchGroupStats } = useGroupQueryControl();

const detailId = defineModel<BillId | null>({ default: null });
const isDirty = ref(false);

const handleCloseDetail = () => {
	detailId.value = null;
};

const handleUpdateBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	if (!detailId.value) return;

	const unsetNote = Boolean(bill.value?.note && form.note === '');
	if (unsetNote) {
		delete form.note;
	}

	const previousMemberIds = bill.value?.members?.map((member) => member.memberId) ?? [];
	const nextMemberIds = form.members.map((member) => member.memberId);
	const unsetMembers = previousMemberIds.filter((id) => !nextMemberIds.includes(id));

	const previousCategoryIds = bill.value?.categoryIds ?? [];
	const nextCategoryIds = form.categoryIds ?? [];
	const unsetCategories = previousCategoryIds.filter((id) => !nextCategoryIds.includes(id));

	const req: ApiUpdateBillReq = {
		...form,
		unsetNote,
		...(unsetMembers.length ? { unsetMembers } : {}),
		...(unsetCategories.length ? { unsetCategories } : {}),
	};

	const [error] = await to(
		updateMutateAsync({
			groupId: group.value.id,
			id: detailId.value,
			req,
		}),
	);

	if (error) {
		void apiClient.createErrorLog({ error: error?.message });
		return toast.errorWithRetry('Chỉnh sửa bill thất bại', () => handleUpdateBill(form));
	}

	detailId.value = null;
	refetchBills();
	refetchGroupStats();
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
