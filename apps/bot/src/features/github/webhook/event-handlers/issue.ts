import { ContainerBuilder } from 'discord.js';
import type { IssuesEvent } from '@octokit/webhooks-types';

import { CONFIG, createHeader, createFooter, createSeparator } from '@core';

export function handleIssue(event: IssuesEvent): ContainerBuilder {
	const issue = event.issue;
	const action = event.action;
	const repository = event.repository;

	const numberDisplay = `#${issue.number}`;
	const titleDisplay = issue.html_url
		? `[${issue.title}](${issue.html_url})`
		: (issue.title ?? 'Untitled issue');

	return new ContainerBuilder({
		accent_color: CONFIG.github.colors.issue,
		components: [
			createHeader(
				`Issue ${action}`,
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
