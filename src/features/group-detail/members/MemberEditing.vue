<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import { Button, Dialog, Message } from 'primevue';
import { ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberEditingItem from './MemberEditingItem.vue';

const { group } = useGroupContext();

const open = ref(false);
</script>

<template>
	<Button
		variant="text"
		icon="icon msi-edit-outline-rounded"
		label="Chỉnh sửa"
		icon-pos="right"
		severity="secondary"
		size="small"
		@click="open = true" />

	<Dialog
		:draggable="false"
		v-model:visible="open"
		modal
		header="Chỉnh sửa thành viên"
		:pt="{ header: { class: '!pb-0' }, content: { class: '!p-0' } }">
		<div class="p-4">
			<Message severity="info">
				Bạn không thể xoá các thành viên đã tồn tại trong bill bất kì.
			</Message>
		</div>

		<Flex stack class="px-4 max-h-120 overflow-auto">
			<MemberEditingItem
				v-for="(member, index) in group.members"
				:key="member.id"
				:member="member"
				:index="index" />
		</Flex>

		<Flex class="justify-end mt-2 p-4">
			<Button variant="outlined" label="Đóng" @click="open = false" />
		</Flex>
	</Dialog>
</template>
