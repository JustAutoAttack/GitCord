export { Logger } from './logger';

export { LogLevel, parseLogLevel, isLogLevelName } from './levels';

export type {
	ILogger,
	LoggerConfig,
	LoggerColorsConfig,
	LoggerOptions,
	TimestampFormat
} from './types';

export { DEFAULT_LOGGER_CONFIG } from './config/defaults';

export { loadLoggerConfig, resetLoggerConfig } from './config/loader';

import { Logger } from './logger';

import type { ILogger, LoggerOptions } from './types';

/**
 * Creates a logger scoped to a specific module or subsystem.
 */
export function createLogger(name: string, options?: LoggerOptions): ILogger {
	return new Logger(name, options);
}
