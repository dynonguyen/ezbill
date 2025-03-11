<script setup lang="ts">
import { addMember } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import { useToast } from '@/hooks/useToast';
import type { Member } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import MemberForm, { type MemberFormData } from './MemberForm.vue';

const open = ref(false);

const { group } = useGroupContext();
const toast = useToast();
const { isPending, mutateAsync } = useMutation({ mutationFn: addMember });
const { refetchGroup } = useGroupQueryControl();

const handleAddMember = async (form: MemberFormData) => {
	const id = generateUUID();
	const newMember: Member = { ...form, id };

	const [error] = await to(mutateAsync({ groupId: group.value.id, member: newMember }));

	if (error) {
		return toast.error(error.message || 'Thêm thành viên thất bại');
	}

	refetchGroup();
	open.value = false;
};
</script>

<template>
	<slot name="new-btn" :handleOpen="() => (open = true)"></slot>

	<Dialog v-model:open="open" header="Thêm thành viên">
		<MemberForm @submit="handleAddMember">
			<template #action-btn>
				<Flex class="gap-2" items-fluid>
					<Button type="button" variant="soft" color="grey" @click="open = false">Đóng</Button>
					<Button type="submit" :loading="isPending">Tạo</Button>
				</Flex>
			</template>
		</MemberForm>
	</Dialog>
</template>
