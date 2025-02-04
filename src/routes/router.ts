import { PATH } from '@/constants/path'
import MainLayout from '@/layouts/MainLayout.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { APP_NAME } from '../constants/common'

// -----------------------------
const HomePage = () => import('@/pages/HomePage.vue')

// -----------------------------
const routes: Readonly<RouteRecordRaw[]> = [
	{
		path: '',
		component: MainLayout,
		children: [
			{ path: PATH.HOME, name: 'Home', component: HomePage },
			{ path: '', name: 'Home', component: HomePage },
			{ path: '/:p*', redirect: PATH.HOME },
		],
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to, _, next) => {
	document.title = to.name ? `${APP_NAME} | ${to.name as string}` : APP_NAME
	next()
})

export default router
