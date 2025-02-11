<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import FormControl from '@/components/FormControl.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import type { Member } from '@/types/entities';
import { toTypedSchema } from '@vee-validate/zod';
import { Button, Divider, InputNumber, Select, Textarea, type InputNumberProps } from 'primevue';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { z } from 'zod';
import { useGroupContext } from '../hooks/useGroupContext';

defineEmits<{ close: [] }>();

const MAX = {
	AMOUNT: 1000_000_000_000,
	NOTE: 1000,
};

const { group, user } = useGroupContext();

const schema = z.object({
	amount: z
		.number({ message: 'Số tiền không hợp lệ' })
		.min(1, 'Số tiền không hợp lệ')
		.max(MAX.AMOUNT, `Tối đa ${MAX.AMOUNT}`),
	createdBy: z.string().nonempty('Chọn người trả bill'),
	note: z.string().max(MAX.NOTE).optional(),
});

type BillForm = z.infer<typeof schema>;
type MemberAmounts = { [key: Member['id']]: { amount: number; edited: boolean } };

const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, defineField, values } = useForm<BillForm>({
	validationSchema,
	initialValues: { createdBy: user.value?.id },
});

const [amountField, amountProps] = defineField('amount');
const [noteField, noteProps] = defineField('note');
const [createdByField, createdByProps] = defineField('createdBy');

const openDetail = ref(true);
const memberAmounts = ref<MemberAmounts>({});

const handleAddBill = handleSubmit(async (form) => {
	console.log(form);
});

const handleMemberAmountChange = (memberId: Member['id'], amount: number) => {
	console.log(memberId, amount);
};

watch(
	() => values.amount,
	() => {
		const totalMembers = group.value.members.length;
		const amount = values.amount / totalMembers;
		memberAmounts.value = group.value.members.reduce((acc, member) => {
			acc[member.id] = { amount, edited: false };
			return acc;
		}, {} as MemberAmounts);
	},
);

const inputNumberProps: InputNumberProps = {
	locale: 'vi-VN',
	step: 1000,
	min: 1,
	max: MAX.AMOUNT,
	showButtons: true,
	buttonLayout: 'horizontal',
	mode: 'currency',
	currency: 'VND',
};
</script>

<template>
	<Flex stack class="gap-4 max-h-140 overflow-hidden pb-4" as="form" @submit="handleAddBill">
		<Flex stack class="gap-2 overflow-auto px-4">
			<!-- Form -->
			<Flex stack class="gap-3">
				<FormControl
					html-for="amount"
					label="Số tiền"
					:error="Boolean(errors.amount)"
					:helper-text="errors.amount">
					<InputNumber
						input-id="amount"
						placeholder="Nhập số tiền (VND)"
						fluid
						input-class="!py-2"
						v-bind="{ ...inputNumberProps, ...amountProps }"
						v-model="amountField">
						<template #decrementicon>
							<span class="icon msi-remove-rounded"></span>
						</template>
						<template #incrementicon>
							<span class="icon msi-add-2-rounded"></span>
						</template>
					</InputNumber>
				</FormControl>

				<FormControl html-for="createdBy" label="Người trả">
					<Select
						:options="
							group.members.map((m) => (m.id === user?.id ? { ...m, name: `${m.name} (Bạn)` } : m))
						"
						option-value="id"
						option-label="name"
						placeholder="Chọn người trả bill này"
						:default-value="user?.id"
						v-model="createdByField"
						v-bind="createdByProps" />
				</FormControl>

				<FormControl
					html-for="note"
					label="Mô tả"
					:error="Boolean(errors.note)"
					:helper-text="errors.note">
					<Textarea
						placeholder="Nhập mô tả (nếu có)"
						rows="4"
						id="note"
						v-model="noteField"
						v-bind="noteProps" />
				</FormControl>
			</Flex>

			<!-- Details -->
			<template v-if="values.amount > 0">
				<Divider>
					<Button
						severity="secondary"
						class="mx-auto"
						:icon="
							'icon msi-keyboard-arrow-down-rounded size-6 shrink-0' +
							(openDetail ? ' rotate-180' : '')
						"
						icon-pos="right"
						size="small"
						:label="openDetail ? 'Ẩn chi tiết' : 'Xem chi tiết'"
						@click="openDetail = !openDetail" />
				</Divider>

				<Flex v-if="openDetail" stack class="gap-4">
					<Flex v-for="member in group.members" :key="member.id" class="gap-3 items-center">
						<MemberAvatar v-bind="member" :show-tooltip="false" class="!size-8 shrink-0 mt-5" />
						<FormControl
							:label="member.name"
							class="w-full"
							:html-for="member.id"
							:pt="{ label: { class: 'break-all line-clamp-1' } }">
							<InputNumber
								placeholder="Nhập số tiền"
								fluid
								:input-id="member.id"
								:model-value="memberAmounts[member.id]?.amount"
								v-bind="inputNumberProps"
								:max="values.amount - 1"
								@value-change="(val) => handleMemberAmountChange(member.id, val)" />
						</FormControl>
						<span
							class="icon msi-delete-forever-outline-rounded mt-5 size-8 text-neutral-500 hover:text-red-400 cursor-pointer" />
					</Flex>
				</Flex>
			</template>
		</Flex>

		<!-- Action buttons -->
		<Flex class="justify-end gap-2 px-4 mt-auto shrink-0">
			<Button label="Đóng" variant="outlined" @click="$emit('close')" />
			<Button type="submit" label="Tạo" class="min-w-20" />
		</Flex>
	</Flex>
</template>
