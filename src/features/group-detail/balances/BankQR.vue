<script setup lang="ts">
import { updateMember } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import { QUERY_KEY } from '@/constants/key';
import { useToast } from '@/hooks/useToast';
import type { Member, MemberBankInfo } from '@/types/entities';
import { buildVietQRData } from '@/utils/vietqr';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import QRCode from 'qrcode';
import { ref, watch } from 'vue';
import BankInfoDetail from '../BankInfoDetail.vue';
import BankInfoPopup from '../BankInfoPopup.vue';
import { useGroupContext } from '../hooks/useGroupContext';

const props = defineProps<{ bankInfo?: MemberBankInfo; amount: number; member: Member }>();

const qrBase64 = ref('');
const open = ref(false);

const { mutateAsync: updateMutateAsync } = useMutation({ mutationFn: updateMember });
const toast = useToast();
const { group } = useGroupContext();
const queryClient = useQueryClient();

const handleUpdateBankInfo = async (form: MemberBankInfo) => {
	const [error] = await to(
		updateMutateAsync({
			groupId: group.value.id,
			newValue: { ...props.member, bankInfo: form },
		}),
	);

	if (error) {
		return toast.error(error.message || 'Không thể cập nhật thông tin');
	}

	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};

watch(
	() => [props.bankInfo, props.amount],
	async () => {
		if (props.bankInfo) {
			const qrData = buildVietQRData({
				accountNumber: props.bankInfo.accountNumber,
				bin: props.bankInfo.bin,
				amount: props.amount,
			});

			qrBase64.value = await QRCode.toDataURL(qrData, { width: 500, type: 'image/jpeg' });
		}
	},
	{ immediate: true },
);
</script>

<template>
	<Flex v-if="bankInfo" stack>
		<BankInfoDetail :bank-info="bankInfo" :amount="amount" />
		<img v-if="qrBase64" :src="qrBase64" class="size-44 mx-auto" />
	</Flex>
	<Button
		v-else
		type="button"
		size="sm"
		variant="soft"
		color="grey"
		start-icon="msi-account-balance-rounded"
		class="!bg-transparent border-dashed"
		@click="open = true">
		Thêm thông tin chuyển khoản
	</Button>

	<BankInfoPopup
		v-if="open"
		v-model:open="open"
		:initial-values="bankInfo"
		@submit="handleUpdateBankInfo" />
</template>
