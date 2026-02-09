export const LS_KEY = {
	JOINED_GROUP: 'ezbill-joined-group',
	RECENT_GROUP_SORT_KEY: 'ezbill-recent-group-sort-key',
	LAST_OPENED_GROUPS: 'ezbill-last-opened-groups',
	PINNED_GROUPS: 'ezbill-pinned-groups',
	HIDDEN_GROUPS: 'ezbill-hidden-groups',
	SHOW_HIDDEN_GROUPS: 'ezbill-show-hidden-groups',
};

export const STORE_KEY = {
	LOCAL_DB: 'local-db',
	TOAST: 'toast',
};

export const CONTEXT_KEY = {
	GROUP: 'group',
	GROUP_USER: 'group-user',
	BILLS: 'bills',
	GROUP_STATS: 'group-stats',
	REALTIME_CLIENT: 'realtime-client',
	BILL_FORM: 'bill-form',
	// DEPRECATED: Remove this after migration
	/** @deprecated Use API_CLIENT instead */
	LEGACY_API_CLIENT: 'legacy-api-client',
	API_CLIENT: 'api-client',
};

export const QUERY_KEY = {
	CHECK_SESSION: 'check-session',
	GROUPS: 'groups',
	GROUP: 'group',
	BILL_LIST: 'bill-list',
	GROUP_STATS: 'group-stats',
	BILLS_BY_MEMBER: 'bills-by-member',
	INVITE_KEY: 'invite-key',
};

export const REALTIME_EVENT = {
	GROUP_UPDATED: 'group_updated',
	BILL_UPDATED: 'bill_updated',
};
