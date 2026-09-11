export const openAPIConfig = {
	openapi: '3.0.0',
	info: {
		title: 'GitCord Server API',
		version: '0.1.0',
		description: 'API documentation for GitCord backend services'
	},
	webhooks: {
		serverLifecycle: {
			post: {
				summary: 'Server Lifecycle Webhook',
				description:
					'Outbound webhook dispatched by the server to notify the bot of startup and shutdown state changes.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									type: {
										type: 'string',
										example: 'SERVER_LIFECYCLE'
									},
									timestamp: {
										type: 'number',
										example: 1723917300000
									},
									data: {
										type: 'object',
										properties: {
											status: {
												type: 'string',
												example: 'ONLINE'
											},
											reason: {
												type: 'string',
												example:
													'Server startup complete'
											}
										},
										required: ['status']
									}
								},
								required: ['type', 'timestamp', 'data']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Webhook processed successfully by the bot'
					}
				}
			}
		}
	}
} as const;
