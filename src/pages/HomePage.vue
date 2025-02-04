<script setup lang="ts">
import { supabase } from '@/apis/supabase'
import Flex from '@/components/Flex.vue'
import { Button } from 'primevue'
import { v4 as uuidv4 } from 'uuid'

const handleClick = async () => {
	const id = uuidv4()

	const { error, data } = await supabase
		.from('groups')
		.insert({ id, name: 'Group DL', members: ['Tuan'] })

	const view = await supabase.rpc('create_group_view', { group_id: id })
	const bill = await supabase.rpc('create_bill_view', { group_id: id })

	console.log(`☕ DYNO LOG ~ HomePage.vue:12 🥺`, id, data, error)
	console.log(`☕ DYNO LOG ~ HomePage.vue:18 🥺`, view, bill)
}

const handleClick2 = async () => {
	const { data, error } = await supabase.from('groups').select('*')

	console.log(`☕ DYNO LOG ~ HomePage.vue:7 🥺`, data, error)
}
</script>

<template>
	<Flex class="gap-2">
		<Button @click="handleClick" severity="danger">Insert</Button>
		<Button @click="handleClick2">Fetch</Button>
	</Flex>
</template>
