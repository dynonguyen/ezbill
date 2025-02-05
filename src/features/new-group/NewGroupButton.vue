<script setup lang="ts">
import { Button } from 'primevue'
</script>

<template>
	<Button
		v-tooltip.left="'New group'"
		icon="icon msi-add-2-rounded shrink-0 size-5"
		rounded
		size="large"
		class="!size-14"
	/>
</template>
