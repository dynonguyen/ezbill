<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Autocomplete from '@/components/ui/Autocomplete.vue';
import Flex from '@/components/ui/Flex.vue';
import type { Bill } from '@/types/entities';
import { computed } from 'vue';
import { useGroupContext } from './hooks/useGroupContext';
import AccountingIcon from './members/AccountingIcon.vue';

const { group } = useGroupContext();
const value = defineModel<Bill['createdBy'] | null>('value');

const createdByOptions = computed(() => {
	return group.value.members
		.map((member) => ({ ...member, value: member.id }))
		.sort((a, b) => (a.isAccounting || b.isAccounting ? -1 : 1));
});
</script>

<template>
	<Autocomplete :options="createdByOptions" v-model:value="value" label="name">
		<template v-slot:option="{ option }">
			<Flex class="gap-2 w-full">
				<MemberAvatar v-bind="option" size="sm" />
				<span>{{ option.name }}</span>
				<AccountingIcon v-if="option.isAccounting" />
			</Flex>
		</template>
	</Autocomplete>
</template>
