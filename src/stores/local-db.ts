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
	const pinnedGroups = ref<GroupId[]>(
		safeJSONParse(localStorage.getItem(LS_KEY.PINNED_GROUPS), []) || [],
	);
	const hiddenGroups = ref<GroupId[]>(
		safeJSONParse(localStorage.getItem(LS_KEY.HIDDEN_GROUPS), []) || [],
	);

	watch([joinedGroups], () => {
		localStorage.setItem(LS_KEY.JOINED_GROUP, JSON.stringify(joinedGroups.value));
	});
	watch([lastOpenedGroups], () => {
		localStorage.setItem(LS_KEY.LAST_OPENED_GROUPS, JSON.stringify(lastOpenedGroups.value));
	});
	watch([pinnedGroups], () => {
		localStorage.setItem(LS_KEY.PINNED_GROUPS, JSON.stringify(pinnedGroups.value));
	});
	watch([hiddenGroups], () => {
		localStorage.setItem(LS_KEY.HIDDEN_GROUPS, JSON.stringify(hiddenGroups.value));
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

	const pinRecentGroup = (groupId: GroupId) => {
		if (!pinnedGroups.value.includes(groupId)) {
			pinnedGroups.value = [...pinnedGroups.value, groupId];
		}
	};

	const unpinRecentGroup = (groupId: GroupId) => {
		pinnedGroups.value = pinnedGroups.value.filter((id) => id !== groupId);
	};

	const hideRecentGroup = (groupId: GroupId) => {
		if (!hiddenGroups.value.includes(groupId)) {
			hiddenGroups.value = [...hiddenGroups.value, groupId];
		}
	};

	const unhideRecentGroup = (groupId: GroupId) => {
		hiddenGroups.value = hiddenGroups.value.filter((id) => id !== groupId);
	};

	return {
		joinedGroups,
		lastOpenedGroups,
		pinnedGroups,
		hiddenGroups,
		joinGroup,
		removeFromGroup,
		removeFromGroups,
		updateLastOpenedGroup,
		pinRecentGroup,
		unpinRecentGroup,
		hideRecentGroup,
		unhideRecentGroup,
	};
});
