import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GuildRepository } from '@domain';
import { guildRepositoriesService } from '../../../src/services/guild-repositories';
import { guildRepositoriesRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		guildRepositoriesRepo: {
			findAll: vi.fn(),
			findById: vi.fn(),
			findByGuildId: vi.fn(),
			findByGithubRepositoryId: vi.fn(),
			findByCommandChannelId: vi.fn(),
			findByGuildAndGithubRepositoryId: vi.fn(),
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

describe('GuildRepositoriesService', () => {
	const mockRecord: GuildRepository.Model = {
		id: 'g-repo-1',
		guildId: 'guild-1',
		githubRepositoryId: 'repo-1',
		commandChannelId: 'chan-cmd-1',
		notificationChannelId: 'chan-notif-1',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('list', () => {
		it('should return repositories filtered by guildId when provided', async () => {
			vi.mocked(guildRepositoriesRepo.findByGuildId).mockReturnValue([
				mockRecord
			]);

			const result = await guildRepositoriesService.list('guild-1');

			expect(guildRepositoriesRepo.findByGuildId).toHaveBeenCalledWith(
				'guild-1'
			);
			expect(result).toEqual([mockRecord]);
		});

		it('should return repositories filtered by githubRepositoryId when provided', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByGithubRepositoryId
			).mockReturnValue([mockRecord]);

			const result = await guildRepositoriesService.list(
				undefined,
				'repo-1'
			);

			expect(
				guildRepositoriesRepo.findByGithubRepositoryId
			).toHaveBeenCalledWith('repo-1');
			expect(result).toEqual([mockRecord]);
		});

		it('should return all repositories when neither filter is provided', async () => {
			vi.mocked(guildRepositoriesRepo.findAll).mockReturnValue([
				mockRecord
			]);

			const result = await guildRepositoriesService.list();

			expect(guildRepositoriesRepo.findAll).toHaveBeenCalled();
			expect(result).toEqual([mockRecord]);
		});
	});

	describe('getByCommandChannelId', () => {
		it('should return the record when found by command channel ID', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByCommandChannelId
			).mockReturnValue(mockRecord);

			const result =
				await guildRepositoriesService.getByCommandChannelId(
					'chan-cmd-1'
				);

			expect(
				guildRepositoriesRepo.findByCommandChannelId
			).toHaveBeenCalledWith('chan-cmd-1');
			expect(result).toEqual(mockRecord);
		});

		it('should return null when no record is found by command channel ID', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByCommandChannelId
			).mockReturnValue(undefined as any);

			const result =
				await guildRepositoriesService.getByCommandChannelId(
					'chan-unknown'
				);

			expect(result).toBeNull();
		});
	});

	describe('getByGuildAndGithubRepositoryId', () => {
		it('should return the record when found by both guild and repo ID', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByGuildAndGithubRepositoryId
			).mockReturnValue(mockRecord);

			const result =
				await guildRepositoriesService.getByGuildAndGithubRepositoryId(
					'guild-1',
					'repo-1'
				);

			expect(
				guildRepositoriesRepo.findByGuildAndGithubRepositoryId
			).toHaveBeenCalledWith('guild-1', 'repo-1');
			expect(result).toEqual(mockRecord);
		});
	});

	describe('create', () => {
		const createInput: GuildRepository.CreateInput = {
			guildId: 'guild-1',
			githubRepositoryId: 'repo-1',
			commandChannelId: 'chan-cmd-1',
			notificationChannelId: 'chan-notif-1'
		};

		it('should throw CONFLICT if the command channel is already bound', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByCommandChannelId
			).mockReturnValue(mockRecord);

			await expect(
				guildRepositoriesService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message:
						'Command channel [chan-cmd-1] is already bound to a repository subscription.'
				})
			);

			expect(guildRepositoriesRepo.create).not.toHaveBeenCalled();
		});

		it('should throw CONFLICT if the guild is already subscribed to the GitHub repository', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByCommandChannelId
			).mockReturnValue(null as any);
			vi.mocked(
				guildRepositoriesRepo.findByGuildAndGithubRepositoryId
			).mockReturnValue(mockRecord);

			await expect(
				guildRepositoriesService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message:
						'Guild [guild-1] is already subscribed to this GitHub repository.'
				})
			);

			expect(guildRepositoriesRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create the subscription if no conflicts exist', async () => {
			vi.mocked(
				guildRepositoriesRepo.findByCommandChannelId
			).mockReturnValue(null as any);
			vi.mocked(
				guildRepositoriesRepo.findByGuildAndGithubRepositoryId
			).mockReturnValue(null as any);
			vi.mocked(guildRepositoriesRepo.create).mockReturnValue(mockRecord);

			const result = await guildRepositoriesService.create(createInput);

			expect(guildRepositoriesRepo.create).toHaveBeenCalledWith({
				guildId: 'guild-1',
				githubRepositoryId: 'repo-1',
				commandChannelId: 'chan-cmd-1',
				notificationChannelId: 'chan-notif-1'
			});
			expect(result).toEqual(mockRecord);
		});
	});
});
