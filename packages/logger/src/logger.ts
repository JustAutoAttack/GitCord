import { loadLoggerConfig } from './config';
import { DEFAULT_LOGGER_CONFIG } from './config/defaults';
import { LogLevel, parseLogLevel } from './levels';
import {
	colorize,
	getTimestamp,
	parseHex,
	getCallerInfo,
	parseHighlights
} from './utils';
import type {
	ILogger,
	LoggerConfig,
	LoggerOptions,
	LogCallOptions
} from './types';

interface LogMethod {
	readonly name: string;
	readonly level: LogLevel;
	readonly color: number;
	readonly write: (...args: unknown[]) => void;
}

export class Logger implements ILogger {
	private readonly prefix: string;
	public readonly config: LoggerConfig;
	private readonly homeDir?: string;
	private readonly color?: number;
	private readonly showFilePath: boolean;
	private readonly showLoc: boolean;
	private readonly highlightColor?: number | string;

	constructor(name: string, options: LoggerOptions = {}) {
		const rawPrefix = `[${name}]`;

		this.color = options.color;
		this.prefix =
			this.color !== undefined
				? colorize(rawPrefix, this.color)
				: rawPrefix;

		// Guard configuration and path resolution for browser environments
		if (typeof window !== 'undefined') {
			this.config = DEFAULT_LOGGER_CONFIG;
			this.homeDir = options.home;
		} else {
			this.config = loadLoggerConfig();
			// Dynamically require node:path only on the server side
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const path = require('node:path');
			this.homeDir = options.home
				? path.resolve(options.home)
				: undefined;
		}

		this.showFilePath =
			options.showFilePath ?? this.config.showFilePath ?? false;
		this.showLoc = options.showLoc ?? this.config.showLoc ?? false;
		this.highlightColor = options.highlightColor;
	}

	trace(message: string, ...args: unknown[]): void {
		this.write(
			{
				name: 'TRACE',
				level: LogLevel.TRACE,
				color: this.config.colors.trace,
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

	private parseLogArguments(args: unknown[]): {
		options: LogCallOptions;
		restArgs: unknown[];
	} {
		const [first, ...rest] = args;

		if (
			first &&
			typeof first === 'object' &&
			!Array.isArray(first) &&
			!(first instanceof Date) &&
			('showFilePath' in first ||
				'showLoc' in first ||
				'highlightColor' in first)
		) {
			return { options: first as LogCallOptions, restArgs: rest };
		}

		return { options: {}, restArgs: args };
	}

	private write(
		method: LogMethod,
		message: string,
		callArgs: unknown[]
	): void {
		const currentMinLevel = parseLogLevel(this.config.level);

		if (method.level < currentMinLevel) {
			return;
		}

		const { options, restArgs } = this.parseLogArguments(callArgs);
		const timestamp = getTimestamp(this.config.timestampFormat);
		const level = colorize(`[${method.name}]`, method.color);

		const shouldShowPath = options.showFilePath ?? this.showFilePath;
		const shouldShowLoc = options.showLoc ?? this.showLoc;

		let locationString = '';
		if (shouldShowPath || shouldShowLoc) {
			const caller = getCallerInfo(this.homeDir);
			if (caller) {
				const parts: string[] = [];
				if (shouldShowPath) parts.push(caller.filePath);
				if (shouldShowLoc) parts.push(String(caller.line));
				const rawLoc = `[${parts.join(':')}]`;
				locationString =
					this.color !== undefined
						? colorize(rawLoc, this.color)
						: rawLoc;
			}
		}

		const rawHighlightColor =
			options.highlightColor ??
			this.highlightColor ??
			this.config.colors.highlight ??
			method.color;

		let highlightTargetColor = method.color;
		if (typeof rawHighlightColor === 'number') {
			highlightTargetColor = rawHighlightColor;
		} else if (typeof rawHighlightColor === 'string') {
			const parsed = parseHex(rawHighlightColor);
			if (parsed !== undefined) {
				highlightTargetColor = parsed;
			}
		}

		const parsedMessage = parseHighlights(message, highlightTargetColor);
		const output = colorize(parsedMessage, method.color);
		const locPart = locationString ? ` ${locationString}` : '';

		method.write(
			`${this.prefix} ${level} [${timestamp}]${locPart} ${output}`,
			...restArgs
		);
	}
}
