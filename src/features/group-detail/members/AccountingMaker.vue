<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';

defineProps<{ show?: boolean }>();
</script>

<template>
	<div v-if="show">
		<div class="relative">
			<slot></slot>
			<Flex
				data-tip="Kế toán"
				center
				class="tooltip tooltip-top size-5 rounded-full absolute bottom-0 right-0 bg-white">
				<span class="icon msi-crown-rounded size-3 text-yellow-600"></span>
			</Flex>
		</div>
	</div>
	<slot v-else></slot>
</template>
