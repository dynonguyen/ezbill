<script setup lang="ts">
import { createGroup, importGroup } from '@/apis/supabase';
import InviteLink from '@/components/InviteLink.vue';
import Loading from '@/components/Loading.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import { PATH } from '@/constants/path';
import { useToast } from '@/hooks/useToast';
import { useLocalDBStore } from '@/stores/local-db';
import type { Group } from '@/types/entities';
import { generateUUID } from '@/utils/helpers';
import { useMutation } from '@tanstack/vue-query';
import to from 'await-to-js';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import GroupForm, { type GroupFormModel } from './GroupForm.vue';
import ImportBackupFile, { type ImportedModel } from './ImportBackupFile.vue';

const open = defineModel<boolean>({ default: false });
const inviteGroupId = ref('');

const createGroupMutation = useMutation({ mutationFn: createGroup });
const importGroupMutation = useMutation({ mutationFn: importGroup });

const toast = useToast();
const router = useRouter();
const localDBStore = useLocalDBStore();
const importedFile = ref<ImportedModel>(null);
const groupFormModel = ref<GroupFormModel>();

const handleClose = () => {
	open.value = false;
	inviteGroupId.value = '';
};

const handleAddGroup = async (form: Pick<Group, 'name'>) => {
	const { name } = form;
	const groupId = generateUUID();

	const mutationAction = importedFile.value
		? importGroupMutation.mutateAsync({
				imported: importedFile.value.data,
				newGroupInfo: { name, id: groupId },
			})
		: createGroupMutation.mutateAsync({ name, id: groupId });

	const [error] = await to(mutationAction);

	if (error) {
		return toast.error(error?.message || 'Tạo nhóm thất bại');
	}

	localDBStore.joinGroup(groupId);
	inviteGroupId.value = groupId;
};

const handleViewGroup = () => {
	router.push({ path: PATH.GROUP.replace(':id', inviteGroupId.value) });
	handleClose();
};

watch(
	() => importedFile.value?.data.group.name,
	(name) => {
		if (name) groupFormModel.value?.setFieldValue('name', name);
	},
);

const isPending = computed(
	() => createGroupMutation.isPending.value || importGroupMutation.isPending.value,
);
</script>

<template>
	<Dialog
		v-model:open="open"
		:header="inviteGroupId ? 'Mời tham gia nhóm' : 'Tạo nhóm'"
		hide-close-button>
		<template v-if="open">
			<template v-if="!inviteGroupId">
				<GroupForm
					@close="handleClose"
					@submit="handleAddGroup"
					v-model:model-value="groupFormModel">
					<template #default>
						<ImportBackupFile v-model="importedFile" />
					</template>

					<template #form-action>
						<Flex class="gap-2" items-fluid>
							<Button variant="soft" color="grey" @click="handleClose">Đóng</Button>
							<Button type="submit" :loading="isPending">Tạo</Button>
						</Flex>
					</template>
				</GroupForm>
			</template>
			<InviteLink v-else :id="inviteGroupId">
				<template #action>
					<Flex class="gap-2 mt-4" items-fluid>
						<Button variant="soft" color="grey" @click="handleClose">Đóng</Button>
						<Button start-icon="icon msi-open-in-new" icon-pos="right" @click="handleViewGroup">
							Xem nhóm
						</Button>
					</Flex>
				</template>
			</InviteLink>
		</template>
		<div v-else class="h-36"></div>

		<template #fallback>
			<Flex center class="h-36">
				<Loading />
			</Flex>
		</template>
	</Dialog>
</template>
