import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AppError, ENV, webhookDispatcher } from '@core';
import { BaseService, BaseRepo } from '@services/base';

// Mock core dependencies
vi.mock('@core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@core')>();
	return {
		...actual,
		webhookDispatcher: {
			broadcast: vi.fn()
		},
		ENV: {
			...actual.ENV,
			BOT_WEBHOOK_URL: 'https://bot.example.com',
			BOT_WEBHOOK_SECRET: 'test-secret'
		},
		appLogger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	};
});

class MockRepository implements BaseRepo<any, any, string> {
	findAll = vi.fn();
	findById = vi.fn();
	create = vi.fn();
	update = vi.fn();
	delete = vi.fn();
}

describe('BaseService', () => {
	let mockRepo: MockRepository;
	let service: BaseService<any, any, any, MockRepository>;
	let serviceWithoutTable: BaseService<any, any, any, MockRepository>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockRepo = new MockRepository();
		service = new BaseService(mockRepo, 'TestEntity', 'test_table' as any);
		serviceWithoutTable = new BaseService(mockRepo, 'TestEntity');
	});

	describe('list', () => {
		it('should return all records', async () => {
			const mockRecords = [{ id: '1' }, { id: '2' }];
			mockRepo.findAll.mockResolvedValue(mockRecords);

			const result = await service.list();
			expect(result).toEqual(mockRecords);
			expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
		});
	});

	describe('getById', () => {
		it('should return record if found', async () => {
			const mockRecord = { id: '1' };
			mockRepo.findById.mockResolvedValue(mockRecord);

			const result = await service.getById('1');
			expect(result).toEqual(mockRecord);
			expect(mockRepo.findById).toHaveBeenCalledWith('1');
		});

		it('should return null if record is not found and log warning', async () => {
			mockRepo.findById.mockResolvedValue(null);

			const result = await service.getById('999');
			expect(result).toBeNull();
		});
	});

	describe('create', () => {
		it('should create a record and dispatch table update webhook', async () => {
			const newRecord = { id: '10', name: 'New' };
			mockRepo.create.mockResolvedValue(newRecord);

			const result = await service.create({ name: 'New' });
			expect(result).toEqual(newRecord);
			expect(webhookDispatcher.broadcast).toHaveBeenCalledWith(
				'https://bot.example.com/table-update',
				'test-secret',
				expect.objectContaining({
					data: {
						tableName: 'test_table',
						action: 'CREATE',
						recordId: '10',
						record: newRecord
					}
				})
			);
		});

		it('should handle creation when returned object lacks an id (fallback to unknown)', async () => {
			const newRecord = { name: 'No ID' };
			mockRepo.create.mockResolvedValue(newRecord);

			await service.create({ name: 'No ID' });
			expect(webhookDispatcher.broadcast).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(String),
				expect.objectContaining({
					data: expect.objectContaining({
						recordId: 'unknown'
					})
				})
			);
		});
	});

	describe('update', () => {
		it('should update a record and dispatch table update webhook', async () => {
			const updatedRecord = { id: '1', name: 'Updated' };
			mockRepo.update.mockResolvedValue(updatedRecord);

			const result = await service.update('1', { name: 'Updated' });
			expect(result).toEqual(updatedRecord);
			expect(webhookDispatcher.broadcast).toHaveBeenCalledWith(
				'https://bot.example.com/table-update',
				'test-secret',
				expect.objectContaining({
					data: {
						tableName: 'test_table',
						action: 'UPDATE',
						recordId: '1',
						record: updatedRecord
					}
				})
			);
		});

		it('should throw NOT_FOUND AppError if update target does not exist', async () => {
			mockRepo.update.mockResolvedValue(null);

			await expect(
				service.update('999', { name: 'Fail' })
			).rejects.toThrow(AppError);
		});
	});

	describe('delete', () => {
		it('should delete a record and dispatch table update webhook', async () => {
			mockRepo.delete.mockResolvedValue(true);

			const result = await service.delete('1');
			expect(result).toBe(true);
			expect(webhookDispatcher.broadcast).toHaveBeenCalledWith(
				'https://bot.example.com/table-update',
				'test-secret',
				expect.objectContaining({
					data: {
						tableName: 'test_table',
						action: 'DELETE',
						recordId: '1',
						record: null
					}
				})
			);
		});

		it('should throw NOT_FOUND AppError if delete target does not exist', async () => {
			mockRepo.delete.mockResolvedValue(false);

			await expect(service.delete('999')).rejects.toThrow(AppError);
		});
	});

	describe('dispatchTableUpdate branching & error handling (Lines 68, 84-89 coverage)', () => {
		it('should return early if tableName is not defined', async () => {
			mockRepo.create.mockResolvedValue({ id: '1' });

			await serviceWithoutTable.create({ name: 'test' });
			expect(webhookDispatcher.broadcast).not.toHaveBeenCalled();
		});

		it('should return early if ENV webhook credentials are missing', async () => {
			const originalUrl = ENV.BOT_WEBHOOK_URL;
			(ENV as any).BOT_WEBHOOK_URL = undefined;

			mockRepo.create.mockResolvedValue({ id: '1' });
			await service.create({ name: 'test' });
			expect(webhookDispatcher.broadcast).not.toHaveBeenCalled();

			(ENV as any).BOT_WEBHOOK_URL = originalUrl;
		});

		it('should catch and log error if webhook broadcast fails (Lines 84-89 coverage)', async () => {
			mockRepo.create.mockResolvedValue({ id: '1' });
			vi.mocked(webhookDispatcher.broadcast).mockRejectedValueOnce(
				new Error('Network connection timeout')
			);

			// Should complete successfully despite the broadcast failure (handled in catch block)
			const result = await service.create({ name: 'test' });
			expect(result).toEqual({ id: '1' });
			expect(webhookDispatcher.broadcast).toHaveBeenCalledTimes(1);
		});
	});
});
