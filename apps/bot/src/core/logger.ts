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

function hexToAnsi(hex: number): string {
	const r = (hex >> 16) & 0xff;
	const g = (hex >> 8) & 0xff;
	const b = hex & 0xff;
	return `\x1b[38;2;${r};${g};${b}m`;
}

const RESET = '\x1b[00m';

export const logger = {
	trace(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.TRACE) {
			const color = hexToAnsi(CONFIG.logger.colors.debug);
			console.trace(
				`${color}[TRACE]${RESET} [${timestamp()}]`,
				message,
				...args
			);
		}
	},

	debug(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.DEBUG) {
			const color = hexToAnsi(CONFIG.logger.colors.debug);
			console.debug(
				`${color}[DEBUG]${RESET} [${timestamp()}]`,
				message,
				...args
			);
		}
	},

	info(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.INFO) {
			const color = hexToAnsi(CONFIG.logger.colors.info);
			console.log(
				`${color}[INFO]${RESET} [${timestamp()}]`,
				message,
				...args
			);
		}
	},

	warn(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.WARN) {
			const color = hexToAnsi(CONFIG.logger.colors.warn);
			console.warn(
				`${color}[WARN]${RESET} [${timestamp()}]`,
				message,
				...args
			);
		}
	},

	error(message: string, ...args: unknown[]): void {
		if (currentLevel <= LogLevel.ERROR) {
			const color = hexToAnsi(CONFIG.logger.colors.error);
			console.error(
				`${color}[ERROR]${RESET} [${timestamp()}]`,
				message,
				...args
			);
		}
	}
};
