<script setup lang="ts">
import LabelValue from '@/components/LabelValue.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { BANKS } from '@/constants/bank';
import type { Member, MemberBankInfo } from '@/types/entities';
import { toVND } from '@/utils/helpers';
import { computed } from 'vue';

const props = defineProps<{ recipient?: Member; bankInfo: MemberBankInfo; amount?: number }>();
const bank = computed(() => BANKS.find((b) => props.bankInfo?.bin === b.bin));
</script>

<template>
	<Flex
		class="border-t border-b border-dashed border-gray-300 gap-3 py-2 !items-start bank-info-detail">
		<MemberAvatar v-if="recipient" v-bind="recipient" size="lg" />
		<Flex stack>
			<Flex class="justify-between">
				<Typography variant="mdSemiBold">Thông tin chuyển khoản</Typography>
				<slot name="action"></slot>
			</Flex>

			<Flex stack class="gap-1">
				<LabelValue label="Người nhận" :value="recipient?.name" />
				<LabelValue label="Ngân hàng" :value="bank ? `${bank.shortname} - ${bank.name}` : ''" />
				<LabelValue label="Số tài khoản" :value="bankInfo.accountNumber" />
				<LabelValue v-if="amount" label="Số tiền" :value="toVND(amount)" />
			</Flex>
		</Flex>
	</Flex>
</template>
