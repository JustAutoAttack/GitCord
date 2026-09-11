import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

const APP_COLOR = hexToNumber('#ff3c00');
const SERVER_API_COLOR = hexToNumber('#ff9100');
const DISCORD_COLOR = hexToNumber('#0077ff');
const GITHUB_COLOR = hexToNumber('#cc00ff');
const HTTP_COLOR = hexToNumber('#00ff2a');

export const appLogger = createLogger('App', { color: APP_COLOR });
export const serverAPILogger = createLogger('Server API', {
	color: SERVER_API_COLOR
});
export const discordLogger = createLogger('Discord', { color: DISCORD_COLOR });
export const githubLogger = createLogger('GitHub', { color: GITHUB_COLOR });
export const httpLogger = createLogger('HTTP', { color: HTTP_COLOR });
