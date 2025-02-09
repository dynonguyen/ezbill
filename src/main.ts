import './main.css'

import { QueryClient, VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import PrimeVue, { type PrimeVueConfiguration } from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/router'
import { NoirPreset } from './theme/preset'

const app = createApp(App)

app.use(PrimeVue, {
	theme: {
		preset: NoirPreset,
		options: {
			darkModeSelector: false || 'none',
		},
	},
	ripple: false,
} as PrimeVueConfiguration)

app.use(router)

app.use(VueQueryPlugin, {
	queryClient: new QueryClient({ defaultOptions: { queries: { retry: 0 } } }),
} as VueQueryPluginOptions)

app.use(ToastService)

app.use(createPinia())

app.directive('tooltip', Tooltip)

app.mount('#app')
