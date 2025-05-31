<script setup lang="ts">
import CurrencyInput from '@/components/ui/CurrencyInput.vue';
import Flex from '@/components/ui/Flex.vue';
import type { BillMember } from '@/types/entities';
import { debounce, toVND } from '@/utils/helpers';
import { computed, watch } from 'vue';
import { focusOnToggleForDesktop, getTotalMemberAmount } from '../../helpers/utils';
import { useGroupContext } from '../../hooks/useGroupContext';
import CustomCurrencyText from './CustomCurrencyText.vue';
import SplittingMemberItem from './SplittingMemberItem.vue';
import { useBillFormContext } from './useBillFormContext';

const { participants, memberAmounts, amount } = useBillFormContext();
const { group } = useGroupContext();

watch([() => participants.value.length], () => {
	const newMemberAmount: BillMember = {};

	participants.value.map((id) => {
		newMemberAmount[id] = memberAmounts.value[id] || 0;
	});

	memberAmounts.value = newMemberAmount;
});

const handleMemberAmountChange = debounce((id: string, value: number) => {
	memberAmounts.value[id] = value;
}, 350);

const handleToggle = (enabled: boolean, id: string) => {
	if (enabled) {
		focusOnToggleForDesktop(`${id}-exact-amount`);
	}
};

const remaining = computed(() => {
	const nRemainingMembers = participants.value.filter((id) => !memberAmounts.value[id]).length;

	if (nRemainingMembers === 0) return 0;

	const total = getTotalMemberAmount(memberAmounts.value || {});
	const totalRemaining = total > (amount.value ?? 0) ? 0 : (amount.value ?? 0) - total;

	return totalRemaining / nRemainingMembers;
});
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
			<template #action>
				<CurrencyInput
					v-if="m.checked"
					@change="(v) => handleMemberAmountChange(m.id, Number(v))"
					:model-value="m.checked ? memberAmounts[m.id] || 0 : 0"
					:input-props="{
						id: `${m.id}-exact-amount`,
						class: 'h-10 w-40 shrink-0',
						placeholder: toVND(remaining),
					}" />
				<CustomCurrencyText v-else :amount="0" />
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
