import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { GitHubWebhookPayload } from '../types';

export function handleReleaseEvent(
	body: GitHubWebhookPayload
): ContainerBuilder {
	const release = body.release;
	const action = body.action ?? 'published';
	const name = release?.name ?? release?.tag_name ?? 'Untitled release';
	const url = release?.html_url;
	const releaseDisplay = url ? `[${name}](${url})` : name;

	return new ContainerBuilder()
		.setAccentColor(CONFIG.colors.githubReleaseEvent)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				[`### Release ${action}`, releaseDisplay].join('\n')
			)
		);
}
