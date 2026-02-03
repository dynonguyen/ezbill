<script setup lang="ts">
import InviteLink from '@/components/InviteLink.vue';
import Loading from '@/components/Loading.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import { QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import { useApiClient } from '@/hooks/useApiClient';
import { useToast } from '@/hooks/useToast';
import { useLocalDBStore } from '@/stores/local-db';
import { PaymentTrackingMode, type Group } from '@/types/entities';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import GroupForm, { type GroupFormModel } from './GroupForm.vue';
import ImportBackupFile, { type ImportedModel } from './ImportBackupFile.vue';

const open = defineModel<boolean>({ default: false });
const inviteGroupId = ref('');

const apiClient = useApiClient();
const queryClient = useQueryClient();
const createGroupMutation = useMutation({ mutationFn: apiClient.createGroup });
const importGroupMutation = useMutation({ mutationFn: apiClient.importGroup });

const toast = useToast();
const router = useRouter();
const localDBStore = useLocalDBStore();
const importedFile = ref<ImportedModel>(null);
const groupFormModel = ref<GroupFormModel>();

const handleClose = () => {
	open.value = false;
	inviteGroupId.value = '';
};

const handleAddGroup = async (form: Pick<Group, 'name' | 'paymentTrackingMode'>) => {
	const { name, paymentTrackingMode } = form;

	if (importedFile.value) {
		const { group: importedGroup, bills } = importedFile.value.data;

		const resp = await importGroupMutation.mutateAsync({
			group: { ...importedGroup, name, paymentTrackingMode },
			bills,
		});

		if (!resp.success) {
			void apiClient.createErrorLog({ error: resp.message });
			return toast.errorWithRetry('Tạo nhóm thất bại', () => {
				handleAddGroup(form);
			});
		}

		importedFile.value = null;

		if (resp.data?.id) {
			localDBStore.joinGroup(resp.data.id);
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUPS] });
			inviteGroupId.value = resp.data.id;
		}
	} else {
		const resp = await createGroupMutation.mutateAsync({ name, paymentTrackingMode });
		if (resp.success) {
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GROUPS] });
			handleClose();
			return;
		}
	}
};

const handleViewGroup = () => {
	router.push({ path: PATH.GROUP.replace(':id', inviteGroupId.value) });
	handleClose();
};

watch(
	() => [importedFile.value?.data.group.name, importedFile.value?.data.group.paymentTrackingMode],
	([name, paymentTrackingMode]) => {
		groupFormModel.value?.setFieldValue('name', name ?? '');
		groupFormModel.value?.setFieldValue(
			'paymentTrackingMode',
			(paymentTrackingMode || PaymentTrackingMode.Accountant) as PaymentTrackingMode,
		);
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
		@close="handleClose"
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
