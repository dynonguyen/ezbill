<script setup lang="ts" generic="T extends Record<string, any>">
import { vOutsideClick } from '@/directives/v-outside-click';
import { onMounted, ref, useId, type HTMLAttributes, type InputHTMLAttributes } from 'vue';
import Typography from './Typography.vue';

export type AutocompleteOption<T = unknown> = T & { value: string | number };

type Option = AutocompleteOption<T>;

type AutocompleteProps = {
	options: Option[];
	label?: string;
	placeholder?: string;
	pt?: {
		root?: HTMLAttributes;
		inputWrap?: HTMLAttributes;
		input?: InputHTMLAttributes;
		menu?: HTMLAttributes;
	};
};

const props = withDefaults(defineProps<AutocompleteProps>(), { options: () => [], label: 'label' });
const emit = defineEmits<{ change: [value: string | number, option: Option] }>();

const open = defineModel<boolean>('open');
const value = defineModel<string | number>('value');
const input = ref<HTMLInputElement | null>(null);
const displayedOptions = ref<Option[]>(props.options);

const outsideClickId = useId();

const findOption = (value?: string | number) => props.options.find((opt) => opt.value === value);

const resetInputValue = () => {
	if (value.value && input.value) {
		const opt = findOption(value.value);
		input.value.value = opt?.[props.label] ?? '';
	}
};

const handleSelect = (opt: Option) => {
	if (input.value) input.value.value = opt[props.label] ?? '';

	value.value = opt.value;
	handleClose();

	emit('change', opt.value, opt);
};

const handleClose = () => {
	open.value = false;
	displayedOptions.value = props.options;
};

const handleSearch = (e: Event) => {
	const keyword = (e.target as HTMLInputElement).value?.trim().toLowerCase();
	if (!keyword) {
		displayedOptions.value = props.options;
		return;
	}

	displayedOptions.value = props.options.filter((opt) =>
		`${opt[props.label]}`?.toLowerCase()?.includes(keyword),
	);
};

onMounted(resetInputValue);
</script>

<template>
	<div class="relative" v-bind="pt?.root">
		<div
			class="input input-bordered flex items-center gap-2"
			:id="outsideClickId"
			@click="open = true"
			v-bind="pt?.inputWrap">
			<input
				ref="input"
				type="text"
				class="grow"
				:placeholder="placeholder"
				@input="handleSearch"
				@blur="resetInputValue"
				v-bind="pt?.input" />
			<span
				class="icon msi-arrow-drop-down"
				:class="{ 'rotate-180': open }"
				@click.stop="open = !open"></span>
		</div>

		<Teleport to="body">
			<ul
				v-if="open"
				class="fixed top-0 menu mt-1 bg-base-100 rounded-box z-20 w-full max-h-64 overflow-auto p-2 shadow-lg gap-1 flex-nowrap"
				v-outside-click:[outsideClickId]="{ enabled: open, trigger: handleClose }"
				v-bind="pt?.menu">
				<template v-if="displayedOptions.length">
					<li v-for="opt in displayedOptions" :key="opt.value" @click="handleSelect(opt as Option)">
						<a class="w-full" :class="{ active: opt.value === value }">
							<slot
								v-if="$slots.option"
								name="option"
								:key="opt.value"
								:option="opt"
								:selected="opt.value === value"></slot>
							<template v-else>{{ opt[label] }}</template>
						</a>
					</li>
				</template>
				<Typography v-else class="p-2 text-slate-400" variant="smRegular">
					Không có lựa chọn
				</Typography>
			</ul>
		</Teleport>
	</div>
</template>
