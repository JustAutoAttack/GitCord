import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

import { ENV } from '@core';

export function createGitHubClient(installationId: number) {
	let privateKey = ENV.GITHUB_PRIVATE_KEY;
	if (privateKey.includes('\\n')) {
		privateKey = privateKey.replace(/\\n/g, '\n');
	}

	return new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: Number(ENV.GITHUB_APP_ID),
			privateKey,
			installationId
		}
	});
}
