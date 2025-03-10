<script setup lang="ts">
import { removeMember, updateMember } from '@/apis/supabase';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import { useToast } from '@/hooks/useToast';
import type { Member } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { computed, ref } from 'vue';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import AccountingMaker from './AccountingMaker.vue';
import MemberForm, { type MemberFormData } from './MemberForm.vue';

const props = defineProps<{ member: Member; index: number }>();
const { group } = useGroupContext();
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

	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};

const handleUpdate = async (form: MemberFormData) => {
	const [error] = await to(
		updateMutateAsync({ groupId: group.value.id, newValue: { ...form, id: props.member.id } }),
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
		<div v-if="index > 0" class="!my-2 divider" />

		<Flex class="gap-2 justify-between">
			<AccountingMaker :show="member.isAccounting">
				<MemberAvatar v-bind="member" :show-tooltip="false" class="shrink-0" />
			</AccountingMaker>

			<Typography variant="smRegular" class="line-clamp-1 break-all grow">
				{{ member.name }}
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

	<Dialog v-model:open="editing" header="Chỉnh sửa thành viên">
		<MemberForm :initial-values="member as MemberFormData" @submit="handleUpdate">
			<template #action-btn>
				<Flex class="gap-2" items-fluid>
					<Button variant="soft" color="grey" @click="editing = false">Đóng</Button>
					<Button type="submit" :loading="isUpdating">Cập nhật</Button>
				</Flex>
			</template>
		</MemberForm>
	</Dialog>
</template>
