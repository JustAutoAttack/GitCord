import { createApiClient } from '@gitcord/server-api';

import { ENV } from '@core';

export const apiClient = createApiClient(ENV.SERVER_API_URL);
