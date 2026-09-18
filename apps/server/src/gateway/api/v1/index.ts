import { OpenAPIHono } from '@hono/zod-openapi';

import { authRouter } from './auth';
import { integrationsRouter } from './integrations';
import { usersRouter } from './users';
import { userSessionsRouter } from './user-sessions';
import { discordSessionsRouter } from './discord-sessions';
import { botCommandsRouter } from './bot-commands';
import { githubAppInstallationsRouter } from './github-app-installations';
import { guildRepositoriesRouter } from './guild-repositories';
import { guildSettingsRouter } from './guild-settings';
import { guildUserPermissionsRouter } from './guild-user-permissions';
import { githubRepositoriesRouter } from './github-repositories';

export const v1Router = new OpenAPIHono();

v1Router.route('/auth', authRouter);
v1Router.route('/integrations', integrationsRouter);
v1Router.route('/users', usersRouter);
v1Router.route('/user-sessions', userSessionsRouter);
v1Router.route('/discord-sessions', discordSessionsRouter);
v1Router.route('/bot-commands', botCommandsRouter);
v1Router.route('/github-app-installations', githubAppInstallationsRouter);
v1Router.route('/github-repositories', githubRepositoriesRouter);
v1Router.route('/guild-repositories', guildRepositoriesRouter);
v1Router.route('/guild-settings', guildSettingsRouter);
v1Router.route('/guild-user-permissions', guildUserPermissionsRouter);
