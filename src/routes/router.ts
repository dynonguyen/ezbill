import { PATH } from '@/constants/path'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { APP_NAME } from '../constants/common'
import AppLayout from '../layouts/AppLayout.vue'

// -----------------------------
const HomePage = () => import('@/pages/HomePage.vue')
const GroupPage = () => import('@/pages/GroupPage.vue')

// -----------------------------
const routes: Readonly<RouteRecordRaw[]> = [
	{
		path: '',
		component: AppLayout,
		children: [
			{ path: PATH.HOME, name: 'Home', component: HomePage },
			{ path: PATH.GROUP, name: 'Group', component: GroupPage },
			{ path: '', name: 'Home', component: HomePage },
			{ path: '/:p*', redirect: PATH.HOME },
		],
	},
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.afterEach((to, _) => {
	document.title = to.name ? `${APP_NAME} | ${to.name as string}` : APP_NAME
})

export default router
