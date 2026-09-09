export enum LogLevel {
	TRACE = 0,
	DEBUG = 1,
	INFO = 2,
	WARN = 3,
	ERROR = 4
}

export type LogLevelName = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevelName, LogLevel> = {
	TRACE: LogLevel.TRACE,
	DEBUG: LogLevel.DEBUG,
	INFO: LogLevel.INFO,
	WARN: LogLevel.WARN,
	ERROR: LogLevel.ERROR
};

export function parseLogLevel(value: unknown): LogLevel {
	if (typeof value !== 'string') {
		return LogLevel.INFO;
	}

	const normalized = value.trim().toUpperCase() as LogLevelName;

	return LOG_LEVELS[normalized] ?? LogLevel.INFO;
}

export function isLogLevelName(value: unknown): value is LogLevelName {
	return (
		typeof value === 'string' && value.trim().toUpperCase() in LOG_LEVELS
	);
}