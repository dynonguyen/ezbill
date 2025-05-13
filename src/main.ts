import 'vue-select/dist/vue-select.css';
import './main.css';

import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import MoneySpinner from 'v-money-spinner';
import { createApp } from 'vue';
import App from './App.vue';
import router from './routes/router';

const app = createApp(App);

app.use(router);

app.use(VueQueryPlugin, {
	queryClient: new QueryClient({ defaultOptions: { queries: { retry: 0 } } }),
} as VueQueryPluginOptions);

app.use(createPinia());
// @ts-ignore
app.use(MoneySpinner);

app.mount('#app');
