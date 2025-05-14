<script setup lang="ts"></script>

<template>
	<div class="flex items-center justify-center w-full">
		<label
			for="dropzone-file"
			class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
			<div class="flex flex-col items-center justify-center pt-5 pb-6">
				<span class="icon msi-cloud-upload w-8 h-8 mb-4 text-gray-500"></span>
				<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
					<span class="font-semibold">Bấm vào để tải lên</span>
					hoặc kéo và thả
				</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">xlsx, xls</p>
			</div>
			<input id="dropzone-file" type="file" class="hidden" />
		</label>
	</div>
</template>
