<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useLocalDBStore } from '@/stores/local-db';
import type { GroupId } from '@/types/entities';
import { copyToClipboard, getGroupLink } from '@/utils/helpers';
import { match } from 'ts-pattern';
import { computed, onMounted, ref } from 'vue';

type ActionKey = 'hide' | 'unhide' | 'pin' | 'unpin' | 'copy-link';

const props = defineProps<{ groupId: GroupId }>();
const actionWidthModel = defineModel<number>('actionWidth');
const el = ref<HTMLDivElement | null>();
const copied = ref(false);
const localDBStore = useLocalDBStore();

onMounted(() => {
	actionWidthModel.value = el.value?.offsetWidth ?? 0;
});

const handleActionClick = (action: ActionKey) => {
	match(action)
		.with('copy-link', () => {
			if (copied.value) return;
			copyToClipboard(getGroupLink(props.groupId)).then(() => {
				copied.value = true;
				setTimeout(() => {
					copied.value = false;
				}, 3000);
			});
		})
		.with('pin', () => localDBStore.pinRecentGroup(props.groupId))
		.with('unpin', () => localDBStore.unpinRecentGroup(props.groupId))
		.with('hide', () => localDBStore.hideRecentGroup(props.groupId))
		.with('unhide', () => localDBStore.unhideRecentGroup(props.groupId))
		.exhaustive();
};

const actions = computed<Array<{ key: ActionKey; icon: string; label: string; bgcolor: string }>>(
	() => [
		{
			key: 'copy-link',
			icon: copied.value ? 'other-clipboard-check' : 'msi-content-copy-rounded',
			label: 'Sao chép link',
			bgcolor: copied.value ? 'bg-success' : 'bg-zinc-400',
		},
		localDBStore.pinnedGroups.includes(props.groupId)
			? {
					key: 'unpin',
					icon: 'msi-keep-off-rounded',
					label: 'Gỡ ghim',
					bgcolor: 'bg-yellow-500',
				}
			: { key: 'pin', icon: 'msi-keep-rounded', label: 'Ghim', bgcolor: 'bg-yellow-500' },
		localDBStore.hiddenGroups.includes(props.groupId)
			? {
					key: 'unhide',
					icon: 'msi-visibility-rounded',
					label: 'Hiện',
					bgcolor: 'bg-violet-500',
				}
			: {
					key: 'hide',
					icon: 'msi-visibility-off-rounded',
					label: 'Ẩn',
					bgcolor: 'bg-violet-500',
				},
	],
);
</script>

<template>
	<div ref="el" class="absolute right-0 top-0 z-0 h-full rounded-r-2xl overflow-hidden">
		<Flex class="h-full">
			<Flex
				v-for="item in actions"
				:key="item.key"
				stack
				center
				class="gap-1 cursor-pointer size-full px-3 min-w-20 w-fit text-white hover:opacity-80 transition-opacity"
				:class="item.bgcolor ?? 'text-gray-600'"
				@click="handleActionClick(item.key)">
				<span class="icon size-6" :class="item.icon"></span>
				<Typography variant="xsMedium" class="select-none text-center shrink-0">
					{{ item.label }}
				</Typography>
			</Flex>
		</Flex>
	</div>
</template>
