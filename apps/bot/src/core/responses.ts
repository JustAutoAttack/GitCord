export const Responses = {
	success<T>(data: T, message = 'Success') {
		return {
			success: true as const,
			message,
			data
		};
	},

	error(code: string, message: string) {
		return {
			success: false as const,
			error: {
				code,
				message
			}
		};
	}
};
