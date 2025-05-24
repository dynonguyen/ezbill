<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import Typography from '@/components/ui/Typography.vue';
import { ref } from 'vue';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberEditingItem from './MemberEditingItem.vue';
import NewMember from './NewMember.vue';

const { group } = useGroupContext();

const open = ref(false);
</script>

<template>
	<Typography
		variant="xsRegular"
		class="text-indigo-700 cursor-pointer hover:text-indigo-800 pl-4 leading-6"
		@click="open = true">
		Chỉnh sửa
	</Typography>

	<Dialog v-model:open="open" header="Thành viên" hide-close-button>
		<Flex stack class="gap-4 overflow-auto h-full">
			<div class="p-4 rounded-lg bg-blue-100">
				<Typography variant="smRegular" class="text-blue-700">
					Thành viên không thể xoá khi đã tồn tại trong hóa đơn bất kì.
				</Typography>
			</div>

			<Flex stack class="px-4 max-h-120 overflow-auto">
				<MemberEditingItem
					v-for="(member, index) in group.members"
					:key="member.id"
					:member="member"
					:index="index" />
			</Flex>
		</Flex>

		<template #action>
			<Flex stack class="gap-2">
				<NewMember>
					<template v-slot:new-btn="slotProps">
						<Button @click="slotProps.handleOpen">Thêm thành viên</Button>
					</template>
				</NewMember>
				<Button variant="soft" color="grey" @click="open = false">Đóng</Button>
			</Flex>
		</template>
	</Dialog>
</template>
