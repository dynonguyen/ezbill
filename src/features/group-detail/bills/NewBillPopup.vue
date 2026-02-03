<script setup lang="ts">
import type { ApiCreateBillReq } from '@/apis/api-client';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill, GroupId } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useApiClient } from '../../../hooks/useApiClient';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useGroupQueryControl';
import BillForm from './BillForm.vue';

const open = defineModel<boolean>('open');

const { group } = useGroupContext();
const apiClient = useApiClient();
const { isPending, mutateAsync } = useMutation({
	mutationFn: ({ groupId, req }: { groupId: GroupId; req: ApiCreateBillReq }) =>
		apiClient.createBill(groupId, req),
});

const toast = useToast();
const { refetchBills } = useGroupQueryControl();
const isDirty = ref(false);

const handleAddBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	const [error] = await to(mutateAsync({ groupId: group.value.id, req: form }));

	if (error) {
		void apiClient.createErrorLog({ error: error?.message });
		return toast.errorWithRetry('Tạo bill thất bại', () => handleAddBill(form));
	}

	open.value = false;
	refetchBills();
};
</script>

<template>
	<Dialog v-model:open="open" header="Thêm hoá đơn" :confirm-on-close="isDirty">
		<BillForm mode="new" @submit="handleAddBill" id="bill-form" v-model:form-dirty="isDirty" />

		<template #action>
			<Button type="submit" form="bill-form" :loading="isPending">Tạo</Button>
		</template>
	</Dialog>
</template>
