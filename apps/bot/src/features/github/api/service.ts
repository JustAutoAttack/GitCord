import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import type { Endpoints } from '@octokit/types';

import { ENV } from '@core';
import { createGitHubClient } from './client';
import { executeGitHubApiCall } from './utils';

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
	let cleanRepo = repository.trim();

	if (cleanRepo.startsWith('http://') || cleanRepo.startsWith('https://')) {
		try {
			const url = new URL(cleanRepo);
			const segments = url.pathname.split('/').filter(Boolean);
			if (segments.length >= 2) {
				return {
					owner: segments[0],
					repo: segments[1].replace(/\.git$/, '')
				};
			}
		} catch {
			// Fallback to manual string parsing if URL parsing fails
		}
	}

	const [owner, repo] = cleanRepo.replace(/\.git$/, '').split('/');
	if (!owner || !repo) {
		throw new Error(
			`Invalid repository format: ${repository}. Expected "owner/repo" or a valid GitHub URL`
		);
	}
	return { owner, repo };
}

export async function getInstallationIdForRepo(
	repository: string
): Promise<number> {
	const { owner, repo } = parseRepository(repository);

	let privateKey = ENV.GITHUB_PRIVATE_KEY;
	if (privateKey.includes('\\n')) {
		privateKey = privateKey.replace(/\\n/g, '\n');
	}

	const octokit = new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: Number(ENV.GITHUB_APP_ID),
			privateKey
		}
	});

	const response = await octokit.rest.apps.getRepoInstallation({
		owner,
		repo
	});
	return response.data.id;
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
		const resolvedId =
			installationId || (await getInstallationIdForRepo(repository));
		const octokit = createGitHubClient(resolvedId);
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
		const resolvedId =
			installationId || (await getInstallationIdForRepo(repository));
		const octokit = createGitHubClient(resolvedId);
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
		const resolvedId =
			installationId || (await getInstallationIdForRepo(repository));
		const octokit = createGitHubClient(resolvedId);
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
		const resolvedId =
			installationId || (await getInstallationIdForRepo(repository));
		const octokit = createGitHubClient(resolvedId);
		return executeGitHubApiCall(
			() => octokit.rest.repos.listContributors({ owner, repo }),
			'list contributors'
		);
	}
};
