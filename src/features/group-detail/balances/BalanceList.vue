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
import BalanceDetail from './BalanceDetail.vue';

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
</script>

<template>
	<Flex v-if="!bills.length" center>
		<img :src="getImgUrl('no-bills-2.svg')" class="size-[300px]" />
	</Flex>
	<Flex v-else stack class="gap-2">
		<Flex v-for="item in amounts" :key="item.member.id" class="p-4 rounded-xl bg-gray-100 gap-4">
			<MemberAvatar
				v-bind="item.member"
				:pt="{ avatar: { class: '!size-[60px] shrink-0' }, text: { class: '!text-2xl' } }" />

			<Flex stack class="grow self-start">
				<Flex class="gap-2 justify-between">
					<Typography variant="mdSemiBold" class="text-black line-clamp-1 break-all">
						{{ item.member.name }}
					</Typography>
					<Typography
						variant="xsRegular"
						class="text-indigo-700 hover:text-indigo-800 cursor-pointer shrink-0"
						@click="detailId = item.member.id">
						Chi tiết
					</Typography>
				</Flex>

				<Flex class="justify-between gap-2">
					<Typography variant="xsRegular" class="text-slate-500">Đã chi:</Typography>
					<CurrencyText
						:amount="item.paid"
						amount-class="font-semibold text-md"
						unit-class="text-sm" />
				</Flex>

				<Flex class="justify-between gap-2">
					<Typography variant="xsRegular" class="text-slate-500">Nhận lại:</Typography>
					<CurrencyText
						:amount="item.balance"
						:class="item.balance >= 0 ? ' text-green-600' : ' text-red-500'"
						show-sign
						amount-class="font-semibold text-md"
						unit-class="text-sm" />
				</Flex>
			</Flex>
		</Flex>
	</Flex>

	<Dialog :open="Boolean(detailId)" header="Chi tiết số dư" @close="detailId = null">
		<BalanceDetail v-if="detailId" :id="detailId" />
		<template #action>
			<Button variant="soft" color="grey" class="w-full" @click="detailId = null">Đóng</Button>
		</template>
	</Dialog>
</template>
