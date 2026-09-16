import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GuildSetting } from '@domain';
import { guildSettingsService } from '../../../src/services/guild-settings';
import { guildSettingsRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		guildSettingsRepo: {
			findAll: vi.fn(),
			findById: vi.fn(),
			findByNotifyOnConnection: vi.fn(),
			findByGuildId: vi.fn(),
			findBySystemChannelId: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn()
		}
	};
});

// Mock the logger to keep test output clean
vi.mock('../../../src/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../src/core')>();
	return {
		...actual,
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

describe('GuildSettingsService', () => {
	const mockSetting: GuildSetting.Model = {
		id: 'set-1',
		guildId: 'guild-1',
		systemChannelId: 'sys-chan-1',
		notifyOnConnection: true,
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('list', () => {
		it('should return settings filtered by notifyOnConnection when provided', async () => {
			vi.mocked(
				guildSettingsRepo.findByNotifyOnConnection
			).mockReturnValue([mockSetting]);

			const result = await guildSettingsService.list(true);

			expect(
				guildSettingsRepo.findByNotifyOnConnection
			).toHaveBeenCalledWith(true);
			expect(result).toEqual([mockSetting]);
		});

		it('should return all settings when notifyOnConnection is undefined', async () => {
			vi.mocked(guildSettingsRepo.findAll).mockReturnValue([mockSetting]);

			const result = await guildSettingsService.list();

			expect(guildSettingsRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual([mockSetting]);
		});
	});

	describe('getByGuildId', () => {
		it('should return the guild setting when found by guild ID', async () => {
			vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValue(
				mockSetting
			);

			const result = await guildSettingsService.getByGuildId('guild-1');

			expect(guildSettingsRepo.findByGuildId).toHaveBeenCalledWith(
				'guild-1'
			);
			expect(result).toEqual(mockSetting);
		});

		it('should return undefined when no guild setting is found by guild ID', async () => {
			vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValue(
				undefined
			);

			const result =
				await guildSettingsService.getByGuildId('guild-unknown');

			expect(result).toBeUndefined();
		});
	});

	describe('getBySystemChannelId', () => {
		it('should return the guild setting when found by system channel ID', async () => {
			vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValue(
				mockSetting
			);

			const result =
				await guildSettingsService.getBySystemChannelId('sys-chan-1');

			expect(
				guildSettingsRepo.findBySystemChannelId
			).toHaveBeenCalledWith('sys-chan-1');
			expect(result).toEqual(mockSetting);
		});

		it('should return undefined when no setting is found by system channel ID', async () => {
			vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValue(
				undefined
			);

			const result =
				await guildSettingsService.getBySystemChannelId('sys-unknown');

			expect(result).toBeUndefined();
		});
	});

	describe('create', () => {
		const createInput: GuildSetting.CreateInput = {
			guildId: 'guild-1',
			systemChannelId: 'sys-chan-1',
			notifyOnConnection: true
		};

		it('should throw CONFLICT if settings for the guild already exist', async () => {
			vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValue(
				mockSetting
			);

			await expect(
				guildSettingsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message: 'Guild settings for guild [guild-1] already exist'
				})
			);

			expect(guildSettingsRepo.create).not.toHaveBeenCalled();
		});

		it('should throw CONFLICT if the system channel is already bound to another guild', async () => {
			vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValue(
				undefined
			);
			vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValue(
				mockSetting
			);

			await expect(
				guildSettingsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message:
						'System channel [sys-chan-1] is already bound to guild guild-1'
				})
			);

			expect(guildSettingsRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return settings if no conflicts exist', async () => {
			vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValue(
				undefined
			);
			vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValue(
				undefined
			);
			vi.mocked(guildSettingsRepo.create).mockReturnValue(mockSetting);

			const result = await guildSettingsService.create(createInput);

			expect(guildSettingsRepo.create).toHaveBeenCalledWith(createInput);
			expect(result).toEqual(mockSetting);
		});
	});
});
