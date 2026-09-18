import { AppError, ErrorCode, appLogger, cryptoService, ENV } from '@core';
import type { OAuthState } from '@domain';
import { oauthStatesRepo } from '@database';

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export class OAuthStatesService {
	private hashState(state: string): string {
		return cryptoService.createHmacSha256(
			ENV.OAUTH_STATE_SECRET,
			`oauth-state:${state}`
		);
	}

	private hashBrowserBinding(binding: string): string {
		return cryptoService.createHmacSha256(
			ENV.OAUTH_STATE_SECRET,
			`oauth-binding:${binding}`
		);
	}

	create(
		client: OAuthState.Client,
		browserBinding?: string | null
	): {
		state: string;
		browserBinding: string | null;
	} {
		const state = cryptoService.generateToken(32);

		const binding =
			client === 'browser'
				? (browserBinding ?? cryptoService.generateToken(32))
				: null;

		const stateHash = this.hashState(state);

		const browserBindingHash = binding
			? this.hashBrowserBinding(binding)
			: null;

		const now = new Date();

		const expiresAt = new Date(
			now.getTime() + OAUTH_STATE_TTL_MS
		).toISOString();

		oauthStatesRepo.deleteExpired(now.toISOString());

		oauthStatesRepo.create({
			stateHash,
			client,
			browserBindingHash,
			expiresAt
		});

		appLogger.debug(
			`Created OAuth authentication state for ${client} client.`
		);

		return {
			state,
			browserBinding: binding
		};
	}

	consume(state: string, browserBinding: string | null): OAuthState.Model {
		const stateHash = this.hashState(state);

		const browserBindingHash = browserBinding
			? this.hashBrowserBinding(browserBinding)
			: null;

		const oauthState = oauthStatesRepo.consume(
			stateHash,
			new Date().toISOString(),
			browserBindingHash
		);

		if (!oauthState) {
			throw new AppError(
				ErrorCode.UNAUTHORIZED,
				'Invalid or expired OAuth authentication state'
			);
		}

		appLogger.debug(
			`Consumed OAuth authentication state for ${oauthState.client} client.`
		);

		return oauthState;
	}
}

export const oauthStatesService = new OAuthStatesService();
