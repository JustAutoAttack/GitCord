import { sqliteTable, AnySQLiteColumn, uniqueIndex, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const remoteConfigs = sqliteTable("remote_configs", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	repositoryUrl: text("repository_url").notNull(),
	commandChannelId: text("command_channel_id").notNull(),
	notificationChannelId: text("notification_channel_id").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_remote_configs_command_channel_id").on(table.commandChannelId),
	uniqueIndex("idx_remote_configs_guild_repo").on(table.guildId, table.repositoryUrl),
]);

export const guildSettings = sqliteTable("guild_settings", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	systemChannelId: text("system_channel_id").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_guild_settings_system_channel_id").on(table.systemChannelId),
	uniqueIndex("idx_guild_settings_guild_id").on(table.guildId),
]);

