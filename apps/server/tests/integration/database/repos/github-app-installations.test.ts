import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { GithubAppInstallationsRepo } from '../../../../src/database/repos/github-app-installations';
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

describe('GithubAppInstallationsRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GithubAppInstallationsRepo;

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
            CREATE UNIQUE INDEX idx_github_installations_ext_id ON github_app_installations (installation_id);
        `);

		db = drizzle(sqlite, { schema });
		repo = new GithubAppInstallationsRepo(db as any);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find a GitHub app installation by id and installationId', () => {
		const created = repo.create({
			installationId: 12345,
			accountLogin: 'octocat',
			accountType: 'User'
		});

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.installationId).toBe(12345);
		expect(created.accountLogin).toBe('octocat');
		expect(created.accountType).toBe('User');

		const foundById = repo.findById(created.id);
		expect(foundById).toEqual(created);

		const foundByInstallationId = repo.findByInstallationId(12345);
		expect(foundByInstallationId).toEqual(created);
	});

	it('should return undefined when finding a non-existent installation ID or record ID', () => {
		expect(repo.findById('non-existent-id')).toBeUndefined();
		expect(repo.findByInstallationId(999999)).toBeUndefined();
	});

	it('should retrieve all GitHub app installations via findAll', () => {
		repo.create({
			installationId: 1,
			accountLogin: 'user1',
			accountType: 'User'
		});
		repo.create({
			installationId: 2,
			accountLogin: 'org2',
			accountType: 'Organization'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
		expect(all.map((i) => i.accountLogin)).toContain('user1');
		expect(all.map((i) => i.accountLogin)).toContain('org2');
	});

	it('should update an existing GitHub app installation successfully', async () => {
		const created = repo.create({
			installationId: 54321,
			accountLogin: 'old-login',
			accountType: 'User'
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			accountLogin: 'new-login'
		});

		expect(updated).toBeDefined();
		expect(updated?.accountLogin).toBe('new-login');
		expect(updated?.installationId).toBe(54321);
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		const result = repo.update('fake-id', { accountLogin: 'test' });
		expect(result).toBeUndefined();
	});

	it('should delete an existing GitHub app installation and return the deleted entity', () => {
		const created = repo.create({
			installationId: 98765,
			accountLogin: 'to-delete',
			accountType: 'User'
		});

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);

		const found = repo.findById(created.id);
		expect(found).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		const result = repo.delete('fake-id');
		expect(result).toBeUndefined();
	});

	it('should throw an error on create when installationId unique constraint is violated', () => {
		repo.create({
			installationId: 111,
			accountLogin: 'first',
			accountType: 'User'
		});

		expect(() => {
			repo.create({
				installationId: 111,
				accountLogin: 'duplicate',
				accountType: 'User'
			});
		}).toThrow();
	});
});
