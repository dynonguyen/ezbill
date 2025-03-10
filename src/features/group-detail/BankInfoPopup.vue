<script setup lang="ts">
import Autocomplete, { type AutocompleteOption } from '@/components/ui/Autocomplete.vue';
import Button from '@/components/ui/Button.vue';
import Dialog from '@/components/ui/Dialog.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import { BANKS } from '@/constants/bank';
import type { MemberBankInfo } from '@/types/entities';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { z } from 'zod';

const props = defineProps<{ initialValues?: MemberBankInfo | null }>();
const emit = defineEmits<{ submit: [form: MemberBankInfo] }>();

const schema = z.object({
	bin: z.string().nonempty('Bắt buộc').default(''),
	accountNumber: z.string().nonempty('Bắt buộc').default(''),
});

const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, defineField } = useForm<MemberBankInfo>({
	validationSchema,
	initialValues: props.initialValues,
});

const open = defineModel<boolean>('open');
const openBin = ref(false);

const [bin] = defineField('bin');
const [accountNumber, accountNumberProps] = defineField('accountNumber');

const handleAddBankInfo = handleSubmit(async (form) => {
	open.value = false;
	emit('submit', form);
});

const bankOptions: AutocompleteOption[] = BANKS.map((bank) => ({
	value: bank.bin,
	label: `${bank.shortname} - ${bank.name}`,
}));

watch(openBin, () => {
	const dialogBody = document.querySelector('#bank-form-root .dialog-body');
	if (dialogBody) {
		if (openBin.value) {
			dialogBody.classList.remove('overflow-auto');
			dialogBody.classList.add('overflow-visible');
		} else {
			dialogBody.classList.remove('overflow-visible');
			dialogBody.classList.add('overflow-auto');
		}
	}
});
</script>

<template>
	<Dialog v-model:open="open" header="Thông tin chuyển khoản" id="bank-form-root">
		<Flex stack class="gap-4">
			<Typography variant="smRegular" class="p-4 rounded-lg bg-blue-100 text-slate-500">
				Thông tin này dùng để tạo mã QR chuyển khoản thuận tiện trong việc thanh toán của cho thành
				viên khác.
			</Typography>

			<Flex stack class="gap-4" as="form" @submit="handleAddBankInfo">
				<FormControl
					label="Ngân hàng"
					:error="Boolean(errors.bin)"
					:helper-text="errors.bin"
					class="grow w-full">
					<Autocomplete
						:options="bankOptions"
						placeholder="Chọn ngân hàng"
						v-model:value="bin"
						v-model:open="openBin" />
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

				<Flex class="gap-2" items-fluid>
					<Button variant="soft" color="grey" @click="open = false">Đóng</Button>
					<Button type="submit">Lưu</Button>
				</Flex>
			</Flex>
		</Flex>
	</Dialog>
</template>
