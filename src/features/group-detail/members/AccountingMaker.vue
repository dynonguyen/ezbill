<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import AccountingIcon from './AccountingIcon.vue';

defineProps<{ show?: boolean }>();
defineOptions({ inheritAttrs: false });
</script>

<template>
	<div class="relative" v-bind="$attrs" v-if="show">
		<slot></slot>
		<Flex
			data-tip="Kế toán"
			center
			class="tooltip tooltip-top size-5 rounded-full absolute bottom-0 right-0 bg-white">
			<AccountingIcon />
		</Flex>
	</div>
	<slot v-else></slot>
</template>
