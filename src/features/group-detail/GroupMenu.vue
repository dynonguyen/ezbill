<script setup lang="ts">
import { updateGroup } from '@/apis/supabase';
import { QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import type { Group } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { Button, Dialog, Menu, type PopoverMethods } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { defineAsyncComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useBillsContext } from './hooks/useBillsContext';
import { useGroupContext } from './hooks/useGroupContext';

const InviteLink = defineAsyncComponent(() => import('@/components/InviteLink.vue'));
const GroupForm = defineAsyncComponent(() => import('@/features/new-group/GroupForm.vue'));

const { group } = useGroupContext();
const bills = useBillsContext();
const router = useRouter();
const { isPending, mutateAsync } = useMutation({ mutationFn: updateGroup });
const toast = useToast();
const queryClient = useQueryClient();

const menu = ref<PopoverMethods>();
const openShareGroup = ref(false);
const openEditGroupName = ref(false);

const exportGroup = () => {
	import('./helpers/export-to-excel').then(({ exportGroupToExcel }) => {
		exportGroupToExcel(group.value, bills.value);
	});
};

const handleEditGroup = async (form: Partial<Group>) => {
	const [error] = await to(mutateAsync({ updated: form, id: group.value.id }));

	if (error) {
		return toast.error(error?.message || 'Chỉnh sửa thất bại');
	}

	toast.success('Chỉnh sửa thành công');
	openEditGroupName.value = false;
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};

const items = ref<MenuItem[]>([
	{
		label: 'Về trang chủ',
		icon: 'icon msi-home-rounded size-5',
		command: () => router.push(PATH.HOME),
	},
	{
		label: 'Sửa tên nhóm',
		icon: 'icon msi-edit-rounded size-5',
		command: () => (openEditGroupName.value = true),
	},
	{
		label: 'Chia sẻ nhóm',
		icon: 'icon msi-share size-5',
		command: () => (openShareGroup.value = true),
	},
	{ label: 'Export excel', icon: 'icon msi-sim-card-download size-5', command: exportGroup },
]);
</script>

<template>
	<span
		class="icon msi-menu-rounded size-7 cursor-pointer text-neutral-500 hover:text-neutral-700"
		@click="menu?.toggle($event)" />

	<Menu ref="menu" :model="items" popup />

	<Dialog
		:draggable="false"
		v-model:visible="openShareGroup"
		modal
		header="Mời tham gia nhóm"
		class="w-100 max-w-full">
		<Suspense>
			<InviteLink
				v-if="openShareGroup"
				:id="group.id"
				:hide-view-group="true"
				@close="openShareGroup = false" />
		</Suspense>
	</Dialog>

	<Dialog
		:draggable="false"
		v-model:visible="openEditGroupName"
		modal
		header="Sửa tên nhóm"
		class="w-100 max-w-full">
		<Suspense>
			<GroupForm v-if="openEditGroupName" @submit="handleEditGroup">
				<template #submit-btn>
					<Button class="min-w-20" type="submit" label="Lưu" :loading="isPending" />
				</template>
			</GroupForm>
		</Suspense>
	</Dialog>
</template>
