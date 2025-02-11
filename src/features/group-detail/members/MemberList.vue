<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import ContainerBox from '../ContainerBox.vue';
import { useGroupContext } from '../hooks/useGroupContext';
import AddMember from './AddMember.vue';

const { group, user } = useGroupContext();
</script>

<template>
	<ContainerBox :label="`Thành viên (${group.members.length})`">
		<Flex class="gap-1 py-2 overflow-auto items-start">
			<AddMember />
			<Flex
				v-for="member in group.members.map((m) => ({
					...m,
					title: m.name + (m.id === user?.id ? ' (Bạn)' : ''),
				}))"
				:key="member.id"
				stack
				center
				class="gap-2 size-20 justify-start shrink-0">
				<MemberAvatar v-bind="member" :show-tooltip="false" class="!size-12 shrink-0" />
				<Typography
					variant="smRegular"
					class="text-center break-all line-clamp-1"
					:title="member.title">
					{{ member.title }}
				</Typography>
			</Flex>
		</Flex>
	</ContainerBox>
</template>
