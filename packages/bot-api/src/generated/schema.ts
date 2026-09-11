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
    "/health/ready": {
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
    "/health": {
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
    "/webhooks/server": {
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
         * @description Ingests state synchronization events from the API server.
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
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /**
                             * @example SHUTTING_DOWN
                             * @enum {string}
                             */
                            status: "ONLINE" | "OFFLINE" | "STARTING" | "SHUTTING_DOWN";
                            /** @example SIGTERM signal received */
                            reason?: string;
                        };
                    };
                };
            };
            responses: {
                /** @description Webhook processed successfully */
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
    "/webhooks/github": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * GitHub Webhook
         * @description Ingests repository event payloads directly from GitHub.
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
                        [key: string]: unknown;
                    };
                };
            };
            responses: {
                /** @description GitHub webhook processed successfully */
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
