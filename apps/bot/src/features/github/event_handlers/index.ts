import { ContainerBuilder } from 'discord.js';

import type { GitHubWebhookPayload } from '../types';
import { handleCreateEvent } from './create';
import { handleIssueEvent } from './issue';
import { handlePullRequestEvent } from './pull_request';
import { handlePushEvent } from './push';
import { handleReleaseEvent } from './release';

export function handleGitHubEvent(
	event: string | undefined,
	body: GitHubWebhookPayload
): ContainerBuilder | null {
	const repo = body.repository;

	switch (event) {
		case 'push':
			if (!body.ref) return null;
			return handlePushEvent({
				ref: body.ref,
				commits: body.commits ?? [],
				repository: repo,
				rawPayload: body
			});

		case 'pull_request':
			if (!body.pull_request) return null;
			return handlePullRequestEvent({
				pullRequest: body.pull_request,
				action: body.action ?? 'updated',
				repository: repo
			});

		case 'issues':
			if (!body.issue) return null;
			return handleIssueEvent({
				issue: body.issue,
				action: body.action ?? 'updated',
				repository: repo
			});

		case 'release':
			if (!body.release) return null;
			return handleReleaseEvent({
				release: body.release,
				action: body.action ?? 'published',
				repository: repo
			});

		case 'create':
			if (body.ref_type !== 'branch' || !body.ref) return null;
			return handleCreateEvent({
				ref: body.ref,
				repository: repo
			});

		default:
			return null;
	}
}
