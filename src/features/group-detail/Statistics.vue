<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import Typography from '@/components/Typography.vue';
import { Divider } from 'primevue';
import ContainerBox from './ContainerBox.vue';
</script>

<template>
	<ContainerBox label="Tổng chi tiêu nhóm">
		<Flex stack class="gap-4 py-2">
			<Typography class="text-rose-600 text-3xl font-semibold">125.400.000₫</Typography>
		</Flex>
	</ContainerBox>

	<ContainerBox label="Tổng chi tiêu của bạn">
		<Flex stack class="gap-2 py-2">
			<Typography class="text-sky-600 text-3xl font-semibold">5.400.000₫</Typography>

			<Flex class="gap-1">
				<Typography variant="mdMedium">
					Đã trả:
					<span class="text-green-600">2.400.000₫</span>
				</Typography>
				<Divider layout="vertical" />
				<Typography variant="mdMedium">
					Cần trả:
					<span class="text-red-600">3.000.000₫</span>
				</Typography>
			</Flex>
		</Flex>
	</ContainerBox>
</template>
