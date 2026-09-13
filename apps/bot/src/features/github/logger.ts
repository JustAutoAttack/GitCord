import { createLogger } from '@gitcord/logger';
import { CONFIG } from '@core';

export const logger = createLogger('GitHub', {
    color: CONFIG.loggers.github
});
