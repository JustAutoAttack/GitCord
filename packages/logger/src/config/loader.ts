import { parse } from 'smol-toml';

import { DEFAULT_LOGGER_CONFIG } from './defaults';
import { isLogLevelName } from '../levels';
import { parseHex } from '../utils';

import type {
	LoggerColorsConfig,
	LoggerConfig,
	TimestampFormat
} from '../types';

const CONFIG_FILENAME = 'gitcord-logger.toml';

let cachedConfig: LoggerConfig | undefined;

function cloneDefaultConfig(): LoggerConfig {
	return {
		level: DEFAULT_LOGGER_CONFIG.level,
		timestampFormat: DEFAULT_LOGGER_CONFIG.timestampFormat,
		showFilePath: DEFAULT_LOGGER_CONFIG.showFilePath,
		showLoc: DEFAULT_LOGGER_CONFIG.showLoc,
		colors: {
			...DEFAULT_LOGGER_CONFIG.colors
		}
	};
}

function parseTimestampFormat(value: unknown): TimestampFormat {
	if (typeof value !== 'string') {
		return DEFAULT_LOGGER_CONFIG.timestampFormat;
	}

	switch (value.trim().toUpperCase()) {
		case 'ISO':
			return 'ISO';
		case 'LOCALE':
			return 'LOCALE';
		case 'UNIX':
			return 'UNIX';
		default:
			return DEFAULT_LOGGER_CONFIG.timestampFormat;
	}
}

function parseColors(value: unknown): LoggerColorsConfig {
	const colors: LoggerColorsConfig = {
		...DEFAULT_LOGGER_CONFIG.colors
	};

	if (!value || typeof value !== 'object') {
		return colors;
	}

	for (const [key, rawValue] of Object.entries(value)) {
		if (!(key in colors)) {
			continue;
		}

		const colorKey = key as keyof LoggerColorsConfig;

		if (typeof rawValue === 'number') {
			colors[colorKey] = rawValue;
			continue;
		}

		if (typeof rawValue === 'string') {
			const parsed = parseHex(rawValue);

			if (parsed !== undefined) {
				colors[colorKey] = parsed;
			}
		}
	}

	return colors;
}

function parseConfig(content: string): LoggerConfig {
	const document = parse(content) as Record<string, unknown>;

	const logger =
		document.logger && typeof document.logger === 'object'
			? (document.logger as Record<string, unknown>)
			: document;

	const normalizedLevel =
		typeof logger.level === 'string'
			? logger.level.trim().toUpperCase()
			: '';

	const level = isLogLevelName(normalizedLevel)
		? normalizedLevel
		: DEFAULT_LOGGER_CONFIG.level;

	const showFilePath =
		typeof logger.showFilePath === 'boolean'
			? logger.showFilePath
			: DEFAULT_LOGGER_CONFIG.showFilePath;

	const showLoc =
		typeof logger.showLoc === 'boolean'
			? logger.showLoc
			: DEFAULT_LOGGER_CONFIG.showLoc;

	return {
		level,
		timestampFormat: parseTimestampFormat(logger.timestampFormat),
		showFilePath,
		showLoc,
		colors: parseColors(logger.colors)
	};
}

export function loadLoggerConfig(): LoggerConfig {
	if (cachedConfig) {
		return cachedConfig;
	}

	// Safely short-circuit if running in a browser environment
	if (typeof window !== 'undefined') {
		cachedConfig = cloneDefaultConfig();
		return cachedConfig;
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const fs = require('node:fs');
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const path = require('node:path');

		const filePath = path.resolve(process.cwd(), CONFIG_FILENAME);

		if (fs.existsSync(filePath)) {
			const content = fs.readFileSync(filePath, 'utf8');
			cachedConfig = parseConfig(content);
			return cachedConfig;
		}
	} catch (error) {
		console.error(
			`[Logger] Failed to load configuration from ${CONFIG_FILENAME}:`,
			error
		);
	}

	cachedConfig = cloneDefaultConfig();
	return cachedConfig;
}

export function resetLoggerConfig(): void {
	cachedConfig = undefined;
}
