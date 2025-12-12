import { inject } from 'vue';
import type { IApiClient, ILegacyApiClient } from '../apis/api-client';
import { CONTEXT_KEY } from '../constants/key';

// DEPRECATED: Remove this after migration
/** @deprecated Use useApiClient instead */
export const useLegacyApiClient = () => {
	return inject<ILegacyApiClient>(CONTEXT_KEY.LEGACY_API_CLIENT, {} as ILegacyApiClient);
};

export const useApiClient = () => {
	return inject<IApiClient>(CONTEXT_KEY.API_CLIENT, {} as IApiClient);
};
