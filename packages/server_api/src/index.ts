import createClient from 'openapi-fetch';

import { ENV } from './env';
import type { paths } from './schema';

export function createApiClient(
	baseUrl: string = ENV.SERVER_DOCS_URL.replace(/\/doc$/, ''),
	init?: RequestInit
) {
	return createClient<paths>({
		baseUrl,
		headers: init?.headers
	});
}

export type { paths } from './schema';
export type ApiClient = ReturnType<typeof createApiClient>;
