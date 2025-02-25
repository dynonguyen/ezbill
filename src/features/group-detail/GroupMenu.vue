<script setup lang="ts">
import { updateGroup } from '@/apis/supabase';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import { vOutsideClick } from '@/directives/v-outside-click';
import type { Group } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import to from 'await-to-js';
import { defineAsyncComponent, ref, useId } from 'vue';
import { useToast } from 'vue-toastification';
import { useBillsContext } from './hooks/useBillsContext';
import { useGroupContext } from './hooks/useGroupContext';

const InviteLink = defineAsyncComponent(() => import('@/components/InviteLink.vue'));
const GroupForm = defineAsyncComponent(() => import('@/features/new-group/GroupForm.vue'));

const { group } = useGroupContext();
const bills = useBillsContext();
const { isPending, mutateAsync } = useMutation({ mutationFn: updateGroup });
const toast = useToast();
const queryClient = useQueryClient();

const open = ref(false);
const openShareGroup = ref(false);
const openEditGroupName = ref(false);
const actionId = useId();

const handleClose = () => {
	open.value = false;
};

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

	openEditGroupName.value = false;
	queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUP, group.value.id] });
};

const items = ref<
	Array<{ type: 'item'; label: string; icon: string; action(): void; hasDivider?: boolean }>
>([
	{
		type: 'item',
		label: 'Sửa tên nhóm',
		icon: 'icon msi-edit-rounded size-5',
		hasDivider: true,
		action: () => (openEditGroupName.value = true),
	},
	{
		type: 'item',
		label: 'Chia sẻ nhóm',
		icon: 'icon msi-share size-5',
		action: () => (openShareGroup.value = true),
	},
	{
		type: 'item',
		label: 'Xuất file excel',
		icon: 'icon msi-file-save-rounded size-5',
		action: exportGroup,
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
					:class="{ 'border-b border-gray-200': !item.hasDivider && index !== items.length - 1 }"
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

	<Dialog v-model:open="openEditGroupName" header="Sửa tên nhóm" @close="openEditGroupName = false">
		<Suspense>
			<GroupForm
				v-if="openEditGroupName"
				:initial-values="{ name: group.name }"
				@submit="handleEditGroup">
				<template #form-action>
					<Flex class="gap-2" items-fluid>
						<Button variant="soft" color="grey" @click="openEditGroupName = false">Huỷ</Button>
						<Button type="submit" :loading="isPending">Cập nhật</Button>
					</Flex>
				</template>
			</GroupForm>
		</Suspense>
	</Dialog>

	<Dialog v-model:open="openShareGroup" header="Mời tham gia nhóm" @close="openShareGroup = false">
		<Suspense>
			<InviteLink v-if="openShareGroup" :id="group.id" />
		</Suspense>
	</Dialog>
</template>
