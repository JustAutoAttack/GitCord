import { ContainerBuilder } from 'discord.js';
import type { ReleaseEvent } from '@octokit/webhooks-types';

import { CONFIG, createHeader, createFooter, createSeparator } from '@core';

export function handleRelease(event: ReleaseEvent): ContainerBuilder {
	const release = event.release;
	const action = event.action;
	const repository = event.repository;

	const name = release.name ?? release.tag_name ?? 'Untitled release';
	const releaseDisplay = release.html_url
		? `[${name}](${release.html_url})`
		: name;

	return new ContainerBuilder({
		accent_color: CONFIG.github.colors.release,
		components: [
			createHeader(`Release ${action}`, releaseDisplay),
			...(repository?.full_name
				? [
						createSeparator(),
						createFooter(repository.full_name, repository.html_url)
					]
				: [])
		]
	});
}
