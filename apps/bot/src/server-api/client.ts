import { createApiClient } from '@gitcord/server-api';

import { ENV } from '../core/env';

export const apiClient = createApiClient(ENV.SERVER_API_URL);

