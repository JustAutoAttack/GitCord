import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@domain';
import { usersService } from '../../../src/services/users';
import { usersRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		usersRepo: {
			findAll: vi.fn(),
			findById: vi.fn(),
			findByDiscordId: vi.fn(),
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

describe('UsersService', () => {
	const mockUser: User.Model = {
		id: 'user-1',
		discordId: 'discord-123',
		displayName: 'TestUser',
		avatarUrl: 'https://example.com/avatar.png',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getByDiscordId', () => {
		it('should return the user when found by Discord ID', async () => {
			vi.mocked(usersRepo.findByDiscordId).mockReturnValue(mockUser);

			const result = await usersService.getByDiscordId('discord-123');

			expect(usersRepo.findByDiscordId).toHaveBeenCalledWith(
				'discord-123'
			);
			expect(result).toEqual(mockUser);
		});

		it('should return null when no user is found by Discord ID', async () => {
			vi.mocked(usersRepo.findByDiscordId).mockReturnValue(
				undefined as any
			);

			const result = await usersService.getByDiscordId('discord-unknown');

			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		const createInput: User.CreateInput = {
			discordId: 'discord-123',
			displayName: 'TestUser',
			avatarUrl: 'https://example.com/avatar.png'
		};

		it('should throw CONFLICT if a user with the same Discord ID already exists', async () => {
			vi.mocked(usersRepo.findByDiscordId).mockReturnValue(mockUser);

			await expect(usersService.create(createInput)).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message: 'User with Discord ID [discord-123] already exists'
				})
			);

			expect(usersRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return the user if they do not exist', async () => {
			vi.mocked(usersRepo.findByDiscordId).mockReturnValue(
				undefined as any
			);
			vi.mocked(usersRepo.create).mockReturnValue(mockUser);

			const result = await usersService.create(createInput);

			expect(usersRepo.create).toHaveBeenCalledWith({
				discordId: 'discord-123',
				displayName: 'TestUser',
				avatarUrl: 'https://example.com/avatar.png'
			});
			expect(result).toEqual(mockUser);
		});

		it('should default avatarUrl to null if omitted in input', async () => {
			const minimalInput: User.CreateInput = {
				discordId: 'discord-123',
				displayName: 'TestUser'
			};

			vi.mocked(usersRepo.findByDiscordId).mockReturnValue(
				undefined as any
			);
			vi.mocked(usersRepo.create).mockReturnValue({
				...mockUser,
				avatarUrl: null
			});

			await usersService.create(minimalInput);

			expect(usersRepo.create).toHaveBeenCalledWith({
				discordId: 'discord-123',
				displayName: 'TestUser',
				avatarUrl: null
			});
		});
	});
});
