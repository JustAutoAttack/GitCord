export interface paths {
    "/api/health/live": {
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
                /** @description Bot process response */
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
                            /** @example 2026-09-11T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                github: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                                server: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
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
    "/api/health/ready": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Readiness Probe
         * @description Validates bot integrations status.
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
                /** @description Integrations status report */
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
                            /** @example 2026-09-11T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                github: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                                server: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                            };
                        };
                    };
                };
                /** @description Integrations failure report */
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
                            /** @example 2026-09-11T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                github: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                                server: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
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
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Full Diagnostic Health Check
         * @description Provides process uptime and integration status details.
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
                            /** @example 2026-09-11T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                github: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                                server: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
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
                            /** @example 2026-09-11T17:55:00.000Z */
                            timestamp: string;
                            /** @example 3600 */
                            uptimeSeconds?: number;
                            checks?: {
                                github: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
                                    message: string;
                                    /** @example 0.82 */
                                    latencyMs?: number;
                                };
                                server: {
                                    /** @example true */
                                    success: boolean;
                                    /** @example Integration is active and responsive */
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
    "/webhook/server/lifecycle": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Server Lifecycle Webhook
         * @description Outbound webhook dispatched by the server to notify the bot of startup and shutdown state changes.
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
                        /** @example SERVER_LIFECYCLE */
                        type: string;
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /**
                             * @example ONLINE
                             * @enum {string}
                             */
                            status: "ONLINE" | "OFFLINE" | "STARTING" | "SHUTTING_DOWN";
                            /** @example Server startup complete */
                            reason?: string;
                        };
                    };
                };
            };
            responses: {
                /** @description Webhook processed successfully by the bot */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Invalid signature */
                            error?: string;
                        };
                    };
                };
                /** @description Unauthorized signature failure */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Invalid signature */
                            error?: string;
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
    "/webhook/server/table-update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Database Table Update Webhook
         * @description Outbound webhook dispatched by the server whenever a record is created, updated, or deleted, allowing the bot to invalidate its local cache.
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
                        /** @example TABLE_UPDATE */
                        type: string;
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /** @example guild_settings */
                            tableName: string;
                            /**
                             * @example UPDATE
                             * @enum {string}
                             */
                            action: "CREATE" | "UPDATE" | "DELETE";
                            /** @example 1234567890 */
                            recordId: string;
                            record?: {
                                [key: string]: unknown;
                            } | null;
                        };
                    };
                };
            };
            responses: {
                /** @description Cache invalidated successfully by the bot */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Invalid signature */
                            error?: string;
                        };
                    };
                };
                /** @description Unauthorized signature failure */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Invalid signature */
                            error?: string;
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
    "/webhook/server/github": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * GitHub Event Webhook
         * @description Outbound webhook dispatched by the server to forward GitHub events to the bot.
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
                        /** @example GITHUB_EVENT */
                        type: string;
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /** @example push */
                            eventName: string;
                            /** @description Raw GitHub event payload */
                            payload: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
            responses: {
                /** @description Webhook processed successfully by the bot */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Invalid signature */
                            error?: string;
                        };
                    };
                };
                /** @description Unauthorized signature failure */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Invalid signature */
                            error?: string;
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
