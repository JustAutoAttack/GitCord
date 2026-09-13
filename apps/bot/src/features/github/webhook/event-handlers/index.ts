import { ContainerBuilder } from 'discord.js';
import type {
	WebhookEvent,
	PushEvent,
	PullRequestEvent,
	IssuesEvent,
	ReleaseEvent,
	CreateEvent
} from '@octokit/webhooks-types';

import { logger } from '../../logger';
import { handleCreate } from './create';
import { handleIssue } from './issue';
import { handlePullRequest } from './pull-request';
import { handlePush } from './push';
import { handleRelease } from './release';

export function handleEvent(
	event: string | undefined,
	body: WebhookEvent
): ContainerBuilder | null {
	switch (event) {
		case 'push': {
			const payload = body as PushEvent;
			if (!payload.ref) return null;
			return handlePush(payload);
		}

		case 'pull_request': {
			const payload = body as PullRequestEvent;
			if (!payload.pull_request) return null;
			return handlePullRequest(payload);
		}

		case 'issues': {
			const payload = body as IssuesEvent;
			if (!payload.issue) return null;
			return handleIssue(payload);
		}

		case 'release': {
			const payload = body as ReleaseEvent;
			if (!payload.release) return null;
			return handleRelease(payload);
		}

		case 'create': {
			const payload = body as CreateEvent;
			if (payload.ref_type !== 'branch' || !payload.ref) return null;
			return handleCreate(payload);
		}

		default:
			logger.warn(`Unhandled event: ${event ?? 'unknown'}`);
			return null;
	}
}
