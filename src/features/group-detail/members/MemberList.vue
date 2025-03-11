<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { useGroupContext } from '../hooks/useGroupContext';
import AccountingMaker from './AccountingMaker.vue';
import MemberEditing from './MemberEditing.vue';
import NewMember from './NewMember.vue';

const { group } = useGroupContext();
</script>

<template>
	<Flex stack class="pt-2 pb-4 gap-4">
		<Flex class="justify-between px-4">
			<Typography variant="mdSemiBold" class="text-black">
				Thành viên {{ group.members.length ? `(${group.members.length})` : '' }}
			</Typography>
			<MemberEditing v-if="group.members.length" />
		</Flex>

		<Flex class="overflow-auto !items-start pl-4">
			<NewMember>
				<template v-slot:new-btn="slotProps">
					<Flex
						stack
						center
						class="text-indigo-700 gap-1 px-2 w-[80px] cursor-pointer hover:text-indigo-900 group h-full !justify-start shrink-0">
						<Flex
							center
							class="border border-dashed border-indigo-700 group-hover:border-indigo-900 size-12 rounded-full"
							@click="slotProps.handleOpen">
							<span class="icon msi-add-rounded size-5"></span>
						</Flex>
						<Typography variant="xsRegular" class="text-center">Thêm</Typography>
					</Flex>
				</template>
			</NewMember>

			<Flex
				v-for="member in group.members"
				:key="member.id"
				stack
				center
				class="gap-1 px-2 w-[72px] h-full !justify-start shrink-0">
				<AccountingMaker :show="member.isAccounting" class="size-12">
					<MemberAvatar v-bind="member" :pt="{ avatar: { class: '!size-12' } }" />
				</AccountingMaker>

				<Typography
					variant="xsRegular"
					class="text-center break-all line-clamp-1 text-slate-500"
					:title="member.name">
					{{ member.name }}
				</Typography>
			</Flex>
		</Flex>
	</Flex>
</template>
