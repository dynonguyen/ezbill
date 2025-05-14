<script setup lang="ts" generic="T extends Record<string, any>">
import { onClickOutside } from '@vueuse/core';
import {
	computed,
	onMounted,
	ref,
	useTemplateRef,
	type HTMLAttributes,
	type InputHTMLAttributes,
} from 'vue';
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
const value = defineModel<string | number | null>('value');
const input = ref<HTMLInputElement | null>(null);
const displayedOptions = ref<Option[]>(props.options);
const outsideClickTarget = useTemplateRef('menu-target');
const inputWrap = useTemplateRef('inputWrap');

const findOption = (value?: string | number) => props.options.find((opt) => opt.value === value);

const resetInputValue = () => {
	if (input.value) {
		if (value.value) {
			const opt = findOption(value.value);
			input.value.value = opt?.[props.label] ?? '';
		} else {
			input.value.value = '';
		}
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

onClickOutside(outsideClickTarget, handleClose);

const getRootPosition = () => {
	if (inputWrap.value && open.value) {
		const { top, left, width } = inputWrap.value.getBoundingClientRect();
		return { top: top + window.scrollY + inputWrap.value.offsetHeight, left, width };
	}
	return {};
};

const rootPosition = computed(() => {
	return getRootPosition();
});
</script>

<template>
	<div v-bind="pt?.root" ref="inputWrap">
		<div
			class="input input-bordered flex items-center gap-2"
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

		<Teleport v-if="open" to="body">
			<ul
				class="fixed menu mt-1 bg-base-100 rounded-box z-[9999] w-full max-h-64 overflow-auto p-2 shadow-lg gap-1 flex-nowrap"
				ref="menu-target"
				v-bind="pt?.menu"
				:style="{
					top: `${rootPosition.top}px`,
					left: `${rootPosition.left}px`,
					width: `${rootPosition.width}px`,
				}">
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
