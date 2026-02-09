<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { PaymentTrackingMode, type Member, type MemberBalanceTracking } from '@/types/entities';
import { computed, ref } from 'vue';
import { useGroupContext } from '../../hooks/useGroupContext';
import { useGroupStatsContext } from '../../hooks/useGroupStatsContext';
import BalanceDetail from './BalanceDetail.vue';
import TransferPopup from './TransferPopup.vue';

const { group } = useGroupContext();
const groupStats = useGroupStatsContext();
const detailId = ref<string | null>(null);
const transferId = ref<string | null>(null);

const balances = computed(() => {
	if (!groupStats.value || groupStats.value.paymentTrackingMode !== PaymentTrackingMode.Tracking) {
		return [];
	}

	return groupStats.value.members.map((memberStats) => {
		const member = group.value.members.find((m) => m.id === memberStats.memberId) as Member;
		const stats = memberStats as MemberBalanceTracking;
		const balance = stats.toReceive - stats.toPay;

		return {
			member,
			amountToPay: stats.toPay,
			amountReceived: stats.toReceive,
			balance,
			displayItems: [
				{ label: 'Cần trả', value: -stats.toPay },
				{ label: 'Nhận lại', value: stats.toReceive },
			],
		};
	});
});
</script>

<template>
	<Flex stack class="gap-2">
		<Flex
			v-for="item in balances"
			:key="item.member.id"
			stack
			class="gap-2 p-4 rounded-xl bg-gray-100 cursor-pointer hover:bg-gray-200"
			@click="detailId = item.member.id">
			<Flex class="gap-4">
				<MemberAvatar
					v-bind="item.member"
					:pt="{ avatar: { class: '!size-[60px] shrink-0' }, text: { class: '!text-2xl' } }" />

				<Flex stack class="grow self-start">
					<Flex class="gap-2 justify-between">
						<Typography
							variant="mdSemiBold"
							class="text-black line-clamp-1 break-all"
							:title="item.member.name">
							{{ item.member.name }}
						</Typography>

						<Flex
							v-if="item.amountToPay > 0"
							class="gap-2 justify-end shrink-0 py-2"
							@click.stop="transferId = item.member.id">
							<Typography
								variant="xsRegular"
								class="text-sky-700 hover:text-sky-800 cursor-pointer shrink-0">
								Thanh toán dư nợ
							</Typography>
						</Flex>
					</Flex>

					<Flex
						v-for="{ label, value } in item.displayItems"
						:key="label"
						class="justify-between gap-2">
						<Typography variant="xsRegular" class="text-slate-500">{{ label }}</Typography>
						<CurrencyText
							:amount="value"
							amount-class="font-semibold text-md"
							unit-class="text-sm"
							:class="value < 0 ? 'text-red-500' : 'text-green-600'"
							show-sign
							:fixed="0" />
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>

	<Dialog :open="Boolean(detailId)" @close="detailId = null" header="Chi tiết số dư">
		<BalanceDetail v-if="detailId" :id="detailId" />
	</Dialog>

	<TransferPopup v-if="transferId" v-model:member-id="transferId" />
</template>
