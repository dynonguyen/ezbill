<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import { QUERY_KEY } from '@/constants/key';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/vue-query';
import { Dialog } from 'primevue';
import { ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import NewMember from '../join-group/NewMember.vue';

const open = ref(false);

const queryClient = useQueryClient();
const { group } = useGroupContext();
const toast = useToast();

const handleAddMemberSuccess = () => {
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
	open.value = false;
	toast.success({ detail: 'Thêm thành viên thành công', summary: 'Thành công' });
};
</script>

<template>
	<Flex
		center
		class="size-10 border border-dashed border-neutral-500 rounded-full cursor-pointer hover:border-neutral-800 hover:bg-neutral-100 shrink-0"
		@click="open = true">
		<span class="icon msi-add-2-rounded text-neutral-800" />
	</Flex>

	<Dialog
		:draggable="false"
		v-model:visible="open"
		modal
		:header="'Thêm thành viên'"
		class="w-100 max-w-full">
		<NewMember submit-label="Thêm" @success="handleAddMemberSuccess" />
	</Dialog>
</template>
