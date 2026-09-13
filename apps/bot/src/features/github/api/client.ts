import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

import { ENV } from '@core';

export function createGitHubClient(installationId: number) {
	return new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: Number(ENV.GITHUB_APP_ID),
			privateKey: ENV.GITHUB_CLIENT_SECRET.replace(/\\n/g, '\n'),
			installationId
		}
	});
}
