<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import { watch } from 'vue';
import { getMemberAmount, splitEqually } from '../../helpers/utils';
import { useGroupContext } from '../../hooks/useGroupContext';
import CustomCurrencyText from './CustomCurrencyText.vue';
import SplittingMemberItem from './SplittingMemberItem.vue';
import { useBillFormContext } from './useBillFormContext';

const { participants, amount, memberAmounts } = useBillFormContext();
const { group } = useGroupContext();

watch([() => participants.value.length, amount], () => {
	memberAmounts.value = splitEqually(amount.value || 0, participants.value);
});
</script>

<template>
	<Flex stack class="gap-2">
		<SplittingMemberItem
			v-for="m in group.members.map((m) => ({ ...m, checked: participants.includes(m.id) }))"
			:key="m.id"
			:member="m">
			<template #action>
				<CustomCurrencyText :amount="getMemberAmount(memberAmounts, m.id)" />
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
