export interface GitHubCommit {
	id?: string;
	message?: string;
	url?: string;
	timestamp?: string;
	author?: {
		username?: string;
		name?: string;
		email?: string;
		login?: string;
	};
}

export interface GitHubWebhookPayload {
	repository?: {
		full_name?: string;
		name?: string;
		html_url?: string;
	};
	pusher?: {
		name?: string;
	};
	commits?: GitHubCommit[];
	head_commit?: GitHubCommit;
	ref?: string;
	action?: string;
	pull_request?: {
		title?: string;
		html_url?: string;
		number?: number;
		merged?: boolean;
		body?: string;
		user?: {
			login?: string;
		};
	};
	issue?: {
		title?: string;
		html_url?: string;
		number?: number;
		body?: string;
		user?: {
			login?: string;
		};
	};
	release?: {
		name?: string;
		tag_name?: string;
		html_url?: string;
		body?: string;
	};
	ref_type?: string;
	sender?: {
		login?: string;
		html_url?: string;
	};
	[key: string]: unknown;
}
