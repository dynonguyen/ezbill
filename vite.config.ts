import 'dotenv/config';

import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from 'tailwindcss';
import { defineConfig, PluginOption } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import vueDevTools from 'vite-plugin-vue-devtools';

const HOST = process.env.HOST ? process.env.HOST : '0.0.0.0';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8888;
const BASE_URL = process.env.VITE_BASE_URL || '';

const injectData = {
	baseUrl: BASE_URL,
	appName: 'Ezbiu',
	releaseDate: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
};

const plugins: PluginOption[] = [vue(), ViteEjsPlugin(injectData)];

if (process.env.ENABLE_VUE_DEVTOOL === 'true') {
	plugins.push(vueDevTools());
}

export default defineConfig({
	plugins,
	envPrefix: 'VITE_',
	base: BASE_URL,
	resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
	build: { chunkSizeWarningLimit: 1024 },
	server: { open: true, port: PORT, host: HOST },
	css: { postcss: { plugins: [tailwindcss() as any] } },
});
