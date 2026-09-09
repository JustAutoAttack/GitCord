import type { LogLevelName } from './levels';

export type TimestampFormat = 'ISO' | 'LOCALE' | 'UNIX';

export interface LoggerColorsConfig {
	trace: number;
	debug: number;
	info: number;
	warn: number;
	error: number;
}

export interface LoggerConfig {
	level: LogLevelName;
	timestampFormat: TimestampFormat;
	colors: LoggerColorsConfig;
}

export interface LoggerOptions {
	color?: number;
}

export interface ILogger {
	trace(message: string, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
}
