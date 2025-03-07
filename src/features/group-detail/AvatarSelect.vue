<script setup lang="ts">
import Dialog from '@/components/ui/Dialog.vue';
import { getImgUrl } from '@/utils/get-asset';
import { ref } from 'vue';

defineEmits<{ change: [avt: string] }>();

const tabs: Array<{ title: string; folder: string; noAvtSet: number }> = [
	{ title: 'Animals', folder: 'animal', noAvtSet: 24 },
	{ title: 'Capybara', folder: 'capybara', noAvtSet: 30 },
	{ title: 'Couple', folder: 'couple', noAvtSet: 18 },
	{ title: 'Meme', folder: 'meme', noAvtSet: 42 },
	{ title: '3D', folder: '3d', noAvtSet: 30 },
];

const currentTab = ref(tabs[0]);
</script>

<template>
	<Dialog header="Chọn ảnh đại diện" class="!w-120">
		<div role="tablist" class="tabs tabs-bordered pb-2 max-w-120 overflow-x-auto">
			<a
				v-for="tab in tabs"
				:key="tab.title"
				role="tab"
				class="tab"
				:class="{ 'tab-active': tab.folder === currentTab.folder }"
				@click="currentTab = tabs.find((t) => t.folder === tab.folder)!">
				{{ tab.title }}
			</a>
		</div>

		<div class="grid grid-cols-6 gap-4 mt-4">
			<div
				class="avatar"
				v-for="i in currentTab.noAvtSet"
				:key="i"
				@click="$emit('change', `${currentTab.folder}/${i}.png`)">
				<div class="!size-full cursor-pointer hover:opacity-70">
					<img :src="getImgUrl(`avatar/${currentTab.folder}/${i}.png`)" />
				</div>
			</div>
		</div>
	</Dialog>
</template>
