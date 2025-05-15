<script setup lang="ts">
import CurrencyText from '@/components/CurrencyText.vue';
import MemberAvatar from '@/components/MemberAvatar.vue';
import Button from '@/components/ui/Button.vue';
import CurrencyInput from '@/components/ui/CurrencyInput.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import { useToast } from '@/hooks/useToast';
import type { Bill, BillMember, Member } from '@/types/entities';
import { toVND } from '@/utils/helpers';
import { toTypedSchema } from '@vee-validate/zod';
import dayjs from 'dayjs';
import { useForm } from 'vee-validate';
import { computed, nextTick, ref, watch } from 'vue';
import { z } from 'zod';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberSelect from '../MemberSelect.vue';

type BillFormProps = { mode: 'new' | 'view-detail'; defaultBill?: Bill };
type BillForm = {
	name: string;
	amount: number;
	createdBy: string;
	note?: string | null | undefined;
};
type MemberAmounts = { [key: Member['id']]: { amount: number } };
export type BillFormModel = { amount: number; isDivEqually: boolean };

const emit = defineEmits<{ close: []; submit: [form: Omit<Bill, 'id' | 'createdAt'>] }>();
const model = defineModel<BillFormModel>();
const props = withDefaults(defineProps<BillFormProps>(), { mode: 'new' });

const MAX = { AMOUNT: 100_000_000_000, NOTE: 1000, NAME: 250 };

const { group } = useGroupContext();

const baseSchema = z.object({
	name: z.string({ message: 'Nhập tên sự kiện' }).max(MAX.NAME, `Tối đa ${MAX.NAME}`).optional(),
	createdBy: z.string().nonempty('Chọn người trả bill'),
	note: z.string().max(MAX.NOTE).optional().nullable(),
});

const isDivEqually = ref(
	(() => {
		if (props.mode === 'new' || !props.defaultBill) return true;

		const members = Object.entries(props.defaultBill.members);

		if (members.length <= 1) return true;

		const splitAmountEvenly = members[0][1];
		return members.every(([_, amount]) => amount === splitAmountEvenly);
	})(),
);

const validationSchema = computed(() => {
	const schema = isDivEqually.value
		? baseSchema.merge(
				z.object({
					amount: z.coerce
						.number({ message: 'Số tiền không hợp lệ' })
						.min(1, 'Số tiền không hợp lệ')
						.max(MAX.AMOUNT, `Tối đa ${toVND(MAX.AMOUNT)}`),
				}),
			)
		: baseSchema;

	return toTypedSchema(schema);
});

const initialValues = computed<Partial<BillForm>>(() => {
	if (props.mode === 'new' || !props.defaultBill) return { createdBy: '' };

	const { amount, createdBy, name, note } = props.defaultBill;

	return { amount, createdBy, name, note };
});

const { errors, values, handleSubmit, defineField, setFieldValue } = useForm<BillForm>({
	validationSchema: validationSchema,
	initialValues: initialValues.value,
});
const toast = useToast();

const [amountField] = defineField('amount');
const [noteField, noteProps] = defineField('note');
const [nameField, nameProps] = defineField('name');
const [createdByField] = defineField('createdBy');

