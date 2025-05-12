import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

export default defineConfigWithVueTs(
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,tsx,vue}'],
	},

	{
		name: 'app/files-to-ignore',
		ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
	},

	pluginVue.configs['flat/essential'],
	vueTsConfigs.recommended,
	skipFormatting,

	{
		name: 'app/typescript',
		files: ['**/*.ts', '**/*.js', '**/*.vue'],

		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/ban-types': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-empty-function': 'warn',
			'import/no-named-as-default-member': 'off',
			'import/no-named-as-default': 'off',

			'no-console': ['warn', { allow: ['error', 'warn'] }],

			camelcase: [
				'warn',
				{
					ignoreGlobals: true,
					ignoreImports: true,
					properties: 'never',
					ignoreDestructuring: true,
				},
			],
			'no-warning-comments': ['error', { terms: ['MOCK', 'BUG', 'FIXME'], location: 'start' }],
			'vue/multi-word-component-names': 'off',
		},
	},

	globalIgnores(['./docker/volumes/*']),
);
