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
                /** @description Server process is responsive */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example UP */
                            status: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @enum {string} */
                                    status: "up" | "down";
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                    error?: string;
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
                /** @description Database connection is healthy */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example UP */
                            status: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @enum {string} */
                                    status: "up" | "down";
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                    error?: string;
                                };
                            };
                        };
                    };
                };
                /** @description Database connection is offline */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example UP */
                            status: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @enum {string} */
                                    status: "up" | "down";
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                    error?: string;
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
                /** @description Service is fully operational */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example UP */
                            status: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @enum {string} */
                                    status: "up" | "down";
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                    error?: string;
                                };
                            };
                        };
                    };
                };
                /** @description Service is degraded */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example UP */
                            status: string;
                            /** @example 2026-08-17T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                database: {
                                    /** @enum {string} */
                                    status: "up" | "down";
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                    error?: string;
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
    "/api/v1/repo-configs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Repo Configurations
         * @description Returns all repository configurations.
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
                /** @description List of repository configurations retrieved */
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
         * Create Repo Configuration
         * @description Creates a new repository configuration.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        /** @example 123456789012345678 */
                        guildId: string;
                        /** @example 123456789012345679 */
                        commandChannelId: string;
                        /** @example 123456789012345680 */
                        notificationChannelId: string;
                    };
                };
            };
            responses: {
                /** @description Repository configuration created successfully */
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
                /** @description Invalid input payload */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example Resource not found */
                            error: string;
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/repo-configs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Repo Configuration by ID
         * @description Returns a single repository configuration by its ID.
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
                /** @description Repository configuration retrieved */
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
                /** @description Repository configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example Resource not found */
                            error: string;
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        /**
         * Delete Repo Configuration
         * @description Deletes an existing repository configuration.
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
                /** @description Repository configuration deleted successfully */
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
                /** @description Repository configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example Resource not found */
                            error: string;
                        };
                    };
                };
            };
        };
        options?: never;
        head?: never;
        /**
         * Update Repo Configuration
         * @description Updates guild ID or channel IDs for a specific repository configuration.
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
            requestBody?: {
                content: {
                    "application/json": {
                        /** @example 123456789012345678 */
                        guildId?: string;
                        /** @example 123456789012345679 */
                        commandChannelId?: string;
                        /** @example 123456789012345680 */
                        notificationChannelId?: string;
                    };
                };
            };
            responses: {
                /** @description Repository configuration updated successfully */
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
                /** @description Invalid input payload */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example Resource not found */
                            error: string;
                        };
                    };
                };
                /** @description Repository configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example Resource not found */
                            error: string;
                        };
                    };
                };
            };
        };
        trace?: never;
    };
    "/api/v1/repo-configs/command-channel/{commandChannelId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Repo Configuration by Command Channel ID
         * @description Returns a single repository configuration matching the specified command channel ID.
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
                /** @description Repository configuration retrieved */
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
                /** @description Repository configuration not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example Resource not found */
                            error: string;
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
