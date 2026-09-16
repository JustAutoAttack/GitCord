import { createLogger } from '@gitcord/logger';
import { CONFIG } from '@core';

export const logger = createLogger('Discord', {
	color: CONFIG.loggers.discord,
	home: 'src/discord'
});
