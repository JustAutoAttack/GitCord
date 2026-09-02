export interface ApiUser {
	login?: string;
	id?: number;
	avatar_url?: string;
	html_url?: string;
}

export interface ApiCommit {
	sha: string;
	node_id?: string;
	html_url: string;

	commit: {
		message: string;

		author?: {
			name?: string;
			email?: string;
			date?: string;
		};

		committer?: {
			name?: string;
			email?: string;
			date?: string;
		};
	};

	author?: ApiUser | null;
	committer?: ApiUser | null;
}

export interface ApiRepository {
	full_name: string;
	html_url: string;
	default_branch: string;
	created_at: string;
	size?: number;
}

export interface ApiBranch {
	name: string;

	commit: {
		sha: string;
		url: string;
	};

	protected?: boolean;
}

export interface ApiContributor extends ApiUser {
	contributions?: number;
}
