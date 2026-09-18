import { createApiClient } from '@gitcord/server-api';
import { ENV, AppError, ErrorCode } from '@lib';
import { logger } from './logger';

let apiClientInstance: ReturnType<typeof createApiClient>;

try {
	apiClientInstance = createApiClient(ENV.VITE_SERVER_URL);

	// Automatically attach Bearer token from localStorage to all outgoing requests
	apiClientInstance.use({
		onRequest({ request }) {
			const token = localStorage.getItem('accessToken');
			if (token) {
				request.headers.set('Authorization', `Bearer ${token}`);
			}
			return request;
		},
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
	throw new AppError(
		ErrorCode.SERVER_API_ERROR,
		'Failed to initialize server API client'
	);
}

export const apiClient = apiClientInstance;
