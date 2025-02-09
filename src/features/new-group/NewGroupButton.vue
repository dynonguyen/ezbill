<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import Loading from '@/components/Loading.vue'
import type { Group } from '@/types/entities'
import { Button, Dialog } from 'primevue'
import { defineAsyncComponent, ref } from 'vue'

const NewGroupForm = defineAsyncComponent(() => import('./NewGroupForm.vue'))
const InviteLink = defineAsyncComponent(() => import('./InviteLink.vue'))

const open = ref(false)
const inviteGroupId = ref('')

const handleCloseInviteLink = () => {
	open.value = false
	inviteGroupId.value = ''
}

const handleNewGroupAdded = (group: Pick<Group, 'id'>) => {
	inviteGroupId.value = group.id
}
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
			<NewGroupForm
				v-if="open && !inviteGroupId"
				@close="open = false"
				@success="handleNewGroupAdded" />
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
