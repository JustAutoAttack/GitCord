import { createLogger } from '@gitcord/logger';
import { CONFIG } from './config';

export const appLogger = createLogger('App', { color: CONFIG.loggers.app });
export const serverAPILogger = createLogger('Server API', {
	color: CONFIG.loggers.serverApi
});
export const discordLogger = createLogger('Discord', {
	color: CONFIG.loggers.discord
});
export const githubLogger = createLogger('GitHub', {
	color: CONFIG.loggers.github
});
export const httpLogger = createLogger('HTTP', { color: CONFIG.loggers.http });
