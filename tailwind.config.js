import materialSymbolIcons from '@iconify-json/material-symbols/icons.json';
import { addIconSelectors } from '@iconify/tailwind';
import daisyui from 'daisyui';
import themes from 'daisyui/src/theming/themes';
import plugin from 'tailwindcss/plugin';
import customIcons from './tailwind-custom-icons.json';

const iconifyPlugin = addIconSelectors({
	prefixes: [
		{ prefix: 'msi', source: materialSymbolIcons },
		{ prefix: 'other', source: customIcons },
	],
	maskSelector: '.icon',
	iconSelector: '.{prefix}-{name}',
});

const utilitiesPlugin = plugin(function ({ addUtilities }) {
	addUtilities({
		'.flex-v-center': { display: 'flex', alignItems: 'center' },
		'.flex-center': { display: 'flex', alignItems: 'center', justifyContent: 'center' },
	});
});

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,ts}'],

	plugins: [daisyui, iconifyPlugin, utilitiesPlugin],

	daisyui: {
		themes: [
			{
				light: {
					...themes.light,
					primary: '#4338CA',
					'primary-content': '#C7D2FE',
					'base-100': '#F3F4F6',
					'base-300': '#D1D5DB',
					'base-content': '#1F2937',
				},
			},
		],
	},
};
