<script setup lang="ts">
import { createBill } from '@/apis/supabase';
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
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import type { BillFormModel } from './BillForm.vue';
import BillForm from './BillForm.vue';

const emit = defineEmits<{ close: [] }>();

const { isPending, mutateAsync } = useMutation({ mutationFn: createBill });

const toast = useToast();
const { refetchBills } = useGroupQueryControl();

const billFormModel = ref<BillFormModel>();

const handleAddBill = async (form: Omit<Bill, 'id' | 'createdAt'>) => {
	const [error] = await to(mutateAsync(form));

	if (error) {
		return toast.error(error?.message || 'Tạo bill thất bại');
	}

	emit('close');
	refetchBills();
};
</script>

<template>
	<Dialog header="Thêm hoá đơn">
		<BillForm mode="new" @submit="handleAddBill" id="bill-form" v-model="billFormModel" />

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
					<Button type="button" variant="soft" color="grey" @click="$emit('close')">Đóng</Button>
					<Button type="submit" form="bill-form" :loading="isPending">Tạo</Button>
				</Flex>
			</Flex>
		</template>
	</Dialog>
</template>
