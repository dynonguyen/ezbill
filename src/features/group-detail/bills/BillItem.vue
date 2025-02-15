<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import type { Bill, Member } from '@/types/entities';
import { toVND } from '@/utils/helpers';
import dayjs from 'dayjs';
import { Avatar, AvatarGroup } from 'primevue';
import { computed } from 'vue';
import ContainerBox from '../ContainerBox.vue';
import { useGroupContext } from '../hooks/useGroupContext';

const props = defineProps<{ bill: Bill }>();

const MAX_AVATAR = 6;

const { user, group } = useGroupContext();

const createdBy = computed(
	() => group.value.members.find((member) => member.id === props.bill.createdBy)!,
);

const splitWith = computed(() => {
	const members = Object.keys(props.bill.members)
		.slice(0, MAX_AVATAR)
		.map((id) => group.value.members.find((m) => m.id === id))
		.filter(Boolean) as Member[];

	const nMemberInBill = Object.keys(props.bill.members).length;

	return { remaining: nMemberInBill > MAX_AVATAR ? nMemberInBill - MAX_AVATAR : 0, members };
});
</script>

<template>
	<ContainerBox class="cursor-pointer hover:shadow-lg">
		<Flex stack class="gap-3">
			<Flex class="justify-between items-start gap-2 flex-wrap">
				<Typography variant="lgMedium" class="line-clamp-2 break-words">
					{{ $props.bill.name }}
				</Typography>

				<Typography variant="lgMedium" class="shrink-0">{{ toVND($props.bill.amount) }}</Typography>
			</Flex>

			<Flex class="justify-between items-end">
				<Flex stack class="gap-1">
					<Flex class="gap-2 flex-wrap">
						<MemberAvatar v-bind="createdBy" :show-tooltip="false" class="shrink-0 !size-7" />
						<Typography>
							{{ createdBy.name + (user.id === props.bill.createdBy ? ' (bạn)' : '') }} đã trả cho
						</Typography>
					</Flex>

					<Typography class="text-neutral-500">
						{{ dayjs(props.bill.createdAt).format('DD/MM/YYYY HH:mm') }}
					</Typography>
				</Flex>

				<AvatarGroup class="shrink-0">
					<MemberAvatar
						v-for="member in splitWith.members"
						:key="member.id"
						v-bind="member"
						class="!size-7" />

					<Avatar
						v-if="splitWith.remaining"
						:label="`+${splitWith.remaining}`"
						shape="circle"
						class="!size-7" />
				</AvatarGroup>
			</Flex>
		</Flex>
	</ContainerBox>
</template>
