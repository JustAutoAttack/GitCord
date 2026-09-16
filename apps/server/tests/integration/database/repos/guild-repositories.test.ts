import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { GuildRepositoriesRepo } from '../../../../src/database/repos/guild-repositories';
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

describe('GuildRepositoriesRepo', () => {
	let sqlite: Database.Database;
	let db: ReturnType<typeof drizzle>;
	let repo: GuildRepositoriesRepo;
	let parentRepoId: string;

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

            CREATE TABLE guild_repositories (
                id TEXT PRIMARY KEY NOT NULL,
                guild_id TEXT NOT NULL,
                github_repository_id TEXT NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
                command_channel_id TEXT NOT NULL,
                notification_channel_id TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE UNIQUE INDEX idx_guild_repositories_command_channel_id ON guild_repositories (command_channel_id);
            CREATE UNIQUE INDEX idx_guild_repositories_guild_repo ON guild_repositories (guild_id, github_repository_id);
        `);

		db = drizzle(sqlite, { schema });
		repo = new GuildRepositoriesRepo(db as any);

		// Seed parent installation and parent GitHub repository for foreign keys
		const instId = 'inst-uuid-1';
		parentRepoId = 'repo-uuid-1';
		const now = new Date().toISOString();

		sqlite
			.prepare(
				`
            INSERT INTO github_app_installations (id, installation_id, account_login, account_type, updated_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `
			)
			.run(instId, 123, 'owner', 'User', now, now);

		sqlite
			.prepare(
				`
            INSERT INTO github_repositories (id, github_app_installation_id, repository_url, repository_full_name, updated_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `
			)
			.run(
				parentRepoId,
				instId,
				'https://github.com/owner/repo',
				'owner/repo',
				now,
				now
			);
	});

	afterEach(() => {
		sqlite.close();
	});

	it('should create and find guild repository by various custom finder methods', () => {
		const created = repo.create({
			guildId: 'guild-123',
			githubRepositoryId: parentRepoId,
			commandChannelId: 'chan-cmd-1',
			notificationChannelId: 'chan-notif-1'
		});

		expect(created).toBeDefined();
		expect(created.id).toBeDefined();
		expect(created.guildId).toBe('guild-123');

		// Test custom finders
		expect(repo.findById(created.id)).toEqual(created);
		expect(repo.findByCommandChannelId('chan-cmd-1')).toEqual(created);
		expect(
			repo.findByGuildAndGithubRepositoryId('guild-123', parentRepoId)
		).toEqual(created);
		expect(repo.findByGuildId('guild-123')).toEqual([created]);
		expect(repo.findByGithubRepositoryId(parentRepoId)).toEqual([created]);
	});

	it('should return undefined or empty arrays when custom finders miss', () => {
		expect(repo.findByCommandChannelId('fake-chan')).toBeUndefined();
		expect(
			repo.findByGuildAndGithubRepositoryId('fake-guild', parentRepoId)
		).toBeUndefined();
		expect(repo.findByGuildId('fake-guild')).toEqual([]);
		expect(repo.findByGithubRepositoryId('fake-repo')).toEqual([]);
	});

	it('should retrieve all guild repositories via findAll', () => {
		repo.create({
			guildId: 'guild-1',
			githubRepositoryId: parentRepoId,
			commandChannelId: 'cmd-chan-1',
			notificationChannelId: 'notif-chan-1'
		});
		repo.create({
			guildId: 'guild-2',
			githubRepositoryId: parentRepoId,
			commandChannelId: 'cmd-chan-2',
			notificationChannelId: 'notif-chan-2'
		});

		const all = repo.findAll();
		expect(all).toHaveLength(2);
	});

	it('should update an existing guild repository successfully', async () => {
		const created = repo.create({
			guildId: 'guild-abc',
			githubRepositoryId: parentRepoId,
			commandChannelId: 'cmd-chan-abc',
			notificationChannelId: 'notif-chan-abc'
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const updated = repo.update(created.id, {
			notificationChannelId: 'notif-chan-updated'
		});

		expect(updated).toBeDefined();
		expect(updated?.notificationChannelId).toBe('notif-chan-updated');
		expect(updated?.updatedAt).not.toBe(created.updatedAt);
	});

	it('should return undefined when updating a non-existent record', () => {
		expect(
			repo.update('fake-id', { commandChannelId: 'test' })
		).toBeUndefined();
	});

	it('should delete an existing guild repository and return the deleted entity', () => {
		const created = repo.create({
			guildId: 'guild-del',
			githubRepositoryId: parentRepoId,
			commandChannelId: 'cmd-chan-del',
			notificationChannelId: 'notif-chan-del'
		});

		const deleted = repo.delete(created.id);
		expect(deleted).toEqual(created);
		expect(repo.findById(created.id)).toBeUndefined();
	});

	it('should return undefined when deleting a non-existent record', () => {
		expect(repo.delete('fake-id')).toBeUndefined();
	});

	it('should enforce unique index constraints on commandChannelId and guild/repo pair', () => {
		repo.create({
			guildId: 'guild-1',
			githubRepositoryId: parentRepoId,
			commandChannelId: 'shared-chan',
			notificationChannelId: 'notif-1'
		});

		// Duplicate commandChannelId constraint violation
		expect(() => {
			repo.create({
				guildId: 'guild-2',
				githubRepositoryId: parentRepoId,
				commandChannelId: 'shared-chan',
				notificationChannelId: 'notif-2'
			});
		}).toThrow();
	});
});
