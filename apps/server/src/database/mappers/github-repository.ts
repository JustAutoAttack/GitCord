import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

import type { GithubRepository } from '@domain';
import type { githubRepositories } from '../generated';

export type GithubRepositoryRow = InferSelectModel<typeof githubRepositories>;
export type GithubRepositoryInsert = InferInsertModel<
	typeof githubRepositories
>;

export const githubRepositoryMapper = {
	toDomain(raw: GithubRepositoryRow): GithubRepository.Model {
		return {
			id: raw.id,
			githubAppInstallationId: raw.githubAppInstallationId,
			repositoryUrl: raw.repositoryUrl,
			repositoryFullName: raw.repositoryFullName,
			updatedAt: raw.updatedAt,
			createdAt: raw.createdAt
		};
	},

	toDomainOptional(
		raw: GithubRepositoryRow | undefined | null
	): GithubRepository.Model | undefined {
		if (!raw) return undefined;
		return this.toDomain(raw);
	},

	toDomainList(raws: GithubRepositoryRow[]): GithubRepository.Model[] {
		return raws.map((raw) => this.toDomain(raw));
	},

	toInsert(input: GithubRepository.CreateInput): GithubRepositoryInsert {
		const now = new Date().toISOString();
		return {
			id: crypto.randomUUID(),
			githubAppInstallationId: input.githubAppInstallationId,
			repositoryUrl: input.repositoryUrl,
			repositoryFullName: input.repositoryFullName,
			createdAt: now,
			updatedAt: now
		};
	},

	toUpdate(
		input: GithubRepository.UpdateInput
	): Partial<GithubRepositoryInsert> {
		const update: Partial<GithubRepositoryInsert> = {};
		if (input.repositoryUrl !== undefined)
			update.repositoryUrl = input.repositoryUrl;
		if (input.repositoryFullName !== undefined)
			update.repositoryFullName = input.repositoryFullName;
		update.updatedAt = new Date().toISOString();
		return update;
	}
};
