<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import type { BillMember } from '@/types/entities';
import { watch } from 'vue';
import { useGroupContext } from '../../hooks/useGroupContext';
import CustomCurrencyText from './CustomCurrencyText.vue';
import SplittingMemberItem from './SplittingMemberItem.vue';
import { useBillFormContext } from './useBillFormContext';

const { participants, amount, memberAmounts } = useBillFormContext();
const { group } = useGroupContext();

watch([() => participants.value.length, amount], () => {
	const nParticipants = participants.value.length;

	memberAmounts.value = participants.value.reduce((acc, id) => {
		acc[id] = (amount.value || 0) / nParticipants;
		return acc;
	}, {} as BillMember);
});
</script>

<template>
	<Flex stack class="gap-2">
		<SplittingMemberItem
			v-for="m in group.members.map((m) => ({ ...m, checked: participants.includes(m.id) }))"
			:key="m.id"
			:member="m">
			<template #action>
				<CustomCurrencyText :amount="memberAmounts[m.id] || 0" />
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
