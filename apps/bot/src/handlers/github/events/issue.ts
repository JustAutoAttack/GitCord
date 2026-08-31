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

export function handleIssueEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const action = body.action ?? 'opened';
	const issue = body.issue;

	const color = action === 'closed' ? COLORS.PR_CLOSE : COLORS.ISSUE;
	const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
	const title = issue?.title ?? 'Untitled Issue';
	const issueUrl = issue?.html_url ?? repoUrl ?? 'https://github.com';
	const description = issue?.body
		? `\n\n> ${truncate(issue.body.replace(/\n/g, ' '), 250)}`
		: '';

	const container = createContainer(color);

	buildHeader(
		container,
		`Issue: ${repoFullName}/#${issue?.number ?? 'unknown'}`,
		`Action: **${actionLabel}**`
	);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`**[${truncate(title, 150)}](${issueUrl})**${description}\n\nAuthor: \`@${issue?.user?.login ?? 'unknown'}\``
		)
	);

	buildFooter(container, repoFullName, repoUrl);
	return container;
}
