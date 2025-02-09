<script setup lang="ts">
import { fetchGroup } from '@/apis/supabase'
import Flex from '@/components/Flex.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import Typography from '@/components/Typography.vue'
import { QUERY_KEY } from '@/constants/key'
import { PATH } from '@/constants/path'
import type { Group } from '@/types/entities'
import { useQuery } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import { Avatar, AvatarGroup, Skeleton } from 'primevue'
import { computed } from 'vue'

const props = defineProps<{ id: Group['id'] }>()

const queryKey = computed(() => [QUERY_KEY.GROUP, props.id])
const { data: group, isPending } = useQuery({ queryKey, queryFn: () => fetchGroup(props.id) })

const MAX_AVATAR = 5
</script>

<template>
	<Skeleton v-if="isPending" height="144px" border-radius="12px" />
	<Flex
		v-else-if="group"
		class="rounded-2xl bg-neutral-50/20 hover:bg-neutral-100/50 p-4 cursor-pointer border border-neutral-200"
		@click="$router.push(PATH.GROUP.replace(':id', group.id))"
		stack>
		<Flex class="gap-2" stack>
			<Typography variant="xlSemiBold" class="break-words">
				{{ group.name }}
			</Typography>

			<Typography v-if="!group.members.length" class="text-muted-color">No members</Typography>
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
				<Typography variant="mdMedium">{{ group.members.length }} members</Typography>
			</Flex>

			<Typography variant="smRegular" class="text-muted-color">
				<span class="font-medium">Created at:</span>
				{{ dayjs(group.createdAt).format('DD/MM/YYYY HH:mm:ss') }}
			</Typography>
		</Flex>
	</Flex>
</template>
