import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { LS_KEY, STORE_KEY } from '../constants/key'
import { safeJSONParse } from '../utils/helpers'

type JoinedGroup = {
	groupId: string
	userId: string
}

export const useLocalDBStore = defineStore(STORE_KEY.LOCAL_DB, () => {
	const joinedGroups = ref<JoinedGroup[]>(
		(safeJSONParse(localStorage.getItem(LS_KEY.JOINED_GROUP), []) || []) as JoinedGroup[],
	)

	const persistToLocalStorage = () => {
		localStorage.setItem(LS_KEY.JOINED_GROUP, JSON.stringify(joinedGroups.value))
	}

	watch([joinedGroups], persistToLocalStorage)

	const joinGroup = (groupId: string, userId: string) => {
		joinedGroups.value = [
			...joinedGroups.value.filter((group) => group.groupId !== groupId),
			{ groupId, userId },
		]
	}

	const removeFromGroup = (groupId: string) => {
		joinedGroups.value = joinedGroups.value.filter((group) => group.groupId !== groupId)
	}

	return { joinedGroups, joinGroup, removeFromGroup }
})
