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

const isNoteExpanded = ref(false);
const toggleNoteExpanded = () => (isNoteExpanded.value = !isNoteExpanded.value);

const generalInfo = computed(() => [
	['Số tiền tổng', toVND(props.bill.amount), false],
	['Tên sự kiện', props.bill.name, false],
	['Người trả', group.value.members.find((m) => m.id === props.bill.createdBy)?.name, false],
	['Loại chia', billTypeMapping(props.bill.type).label, false],
	...(props.bill.note ? [['Mô tả', props.bill.note, true]] : []),
	['Ngày tạo', dayjs(props.bill.createdAt).format('DD/MM/YYYY HH:mm:ss'), false],
	['Đã thanh toán', getPaidStatus(props.bill), false],
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
			<template v-for="[label, value, expandable] in generalInfo" :key="label">
				<LabelValue v-if="expandable" :label="label">
					<template #value>
						<Typography
							variant="smRegular"
							class="transition-all w-full break-all cursor-pointer"
							:class="{ 'line-clamp-1': !isNoteExpanded }"
							:title="value"
							@click="toggleNoteExpanded">
							{{ value }}
						</Typography>
					</template>
				</LabelValue>
				<LabelValue v-else :label="label" :value="value" />
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
