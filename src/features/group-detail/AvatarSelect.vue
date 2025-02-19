<script setup lang="ts">
import { getImgUrl } from '@/utils/get-asset';
import { Avatar, Dialog, Tab, TabList, Tabs } from 'primevue';
import { ref } from 'vue';

defineEmits<{ change: [avt: string] }>();

const tabs: Array<{ title: string; folder: string; noAvtSet: number }> = [
	{ title: 'Animals', folder: 'animal', noAvtSet: 24 },
	{ title: 'Capybara', folder: 'capybara', noAvtSet: 30 },
	{ title: 'Couple', folder: 'couple', noAvtSet: 18 },
	{ title: 'Meme', folder: 'meme', noAvtSet: 42 },
];

const currentTab = ref(tabs[0]);
</script>

<template>
	<Dialog :draggable="false" modal header="Chọn ảnh đại diện" class="!w-120">
		<Tabs
			:value="currentTab.folder"
			scrollable
			@update:value="(val) => (currentTab = tabs.find((tab) => tab.folder === val)!)">
			<TabList>
				<Tab v-for="tab in tabs" :key="tab.title" :value="tab.folder">{{ tab.title }}</Tab>
			</TabList>
		</Tabs>

		<div class="grid grid-cols-6 gap-4 mt-4">
			<Avatar
				v-for="i in currentTab.noAvtSet"
				:key="i"
				:image="getImgUrl(`avatar/${currentTab.folder}/${i}.png`)"
				class="!size-full cursor-pointer hover:opacity-70"
				@click="$emit('change', `${currentTab.folder}/${i}.png`)" />
		</div>
	</Dialog>
</template>
