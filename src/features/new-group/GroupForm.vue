<script setup lang="ts">
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import { vFocus } from '@/directives/v-focus';
import { PaymentTrackingMode } from '@/types/entities';
import { veeValidateFocusOnError } from '@/utils/helpers';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { onMounted } from 'vue';
import { z } from 'zod';
import PaymentTrackingModeSelect from './PaymentTrackingModeSelect.vue';

const emit = defineEmits<{ submit: [form: GroupForm] }>();
const props = defineProps<{ initialValues?: GroupForm }>();

const MAX = {
	NAME: 512,
};
const schema = z.object({
	name: z.string().trim().nonempty('Bắt buộc').default(''),
	paymentTrackingMode: z.nativeEnum(PaymentTrackingMode).default(PaymentTrackingMode.Accountant),
});

type GroupForm = z.infer<typeof schema>;

const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, defineField, setFieldValue } = useForm<GroupForm>({
	validationSchema,
	initialValues: props.initialValues,
});

export type GroupFormModel = {
	setFieldValue: typeof setFieldValue;
};
const model = defineModel<GroupFormModel>();

const handleAddGroup = handleSubmit(async (form) => {
	emit('submit', form);
}, veeValidateFocusOnError);

onMounted(() => {
	model.value = { setFieldValue };
});

const [name, nameProps] = defineField('name');
const [paymentTrackingMode, _] = defineField('paymentTrackingMode');
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddGroup">
		<FormControl
			label="Tên nhóm"
			html-for="name"
			:error="Boolean(errors.name)"
			:helper-text="errors.name">
			<input
				type="text"
				class="input input-bordered w-full"
				id="name"
				name="name"
				placeholder="Nhập tên nhóm"
				v-model="name"
				v-bind="nameProps"
				v-focus
				:maxlength="MAX.NAME"
				autocomplete="off" />
		</FormControl>

		<PaymentTrackingModeSelect v-model="paymentTrackingMode" />

		<slot></slot>

		<slot name="form-action"></slot>
	</Flex>
</template>
