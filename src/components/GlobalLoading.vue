<script setup lang="ts">
import Flex from './Flex.vue'
const duration = '0.8'
</script>

<template>
	<Flex class="size-full" center>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="size-20">
			<circle class="fill-primary stroke-primary" strokeWidth="15" r="15" cx="40" cy="65">
				<animate
					attributeName="cy"
					calcMode="spline"
					:dur="duration"
					values="65;135;65;"
					keySplines=".5 0 .5 1;.5 0 .5 1"
					repeatCount="indefinite"
					begin="-.4"
				></animate>
			</circle>
			<circle class="fill-primary stroke-primary" strokeWidth="15" r="15" cx="100" cy="65">
				<animate
					attributeName="cy"
					calcMode="spline"
					:dur="duration"
					values="65;135;65;"
					keySplines=".5 0 .5 1;.5 0 .5 1"
					repeatCount="indefinite"
					begin="-.2"
				></animate>
			</circle>
			<circle class="fill-primary stroke-primary" strokeWidth="15" r="15" cx="160" cy="65">
				<animate
					attributeName="cy"
					calcMode="spline"
					:dur="duration"
					values="65;135;65;"
					keySplines=".5 0 .5 1;.5 0 .5 1"
					repeatCount="indefinite"
					begin="0"
				></animate>
			</circle>
		</svg>
	</Flex>
</template>
