export interface paths {
    "/health/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Liveness Probe
         * @description Immediate process responsiveness check.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Server process response */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Service is operational */
                            message: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Database connection is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Readiness Probe
         * @description Validates SQLite database connection.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Database connection status report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Service is operational */
                            message: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Database connection is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                            };
                        };
                    };
                };
                /** @description Database connection failure report */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Service is operational */
                            message: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Database connection is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Full Diagnostic Health Check
         * @description Provides process uptime and database status details.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Full diagnostic report */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Service is operational */
                            message: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Database connection is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                            };
                        };
                    };
                };
                /** @description Degraded diagnostic report */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Service is operational */
                            message: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Database connection is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/remote-configs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List remote configurations
         * @description Returns all remote configurations, optionally filtered by guildId.
         */
        get: {
            parameters: {
                query?: {
                    guildId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Remote configurations */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cfg_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example 123456789012345679 */
                            commandChannelId: string;
                            /** @example 123456789012345680 */
                            notificationChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        }[];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create remote configuration
         * @description Creates a new remote configuration.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example 123456789012345678 */
                        guildId: string;
                        /**
                         * Format: uri
                         * @example https://github.com/gitcord-org/core-service
                         */
                        repositoryUrl: string;
                        /** @example 123456789012345679 */
                        commandChannelId: string;
                        /** @example 123456789012345680 */
                        notificationChannelId: string;
                    };
                };
            };
            responses: {
                /** @description Remote configuration created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cfg_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example 123456789012345679 */
                            commandChannelId: string;
                            /** @example 123456789012345680 */
                            notificationChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/remote-configs/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get remote configuration by guild and repo URL
         * @description Returns the remote configuration matching a specific guild ID and remote URL.
         */
        get: {
            parameters: {
                query: {
                    guildId: string;
                    repositoryUrl: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Remote configuration */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cfg_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example 123456789012345679 */
                            commandChannelId: string;
                            /** @example 123456789012345680 */
                            notificationChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Remote configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/remote-configs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get remote configuration
         * @description Returns a remote configuration by ID.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Remote configuration */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cfg_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example 123456789012345679 */
                            commandChannelId: string;
                            /** @example 123456789012345680 */
                            notificationChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Remote configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Delete remote configuration
         * @description Deletes an existing remote configuration.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Remote configuration deleted */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Operation completed successfully */
                            message: string;
                        };
                    };
                };
                /** @description Remote configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update remote configuration
         * @description Updates an existing remote configuration.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example 123456789012345678 */
                        guildId?: string;
                        /**
                         * Format: uri
                         * @example https://github.com/gitcord-org/another-repo
                         */
                        repositoryUrl?: string;
                        /** @example 123456789012345679 */
                        commandChannelId?: string;
                        /** @example 123456789012345680 */
                        notificationChannelId?: string;
                    };
                };
            };
            responses: {
                /** @description Remote configuration updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cfg_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example 123456789012345679 */
                            commandChannelId: string;
                            /** @example 123456789012345680 */
                            notificationChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Remote configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/v1/remote-configs/command-channel/{commandChannelId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get remote configuration by command channel
         * @description Returns the remote configuration associated with a command channel.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    commandChannelId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Remote configuration */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cfg_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example 123456789012345679 */
                            commandChannelId: string;
                            /** @example 123456789012345680 */
                            notificationChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Remote configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guild-settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List guild settings
         * @description Returns all guild settings configurations.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild settings */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example set_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 123456789012345679 */
                            systemChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        }[];
                    };
                };
            };
        };
        put?: never;
        /**
         * Create guild setting
         * @description Creates a new guild setting configuration.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example 123456789012345678 */
                        guildId: string;
                        /** @example 123456789012345679 */
                        systemChannelId: string;
                    };
                };
            };
            responses: {
                /** @description Guild setting created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example set_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 123456789012345679 */
                            systemChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guild-settings/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild setting by ID
         * @description Returns a guild setting configuration by its ID.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild setting */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example set_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 123456789012345679 */
                            systemChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Guild setting not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Delete guild setting
         * @description Deletes an existing guild setting configuration.
         */
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild setting deleted */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Operation completed successfully */
                            message: string;
                        };
                    };
                };
                /** @description Guild setting not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update guild setting
         * @description Updates an existing guild setting configuration.
         */
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": {
                        /** @example 123456789012345678 */
                        guildId?: string;
                        /** @example 123456789012345679 */
                        systemChannelId?: string;
                    };
                };
            };
            responses: {
                /** @description Guild setting updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example set_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 123456789012345679 */
                            systemChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Invalid request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Guild setting not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        trace?: never;
    };
    "/api/v1/guild-settings/guild/{guildId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild setting by guild ID
         * @description Returns the guild setting configuration associated with a specific guild.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    guildId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild setting */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example set_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 123456789012345679 */
                            systemChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Guild setting not found for guild */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guild-settings/system-channel/{systemChannelId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild setting by system channel ID
         * @description Returns the guild setting configuration associated with a system channel.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    systemChannelId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild setting */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example set_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 123456789012345679 */
                            systemChannelId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Guild setting not found for system channel */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
