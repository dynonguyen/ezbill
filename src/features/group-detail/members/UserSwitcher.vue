<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import { useLocalDBStore } from '@/stores/local-db';
import { Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { computed, ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';

const { user, group } = useGroupContext();
const localDBStore = useLocalDBStore();
const op = ref();

const toggle = (event: HTMLElement) => {
	op.value.toggle(event);
};

const items = computed<MenuItem[]>(
	() =>
		group.value.members
			?.filter((m) => m.id !== user.value?.id)
			.map((member) => ({
				label: member.name,
				member,
				command: () => localDBStore.joinGroup(group.value.id, member.id),
			})) as MenuItem[],
);
</script>

<template>
	<MemberAvatar
		class="shrink-0 cursor-pointer !size-12"
		v-if="user"
		v-bind="user"
		@click="toggle"
		:show-tooltip="false" />

	<Menu ref="op" :model="items" popup :pt="{ list: { class: 'max-h-80 overflow-auto' } }">
		<template #start>
			<Typography variant="mdSemiBold" class="px-3 pt-2 break-words max-w-40 line-clamp-1">
				{{ user?.name }}
			</Typography>
			<Typography variant="mdMedium" class="px-3 pt-2 text-neutral-500">Đổi thành viên</Typography>
		</template>

		<template #item="{ item }">
			<Flex class="px-3 py-2 gap-3 cursor-pointer">
				<MemberAvatar v-bind="item.member" :show-tooltip="false" class="!size-6" />
				<Typography variant="smMedium">{{ item.member.name }}</Typography>
			</Flex>
		</template>
	</Menu>
</template>
