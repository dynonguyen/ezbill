<script setup lang="ts">
import { updateBill } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill } from '@/types/entities';
import { toVND } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import type { BillFormModel } from './BillForm.vue';
import BillForm from './BillForm.vue';

const bills = useBillsContext();
const toast = useToast();

const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateBill,
});
const { refetchBills } = useGroupQueryControl();

const detailId = defineModel<Bill['id'] | null>({ default: null });
const billFormModel = ref<BillFormModel>();

const handleCloseDetail = () => {
	detailId.value = null;
};

const handleUpdateBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	if (!detailId.value) return;

	const [error] = await to(updateMutateAsync({ id: detailId.value, ...form }));

	if (error) {
		return toast.error(error?.message || 'Chỉnh sửa bill thất bại');
	}

	detailId.value = null;
	refetchBills();
};
</script>

<template>
	<Dialog header="Chi tiết hoá đơn" :open="Boolean(detailId)" @close="handleCloseDetail">
		<BillForm
			:default-bill="bills.find((b) => b.id === detailId)"
			mode="view-detail"
			@submit="handleUpdateBill"
			id="bill-form"
			v-model="billFormModel" />

		<template #action>
			<Flex stack class="pt-2 gap-2">
				<Typography
					v-if="!billFormModel?.isDivEqually"
					variant="smRegular"
					class="sticky bottom-0 bg-white">
					Tổng tiền:
					<b>
						{{ toVND(billFormModel?.amount || 0) }}
					</b>
				</Typography>

				<Flex class="gap-2" items-fluid>
					<Button variant="soft" color="grey" @click="handleCloseDetail">Đóng</Button>
					<Button type="submit" form="bill-form" :loading="isUpdating">Cập nhật</Button>
				</Flex>
			</Flex>
		</template>
	</Dialog>
</template>
