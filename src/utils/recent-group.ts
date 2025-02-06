import { LS_KEY } from '../constants/key'
import type { Group } from '../types/entities'
import { safeJSONParse } from './helpers'

export const getRecentGroups = () => {
	return (safeJSONParse(localStorage.getItem(LS_KEY.RECENT_GROUP)) || []) as Array<Group['id']>
}

export const storeRecentGroup = (groupId: Group['id']) => {
	const recentGroups = getRecentGroups()
	const newRecentGroups = [groupId, ...recentGroups.filter((id) => id !== groupId)]

	localStorage.setItem(LS_KEY.RECENT_GROUP, JSON.stringify(newRecentGroups))
}
