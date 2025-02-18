<script setup lang="ts">
import Flex from '@/components/Flex.vue';
import FormControl from '@/components/FormControl.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Typography from '@/components/Typography.vue';
import type { Bill, BillMember, Member } from '@/types/entities';
import { toTypedSchema } from '@vee-validate/zod';
import {
	Button,
	Checkbox,
	Divider,
	InputText,
	Popover,
	Select,
	Textarea,
	type InputNumberProps,
	type PopoverMethods,
} from 'primevue';
import { useForm } from 'vee-validate';
import { computed, nextTick, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { z } from 'zod';
import { useGroupContext } from '../hooks/useGroupContext';
import CustomInputNumber from './CustomInputNumber.vue';

type BillFormProps = { mode: 'new' | 'view-detail'; defaultBill?: Bill };

const emit = defineEmits<{ close: []; submit: [form: Omit<Bill, 'id' | 'createdAt'>] }>();
const props = withDefaults(defineProps<BillFormProps>(), { mode: 'new' });

const MAX = { AMOUNT: 1000_000_000_000, NOTE: 1000, NAME: 250 };

const { group, user } = useGroupContext();

const schema = z.object({
	amount: z
		.number({ message: 'Số tiền không hợp lệ' })
		.min(1, 'Số tiền không hợp lệ')
		.max(MAX.AMOUNT, `Tối đa ${MAX.AMOUNT}`),
	name: z
		.string({ message: 'Nhập tên sự kiện' })
		.nonempty('Nhập tên sự kiện')
		.max(MAX.NAME, `Tối đa ${MAX.NAME}`),
	createdBy: z.string().nonempty('Chọn người trả bill'),
	note: z.string().max(MAX.NOTE).optional().nullable(),
});

type BillForm = z.infer<typeof schema>;
type MemberAmounts = { [key: Member['id']]: { amount: number } };

const validationSchema = toTypedSchema(schema);

const initialValues = computed<Partial<BillForm>>(() => {
	if (props.mode === 'new') return { createdBy: user.value?.id };
	if (!props.defaultBill) return {};

	const { amount, createdBy, name, note } = props.defaultBill;

	return { amount, createdBy, name, note };
});

const { errors, values, handleSubmit, defineField, setValues } = useForm<BillForm>({
	validationSchema,
	initialValues: initialValues.value,
});

const toast = useToast();

const [amountField, amountProps] = defineField('amount');
const [noteField, noteProps] = defineField('note');
const [nameField, nameProps] = defineField('name');
const [createdByField, createdByProps] = defineField('createdBy');

const getDefaultMemberAmounts = () => {
	if (props.mode === 'new')
		return group.value.members.reduce((acc, member) => {
			acc[member.id] = { amount: 0 };
			return acc;
		}, {} as MemberAmounts);

	return Object.fromEntries(
		Object.entries(props.defaultBill!.members).map(([id, amount]) => [id, { amount }]),
	);
};

const openDetail = ref(false);
const isDivEqually = ref(true);
const memberAmounts = ref<MemberAmounts>(getDefaultMemberAmounts());
const selectMemberAnchor = ref<PopoverMethods>();

const totalMembers = computed(() => Object.keys(memberAmounts.value).length);

const handleSubmitBill = handleSubmit(async (form) => {
	const { amount, createdBy, note, name } = form;
	const billMembers: BillMember = Object.fromEntries(
		Object.entries(memberAmounts.value)
			.filter(([_, { amount }]) => amount > 0)
			.map(([id, { amount }]) => [id, amount]),
	);

	if (Object.keys(billMembers).length === 0) {
		return toast.error('Số tiền của thành viên không hợp lệ');
	}

	emit('submit', { groupId: group.value.id, amount, createdBy, note, name, members: billMembers });
});

const calculateTotalAmount = () => {
	const total = Object.values(memberAmounts.value).reduce((acc, { amount }) => acc + amount, 0);
	setValues({ amount: total });
};

const handleMemberAmountChange = (memberId: Member['id'], amount: number) => {
	memberAmounts.value[memberId].amount = amount;
	calculateTotalAmount();
};

const splitAmountEvenly = () => {
	if (totalMembers.value === 0) return;

	const sharedAmount = values.amount / totalMembers.value || 0;

	memberAmounts.value = Object.entries(memberAmounts.value).reduce(
		(acc, [id]) => ({ ...acc, [id]: { amount: sharedAmount } }),
		{},
	);
};

const handleAddMember = (memberId: Member['id']) => {
	memberAmounts.value = { ...memberAmounts.value, [memberId]: { amount: 0 } };
	selectMemberAnchor.value?.hide();
	if (!isDivEqually.value) {
		nextTick(() => {
			document.getElementById(memberId)?.focus();
		});
	}
};

const handleAddAllMember = () => {
	group.value.members.forEach((member) => {
		if (!memberAmounts.value[member.id]) memberAmounts.value[member.id] = { amount: 0 };
	});
	selectMemberAnchor.value?.hide();
};

const handleDeleteMember = (memberId: Member['id']) => {
	memberAmounts.value = Object.fromEntries(
		Object.entries(memberAmounts.value).filter(([id]) => id !== memberId),
	);

	if (!isDivEqually.value) calculateTotalAmount();
};

const handleDeleteAllMembers = () => {
	memberAmounts.value = {};
	if (!isDivEqually.value) calculateTotalAmount();
};

// Divide equally among members
watch([isDivEqually, totalMembers, () => values.amount], () => {
	if (isDivEqually.value) splitAmountEvenly();
});

const inputNumberProps: InputNumberProps = {
	locale: 'vi-VN',
	step: 1000,
	min: 0,
	max: MAX.AMOUNT,
	buttonLayout: 'horizontal',
	mode: 'currency',
	currency: 'VND',
};
</script>

<template>
	<Flex stack class="gap-4 max-h-160 overflow-hidden pb-4" as="form" @submit="handleSubmitBill">
		<Flex stack class="gap-2 overflow-auto px-4">
			<!-- Form -->
			<Flex stack class="gap-3">
				<FormControl
					html-for="amount"
					label="Số tiền"
					:error="Boolean(errors.amount)"
					:helper-text="errors.amount">
					<CustomInputNumber
						input-id="amount"
						placeholder="Nhập số tiền (VND)"
						fluid
						input-class="!py-2"
						v-bind="{ ...inputNumberProps, ...amountProps }"
						v-model="amountField"
						:disabled="!isDivEqually"
						:show-buttons="isDivEqually" />
				</FormControl>

				<FormControl
					html-for="createdBy"
					label="Tên sự kiện"
					:error="Boolean(errors.name)"
					:helper-text="errors.name">
					<InputText
						placeholder="Nhập tên sự kiện"
						v-model="nameField"
						v-bind="nameProps"
						:maxlength="MAX.NAME" />
				</FormControl>

				<FormControl html-for="createdBy" label="Người trả">
					<Select
						:options="
							group.members.map((m) => (m.id === user?.id ? { ...m, name: `${m.name} (Bạn)` } : m))
						"
						option-value="id"
						option-label="name"
						placeholder="Chọn người trả bill này"
						:default-value="$props.mode === 'new' ? user?.id : $props.defaultBill?.createdBy"
						v-model="createdByField"
						v-bind="createdByProps" />
				</FormControl>

				<FormControl html-for="note" label="Mô tả">
					<Textarea
						placeholder="Nhập mô tả (nếu có)"
						rows="4"
						id="note"
						:maxlength="MAX.NOTE"
						v-model="noteField"
						v-bind="noteProps" />
				</FormControl>

				<Flex stack class="gap-1">
					<Flex class="gap-2">
						<Checkbox input-id="div-equally" v-model="isDivEqually" binary />
						<Typography as="label" for="div-equally" variant="mdMedium">
							Chia đều cho các thành viên ({{ totalMembers }})
						</Typography>
					</Flex>
					<Typography variant="smRegular" class="text-neutral-500">
						({{
							isDivEqually
								? 'Số tiền sẽ được chia đều cho các thành viên'
								: 'Nhập chi tiết số tiền của các thành viên'
						}})
					</Typography>
				</Flex>
			</Flex>

			<!-- Details -->
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
				<Flex
					v-for="member in Object.keys(memberAmounts).map(
						(id) => group.members.find((m) => m.id === id)!,
					)"
					:key="member.id"
					class="gap-3 items-center">
					<MemberAvatar v-bind="member" :show-tooltip="false" class="!size-8 shrink-0 mt-5" />
					<FormControl
						:label="member.name"
						class="w-full"
						:html-for="member.id"
						:pt="{ label: { class: 'break-all line-clamp-1' } }"
						:error="Boolean(memberAmounts[member.id]?.amount < 0)">
						<CustomInputNumber
							placeholder="Nhập số tiền"
							fluid
							:input-id="member.id"
							:model-value="memberAmounts[member.id]?.amount"
							v-bind="inputNumberProps"
							:disabled="isDivEqually"
							:show-buttons="!isDivEqually"
							@value-change="(val) => handleMemberAmountChange(member.id, val)" />
					</FormControl>
					<span
						class="icon msi-delete-outline-rounded mt-5 size-8 text-neutral-500 hover:text-red-400 cursor-pointer"
						@click="handleDeleteMember(member.id)" />
				</Flex>

				<Flex class="gap-4 justify-between">
					<template v-if="totalMembers !== group.members.length">
						<Button
							variant="text"
							icon="icon msi-add-2-rounded"
							severity="secondary"
							label="Thêm thành viên"
							size="small"
							@click="selectMemberAnchor?.toggle" />

						<Popover ref="selectMemberAnchor">
							<Flex stack class="gap-3">
								<Button
									size="small"
									severity="secondary"
									label="Thêm tất cả"
									class="mr-auto"
									@click="handleAddAllMember" />

								<div stack class="grid grid-cols-4 gap-4 w-106 max-h-100 overflow-auto">
									<Flex
										v-for="member in group.members.filter((m) => !memberAmounts[m.id])"
										:key="member.id"
										stack
										center
										class="gap-2 p-2 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-100 h-full justify-start"
										@click="handleAddMember(member.id)">
										<MemberAvatar v-bind="member" :show-tooltip="false" />
										<Typography variant="xsMedium" class="break-all text-center line-clamp-1">
											{{ member.name }}
										</Typography>
									</Flex>
								</div>
							</Flex>
						</Popover>
					</template>

					<Button
						v-if="totalMembers"
						icon="icon msi-delete-outline-rounded"
						variant="text"
						severity="danger"
						label="Xoá tất cả"
						size="small"
						class="ml-auto"
						@click="handleDeleteAllMembers" />
				</Flex>
			</Flex>
		</Flex>

		<!-- Action buttons -->
		<Flex class="justify-end gap-2 px-4 mt-auto shrink-0">
			<slot name="other-actions"></slot>
			<Button label="Đóng" variant="outlined" @click="$emit('close')" />
			<slot name="submit-button"></slot>
		</Flex>
	</Flex>
</template>
