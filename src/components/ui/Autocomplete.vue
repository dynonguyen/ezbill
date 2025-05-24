<script setup lang="ts" generic="T extends Record<string, any>">
import { onKeyDown } from '@vueuse/core';
import {
	computed,
	nextTick,
	onMounted,
	ref,
	useTemplateRef,
	watch,
	type HTMLAttributes,
	type InputHTMLAttributes,
} from 'vue';
import Dialog from './Dialog.vue';
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
const inputWrap = useTemplateRef('inputWrap');
const focusIndex = ref<number>(0);

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
	displayedOptions.value = props.options;
};

const getRootPosition = () => {
	if (inputWrap.value && open.value) {
		const { top, left, width } = inputWrap.value.getBoundingClientRect();
		return { top: top + inputWrap.value.offsetHeight, left, width };
	}

	return { top: 0, left: 0, width: 0 };
};

const handleSelect = (opt: Option) => {
	if (input.value) input.value.value = opt[props.label] ?? '';

	value.value = opt.value;
	handleClose();

	emit('change', opt.value, opt);
};

const handleInputClick = () => {
	if (open.value) {
		open.value = false;
	} else {
		open.value = true;
		input.value?.focus?.();
	}
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

const handleFocusOnKeyPress = (isDown: boolean) => {
	return () => {
		if (!open.value || !displayedOptions.value.length) return;

		if (isDown) {
			if (++focusIndex.value >= displayedOptions.value.length) focusIndex.value = 0;
		} else {
			if (--focusIndex.value < 0) focusIndex.value = displayedOptions.value.length - 1;
		}

		nextTick(() => {
			document
				.querySelector('.menu a.focused')
				?.scrollIntoView({ behavior: 'instant', block: 'center' });
		});
	};
};

onMounted(resetInputValue);

onKeyDown('ArrowDown', handleFocusOnKeyPress(true));
onKeyDown('ArrowUp', handleFocusOnKeyPress(false));
onKeyDown('Enter', (e) => {
	if (!open.value || !displayedOptions.value.length) return;
	e.preventDefault();
	handleSelect(displayedOptions.value[focusIndex.value] as Option);
});

watch([value], resetInputValue, { immediate: true });
watch(
	() => displayedOptions.value.length,
	() => (focusIndex.value = 0),
);

const rootPosition = computed(getRootPosition);
</script>

<template>
	<div v-bind="pt?.root" ref="inputWrap">
		<div
			class="input input-bordered flex items-center gap-2"
			@click="handleInputClick"
			v-bind="pt?.inputWrap">
			<input
				ref="input"
				type="text"
				class="grow"
				:placeholder="placeholder"
				@input="handleSearch"
				@blur="resetInputValue"
				v-bind="pt?.input" />
			<span class="icon msi-arrow-drop-down" :class="{ 'rotate-180': open }"></span>
		</div>

		<Dialog
			v-model:open="open"
			without-backdrop
			hide-close-button
			:pt="{
				contentWrap: {
					style: {
						top: `${rootPosition.top + 6}px`,
						left: `${rootPosition.left}px`,
						width: `${rootPosition.width}px`,
						transform: 'none',
					},
				},
				body: { class: '!p-0' },
				content: { class: '!p-0 ' },
			}">
			<ul
				class="menu bg-base-100 rounded-box w-full max-h-72 overflow-auto p-2 shadow-lg gap-1 flex-nowrap">
				<template v-if="displayedOptions.length">
					<li
						v-for="(opt, index) in displayedOptions"
						:key="opt.value"
						@click="handleSelect(opt as Option)">
						<a
							class="w-full"
							:class="{ active: opt.value === value, focused: focusIndex === index }">
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
		</Dialog>
	</div>
</template>

<style>
.menu a.focused {
	@apply bg-base-content/10;
}
</style>
