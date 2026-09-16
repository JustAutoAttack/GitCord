import { createLogger } from '@gitcord/logger';
import { CONFIG } from '@core';

export const logger = createLogger('Webhook', {
    color: CONFIG.loggers.http,
    home: 'src/gateway/webhook'
});
