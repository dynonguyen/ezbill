// Fork of https://github.com/joserick/v-money-spinner

import { format, unformat } from 'v-money3';
import BigNumber from './big_number';
import VMoneySpinner from './money_spinner.vue';
import type { VMoneySpinnerOptions } from './options';

export default {
	install(app: { component: (arg0: string, arg1: any) => void }) {
		app.component('VMoneySpinner', VMoneySpinner);
	},
};

export type { VMoneySpinnerOptions };

export { BigNumber, format, unformat, VMoneySpinner };
