<script setup lang="ts">
import CurrencyInput from '@/components/ui/CurrencyInput.vue';
import Flex from '@/components/ui/Flex.vue';
import { toVND } from '@/utils/helpers';
import { watch } from 'vue';
import { useGroupContext } from '../../hooks/useGroupContext';
import SplittingMemberItem from './SplittingMemberItem.vue';
import { useBillFormContext } from './useBillFormContext';

const { participants, amount, memberAmounts } = useBillFormContext();
const { group } = useGroupContext();

watch([() => participants.value.length, amount], () => {
	console.log(`☕ DYNO DEBUG ~ Exact.vue:12 🦫`);
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
			:member="m">
			<template #action>
				<div @click.stop.prevent>
					<CurrencyInput
						:model-value="memberAmounts[m.id] || 0"
						:input-props="{
							disabled: !m.checked,
							class: 'input-sm w-32 shrink-0',
							placeholder: toVND(12000),
						}" />
				</div>
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
