<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import { PATH } from '@/constants/path';
import { getEnv } from '@/utils/get-env';
import { Button, InputText } from 'primevue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const inviteLink = ref('');
const router = useRouter();
const toast = useToast();

const handleJoinGroup = async () => {
	const linkOrId = inviteLink.value.trim();
	if (!linkOrId) return;

	const baseUrl = getEnv('VITE_BASE_URL');

	if (linkOrId.startsWith(baseUrl)) {
		const isValid = linkOrId.includes(`${baseUrl}${PATH.GROUP.replace(':id', '')}`);
		if (!isValid) {
			toast.error('Link hoặc id nhóm hợp lệ');
			return;
		}

		router.push(`${linkOrId.replace(baseUrl, '')}`);
	} else {
		router.push(`${PATH.GROUP.replace(':id', linkOrId)}`);
	}
};
</script>

<template>
	<Flex class="gap-4 px-4">
		<InputText
			v-model="inviteLink"
			autofocus
			placeholder="Nhập link mời tham gia hoặc ID nhóm"
			fluid />
		<Button class="shrink-0" @click="handleJoinGroup">Tham gia</Button>
	</Flex>
</template>
