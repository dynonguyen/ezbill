import type { Directive } from 'vue';

export const vFocus: Directive<HTMLInputElement> = {
	mounted(el, binding) {
		if (binding.value?.disabled) return;
		el?.focus();
	},
};
