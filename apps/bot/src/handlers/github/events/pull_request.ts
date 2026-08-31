import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { GitHubWebhookPayload } from '../types';
import { COLORS } from '../constants';
import {
	createContainer,
	addSeparator,
	truncate,
	buildHeader,
	buildFooter
} from '../utils';

export function handlePullRequestEvent(
	body: GitHubWebhookPayload
): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const action = body.action ?? 'updated';
	const pr = body.pull_request;

	const isMerged = action === 'closed' && pr?.merged === true;
	let color = COLORS.PR_OPEN;
	if (isMerged) color = COLORS.PR_MERGED;
	else if (action === 'closed') color = COLORS.PR_CLOSE;

	const actionLabel = isMerged
		? 'Merged'
		: action.charAt(0).toUpperCase() + action.slice(1);
	const title = pr?.title ?? 'Untitled Pull Request';
	const prUrl = pr?.html_url ?? repoUrl ?? 'https://github.com';
	const description = pr?.body
		? `\n\n> ${truncate(pr.body.replace(/\n/g, ' '), 250)}`
		: '';

	const container = createContainer(color);

	buildHeader(
		container,
		`Pull Request: ${repoFullName}/#${pr?.number ?? 'unknown'}`,
		`Status: **${actionLabel}**`
	);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`**[${truncate(title, 150)}](${prUrl})**${description}\n\nAuthor: \`@${pr?.user?.login ?? 'unknown'}\``
		)
	);

	buildFooter(container, repoFullName, repoUrl);
	return container;
}
