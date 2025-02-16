<script setup lang="ts">
import { PATH } from '@/constants/path';
import { Dialog, Menu, type PopoverMethods } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import { defineAsyncComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBillsContext } from './hooks/useBillsContext';
import { useGroupContext } from './hooks/useGroupContext';

const InviteLink = defineAsyncComponent(() => import('@/components/InviteLink.vue'));

const { group } = useGroupContext();
const bills = useBillsContext();
const router = useRouter();

const menu = ref<PopoverMethods>();
const openShareGroup = ref(false);

const exportGroup = () => {
	import('./helpers/export-to-excel').then(({ exportGroupToExcel }) => {
		exportGroupToExcel(group.value, bills.value);
	});
};

const items = ref<MenuItem[]>([
	{
		label: 'Về trang chủ',
		icon: 'icon msi-home-rounded size-5',
		command: () => router.push(PATH.HOME),
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
</template>
