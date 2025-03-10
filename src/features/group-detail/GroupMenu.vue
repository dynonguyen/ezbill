<script setup lang="ts">
import { deleteGroup, updateGroup } from '@/apis/supabase';
import InviteLink from '@/components/InviteLink.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import { vOutsideClick } from '@/directives/v-outside-click';
import { useToast } from '@/hooks/useToast';
import { useLocalDBStore } from '@/stores/local-db';
import type { Group } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { ref, useId } from 'vue';
import { useRouter } from 'vue-router';
import GroupForm from '../new-group/GroupForm.vue';
import { useBillsContext } from './hooks/useBillsContext';
import { useGroupContext } from './hooks/useGroupContext';

const { group } = useGroupContext();
const bills = useBillsContext();
const toast = useToast();
const queryClient = useQueryClient();
const actionId = useId();
const router = useRouter();
const localDBStore = useLocalDBStore();

const { isPending: isUpdating, mutateAsync: updateMutateAsync } = useMutation({
	mutationFn: updateGroup,
});
const { isPending: isDeleting, mutateAsync: deleteMutateAsync } = useMutation({
	mutationFn: deleteGroup,
});

const open = ref(false);
const openShareGroup = ref(false);
const openEditGroupName = ref(false);
const confirmDelete = ref(false);

const handleClose = () => {
	open.value = false;
};

const exportGroup = () => {
	import('./helpers/export-to-excel').then(({ exportGroupToExcel }) => {
		exportGroupToExcel(group.value, bills.value);
	});
};

const handleEditGroup = async (form: Partial<Group>) => {
	const [error] = await to(updateMutateAsync({ updated: form, id: group.value.id }));

	if (error) {
		return toast.error(error?.message || 'Chỉnh sửa thất bại');
	}

	openEditGroupName.value = false;
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};

const handleDeleteGroup = async () => {
	const [error] = await to(deleteMutateAsync(group.value.id));

	if (error) {
		return toast.error(error?.message || 'Xoá nhóm thất bại');
	}

	localDBStore.removeFromGroup(group.value.id);
	confirmDelete.value = false;
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });

	router.push(PATH.HOME);
};

const items = ref<
	Array<{ label: string; icon: string; action(): void; hasDivider?: boolean; itemClass?: string }>
>([
	{
		label: 'Sửa tên nhóm',
		icon: 'icon msi-edit-rounded size-5',
		hasDivider: true,
		action: () => (openEditGroupName.value = true),
	},
	{
		label: 'Chia sẻ nhóm',
		icon: 'icon msi-share size-5',
		action: () => (openShareGroup.value = true),
	},
	{
		label: 'Xuất file excel',
		icon: 'icon msi-file-save-rounded size-5',
		action: exportGroup,
	},
	{
		label: 'Xoá nhóm',
		icon: 'icon msi-delete size-5',
		itemClass: '[&>*]:!text-red-500',
		action: () => (confirmDelete.value = true),
	},
]);
</script>

<template>
	<details class="dropdown dropdown-bottom dropdown-end" :open="open">
		<summary>
			<Button
				variant="soft"
				color="grey"
				shape="circle"
				size="sm"
				class="bg-base-300 border-base-300 shrink-0"
				start-icon="icon msi-more-vert"
				:id="actionId"
				@click="open = !open" />
		</summary>

		<ul
			class="dropdown-content menu bg-gray-50 rounded-box z-[1] w-52 shadow-lg mt-4 p-0 overflow-hidden"
			v-outside-click:[actionId]="{ enabled: open, trigger: handleClose }">
			<template v-for="(item, index) in items" :key="index">
				<Flex
					class="p-4 justify-between hover:bg-gray-100 cursor-pointer"
					:class="[
						item.itemClass,
						{ 'border-b border-gray-200': !item.hasDivider && index !== items.length - 1 },
					]"
					@click="
						() => {
							handleClose();
							item.action();
						}
					">
					<Typography variant="smRegular" class="text-black">{{ item.label }}</Typography>
					<span :class="item.icon" class="size-5 text-slate-600"></span>
				</Flex>
				<div v-if="item.hasDivider" class="h-2 bg-gray-200"></div>
			</template>
		</ul>
	</details>

	<Dialog v-model:open="openEditGroupName" header="Sửa tên nhóm">
		<GroupForm
			v-if="openEditGroupName"
			:initial-values="{ name: group.name }"
			@submit="handleEditGroup">
			<template #form-action>
				<Flex class="gap-2" items-fluid>
					<Button variant="soft" color="grey" @click="openEditGroupName = false">Đóng</Button>
					<Button type="submit" :loading="isUpdating">Cập nhật</Button>
				</Flex>
			</template>
		</GroupForm>
	</Dialog>

	<Dialog v-model:open="openShareGroup" header="Mời tham gia nhóm">
		<InviteLink v-if="openShareGroup" :id="group.id" />
	</Dialog>

	<Dialog v-model:open="confirmDelete" header="Xoá nhóm">
		<Typography variant="smRegular" class="text-center">
			Bạn có chắc chắn muốn xoá nhóm không? Thao tác không thể hoàn tác.
		</Typography>

		<template #action>
			<Flex class="gap-2" items-fluid>
				<Button variant="soft" color="grey" @click="confirmDelete = false">Đóng</Button>
				<Button color="danger" @click="handleDeleteGroup" :loading="isDeleting">Xoá</Button>
			</Flex>
		</template>
	</Dialog>
</template>
