import { ContainerBuilder } from 'discord.js';
import type { PullRequestEvent } from '@octokit/webhooks-types';

import { CONFIG, createHeader, createFooter, createSeparator } from '@core';

export function handlePullRequest(
	event: PullRequestEvent
): ContainerBuilder {
	const pullRequest = event.pull_request;
	const action = event.action;
	const repository = event.repository;

	let accentColor = CONFIG.github.colors.pullRequest;

	if (action === 'closed' && !pullRequest.merged) {
		accentColor = CONFIG.github.colors.create;
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