const defaultEventName = `Sự kiện ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;

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

const memberAmounts = ref<MemberAmounts>(getDefaultMemberAmounts());
const openAddMember = ref(false);

const totalMembers = computed(() => Object.keys(memberAmounts.value).length);
const totalMembersAmount = computed(() =>
	Object.values(memberAmounts.value).reduce((acc, { amount }) => acc + amount, 0),
);

const handleSubmitBill = handleSubmit(async (form) => {
	const { createdBy, note } = form;
	const name = form.name?.trim() || defaultEventName;

	let billMembers: BillMember = Object.fromEntries(
		Object.entries(memberAmounts.value)
			.filter(([_, { amount }]) => amount > 0)
			.map(([id, { amount }]) => [id, amount]),
	);

	if (Object.keys(billMembers).length === 0) {
		if (isDivEqually.value) {
			billMembers = { [createdBy]: form.amount };
		} else {
			return toast.error('Số tiền của thành viên không hợp lệ');
		}
	}

	let amount = form.amount;
	if (!isDivEqually.value) {
		amount = Object.values(billMembers).reduce((acc, amount) => acc + amount, 0);
	}

	emit('submit', { groupId: group.value.id, amount, createdBy, note, name, members: billMembers });
});

const calculateTotalAmount = () => {
	const total = Object.values(memberAmounts.value).reduce((acc, { amount }) => acc + amount, 0);
	setFieldValue('amount', total);
};

const splitAmountEvenly = () => {
	if (totalMembers.value === 0) return;

	const sharedAmount = values.amount / totalMembers.value || 0;

	memberAmounts.value = Object.entries(memberAmounts.value).reduce(
		(acc, [id]) => ({ ...acc, [id]: { amount: sharedAmount } }),
		{},
	);
};

const handleMemberAmountChange = (memberId: Member['id'], amount: number) => {
	memberAmounts.value[memberId].amount = amount;
};

const handleAddMember = (memberId: Member['id']) => {
	memberAmounts.value = { ...memberAmounts.value, [memberId]: { amount: 0 } };

	if (Object.keys(memberAmounts.value).length === group.value.members.length) {
		openAddMember.value = false;
	}

	if (!isDivEqually.value) {
		nextTick(() => document.getElementById(memberId)?.focus());
	}
};

const handleAddAllMember = () => {
	openAddMember.value = false;

	group.value.members.forEach((member) => {
		if (!memberAmounts.value[member.id]) memberAmounts.value[member.id] = { amount: 0 };
	});
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

const handleModeChange = (divEqually: boolean) => {
	isDivEqually.value = divEqually;
};

// Divide equally among members
watch([isDivEqually, totalMembers, () => values.amount], () => {
	if (isDivEqually.value) splitAmountEvenly();
});

watch(
	[isDivEqually, totalMembersAmount],
	() => {
		model.value = { isDivEqually: isDivEqually.value, amount: totalMembersAmount.value };
	},
	{ immediate: true },
);

const tabs = [
	{ label: 'Chia đều', value: true, helper: 'Số tiền sẽ được chia đều cho các thành viên.' },
	{ label: 'Tự chia', value: false, helper: 'Nhập chi tiết số tiền của các thành viên.' },
];
</script>

<template>
	<Flex stack class="gap-4 relative" as="form" @submit="handleSubmitBill">
		<div role="tablist" class="tabs tabs-boxed">
			<a
				v-for="tab in tabs"
				:key="tab.value.toString()"
				role="tab"
				class="tab"
				:class="{ 'tab-active': isDivEqually === tab.value }"
				@click="handleModeChange(tab.value)">
				{{ tab.label }}
			</a>
		</div>

		<Typography variant="smRegular" class="text-slate-500">
			{{ tabs.find((tab) => tab.value === isDivEqually)?.helper }}
		</Typography>

		<!-- Form -->
		<Flex stack class="gap-4">
			<!-- Amount -->
			<FormControl
				v-if="isDivEqually"
				label="Số tiền tổng hóa đơn"
				:error="Boolean(errors.amount)"
				class="[&_input]:w-full"
				:helper-text="errors.amount">
				<CurrencyInput
					:model-value="amountField"
					@change="(valStr) => setFieldValue('amount', Number(valStr))"
					placeholder="Nhập số tiền (VND)" />
			</FormControl>

			<!-- Created by -->
			<FormControl
				label="Người trả"
				:error="Boolean(errors.createdBy)"
				:helper-text="errors.createdBy">
				<MemberSelect placeholder="Chọn người trả" v-model:value="createdByField" />
			</FormControl>

			<!-- Event -->
			<FormControl
				html-for="name"
				label="Tên sự kiện"
				:error="Boolean(errors.name)"
				:helper-text="errors.name">
				<input
					class="input input-bordered w-full"
					:placeholder="defaultEventName"
					id="name"
					v-model="nameField"
					v-bind="nameProps"
					:maxlength="MAX.NAME" />
			</FormControl>

			<!-- Notes -->
			<FormControl html-for="note" label="Mô tả">
				<textarea
					class="textarea textarea-bordered"
					placeholder="Nhập mô tả (nếu có)"
					rows="4"
					id="note"
					:maxlength="MAX.NOTE"
					v-model="noteField"
					v-bind="noteProps" />
			</FormControl>
		</Flex>

		<!-- Members -->
		<Flex stack>
			<Typography variant="mdSemiBold" class="text-black">
				Thành viên tham gia ({{ totalMembers }})
			</Typography>

			<Flex
				v-for="member in Object.keys(memberAmounts).map(
					(id) => group.members.find((m) => m.id === id)!,
				)"
				:key="member.id"
				class="gap-4 py-4 border-b border-dashed border-gray-300">
				<MemberAvatar
					v-bind="member"
					size="full"
					:pt="{ avatar: { class: '!size-12' } }"
					:class="{ 'mt-6': !isDivEqually }" />

				<Flex stack class="gap-1 grow">
					<Typography variant="smRegular" class="text-slate-500 line-clamp-1 break-all">
						{{ member.name }}
					</Typography>

					<CurrencyText
						v-if="isDivEqually"
						:amount="memberAmounts[member.id]?.amount || 0"
						amount-class="text-md text-black font-semibold"
						unit-class="text-sm text-black"
						:fixed="0" />
					<FormControl
						v-else
						:error="memberAmounts[member.id]?.amount < 0"
						class="[&_input]:w-full">
						<CurrencyInput
							:model-value="memberAmounts[member.id]?.amount || 0"
							@change="(amountStr) => handleMemberAmountChange(member.id, Number(amountStr))"
							placeholder="Nhập số tiền (VND)" />
					</FormControl>
				</Flex>

				<span
					class="icon msi-delete-rounded size-5 text-red-500 hover:text-red-700 cursor-pointer shrink-0"
					:class="{ 'mt-6': !isDivEqually }"
					@click="handleDeleteMember(member.id)" />
			</Flex>

			<!-- Member actions -->
			<Flex class="justify-between">
				<template v-if="totalMembers !== group.members.length">
					<Flex class="gap-1 py-4 text-indigo-700 cursor-pointer" @click="openAddMember = true">
						<span class="icon msi-add-rounded size-5"></span>
						<Typography variant="smRegular">Thêm thành viên</Typography>
					</Flex>

					<Dialog v-model:open="openAddMember" header="Thêm thành viên">
						<div stack class="grid grid-cols-3 gap-3">
							<Flex
								v-for="member in group.members.filter((m) => !memberAmounts[m.id])"
								:key="member.id"
								stack
								center
								class="gap-2 p-2 border border-neutral-200 rounded-xl cursor-pointer hover:bg-neutral-100 h-full justify-start"
								@click="handleAddMember(member.id)">
								<MemberAvatar v-bind="member" />
								<Typography variant="xsMedium" class="break-all text-center line-clamp-1">
									{{ member.name }}
								</Typography>
							</Flex>
						</div>

						<template #action>
							<Button @click="handleAddAllMember">Thêm tất cả</Button>
						</template>
					</Dialog>
				</template>

				<Flex
					v-if="totalMembers"
					class="gap-1 text-red-500 cursor-pointer ml-auto py-4"
					@click="handleDeleteAllMembers">
					<Typography variant="smRegular">Xoá tất cả</Typography>
					<span class="icon msi-delete-rounded size-5"></span>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>
