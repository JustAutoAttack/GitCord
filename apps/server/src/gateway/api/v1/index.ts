import { OpenAPIHono } from '@hono/zod-openapi';

import { remoteConfigsRouter } from './remote-configs';
import { guildSettingsRouter } from './guild-settings';

export const v1Router = new OpenAPIHono();

v1Router.route('/remote-configs', remoteConfigsRouter);
v1Router.route('/guild-settings', guildSettingsRouter);
