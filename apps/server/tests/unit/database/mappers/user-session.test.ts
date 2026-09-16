import { describe, it, expect } from 'vitest';
import { userSessionMapper } from '../../../../src/database/mappers/user-session';
import type { UserSessionRow } from '../../../../src/database/mappers/user-session';

describe('userSessionMapper', () => {
	const mockRow: UserSessionRow = {
		id: 'session-id-1',
		userId: 'user-id-1',
		accessTokenEncrypted: 'enc-access',
		refreshTokenEncrypted: 'enc-refresh',
		expiresAt: '2026-10-01T00:00:00.000Z',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = userSessionMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'session-id-1',
			userId: 'user-id-1',
			accessTokenEncrypted: 'enc-access',
			refreshTokenEncrypted: 'enc-refresh',
			expiresAt: '2026-10-01T00:00:00.000Z',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(userSessionMapper.toDomainOptional(null)).toBeUndefined();
		expect(userSessionMapper.toDomainOptional(undefined)).toBeUndefined();
		expect(userSessionMapper.toDomainOptional(mockRow)).toEqual(
			userSessionMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = userSessionMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.userId).toBe('user-id-1');
	});

	it('should map create input to insert payload', () => {
		const insert = userSessionMapper.toInsert({
			userId: 'user-id-1',
			accessTokenEncrypted: 'enc-access',
			refreshTokenEncrypted: 'enc-refresh',
			expiresAt: '2026-10-01T00:00:00.000Z'
		});
		expect(insert.id).toBeDefined();
		expect(insert.userId).toBe('user-id-1');
		expect(insert.accessTokenEncrypted).toBe('enc-access');
		expect(insert.refreshTokenEncrypted).toBe('enc-refresh');
		expect(insert.expiresAt).toBe('2026-10-01T00:00:00.000Z');
		expect(insert.createdAt).toBeDefined();
		expect(insert.updatedAt).toBeDefined();
	});

	it('should map update input to partial payload covering all branches', () => {
		const updateUser = userSessionMapper.toUpdate({ userId: 'user-id-2' });
		expect(updateUser.userId).toBe('user-id-2');
		expect(updateUser.updatedAt).toBeDefined();

		const updateAccess = userSessionMapper.toUpdate({
			accessTokenEncrypted: 'new-access'
		});
		expect(updateAccess.accessTokenEncrypted).toBe('new-access');

		const updateRefresh = userSessionMapper.toUpdate({
			refreshTokenEncrypted: 'new-refresh'
		});
		expect(updateRefresh.refreshTokenEncrypted).toBe('new-refresh');

		const updateExpires = userSessionMapper.toUpdate({
			expiresAt: '2026-11-01T00:00:00.000Z'
		});
		expect(updateExpires.expiresAt).toBe('2026-11-01T00:00:00.000Z');
	});
});
