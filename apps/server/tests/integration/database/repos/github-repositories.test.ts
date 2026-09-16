import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { GithubRepositoriesRepo } from '../../../../src/database/repos/github-repositories';
import * as schema from '../../../../src/database/generated/schema';

// Mock database logger
vi.mock('../../../../src/database/logger', () => ({
	logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn()
	}
}));

describe('GithubRepositoriesRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GithubRepositoriesRepo;
	let parentInstallationId: string;

	beforeEach(() => {
		vi.clearAllMocks();
		sqlite = new Database(':memory:');
		sqlite.pragma('foreign_keys = ON');

		sqlite.exec(`
            CREATE TABLE github_app_installations (
                id TEXT PRIMARY KEY NOT NULL,
                installation_id INTEGER NOT NULL,
                account_login TEXT NOT NULL,
                account_type TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE github_repositories (
                id TEXT PRIMARY KEY NOT NULL,
                github_app_installation_id TEXT NOT NULL REFERENCES github_app_installations(id) ON DELETE CASCADE,
                repository_url TEXT NOT NULL,
                repository_full_name TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE UNIQUE INDEX idx_github_repositories_repos_url ON github_repositories (repository_url);
        `);

		db = drizzle(sqlite, { schema });
		repo = new GithubRepositoriesRepo(db as any);

		// Insert a valid parent record for foreign key relationships
		parentInstallationId = 'inst-uuid-123';
		sqlite
			.prepare(
				`
            INSERT INTO github_app_installations (id, installation_id, account_login, account_type, updated_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `
			)
			.run(
				parentInstallationId,
				999,
				'test-owner',
				'User',
				new Date().toISOString(),
				new Date().toISOString()
			);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find a GitHub repository by id, repositoryUrl, and githubAppInstallationId', () => {
		const created = repo.create({
			githubAppInstallationId: parentInstallationId,
			repositoryUrl: 'https://github.com/test-owner/test-repo',
			repositoryFullName: 'test-owner/test-repo'
		});

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.repositoryUrl).toBe(
			'https://github.com/test-owner/test-repo'
		);

		const foundById = repo.findById(created.id);
		expect(foundById).toEqual(created);

		const foundByUrl = repo.findByRepositoryUrl(
			'https://github.com/test-owner/test-repo'
		);
		expect(foundByUrl).toEqual(created);

		const foundByInstallation =
			repo.findByGithubAppInstallationId(parentInstallationId);
		expect(foundByInstallation).toHaveLength(1);
		expect(foundByInstallation[0]).toEqual(created);
	});

	it('should return undefined or empty arrays when records are not found', () => {
		expect(repo.findById('fake-id')).toBeUndefined();
		expect(
			repo.findByRepositoryUrl('https://github.com/missing/repo')
		).toBeUndefined();
		expect(
			repo.findByGithubAppInstallationId('fake-installation-id')
		).toEqual([]);
	});

	it('should retrieve all GitHub repositories via findAll', () => {
		repo.create({
			githubAppInstallationId: parentInstallationId,
			repositoryUrl: 'https://github.com/owner/repo1',
			repositoryFullName: 'owner/repo1'
		});
		repo.create({
			githubAppInstallationId: parentInstallationId,
			repositoryUrl: 'https://github.com/owner/repo2',
			repositoryFullName: 'owner/repo2'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
	});

	it('should update an existing GitHub repository successfully', async () => {
		const created = repo.create({
			githubAppInstallationId: parentInstallationId,
			repositoryUrl: 'https://github.com/owner/old-name',
			repositoryFullName: 'owner/old-name'
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			repositoryFullName: 'owner/new-name'
		});

		expect(updated).toBeDefined();
		expect(updated?.repositoryFullName).toBe('owner/new-name');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		const result = repo.update('fake-id', { repositoryFullName: 'test' });
		expect(result).toBeUndefined();
	});

	it('should delete an existing GitHub repository and return the deleted entity', () => {
		const created = repo.create({
			githubAppInstallationId: parentInstallationId,
			repositoryUrl: 'https://github.com/owner/del-repo',
			repositoryFullName: 'owner/del-repo'
		});

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);
		expect(repo.findById(created.id)).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		expect(repo.delete('fake-id')).toBeUndefined();
	});

	it('should throw an error on create when repositoryUrl unique constraint is violated', () => {
		repo.create({
			githubAppInstallationId: parentInstallationId,
			repositoryUrl: 'https://github.com/owner/same-url',
			repositoryFullName: 'owner/repo1'
		});

		expect(() => {
			repo.create({
				githubAppInstallationId: parentInstallationId,
				repositoryUrl: 'https://github.com/owner/same-url',
				repositoryFullName: 'owner/repo2'
			});
		}).toThrow();
	});
});
