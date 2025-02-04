import './main.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import PrimeVue, { type PrimeVueConfiguration } from 'primevue/config'
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
} as PrimeVueConfiguration)

app.use(router)
app.use(createPinia())
app.use(VueQueryPlugin)

app.mount('#app')
