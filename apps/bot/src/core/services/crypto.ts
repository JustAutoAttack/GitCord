import crypto from 'node:crypto';

export const cryptoService = {
	verifyHmacSha256(
		secret: string,
		payload: string,
		signature: string
	): boolean {
		try {
			const computedSignature = crypto
				.createHmac('sha256', secret)
				.update(payload)
				.digest('base64url');

			const signatureBuffer = Buffer.from(signature, 'utf-8');
			const computedBuffer = Buffer.from(computedSignature, 'utf-8');

			if (signatureBuffer.length !== computedBuffer.length) {
				return false;
			}

			return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
		} catch {
			return false;
		}
	}
};
