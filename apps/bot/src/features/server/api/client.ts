import { createApiClient } from '@gitcord/server-api';

import { AppError, ErrorCode, ENV } from '@core';
import { logger } from '../logger';

let apiClientInstance: ReturnType<typeof createApiClient>;

try {
	apiClientInstance = createApiClient(ENV.SERVER_API_URL);

	apiClientInstance.use({
		async onError({ error }) {
			logger.error('Server API error caught in interceptor:', error);
			return {
				data: undefined,
				error: { status: 503, message: 'Server offline' },
				response: new Response(null, { status: 503 })
			} as any;
		}
	});
} catch (error) {
	logger.error('Failed to initialize server API client:', error);
	throw new AppError(
		ErrorCode.SERVER_API_ERROR,
		'Failed to initialize server API client'
	);
}

export const apiClient = apiClientInstance;
