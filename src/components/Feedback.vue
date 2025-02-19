<script setup lang="ts">
import type { ImgHTMLAttributes } from 'vue';
import Flex from './Flex.vue';
import Typography, { type TypographyProps } from './Typography.vue';

type FeedbackProps = {
	img: string;
	title?: string;
	attrs?: { img?: ImgHTMLAttributes; title?: TypographyProps };
};
const props = defineProps<FeedbackProps>();
</script>

<template>
	<Flex stack class="gap-3" center>
		<img :src="props.img" v-bind="$props.attrs?.img" />
		<Typography class="text-gray-400" v-bind="$props.attrs?.title">{{ props.title }}</Typography>
		<slot name="action"></slot>
	</Flex>
</template>
