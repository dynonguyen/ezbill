<script setup lang="ts">
import Flex from '@/components/Flex.vue'
import FormControl from '@/components/FormControl.vue'
import Loading from '@/components/Loading.vue'
import { PATH } from '@/constants/path'
import type { Group } from '@/types/entities'
import { getEnv } from '@/utils/get-env'
import { Button, Divider, InputText } from 'primevue'
import QRCode from 'qrcode'
import { computed, onWatcherCleanup, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ id: Group['id'] }>()
const emit = defineEmits<{ close: [] }>()

const inviteLink = computed(
	() => `${getEnv('VITE_BASE_URL')}${PATH.GROUP.replace(':id', props.id)}`,
)
const qrBase64 = ref('')
const copied = ref(false)
const router = useRouter()

const copyToClipboard = () => {
	navigator.clipboard.writeText(inviteLink.value)
	copied.value = true
}

const viewGroup = () => {
	router.push({ path: PATH.GROUP.replace(':id', props.id) })
	emit('close')
}

watch(
	inviteLink,
	async () => {
		navigator.clipboard.writeText(inviteLink.value)
		qrBase64.value = await QRCode.toDataURL(inviteLink.value)
	},
	{ immediate: true },
)

watch(copied, () => {
	if (copied.value) {
		const timeout = setTimeout(() => {
			copied.value = false
		}, 6000)

		onWatcherCleanup(() => {
			timeout && clearTimeout(timeout)
		})
	}
})
</script>

<template>
	<Flex class="gap-2 items-end">
		<FormControl class="grow" label="Invite link">
			<InputText :value="inviteLink" readonly fluid />
		</FormControl>
		<Button
			:icon="copied ? 'icon msi-check-rounded' : 'icon msi-content-copy-outline'"
			:label="copied ? 'Copied' : 'Copy'"
			:severity="copied ? 'success' : 'primary'"
			variant="outlined"
			@click="copyToClipboard" />
	</Flex>

	<Divider align="center">
		<strong>OR share QR code</strong>
	</Divider>

	<Flex stack center>
		<img v-if="qrBase64" :src="qrBase64" class="size-44 mx-auto" />
		<Loading v-else />
	</Flex>

	<Flex class="justify-end gap-2 mt-4">
		<Button variant="outlined" label="Close" @click="$emit('close')" />
		<Button label="View group" icon="icon msi-open-in-new" icon-pos="right" @click="viewGroup" />
	</Flex>
</template>
