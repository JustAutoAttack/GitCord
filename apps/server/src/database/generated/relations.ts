import { relations } from "drizzle-orm/relations";
import { users, userSessions, discordSessions, githubAppInstallations, githubRepositories, botCommands, guildUserPermissions, guildRepositories } from "./schema";

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userSessions: many(userSessions),
	discordSessions: many(discordSessions),
}));

export const discordSessionsRelations = relations(discordSessions, ({one}) => ({
	user: one(users, {
		fields: [discordSessions.userId],
		references: [users.id]
	}),
}));

export const githubRepositoriesRelations = relations(githubRepositories, ({one, many}) => ({
	githubAppInstallation: one(githubAppInstallations, {
		fields: [githubRepositories.githubAppInstallationId],
		references: [githubAppInstallations.id]
	}),
	guildRepositories: many(guildRepositories),
}));

export const githubAppInstallationsRelations = relations(githubAppInstallations, ({many}) => ({
	githubRepositories: many(githubRepositories),
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

export const guildRepositoriesRelations = relations(guildRepositories, ({one}) => ({
	githubRepository: one(githubRepositories, {
		fields: [guildRepositories.githubRepositoryId],
		references: [githubRepositories.id]
	}),
}));