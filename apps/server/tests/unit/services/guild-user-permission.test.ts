import { beforeEach, describe, expect, it, vi } from 'vitest';
import { guildUserPermissionsRepo, botCommandsRepo } from '@database';
import { GuildUserPermissionsService } from '@services/guild-user-permissions';

vi.mock('@database', () => ({
	guildUserPermissionsRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByGuildId: vi.fn(),
		findByGuildAndUser: vi.fn(),
		findByGuildUserAndCommand: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	},
	botCommandsRepo: {
		findById: vi.fn()
	}
}));

describe('GuildUserPermissionsService', () => {
	let service: GuildUserPermissionsService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new GuildUserPermissionsService();
	});

	it('lists all permissions when guildId is not provided', async () => {
		const mockPerms = [{ id: 'perm_1' }] as any;
		vi.mocked(guildUserPermissionsRepo.findAll).mockReturnValueOnce(
			mockPerms
		);

		const result = await service.list();
		expect(result).toEqual(mockPerms);
		expect(guildUserPermissionsRepo.findAll).toHaveBeenCalled();
	});

	it('lists permissions filtered by guildId', async () => {
		const mockPerms = [{ id: 'perm_1' }] as any;
		vi.mocked(guildUserPermissionsRepo.findByGuildId).mockReturnValueOnce(
			mockPerms
		);

		const result = await service.list('guild_1');
		expect(result).toEqual(mockPerms);
		expect(guildUserPermissionsRepo.findByGuildId).toHaveBeenCalledWith(
			'guild_1'
		);
	});

	it('fetches permissions by guild and user', async () => {
		const mockPerms = [{ id: 'perm_1' }] as any;
		vi.mocked(
			guildUserPermissionsRepo.findByGuildAndUser
		).mockReturnValueOnce(mockPerms);

		const result = await service.getByGuildAndUser('guild_1', 'user_1');
		expect(result).toEqual(mockPerms);
		expect(
			guildUserPermissionsRepo.findByGuildAndUser
		).toHaveBeenCalledWith('guild_1', 'user_1');
	});

	it('creates permission when command exists and is unique', async () => {
		const input = {
			guildId: 'guild_1',
			discordUserId: 'user_1',
			commandId: 'cmd_1'
		};
		const mockCreated = { id: 'perm_1', ...input } as any;

		vi.mocked(botCommandsRepo.findById).mockReturnValueOnce({
			id: 'cmd_1'
		} as any);
		vi.mocked(
			guildUserPermissionsRepo.findByGuildUserAndCommand
		).mockReturnValueOnce(undefined as any);
		vi.mocked(guildUserPermissionsRepo.create).mockReturnValueOnce(
			mockCreated
		);

		const result = await service.create(input);
		expect(result).toEqual(mockCreated);
	});

	it('throws not found error when command does not exist during creation', async () => {
		const input = {
			guildId: 'guild_1',
			discordUserId: 'user_1',
			commandId: 'missing'
		};
		vi.mocked(botCommandsRepo.findById).mockReturnValueOnce(
			undefined as any
		);

		await expect(service.create(input)).rejects.toThrow(
			/not found in registry/
		);
	});

	it('throws conflict error when permission already exists during creation', async () => {
		const input = {
			guildId: 'guild_1',
			discordUserId: 'user_1',
			commandId: 'cmd_1'
		};

		vi.mocked(botCommandsRepo.findById).mockReturnValueOnce({
			id: 'cmd_1'
		} as any);
		vi.mocked(
			guildUserPermissionsRepo.findByGuildUserAndCommand
		).mockReturnValueOnce({ id: 'perm_1', ...input } as any);

		await expect(service.create(input)).rejects.toThrow(/already exists/);
	});

	it('updates permission when command exists', async () => {
		const mockUpdated = { id: 'perm_1', commandId: 'cmd_2' } as any;

		vi.mocked(botCommandsRepo.findById).mockReturnValueOnce({
			id: 'cmd_2'
		} as any);
		vi.mocked(guildUserPermissionsRepo.update).mockReturnValueOnce(
			mockUpdated
		);

		const result = await service.update('perm_1', { commandId: 'cmd_2' });
		expect(result).toEqual(mockUpdated);
	});

	it('updates permission when commandId is not provided in input', async () => {
		const mockUpdated = { id: 'perm_1' } as any;

		vi.mocked(guildUserPermissionsRepo.update).mockReturnValueOnce(
			mockUpdated
		);

		const result = await service.update('perm_1', {});
		expect(result).toEqual(mockUpdated);
		expect(botCommandsRepo.findById).not.toHaveBeenCalled();
	});

	it('throws not found error when command does not exist during update', async () => {
		vi.mocked(botCommandsRepo.findById).mockReturnValueOnce(
			undefined as any
		);

		await expect(
			service.update('perm_1', { commandId: 'missing' })
		).rejects.toThrow(/not found in registry/);
	});
});
