import { OpenAPIHono } from '@hono/zod-openapi';

import * as controller from './controller';
import * as routes from './routes';

export const guildSettingsRouter = new OpenAPIHono();

guildSettingsRouter.openapi(
	routes.listGuildSettingsRoute,
	controller.handleListGuildSettings
);

guildSettingsRouter.openapi(
	routes.getGuildSettingByIdRoute,
	controller.handleGetGuildSettingById
);

guildSettingsRouter.openapi(
	routes.getGuildSettingByGuildRoute,
	controller.handleGetGuildSettingByGuild
);

guildSettingsRouter.openapi(
	routes.getGuildSettingBySystemChannelRoute,
	controller.handleGetGuildSettingBySystemChannel
);

guildSettingsRouter.openapi(
	routes.createGuildSettingRoute,
	controller.handleCreateGuildSetting
);

guildSettingsRouter.openapi(
	routes.updateGuildSettingRoute,
	controller.handleUpdateGuildSetting
);

guildSettingsRouter.openapi(
	routes.deleteGuildSettingRoute,
	controller.handleDeleteGuildSetting
);
