import { CONFIG } from './config';

export enum LogLevel {
	TRACE = 0,
	DEBUG = 1,
	INFO = 2,
	WARN = 3,
	ERROR = 4
}

function parseLogLevel(level: string): LogLevel {
	switch (level?.toUpperCase()) {
		case 'TRACE':
			return LogLevel.TRACE;

		case 'DEBUG':
			return LogLevel.DEBUG;

		case 'INFO':
			return LogLevel.INFO;

		case 'WARN':
			return LogLevel.WARN;

		case 'ERROR':
			return LogLevel.ERROR;

		default:
			return LogLevel.INFO;
	}
}

const currentLevel = parseLogLevel(CONFIG.logger.level);

function timestamp(): string {
	switch (CONFIG.logger.timestampFormat.toUpperCase()) {
		case 'ISO':
			return new Date().toISOString();

		case 'LOCALE':
			return new Date().toLocaleString();

		case 'UNIX':
			return Math.floor(Date.now() / 1000).toString();

		default:
			return new Date().toISOString();
	}
}

export const logger = {
	trace(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.TRACE) {
			console.trace(`[TRACE] [${timestamp()}]`, message, ...args);
		}
	},

	debug(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.DEBUG) {
			console.debug(`[DEBUG] [${timestamp()}]`, message, ...args);
		}
	},

	info(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.INFO) {
			console.log(`[INFO] [${timestamp()}]`, message, ...args);
		}
	},

	warn(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.WARN) {
			console.warn(`[WARN] [${timestamp()}]`, message, ...args);
		}
	},

	error(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.ERROR) {
			console.error(`[ERROR] [${timestamp()}]`, message, ...args);
		}
	}
};
