import { loadLoggerConfig } from './config';
import { LogLevel, parseLogLevel } from './levels';
import { colorize, getTimestamp } from './utils';
import type { ILogger, LoggerConfig, LoggerOptions } from './types';

interface LogMethod {
	readonly name: string;
	readonly level: LogLevel;
	readonly color: number;
	readonly write: (...args: unknown[]) => void;
}

export class Logger implements ILogger {
	private readonly prefix: string;
	private readonly config: LoggerConfig;
	private readonly minimumLevel: LogLevel;

	constructor(name: string, options: LoggerOptions = {}) {
		this.prefix = `[${name}]`;
		this.config = options.config ?? loadLoggerConfig();
		this.minimumLevel = parseLogLevel(this.config.level);
	}

	trace(message: string, ...args: unknown[]): void {
		this.write(
			{
				name: 'TRACE',
				level: LogLevel.TRACE,
				color: this.config.colors.debug,
				write: console.debug
			},
			message,
			args
		);
	}

	debug(message: string, ...args: unknown[]): void {
		this.write(
			{
				name: 'DEBUG',
				level: LogLevel.DEBUG,
				color: this.config.colors.debug,
				write: console.debug
			},
			message,
			args
		);
	}

	info(message: string, ...args: unknown[]): void {
		this.write(
			{
				name: 'INFO',
				level: LogLevel.INFO,
				color: this.config.colors.info,
				write: console.log
			},
			message,
			args
		);
	}

	warn(message: string, ...args: unknown[]): void {
		this.write(
			{
				name: 'WARN',
				level: LogLevel.WARN,
				color: this.config.colors.warn,
				write: console.warn
			},
			message,
			args
		);
	}

	error(message: string, ...args: unknown[]): void {
		this.write(
			{
				name: 'ERROR',
				level: LogLevel.ERROR,
				color: this.config.colors.error,
				write: console.error
			},
			message,
			args
		);
	}

	private write(method: LogMethod, message: string, args: unknown[]): void {
		if (method.level < this.minimumLevel) {
			return;
		}

		const timestamp = getTimestamp(this.config.timestampFormat);

		const level = colorize(`[${method.name}]`, method.color);

		const output = colorize(message, method.color);

		method.write(
			`${this.prefix} ${level} [${timestamp}] ${output}`,
			...args
		);
	}
}
