import { describe, it, expect, afterAll, beforeEach } from 'vitest';
import { createApp } from '@app';
import { db } from '@database/client';
import { repoConfigs } from '@database/generated';
import { sql } from 'drizzle-orm';

describe('Repository Configuration End-to-End Workflow', () => {
	const app = createApp();
	const testGuildId = '987654321098765432';
	const payload = {
		guildId: testGuildId,
		repositoryUrl: 'https://github.com/gitcord-org/core-service',
		commandChannelId: '111222333444555666',
		notificationChannelId: '777888999000111222'
	};

	beforeEach(async () => {
		// Clear repository configurations table before each test run
		await db.delete(repoConfigs).execute();
	});

	afterAll(async () => {
		// Clean up repository configurations table after suite execution
		await db.delete(repoConfigs).execute();
	});

	describe('System Startup and Health Integration', () => {
		// Verify health endpoint returns healthy status and database connectivity check
		it('reports healthy system status through integrated gateway and database check', async () => {
			const res = await app.request('/health');
			const body = (await res.json()) as any;

			expect(res.status).toBe(200);
			expect(body).toMatchObject({
				status: 'HEALTHY',
				checks: {
					database: { status: 'up' }
				}
			});
		});
	});

	describe('Complete CRUD Lifecycle Flow', () => {
		// Verify complete CRUD lifecycle including registration, database persistence, retrieval, and conflict handling
		it('allows a user to register, retrieve, and handle constraint conflicts for repository configurations', async () => {
			// Step 1: Register a new repository configuration via the API Gateway POST endpoint
			const createRes = await app.request('/api/v1/repo-configs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const createBody = (await createRes.json()) as any;
			expect(createRes.status).toBe(201);
			expect(createBody).toMatchObject({
				guildId: testGuildId,
				repositoryUrl: payload.repositoryUrl
			});

			const createdId = createBody.id;
			expect(createdId).toBeDefined();

			// Step 2: Verify database persistence directly using Drizzle ORM
			const dbRecords = await db
				.select()
				.from(repoConfigs)
				.where(sql`${repoConfigs.guildId} = ${testGuildId}`)
				.execute();

			expect(dbRecords).toHaveLength(1);
			const record = dbRecords[0];
			expect(record).toBeDefined();
			expect(record!.repositoryUrl).toBe(payload.repositoryUrl);

			// Step 3: Retrieve the created configuration via the API Gateway GET endpoint
			const getRes = await app.request(
				`/api/v1/repo-configs/${createdId}`
			);
			const getBody = (await getRes.json()) as any;

			expect(getRes.status).toBe(200);
			expect(getBody.commandChannelId).toBe(payload.commandChannelId);

			// Step 4: Verify unique constraint handling by attempting duplicate registration for the guild
			const duplicateRes = await app.request('/api/v1/repo-configs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...payload,
					repositoryUrl: 'https://github.com/gitcord-org/another-repo'
				})
			});

			expect([400, 409, 500]).toContain(duplicateRes.status);
		});

		// Verify that querying a non-existent configuration ID returns a 404 error response
		it('returns 404 when querying non-existent configuration ID', async () => {
			const res = await app.request(
				'/api/v1/repo-configs/cfg_nonexistent000'
			);
			expect(res.status).toBe(404);

			const body = (await res.json()) as any;
			expect(body.success).toBe(false);
		});
	});
});
