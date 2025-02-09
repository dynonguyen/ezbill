import 'dotenv/config'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, PluginOption } from 'vite'
import { ViteEjsPlugin } from 'vite-plugin-ejs'
import vueDevTools from 'vite-plugin-vue-devtools'

const BASE_URL = process.env.VITE_BASE_URL || ''

const injectData = {
	baseUrl: BASE_URL,
	appName: 'Ezbill',
	favicon: BASE_URL + '/img/logo.png',
}

const plugins: PluginOption[] = [vue(), ViteEjsPlugin(injectData), tailwindcss()]

if (process.env.ENABLE_VUE_DEVTOOL === 'true') {
	plugins.push(vueDevTools())
}

export default defineConfig({
	plugins,
	envPrefix: 'VITE_',
	base: BASE_URL,
	resolve: {
		alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
	},
	server: { open: true, port: 8888, host: '0.0.0.0' },
})
