<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import type { Member } from '@/types/entities';
import { useGroupContext } from '../hooks/useGroupContext';

defineEmits<{ select: [member: Member] }>();

const { group } = useGroupContext();
</script>

<template>
	<Typography v-if="!group.members.length" class="text-muted-color">Chưa có thành viên</Typography>
	<div v-else stack class="grid grid-cols-4 gap-4">
		<Flex
			v-for="member in group.members"
			:key="member.id"
			stack
			center
			class="gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-100 h-full justify-start"
			@click="$emit('select', member)">
			<MemberAvatar v-bind="member" :show-tooltip="false" />
			<Typography variant="smMedium" class="break-words text-center">{{ member.name }}</Typography>
		</Flex>
	</div>
</template>
