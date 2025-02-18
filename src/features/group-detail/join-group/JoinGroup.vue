<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import GoHomeArrow from '@/components/GoHomeArrow.vue';
import Typography from '@/components/Typography.vue';
import { useLocalDBStore } from '@/stores/local-db';
import type { Member } from '@/types/entities';
import { Tab, TabList, Tabs } from 'primevue';
import { ref } from 'vue';
import { useAppLayout } from '../hooks/useAppLayout';
import { useGroupContext } from '../hooks/useGroupContext';
import ExistingMember from './ExistingMember.vue';
import NewMember from './NewMember.vue';

enum TabValue {
	New = '0',
	Existed = '1',
}

const { group } = useGroupContext();
const localDBStore = useLocalDBStore();
const tab = ref(group.value.members.length ? TabValue.Existed : TabValue.New);

useAppLayout({ overflow: true });

const handleSelectMember = (member: Member) => {
	localDBStore.joinGroup(group.value.id, member.id);
};
</script>

<template>
	<Flex stack class="gap-4">
		<Flex class="gap-2">
			<GoHomeArrow />
			<Typography variant="xlSemiBold" class="break-words">
				Tham gia vào nhóm "{{ group.name }}"
			</Typography>
		</Flex>

		<Tabs v-model:value="tab">
			<TabList>
				<Tab :value="TabValue.New">Thành viên mới</Tab>
				<Tab :value="TabValue.Existed">Chọn thành viên đã có</Tab>
			</TabList>

			<div class="mt-4 overflow-auto">
				<NewMember v-if="tab === TabValue.New" />
				<ExistingMember v-else-if="tab === TabValue.Existed" @select="handleSelectMember" />
			</div>
		</Tabs>
	</Flex>
</template>
