<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
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
import { match, P } from 'ts-pattern';
import { useForm } from 'vee-validate';
import { computed, provide, ref, watch } from 'vue';
import { z } from 'zod';
import {
	billTypeMapping,
	getTotalMemberAmount,
	omitZeroMemberAmounts,
	splitEqually,
	splitExactly,
} from '../helpers/utils';
import { useGroupContext } from '../hooks/useGroupContext';
import MemberSelect from '../MemberSelect.vue';
import Equally from './splitting-form/Equally.vue';
import Exact from './splitting-form/Exact.vue';
import Percentage from './splitting-form/Percentage.vue';
import Share from './splitting-form/Share.vue';
import { type BillFormContextValue } from './splitting-form/useBillFormContext';

type BillFormProps = { mode: 'new' | 'view-detail'; defaultBill?: Bill };
type BillForm = Pick<Bill, 'type' | 'amount' | 'createdBy' | 'name' | 'note'>;

const MAX = { AMOUNT: 100_000_000_000, NOTE: 1000, NAME: 250 };
const defaultEventName = `Sự kiện ${dayjs().format('DD/MM/YYYY HH:mm:ss')}`;
const defaultBillType = BillType.Percentage; // MOCK

const schema = z.object({
	type: z.nativeEnum(BillType).default(defaultBillType),
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
	if (props.mode === 'new' || !props.defaultBill) return { type: defaultBillType, createdBy: '' };

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

const getDefaultMemberAmount = () => {
	return splitEqually(
		0,
		group.value.members.map((m) => m.id),
	);
};
const getAllParticipantIds = () => group.value.members.map((m) => m.id);

const memberAmounts = ref<BillMember>(
	props.mode === 'new' ? getDefaultMemberAmount() : props.defaultBill?.members || {},
);
const participants = ref<Member['id'][]>(
	props.mode === 'new' ? getAllParticipantIds() : Object.keys(props.defaultBill?.members || {}),
);
const fixAmountField = ref<{ show: boolean; amount: number }>({ show: false, amount: 0 });

// For exact bill type, to ensure that the total amount matches the sum of member amounts
watch(
	[() => getTotalMemberAmount(memberAmounts.value), amountField, typeField],
	([totalMemberAmount, total]) => {
		if (typeField.value === BillType.Exact && totalMemberAmount && validateMemberAmounts()) {
			fixAmountField.value =
				totalMemberAmount !== total
					? { show: true, amount: totalMemberAmount }
					: { show: false, amount: 0 };

			return;
		}

		if (fixAmountField.value.show) {
			fixAmountField.value = { show: false, amount: 0 };
		}
	},
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

const tabs = Object.values(BillType).map(billTypeMapping);

const validateMemberAmounts = (): string | null => {
	if (!amountField.value) return 'Vui lòng nhập số tiền tổng ';
	if (participants.value.length === 0) return 'Chọn ít nhất 1 người tham gia';

	return match(typeField.value)
		.with(P.union(BillType.Equally, BillType.Percentage), () => null)
		.with(BillType.Exact, () => {
			const total = getTotalMemberAmount(memberAmounts.value);
			const remainingMembers = participants.value.filter((id) => !memberAmounts.value[id]).length;

			if (total > amountField.value || (total < amountField.value && remainingMembers === 0)) {
				return `Tổng số tiền các thành viên <b>${toVND(total)}</b> không khớp với số tiền tổng đã nhập <b>${toVND(amountField.value)}</b>`;
			}

			return null;
		})
		.with(BillType.Share, () => null) // TODO: implement share
		.exhaustive();
};

const handleTypeChange = (type: BillType) => {
	typeField.value = type;

	match(type)
		.with(BillType.Equally, () => {
			memberAmounts.value = splitEqually(amountField.value, participants.value);
		})
		.with(BillType.Exact, () => {
			memberAmounts.value = getDefaultMemberAmount();
		})
		.with(BillType.Percentage, () => {
			memberAmounts.value = getDefaultMemberAmount();
		})
		.with(BillType.Share, () => {
			//TODO: implement share
			return;
		})
		.exhaustive();
};

const handleSubmitBill = handleSubmit(async (form) => {
	const { amount, type, createdBy, note } = form;
	const name = form.name?.trim() || defaultEventName;

	const memberAmountsError = validateMemberAmounts();
	if (memberAmountsError) {
		return toast.error(memberAmountsError, { htmlMsg: true });
	}

	const members: BillMember = match(type)
		.returnType<BillMember>()
		.with(BillType.Equally, () => splitEqually(amount, participants.value))
		.with(BillType.Exact, () => splitExactly(amount, memberAmounts.value))
		.with(BillType.Percentage, () => memberAmounts.value)
		.with(BillType.Share, () => ({})) // TODO: implement share
		.exhaustive();

	const formData: Omit<Bill, 'id' | 'createdAt'> = {
		groupId: group.value.id,
		type,
		amount,
		createdBy,
		name,
		note,
		members: omitZeroMemberAmounts(members),
	};

	emit('submit', formData);
}, veeValidateFocusOnError);

provide<BillFormContextValue>(CONTEXT_KEY.BILL_FORM, {
	amount: amountField,
	memberAmounts,
	participants,
	toggleParticipant,
});
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleSubmitBill">
		<!-- General Info Form -->
		<Flex stack class="gap-4">
			<!-- Amount -->
			<FormControl
				label="Số tiền tổng hóa đơn"
				:error="Boolean(errors.amount || fixAmountField.show)"
				class="[&_input]:w-full"
				:helper-text="errors.amount">
				<CurrencyInput
					@change="(valStr) => setFieldValue('amount', Number(valStr))"
					:input-props="{ placeholder: 'Nhập số tiền (VND)', name: 'amount' }"
					:model-value="amountField" />

				<Flex v-if="fixAmountField.show" class="gap-1 items-start" stack>
					<Typography variant="smRegular" class="text-error">
						{{ `Tổng số tiền các thành viên không khớp ${toVND(fixAmountField.amount)}` }}
					</Typography>
					<Button
						variant="soft"
						size="sm"
						color="grey"
						@click="setFieldValue('amount', fixAmountField.amount)">
						Tự động cập nhật
					</Button>
				</Flex>
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
					@click="handleTypeChange(tab.type)">
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
				<Flex class="gap-2 px-2">
					<input
						id="all-participants"
						type="checkbox"
						class="checkbox checkbox-primary"
						:indeterminate="participants.length > 0 && participants.length < group.members.length"
						:checked="participants.length === group.members.length"
						@click="toggleAllParticipants" />
					<Typography variant="mdSemiBold" as="label" class="cursor-pointer" for="all-participants">
						Thành viên tham gia ({{ participants.length }})
					</Typography>
				</Flex>

				<Equally v-if="typeField === BillType.Equally" />
				<Exact v-else-if="typeField === BillType.Exact" />
				<Percentage v-else-if="typeField === BillType.Percentage" />
				<Share v-else-if="typeField === BillType.Share" />
				<Typography v-else class="text-center text-slate-400 my-4">
					Feature is coming soon
				</Typography>
			</Flex>
		</Flex>
	</Flex>
</template>
