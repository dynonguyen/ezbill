import materialSymbolIcons from '@iconify-json/material-symbols/icons.json'
import { addIconSelectors } from '@iconify/tailwind'
import plugin from 'tailwindcss/plugin'

const iconifyPlugin = addIconSelectors({
	prefixes: [{ prefix: 'msi', source: materialSymbolIcons }],
	maskSelector: '.icon',
	iconSelector: '.{prefix}-{name}',
})

const utilitiesPlugin = plugin(function ({ addUtilities }) {
	addUtilities({
		'.flex-v-center': { display: 'flex', alignItems: 'center' },
		'.flex-center': { display: 'flex', alignItems: 'center', justifyContent: 'center' },
	})
})

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,ts}'],

	plugins: [iconifyPlugin, utilitiesPlugin],

	theme: {
		screens: {
			sm: '576px',
			md: '768px',
			lg: '992px',
			xl: '1200px',
			'2xl': '1920px',
		},
	},
}
