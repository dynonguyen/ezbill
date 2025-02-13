<script setup lang="ts">
import { InputNumber } from 'primevue';
</script>

<template>
	<InputNumber v-bind="$attrs">
		<template #decrementicon>
			<span class="icon msi-remove-rounded"></span>
		</template>
		<template #incrementicon>
			<span class="icon msi-add-2-rounded"></span>
		</template>
	</InputNumber>
</template>
