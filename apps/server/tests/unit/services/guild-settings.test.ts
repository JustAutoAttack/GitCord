import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError, ErrorCode } from '@core';
import { guildSettingsRepo } from '@database';
import { GuildSettingsService } from '@services/guild-settings';

vi.mock('@database', () => ({
	guildSettingsRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByGuildId: vi.fn(),
		findBySystemChannelId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

describe('GuildSettingsService', () => {
	let service: GuildSettingsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new GuildSettingsService();
	});

	it('lists all guild settings', async () => {
		const mockSettings = [{ id: 'set_1', guildId: 'guild_1' }] as any;
		vi.mocked(guildSettingsRepo.findAll).mockReturnValueOnce(mockSettings);

		const result = await service.list();

		expect(result).toEqual(mockSettings);
		expect(guildSettingsRepo.findAll).toHaveBeenCalledOnce();
	});

	it('gets a guild setting by id', async () => {
		const mockSetting = { id: 'set_1', guildId: 'guild_1' } as any;
		vi.mocked(guildSettingsRepo.findById).mockReturnValueOnce(mockSetting);

		const result = await service.getById('set_1');

		expect(result).toEqual(mockSetting);
		expect(guildSettingsRepo.findById).toHaveBeenCalledWith('set_1');
	});

	it('returns null when getById finds nothing', async () => {
		vi.mocked(guildSettingsRepo.findById).mockReturnValueOnce(
			undefined as any
		);

		const result = await service.getById('missing');

		expect(result).toBeNull();
	});

	it('gets a guild setting by guild id', async () => {
		const mockSetting = { id: 'set_1', guildId: 'guild_1' } as any;
		vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValueOnce(
			mockSetting
		);

		const result = await service.getByGuildId('guild_1');

		expect(result).toEqual(mockSetting);
		expect(guildSettingsRepo.findByGuildId).toHaveBeenCalledWith('guild_1');
	});

	it('gets a guild setting by system channel id', async () => {
		const mockSetting = { id: 'set_1', systemChannelId: 'chan_1' } as any;
		vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValueOnce(
			mockSetting
		);

		const result = await service.getBySystemChannelId('chan_1');

		expect(result).toEqual(mockSetting);
		expect(guildSettingsRepo.findBySystemChannelId).toHaveBeenCalledWith(
			'chan_1'
		);
	});

	it('creates a guild setting successfully', async () => {
		const input = { guildId: 'guild_1', systemChannelId: 'chan_1' };
		const mockCreated = { id: 'set_1', ...input } as any;

		vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(guildSettingsRepo.create).mockReturnValueOnce(mockCreated);

		const result = await service.create(input);

		expect(result).toEqual(mockCreated);
		expect(guildSettingsRepo.create).toHaveBeenCalledWith(input);
	});

	it('throws CONFLICT error when creating setting for existing guild', async () => {
		const input = { guildId: 'guild_1', systemChannelId: 'chan_1' };
		const existing = { id: 'set_1', guildId: 'guild_1' } as any;

		vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValueOnce(
			existing
		);

		await expect(service.create(input)).rejects.toThrow(
			new AppError(
				ErrorCode.CONFLICT,
				'Guild settings for guild [guild_1] already exist'
			)
		);
	});

	it('throws CONFLICT error when creating setting with bound system channel', async () => {
		const input = { guildId: 'guild_1', systemChannelId: 'chan_1' };
		const existingChannel = {
			id: 'set_2',
			guildId: 'guild_2',
			systemChannelId: 'chan_1'
		} as any;

		vi.mocked(guildSettingsRepo.findByGuildId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(guildSettingsRepo.findBySystemChannelId).mockReturnValueOnce(
			existingChannel
		);

		await expect(service.create(input)).rejects.toThrow(
			new AppError(
				ErrorCode.CONFLICT,
				'System channel [chan_1] is already bound to guild guild_2'
			)
		);
	});

	it('updates a guild setting successfully', async () => {
		const input = { systemChannelId: 'chan_updated' };
		const mockUpdated = {
			id: 'set_1',
			guildId: 'guild_1',
			systemChannelId: 'chan_updated'
		} as any;

		vi.mocked(guildSettingsRepo.update).mockReturnValueOnce(mockUpdated);

		const result = await service.update('set_1', input);

		expect(result).toEqual(mockUpdated);
		expect(guildSettingsRepo.update).toHaveBeenCalledWith('set_1', input);
	});

	it('throws NOT_FOUND error when updating non-existent setting', async () => {
		vi.mocked(guildSettingsRepo.update).mockReturnValueOnce(
			undefined as any
		);

		await expect(
			service.update('missing', { systemChannelId: 'chan_1' })
		).rejects.toThrow(
			new AppError(
				ErrorCode.NOT_FOUND,
				'guild setting [ID: missing] not found for update'
			)
		);
	});

	it('deletes a guild setting successfully', async () => {
		const mockDeleted = { id: 'set_1', guildId: 'guild_1' } as any;
		vi.mocked(guildSettingsRepo.delete).mockReturnValueOnce(mockDeleted);

		const result = await service.delete('set_1');

		expect(result).toBe(true);
		expect(guildSettingsRepo.delete).toHaveBeenCalledWith('set_1');
	});

	it('throws NOT_FOUND error when deleting non-existent setting', async () => {
		vi.mocked(guildSettingsRepo.delete).mockReturnValueOnce(
			undefined as any
		);

		await expect(service.delete('missing')).rejects.toThrow(
			new AppError(
				ErrorCode.NOT_FOUND,
				'guild setting [ID: missing] not found for deletion'
			)
		);
	});
});
