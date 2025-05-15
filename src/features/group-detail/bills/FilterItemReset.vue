<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';

defineProps<{ label: string }>();
defineEmits(['click']);
</script>

<template>
	<Flex class="justify-between">
		<Typography as="label" variant="smRegular">{{ label }}</Typography>
		<Button variant="text" size="xs" @click="$emit('click')">Đặt lại</Button>
	</Flex>
</template>
