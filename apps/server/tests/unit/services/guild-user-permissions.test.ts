import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GuildUserPermission } from '@domain';
import { guildUserPermissionsService } from '../../../src/services/guild-user-permissions';
import {
	guildUserPermissionsRepo,
	botCommandsRepo
} from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repositories while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
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
			...actual.botCommandsRepo,
			findById: vi.fn()
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

describe('GuildUserPermissionsService', () => {
	const mockPermission: GuildUserPermission.Model = {
		id: 'perm-1',
		guildId: 'guild-1',
		discordUserId: 'user-1',
		commandId: 'cmd-1',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	const mockCommand = {
		id: 'cmd-1',
		commandName: 'ping',
		description: 'Replies with pong'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('list', () => {
		it('should return permissions filtered by guildId when provided', async () => {
			vi.mocked(guildUserPermissionsRepo.findByGuildId).mockReturnValue([
				mockPermission
			]);

			const result = await guildUserPermissionsService.list('guild-1');

			expect(guildUserPermissionsRepo.findByGuildId).toHaveBeenCalledWith(
				'guild-1'
			);
			expect(result).toEqual([mockPermission]);
		});

		it('should return all permissions when guildId is not provided', async () => {
			vi.mocked(guildUserPermissionsRepo.findAll).mockReturnValue([
				mockPermission
			]);

			const result = await guildUserPermissionsService.list();

			expect(guildUserPermissionsRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual([mockPermission]);
		});
	});

	describe('getByGuildAndUser', () => {
		it('should return permissions for a specific user in a guild', async () => {
			vi.mocked(
				guildUserPermissionsRepo.findByGuildAndUser
			).mockReturnValue([mockPermission]);

			const result = await guildUserPermissionsService.getByGuildAndUser(
				'guild-1',
				'user-1'
			);

			expect(
				guildUserPermissionsRepo.findByGuildAndUser
			).toHaveBeenCalledWith('guild-1', 'user-1');
			expect(result).toEqual([mockPermission]);
		});
	});

	describe('create', () => {
		const createInput: GuildUserPermission.CreateInput = {
			guildId: 'guild-1',
			discordUserId: 'user-1',
			commandId: 'cmd-1'
		};

		it('should throw NOT_FOUND if the command does not exist in registry', async () => {
			vi.mocked(botCommandsRepo.findById).mockReturnValue(
				undefined as any
			);

			await expect(
				guildUserPermissionsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.NOT_FOUND,
					message: 'Bot command [ID: cmd-1] not found in registry'
				})
			);

			expect(guildUserPermissionsRepo.create).not.toHaveBeenCalled();
		});

		it('should throw CONFLICT if the permission already exists', async () => {
			vi.mocked(botCommandsRepo.findById).mockReturnValue(
				mockCommand as any
			);
			vi.mocked(
				guildUserPermissionsRepo.findByGuildUserAndCommand
			).mockReturnValue(mockPermission);

			await expect(
				guildUserPermissionsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message:
						'Permission for user [user-1] on command [cmd-1] in guild [guild-1] already exists'
				})
			);

			expect(guildUserPermissionsRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return permission if valid and unique', async () => {
			vi.mocked(botCommandsRepo.findById).mockReturnValue(
				mockCommand as any
			);
			vi.mocked(
				guildUserPermissionsRepo.findByGuildUserAndCommand
			).mockReturnValue(undefined as any);
			vi.mocked(guildUserPermissionsRepo.create).mockReturnValue(
				mockPermission
			);

			const result =
				await guildUserPermissionsService.create(createInput);

			expect(guildUserPermissionsRepo.create).toHaveBeenCalledWith(
				createInput
			);
			expect(result).toEqual(mockPermission);
		});
	});

	describe('update', () => {
		const updateInput: GuildUserPermission.UpdateInput = {
			commandId: 'cmd-new'
		};

		it('should throw NOT_FOUND if the updated command does not exist', async () => {
			vi.mocked(botCommandsRepo.findById).mockReturnValue(
				undefined as any
			);

			await expect(
				guildUserPermissionsService.update('perm-1', updateInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.NOT_FOUND,
					message: 'Bot command [ID: cmd-new] not found in registry'
				})
			);

			expect(guildUserPermissionsRepo.update).not.toHaveBeenCalled();
		});

		it('should successfully update the permission if the command exists', async () => {
			vi.mocked(botCommandsRepo.findById).mockReturnValue(
				mockCommand as any
			);
			vi.mocked(guildUserPermissionsRepo.update).mockReturnValue({
				...mockPermission,
				commandId: 'cmd-new'
			});

			const result = await guildUserPermissionsService.update(
				'perm-1',
				updateInput
			);

			expect(guildUserPermissionsRepo.update).toHaveBeenCalledWith(
				'perm-1',
				updateInput
			);
			expect(result.commandId).toBe('cmd-new');
		});
	});
});
