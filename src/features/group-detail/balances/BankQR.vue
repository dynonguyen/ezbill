<script setup lang="ts">
import { updateMember } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import { useToast } from '@/hooks/useToast';
import type { Member, MemberBankInfo } from '@/types/entities';
import { saveFileAs } from '@/utils/helpers';
import { buildVietQRData } from '@/utils/vietqr';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref, watch } from 'vue';
import BankInfoDetail from '../BankInfoDetail.vue';
import BankInfoPopup from '../BankInfoPopup.vue';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';

const props = defineProps<{
	bankInfo?: MemberBankInfo;
	amount: number;
	member: Member;
	isAccounting?: boolean;
}>();

const qrBase64 = ref('');
const open = ref(false);

const { mutateAsync: updateMutateAsync } = useMutation({ mutationFn: updateMember });
const toast = useToast();
const { group } = useGroupContext();
const { refetchGroup } = useGroupQueryControl();

const handleUpdateBankInfo = async (form?: MemberBankInfo) => {
	const [error] = await to(
		updateMutateAsync({
			groupId: group.value.id,
			newValue: { ...props.member, bankInfo: form },
		}),
	);

	if (error) {
		return toast.errorWithRetry(error.message || 'Không thể cập nhật thông tin', () =>
			handleUpdateBankInfo(form),
		);
	}

	refetchGroup();
};

const downloadQR = () => {
	saveFileAs(qrBase64.value, `QR-thanh-toan-${props.bankInfo?.accountNumber}.jpeg`);
};

watch(
	() => [props.bankInfo, props.amount],
	async () => {
		if (props.bankInfo) {
			const qrData = buildVietQRData({
				accountNumber: props.bankInfo.accountNumber,
				bin: props.bankInfo.bin,
				amount: Number(props.amount.toFixed(0)),
			});

			import('qrcode').then(async (QRCode) => {
				qrBase64.value = await QRCode.toDataURL(qrData, { width: 500, type: 'image/jpeg' });
			});
		}
	},
	{ immediate: true },
);
</script>

<template>
	<Flex v-if="bankInfo" stack class="w-full">
		<BankInfoDetail :bank-info="bankInfo" :amount="amount" :recipient="member.name">
			<template #action>
				<Flex class="gap-2">
					<span
						class="icon msi-edit cursor-pointer size-5 text-slate-500"
						@click="open = true"></span>
					<span
						class="icon msi-delete cursor-pointer size-5 text-red-500"
						@click="handleUpdateBankInfo(undefined)"></span>
				</Flex>
			</template>
		</BankInfoDetail>
		<img v-if="qrBase64" :src="qrBase64" class="size-44 mx-auto" />
		<Flex center class="w-full">
			<Button
				variant="link"
				color="info"
				start-icon="icon msi-download size-5"
				class="!p-0 !text-blue-500"
				size="sm"
				@click="downloadQR">
				Tải xuống
			</Button>
		</Flex>
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
