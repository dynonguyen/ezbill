<script setup lang="ts">
import { PATH } from '@/constants/path'
</script>

<template>
	<span
		class="icon msi-arrow-back-rounded size-6 cursor-pointer hover:opacity-80 shrink-0"
		@click="$router.push(PATH.HOME)" />
</template>
