import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersRepo } from '@database';
import { UsersService } from '@services/users';

vi.mock('@database', () => ({
	usersRepo: {
		findAll: vi.fn(),
		findById: vi.fn(),
		findByDiscordId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

describe('UsersService', () => {
	let service: UsersService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new UsersService();
	});

	it('returns a user by discord id', async () => {
		const mockUser = { id: 'usr_1', discordId: 'discord_123' } as any;
		vi.mocked(usersRepo.findByDiscordId).mockReturnValueOnce(mockUser);

		const result = await service.getByDiscordId('discord_123');
		expect(result).toEqual(mockUser);
	});

	it('creates a user successfully', async () => {
		const input = { discordId: 'discord_123', displayName: 'TestUser' };
		const mockCreated = { id: 'usr_1', avatarUrl: null, ...input } as any;

		vi.mocked(usersRepo.findByDiscordId).mockReturnValueOnce(
			undefined as any
		);
		vi.mocked(usersRepo.create).mockReturnValueOnce(mockCreated);

		const result = await service.create(input);
		expect(result).toEqual(mockCreated);
		expect(usersRepo.create).toHaveBeenCalledWith(
			expect.objectContaining({ avatarUrl: null })
		);
	});

	it('throws conflict error when user with discord id already exists', async () => {
		const input = { discordId: 'discord_123', displayName: 'TestUser' };
		vi.mocked(usersRepo.findByDiscordId).mockReturnValueOnce({
			id: 'usr_1'
		} as any);

		await expect(service.create(input)).rejects.toThrow(/already exists/);
	});
});
