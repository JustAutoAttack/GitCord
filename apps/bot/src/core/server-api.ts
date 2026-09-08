import { createApiClient } from '@gitcord/server-api';

import { ENV } from './env';

export const apiClient = createApiClient(ENV.SERVER_API_URL);

export async function checkServerHealth(): Promise<void> {
	const response = await apiClient.GET('/health');

	if (response.error) {
		throw new Error('GitCord server health check failed.');
	}

	if (!response.data) {
		throw new Error('GitCord server returned an invalid health response.');
	}

	if (response.data.status !== 'HEALTHY') {
		throw new Error(`GitCord server is unhealthy: ${response.data.status}`);
	}
}
