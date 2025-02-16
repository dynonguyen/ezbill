<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import Typography from '@/components/Typography.vue';
import { Divider } from 'primevue';
import { computed } from 'vue';
import { toVND } from '../../utils/helpers';
import ContainerBox from './ContainerBox.vue';
import { useBillsContext } from './hooks/useBillsContext';
import { useGroupContext } from './hooks/useGroupContext';

const bills = useBillsContext();
const { user } = useGroupContext();

const amount = computed(() => {
	let group = 0,
		self = 0,
		paid = 0;

	bills.value.forEach((bill) => {
		const userId = user.value.id;

		if (bill.members?.[userId]) {
			self += bill.members[userId];
		}

		if (bill.createdBy === userId) {
			paid += bill.amount;
		}

		group += bill.amount;
	});

	return { group, self, paid, needToPay: paid - self };
});
</script>

<template>
	<ContainerBox label="Tổng chi tiêu của bạn">
		<Flex stack class="gap-2 py-2">
			<Typography class="text-neutral-600 text-2xl font-semibold">
				{{ toVND(amount.self) }}
			</Typography>

			<Flex class="gap-1">
				<Typography variant="mdMedium" class="text-neutral-500">
					Đã trả:
					<span class="text-green-600">{{ toVND(amount.paid) }}</span>
				</Typography>
				<Divider layout="vertical" />
				<Typography variant="mdMedium" class="text-neutral-500">
					{{ amount.needToPay > 0 ? 'Cần nhận lại' : 'Cần trả thêm' }}:
					<span :class="amount.needToPay > 0 ? 'text-green-600' : 'text-red-600'">
						{{ toVND(Math.abs(amount.needToPay)) }}
					</span>
				</Typography>
			</Flex>
		</Flex>
	</ContainerBox>

	<ContainerBox label="Tổng chi tiêu nhóm">
		<Flex stack class="gap-4 py-2">
			<Typography class="text-neutral-600 text-2xl font-semibold">
				{{ toVND(amount.group) }}
			</Typography>
		</Flex>
	</ContainerBox>
</template>
