import { ContainerBuilder } from 'discord.js';

import { CONFIG } from '@core';
import { buildHeader, createContainer } from '@shared';
import { GitHubWebhookPayload } from '../types';

export function handleCreateEvent(
	body: GitHubWebhookPayload
): ContainerBuilder | null {
	if (body.ref_type !== 'branch') {
		return null;
	}

	const branchName = body.ref ?? 'unknown-branch';
	const container = createContainer(CONFIG.colors.githubCreateEvent);

	buildHeader(container, 'Branch created', `\`${branchName}\``);

	return container;
}
