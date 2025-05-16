<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
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
				<input class="input input-sm input-bordered w-5" @click.stop />
			</template>
		</SplittingMemberItem>
	</Flex>
</template>
