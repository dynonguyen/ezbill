<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Member } from '@/types/entities';
import AccountingIcon from '../../members/AccountingIcon.vue';
import { useBillFormContext } from './useBillFormContext';

defineProps<{ member: Member & { checked?: boolean } }>();
defineEmits<{ toggle: [] }>();

const { toggleParticipant } = useBillFormContext();
</script>

<template>
	<Flex
		class="gap-2 justify-between px-2 rounded-lg cursor-pointer hover:bg-gray-100"
		:class="{ 'opacity-50': !member.checked }">
		<Flex
			class="gap-2 grow py-2"
			@click="
				() => {
					toggleParticipant(member.id);
					$emit('toggle');
				}
			">
			<input type="checkbox" class="checkbox checkbox-primary" :checked="member.checked" />
			<MemberAvatar v-bind="member" />
			<Typography
				variant="smMedium"
				class="line-clamp-1 break-all"
				:class="{ 'line-through': !member.checked }"
				:title="member.name">
				{{ member.name }}
			</Typography>
			<AccountingIcon v-if="member.isAccounting" />
		</Flex>

		<div class="py-2 shrink-0" v-if="$slots.action">
			<slot name="action"></slot>
		</div>
	</Flex>
</template>
