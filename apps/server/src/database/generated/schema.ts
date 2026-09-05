import { sqliteTable, AnySQLiteColumn, uniqueIndex, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const repoConfigs = sqliteTable("repo_configs", {
	id: text().primaryKey().notNull(),
	guildId: text("guild_id").notNull(),
	commandChannelId: text("command_channel_id").notNull(),
	notificationChannelId: text("notification_channel_id").notNull(),
	updatedAt: text("updated_at").notNull(),
	createdAt: text("created_at").notNull(),
},
(table) => [
	uniqueIndex("idx_repo_configs_command_channel_id").on(table.commandChannelId),
]);

