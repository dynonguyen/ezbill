<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Member } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { computed, ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import AccountingMaker from '../members/AccountingMaker.vue';
import BalanceDetail from './BalanceDetail.vue';
import BankQR from './BankQR.vue';

const { group } = useGroupContext();
const bills = useBillsContext();

type MemberBalance = { member: Member; paid: number; spent: number; balance: number };

const amounts = computed(() => {
	const result = group.value.members.reduce(
		(acc, member) => {
			acc[member.id] = { member, paid: 0, spent: 0, balance: 0 };
			return acc;
		},
		{} as Record<Member['id'], MemberBalance>,
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

const detailId = ref<Member['id'] | null>(null);
const transferId = ref<Member['id'] | null>(null);

const transferInfo = computed(() =>
	amounts.value.find((item) => item.member.id === transferId.value),
);

const accounting = computed(() => group.value.members.find((member) => member.isAccounting));
</script>

<template>
	<Flex v-if="!bills.length" center>
		<img :src="getImgUrl('no-bills-2.svg')" class="size-[300px]" />
	</Flex>
	<template v-else>
		<Flex stack class="gap-2">
			<Flex
				v-for="item in amounts"
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
							<Typography variant="mdSemiBold" class="text-black line-clamp-1 break-all">
								{{ item.member.name }}
							</Typography>
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
							<Typography variant="xsRegular" class="text-slate-500">Nhận lại:</Typography>
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

				<Flex class="gap-2 justify-end shrink-0">
					<Typography
						v-if="item.balance !== 0 && !item.member.isAccounting"
						variant="xsRegular"
						class="text-sky-700 hover:text-sky-800 cursor-pointer shrink-0"
						@click.stop="transferId = item.member.id">
						Chuyển khoản
					</Typography>
				</Flex>
			</Flex>
		</Flex>

		<Dialog :open="Boolean(detailId)" header="Chi tiết số dư" @close="detailId = null">
			<BalanceDetail v-if="detailId" :id="detailId" />
			<template #action>
				<Button variant="soft" color="grey" class="w-full" @click="detailId = null">Đóng</Button>
			</template>
		</Dialog>

		<Dialog :open="Boolean(transferId)" header="Chuyển khoản" @close="transferId = null">
			<Flex v-if="!accounting" class="gap-2 bg-yellow-200 rounded-lg p-4">
				Chưa có kế toán trong nhóm. Thêm kế toán trong phần chỉnh sửa thành viên.
			</Flex>
			<Flex v-else-if="transferInfo" stack class="gap-4">
				<Flex class="p-4 rounded-lg bg-blue-100">
					<Typography variant="smRegular" v-if="transferInfo.balance < 0" class="text-slate-600">
						Cần chuyển khoản cho kế toán
						<strong>{{ accounting?.name }}</strong>
						số tiền là
						<CurrencyText
							:amount="Math.abs(transferInfo.balance)"
							:fixed="0"
							class="inline-flex"
							amount-class="font-semibold text-md"
							unit-class="text-sm" />
					</Typography>
					<Typography v-else>
						Kế toán
						<strong>{{ accounting?.name }}</strong>
						cần chuyển khoản cho bạn số tiền là
						<CurrencyText
							:amount="Math.abs(transferInfo.balance)"
							:fixed="0"
							class="inline-flex"
							amount-class="font-semibold text-md"
							unit-class="text-sm" />
					</Typography>
				</Flex>

				<BankQR
					:bank-info="
						transferInfo.balance < 0 ? accounting?.bankInfo : transferInfo.member.bankInfo
					"
					:amount="Math.abs(transferInfo.balance)"
					:member="transferInfo.balance < 0 ? accounting : transferInfo.member"
					:is-accounting="transferInfo.balance < 0" />
			</Flex>

			<template #action>
				<Button variant="soft" color="grey" @click="transferId = null" class="w-full">Đóng</Button>
			</template>
		</Dialog>
	</template>
</template>
