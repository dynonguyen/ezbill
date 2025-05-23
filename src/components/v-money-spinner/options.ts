import { Money, type VMoneyOptions } from 'v-money3';

export interface VMoneySpinnerOptions extends VMoneyOptions {
	modelValue: string | number;
	template: string | boolean;
	spinner: boolean;
	spinnerAlign: string;
	step: number;
	align: string;
	label: string;
	labelClass: string;
	wrapperClass: string;
	wrapperGroupClass: string;
	buttonGroupClass: string;
	prependClass: string;
	appendClass: string;
	inputClass: string;
}

const defaultsMoney3 = Object.fromEntries(
	Object.entries(Money.props as VMoneyOptions).map(([k, v]) => [
		k,
		typeof v.default === 'function' ? v.default() : v.default,
	]),
) as VMoneyOptions;

const defaultOptions: VMoneySpinnerOptions = {
	...defaultsMoney3,
	modelValue: 0,
	template: 'bootstrap',
	spinner: true,
	spinnerAlign: 'normal',
	step: 1,
	align: 'center',
	label: '',
	labelClass: '',
	wrapperClass: '',
	wrapperGroupClass: '',
	buttonGroupClass: '',
	prependClass: '',
	appendClass: '',
	inputClass: '',
};

export default defaultOptions;
