import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BotCommand } from '@domain';
import { botCommandsService } from '../../../src/services';
import { botCommandsRepo } from '../../../src/database';
import { AppError, ErrorCode } from '../../../src/core';

// Mock the database repository while preserving other database exports
vi.mock('../../../src/database', async (importOriginal) => {
	const actual =
		await importOriginal<typeof import('../../../src/database')>();
	return {
		...actual,
		botCommandsRepo: {
			findAll: vi.fn(),
			findById: vi.fn(),
			findByCommandName: vi.fn(),
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

describe('BotCommandsService', () => {
	const mockCommand: BotCommand.Model = {
		id: 'cmd-1',
		commandName: 'ping',
		description: 'Replies with pong',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getByCommandName', () => {
		it('should return the bot command when it exists', async () => {
			vi.mocked(botCommandsRepo.findByCommandName).mockReturnValue(
				mockCommand
			);

			const result = await botCommandsService.getByCommandName('ping');

			expect(botCommandsRepo.findByCommandName).toHaveBeenCalledWith(
				'ping'
			);
			expect(result).toEqual(mockCommand);
		});

		it('should return undefined when the bot command does not exist', async () => {
			vi.mocked(botCommandsRepo.findByCommandName).mockReturnValue(
				undefined
			);

			const result = await botCommandsService.getByCommandName('unknown');

			expect(botCommandsRepo.findByCommandName).toHaveBeenCalledWith(
				'unknown'
			);
			expect(result).toBeUndefined();
		});
	});

	describe('create', () => {
		const createInput: BotCommand.CreateInput = {
			commandName: 'ping',
			description: 'Replies with pong'
		};

		it('should throw an AppError with CONFLICT if a command with the same name already exists', async () => {
			vi.mocked(botCommandsRepo.findByCommandName).mockReturnValue(
				mockCommand
			);

			await expect(
				botCommandsService.create(createInput)
			).rejects.toThrowError(
				expect.objectContaining({
					code: ErrorCode.CONFLICT,
					message: 'Bot command [ping] already exists'
				})
			);

			expect(botCommandsRepo.create).not.toHaveBeenCalled();
		});

		it('should successfully create and return the bot command if it does not exist', async () => {
			vi.mocked(botCommandsRepo.findByCommandName).mockReturnValue(
				undefined
			);
			vi.mocked(botCommandsRepo.create).mockReturnValue(mockCommand);

			const result = await botCommandsService.create(createInput);

			expect(botCommandsRepo.findByCommandName).toHaveBeenCalledWith(
				'ping'
			);
			expect(botCommandsRepo.create).toHaveBeenCalledWith(createInput);
			expect(result).toEqual(mockCommand);
		});
	});
});
