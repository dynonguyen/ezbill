/// <reference types="vite/client" />

interface ImportMetaEnv {
	VITE_BASE_URL: string
}

export function getEnv<T extends keyof ImportMetaEnv>(key: T) {
	return (import.meta.env[key] || '') as ImportMetaEnv[T]
}
