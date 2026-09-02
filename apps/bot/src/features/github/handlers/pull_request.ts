import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { buildFooter, buildHeader, createContainer } from '@shared';
import { GitHubWebhookPayload } from '../types';

export function handlePullRequestEvent(
	body: GitHubWebhookPayload
): ContainerBuilder {
	const pullRequest = body.pull_request;
	const action = body.action ?? 'updated';
	const title = pullRequest?.title ?? 'Untitled pull request';
	const number = pullRequest?.number;
	const url = pullRequest?.html_url;

	let accentColor = CONFIG.colors.githubPullRequestEvent;

	if (action === 'closed' && !pullRequest?.merged) {
		accentColor = CONFIG.colors.githubCreateEvent;
	}

	const numberDisplay = number !== undefined ? `#${number}` : 'Pull request';
	const titleDisplay = url ? `[${title}](${url})` : title;
	const container = createContainer(accentColor);

	buildHeader(
		container,
		`Pull request ${action}`,
		`${numberDisplay} · ${titleDisplay}`
	);

	if (body.repository?.full_name) {
		buildFooter(
			container,
			body.repository.full_name,
			body.repository.html_url
		);
	}

	return container;
}
