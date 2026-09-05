import { createRoute, z } from '@hono/zod-openapi';

import { response } from '@gateway/utils';
import {
	CommandChannelParamSchema,
	CreateRepoConfigSchema,
	RepoConfigActionResponseSchema,
	RepoConfigParamSchema,
	RepoConfigSchema,
	UpdateRepoConfigSchema
} from './schemas';

export const listRepoConfigsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Repo Configurations'],
	summary: 'List repository configurations',
	description: 'Returns all repository configurations.',
	responses: {
		200: response('Repository configurations', z.array(RepoConfigSchema))
	}
});

export const getRepoConfigByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Repo Configurations'],
	summary: 'Get repository configuration',
	description: 'Returns a repository configuration by ID.',
	request: {
		params: RepoConfigParamSchema
	},
	responses: {
		200: response('Repository configuration', RepoConfigSchema),
		404: response('Repository configuration not found')
	}
});

export const getRepoConfigByCommandChannelRoute = createRoute({
	method: 'get',
	path: '/command-channel/{commandChannelId}',
	tags: ['Repo Configurations'],
	summary: 'Get repository configuration by command channel',
	description:
		'Returns the repository configuration associated with a command channel.',
	request: {
		params: CommandChannelParamSchema
	},
	responses: {
		200: response('Repository configuration', RepoConfigSchema),
		404: response('Repository configuration not found')
	}
});

export const createRepoConfigRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Repo Configurations'],
	summary: 'Create repository configuration',
	description: 'Creates a new repository configuration.',
	request: {
		body: {
			required: true,
			content: {
				'application/json': {
					schema: CreateRepoConfigSchema
				}
			}
		}
	},
	responses: {
		201: response('Repository configuration created', RepoConfigSchema),
		400: response('Invalid request')
	}
});

export const updateRepoConfigRoute = createRoute({
	method: 'patch',
	path: '/{id}',
	tags: ['Repo Configurations'],
	summary: 'Update repository configuration',
	description: 'Updates an existing repository configuration.',
	request: {
		params: RepoConfigParamSchema,
		body: {
			required: true,
			content: {
				'application/json': {
					schema: UpdateRepoConfigSchema
				}
			}
		}
	},
	responses: {
		200: response('Repository configuration updated', RepoConfigSchema),
		400: response('Invalid request'),
		404: response('Repository configuration not found')
	}
});

export const deleteRepoConfigRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Repo Configurations'],
	summary: 'Delete repository configuration',
	description: 'Deletes an existing repository configuration.',
	request: {
		params: RepoConfigParamSchema
	},
	responses: {
		200: response(
			'Repository configuration deleted',
			RepoConfigActionResponseSchema
		),
		404: response('Repository configuration not found')
	}
});
