<script setup lang="ts">
import { fetchGroup } from '@/apis/supabase'
import Feedback from '@/components/Feedback.vue'
import Flex from '@/components/Flex.vue'
import Loading from '@/components/Loading.vue'
import { CONTEXT_KEY, QUERY_KEY } from '@/constants/key'
import { PATH } from '@/constants/path'
import { useLocalDBStore } from '@/stores/local-db'
import { getImgUrl } from '@/utils/get-asset'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { Button } from 'primevue'
import { computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import JoinGroup from './join-group/JoinGroup.vue'

const route = useRoute()
const groupId = computed(() => route.params.id as string)
const localDBStore = useLocalDBStore()
const { joinedGroups } = storeToRefs(localDBStore)

const {
	data: group,
	isPending,
	isError,
} = useQuery({
	queryKey: [QUERY_KEY.GROUP, groupId],
	queryFn: () => fetchGroup(groupId.value),
})

const isJoined = computed(() =>
	joinedGroups.value.some(
		(g) => g.groupId === groupId.value && group.value?.members.some((m) => m.id === g.userId),
	),
)

provide(CONTEXT_KEY.GROUP, group)
</script>

<template>
	<div class="px-4">
		<Flex v-if="isPending" center class="h-full">
			<Loading />
		</Flex>
		<Feedback
			v-else-if="isError || !group"
			:img="getImgUrl('no-groups-found.svg')"
			title="Nhóm không tồn tại hoặc đã xảy ra lỗi.">
			<template #action>
				<Button
					class="w-fit"
					icon="icon msi-home-outline-rounded"
					label="Về trang chủ"
					@click="$router.push(PATH.HOME)" />
			</template>
		</Feedback>
		<template v-else>
			<JoinGroup v-if="!isJoined" />
			<div v-else>
				<div>{{ group.name }}</div>
				<Button @click="localDBStore.removeFromGroup(group.id)">Out group</Button>
			</div>
		</template>
	</div>
</template>
