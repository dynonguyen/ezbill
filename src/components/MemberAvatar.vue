<script setup lang="ts">
import type { Member } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import { Avatar, type AvatarProps } from 'primevue';

withDefaults(defineProps<Member & AvatarProps & { showTooltip?: boolean }>(), {
	showTooltip: true,
});

const AVATAR_COLOR: Record<string, string> = {
	'0': '#D32F2F',
	'1': '#C2185B',
	'2': '#7B1FA2',
	'3': '#512DA8',
	'4': '#303F9F',
	'5': '#1976D2',
	'6': '#0288D1',
	'7': '#00796B',
	'8': '#388E3C',
	'9': '#689F38',
	a: '#F57C00',
	b: '#E64A19',
	c: '#5D4037',
	d: '#455A64',
	e: '#B71C1C',
	f: '#880E4F',
	g: '#4A148C',
	h: '#311B92',
	i: '#1A237E',
	j: '#0D47A1',
	k: '#01579B',
	l: '#006064',
	m: '#004D40',
	n: '#1B5E20',
	o: '#33691E',
	p: '#827717',
	q: '#F57F17',
	r: '#FF6F00',
	s: '#E65100',
	t: '#BF360C',
	u: '#2B7EFF',
	v: '#212121',
	w: '#263238',
	x: '#8E24AA',
	y: '#D81B60',
	z: '#D50000',
};
</script>

<template>
	<Avatar
		v-if="$props.avatar"
		:image="getImgUrl(`avatar/avt-${$props.avatar}.png`)"
		shape="circle"
		v-tooltip.bottom="$props.showTooltip ? $props.name : null" />
	<Avatar
		v-else-if="$props.name"
		:label="$props.name[0].toUpperCase()"
		shape="circle"
		class="font-semibold"
		:style="{
			color: '#FFF',
			backgroundColor: AVATAR_COLOR[$props.name[0].toLowerCase()] || '#697182',
		}"
		v-tooltip.bottom="$props.showTooltip ? $props.name : null" />
</template>
