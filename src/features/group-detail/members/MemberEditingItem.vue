<script setup lang="ts">
import { removeMember, updateMember } from '@/apis/supabase';
import Flex from '@/components/Flex.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import type { Member } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Divider } from 'primevue';
import { computed, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberForm, { type MemberFormData } from './MemberForm.vue';

const props = defineProps<{ member: Member; index: number }>();
const { group, user } = useGroupContext();
const bills = useBillsContext();
const { mutateAsync: removeMutateAsync, isPending: isRemoving } = useMutation({
	mutationFn: removeMember,
});
const { mutateAsync: updateMutateAsync, isPending: isUpdating } = useMutation({
	mutationFn: updateMember,
});

const toast = useToast();
const queryClient = useQueryClient();

const editing = ref(false);

const disabledDelete = computed(
	() =>
		isRemoving.value ||
		bills.value.some((bill) => bill.members[props.member.id] || bill.createdBy === props.member.id),
);

const handleDelete = async () => {
	if (disabledDelete.value) return;

	const [error] = await to(
		removeMutateAsync({ groupId: group.value.id, memberId: props.member.id }),
	);

	if (error) {
		return toast.error(error.message || 'Không thể xóa thành viên');
	}

	toast.success('Xóa thành viên thành công');
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};

const handleUpdate = async (form: MemberFormData) => {
	const [error] = await to(
		updateMutateAsync({ groupId: group.value.id, updated: { ...form, id: props.member.id } }),
	);

	if (error) {
		return toast.error(error.message || 'Không thể cập nhật thành viên');
	}

	editing.value = false;
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};
</script>

<template>
	<Flex stack>
		<Divider v-if="$props.index > 0" class="!my-4" />

		<MemberForm v-if="editing" :initial-values="$props.member" @submit="handleUpdate">
			<template #right-submit-btn>
				<Flex class="gap-1 shrink-0 self-start mt-3">
					<button
						type="submit"
						:disabled="isUpdating"
						class="icon msi-check-rounded size-6 text-green-500 cursor-pointer hover:text-green-600"></button>
					<span
						class="icon msi-close-rounded size-6 text-red-500 cursor-pointer hover:text-red-600"
						@click="editing = false"></span>
				</Flex>
			</template>
		</MemberForm>
		<Flex v-else class="gap-2 justify-between">
			<MemberAvatar v-bind="$props.member" :show-tooltip="false" class="shrink-0 !size-11" />

			<Typography class="line-clamp-1 break-all grow">
				{{ $props.member.name + ($props.member.id === user.id ? ' (Bạn)' : '') }}
			</Typography>

			<Flex class="gap-2 shrink-0">
				<span
					class="icon msi-edit-outline-rounded text-neutral-500 hover:text-neutral-600 size-6 cursor-pointer"
					@click="editing = true"></span>
				<span
					class="icon msi-delete-outline-rounded size-6"
					@click="handleDelete"
					:class="
						disabledDelete
							? 'text-neutral-400 opacity-50 cursor-not-allowed'
							: 'text-red-500 hover:text-red-600 cursor-pointer'
					"></span>
			</Flex>
		</Flex>
	</Flex>
</template>
