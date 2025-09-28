<script setup lang="ts">
import MemberAvatar from '@/components/MemberAvatar.vue';
import Button from '@/components/ui/Button.vue';
import Flex from '@/components/ui/Flex.vue';
import FormControl from '@/components/ui/FormControl.vue';
import Typography from '@/components/ui/Typography.vue';
import { vFocus } from '@/directives/v-focus';
import type { MemberBankInfo } from '@/types/entities';
import { veeValidateFocusOnError } from '@/utils/helpers';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, ref, useId } from 'vue';
import { z } from 'zod';
import AvatarSelect from '../AvatarSelect.vue';
import BankInfoDetail from '../BankInfoDetail.vue';
import BankInfoPopup from '../BankInfoPopup.vue';
import { useGroupContext } from '../hooks/useGroupContext';

const emit = defineEmits<{ submit: [form: MemberFormData & { bankInfo?: MemberBankInfo }] }>();
const props = defineProps<{ initialValues?: MemberFormData & { bankInfo?: MemberBankInfo } }>();
const { group, isAccountantMode } = useGroupContext();

const nameInputId = useId();

const MAX = { NAME: 512 };

const schema = z.object({
	name: z.string().trim().nonempty('Bắt buộc').default(''),
	avatar: z.string().optional(),
	isAccounting: z.boolean().optional().default(false),
});
export type MemberFormData = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);

const { errors, handleSubmit, values, defineField, setFieldValue } = useForm<MemberFormData>({
	validationSchema,
	initialValues: props.initialValues,
});

const openAvatarSelect = ref(false);
const openTransferInfo = ref(false);
const bankInfo = ref<MemberBankInfo | null>(props.initialValues?.bankInfo || null);

const handleAddMember = handleSubmit(async (form) => {
	emit('submit', bankInfo.value ? { ...form, bankInfo: bankInfo.value } : form);
}, veeValidateFocusOnError);

const handleChangeAvatar = (avt: string) => {
	setFieldValue('avatar', avt);
	openAvatarSelect.value = false;
};

const currentAccounting = computed(() => group.value.members.find((m) => m.isAccounting));

const [name, nameProps] = defineField('name');
const [isAccounting, isAccountingProps] = defineField('isAccounting');
</script>

<template>
	<Flex stack class="gap-4" as="form" @submit="handleAddMember">
		<div class="size-20 relative mx-auto cursor-pointer" @click="openAvatarSelect = true">
			<MemberAvatar
				id="_"
				:name="values.name || 'Unknown'"
				:avatar="values.avatar"
				size="full"
				class="size-20 text-2xl" />

			<Flex center class="bg-white p-1 absolute bottom-0 right-0 rounded-full">
				<span class="icon msi-photo-camera-rounded size-4 text-black"></span>
			</Flex>
		</div>

		<FormControl :error="Boolean(errors.name)" :helper-text="errors.name" class="grow w-full">
			<input
				class="input input-bordered w-full"
				placeholder="Nhập tên thành viên"
				:id="nameInputId"
				v-model="name"
				v-bind="nameProps"
				name="name"
				v-focus="{ disabled: Boolean(initialValues) }"
				:maxlength="MAX.NAME" />
		</FormControl>

		<Flex v-if="isAccountantMode" class="gap-2 text-slate-500">
			<input
				type="checkbox"
				class="checkbox checkbox-sm"
				id="is-accounting"
				v-model="isAccounting"
				v-bind="isAccountingProps" />
			<Typography as="label" for="is-accounting" variant="smRegular">Kế toán của nhóm</Typography>
			<Flex
				center
				class="tooltip"
				:data-tip="
					'Người sẽ nhận/trả lại tiền cho các thành viên khác sau khi chuyến đi kết thúc. Chỉ có duy nhất một kế toán trong nhóm.' +
					(currentAccounting ? ` ${currentAccounting.name} đang là kế toán hiện tại của nhóm.` : '')
				">
				<span class="icon msi-info size-4"></span>
			</Flex>
		</Flex>

		<BankInfoDetail v-if="bankInfo" :bank-info="bankInfo">
			<template #action>
				<Flex class="gap-2">
					<span
						class="icon msi-edit cursor-pointer size-5 text-slate-500"
						@click="openTransferInfo = true"></span>
					<span
						class="icon msi-delete cursor-pointer size-5 text-red-500"
						@click="bankInfo = null"></span>
				</Flex>
			</template>
		</BankInfoDetail>
		<Button
			v-else
			type="button"
			size="sm"
			variant="soft"
			color="grey"
			start-icon="msi-account-balance-rounded"
			class="!bg-transparent border-dashed"
			@click="openTransferInfo = true">
			Thêm thông tin chuyển khoản
		</Button>

		<slot name="action-btn"></slot>
	</Flex>

	<AvatarSelect v-model:open="openAvatarSelect" @change="handleChangeAvatar" />

	<BankInfoPopup
		v-if="openTransferInfo"
		v-model:open="openTransferInfo"
		:initial-values="bankInfo"
		@submit="(form) => (bankInfo = form)" />
</template>
