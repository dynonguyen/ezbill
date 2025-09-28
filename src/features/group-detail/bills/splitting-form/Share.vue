<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { type BillMember, type MemberId } from '@/types/entities';
import { computed, ref, watch } from 'vue';
import { z } from 'zod';
import { focusOnToggleForDesktop } from '../../helpers/utils';
import { useGroupContext } from '../../hooks/useGroupContext';
import CustomCurrencyText from './CustomCurrencyText.vue';
import SplittingMemberItem from './SplittingMemberItem.vue';
import { useBillFormContext } from './useBillFormContext';

const { participants, memberAmounts, amount } = useBillFormContext();
const { group } = useGroupContext();

const MAX_SHARE_ITEM = 1000;

const getDefaultShares = (memberAmounts: BillMember): BillMember => {
	return Object.fromEntries(Object.keys(memberAmounts).map((id) => [id, 1]));
};

const calculateShares = (memberAmounts: BillMember): BillMember => {
	const minAmount = Math.min(...Object.values(memberAmounts));

	if (minAmount === 0) return getDefaultShares(memberAmounts);

	return Object.fromEntries(
		Object.entries(memberAmounts).map(([id, amount]) => [
			id,
			Number((amount / minAmount).toFixed(2)),
		]),
	);
};

const shares = ref<BillMember>(calculateShares(memberAmounts.value));

const handleInputChange = (ev: Event, id: MemberId) => {
	const target = ev.target as HTMLInputElement;

	const parsed = z.coerce.number().safeParse(target.value);
	if (parsed.error) {
		target.value = target.value.substring(0, target.value.length - 1);
		return;
	}

	const value = parsed.data;

	if (value < 0 || target.value === '') {
		target.value = '';
		delete shares.value[id];
		return;
	}

	if (value > MAX_SHARE_ITEM) {
		target.value = MAX_SHARE_ITEM.toString();
		shares.value[id] = MAX_SHARE_ITEM;
		return;
	}

	shares.value[id] = value;
};

const handleToggle = (enabled: boolean, id: string) => {
	delete shares.value[id];
	if (enabled) {
		focusOnToggleForDesktop(`${id}-share-amount`);
	}
};

const totalShares = computed(() => {
	return Object.values(shares.value).reduce((acc, val) => acc + (val ?? 0), 0);
});

watch(
	() => participants.value.length,
	(val) => {
		if (val === 0) shares.value = {};
	},
);

watch(
	[shares, () => participants.value.length, amount],
	() => {
		const totalAmount = amount.value ?? 0;

		const newMemberAmounts: BillMember = {};

		participants.value.forEach((id) => {
			if (totalShares.value && totalAmount) {
				const share = shares.value[id] ?? 0;
				newMemberAmounts[id] = (share / totalShares.value) * totalAmount;
			} else {
				newMemberAmounts[id] = 0;
			}
		});

		memberAmounts.value = newMemberAmounts;
	},
	{ deep: true, immediate: true },
);
</script>

<template>
	<Flex stack class="gap-2">
		<SplittingMemberItem
			v-for="m in group.members.map((m) => ({
				...m,
				checked: participants.includes(m.id),
			}))"
			:key="m.id"
			:member="m"
			@toggle="handleToggle(!m.checked, m.id)">
			<template v-if="m.checked && shares[m.id]" #info>
				<Flex class="gap-1 text-gray-400" wrap>
					<Typography variant="xsRegular">
						({{ shares[m.id] }} / {{ totalShares }}) phần =
					</Typography>
					<CurrencyText :amount="memberAmounts[m.id] ?? 0" class="text-xs" :fixed="0" />
				</Flex>
			</template>

			<template #action>
				<label v-if="m.checked" class="input input-bordered flex items-center h-10 shrink-0">
					<input
						:id="`${m.id}-share-amount`"
						class="w-14"
						placeholder="0"
						:value="shares[m.id]"
						@input.prevent.stop="(ev) => handleInputChange(ev, m.id)" />
					<span class="text-[10px] font-medium">Phần</span>
				</label>
				<CustomCurrencyText v-else :amount="0" />
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
