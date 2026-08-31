import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { GitHubWebhookPayload } from '../types';
import { COLORS } from '../constants';
import {
	createContainer,
	addSeparator,
	getBranchName,
	truncate,
	getCommitUsername,
	discordRelativeTimestamp,
	buildHeader,
	buildFooter
} from '../utils';

export function handlePushEvent(body: GitHubWebhookPayload): ContainerBuilder {
	const repoFullName = body.repository?.full_name ?? 'unknown/repo';
	const repoUrl = body.repository?.html_url;
	const branch = getBranchName(body.ref);
	const commits =
		body.commits ?? (body.head_commit ? [body.head_commit] : []);

	const container = createContainer(COLORS.PUSH);

	buildHeader(
		container,
		`Branch Update: \`${branch}\``,
		`Pushed events recorded`
	);

	addSeparator(container);

	if (!commits.length) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'**0 Commits**\n> No commits included in this push.'
			)
		);
	} else {
		const commitLabel = `${commits.length} Commit${commits.length === 1 ? '' : 's'}`;
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`**${commitLabel}**`)
		);

		for (let i = 0; i < commits.length; i++) {
			const commit = commits[i];
			const sha = commit.id?.substring(0, 7) ?? '0000000';
			const message = truncate(
				commit.message?.split('\n')[0].trim() || 'No commit message',
				140
			);
			const username = getCommitUsername(commit, body);
			const relativeTime = discordRelativeTimestamp(commit.timestamp);

			const shaDisplay = commit.url
				? `[\`${sha}\`](${commit.url})`
				: `\`${sha}\``;
			const metadata = relativeTime
				? `@${username}  ·  ${relativeTime}`
				: `@${username}`;

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${shaDisplay}  **${message}**\n${metadata}`
				)
			);

			if (i < commits.length - 1) {
				addSeparator(container);
			}
		}
	}

	buildFooter(container, repoFullName, repoUrl);
	return container;
}
