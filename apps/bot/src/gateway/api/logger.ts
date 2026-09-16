import { createLogger } from '@gitcord/logger';
import { CONFIG } from '@core';

export const logger = createLogger('API', {
    color: CONFIG.loggers.http,
    home: 'src/gateway/api'
});
