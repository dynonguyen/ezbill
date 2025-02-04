import { getEnv } from './get-env'

const ASSET_URL = getEnv('VITE_BASE_URL')

export function getAssetUrl(path: string): string {
	return `${ASSET_URL}/${path}`
}

export function getImgUrl(path: string): string {
	return `${ASSET_URL}/img/${path}`
}
