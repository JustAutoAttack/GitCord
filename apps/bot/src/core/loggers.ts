import { createLogger } from '@gitcord/logger';
import { CONFIG } from './config';

export const appLogger = createLogger('App', { color: CONFIG.loggers.app });
export const httpLogger = createLogger('HTTP', { color: CONFIG.loggers.http });
