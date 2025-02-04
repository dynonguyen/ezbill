/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_BASE_URL: string
	VITE_SUPABASE_URL: string
	VITE_SUPABASE_KEY: string
}

export function getEnv<T extends keyof ImportMetaEnv>(key: T) {
	return (import.meta.env[key] || '') as ImportMetaEnv[T]
}
