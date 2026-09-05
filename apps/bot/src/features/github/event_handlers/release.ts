import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { createHeader, createFooter, createSeparator } from '@shared';
import type { GitHubRelease, GitHubRepository } from '../types';

export interface ReleaseEventContext {
	release: GitHubRelease;
	action: string;
	repository?: GitHubRepository;
}

export function handleReleaseEvent({
	release,
	action,
	repository
}: ReleaseEventContext): ContainerBuilder {
	const name = release.name ?? release.tag_name ?? 'Untitled release';
	const releaseDisplay = release.html_url
		? `[${name}](${release.html_url})`
		: name;

	return new ContainerBuilder({
		accent_color: CONFIG.colors.githubReleaseEvent,
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
