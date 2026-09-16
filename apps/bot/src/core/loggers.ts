import { createLogger } from '@gitcord/logger';
import { CONFIG } from './config';

export const appLogger = createLogger('App', {
	color: CONFIG.loggers.app,
	home: 'src'
});
