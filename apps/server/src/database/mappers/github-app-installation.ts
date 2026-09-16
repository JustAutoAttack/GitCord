import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { GithubAppInstallation } from '@domain';
import type { githubAppInstallations } from '../generated';

export type GithubAppInstallationRow = InferSelectModel<
	typeof githubAppInstallations
>;
export type GithubAppInstallationInsert = InferInsertModel<
	typeof githubAppInstallations
>;

export const githubAppInstallationMapper = {
	toDomain(raw: GithubAppInstallationRow): GithubAppInstallation.Model {
		return {
			id: raw.id,
			installationId: raw.installationId,
			accountLogin: raw.accountLogin,
			accountType: raw.accountType,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: GithubAppInstallationRow | undefined | null
	): GithubAppInstallation.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(
		raws: GithubAppInstallationRow[]
	): GithubAppInstallation.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(
		input: GithubAppInstallation.CreateInput
	): GithubAppInstallationInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			installationId: input.installationId,
			accountLogin: input.accountLogin,
			accountType: input.accountType,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(
		input: GithubAppInstallation.UpdateInput
	): Partial<GithubAppInstallationInsert> {
		const update: Partial<GithubAppInstallationInsert> = {};
		if (input.accountLogin !== undefined)
			update.accountLogin = input.accountLogin;
		if (input.accountType !== undefined)
			update.accountType = input.accountType;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
