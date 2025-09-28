<script setup lang="ts">
import { createBill, createErrorLog } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import BillForm from './BillForm.vue';

const open = defineModel<boolean>('open');

const { isPending, mutateAsync } = useMutation({ mutationFn: createBill });

const toast = useToast();
const { refetchBills } = useGroupQueryControl();
const isDirty = ref(false);

const handleAddBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	const [error] = await to(mutateAsync(form));

	if (error) {
		void createErrorLog({ error: error?.message });
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
