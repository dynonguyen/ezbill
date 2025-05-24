import { APP_NAME } from '@/constants/common';
import { onMounted, onUnmounted } from 'vue';

export const usePageTitle = (title: string) => {
	onMounted(() => {
		document.title = `${title} | ${APP_NAME}`;
	});

	onUnmounted(() => {
		document.title = APP_NAME;
	});
};
