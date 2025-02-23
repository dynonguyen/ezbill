<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import NewGroupPopup from '@/features/new-group/NewGroupPopup.vue';
import { ref } from 'vue';

const openNewGroup = ref(false);
</script>

<template>
	<div class="rounded-b-[32px] bg-white p-4">
		<h1 class="text-2xl font-black text-center py-2.5">EZbill</h1>

		<Flex class="mt-6 gap-2">
			<Button shape="pill" :class="$style['action-btn']" @click="openNewGroup = !openNewGroup">
				<Flex :class="$style['icon-wrapper']" center>
					<span class="icon msi-add-rounded"></span>
				</Flex>
				<Typography variant="xsRegular">Tạo nhóm</Typography>
			</Button>

			<Button shape="pill" :class="$style['action-btn']">
				<Flex :class="$style['icon-wrapper']" center>
					<span class="icon msi-folder-supervised"></span>
				</Flex>
				<Typography variant="xsRegular">Tham gia nhóm</Typography>
			</Button>
		</Flex>
	</div>

	<NewGroupPopup v-model="openNewGroup" />
</template>

<style module>
.action-btn {
	@apply flex flex-1 items-center justify-start !p-2 gap-2 w-1/2;
}

.icon-wrapper {
	@apply rounded-full size-8 bg-primary-focus;

	:global .icon {
		@apply size-5;
	}
}
</style>
