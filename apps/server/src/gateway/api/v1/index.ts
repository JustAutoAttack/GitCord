import { OpenAPIHono } from '@hono/zod-openapi';

import { usersRouter } from './users';
import { userSessionsRouter } from './user-sessions';
import { botCommandsRouter } from './bot-commands';
import { guildSettingsRouter } from './guild-settings';
import { guildUserPermissionsRouter } from './guild-user-permissions';
import { remoteConfigsRouter } from './remote-configs';

export const v1Router = new OpenAPIHono();

v1Router.route('/users', usersRouter);
v1Router.route('/user-sessions', userSessionsRouter);
v1Router.route('/bot-commands', botCommandsRouter);
v1Router.route('/guild-settings', guildSettingsRouter);
v1Router.route('/guild-user-permissions', guildUserPermissionsRouter);
v1Router.route('/remote-configs', remoteConfigsRouter);
