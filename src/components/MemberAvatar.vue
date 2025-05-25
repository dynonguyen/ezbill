<script setup lang="ts">
import { AVT_UPLOADED_PREFIX } from '@/features/group-detail/AvatarSelect.vue';
import type { Member } from '@/types/entities';
import { getImgUrl } from '@/utils/get-asset';
import type { HTMLAttributes } from 'vue';
import Typography, { type TypographyProps } from './ui/Typography.vue';

type MemberAvatarProps = Member & {
	size?: 'sm' | 'md' | 'lg' | 'full';
	pt?: { avatar?: HTMLAttributes; text?: HTMLAttributes };
};

withDefaults(defineProps<MemberAvatarProps>(), { size: 'md' });

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

const sizes: Record<NonNullable<MemberAvatarProps['size']>, string> = {
	sm: 'size-5',
	md: 'size-7',
	lg: 'size-10',
	full: 'size-full',
};

const fontSizes: Record<NonNullable<MemberAvatarProps['size']>, TypographyProps['variant']> = {
	sm: 'smRegular',
	md: 'smRegular',
	lg: 'mdRegular',
	full: 'mdRegular',
};

const getAvatarSrc = (avatar: string) => {
	return avatar.startsWith(AVT_UPLOADED_PREFIX)
		? avatar.slice(AVT_UPLOADED_PREFIX.length)
		: getImgUrl(`avatar/${avatar}`);
};
</script>

<template>
	<div class="avatar" v-if="avatar">
		<div :class="[sizes[size]]" class="rounded-full" v-bind="pt?.avatar">
			<img :src="getAvatarSrc(avatar)" />
		</div>
	</div>
	<div v-else-if="name" class="avatar placeholder">
		<div
			class="text-white rounded-full"
			:class="[sizes[size]]"
			:style="{ backgroundColor: AVATAR_COLOR[name[0].toLowerCase()] || '#697182' }"
			v-bind="pt?.avatar">
			<Typography
				:variant="fontSizes[size]"
				:class="{ 'text-[length:inherit]': size === 'full' }"
				v-bind="pt?.text">
				{{ name[0].toUpperCase() }}
			</Typography>
		</div>
	</div>
</template>
