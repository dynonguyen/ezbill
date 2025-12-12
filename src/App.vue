<script setup lang="ts">
import { provide } from 'vue';
import { type IApiClient, type ILegacyApiClient } from './apis/api-client';
import { ezbiuApiClient } from './apis/ezbiu-be';
import { supabaseApiClient } from './apis/supabase';
import Toastify from './components/Toastify.vue';
import { CONTEXT_KEY } from './constants/key';

provide<ILegacyApiClient>(CONTEXT_KEY.LEGACY_API_CLIENT, supabaseApiClient);
provide<IApiClient>(CONTEXT_KEY.API_CLIENT, ezbiuApiClient);
</script>

<template>
	<RouterView />
	<Toastify />
</template>
