<script setup lang="ts">
import { deleteBill } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import { useToast } from '@/hooks/useToast';
import type { Bill } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';

const { group } = useGroupContext();
const bills = useBillsContext();
const queryClient = useQueryClient();
const toast = useToast();

const { isPending: isDeleting, mutateAsync: deleteMutateAsync } = useMutation({
	mutationFn: deleteBill,
});

const deleteId = defineModel<Bill['id'] | null>({ default: null });

const handleDeleteBill = async () => {
	if (!deleteId.value) return;

	const [error] = await to(deleteMutateAsync({ groupId: group.value.id, billId: deleteId.value }));

	if (error) {
		return toast.error(error?.message || 'Xoá bill thất bại');
	}

	deleteId.value = null;
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.BILL_LIST, group.value.id] });
};
</script>

<template>
	<Dialog header="Xoá hoá đơn" :open="Boolean(deleteId)" @close="deleteId = null">
		<Typography variant="smRegular" class="text-center">
			Bạn có chắc chắn muốn xoá hoá đơn
			<b>"{{ bills.find((b) => b.id === deleteId)?.name }}"</b>
			không? Thao tác không thể hoàn tác.
		</Typography>

		<template #action>
			<Flex class="gap-2" items-fluid>
				<Button variant="soft" color="grey" @click="deleteId = null">Đóng</Button>
				<Button color="danger" @click="handleDeleteBill" :loading="isDeleting">Xoá</Button>
			</Flex>
		</template>
	</Dialog>
</template>
