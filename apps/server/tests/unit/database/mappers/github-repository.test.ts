import { describe, it, expect } from 'vitest';
import { githubRepositoryMapper } from '../../../../src/database/mappers/github-repository';
import type { GithubRepositoryRow } from '../../../../src/database/mappers/github-repository';

describe('githubRepositoryMapper', () => {
	const mockRow: GithubRepositoryRow = {
		id: 'repo-id-1',
		githubAppInstallationId: 'inst-1',
		repositoryUrl: 'https://github.com/owner/test-repo',
		repositoryFullName: 'owner/test-repo',
		createdAt: '2026-09-01T00:00:00.000Z',
		updatedAt: '2026-09-01T00:00:00.000Z'
	};

	it('should map database row to domain model correctly', () => {
		const domain = githubRepositoryMapper.toDomain(mockRow);
		expect(domain).toEqual({
			id: 'repo-id-1',
			githubAppInstallationId: 'inst-1',
			repositoryUrl: 'https://github.com/owner/test-repo',
			repositoryFullName: 'owner/test-repo',
			createdAt: '2026-09-01T00:00:00.000Z',
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
	});

	it('should handle toDomainOptional correctly', () => {
		expect(githubRepositoryMapper.toDomainOptional(null)).toBeUndefined();
		expect(
			githubRepositoryMapper.toDomainOptional(undefined)
		).toBeUndefined();
		expect(githubRepositoryMapper.toDomainOptional(mockRow)).toEqual(
			githubRepositoryMapper.toDomain(mockRow)
		);
	});

	it('should map lists of rows correctly', () => {
		const list = githubRepositoryMapper.toDomainList([mockRow]);
		expect(list).toHaveLength(1);
		expect(list[0]?.repositoryFullName).toBe('owner/test-repo');
	});

	it('should map create input to insert payload', () => {
		const insert = githubRepositoryMapper.toInsert({
			githubAppInstallationId: 'inst-1',
			repositoryUrl: 'https://github.com/owner/test-repo',
			repositoryFullName: 'owner/test-repo'
		});
		expect(insert.id).toBeDefined();
		expect(insert.githubAppInstallationId).toBe('inst-1');
		expect(insert.repositoryUrl).toBe('https://github.com/owner/test-repo');
		expect(insert.repositoryFullName).toBe('owner/test-repo');
		expect(insert.createdAt).toBeDefined();
		expect(insert.updatedAt).toBeDefined();
	});

	it('should map update input to partial payload', () => {
		// Test updating repositoryUrl
		const updateUrl = githubRepositoryMapper.toUpdate({
			repositoryUrl: 'https://github.com/owner/new-url'
		});
		expect(updateUrl.repositoryUrl).toBe(
			'https://github.com/owner/new-url'
		);
		expect(updateUrl.repositoryFullName).toBeUndefined();
		expect(updateUrl.updatedAt).toBeDefined();

		// Test updating repositoryFullName
		const updateName = githubRepositoryMapper.toUpdate({
			repositoryFullName: 'owner/new-name'
		});
		expect(updateName.repositoryFullName).toBe('owner/new-name');
		expect(updateName.repositoryUrl).toBeUndefined();
		expect(updateName.updatedAt).toBeDefined();
	});
});
