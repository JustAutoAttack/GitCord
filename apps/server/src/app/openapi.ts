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
								required: ['timestamp', 'data']
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
		},
		tableUpdate: {
			post: {
				summary: 'Database Table Update Webhook',
				description:
					'Outbound webhook dispatched by the server whenever a record is created, updated, or deleted, allowing the bot to invalidate its local cache.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									timestamp: {
										type: 'number',
										example: 1723917300000
									},
									data: {
										type: 'object',
										properties: {
											tableName: {
												type: 'string',
												enum: [
													'users',
													'user_sessions',
													'github_app_installations',
													'github_repositories',
													'bot_commands',
													'guild_user_permissions',
													'guild_repositories',
													'guild_settings'
												],
												example: 'guild_settings'
											},
											action: {
												type: 'string',
												enum: [
													'CREATE',
													'UPDATE',
													'DELETE'
												],
												example: 'UPDATE'
											},
											recordId: {
												type: 'string',
												example: '1234567890'
											},
											record: {
												type: 'object',
												nullable: true,
												example: { prefix: '!' }
											}
										},
										required: [
											'tableName',
											'action',
											'recordId'
										]
									}
								},
								required: ['timestamp', 'data']
							}
						}
					}
				},
				responses: {
					'200': {
						description: 'Cache invalidated successfully by the bot'
					}
				}
			}
		},
		githubEvent: {
			post: {
				summary: 'GitHub Event Webhook',
				description:
					'Outbound webhook dispatched by the server to forward unhandled GitHub event payloads to the bot for rendering and notifications.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									timestamp: {
										type: 'number',
										example: 1723917300000
									},
									data: {
										type: 'object',
										properties: {
											eventName: {
												type: 'string',
												example: 'push'
											},
											payload: {
												type: 'object',
												example: {
													ref: 'refs/heads/main'
												}
											}
										},
										required: ['eventName', 'payload']
									}
								},
								required: ['timestamp', 'data']
							}
						}
					}
				},
				responses: {
					'200': {
						description:
							'GitHub event processed successfully by the bot'
					}
				}
			}
		}
	}
};
