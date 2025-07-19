<script setup lang="ts">
import CurrencyText, { type CurrencyTextProps } from '@/components/CurrencyText.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Bill } from '@/types/entities';
import { hasEventPassed } from '@/utils/helpers';
import dayjs from 'dayjs';
import type { HTMLAttributes } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';

defineProps<{ bill: Bill; pt?: { currencyText?: Partial<CurrencyTextProps> & HTMLAttributes } }>();
defineEmits<{ delete: []; viewDetail: [] }>();

const { group } = useGroupContext();

const getBillInfo = (bill: Bill) => {
	return [
		['msi-calendar-month-rounded', dayjs(bill.createdAt).format('DD/MM/YYYY HH:mm')],
		['msi-payments', group.value.members?.find((m) => m.id === bill.createdBy)?.name || 'Unknown'],
		['msi-group', Object.keys(bill.members).length],
	];
};
</script>

<template>
	<Flex
		stack
		class="gap-1 p-4 border-t border-dashed border-gray-300 cursor-pointer hover:bg-gray-100"
		@click="$emit('viewDetail')">
		<Flex class="justify-between gap-2">
			<Typography variant="mdSemiBold" class="text-black grow line-clamp-1 break-all">
				{{ bill.name }}
			</Typography>
			<CurrencyText
				:amount="bill.amount"
				amount-class="text-md font-semibold"
				unit-class="text-sm"
				class="shrink-0"
				:fixed="0"
				v-bind="pt?.currencyText" />
		</Flex>

		<Flex class="gap-2 justify-between flex-wrap">
			<Flex stack class="gap-1 grow">
				<Flex v-for="item in getBillInfo(bill)" :key="item[0]" class="gap-2 text-slate-500">
					<span class="size-4 icon" :class="item[0]"></span>
					<Typography variant="xsRegular">{{ item[1] }}</Typography>
				</Flex>
			</Flex>

			<Flex class="gap-2 self-end">
				<Typography
					v-if="hasEventPassed('onDelete')"
					tabindex="0"
					role="button"
					variant="xsRegular"
					class="text-red-700 hover:text-red-800 cursor-pointer pt-6 pl-6"
					@click.stop="$emit('delete')">
					Xoá
				</Typography>
			</Flex>
		</Flex>
	</Flex>
</template>
