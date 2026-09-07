import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { createHeader, createFooter, createSeparator } from '@shared';
import type { GitHubPullRequest, GitHubRepository } from '../types';

export interface PullRequestEventContext {
	pullRequest: GitHubPullRequest;
	action: string;
	repository?: GitHubRepository;
}

export function handlePullRequestEvent({
	pullRequest,
	action,
	repository
}: PullRequestEventContext): ContainerBuilder {
	let accentColor = CONFIG.colors.githubPullRequestEvent;

	if (action === 'closed' && !pullRequest.merged) {
		accentColor = CONFIG.colors.githubCreateEvent;
	}

	const title = pullRequest.title ?? 'Untitled pull request';
	const numberDisplay =
		pullRequest.number !== undefined
			? `#${pullRequest.number}`
			: 'Pull request';
	const titleDisplay = pullRequest.html_url
		? `[${title}](${pullRequest.html_url})`
		: title;

	return new ContainerBuilder({
		accent_color: accentColor,
		components: [
			createHeader(
				`Pull request ${action}`,
				`${numberDisplay} · ${titleDisplay}`
			),
			...(repository?.full_name
				? [
						createSeparator(),
						createFooter(repository.full_name, repository.html_url)
					]
				: [])
		]
	});
}
