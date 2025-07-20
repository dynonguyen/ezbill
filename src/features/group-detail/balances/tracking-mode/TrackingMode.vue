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

type MemberBalance = { member: Member; amountToPay: number; amountReceived: number };

const bills = useBillsContext();
const { group } = useGroupContext();
const detailId = ref<Member['id'] | null>(null);

const balances = computed<MemberBalance[]>(() => {
	const result = group.value.members.reduce(
		(acc, member) => {
			acc[member.id] = { member, amountReceived: 0, amountToPay: 0 };
			return acc;
		},
		{} as Record<Member['id'], MemberBalance>,
	);

	bills.value.forEach((bill) => {
		const paidMembers = bill.paymentTracking.reduce((acc, tracking) => {
			acc.add(tracking.memberId);
			return acc;
		}, new Set<string>());

		Object.entries(bill.members).forEach(([id, amount]) => {
			console.log(`☕ DYNO DEBUG ~ TrackingMode.vue:36 🦫\n`, id, amount, paidMembers);
		});
	});

	return Object.values(result);
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
					</Flex>

					<Flex class="justify-between gap-2">
						<Typography variant="xsRegular" class="text-slate-500">Nhận lại:</Typography>
						<CurrencyText
							:amount="item.amountReceived"
							amount-class="font-semibold text-md"
							unit-class="text-sm"
							class="text-green-600"
							show-sign
							:fixed="0" />
					</Flex>

					<Flex class="justify-between gap-2">
						<Typography variant="xsRegular" class="text-slate-500">Cần trả:</Typography>
						<CurrencyText
							:amount="-item.amountToPay"
							amount-class="font-semibold text-md"
							unit-class="text-sm"
							class="text-red-500"
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
</template>
