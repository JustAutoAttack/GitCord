export namespace GithubRepository {
	export interface Model {
		id: string;
		githubAppInstallationId: string;
		repositoryUrl: string;
		repositoryFullName: string;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		githubAppInstallationId: string;
		repositoryUrl: string;
		repositoryFullName: string;
	}

	export interface UpdateInput {
		githubAppInstallationId?: string;
		repositoryUrl?: string;
		repositoryFullName?: string;
	}
}
