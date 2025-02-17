<script setup lang="ts">
import { createGroup } from '@/apis/supabase';
import Flex from '@/components/Flex.vue';
import Loading from '@/components/Loading.vue';
import type { Group } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Button, Dialog } from 'primevue';
import { defineAsyncComponent, ref } from 'vue';
import { useToast } from 'vue-toastification';

const GroupForm = defineAsyncComponent(() => import('./GroupForm.vue'));
const InviteLink = defineAsyncComponent(() => import('@/components/InviteLink.vue'));

const open = ref(false);
const inviteGroupId = ref('');

const { isPending, mutateAsync } = useMutation({ mutationFn: createGroup });
const toast = useToast();

const handleCloseInviteLink = () => {
	open.value = false;
	inviteGroupId.value = '';
};

const handleAddGroup = async (form: Pick<Group, 'name'>) => {
	const { name } = form;
	const groupId = generateUUID();

	const [error] = await to(mutateAsync({ name, id: groupId }));

	if (error) {
		return toast.error(error?.message || 'Tạo nhóm thất bại');
	}

	toast.success('Tạo nhóm thành công');
	inviteGroupId.value = groupId;
};
</script>

<template>
	<Button
		v-tooltip.top="'Tạo nhóm mới'"
		icon="icon msi-add-2-rounded shrink-0 size-5"
		rounded
		size="large"
		class="!size-14"
		@click="open = true" />

	<Dialog
		:draggable="false"
		v-model:visible="open"
		modal
		:header="inviteGroupId ? 'Mời tham gia nhóm' : 'Tạo nhóm mới'"
		class="w-100 max-w-full">
		<Suspense>
			<GroupForm v-if="open && !inviteGroupId" @close="open = false" @submit="handleAddGroup">
				<template #submit-btn>
					<Button class="min-w-20" type="submit" label="Tạo" :loading="isPending" />
				</template>
			</GroupForm>

			<InviteLink
				v-else-if="open && inviteGroupId"
				:id="inviteGroupId"
				@close="handleCloseInviteLink" />

			<template #fallback>
				<Flex center>
					<Loading />
				</Flex>
			</template>
		</Suspense>
	</Dialog>
</template>
