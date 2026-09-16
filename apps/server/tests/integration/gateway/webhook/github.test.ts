import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { githubRouter } from '../../../../src/gateway/webhook/github';
import {
	githubAppInstallationsService,
	githubRepositoriesService
} from '@services';
import { webhookDispatcher, ENV } from '@core';

// Mock services using the correct path alias
vi.mock('@services', () => ({
	githubAppInstallationsService: {
		create: vi.fn(),
		getByInstallationId: vi.fn(),
		delete: vi.fn()
	},
	githubRepositoriesService: {
		create: vi.fn(),
		getByRepositoryUrl: vi.fn(),
		delete: vi.fn()
	}
}));

// Mock core using the correct path alias
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
		}
	};
});

// Suppress console logs during tests
vi.mock('../../../../src/gateway/webhook/logger.js', () => ({
	logger: {
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		debug: vi.fn()
	}
}));

describe('GitHub Webhook Gateway (`githubRouter`)', () => {
	const app = new Hono();
	app.route('/', githubRouter);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return 400 if request body is invalid JSON', async () => {
		const res = await app.request('/', {
			method: 'POST',
			headers: {
				'x-github-event': 'installation',
				'content-type': 'application/json'
			},
			body: 'invalid-json-syntax'
		});
		const text = await res.text();
		const body = text.startsWith('{') ? JSON.parse(text) : { error: text };

		expect(res.status).toBe(400);
		expect(body).toEqual(
			expect.objectContaining({
				error: expect.any(String)
			})
		);
	});

	describe('Installation Event', () => {
		it('should handle installation created event with repositories', async () => {
			vi.mocked(githubAppInstallationsService.create).mockResolvedValue({
				id: 10,
				installationId: 12345,
				accountLogin: 'test-user',
				accountType: 'User',
				createdAt: new Date(),
				updatedAt: new Date()
			} as any);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'created',
					installation: {
						id: 12345,
						account: { login: 'test-user', type: 'User' }
					},
					repositories: [{ full_name: 'test-user/repo-one' }]
				})
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({ success: true });
			expect(githubAppInstallationsService.create).toHaveBeenCalledWith({
				installationId: 12345,
				accountLogin: 'test-user',
				accountType: 'User'
			});
			expect(githubRepositoriesService.create).toHaveBeenCalledWith({
				githubAppInstallationId: 10,
				repositoryUrl: 'https://github.com/test-user/repo-one',
				repositoryFullName: 'test-user/repo-one'
			});
		});

		it('should handle repository creation error gracefully during installation created event', async () => {
			vi.mocked(githubAppInstallationsService.create).mockResolvedValue({
				id: 10,
				installationId: 12345,
				accountLogin: 'test-user',
				accountType: 'User',
				createdAt: new Date(),
				updatedAt: new Date()
			} as any);
			vi.mocked(githubRepositoriesService.create).mockRejectedValue(
				new Error('DB Error')
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'created',
					installation: {
						id: 12345,
						account: { login: 'test-user' }
					},
					repositories: [{ full_name: 'test-user/repo-fail' }]
				})
			});

			expect(res.status).toBe(200);
		});

		it('should handle installation deleted event successfully', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue({
				id: 10,
				installationId: 12345
			} as any);
			vi.mocked(githubAppInstallationsService.delete).mockResolvedValue(
				undefined as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'deleted',
					installation: {
						id: 12345,
						account: { login: 'test-user' }
					}
				})
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({ success: true });
			expect(githubAppInstallationsService.delete).toHaveBeenCalledWith(
				10
			);
		});

		it('should handle error thrown during installation deletion lookup/deletion', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockRejectedValue(new Error('Fetch failed'));

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'deleted',
					installation: {
						id: 12345,
						account: { login: 'test-user' }
					}
				})
			});

			expect(res.status).toBe(200);
		});

		it('should handle installation deleted event when record is not found', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue(null as any);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'deleted',
					installation: {
						id: 99999,
						account: { login: 'test-user' }
					}
				})
			});
			const body = await res.json();

			expect(res.status).toBe(200);
			expect(body).toEqual({ success: true });
			expect(githubAppInstallationsService.delete).not.toHaveBeenCalled();
		});
	});

	describe('Installation Repositories Event', () => {
		it('should add repositories when installation_repositories action is added', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue({
				id: 15,
				installationId: 12345
			} as any);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'added',
					installation: { id: 12345 },
					repositories_added: [{ full_name: 'org/new-repo' }]
				})
			});

			expect(res.status).toBe(200);
			expect(githubRepositoriesService.create).toHaveBeenCalledWith({
				githubAppInstallationId: 15,
				repositoryUrl: 'https://github.com/org/new-repo',
				repositoryFullName: 'org/new-repo'
			});
		});

		it('should catch repository creation failure during installation_repositories added sync', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue({
				id: 15,
				installationId: 12345
			} as any);
			vi.mocked(githubRepositoriesService.create).mockRejectedValue(
				new Error('Failed to create repo')
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'added',
					installation: { id: 12345 },
					repositories_added: [{ full_name: 'org/fail-repo' }]
				})
			});

			expect(res.status).toBe(200);
		});

		it('should remove repositories when installation_repositories action is removed', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue({
				id: 15,
				installationId: 12345
			} as any);
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue({
				id: 100,
				repositoryUrl: 'https://github.com/org/old-repo'
			} as any);
			vi.mocked(githubRepositoriesService.delete).mockResolvedValue(
				undefined as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'removed',
					installation: { id: 12345 },
					repositories_removed: [{ full_name: 'org/old-repo' }]
				})
			});

			expect(res.status).toBe(200);
			expect(githubRepositoriesService.delete).toHaveBeenCalledWith(100);
		});

		it('should catch error in repository removal loop during installation_repositories event (Line 104 coverage)', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue({
				id: 15,
				installationId: 12345
			} as any);
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue({
				id: 100,
				repositoryUrl: 'https://github.com/org/old-repo'
			} as any);
			vi.mocked(githubRepositoriesService.delete).mockRejectedValueOnce(
				new Error('Failed to delete repository during removal sync')
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'removed',
					installation: { id: 12345 },
					repositories_removed: [{ full_name: 'org/old-repo' }]
				})
			});

			expect(res.status).toBe(200);
		});

		it('should handle error thrown when removing repositories during repo sync lookup', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue({
				id: 15,
				installationId: 12345
			} as any);
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockRejectedValue(new Error('DB failure'));

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'removed',
					installation: { id: 12345 },
					repositories_removed: [{ full_name: 'org/error-repo' }]
				})
			});

			expect(res.status).toBe(200);
		});

		it('should catch error if getByInstallationId fails during repo sync lookup', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockRejectedValue(new Error('Lookup error'));

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'added',
					installation: { id: 12345 }
				})
			});

			expect(res.status).toBe(200);
		});

		it('should return early if installation record is missing during repo sync', async () => {
			vi.mocked(
				githubAppInstallationsService.getByInstallationId
			).mockResolvedValue(null as any);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'installation_repositories',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'added',
					installation: { id: 12345 }
				})
			});

			expect(res.status).toBe(200);
			expect(githubRepositoriesService.create).not.toHaveBeenCalled();
		});
	});

	describe('Repository Event', () => {
		it('should delete repository on repository deleted event', async () => {
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue({
				id: 42,
				repositoryUrl: 'https://github.com/owner/repo'
			} as any);
			vi.mocked(githubRepositoriesService.delete).mockResolvedValue(
				undefined as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'repository',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'deleted',
					repository: {
						full_name: 'owner/repo',
						html_url: 'https://github.com/owner/repo'
					}
				})
			});

			expect(res.status).toBe(200);
			expect(githubRepositoriesService.delete).toHaveBeenCalledWith(42);
		});

		it('should catch error thrown during repository deletion event handling', async () => {
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockRejectedValue(new Error('Delete lookup error'));

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'repository',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'deleted',
					repository: {
						full_name: 'owner/repo',
						html_url: 'https://github.com/owner/repo'
					}
				})
			});

			expect(res.status).toBe(200);
		});

		it('should update repository on repository renamed event', async () => {
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue({
				id: 55,
				githubAppInstallationId: 3,
				repositoryUrl: 'https://github.com/owner/old-name'
			} as any);
			vi.mocked(githubRepositoriesService.delete).mockResolvedValue(
				undefined as any
			);
			vi.mocked(githubRepositoriesService.create).mockResolvedValue(
				undefined as any
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'repository',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'renamed',
					repository: {
						full_name: 'owner/new-name',
						html_url: 'https://github.com/owner/new-name',
						owner: { login: 'owner' }
					},
					changes: {
						repository: {
							name: { from: 'old-name' }
						}
					}
				})
			});

			expect(res.status).toBe(200);
		});

		it('should catch error when creating new repository fails during rename event (Lines 197-198 & 202 coverage)', async () => {
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockResolvedValue({
				id: 55,
				githubAppInstallationId: 3,
				repositoryUrl: 'https://github.com/owner/old-name'
			} as any);
			vi.mocked(githubRepositoriesService.delete).mockResolvedValue(
				undefined as any
			);
			vi.mocked(githubRepositoriesService.create).mockRejectedValueOnce(
				new Error('Failed to create renamed repository')
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'repository',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'renamed',
					repository: {
						full_name: 'owner/new-name',
						html_url: 'https://github.com/owner/new-name',
						owner: { login: 'owner' }
					},
					changes: {
						repository: {
							name: { from: 'old-name' }
						}
					}
				})
			});

			expect(res.status).toBe(200);
		});

		it('should catch error thrown during repository renamed event handling lookup', async () => {
			vi.mocked(
				githubRepositoriesService.getByRepositoryUrl
			).mockRejectedValue(new Error('Rename lookup error'));

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'repository',
					'content-type': 'application/json'
				},
				body: JSON.stringify({
					action: 'renamed',
					repository: {
						full_name: 'owner/new-name',
						html_url: 'https://github.com/owner/new-name',
						owner: { login: 'owner' }
					},
					changes: {
						repository: {
							name: { from: 'old-name' }
						}
					}
				})
			});

			expect(res.status).toBe(200);
		});
	});

	describe('Unhandled & Muted Events', () => {
		it('should mute security_advisory events', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'security_advisory',
					'content-type': 'application/json'
				},
				body: JSON.stringify({ action: 'published' })
			});

			expect(res.status).toBe(200);
			expect(webhookDispatcher.broadcast).not.toHaveBeenCalled();
		});

		it('should forward unknown/unhandled events to the bot webhook URL', async () => {
			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'push',
					'content-type': 'application/json'
				},
				body: JSON.stringify({ ref: 'refs/heads/main' })
			});

			expect(res.status).toBe(200);
			expect(webhookDispatcher.broadcast).toHaveBeenCalledWith(
				'https://bot.example.com/github',
				'test-secret',
				expect.objectContaining({
					data: {
						eventName: 'push',
						payload: { ref: 'refs/heads/main' }
					}
				})
			);
		});

		it('should catch error if webhookDispatcher.broadcast fails on unhandled events', async () => {
			vi.mocked(webhookDispatcher.broadcast).mockRejectedValue(
				new Error('Broadcast failed')
			);

			const res = await app.request('/', {
				method: 'POST',
				headers: {
					'x-github-event': 'push',
					'content-type': 'application/json'
				},
				body: JSON.stringify({ ref: 'refs/heads/main' })
			});

			expect(res.status).toBe(200);
		});
	});

	it('should handle error block when fetching installation ID for repo sync throws', async () => {
		vi.mocked(
			githubAppInstallationsService.getByInstallationId
		).mockRejectedValue(new Error('Sync error'));

		const res = await app.request('/', {
			method: 'POST',
			headers: {
				'x-github-event': 'installation_repositories',
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				action: 'added',
				installation: { id: 12345 }
			})
		});

		expect(res.status).toBe(200);
	});

	it('should do nothing on repository renamed if changes.repository.name is missing', async () => {
		const res = await app.request('/', {
			method: 'POST',
			headers: {
				'x-github-event': 'repository',
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				action: 'renamed',
				repository: {
					full_name: 'owner/new-name',
					html_url: 'https://github.com/owner/new-name',
					owner: { login: 'owner' }
				},
				changes: {} // missing repository.name changes
			})
		});

		expect(res.status).toBe(200);
		expect(
			githubRepositoriesService.getByRepositoryUrl
		).not.toHaveBeenCalled();
	});

	it('should return 500 if an unhandled top-level exception occurs during event processing', async () => {
		vi.mocked(githubAppInstallationsService.create).mockImplementationOnce(
			() => {
				throw new Error('Catastrophic failure');
			}
		);

		const res = await app.request('/', {
			method: 'POST',
			headers: {
				'x-github-event': 'installation',
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				action: 'created',
				installation: {
					id: 12345,
					account: { login: 'test-user', type: 'User' }
				}
			})
		});

		expect(res.status).toBe(500);
		const body = await res.json();
		expect(body).toEqual({
			success: false,
			error: 'Failed to process webhook event'
		});
	});
});
