<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { PAYMENT_TRACKING_LABEL_MAPPING } from '@/constants/mapping';
import { PaymentTrackingMode } from '@/types/entities';

const tooltips = [
	{
		...PAYMENT_TRACKING_LABEL_MAPPING[PaymentTrackingMode.Accountant],
		mode: PaymentTrackingMode.Accountant,
		description:
			'Một thành viên được chọn làm "kế toán". Khi kết thúc, các thành viên chỉ cần chuyển tiền một lần cho người này (và ngược lại).',
		bullets: [
			'⭐ Dễ sử dụng, không cần theo dõi từng khoản nhỏ.',
			'🧮 Chỉ tổng kết và thanh toán một lần sau cùng.',
			'✅ Phù hợp cho các chuyến đi ngắn, du lịch.',
		],
	},
	{
		...PAYMENT_TRACKING_LABEL_MAPPING[PaymentTrackingMode.Tracking],
		mode: PaymentTrackingMode.Tracking,
		description:
			'Tất cả thành viên có thể chuyển tiền cho nhau bất kỳ lúc nào. Cho phép đánh dấu các khoản đã thanh toán, giúp bạn theo dõi tiến độ thanh toán một cách chi tiết và minh bạch.',
		bullets: [
			'⭐ Đánh dấu đã thanh toán từng khoản.',
			'🔁 Theo dõi chi tiết và minh bạch.',
			'🤝 Mọi người đều có thể chủ động thanh toán.',
			'✅ Phù hợp với nhóm hoạt động lâu dài, bạn thân hay đồng nghiệp thường xuyên chi tiêu chung.',
		],
	},
];
</script>

<template>
	<Flex stack class="gap-2">
		<Flex v-for="tooltip in tooltips" :key="tooltip.mode" stack class="gap-1">
			<Flex class="gap-1">
				<span :class="tooltip.icon" class="size-5"></span>
				<Typography variant="lgMedium">{{ tooltip.label }}</Typography>
			</Flex>
			<Typography variant="smRegular" class="text-gray-500">
				{{ tooltip.description }}
			</Typography>
			<Flex as="ul" stack class="gap-1 ml-2">
				<Typography
					v-for="(item, index) in tooltip.bullets"
					:key="index"
					variant="smRegular"
					class="text-gray-500">
					{{ item }}
				</Typography>
			</Flex>
		</Flex>
	</Flex>
</template>
