import { sqliteTable, AnySQLiteColumn, uniqueIndex, text, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const users = sqliteTable("users", {
	id: text().primaryKey().notNull(),
	discordId: text("discord_id").notNull(),
	displayName: text("display_name").notNull(),
	avatarUrl: text("avatar_url"),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_users_discord_id").on(table.discordId),
]);

export const userSessions = sqliteTable("user_sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	accessTokenEncrypted: text("access_token_encrypted").notNull(),
	refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
	expiresAt: text("expires_at").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_user_sessions_user_id").on(table.userId),
]);

export const botCommands = sqliteTable("bot_commands", {
	id: text().primaryKey().notNull(),
	commandName: text("command_name").notNull(),
	description: text().notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_bot_commands_name").on(table.commandName),
]);

export const guildUserPermissions = sqliteTable("guild_user_permissions", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	discordUserId: text("discord_user_id").notNull(),
	commandId: text("command_id").notNull().references(() => botCommands.id, { onDelete: "cascade" } ),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_guild_user_perms_unique").on(table.guildId, table.discordUserId, table.commandId),
]);

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

