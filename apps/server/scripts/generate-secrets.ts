import crypto from 'node:crypto';

const generateSecret = (): string => crypto.randomBytes(32).toString('hex');

console.log(`BOT_WEBHOOK_SECRET=${generateSecret()}`);
console.log(`JWT_SECRET=${generateSecret()}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret()}`);
console.log(`CRYPTO_SECRET=${generateSecret()}`);
console.log(`OAUTH_STATE_SECRET=${generateSecret()}`);
