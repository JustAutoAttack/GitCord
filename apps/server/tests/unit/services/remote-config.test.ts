import { beforeEach, describe, expect, it, vi } from 'vitest';

import { remoteConfigsRepo } from '@database';
import { RemoteConfigsService } from '@services/remote-configs';

vi.mock('@database', () => ({
	remoteConfigsRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByCommandChannelId: vi.fn(),
		findByGuildId: vi.fn(),
		findByGuildAndRepo: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

describe('RemoteConfigsService', () => {
	let service: RemoteConfigsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new RemoteConfigsService();
	});

	// --- List Configurations ---
	it('returns a list of remote configurations', async () => {
		const mockConfigs = [{ id: 'cfg_1' }, { id: 'cfg_2' }] as any;
		vi.mocked(remoteConfigsRepo.findAll).mockReturnValueOnce(mockConfigs);

		const result = await service.list();

		expect(result).toEqual(mockConfigs);
		expect(remoteConfigsRepo.findAll).toHaveBeenCalledOnce();
	});

	it('returns remote configurations filtered by guildId when provided', async () => {
		const mockConfigs = [{ id: 'cfg_1', guildId: 'guild_1' }] as any;
		vi.mocked(remoteConfigsRepo.findByGuildId).mockReturnValueOnce(
			mockConfigs
		);

		const result = await service.list('guild_1');

		expect(result).toEqual(mockConfigs);
		expect(remoteConfigsRepo.findByGuildId).toHaveBeenCalledWith('guild_1');
	});

	// --- Get By ID ---
	it('returns a remote configuration by id', async () => {
		const mockConfig = { id: 'cfg_1' } as any;
		vi.mocked(remoteConfigsRepo.findById).mockReturnValueOnce(mockConfig);

		const result = await service.getById('cfg_1');

		expect(result).toEqual(mockConfig);
		expect(remoteConfigsRepo.findById).toHaveBeenCalledWith('cfg_1');
	});

	it('returns null when remote configuration is not found by id', async () => {
		vi.mocked(remoteConfigsRepo.findById).mockReturnValueOnce(
			undefined as any
		);

		const result = await service.getById('missing');

		expect(result).toBeNull();
	});

	// --- Get By Command Channel ID ---
	it('returns a remote configuration by command channel id', async () => {
		const mockConfig = { id: 'cfg_1', commandChannelId: 'chan_123' } as any;
		vi.mocked(remoteConfigsRepo.findByCommandChannelId).mockReturnValueOnce(
			mockConfig
		);

		const result = await service.getByCommandChannelId('chan_123');

		expect(result).toEqual(mockConfig);
		expect(remoteConfigsRepo.findByCommandChannelId).toHaveBeenCalledWith(
			'chan_123'
		);
	});

	it('returns null when remote configuration is not found by command channel id', async () => {
		vi.mocked(remoteConfigsRepo.findByCommandChannelId).mockReturnValueOnce(
			undefined as any
		);

		const result = await service.getByCommandChannelId('missing');

		expect(result).toBeNull();
	});

	// --- Get By Guild and Repo ---
	it('returns a remote configuration by guild id and repo url', async () => {
		const mockConfig = { id: 'cfg_1' } as any;
		vi.mocked(remoteConfigsRepo.findByGuildAndRepo).mockReturnValueOnce(
			mockConfig
		);

		const result = await service.getByGuildAndRepo(
			'guild_1',
			'https://github.com/owner/repo'
		);

		expect(result).toEqual(mockConfig);
		expect(remoteConfigsRepo.findByGuildAndRepo).toHaveBeenCalledWith(
			'guild_1',
			'https://github.com/owner/repo'
		);
	});

	// --- Create Configuration ---
	it('generates an id and creates a remote configuration', async () => {
		const input = {
			guildId: 'guild_123',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'chan_cmd',
			notificationChannelId: 'chan_notif'
		};

		const mockCreated = { id: 'cfg_uuid', ...input } as any;
		vi.mocked(remoteConfigsRepo.findByCommandChannelId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(remoteConfigsRepo.findByGuildAndRepo).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(remoteConfigsRepo.create).mockReturnValueOnce(mockCreated);

		const result = await service.create(input);

		expect(result).toEqual(mockCreated);
		expect(remoteConfigsRepo.create).toHaveBeenCalledWith(
			expect.objectContaining({
				guildId: input.guildId,
				repositoryUrl: input.repositoryUrl,
				commandChannelId: input.commandChannelId,
				notificationChannelId: input.notificationChannelId
			})
		);
	});

	it('throws conflict error when creating with an already bound command channel', async () => {
		const input = {
			guildId: 'guild_123',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'chan_cmd',
			notificationChannelId: 'chan_notif'
		};

		vi.mocked(remoteConfigsRepo.findByCommandChannelId).mockReturnValueOnce(
			{
				repositoryUrl: 'https://github.com/owner/other'
			} as any
		);

		await expect(service.create(input)).rejects.toThrow(
			/already bound to repository/
		);
	});

	it('throws conflict error when creating with a guild already subscribed to the repo', async () => {
		const input = {
			guildId: 'guild_123',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'chan_cmd',
			notificationChannelId: 'chan_notif'
		};

		vi.mocked(remoteConfigsRepo.findByCommandChannelId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(remoteConfigsRepo.findByGuildAndRepo).mockReturnValueOnce({
			id: 'cfg_existing'
		} as any);

		await expect(service.create(input)).rejects.toThrow(
			/already subscribed to repository/
		);
	});

	// --- Update Configuration ---
	it('updates a remote configuration', async () => {
		const input = { commandChannelId: 'chan_new' };
		const mockUpdated = { id: 'cfg_1', ...input } as any;
		vi.mocked(remoteConfigsRepo.update).mockReturnValueOnce(mockUpdated);

		const result = await service.update('cfg_1', input);

		expect(result).toEqual(mockUpdated);
		expect(remoteConfigsRepo.update).toHaveBeenCalledWith('cfg_1', input);
	});

	it('returns null when updating a non-existent remote configuration', async () => {
		vi.mocked(remoteConfigsRepo.update).mockReturnValueOnce(
			undefined as any
		);

		await expect(service.update('missing', {})).rejects.toThrow(
			/not found for update/
		);
	});

	// --- Delete Configuration ---
	it('returns true when a remote configuration is successfully deleted', async () => {
		const mockDeleted = { id: 'cfg_1' } as any;
		vi.mocked(remoteConfigsRepo.delete).mockReturnValueOnce(mockDeleted);

		const result = await service.delete('cfg_1');

		expect(result).toBe(true);
		expect(remoteConfigsRepo.delete).toHaveBeenCalledWith('cfg_1');
	});

	it('returns false when a remote configuration deletion fails or record is missing', async () => {
		vi.mocked(remoteConfigsRepo.delete).mockReturnValueOnce(
			undefined as any
		);

		await expect(service.delete('missing')).rejects.toThrow(
			/not found for deletion/
		);
	});
});
