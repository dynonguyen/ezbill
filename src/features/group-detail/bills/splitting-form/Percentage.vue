<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { BillMember, Member } from '@/types/entities';
import { computed, nextTick, ref, watch } from 'vue';
import { z } from 'zod';
import { getTotalMemberAmount } from '../../helpers/utils';
import { useGroupContext } from '../../hooks/useGroupContext';
import CustomCurrencyText from './CustomCurrencyText.vue';
import SplittingMemberItem from './SplittingMemberItem.vue';
import { useBillFormContext } from './useBillFormContext';

const { participants, memberAmounts, amount } = useBillFormContext();
const { group } = useGroupContext();

const MAX_PERCENTAGE_ITEM = 100;

const getInitialPercentage = () => {
	const totalAmount = getTotalMemberAmount(memberAmounts.value);
	if (!totalAmount || !Object.keys(memberAmounts.value).length) return {};

	return Object.fromEntries(
		Object.keys(memberAmounts.value).map((id) => [
			id,
			(memberAmounts.value[id] / totalAmount) * 100,
		]),
	) as BillMember;
};

const memberPercentage = ref<BillMember>(getInitialPercentage());

const remainingMembers = computed(() => {
	return participants.value.filter((id) => !isPercentageValid(memberPercentage.value[id])).length;
});

const totalPercentage = computed<[memberTotalPercentage: number, totalPercentage: number]>(() => {
	const total = Object.values(memberPercentage.value).reduce((acc, val) => acc + (val ?? 0), 0);
	return [total, total > 100 || !remainingMembers.value ? total : 100];
});

const remainingPercentagePerMember = computed(() =>
	remainingMembers.value === 0 || totalPercentage.value[0] >= 100
		? 0
		: (100 - totalPercentage.value[0]) / remainingMembers.value,
);

const isPercentageValid = (val?: string | number) => {
	return typeof val === 'number' && val >= 0;
};

watch(
	() => participants.value.length,
	(val) => {
		if (val === 0) memberPercentage.value = {};
	},
);

watch(
	[memberPercentage, () => participants.value.length, amount],
	() => {
		const totalAmount = amount.value ?? 0;

		const newMemberAmounts: BillMember = {};
		participants.value.forEach((id) => {
			const mPercent = isPercentageValid(memberPercentage.value[id])
				? memberPercentage.value[id]
				: remainingPercentagePerMember.value;

			if (mPercent) {
				newMemberAmounts[id] = totalAmount * (mPercent / totalPercentage.value[1]);
			}
		});

		memberAmounts.value = newMemberAmounts;
	},
	{ deep: true, immediate: true },
);

const handleInputChange = (ev: Event, id: Member['id']) => {
	const target = ev.target as HTMLInputElement;

	const parsed = z.coerce.number().safeParse(target.value);
	if (parsed.error) {
		target.value = target.value.substring(0, target.value.length - 1);
		return;
	}

	const value = parsed.data;

	if (value < 0 || target.value === '') {
		target.value = '';
		delete memberPercentage.value[id];
		return;
	}

	if (value > MAX_PERCENTAGE_ITEM) {
		target.value = MAX_PERCENTAGE_ITEM.toString();
		memberPercentage.value[id] = MAX_PERCENTAGE_ITEM;
		return;
	}

	memberPercentage.value[id] = value;
};

const handleFocusOnToggle = (enabled: boolean, id: string) => {
	delete memberPercentage.value[id];
	if (enabled) {
		nextTick(() => {
			document.getElementById(`${id}-percentage-amount`)?.focus();
		});
	}
};

const getShortPercentage = (value: number) => {
	return value.toFixed(2).replace(/\.00$/, '');
};
</script>

<template>
	<Flex stack class="gap-2">
		<SplittingMemberItem
			v-for="m in group.members.map((m) => ({
				...m,
				percentage: memberPercentage[m.id] || remainingPercentagePerMember,
				checked: participants.includes(m.id),
			}))"
			:key="m.id"
			:member="m"
			@toggle="handleFocusOnToggle(!m.checked, m.id)">
			<template v-if="m.checked && m.percentage" #info>
				<Flex class="gap-1 text-gray-400" wrap>
					<Typography variant="xsRegular">
						({{ getShortPercentage(m.percentage) }} / {{ getShortPercentage(totalPercentage[1]) }})%
						=
					</Typography>
					<CurrencyText :amount="memberAmounts[m.id] ?? 0" class="text-xs" :fixed="0" />
				</Flex>
			</template>

			<template #action>
				<label v-if="m.checked" class="input input-bordered flex items-center h-10 shrink-0">
					<input
						:id="`${m.id}-percentage-amount`"
						class="w-16"
						:placeholder="getShortPercentage(remainingPercentagePerMember)"
						:value="memberPercentage[m.id]"
						@input.prevent.stop="(ev) => handleInputChange(ev, m.id)" />
					<span class="icon msi-percent size-4 opacity-70 shrink-0"></span>
				</label>
				<CustomCurrencyText v-else :amount="0" />
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
