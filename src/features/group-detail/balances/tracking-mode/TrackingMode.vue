<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Member } from '@/types/entities';
import { computed, ref } from 'vue';
import { useBillsContext } from '../../hooks/useBillsContext';
import { useGroupContext } from '../../hooks/useGroupContext';
import BalanceDetail from './BalanceDetail.vue';
import TransferPopup from './TransferPopup.vue';

type MemberBalance = {
	member: Member;
	amountToPay: number;
	amountReceived: number;
	balance: number;
};

const bills = useBillsContext();
const { group } = useGroupContext();
const detailId = ref<Member['id'] | null>(null);
const transferId = ref<Member['id'] | null>(null);

const balances = computed(() => {
	const result = group.value.members.reduce(
		(acc, member) => {
			acc[member.id] = { member, amountReceived: 0, amountToPay: 0, balance: 0 };
			return acc;
		},
		{} as Record<Member['id'], MemberBalance>,
	);

	bills.value.forEach((bill) => {
		let totalPaid = 0;

		Object.entries(bill.members).forEach(([id, amount]) => {
			const isPaid = bill.paymentTracking.some((i) => i.memberId === id);
			if (bill.createdBy !== id && !isPaid) {
				result[id].amountToPay += amount;
			}

			if (isPaid) {
				totalPaid += amount;
			}
		});

		result[bill.createdBy].amountReceived +=
			bill.amount - totalPaid - (bill.members[bill.createdBy] || 0);
	});

	return Object.values(result).map((item) => {
		const balance = item.amountReceived - item.amountToPay;
		return {
			...item,
			balance,
			displayItems: [
				{ label: 'Cần trả', value: -item.amountToPay },
				{ label: 'Nhận lại', value: item.amountReceived },
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
								Chuyển khoản
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
