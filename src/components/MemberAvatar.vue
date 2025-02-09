<script setup lang="ts">
import type { Member } from '@/types/entities'
import { getImgUrl } from '@/utils/get-asset'
import { Avatar, type AvatarProps } from 'primevue'

withDefaults(defineProps<Member & AvatarProps & { showTooltip?: boolean }>(), {
	showTooltip: true,
})
</script>

<template>
	<Avatar
		v-if="$props.avatar"
		:image="getImgUrl(`avatar/avt-${$props.avatar}.png`)"
		shape="circle"
		v-tooltip.bottom="$props.showTooltip ? $props.name : null" />
	<Avatar
		v-else-if="$props.name"
		:label="$props.name[0]"
		shape="circle"
		v-tooltip.bottom="$props.showTooltip ? $props.name : null" />
</template>
