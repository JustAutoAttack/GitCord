export namespace GithubAppInstallation {
	export interface Model {
		id: string;
		installationId: number;
		accountLogin: string;
		accountType: string;
		updatedAt: string;
		createdAt: string;
	}

	export interface CreateInput {
		installationId: number;
		accountLogin: string;
		accountType: string;
	}

	export interface UpdateInput {
		installationId?: number;
		accountLogin?: string;
		accountType?: string;
	}
}
