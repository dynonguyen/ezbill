<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { PATH } from '@/constants/path';
import type { Group } from '@/types/entities';
import dayjs from 'dayjs';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps<{ group: Group }>();

const MAX_AVATAR = 3;
const groupDetailPath = computed(() => PATH.GROUP.replace(':id', props.group.id));
</script>

<template>
	<RouterLink :to="groupDetailPath">
		<Flex stack class="gap-2 p-4 rounded-2xl bg-white shadow-lg cursor-pointer">
			<Typography variant="xlSemiBold" class="text-black line-clamp-1 break-all">
				{{ group.name }}
			</Typography>
			<Flex class="justify-between" wrap>
				<Flex class="gap-1">
					<div :class="$style.tag">
						<span class="icon msi-calendar-clock-rounded"></span>
						<span class="tag-content">{{ dayjs(group.createdAt).format('DD/MM/YYYY HH:mm') }}</span>
					</div>

					<div :class="$style.tag">
						<span class="icon msi-group-rounded"></span>
						<span class="tag-content">{{ group.members.length }}</span>
					</div>
				</Flex>

				<div class="avatar-group -space-x-4">
					<MemberAvatar
						v-for="member in group.members.slice(0, MAX_AVATAR)"
						:key="member.id"
						v-bind="member" />
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
	</RouterLink>
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
