import { onMounted, onUnmounted } from 'vue'

type UseAppLayoutOptions = {
	overflow?: boolean
}

export const useAppLayout = (options: UseAppLayoutOptions) => {
	const { overflow } = options

	onMounted(() => {
		const layout = document.getElementById('app-layout')

		if (layout) {
			if (overflow) {
				layout.classList.remove('overflow-hidden')
				layout.classList.add('overflow-auto')
			}
		}
	})

	onUnmounted(() => {
		const layout = document.getElementById('app-layout')

		if (layout) {
			if (overflow) {
				layout.classList.add('overflow-hidden')
				layout.classList.remove('overflow-auto')
			}
		}
	})
}
