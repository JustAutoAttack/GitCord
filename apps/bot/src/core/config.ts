import fs from 'fs';

import { resolveRootPath, parseHexColor } from './utils';

interface LoggersColorsConfig {
	app: number;
	serverApi: number;
	discord: number;
	github: number;
	http: number;
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

interface BotConfig {
	loggers: LoggersColorsConfig;
	discord: {
		colors: DiscordColorsConfig;
	};
	github: {
		colors: GithubColorsConfig;
	};
}

const defaultConfig: BotConfig = {
	loggers: {
		app: 0xff3c00,
		serverApi: 0xff9100,
		discord: 0x0077ff,
		github: 0xcc00ff,
		http: 0x00ff2a
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
	}
};

function parseToml(content: string): Record<string, Record<string, unknown>> {
	const result: Record<string, Record<string, unknown>> = {};
	let currentSection: Record<string, unknown> = result;

	for (const line of content.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const sectionMatch = trimmed.match(/^\[(.*)\]$/);
		if (sectionMatch) {
			const sectionName = sectionMatch[1].trim();
			if (!result[sectionName]) result[sectionName] = {};
			currentSection = result[sectionName];
			continue;
		}

		const keyValueMatch = trimmed.match(/^([\w-]+)\s*=\s*(.*)$/);
		if (!keyValueMatch) continue;

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
	const configPath = resolveRootPath('gitcord-bot.toml');
	if (!fs.existsSync(configPath)) return structuredClone(defaultConfig);

	try {
		const fileContent = fs.readFileSync(configPath, 'utf-8');
		const parsed = parseToml(fileContent);

		const loggers = { ...defaultConfig.loggers };
		const parsedLoggers = (parsed.loggers ?? {}) as Record<string, unknown>;
		for (const [key, value] of Object.entries(parsedLoggers)) {
			if (key in loggers) {
				if (typeof value === 'number') {
					loggers[key as keyof LoggersColorsConfig] = value;
				} else if (typeof value === 'string') {
					loggers[key as keyof LoggersColorsConfig] =
						parseHexColor(value);
				}
			}
		}

		const discordColors = { ...defaultConfig.discord.colors };
		const parsedDiscordColors = (parsed['discord.colors'] ??
			parsed.discord?.colors ??
			{}) as Record<string, unknown>;
		for (const [key, value] of Object.entries(parsedDiscordColors)) {
			if (key in discordColors) {
				if (typeof value === 'number')
					discordColors[key as keyof DiscordColorsConfig] = value;
				else if (typeof value === 'string')
					discordColors[key as keyof DiscordColorsConfig] =
						parseHexColor(value);
			}
		}

		const githubColors = { ...defaultConfig.github.colors };
		const parsedGithubColors = (parsed['github.colors'] ??
			parsed.github?.colors ??
			{}) as Record<string, unknown>;
		for (const [key, value] of Object.entries(parsedGithubColors)) {
			if (key in githubColors) {
				if (typeof value === 'number')
					githubColors[key as keyof GithubColorsConfig] = value;
				else if (typeof value === 'string')
					githubColors[key as keyof GithubColorsConfig] =
						parseHexColor(value);
			}
		}

		return {
			loggers,
			discord: { colors: discordColors },
			github: { colors: githubColors }
		};
	} catch (error) {
		console.error('[Config] Failed to parse gitcord-bot.toml:', error);
		return structuredClone(defaultConfig);
	}
}

export const CONFIG = loadConfig();
