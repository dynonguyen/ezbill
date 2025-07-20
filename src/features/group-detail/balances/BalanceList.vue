<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import { getImgUrl } from '@/utils/get-asset';
import { useBillsContext } from '../hooks/useBillsContext';
import { useGroupContext } from '../hooks/useGroupContext';
import AccountantMode from './accountant-mode/AccountantMode.vue';
import TrackingMode from './tracking-mode/TrackingMode.vue';

const { isAccountantMode } = useGroupContext();
const bills = useBillsContext();
</script>

<template>
	<Flex v-if="!bills.length" center>
		<img :src="getImgUrl('no-bills-2.svg')" class="size-[300px]" />
	</Flex>
	<template v-else>
		<AccountantMode v-if="isAccountantMode" />
		<TrackingMode v-else />
	</template>
</template>
