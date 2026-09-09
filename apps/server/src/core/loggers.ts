import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

const APP_COLOR = hexToNumber('#00fff2');
const DATABASE_COLOR = hexToNumber('#9900ff');
const HTTP_COLOR = hexToNumber('#ff8800');
const WS_COLOR = hexToNumber('#5900ff');

export const appLogger = createLogger('App', { color: APP_COLOR });
export const databaseLogger = createLogger('Database', {
	color: DATABASE_COLOR
});
export const httpLogger = createLogger('HTTP', { color: HTTP_COLOR });
export const wsLogger = createLogger('WS', { color: WS_COLOR });
