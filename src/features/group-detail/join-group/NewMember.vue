<script setup lang="ts">
import { addMember } from '@/apis/supabase';
import { QUERY_KEY } from '@/constants/key';
import { useLocalDBStore } from '@/stores/local-db';
import type { Member } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Button } from 'primevue';
import { useToast } from 'vue-toastification';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberForm, { type MemberFormData } from '../members/MemberForm.vue';

withDefaults(defineProps<{ submitLabel?: string }>(), { submitLabel: 'Tham gia' });

const { isPending, mutateAsync } = useMutation({ mutationFn: addMember });
const queryClient = useQueryClient();
const localDBStore = useLocalDBStore();
const { group } = useGroupContext();
const toast = useToast();

const handleAddMember = async (form: MemberFormData) => {
	const id = generateUUID();
	const newMember: Member = { ...form, id };

	const [error] = await to(mutateAsync({ groupId: group.value.id, member: newMember }));

	if (error) {
		return toast.error(error.message || 'Thêm thành viên thất bại');
	}

	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
	localDBStore.joinGroup(group.value.id, id);
};
</script>

<template>
	<MemberForm @submit="handleAddMember">
		<template #bottom-submit-btn>
			<Button type="submit" label="Tham gia" :loading="isPending" />
		</template>
	</MemberForm>
</template>
