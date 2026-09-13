import type { Endpoints } from '@octokit/types';
import { createGitHubClient, executeGitHubApiCall } from '.';

export type ApiRepository =
	Endpoints['GET /repos/{owner}/{repo}']['response']['data'];
export type ApiBranch =
	Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'][number];
export type ApiCommit =
	Endpoints['GET /repos/{owner}/{repo}/commits']['response']['data'][number];
export type ApiContributor =
	Endpoints['GET /repos/{owner}/{repo}/contributors']['response']['data'][number];

function parseRepository(repository: string): {
	owner: string;
	repo: string;
} {
	const [owner, repo] = repository.split('/');
	if (!owner || !repo) {
		throw new Error(
			`Invalid repository format: ${repository}. Expected "owner/repo"`
		);
	}
	return { owner, repo };
}

export interface IGitHubAPIService {
	getRepository(
		installationId: number,
		repository: string
	): Promise<ApiRepository>;
	getBranches(
		installationId: number,
		repository: string
	): Promise<ApiBranch[]>;
	getCommits(
		installationId: number,
		repository: string,
		branch?: string
	): Promise<ApiCommit[]>;
	getContributors(
		installationId: number,
		repository: string
	): Promise<ApiContributor[]>;
}

export const GitHubAPIService: IGitHubAPIService = {
	async getRepository(
		installationId: number,
		repository: string
	): Promise<ApiRepository> {
		const { owner, repo } = parseRepository(repository);
		const octokit = createGitHubClient(installationId);
		return executeGitHubApiCall(
			() => octokit.rest.repos.get({ owner, repo }),
			'get repository'
		);
	},

	async getBranches(
		installationId: number,
		repository: string
	): Promise<ApiBranch[]> {
		const { owner, repo } = parseRepository(repository);
		const octokit = createGitHubClient(installationId);
		return executeGitHubApiCall(
			() => octokit.rest.repos.listBranches({ owner, repo }),
			'list branches'
		);
	},

	async getCommits(
		installationId: number,
		repository: string,
		branch?: string
	): Promise<ApiCommit[]> {
		const { owner, repo } = parseRepository(repository);
		const octokit = createGitHubClient(installationId);
		return executeGitHubApiCall(
			() =>
				octokit.rest.repos.listCommits({
					owner,
					repo,
					...(branch ? { sha: branch } : {})
				}),
			'list commits'
		);
	},

	async getContributors(
		installationId: number,
		repository: string
	): Promise<ApiContributor[]> {
		const { owner, repo } = parseRepository(repository);
		const octokit = createGitHubClient(installationId);
		return executeGitHubApiCall(
			() => octokit.rest.repos.listContributors({ owner, repo }),
			'list contributors'
		);
	}
};
