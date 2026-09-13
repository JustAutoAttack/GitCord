import { createLogger } from '@gitcord/logger';

import { CONFIG } from '@core';

export const logger = createLogger('Server', {
	color: CONFIG.loggers.serverApi
});
