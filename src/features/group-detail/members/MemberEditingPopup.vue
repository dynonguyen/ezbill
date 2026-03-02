<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import { useToast } from '@/hooks/useToast';
import type { ApiUpdateMemberReq } from '@/apis/api-client';
import type { Member } from '@/types/entities';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { useApiClient } from '../../../hooks/useApiClient';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupDetailQueryControl } from '../hooks/useGroupDetailQueryControl';
import type { MemberFormData } from './MemberForm.vue';
import MemberForm from './MemberForm.vue';

const props = defineProps<{ member: Member }>();
const open = defineModel('open', { default: false });

const apiClient = useApiClient();
const { group } = useGroupContext();

const { mutateAsync: updateMutateAsync, isPending: isUpdating } = useMutation({
	mutationFn: (form: MemberFormData & { bankInfo?: Member['bankInfo'] }) => {
		const { bankInfo, ...rest } = form as MemberFormData & { bankInfo?: Member['bankInfo'] };
		const payload: ApiUpdateMemberReq = {
			...rest,
			...(bankInfo ? { bankInfo } : {}),
			...(!bankInfo && props.member.bankInfo ? { unsetBankInfo: true } : {}),
		};

		return apiClient.updateMember(group.value.id, props.member.id, payload);
	},
});

const toast = useToast();
const { refetchGroup } = useGroupDetailQueryControl();

const handleUpdate = async (form: MemberFormData & { bankInfo?: Member['bankInfo'] }) => {
	const [error] = await to(updateMutateAsync(form));

	if (error) {
		return toast.errorWithRetry(error.message || 'Không thể cập nhật thành viên', () =>
			handleUpdate(form),
		);
	}

	open.value = false;
	refetchGroup();
};
</script>

<template>
	<Dialog v-model:open="open" header="Chỉnh sửa thành viên" hide-close-button>
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
