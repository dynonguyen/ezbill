<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useToast } from '@/hooks/useToast';
import type { Member, MemberId } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { computed, ref } from 'vue';
import { useApiClient } from '../../../hooks/useApiClient';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupQueryControl } from '../hooks/useGroupQueryControl';
import AccountingIcon from './AccountingIcon.vue';
import MemberEditingForm from './MemberEditingPopup.vue';

const apiClient = useApiClient();
const props = defineProps<{ member: Member; index: number }>();
const { group, isAccountantMode } = useGroupContext();
const bills = useBillsContext();
const { mutateAsync: removeMutateAsync, isPending: isRemoving } = useMutation({
	mutationFn: (memberId: MemberId) => apiClient.removeMember(group.value.id, memberId),
});

const toast = useToast();
const { refetchGroup } = useGroupQueryControl();

const editing = ref(false);

const disabledDelete = computed(
	() =>
		isRemoving.value ||
		bills.value.some(
			(bill) =>
				bill.members.some((m) => m.memberId === props.member.id) ||
				bill.createdBy === props.member.id,
		),
);

const handleDelete = async () => {
	if (disabledDelete.value) return;

	const [error] = await to(removeMutateAsync(props.member.id));

	if (error) {
		return toast.errorWithRetry(error.message || 'Không thể Xoá thành viên', () => handleDelete());
	}

	refetchGroup();
};
</script>

<template>
	<Flex stack>
		<div v-if="index > 0" class="!my-2 divider"></div>

		<Flex class="gap-2 justify-between">
			<MemberAvatar v-bind="member" :show-tooltip="false" class="shrink-0" />

			<Flex class="grow gap-2 relative">
				<Typography :title="member.name" variant="smRegular" class="line-clamp-1 break-all">
					{{ member.name }}
				</Typography>
				<span
					v-if="isAccountantMode && member.isAccounting"
					data-tip="Kế toán"
					class="tooltip tooltip-top shrink-0">
					<AccountingIcon />
				</span>
			</Flex>

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

	<MemberEditingForm v-model:open="editing" :member="member" />
</template>
