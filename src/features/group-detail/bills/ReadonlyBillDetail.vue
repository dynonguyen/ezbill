<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import LabelValue from '@/components/LabelValue.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import type { Bill, PaymentTracking } from '@/types/entities';
import { toVND } from '@/utils/helpers';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { billTypeMapping, getPaidStatus } from '../helpers/utils';
import { useGroupContext } from '../hooks/useGroupContext';

const { group } = useGroupContext();
const props = defineProps<{ bill: Bill }>();

const LONG_TEXT_THRESHOLD = 100;

const expandedItems = ref<Set<string>>(new Set());

const toggleExpanded = (key: string) => {
	if (expandedItems.value.has(key)) expandedItems.value.delete(key);
	else expandedItems.value.add(key);
};

const isLongText = (text: unknown): text is string =>
	typeof text === 'string' && text.length > LONG_TEXT_THRESHOLD;

const getExpandableClasses = (label: string, value: unknown) => [
	'transition-all overflow-hidden',
	...(isLongText(value)
		? [
				'cursor-pointer',
				expandedItems.value.has(label) ? 'break-words overflow-wrap-anywhere' : 'truncate',
			]
		: ['break-words']),
];

const getExpandableHandler = (label: string, value: unknown) =>
	isLongText(value) ? () => toggleExpanded(label) : undefined;

const generalInfo = computed(() => [
	['Số tiền tổng', toVND(props.bill.amount)],
	['Tên sự kiện', props.bill.name],
	['Người trả', group.value.members.find((m) => m.id === props.bill.createdBy)?.name],
	['Loại chia', billTypeMapping(props.bill.type).label],
	...(props.bill.note ? [['Mô tả', props.bill.note]] : []),
	['Ngày tạo', dayjs(props.bill.createdAt).format('DD/MM/YYYY HH:mm:ss')],
	['Đã thanh toán', getPaidStatus(props.bill)],
]);

const memberDetails = computed(() => {
	return Object.entries(props.bill.members)
		.map(([memId, amount]) => {
			const payInfo: PaymentTracking | undefined =
				props.bill.createdBy === memId
					? { createdAt: props.bill.createdAt, memberId: memId }
					: props.bill.paymentTracking.find((p) => p.memberId === memId);
			return {
				id: memId,
				amount,
				member: group.value.members.find((m) => m.id === memId)!,
				payInfo,
				isPaid: Boolean(payInfo),
			};
		})
		.sort((a, b) => {
			if (a.isPaid && !b.isPaid) return -1;
			if (!a.isPaid && b.isPaid) return 1;
			return a.member.name.localeCompare(b.member.name);
		});
});
</script>

<template>
	<Flex stack class="gap-4">
		<!-- General Information -->
		<Flex stack class="gap-2">
			<template v-for="[label, value] in generalInfo" :key="label">
				<LabelValue
					:label="label"
					:value="value"
					:pt="{
						value: {
							class: getExpandableClasses(String(label), value),
							onClick: getExpandableHandler(String(label), value),
						},
					}" />
				<Typography
					v-if="isLongText(value)"
					variant="xsRegular"
					class="text-blue-500 cursor-pointer hover:text-blue-700 -mt-2 ml-[6.75rem]"
					@click="toggleExpanded(String(label))">
					{{ expandedItems.has(String(label)) ? 'Thu gọn' : 'Xem thêm' }}
				</Typography>
			</template>
		</Flex>

		<!-- Members breakdown -->
		<Flex stack class="gap-3">
			<Typography variant="mdSemiBold" class="text-black">Thành viên tham gia</Typography>
			<Flex stack class="gap-2">
				<Flex
					v-for="m in memberDetails"
					:key="m.id"
					stack
					class="p-3 rounded-lg"
					:class="[
						m.payInfo || m.id === props.bill.createdBy
							? 'bg-green-50 border border-green-200'
							: 'bg-gray-50 border border-gray-200',
					]">
					<Flex class="justify-between">
						<Flex class="gap-2">
							<MemberAvatar v-bind="m.member" size="sm" />
							<Typography variant="smSemiBold">{{ m.member.name }}</Typography>
						</Flex>
						<CurrencyText :amount="m.amount" amount-class="font-medium" />
					</Flex>
					<Typography v-if="m.payInfo" variant="xsRegular" class="text-gray-500 self-end">
						✅ Đã thanh toán: {{ dayjs(m.payInfo.createdAt).format('DD/MM/YYYY HH:mm:ss') }}
					</Typography>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>
