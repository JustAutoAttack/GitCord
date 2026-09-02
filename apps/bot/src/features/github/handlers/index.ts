import { ContainerBuilder } from 'discord.js';

import { GitHubWebhookPayload } from '../types';
import { handleCreateEvent } from './create';
import { handleIssueEvent } from './issue';
import { handlePullRequestEvent } from './pull_request';
import { handlePushEvent } from './push';
import { handleReleaseEvent } from './release';

export function handleGitHubEvent(
	event: string | undefined,
	body: GitHubWebhookPayload
): ContainerBuilder | null {
	switch (event) {
		case 'push':
			return handlePushEvent(body);

		case 'pull_request':
			return handlePullRequestEvent(body);

		case 'issues':
			return handleIssueEvent(body);

		case 'release':
			return handleReleaseEvent(body);

		case 'create':
			return handleCreateEvent(body);

		default:
			return null;
	}
}
