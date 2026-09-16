import type { LogLevelName } from './levels';

export type TimestampFormat = 'ISO' | 'LOCALE' | 'UNIX';

export interface LoggerColorsConfig {
	trace: number;
	debug: number;
	info: number;
	warn: number;
	error: number;
	highlight?: number;
}

export interface LoggerConfig {
	level: LogLevelName;
	timestampFormat: TimestampFormat;
	colors: LoggerColorsConfig;
	showFilePath?: boolean;
	showLoc?: boolean;
}

export interface LoggerOptions {
	color?: number;
	home?: string;
	showFilePath?: boolean;
	showLoc?: boolean;
	highlightColor?: number | string;
}

export interface LogCallOptions {
	showFilePath?: boolean;
	showLoc?: boolean;
	highlightColor?: number | string;
}

export interface ILogger {
	trace(message: string, options?: LogCallOptions, ...args: unknown[]): void;
	trace(message: string, ...args: unknown[]): void;
	debug(message: string, options?: LogCallOptions, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;
	info(message: string, options?: LogCallOptions, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;
	warn(message: string, options?: LogCallOptions, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	error(message: string, options?: LogCallOptions, ...args: unknown[]): void;
	error(message: string, ...args: unknown[]): void;
}
