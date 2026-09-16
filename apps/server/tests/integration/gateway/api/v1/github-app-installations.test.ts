import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { githubAppInstallationsService } from '@services';
import { errorHandlerMiddleware } from '../../../../../src/core/middleware/error-handler';
import {
	listHandler,
	getByIDHandler,
	getByInstallationIDHandler,
	createHandler,
	updateHandler,
	deleteHandler
} from '../../../../../src/gateway/api/v1/github-app-installations/handlers';
import {
	listRoute,
	getByIDRoute,
	getByInstallationIDRoute,
	createRoute,
	updateRoute,
	deleteRoute
} from '../../../../../src/gateway/api/v1/github-app-installations/routes';

vi.mock('@services', () => ({
	githubAppInstallationsService: {
		list: vi.fn(),
		getById: vi.fn(),
		getByInstallationId: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn()
	}
}));

vi.mock(
	'../../../../src/gateway/api/v1/github-app-installations/logger',
	() => ({
		logger: {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn()
		}
	})
);

describe('GitHub App Installations Handlers', () => {
	const app = new OpenAPIHono();

	app.onError(errorHandlerMiddleware());

	app.openapi(listRoute, listHandler);
	app.openapi(getByIDRoute, getByIDHandler);
	app.openapi(getByInstallationIDRoute, getByInstallationIDHandler);
	app.openapi(createRoute, createHandler);
	app.openapi(updateRoute, updateHandler);
	app.openapi(deleteRoute, deleteHandler);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('GET /', () => {
		it('should list all GitHub app installations', async () => {
			const mockInstallations = [
				{
					id: 'inst_1',
					installationId: 12345678,
					accountLogin: 'gitcord-org',
					accountType: 'Organization'
				}
			];
			vi.mocked(githubAppInstallationsService.list).mockResolvedValue(
				mockInstallations as any
			);

			const res = await app.request('/');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockInstallations);
			expect(githubAppInstallationsService.list).toHaveBeenCalledTimes(1);
		});
	});

	describe('GET /{id}', () => {
		it('should get a GitHub app installation by ID', async () => {
			const mockInstallation = {
				id: 'inst_1',
				installationId: 12345678,
				accountLogin: 'gitcord-org',
				accountType: 'Organization'
			};
			vi.mocked(githubAppInstallationsService.getById).mockResolvedValue(
				mockInstallation as any
			);

			const res = await app.request('/inst_1');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockInstallation);
			expect(githubAppInstallationsService.getById).toHaveBeenCalledWith(
				'inst_1'
			);
		});

		it('should return 404 when GitHub app installation by ID is not found', async () => {
			vi.mocked(githubAppInstallationsService.getById).mockResolvedValue(
				null as any
			);

			const res = await app.request('/inst_nonexistent');
			expect(res.status).toBe(404);
		});
	});

	describe('GET /installation/{installationId}', () => {
		it('should get a GitHub app installation by installation ID', async () => {
			const mockInstallation = {
				id: 'inst_1',
				installationId: 12345678,
				accountLogin: 'gitcord-org',
				accountType: 'Organization'
			};
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue(mockInstallation as any);

			const res = await app.request('/installation/12345678');
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(mockInstallation);
			expect(
				githubAppInstallationsService.getByInstallationId
			).toHaveBeenCalledWith(12345678);
		});

		it('should return 404 when GitHub app installation by installation ID is not found', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue(null as any);

			const res = await app.request('/installation/99999999');
			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		it('should create a GitHub app installation', async () => {
			const newPayload = {
				installationId: 12345678,
				accountLogin: 'gitcord-org',
				accountType: 'Organization'
			};
			const createdInstallation = { id: 'inst_1', ...newPayload };
			vi.mocked(githubAppInstallationsService.create).mockResolvedValue(
				createdInstallation as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(newPayload)
			});
			const body = await res.json();

			expect(res.status).toBe(201);
			expect(body).toEqual(createdInstallation);
			expect(githubAppInstallationsService.create).toHaveBeenCalledWith(
				newPayload
			);
		});
	});

	describe('PATCH /{id}', () => {
		it('should update a GitHub app installation', async () => {
			const updatePayload = { accountLogin: 'updated-org' };
			const updatedInstallation = {
				id: 'inst_1',
				installationId: 12345678,
				accountLogin: 'updated-org',
				accountType: 'Organization'
			};
			vi.mocked(githubAppInstallationsService.update).mockResolvedValue(
				updatedInstallation as any
			);

			const res = await app.request('/inst_1', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(updatePayload)
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual(updatedInstallation);
			expect(githubAppInstallationsService.update).toHaveBeenCalledWith(
				'inst_1',
				updatePayload
			);
		});

		it('should return 404 when updating a non-existent GitHub app installation', async () => {
			vi.mocked(githubAppInstallationsService.update).mockResolvedValue(
				null as any
			);

			const res = await app.request('/inst_nonexistent', {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ accountLogin: 'updated' })
			});

			expect(res.status).toBe(404);
		});
	});

	describe('DELETE /{id}', () => {
		it('should delete a GitHub app installation', async () => {
			vi.mocked(githubAppInstallationsService.delete).mockResolvedValue(
				true as any
			);

			const res = await app.request('/inst_1', {
				method: 'DELETE'
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({
				success: true,
				message: 'GitHub app installation deleted successfully'
			});
			expect(githubAppInstallationsService.delete).toHaveBeenCalledWith(
				'inst_1'
			);
		});

		it('should return 404 when deleting a non-existent GitHub app installation', async () => {
			vi.mocked(githubAppInstallationsService.delete).mockResolvedValue(
				false as any
			);

			const res = await app.request('/inst_nonexistent', {
				method: 'DELETE'
			});

			expect(res.status).toBe(404);
		});
	});
});
