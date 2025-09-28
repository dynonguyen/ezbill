<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Member, MemberId } from '@/types/entities';
import { computed, ref } from 'vue';
import { useBillsContext } from '../../hooks/useBillsContext';
import { useGroupContext } from '../../hooks/useGroupContext';
import AccountingMaker from '../../members/AccountingMaker.vue';
import BankQR from '../BankQR.vue';
import BalanceDetail from './BalanceDetail.vue';

const { group } = useGroupContext();
const bills = useBillsContext();

type MemberBalance = { member: Member; paid: number; spent: number; balance: number };

const balances = computed(() => {
	const result = group.value.members.reduce(
		(acc, member) => {
			acc[member.id] = { member, paid: 0, spent: 0, balance: 0 };
			return acc;
		},
		{} as Record<MemberId, MemberBalance>,
	);

	bills.value.forEach((bill) => {
		if (result[bill.createdBy]) {
			result[bill.createdBy].paid += bill.amount;
		}

		Object.entries(bill.members).forEach(([id, amount]) => {
			if (result[id]) result[id].spent += amount;
		});
	});

	Object.values(result).forEach((item) => {
		item.balance = item.paid - item.spent;
	});

	return Object.values(result);
});

const detailId = ref<MemberId | null>(null);
const transferId = ref<MemberId | null>(null);

const transferInfo = computed(() =>
	balances.value.find((item) => item.member.id === transferId.value),
);
const accounting = computed(() => group.value.members.find((member) => member.isAccounting));
const transferTooltip = computed(() => {
	if (!transferInfo.value) return '';
	return transferInfo.value.balance < 0
		? `Cần chuyển khoản cho kế toán <b>${accounting?.value?.name}</b> số tiền là `
		: `Kế toán <b>${accounting?.value?.name}</b> cần chuyển khoản cho <b>${transferInfo?.value?.member.name}</b> số tiền là `;
});
const bankInfo = computed(() =>
	Number(transferInfo.value?.balance) < 0
		? accounting.value?.bankInfo
		: transferInfo.value?.member.bankInfo,
);
const transferMember = computed(() =>
	Number(transferInfo.value?.balance) < 0 ? accounting.value : transferInfo.value?.member,
);
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
				<AccountingMaker :show="item.member.isAccounting" class="size-[60px]">
					<MemberAvatar
						v-bind="item.member"
						:pt="{ avatar: { class: '!size-[60px] shrink-0' }, text: { class: '!text-2xl' } }" />
				</AccountingMaker>

				<Flex stack class="grow self-start">
					<Flex class="gap-2 justify-between">
						<Typography
							variant="mdSemiBold"
							class="text-black line-clamp-1 break-all"
							:title="item.member.name">
							{{ item.member.name }}
						</Typography>

						<Flex
							v-if="item.balance !== 0 && !item.member.isAccounting"
							class="gap-2 justify-end shrink-0 py-2"
							@click.stop="transferId = item.member.id">
							<Typography
								variant="xsRegular"
								class="text-sky-700 hover:text-sky-800 cursor-pointer shrink-0">
								{{ item.balance < 0 ? 'Thanh toán dư nợ' : 'Nhận chuyển khoản' }}
							</Typography>
						</Flex>
					</Flex>

					<Flex class="justify-between gap-2">
						<Typography variant="xsRegular" class="text-slate-500">Đã chi:</Typography>
						<CurrencyText
							:amount="item.paid"
							amount-class="font-semibold text-md"
							unit-class="text-sm"
							:fixed="0" />
					</Flex>

					<Flex class="justify-between gap-2">
						<Typography variant="xsRegular" class="text-slate-500">Đã tiêu:</Typography>
						<CurrencyText
							:amount="item.spent"
							amount-class="font-semibold text-md"
							unit-class="text-sm"
							:fixed="0" />
					</Flex>

					<Flex class="justify-between gap-2">
						<Typography variant="xsRegular" class="text-slate-500">Nhận/Trả lại:</Typography>
						<CurrencyText
							:amount="item.balance"
							:class="item.balance >= 0 ? ' text-green-600' : ' text-red-500'"
							show-sign
							:fixed="0"
							amount-class="font-semibold text-md"
							unit-class="text-sm" />
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>

	<Dialog :open="Boolean(detailId)" header="Chi tiết số dư" @close="detailId = null">
		<BalanceDetail v-if="detailId" :id="detailId" />
	</Dialog>

	<Dialog :open="Boolean(transferId)" header="Chuyển khoản" @close="transferId = null">
		<Flex v-if="!accounting" class="gap-2 bg-yellow-200 rounded-lg p-4">
			Chưa có kế toán trong nhóm. Thêm kế toán trong phần chỉnh sửa thành viên.
		</Flex>
		<Flex v-else-if="transferInfo" stack class="gap-4">
			<Flex class="p-4 rounded-lg bg-blue-100">
				<Typography variant="smRegular" class="text-slate-600">
					<span v-html="transferTooltip"></span>
					<CurrencyText
						:amount="Math.abs(transferInfo.balance)"
						:fixed="0"
						class="inline-flex"
						amount-class="font-semibold text-md"
						unit-class="text-sm font-semibold" />
				</Typography>
			</Flex>

			<Typography v-if="!bankInfo" variant="smRegular" class="text-amber-600">
				Chưa có thông tin chuyển khoản của
				<b>{{ transferMember?.name }}</b>
			</Typography>

			<BankQR
				:bank-info="bankInfo"
				:amount="Math.abs(transferInfo.balance)"
				:member="transferMember!"
				:is-accounting="transferInfo.balance < 0" />
		</Flex>
	</Dialog>
</template>
