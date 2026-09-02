import fs from 'fs';

import { resolveRootPath, parseHex } from '@shared';

interface ColorsConfig {
	discordBotOnline: number;
	discordBotOffline: number;
	githubPushEvent: number;
	githubPullRequestEvent: number;
	githubIssuesEvent: number;
	githubCreateEvent: number;
	githubForkEvent: number;
	githubWatchEvent: number;
	githubReleaseEvent: number;
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
	};

	colors: ColorsConfig;

	limits: LimitsConfig;
}

const defaultConfig: BotConfig = {
	logger: {
		level: 'INFO',
		timestampFormat: 'ISO'
	},

	colors: {
		discordBotOnline: 0x238636,
		discordBotOffline: 0xda3633,
		githubPushEvent: 0x2f81f7,
		githubPullRequestEvent: 0x238636,
		githubIssuesEvent: 0x8957e5,
		githubCreateEvent: 0xda3633,
		githubForkEvent: 0xdb6d28,
		githubWatchEvent: 0xf0883e,
		githubReleaseEvent: 0x7ee787
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

		const colors = {
			...defaultConfig.colors
		};

		const parsedColors = parsed.colors ?? {};

		for (const [key, value] of Object.entries(parsedColors)) {
			if (!(key in colors)) {
				continue;
			}

			if (typeof value === 'number') {
				colors[key as keyof ColorsConfig] = value;
			} else if (typeof value === 'string') {
				colors[key as keyof ColorsConfig] = parseHex(value);
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
						: defaultConfig.logger.timestampFormat
			},

			colors,

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
