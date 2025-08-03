<script setup lang="ts">
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { PAYMENT_TRACKING_LABEL_MAPPING } from '@/constants/mapping';
import { PaymentTrackingMode } from '@/types/entities';
import { ref } from 'vue';
import PaymentTrackingHelper from './PaymentTrackingHelper.vue';

const value = defineModel<PaymentTrackingMode>();

const openTooltip = ref(false);
const options = Object.values(PaymentTrackingMode).map((mode) => ({
	value: mode,
	...PAYMENT_TRACKING_LABEL_MAPPING[mode],
}));
</script>

<template>
	<Flex stack class="gap-2">
		<Flex>
			<Typography variant="smRegular">Chế độ theo dõi thanh toán</Typography>
			<Flex center class="size-7" @click="openTooltip = true">
				<span class="icon msi-info-outline-rounded cursor-pointer size-4 text-gray-500"></span>
			</Flex>
		</Flex>

		<Flex class="gap-4" wrap>
			<Flex
				v-for="opt in options"
				:key="opt.value"
				as="label"
				class="gap-1"
				@click="value = opt.value">
				<input
					type="radio"
					name="payment-tracking-mode"
					class="radio radio-sm"
					:checked="value === opt.value"
					:class="{ 'radio-primary': value === opt.value }" />
				<Flex class="gap-1 text-gray-600">
					<span :class="opt.icon" class="size-4"></span>
					<Typography variant="smRegular" class="cursor-pointer">{{ opt.label }}</Typography>
				</Flex>
			</Flex>
		</Flex>
	</Flex>

	<Dialog v-model:open="openTooltip" header="Chế độ theo dõi thanh toán">
		<PaymentTrackingHelper />
	</Dialog>
</template>
