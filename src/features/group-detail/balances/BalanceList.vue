<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import { getImgUrl } from '@/utils/get-asset';
import { useGroupContext } from '../hooks/useGroupContext';
import { useGroupStatsContext } from '../hooks/useGroupStatsContext';
import AccountantMode from './accountant-mode/AccountantMode.vue';
import TrackingMode from './tracking-mode/TrackingMode.vue';
import { computed } from 'vue';

const { isAccountantMode } = useGroupContext();
const groupStats = useGroupStatsContext();
const hasBills = computed(() => (groupStats.value?.totalBills ?? 0) > 0);
</script>

<template>
	<Flex v-if="!hasBills" center>
		<img :src="getImgUrl('no-bills-2.svg')" class="size-[300px]" />
	</Flex>
	<template v-else>
		<AccountantMode v-if="isAccountantMode" />
		<TrackingMode v-else />
	</template>
</template>
