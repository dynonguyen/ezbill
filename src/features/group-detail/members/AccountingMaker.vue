<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import { useGroupContext } from '../hooks/useGroupContext';
import AccountingIcon from './AccountingIcon.vue';

defineProps<{ show?: boolean }>();
defineOptions({ inheritAttrs: false });

const { isAccountantMode } = useGroupContext();
</script>

<template>
	<div class="relative shrink-0" v-bind="$attrs" v-if="show && isAccountantMode">
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
