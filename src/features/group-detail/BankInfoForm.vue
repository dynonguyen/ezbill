<script setup lang="ts">
import Autocomplete, { type AutocompleteOption } from '@/components/ui/Autocomplete.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import { BANKS } from '@/constants/bank';
import type { MemberBankInfo } from '@/types/entities';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

const schema = z.object({
	bin: z.string().nonempty('Bắt buộc').default(''),
	accountNumber: z.string().nonempty('Bắt buộc').default(''),
});

const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, values, defineField, setFieldValue } = useForm<MemberBankInfo>({
	validationSchema,
});

const [bin, binProps] = defineField('bin');
const [accountNumber, accountNumberProps] = defineField('accountNumber');

const handleAddBankInfo = handleSubmit(async (form) => {
	console.log(form);
});

const bankOptions: AutocompleteOption[] = BANKS.map((bank) => ({
	value: bank.bin,
	label: bank.name,
}));
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddBankInfo">
		<FormControl
			label="Ngân hàng"
			:error="Boolean(errors.bin)"
			:helper-text="errors.bin"
			class="grow w-full">
			<Autocomplete :options="bankOptions" placeholder="Chọn ngân hàng" v-model:value="bin" />
		</FormControl>

		<FormControl
			label="Số tài khoản"
			:error="Boolean(errors.accountNumber)"
			:helper-text="errors.accountNumber"
			class="grow w-full">
			<input
				class="input input-bordered w-full"
				placeholder="Nhập số tài khoản"
				v-model="accountNumber"
				v-bind="accountNumberProps"
				v-focus
				:maxlength="128" />
		</FormControl>
	</Flex>
</template>
