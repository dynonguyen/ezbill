<script setup lang="ts">
import { Button } from 'primevue';
import { ref } from 'vue';

const open = ref(false);
</script>

<template>
	<Button
		v-tooltip.top="'Tạo bill mới'"
		icon="icon msi-add-2-rounded shrink-0 size-5"
		rounded
		size="large"
		class="!size-14"
		@click="open = true" />
</template>
