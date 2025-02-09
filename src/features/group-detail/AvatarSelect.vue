<script setup lang="ts">
import { getImgUrl } from '@/utils/get-asset'
import { Avatar, Dialog } from 'primevue'

defineEmits<{ change: [index: string] }>()

const NUM_OF_AVATARS = 25
</script>

<template>
	<Dialog :draggable="false" modal header="Chọn ảnh đại diện" class="w-100 max-w-full">
		<div class="grid grid-cols-5 gap-4">
			<Avatar
				v-for="i in NUM_OF_AVATARS"
				:key="i"
				:image="getImgUrl(`avatar/avt-${i}.png`)"
				class="!size-full cursor-pointer hover:opacity-70"
				@click="$emit('change', i.toString())" />
		</div>
	</Dialog>
</template>
