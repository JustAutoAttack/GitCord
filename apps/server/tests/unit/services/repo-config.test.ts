import { beforeEach, describe, expect, it, vi } from 'vitest';

import { repoConfigsRepo } from '@database';
import { RepoConfigsService } from '@services/repo-configs';

vi.mock('@database', () => ({
	repoConfigsRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByCommandChannelId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

describe('RepoConfigsService', () => {
	let service: RepoConfigsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new RepoConfigsService();
	});

	// --- List Configurations ---
	it('returns a list of repo configurations', async () => {
		const mockConfigs = [{ id: 'cfg_1' }, { id: 'cfg_2' }] as any;
		vi.mocked(repoConfigsRepo.findAll).mockResolvedValueOnce(mockConfigs);

		const result = await service.list();

		expect(result).toEqual(mockConfigs);
		expect(repoConfigsRepo.findAll).toHaveBeenCalledOnce();
	});

	// --- Get By ID ---
	it('returns a repo configuration by id', async () => {
		const mockConfig = { id: 'cfg_1' } as any;
		vi.mocked(repoConfigsRepo.findById).mockResolvedValueOnce(mockConfig);

		const result = await service.getById('cfg_1');

		expect(result).toEqual(mockConfig);
		expect(repoConfigsRepo.findById).toHaveBeenCalledWith('cfg_1');
	});

	it('returns null when repo configuration is not found by id', async () => {
		vi.mocked(repoConfigsRepo.findById).mockResolvedValueOnce(
			undefined as any
		);

		const result = await service.getById('missing');

		expect(result).toBeNull();
	});

	// --- Get By Command Channel ID ---
	it('returns a repo configuration by command channel id', async () => {
		const mockConfig = { id: 'cfg_1', commandChannelId: 'chan_123' } as any;
		vi.mocked(repoConfigsRepo.findByCommandChannelId).mockResolvedValueOnce(
			mockConfig
		);

		const result = await service.getByCommandChannelId('chan_123');

		expect(result).toEqual(mockConfig);
		expect(repoConfigsRepo.findByCommandChannelId).toHaveBeenCalledWith(
			'chan_123'
		);
	});

	it('returns null when repo configuration is not found by command channel id', async () => {
		vi.mocked(repoConfigsRepo.findByCommandChannelId).mockResolvedValueOnce(
			undefined as any
		);

		const result = await service.getByCommandChannelId('missing');

		expect(result).toBeNull();
	});

	// --- Create Configuration ---
	it('generates an id and creates a repo configuration', async () => {
		const input = {
			guildId: 'guild_123',
			repositoryUrl: 'https://github.com/owner/repo',
			commandChannelId: 'chan_cmd',
			notificationChannelId: 'chan_notif'
		};

		const mockCreated = { id: 'cfg_uuid', ...input } as any;
		vi.mocked(repoConfigsRepo.create).mockResolvedValueOnce(mockCreated);

		const result = await service.create(input);

		expect(result).toEqual(mockCreated);
		expect(repoConfigsRepo.create).toHaveBeenCalledWith(
			expect.objectContaining({
				id: expect.stringMatching(/^cfg_/),
				guildId: input.guildId,
				repositoryUrl: input.repositoryUrl,
				commandChannelId: input.commandChannelId,
				notificationChannelId: input.notificationChannelId
			})
		);
	});

	// --- Update Configuration ---
	it('updates a repo configuration', async () => {
		const input = { commandChannelId: 'chan_new' };
		const mockUpdated = { id: 'cfg_1', ...input } as any;
		vi.mocked(repoConfigsRepo.update).mockResolvedValueOnce(mockUpdated);

		const result = await service.update('cfg_1', input);

		expect(result).toEqual(mockUpdated);
		expect(repoConfigsRepo.update).toHaveBeenCalledWith('cfg_1', input);
	});

	it('returns null when updating a non-existent repo configuration', async () => {
		vi.mocked(repoConfigsRepo.update).mockResolvedValueOnce(
			undefined as any
		);

		const result = await service.update('missing', {});

		expect(result).toBeNull();
	});

	// --- Delete Configuration ---
	it('returns true when a repo configuration is successfully deleted', async () => {
		vi.mocked(repoConfigsRepo.delete).mockResolvedValueOnce(true as any);

		const result = await service.delete('cfg_1');

		expect(result).toBe(true);
		expect(repoConfigsRepo.delete).toHaveBeenCalledWith('cfg_1');
	});

	it('returns false when a repo configuration deletion fails or record is missing', async () => {
		vi.mocked(repoConfigsRepo.delete).mockResolvedValueOnce(
			undefined as any
		);

		const result = await service.delete('missing');

		expect(result).toBe(false);
	});
});
