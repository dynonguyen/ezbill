<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Member } from '@/types/entities';
import { ref } from 'vue';
import BillItem from '../../bills/BillItem.vue';

type Tab = 'to-pay' | 'received';

defineProps<{ id: Member['id'] }>();
const activeTab = ref<Tab>('to-pay');

const tabs: Array<{ value: Tab; label: string }> = [
	{ value: 'to-pay', label: 'Cần trả' },
	{ value: 'received', label: 'Nhận lại' },
];

const memberBills: any[] = [];
</script>

<template>
	<Flex stack class="gap-2">
		<div role="tablist" class="tabs tabs-boxed">
			<a
				v-for="tab in tabs"
				:key="tab.value"
				role="tab"
				class="tab"
				:class="{ 'tab-active': tab.value === activeTab }"
				@click="activeTab = tab.value">
				{{ tab.label + (activeTab === tab.value ? ` (${memberBills.length})` : '') }}
			</a>
		</div>

		<template v-if="memberBills.length">
			<BillItem
				v-for="bill in memberBills"
				:key="bill.id"
				:bill="bill"
				:pt="{
					currencyText: { showSign: true, class: bill.isPayer ? 'text-green-600' : 'text-red-500' },
				}" />
		</template>
		<template v-else>
			<Typography class="text-center text-gray-500 my-8">Không có hoá đơn</Typography>
		</template>
	</Flex>
</template>
