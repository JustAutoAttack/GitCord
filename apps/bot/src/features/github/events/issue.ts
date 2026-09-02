import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { buildFooter, buildHeader, createContainer } from '@shared';
import { GitHubWebhookPayload } from '../types';

export function handleIssueEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const issue = body.issue;
	const action = body.action ?? 'updated';
	const title = issue?.title ?? 'Untitled issue';
	const number = issue?.number;
	const url = issue?.html_url;
	const issueDisplay = number !== undefined ? `#${number}` : 'Issue';
	const titleDisplay = url ? `[${title}](${url})` : title;
	const container = createContainer(CONFIG.colors.githubIssuesEvent);

	buildHeader(
		container,
		`Issue ${action}`,
		`${issueDisplay} · ${titleDisplay}`
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
