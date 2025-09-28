import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { LS_KEY, STORE_KEY } from '../constants/key';
import type { GroupId } from '../types/entities';
import { safeJSONParse } from '../utils/helpers';

type JoinedGroup = {
	groupId: GroupId;
};

export const useLocalDBStore = defineStore(STORE_KEY.LOCAL_DB, () => {
	const joinedGroups = ref<JoinedGroup[]>(
		(safeJSONParse(localStorage.getItem(LS_KEY.JOINED_GROUP), []) || []) as JoinedGroup[],
	);
	const lastOpenedGroups = ref(
		(safeJSONParse(localStorage.getItem(LS_KEY.LAST_OPENED_GROUPS), {}) || {}) as Record<
			GroupId,
			number
		>,
	);

	watch([joinedGroups], () => {
		localStorage.setItem(LS_KEY.JOINED_GROUP, JSON.stringify(joinedGroups.value));
	});
	watch([lastOpenedGroups], () => {
		localStorage.setItem(LS_KEY.LAST_OPENED_GROUPS, JSON.stringify(lastOpenedGroups.value));
	});

	const joinGroup = (groupId: GroupId) => {
		joinedGroups.value = [
			{ groupId },
			...joinedGroups.value.filter((group) => group.groupId !== groupId),
		];
	};

	const removeFromGroup = (groupId: GroupId) => {
		joinedGroups.value = joinedGroups.value.filter((group) => group.groupId !== groupId);
	};

	const removeFromGroups = (groupIds: GroupId[]) => {
		joinedGroups.value = joinedGroups.value.filter((group) => !groupIds.includes(group.groupId));
	};

	const updateLastOpenedGroup = (groupId: GroupId) => {
		if (!lastOpenedGroups.value) {
			lastOpenedGroups.value = { [groupId]: new Date().getTime() };
			return;
		}
		lastOpenedGroups.value[groupId] = new Date().getTime();
	};

	return {
		joinedGroups,
		lastOpenedGroups,
		joinGroup,
		removeFromGroup,
		removeFromGroups,
		updateLastOpenedGroup,
	};
});
