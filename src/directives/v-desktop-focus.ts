import type { Directive } from 'vue';

let isMobileCached: boolean | null = null;

const isSmallScreen = () => {
	if (isMobileCached === null)
		isMobileCached =
			'ontouchstart' in window ||
			navigator.maxTouchPoints > 0 ||
			/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
			window.matchMedia('(max-width: 768px)').matches;

	return isMobileCached;
};

export const vDesktopFocus: Directive<HTMLInputElement> = {
	mounted(el, binding) {
		if (binding.value?.disabled || isSmallScreen()) return;
		el?.focus();
	},
};
