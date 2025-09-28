<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { PAYMENT_TRACKING_LABEL_MAPPING } from '@/constants/mapping';
import { PATH } from '@/constants/path';
import { useLocalDBStore } from '@/stores/local-db';
import type { Group } from '@/types/entities';
import { useDrag } from '@vueuse/gesture';
import { useMotionProperties, useSpring, type PermissiveMotionProperties } from '@vueuse/motion';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import RecentGroupActions from './RecentGroupActions.vue';

const MAX_AVATAR = 3;
const SWIPE_THRESHOLD = 35;
const DELAY_RESET_DRAG = 150;
const DELAY_RESET_MOVE = 150;
const DEFAULT_ACTION_WIDTH = 300;

const props = defineProps<{ group: Group }>();
const router = useRouter();
const localDBStore = useLocalDBStore();

const dragRef = ref();
const { motionProperties } = useMotionProperties(dragRef, { cursor: 'grab', x: 0, y: 0 });
const { set } = useSpring(motionProperties as Partial<PermissiveMotionProperties>, {
	damping: 40,
	stiffness: 500,
	mass: 1,
});
const isDragging = ref(false);
const hasSwipedLeft = ref(false);
const hasMoved = ref(false);
const actionWidth = ref(DEFAULT_ACTION_WIDTH);

const pinned = computed(() => localDBStore.pinnedGroups.includes(props.group.id));
const hidden = computed(() => localDBStore.hiddenGroups.includes(props.group.id));

useDrag(
	({ movement: [x, _], dragging }) => {
		const maxLeftPosition = -(actionWidth.value || DEFAULT_ACTION_WIDTH);

		// Detect if user has moved (not just a tap)
		if (Math.abs(x) > 5) {
			hasMoved.value = true;
		}

		if (dragging) {
			isDragging.value = true;

			// During dragging, follow finger but with constraints
			let targetX = x;

			if (hasSwipedLeft.value) {
				// Currently swiped left, allow movement from -300 to 0
				targetX = Math.max(Math.min(x + maxLeftPosition, 0), maxLeftPosition);
			} else {
				// Currently at original position, allow movement from 0 to -300
				targetX = Math.max(Math.min(x, 0), maxLeftPosition);
			}

			set({ cursor: 'grabbing', x: targetX, y: 0 });
			return;
		}

		// Reset dragging state after a delay to allow click handler to check
		setTimeout(() => {
			isDragging.value = false;
		}, DELAY_RESET_DRAG);

		// Determine final position based on swipe direction and current state
		if (hasSwipedLeft.value) {
			// Currently swiped left, check if user wants to return
			if (x > SWIPE_THRESHOLD) {
				// Swipe right to return to original position
				hasSwipedLeft.value = false;
				set({ x: 0, y: 0, cursor: 'grab' });
			} else {
				// Stay at left position
				set({ x: maxLeftPosition, y: 0, cursor: 'grab' });
			}
		} else {
			// Currently at original position, check if user wants to swipe left
			if (x < -SWIPE_THRESHOLD) {
				// Swipe left to max position
				hasSwipedLeft.value = true;
				set({ x: maxLeftPosition, y: 0, cursor: 'grab' });
			} else {
				// Return to original position
				set({ x: 0, y: 0, cursor: 'grab' });
			}
		}

		// Reset move detection after a delay
		setTimeout(() => {
			hasMoved.value = false;
		}, DELAY_RESET_MOVE);
		return;
	},
	{
		domTarget: dragRef,
		axis: 'x',
		filterTaps: true,
		useTouch: true,
		preventWindowScrollY: true,
	},
);

const getGroupDetailPath = () => PATH.GROUP.replace(':id', props.group.id);
const handleLinkClick = () => {
	if (isDragging.value || hasMoved.value) {
		return;
	}
	router.push(getGroupDetailPath());
};
</script>

<template>
	<Flex class="relative" :class="{ 'opacity-70': hidden }">
		<a
			ref="dragRef"
			:href="getGroupDetailPath()"
			draggable="false"
			class="w-full z-10"
			@click.prevent.stop="handleLinkClick">
			<Flex
				stack
				class="gap-2 p-4 shadow-md cursor-pointer"
				:class="[
					isDragging || hasSwipedLeft ? 'rounded-l-2xl' : 'rounded-2xl',
					hidden ? 'bg-slate-100' : 'bg-white',
				]">
				<Flex class="justify-between gap-2">
					<Typography variant="xlSemiBold" class="text-black line-clamp-1 break-all">
						{{ group.name }}
					</Typography>
					<Flex class="gap-2">
						<span
							v-if="hidden"
							class="icon msi-visibility-rounded text-zinc-500 size-5"
							@click.prevent.stop="localDBStore.unhideRecentGroup(group.id)"></span>
						<span
							v-if="pinned"
							class="icon msi-keep-off-rounded text-zinc-500 size-5"
							@click.prevent.stop="localDBStore.unpinRecentGroup(group.id)"></span>
					</Flex>
				</Flex>
				<Flex class="justify-between" wrap>
					<Flex class="gap-1">
						<div :class="$style.tag">
							<span class="icon msi-calendar-clock-rounded"></span>
							<span class="tag-content">{{ dayjs(group.createdAt).format('DD/MM/YYYY') }}</span>
						</div>

						<div :class="$style.tag">
							<span class="icon msi-group-rounded"></span>
							<span class="tag-content">{{ group.members.length }}</span>
						</div>

						<div :class="$style.tag">
							<span
								class="icon"
								:class="PAYMENT_TRACKING_LABEL_MAPPING[group.paymentTrackingMode]?.icon"></span>
						</div>
					</Flex>

					<div class="avatar-group -space-x-4">
						<MemberAvatar
							v-for="member in group.members.slice(0, MAX_AVATAR)"
							:key="member.id"
							v-bind="member"
							:pt="{ img: { draggable: false } }" />
						<div class="avatar placeholder" v-if="group.members.length > MAX_AVATAR">
							<div class="bg-neutral text-neutral-content w-7 rounded-full">
								<Typography variant="xsRegular">
									{{ `+${group.members.length - MAX_AVATAR}` }}
								</Typography>
							</div>
						</div>
					</div>
				</Flex>
			</Flex>
		</a>
		<RecentGroupActions v-model:action-width="actionWidth" :group-id="group.id" />
	</Flex>
</template>

<style module>
.tag {
	@apply flex gap-1 items-center px-2 py-1 rounded-lg bg-slate-100 text-sm text-slate-500;

	:global .icon {
		@apply size-4;
	}

	:global .tag-content {
		@apply text-sm;
	}
}
</style>
