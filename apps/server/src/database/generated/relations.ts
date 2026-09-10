import { relations } from "drizzle-orm/relations";
import { users, userSessions, botCommands, guildUserPermissions } from "./schema";

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userSessions: many(userSessions),
}));

export const guildUserPermissionsRelations = relations(guildUserPermissions, ({one}) => ({
	botCommand: one(botCommands, {
		fields: [guildUserPermissions.commandId],
		references: [botCommands.id]
	}),
}));

export const botCommandsRelations = relations(botCommands, ({many}) => ({
	guildUserPermissions: many(guildUserPermissions),
}));