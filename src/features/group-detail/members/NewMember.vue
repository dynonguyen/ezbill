<script setup lang="ts">
import { addMember } from '@/apis/supabase';
import Flex from '@/components/Flex.vue';
import { QUERY_KEY } from '@/constants/key';
import type { Member } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Button, Dialog } from 'primevue';
import { defineAsyncComponent, ref } from 'vue';
import { useToast } from 'vue-toastification';
import { useGroupContext } from '../hooks/useGroupContext';
import { type MemberFormData } from './MemberForm.vue';

const MemberForm = defineAsyncComponent(() => import('./MemberForm.vue'));

const open = ref(false);

const queryClient = useQueryClient();
const { group } = useGroupContext();
const toast = useToast();
const { isPending, mutateAsync } = useMutation({ mutationFn: addMember });

const handleAddMember = async (form: MemberFormData) => {
	const id = generateUUID();
	const newMember: Member = { ...form, id };

	const [error] = await to(mutateAsync({ groupId: group.value.id, member: newMember }));

	if (error) {
		return toast.error(error.message || 'Thêm thành viên thất bại');
	}

	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
	open.value = false;
};
</script>

<template>
	<slot name="new-btn" :handleOpen="() => (open = true)">
		<Flex
			center
			class="size-12 border border-dashed border-neutral-500 rounded-full cursor-pointer hover:border-neutral-800 hover:bg-neutral-100 shrink-0"
			@click="open = true">
			<span class="icon msi-add-2-rounded text-neutral-800" />
		</Flex>
	</slot>

	<Dialog :draggable="false" v-model:visible="open" modal :header="'Thêm thành viên'">
		<Suspense>
			<MemberForm @submit="handleAddMember">
				<template #bottom-submit-btn>
					<Button type="submit" label="Thêm" :loading="isPending" />
				</template>
			</MemberForm>
		</Suspense>
	</Dialog>
</template>
