import { describe, it, expect } from 'vitest';
import { githubAppInstallationMapper } from '../../../../src/database/mappers/github-app-installation';
import type { GithubAppInstallationRow } from '../../../../src/database/mappers/github-app-installation';

describe('githubAppInstallationMapper', () => {
	const mockRow: GithubAppInstallationRow = {
		id: 'inst-id-1',
		installationId: 123456,
		accountLogin: 'test-org',
		accountType: 'Organization',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = githubAppInstallationMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'inst-id-1',
			installationId: 123456,
			accountLogin: 'test-org',
			accountType: 'Organization',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(
			githubAppInstallationMapper.toDomainOptional(null)
		).toBeUndefined();
		expect(
			githubAppInstallationMapper.toDomainOptional(undefined)
		).toBeUndefined();
		expect(githubAppInstallationMapper.toDomainOptional(mockRow)).toEqual(
			githubAppInstallationMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = githubAppInstallationMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.accountLogin).toBe('test-org');
	});

	it('should map create input to insert payload', () => {
		const insert = githubAppInstallationMapper.toInsert({
			installationId: 123456,
			accountLogin: 'test-org',
			accountType: 'Organization'
		});
		expect(insert.id).toBeDefined();
		expect(insert.installationId).toBe(123456);
		expect(insert.accountLogin).toBe('test-org');
		expect(insert.accountType).toBe('Organization');
		expect(insert.createdAt).toBeDefined();
		expect(insert.updatedAt).toBeDefined();
	});

	it('should map update input to partial payload', () => {
		// Test updating accountLogin only
		const updateLogin = githubAppInstallationMapper.toUpdate({
			accountLogin: 'new-org'
		});
		expect(updateLogin.accountLogin).toBe('new-org');
		expect(updateLogin.accountType).toBeUndefined();
		expect(updateLogin.updatedAt).toBeDefined();

		// Test updating accountType only (ensures branch coverage for all optional update fields)
		const updateType = githubAppInstallationMapper.toUpdate({
			accountType: 'User'
		});
		expect(updateType.accountType).toBe('User');
		expect(updateType.accountLogin).toBeUndefined();
		expect(updateType.updatedAt).toBeDefined();
	});
});
