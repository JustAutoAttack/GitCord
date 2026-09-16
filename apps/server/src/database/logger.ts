import { createLogger } from '@gitcord/logger';

function hexToNumber(hex: string): number {
	return Number.parseInt(hex.trim().replace(/^#/, ''), 16);
}

const DATABASE_COLOR = hexToNumber('#9900ff');

export const logger = createLogger('Database', {
	color: DATABASE_COLOR,
	home: 'src/database'
});
