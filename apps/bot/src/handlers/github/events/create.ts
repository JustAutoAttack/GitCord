import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { GitHubWebhookPayload } from '../types';
import { COLORS } from '../constants';
import {
	createContainer,
	addSeparator,
	buildHeader,
	buildFooter
} from '../utils';

export function handleCreateEvent(
	body: GitHubWebhookPayload
): ContainerBuilder | null {
	if (body.ref_type !== 'branch') return null;

	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const branch = body.ref ?? 'unknown-branch';
	const sender = body.sender?.login ?? 'unknown';

	const branchUrl = repoUrl
		? `${repoUrl}/tree/${encodeURIComponent(branch)}`
		: undefined;
	const branchDisplay = branchUrl
		? `[${branch}](${branchUrl})`
		: `\`${branch}\``;

	const container = createContainer(COLORS.BRANCH);

	buildHeader(
		container,
		`Branch Created: ${repoFullName}`,
		`New branch initialized`
	);

	addSeparator(container);

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`Branch: ${branchDisplay}\nCreator: \`@${sender}\``
		)
	);

	buildFooter(container, repoFullName, repoUrl);
	return container;
}
