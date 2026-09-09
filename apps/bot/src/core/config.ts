import fs from 'fs';

import { resolveRootPath, parseHex } from '@shared';

interface LoggerColorsConfig {
	debug: number;
	info: number;
	warn: number;
	error: number;
}

interface DiscordColorsConfig {
	online: number;
	offline: number;
}

interface GithubColorsConfig {
	push: number;
	pullRequest: number;
	issue: number;
	create: number;
	fork: number;
	watch: number;
	release: number;
}

interface LimitsConfig {
	maxCommitMessageLength: number;
	maxDescriptionLength: number;
	defaultCommitLimit: number;
	maxCommitLimit: number;
}

interface BotConfig {
	logger: {
		level: string;
		timestampFormat: string;
		colors: LoggerColorsConfig;
	};
	discord: {
		colors: DiscordColorsConfig;
	};
	github: {
		colors: GithubColorsConfig;
	};
	limits: LimitsConfig;
}

const defaultConfig: BotConfig = {
	logger: {
		level: 'INFO',
		timestampFormat: 'ISO',
		colors: {
			debug: 0x00bfff,
			info: 0x32cd32,
			warn: 0xffd700,
			error: 0xff4500
		}
	},
	discord: {
		colors: {
			online: 0x238636,
			offline: 0xda3633
		}
	},
	github: {
		colors: {
			push: 0x2f81f7,
			pullRequest: 0x238636,
			issue: 0x8957e5,
			create: 0xda3633,
			fork: 0xdb6d28,
			watch: 0xf0883e,
			release: 0x7ee787
		}
	},
	limits: {
		maxCommitMessageLength: 140,
		maxDescriptionLength: 250,
		defaultCommitLimit: 5,
		maxCommitLimit: 40
	}
};

function parseToml(content: string): Record<string, Record<string, unknown>> {
	const result: Record<string, Record<string, unknown>> = {};

	let currentSection: Record<string, unknown> = result;

	for (const line of content.split('\n')) {
		const trimmed = line.trim();

		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		const sectionMatch = trimmed.match(/^\[(.*)\]$/);

		if (sectionMatch) {
			const sectionName = sectionMatch[1].trim();

			if (!result[sectionName]) {
				result[sectionName] = {};
			}

			currentSection = result[sectionName];

			continue;
		}

		const keyValueMatch = trimmed.match(/^([\w-]+)\s*=\s*(.*)$/);

		if (!keyValueMatch) {
			continue;
		}

		const key = keyValueMatch[1];

		let value: unknown = keyValueMatch[2].trim();

		if (
			typeof value === 'string' &&
			value.startsWith('"') &&
			value.endsWith('"')
		) {
			value = value.slice(1, -1);
		} else if (value === 'true') {
			value = true;
		} else if (value === 'false') {
			value = false;
		} else if (!isNaN(Number(value))) {
			value = Number(value);
		}

		currentSection[key] = value;
	}

	return result;
}

function loadConfig(): BotConfig {
	const configPath = resolveRootPath('gitcord.toml');

	if (!fs.existsSync(configPath)) {
		return structuredClone(defaultConfig);
	}

	try {
		const fileContent = fs.readFileSync(configPath, 'utf-8');

		const parsed = parseToml(fileContent);

		const loggerColors = { ...defaultConfig.logger.colors };
		const parsedLoggerColors = (parsed['logger.colors'] ??
			parsed.logger?.colors ??
			{}) as Record<string, unknown>;
		for (const [key, value] of Object.entries(parsedLoggerColors)) {
			if (key in loggerColors) {
				if (typeof value === 'number') {
					loggerColors[key as keyof LoggerColorsConfig] = value;
				} else if (typeof value === 'string') {
					loggerColors[key as keyof LoggerColorsConfig] =
						parseHex(value);
				}
			}
		}

		const discordColors = { ...defaultConfig.discord.colors };
		const parsedDiscordColors = (parsed['discord.colors'] ??
			parsed.discord?.colors ??
			{}) as Record<string, unknown>;
		for (const [key, value] of Object.entries(parsedDiscordColors)) {
			if (key in discordColors) {
				if (typeof value === 'number') {
					discordColors[key as keyof DiscordColorsConfig] = value;
				} else if (typeof value === 'string') {
					discordColors[key as keyof DiscordColorsConfig] =
						parseHex(value);
				}
			}
		}

		const githubColors = { ...defaultConfig.github.colors };
		const parsedGithubColors = (parsed['github.colors'] ??
			parsed.github?.colors ??
			{}) as Record<string, unknown>;
		for (const [key, value] of Object.entries(parsedGithubColors)) {
			if (key in githubColors) {
				if (typeof value === 'number') {
					githubColors[key as keyof GithubColorsConfig] = value;
				} else if (typeof value === 'string') {
					githubColors[key as keyof GithubColorsConfig] =
						parseHex(value);
				}
			}
		}

		return {
			logger: {
				level:
					typeof parsed.logger?.level === 'string'
						? parsed.logger.level
						: defaultConfig.logger.level,

				timestampFormat:
					typeof parsed.logger?.timestampFormat === 'string'
						? parsed.logger.timestampFormat
						: defaultConfig.logger.timestampFormat,

				colors: loggerColors
			},

			discord: {
				colors: discordColors
			},

			github: {
				colors: githubColors
			},

			limits: {
				...defaultConfig.limits,
				...(parsed.limits ?? {})
			} as LimitsConfig
		};
	} catch (error) {
		console.error('[Config] Failed to parse gitcord.toml:', error);

		return structuredClone(defaultConfig);
	}
}

export const CONFIG = loadConfig();
