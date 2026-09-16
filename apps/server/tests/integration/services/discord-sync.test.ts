import { describe, it, expect, vi, beforeEach } from 'vitest';
import { discordSyncService } from '../../../src/services/discord-sync';
import { guildSettingsService } from '../../../src/services/guild-settings';
import { appLogger, ENV } from '../../../src/core';
import { REST, Routes } from 'discord.js';

// Mock discord.js REST and Routes using a proper constructor function
vi.mock('discord.js', () => {
	const mockRestGet = vi.fn();
	return {
		REST: vi.fn(function () {
			return {
				setToken: vi.fn().mockReturnThis(),
				get: mockRestGet
			};
		}),
		Routes: {
			userGuilds: vi.fn().mockReturnValue('/users/@me/guilds'),
			guild: vi.fn((id: string) => `/guilds/${id}`),
			guildChannels: vi.fn((id: string) => `/guilds/${id}/channels`)
		}
	};
});

// Mock guildSettingsService
vi.mock('../../../src/services/guild-settings', () => ({
	guildSettingsService: {
		list: vi.fn(),
		create: vi.fn()
	}
}));

// Mock core (appLogger and ENV)
vi.mock('../../../src/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../src/core')>();
	return {
		...actual,
		ENV: {
			...actual.ENV,
			DISCORD_BOT_TOKEN: 'mock-bot-token'
		},
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('DiscordSyncService', () => {
	let mockRestGet: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();

		// Extract the mock get method reference from the REST constructor instance
		const restInstance = new REST({ version: '10' });
		mockRestGet = restInstance.get as ReturnType<typeof vi.fn>;
		mockRestGet.mockReset();
	});

	it('should skip sync and log a warning if DISCORD_BOT_TOKEN is missing', async () => {
		const originalToken = (
			ENV as unknown as { DISCORD_BOT_TOKEN?: string | number }
		).DISCORD_BOT_TOKEN;

		(ENV as unknown as { DISCORD_BOT_TOKEN?: string }).DISCORD_BOT_TOKEN =
			undefined;

		await discordSyncService.sync();

		expect(appLogger.warn).toHaveBeenCalledWith(
			'[Discord Sync] Skipping sync: Missing DISCORD_BOT_TOKEN.'
		);
		expect(mockRestGet).not.toHaveBeenCalled();

		// Restore
		(
			ENV as unknown as { DISCORD_BOT_TOKEN?: string | number }
		).DISCORD_BOT_TOKEN = originalToken;
	});

	it('should create missing guild settings using system channel when available', async () => {
		const remoteGuilds = [{ id: 'guild-1', name: 'Test Guild' }];
		vi.mocked(guildSettingsService.list).mockResolvedValue([]);

		// Mock REST responses
		mockRestGet.mockImplementation(async (route) => {
			if (route === '/users/@me/guilds') return remoteGuilds;
			if (route === '/guilds/guild-1')
				return { system_channel_id: 'sys-chan-1' };
			return null;
		});

		await discordSyncService.sync();

		expect(guildSettingsService.create).toHaveBeenCalledWith({
			guildId: 'guild-1',
			systemChannelId: 'sys-chan-1',
			notifyOnConnection: true
		});
		expect(appLogger.info).toHaveBeenCalledWith(
			'[Discord Sync] Discord guild synchronization completed successfully.'
		);
	});

	it('should fallback to text channel if system channel is missing', async () => {
		const remoteGuilds = [{ id: 'guild-2', name: 'Fallback Guild' }];
		vi.mocked(guildSettingsService.list).mockResolvedValue([]);

		mockRestGet.mockImplementation(async (route) => {
			if (route === '/users/@me/guilds') return remoteGuilds;
			if (route === '/guilds/guild-2') return { system_channel_id: null };
			if (route === '/guilds/guild-2/channels') {
				return [
					{ id: 'voice-chan', type: 2 }, // GuildVoice
					{ id: 'text-chan-1', type: 0 } // GuildText
				];
			}
			return null;
		});

		await discordSyncService.sync();

		expect(guildSettingsService.create).toHaveBeenCalledWith({
			guildId: 'guild-2',
			systemChannelId: 'text-chan-1',
			notifyOnConnection: true
		});
	});

	it('should skip guild settings creation if no system or text channel can be found', async () => {
		const remoteGuilds = [{ id: 'guild-3', name: 'Empty Guild' }];
		vi.mocked(guildSettingsService.list).mockResolvedValue([]);

		mockRestGet.mockImplementation(async (route) => {
			if (route === '/users/@me/guilds') return remoteGuilds;
			if (route === '/guilds/guild-3') return { system_channel_id: null };
			if (route === '/guilds/guild-3/channels') {
				return [{ id: 'voice-chan', type: 2 }];
			}
			return null;
		});

		await discordSyncService.sync();

		expect(guildSettingsService.create).not.toHaveBeenCalled();
		expect(appLogger.warn).toHaveBeenCalledWith(
			expect.stringContaining(
				'Skipping guild settings creation for server ID: guild-3'
			)
		);
	});

	it('should detect stale local guild settings and log info', async () => {
		const remoteGuilds = [{ id: 'guild-active', name: 'Active' }];
		vi.mocked(guildSettingsService.list).mockResolvedValue([
			{
				id: 'set-1',
				guildId: 'guild-stale',
				systemChannelId: 'chan-1',
				notifyOnConnection: true,
				createdAt: '2026-09-01T00:00:00.000Z',
				updatedAt: '2026-09-01T00:00:00.000Z'
			}
		]);

		mockRestGet.mockResolvedValueOnce(remoteGuilds);

		await discordSyncService.sync();

		expect(appLogger.info).toHaveBeenCalledWith(
			'[Discord Sync] Found stale local guild setting for server ID guild-stale (Bot is no longer in this guild).'
		);
	});

	it('should catch and log errors if REST sync fails', async () => {
		vi.mocked(guildSettingsService.list).mockResolvedValue([]);
		mockRestGet.mockRejectedValue(new Error('Discord API Rate Limit'));

		await discordSyncService.sync();

		expect(appLogger.error).toHaveBeenCalledWith(
			'[Discord Sync] Failed to synchronize Discord guild settings:',
			expect.any(Error)
		);
	});
});
