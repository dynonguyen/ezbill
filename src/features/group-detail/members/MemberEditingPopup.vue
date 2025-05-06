<script setup lang="ts">
import { updateMember } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import { useToast } from '@/hooks/useToast';
import type { Member } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useRealtimeChannel';
import type { MemberFormData } from './MemberForm.vue';
import MemberForm from './MemberForm.vue';

const props = defineProps<{ member: Member }>();
const open = defineModel('open', { default: false });

const { group } = useGroupContext();

const { mutateAsync: updateMutateAsync, isPending: isUpdating } = useMutation({
	mutationFn: updateMember,
});

const toast = useToast();
const { refetchGroup } = useGroupQueryControl();

const handleUpdate = async (form: MemberFormData) => {
	const [error] = await to(
		updateMutateAsync({ groupId: group.value.id, newValue: { ...form, id: props.member.id } }),
	);

	if (error) {
		return toast.error(error.message || 'Không thể cập nhật thành viên');
	}

	open.value = false;
	refetchGroup();
};
</script>

<template>
	<Dialog v-model:open="open" header="Chỉnh sửa thành viên">
		<MemberForm :initial-values="member as MemberFormData" @submit="handleUpdate">
			<template #action-btn>
				<Flex class="gap-2" items-fluid>
					<Button variant="soft" color="grey" @click="open = false">Đóng</Button>
					<Button type="submit" :loading="isUpdating">Cập nhật</Button>
				</Flex>
			</template>
		</MemberForm>
	</Dialog>
</template>
