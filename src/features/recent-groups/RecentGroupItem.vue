<script setup lang="ts">
import { fetchGroup } from '@/apis/supabase';
import Flex from '@/components/Flex.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import { QUERY_KEY } from '@/constants/key';
import { PATH } from '@/constants/path';
import { useLocalDBStore } from '@/stores/local-db';
import type { Group } from '@/types/entities';
import { useQuery } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { Avatar, AvatarGroup, Skeleton } from 'primevue';
import { computed, watch } from 'vue';

const props = defineProps<{ id: Group['id'] }>();
const localDBStore = useLocalDBStore();

const queryKey = computed(() => [QUERY_KEY.GROUP, props.id]);
const {
	data: group,
	isPending,
	error,
} = useQuery({ queryKey, queryFn: () => fetchGroup(props.id) });

const MAX_AVATAR = 5;

watch(error, () => {
	if (error.value) {
		localDBStore.removeFromGroup(props.id);
	}
});
</script>

<template>
	<Skeleton v-if="isPending" height="144px" border-radius="12px" />
	<Flex
		v-else-if="group"
		class="rounded-2xl p-4 bg-white shadow-lg shadow-neutral-200/25 w-full cursor-pointer hover:shadow-neutral-200 transition-shadow"
		@click="$router.push(PATH.GROUP.replace(':id', group.id))"
		stack>
		<Flex class="gap-2" stack>
			<Typography variant="lgSemiBold" class="break-words">
				{{ group.name }}
			</Typography>

			<Typography v-if="!group.members.length" class="text-muted-color">
				Chưa có thành viên
			</Typography>
			<Flex v-else class="gap-2">
				<AvatarGroup>
					<MemberAvatar
						v-for="member in group.members.slice(0, MAX_AVATAR)"
						:key="member.id"
						v-bind="member" />
					<Avatar
						v-if="group.members.length > MAX_AVATAR"
						:label="`+${group.members.length - MAX_AVATAR}`"
						shape="circle" />
				</AvatarGroup>
				<Typography>{{ group.members.length }} thành viên</Typography>
			</Flex>

			<Typography variant="smRegular" class="text-muted-color">
				<span class="font-medium">Ngày tạo:</span>
				{{ dayjs(group.createdAt).format('DD/MM/YYYY HH:mm') }}
			</Typography>
		</Flex>
	</Flex>
</template>
