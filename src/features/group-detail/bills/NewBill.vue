<script setup lang="ts">
import { createBill } from '@/apis/supabase';
import { QUERY_KEY } from '@/constants/key';
import type { Bill } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Button, Dialog } from 'primevue';
import { defineAsyncComponent, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useGroupContext } from '../hooks/useGroupContext';

const BillForm = defineAsyncComponent(() => import('./BillForm.vue'));

const { group } = useGroupContext();
const { isPending, mutateAsync } = useMutation({ mutationFn: createBill });

const queryClient = useQueryClient();
const toast = useToast();

const open = ref(false);

const handleAddBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	const [error] = await to(mutateAsync(form));

	if (error) {
		return toast.error(error?.message || 'Tạo bill thất bại');
	}

	open.value = false;
	toast.success('Tạo bill thành công');
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
};
</script>

<template>
	<Button
		v-tooltip.top="'Tạo bill mới'"
		icon="icon msi-add-2-rounded shrink-0 size-5"
		rounded
		size="large"
		class="!size-14"
		@click="open = true" />

	<Dialog
		:draggable="false"
		v-model:visible="open"
		modal
		header="Tạo bill mới"
		class="w-120 max-w-full"
		:pt="{ content: { class: '!p-0' } }">
		<Suspense>
			<BillForm v-if="open" @close="open = false" mode="new" @submit="handleAddBill">
				<template #submit-button>
					<Button type="submit" label="Tạo" class="min-w-20" :loading="isPending" />
				</template>
			</BillForm>
		</Suspense>
	</Dialog>
</template>
