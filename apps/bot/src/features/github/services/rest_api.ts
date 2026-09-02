import { GITHUB_API_BASE, REPOSITORY } from '../constants';
import { ApiBranch, ApiCommit, ApiRepository } from '../types';

async function request<T>(endpoint: string): Promise<T> {
	const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});

	if (!response.ok) {
		throw new Error(
			`GitHub API request failed: ${response.status} ${response.statusText}`
		);
	}

	return response.json() as Promise<T>;
}

export async function getRepository(): Promise<ApiRepository> {
	return request<ApiRepository>(`/repos/${REPOSITORY}`);
}

export async function getBranches(): Promise<ApiBranch[]> {
	return request<ApiBranch[]>(`/repos/${REPOSITORY}/branches`);
}

export async function getCommits(branch?: string): Promise<ApiCommit[]> {
	const query = branch ? `?sha=${encodeURIComponent(branch)}` : '';

	return request<ApiCommit[]>(`/repos/${REPOSITORY}/commits${query}`);
}
