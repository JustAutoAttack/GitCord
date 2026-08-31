import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { GitHubWebhookPayload } from '../types';
import { COLORS, MAX_COMMITS } from '../constants';
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
		`${commits.length} new commit${commits.length === 1 ? '' : 's'} pushed`
	);

	addSeparator(container);

	if (!commits.length) {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				'**Commits**\n> No commits included in this push.'
			)
		);
	} else {
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent('**Commits**')
		);

		const displayCommits = commits.slice(0, MAX_COMMITS);
		for (let i = 0; i < displayCommits.length; i++) {
			const commit = displayCommits[i];
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

			if (i < displayCommits.length - 1) {
				addSeparator(container);
			}
		}

		const remaining = commits.length - displayCommits.length;
		if (remaining > 0) {
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`> +${remaining} more commit${remaining === 1 ? '' : 's'}`
				)
			);
		}
	}

	buildFooter(container, repoFullName, repoUrl);
	return container;
}
