import { createApiClient } from '@gitcord/server-api';
import { ENV } from '@core';

export const apiClient = createApiClient(ENV.SERVER_API_URL);

apiClient.use({
	async onError({ error }) {
		return {
			data: undefined,
			error: { status: 503, message: 'Server offline' },
			response: new Response(null, { status: 503 })
		} as any;
	}
});
