export interface GitHubUser {
	login?: string;
	name?: string;
	email?: string;
	avatar_url?: string;
	html_url?: string;
}

export interface GitHubCommit {
	id?: string;
	message?: string;
	url?: string;
	timestamp?: string;
	author?: GitHubUser;
	committer?: GitHubUser;
}

export interface GitHubRepository {
	full_name?: string;
	name?: string;
	html_url?: string;
}

export interface GitHubPullRequest {
	title?: string;
	html_url?: string;
	number?: number;
	merged?: boolean;
	body?: string;
	user?: GitHubUser;
}

export interface GitHubIssue {
	title?: string;
	html_url?: string;
	number?: number;
	body?: string;
	user?: GitHubUser;
}

export interface GitHubRelease {
	name?: string;
	tag_name?: string;
	html_url?: string;
	body?: string;
}

export interface GitHubWebhookPayload {
	repository?: GitHubRepository;
	pusher?: { name?: string };
	commits?: GitHubCommit[];
	head_commit?: GitHubCommit;
	ref?: string;
	action?: string;
	pull_request?: GitHubPullRequest;
	issue?: GitHubIssue;
	release?: GitHubRelease;
	ref_type?: string;
	sender?: GitHubUser;
	[key: string]: unknown;
}
