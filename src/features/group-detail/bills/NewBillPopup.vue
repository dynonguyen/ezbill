<script setup lang="ts">
import { createBill } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import { QUERY_KEY } from '@/constants/key';
import type { Bill } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { defineAsyncComponent } from 'vue';
import { useToast } from 'vue-toastification';
import { useGroupContext } from '../hooks/useGroupContext';

const BillForm = defineAsyncComponent(() => import('./BillForm.vue'));

const emit = defineEmits<{ close: [] }>();

const { group } = useGroupContext();
const { isPending, mutateAsync } = useMutation({ mutationFn: createBill });

const queryClient = useQueryClient();
const toast = useToast();

const handleAddBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	const [error] = await to(mutateAsync(form));

	if (error) {
		return toast.error(error?.message || 'Tạo bill thất bại');
	}

	emit('close');
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
};
</script>

<template>
	<Dialog header="Thêm hoá đơn">
		<BillForm mode="new" @submit="handleAddBill" id="bill-form" />

		<template #action>
			<Flex class="gap-2" items-fluid>
				<Button variant="soft" color="grey" @click="$emit('close')">Huỷ</Button>
				<Button type="submit" form="bill-form" :loading="isPending">Tạo</Button>
			</Flex>
		</template>
	</Dialog>
</template>
