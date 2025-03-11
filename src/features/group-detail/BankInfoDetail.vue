<script setup lang="ts">
import LabelValue from '@/components/LabelValue.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { BANKS } from '@/constants/bank';
import type { MemberBankInfo } from '@/types/entities';
import { toVND } from '@/utils/helpers';
import { computed } from 'vue';

const props = defineProps<{ recipient?: string; bankInfo: MemberBankInfo; amount?: number }>();
const bank = computed(() => BANKS.find((b) => props.bankInfo?.bin === b.bin));
</script>

<template>
	<Flex stack class="border-t border-b border-dashed border-gray-300 gap-2 py-2">
		<Flex class="justify-between">
			<Typography variant="mdSemiBold">Thông tin chuyển khoản</Typography>
			<slot name="action"></slot>
		</Flex>

		<Flex stack class="gap-1">
			<LabelValue label="Người nhận" :value="recipient" />
			<LabelValue label="Ngân hàng" :value="bank ? `${bank.shortname} - ${bank.name}` : ''" />
			<LabelValue label="Số tài khoản" :value="bankInfo.accountNumber" />
			<LabelValue v-if="amount" label="Số tiền" :value="toVND(amount)" />
		</Flex>
	</Flex>
</template>
