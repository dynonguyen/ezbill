<script setup lang="ts">
import CurrencyInput from '@/components/ui/CurrencyInput.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import { CONTEXT_KEY } from '@/constants/key';
import { useToast } from '@/hooks/useToast';
import { BillType, type Bill, type BillMember, type Member } from '@/types/entities';
import { toVND, veeValidateFocusOnError } from '@/utils/helpers';
import { toTypedSchema } from '@vee-validate/zod';
import dayjs from 'dayjs';
import { match } from 'ts-pattern';
import { useForm } from 'vee-validate';
import { computed, provide, ref, toRaw } from 'vue';
import { z } from 'zod';
import { billTypeMapping } from '../helpers/utils';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberSelect from '../MemberSelect.vue';
import Equally from './splitting-form/Equally.vue';
import Exact from './splitting-form/Exact.vue';
import { type BillFormContextValue } from './splitting-form/useBillFormContext';

type BillFormProps = { mode: 'new' | 'view-detail'; defaultBill?: Bill };
type BillForm = Pick<Bill, 'type' | 'amount' | 'createdBy' | 'name' | 'note'>;

const MAX = { AMOUNT: 100_000_000_000, NOTE: 1000, NAME: 250 };
const defaultEventName = `Sự kiện ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;

const schema = z.object({
	type: z.nativeEnum(BillType).default(BillType.Equally),
	createdBy: z.string().nonempty('Chọn người trả bill'),
	amount: z.coerce
		.number({ message: 'Số tiền không hợp lệ' })
		.min(1, 'Số tiền không hợp lệ')
		.max(MAX.AMOUNT, `Tối đa ${toVND(MAX.AMOUNT)}`),
	name: z.string({ message: 'Nhập tên sự kiện' }).max(MAX.NAME, `Tối đa ${MAX.NAME}`).optional(),
	note: z.string().max(MAX.NOTE).optional().nullable(),
});

const props = withDefaults(defineProps<BillFormProps>(), { mode: 'new' });
const emit = defineEmits<{ submit: [form: Omit<Bill, 'id' | 'createdAt'>] }>();

const { group } = useGroupContext();

const validationSchema = toTypedSchema(schema);

const initialValues = computed<Partial<BillForm>>(() => {
	if (props.mode === 'new' || !props.defaultBill) return { type: BillType.Equally, createdBy: '' };

	const { type, amount, createdBy, name, note } = props.defaultBill;

	return { type, amount, createdBy, name, note };
});

const { errors, handleSubmit, defineField, setFieldValue } = useForm<BillForm>({
	validationSchema: validationSchema,
	initialValues: initialValues.value,
});
const toast = useToast();

const [typeField] = defineField('type');
const [amountField] = defineField('amount');
const [createdByField] = defineField('createdBy');
const [nameField, nameProps] = defineField('name');
const [noteField, noteProps] = defineField('note');

const getMemberAmount = () => {
	return group.value.members.reduce((acc, m) => {
		acc[m.id] = 0;
		return acc;
	}, {} as BillMember);
};
const getAllParticipantIds = () => group.value.members.map((m) => m.id);

const memberAmounts = ref<BillMember>(
	props.mode === 'new' ? getMemberAmount() : props.defaultBill?.members || {},
);
const participants = ref<Member['id'][]>(
	props.mode === 'new' ? getAllParticipantIds() : Object.keys(props.defaultBill?.members || {}),
);

const toggleParticipant = (memberId: Member['id']) => {
	if (participants.value.includes(memberId)) {
		participants.value = participants.value.filter((id) => id !== memberId);
	} else {
		participants.value.push(memberId);
	}
};

const toggleAllParticipants = () => {
	if (participants.value.length === group.value.members.length) {
		participants.value = [];
	} else {
		participants.value = getAllParticipantIds();
	}
};

provide<BillFormContextValue>(CONTEXT_KEY.BILL_FORM, {
	amount: amountField,
	memberAmounts,
	participants,
	toggleParticipant,
});

const tabs = Object.values(BillType).map(billTypeMapping);

const validateMemberAmounts = (): string | null => {
	if (!amountField.value) return 'Số tiền không hợp lệ';

	return match(typeField.value)
		.with(BillType.Equally, () => {
			if (participants.value.length === 0) return 'Chọn ít nhất 1 người tham gia';
			return null;
		})
		.otherwise(() => null);
};

const handleSubmitBill = handleSubmit(async (form) => {
	const { amount, type, createdBy, note } = form;
	const name = form.name?.trim() || defaultEventName;

	const memberAmountsError = validateMemberAmounts();
	if (memberAmountsError) {
		return toast.error(memberAmountsError);
	}

	const formData: Omit<Bill, 'id' | 'createdAt'> = {
		groupId: group.value.id,
		type,
		amount,
		createdBy,
		name,
		note,
		members: toRaw(memberAmounts.value),
	};

	// TEST
	console.log(`☕ DYNO DEBUG ~ BillForm.vue:81 🦫`, formData);

	emit('submit', formData);
}, veeValidateFocusOnError);
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleSubmitBill">
		<!-- General Info Form -->
		<Flex stack class="gap-4">
			<!-- Amount -->
			<FormControl
				label="Số tiền tổng hóa đơn"
				:error="Boolean(errors.amount)"
				class="[&_input]:w-full"
				:helper-text="errors.amount">
				<CurrencyInput
					:model-value="amountField"
					@change="(valStr) => setFieldValue('amount', Number(valStr))"
					:input-props="{ placeholder: 'Nhập số tiền (VND)', name: 'amount' }" />
			</FormControl>

			<!-- Created by -->
			<FormControl
				label="Người trả"
				:error="Boolean(errors.createdBy)"
				:helper-text="errors.createdBy">
				<MemberSelect
					placeholder="Chọn người trả"
					v-model:value="createdByField"
					:pt="{ input: { name: 'createdBy' } }" />
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
					rows="2"
					id="note"
					:maxlength="MAX.NOTE"
					v-model="noteField"
					v-bind="noteProps" />
			</FormControl>
		</Flex>

		<Typography variant="mdSemiBold" class="text-black">Chia tiền</Typography>

		<!-- Splitting -->
		<Flex stack class="gap-2">
			<!-- Bill type options -->
			<div role="tablist" class="tabs tabs-boxed">
				<Flex
					v-for="tab in tabs"
					:key="tab.type"
					center
					role="tab"
					class="tab tooltip tooltip-bottom"
					:data-tip="tab.label"
					:class="{ 'tab-active': tab.type === typeField }"
					@click="typeField = tab.type">
					<span class="icon size-5" :class="tab.icon"></span>
				</Flex>
			</div>

			<Typography
				role="alert"
				variant="smRegular"
				class="alert text-slate-500 text-left rounded-lg">
				{{ tabs.find((tab) => tab.type === typeField)?.helperText }}
			</Typography>

			<Flex stack class="gap-2">
				<Flex class="gap-2 px-2 cursor-pointer" @click="toggleAllParticipants">
					<input
						type="checkbox"
						class="checkbox checkbox-primary"
						:indeterminate="participants.length > 0 && participants.length < group.members.length"
						:checked="participants.length === group.members.length" />
					<Typography variant="mdSemiBold">
						Thành viên tham gia ({{ participants.length }})
					</Typography>
				</Flex>

				<Equally v-if="typeField === BillType.Equally" />
				<Exact v-else-if="typeField === BillType.Exact" />
			</Flex>
		</Flex>
	</Flex>
</template>
