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
    "/api/health/ready": {
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
    "/api/health": {
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
    "/api/v1/auth/sign-up": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Redirect to Discord OAuth
         * @description Initiates Discord OAuth2 authentication flow.
         */
        get: {
            parameters: {
                query: {
                    client: "browser" | "tauri";
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Redirects to Discord */
                302: {
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
    "/api/v1/auth/sign-out": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sign out
         * @description Clears the current session for the authenticated user.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Signed out successfully */
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
                /** @description Unauthorized */
                401: {
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
    "/api/v1/auth/discord/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Discord OAuth Callback
         * @description Handles the OAuth callback from Discord, logs in or registers the user, creates their session, and redirects to the frontend.
         */
        get: {
            parameters: {
                query: {
                    code: string;
                    state: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Redirects to frontend application */
                302: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Authentication failed */
                401: {
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
    "/api/v1/integrations/github/install": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Initiate GitHub App Installation
         * @description Generates state token and redirects the user to the GitHub App installation page.
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
                /** @description Redirects to GitHub App installation */
                302: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
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
    "/api/v1/integrations/discord/install": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Initiate Discord Bot Installation
         * @description Generates state token and redirects the user to the Discord Bot authorization page.
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
                /** @description Redirects to Discord Bot authorization */
                302: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Unauthorized */
                401: {
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
    "/api/v1/integrations/discord/install-callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Discord Bot Installation Callback
         * @description Handles the callback when a user adds the Discord bot to their server.
         */
        get: {
            parameters: {
                query: {
                    guild_id: string;
                    permissions?: string;
                    state?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Discord Bot added successfully */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example true */
                            success: boolean;
                            /** @example Integration configured successfully */
                            message: string;
                            data?: {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
                /** @description Invalid request parameters */
                400: {
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
    "/api/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List users
         * @description Returns all users.
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
                /** @description Users */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example usr_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            discordId: string;
                            /** @example JohnDoe */
                            displayName: string;
                            /** @example https://cdn.discordapp.com/avatars/123/abc.png */
                            avatarUrl: string | null;
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
         * Create user
         * @description Creates a new user.
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
                        discordId: string;
                        /** @example JohnDoe */
                        displayName: string;
                        /**
                         * Format: uri
                         * @example https://cdn.discordapp.com/avatars/123/abc.png
                         */
                        avatarUrl?: string | null;
                    };
                };
            };
            responses: {
                /** @description User created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example usr_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            discordId: string;
                            /** @example JohnDoe */
                            displayName: string;
                            /** @example https://cdn.discordapp.com/avatars/123/abc.png */
                            avatarUrl: string | null;
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
                /** @description User already exists */
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
    "/api/v1/users/discord/{discordId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get user by Discord ID
         * @description Returns a user by their Discord ID.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    discordId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description User */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example usr_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            discordId: string;
                            /** @example JohnDoe */
                            displayName: string;
                            /** @example https://cdn.discordapp.com/avatars/123/abc.png */
                            avatarUrl: string | null;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description User not found */
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
    "/api/v1/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get user by ID
         * @description Returns a user by ID.
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
                /** @description User */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example usr_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            discordId: string;
                            /** @example JohnDoe */
                            displayName: string;
                            /** @example https://cdn.discordapp.com/avatars/123/abc.png */
                            avatarUrl: string | null;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description User not found */
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
         * Delete user
         * @description Deletes an existing user.
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
                /** @description User deleted */
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
                /** @description User not found */
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
         * Update user
         * @description Updates an existing user.
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
                        /** @example JohnDoeUpdated */
                        displayName?: string;
                        /**
                         * Format: uri
                         * @example https://cdn.discordapp.com/avatars/123/abc.png
                         */
                        avatarUrl?: string | null;
                    };
                };
            };
            responses: {
                /** @description User updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example usr_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            discordId: string;
                            /** @example JohnDoe */
                            displayName: string;
                            /** @example https://cdn.discordapp.com/avatars/123/abc.png */
                            avatarUrl: string | null;
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
                /** @description User not found */
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
    "/api/v1/user-sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List user sessions
         * @description Returns all user sessions.
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
                /** @description User sessions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example sess_123456 */
                            id: string;
                            /** @example usr_123456 */
                            userId: string;
                            /** @example encrypted_access_token_string */
                            accessTokenEncrypted: string;
                            /** @example encrypted_refresh_token_string */
                            refreshTokenEncrypted: string;
                            /** @example 2026-09-17T14:30:00.000Z */
                            expiresAt: string;
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
         * Create user session
         * @description Creates a new user session.
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
                        /** @example usr_123456 */
                        userId: string;
                        /** @example encrypted_access_token_string */
                        accessTokenEncrypted: string;
                        /** @example encrypted_refresh_token_string */
                        refreshTokenEncrypted: string;
                        /** @example 2026-09-17T14:30:00.000Z */
                        expiresAt: string;
                    };
                };
            };
            responses: {
                /** @description User session created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example sess_123456 */
                            id: string;
                            /** @example usr_123456 */
                            userId: string;
                            /** @example encrypted_access_token_string */
                            accessTokenEncrypted: string;
                            /** @example encrypted_refresh_token_string */
                            refreshTokenEncrypted: string;
                            /** @example 2026-09-17T14:30:00.000Z */
                            expiresAt: string;
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
                /** @description User not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Session already exists for user */
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
    "/api/v1/user-sessions/user/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get user session by User ID
         * @description Returns the user session associated with a specific user ID.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description User session */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example sess_123456 */
                            id: string;
                            /** @example usr_123456 */
                            userId: string;
                            /** @example encrypted_access_token_string */
                            accessTokenEncrypted: string;
                            /** @example encrypted_refresh_token_string */
                            refreshTokenEncrypted: string;
                            /** @example 2026-09-17T14:30:00.000Z */
                            expiresAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description User session not found */
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
    "/api/v1/user-sessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get user session by ID
         * @description Returns a user session by ID.
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
                /** @description User session */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example sess_123456 */
                            id: string;
                            /** @example usr_123456 */
                            userId: string;
                            /** @example encrypted_access_token_string */
                            accessTokenEncrypted: string;
                            /** @example encrypted_refresh_token_string */
                            refreshTokenEncrypted: string;
                            /** @example 2026-09-17T14:30:00.000Z */
                            expiresAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description User session not found */
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
         * Delete user session
         * @description Deletes an existing user session.
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
                /** @description User session deleted */
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
                /** @description User session not found */
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
         * Update user session
         * @description Updates an existing user session.
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
                        /** @example usr_123456 */
                        userId?: string;
                        /** @example encrypted_access_token_string */
                        accessTokenEncrypted?: string;
                        /** @example encrypted_refresh_token_string */
                        refreshTokenEncrypted?: string;
                        /** @example 2026-09-17T14:30:00.000Z */
                        expiresAt?: string;
                    };
                };
            };
            responses: {
                /** @description User session updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example sess_123456 */
                            id: string;
                            /** @example usr_123456 */
                            userId: string;
                            /** @example encrypted_access_token_string */
                            accessTokenEncrypted: string;
                            /** @example encrypted_refresh_token_string */
                            refreshTokenEncrypted: string;
                            /** @example 2026-09-17T14:30:00.000Z */
                            expiresAt: string;
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
                /** @description User session not found */
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
    "/api/v1/bot-commands": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List bot commands
         * @description Returns all registered bot commands.
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
                /** @description Bot commands */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cmd_123456 */
                            id: string;
                            /** @example sync */
                            commandName: string;
                            /** @example Synchronize repository branches */
                            description: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                        }[];
                    };
                };
            };
        };
        put?: never;
        /** Create bot command */
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
                        /** @example sync */
                        commandName: string;
                        /** @example Synchronize repository branches */
                        description: string;
                    };
                };
            };
            responses: {
                /** @description Bot command created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cmd_123456 */
                            id: string;
                            /** @example sync */
                            commandName: string;
                            /** @example Synchronize repository branches */
                            description: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
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
    "/api/v1/bot-commands/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get bot command by ID */
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
                /** @description Bot command */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cmd_123456 */
                            id: string;
                            /** @example sync */
                            commandName: string;
                            /** @example Synchronize repository branches */
                            description: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                        };
                    };
                };
                /** @description Bot command not found */
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
        /** Delete bot command */
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
                /** @description Bot command deleted */
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
                /** @description Bot command not found */
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
        /** Update bot command */
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
                        /** @example sync */
                        commandName?: string;
                        /** @example Updated description */
                        description?: string;
                    };
                };
            };
            responses: {
                /** @description Bot command updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cmd_123456 */
                            id: string;
                            /** @example sync */
                            commandName: string;
                            /** @example Synchronize repository branches */
                            description: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                        };
                    };
                };
                /** @description Bot command not found */
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
    "/api/v1/bot-commands/name/{commandName}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get bot command by Name */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    commandName: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Bot command */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example cmd_123456 */
                            id: string;
                            /** @example sync */
                            commandName: string;
                            /** @example Synchronize repository branches */
                            description: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                        };
                    };
                };
                /** @description Bot command not found */
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
    "/api/v1/github-app-installations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List GitHub app installations
         * @description Returns all GitHub app installations.
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
                /** @description GitHub app installations */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example inst_123456 */
                            id: string;
                            /** @example 12345678 */
                            installationId: number;
                            /** @example gitcord-org */
                            accountLogin: string;
                            /** @example Organization */
                            accountType: string;
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
         * Create GitHub app installation
         * @description Creates a new GitHub app installation.
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
                        /** @example 12345678 */
                        installationId: number;
                        /** @example gitcord-org */
                        accountLogin: string;
                        /** @example Organization */
                        accountType: string;
                    };
                };
            };
            responses: {
                /** @description GitHub app installation created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example inst_123456 */
                            id: string;
                            /** @example 12345678 */
                            installationId: number;
                            /** @example gitcord-org */
                            accountLogin: string;
                            /** @example Organization */
                            accountType: string;
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
    "/api/v1/github-app-installations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get GitHub app installation
         * @description Returns a GitHub app installation by ID.
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
                /** @description GitHub app installation */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example inst_123456 */
                            id: string;
                            /** @example 12345678 */
                            installationId: number;
                            /** @example gitcord-org */
                            accountLogin: string;
                            /** @example Organization */
                            accountType: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description GitHub app installation not found */
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
         * Delete GitHub app installation
         * @description Deletes an existing GitHub app installation.
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
                /** @description GitHub app installation deleted */
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
                /** @description GitHub app installation not found */
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
         * Update GitHub app installation
         * @description Updates an existing GitHub app installation.
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
                        /** @example 12345678 */
                        installationId?: number;
                        /** @example gitcord-org */
                        accountLogin?: string;
                        /** @example Organization */
                        accountType?: string;
                    };
                };
            };
            responses: {
                /** @description GitHub app installation updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example inst_123456 */
                            id: string;
                            /** @example 12345678 */
                            installationId: number;
                            /** @example gitcord-org */
                            accountLogin: string;
                            /** @example Organization */
                            accountType: string;
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
                /** @description GitHub app installation not found */
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
    "/api/v1/github-app-installations/installation/{installationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get GitHub app installation by installation ID
         * @description Returns a GitHub app installation by its numeric installation ID.
         */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    installationId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description GitHub app installation */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example inst_123456 */
                            id: string;
                            /** @example 12345678 */
                            installationId: number;
                            /** @example gitcord-org */
                            accountLogin: string;
                            /** @example Organization */
                            accountType: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description GitHub app installation not found */
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
    "/api/v1/github-repositories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List GitHub repositories
         * @description Returns all GitHub repositories, optionally filtered by GitHub App Installation ID.
         */
        get: {
            parameters: {
                query?: {
                    githubAppInstallationId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description GitHub repositories */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example repo_123456 */
                            id: string;
                            /** @example 12345678 */
                            githubAppInstallationId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example gitcord-org/core-service */
                            repositoryFullName: string;
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
         * Create GitHub repository
         * @description Creates a new GitHub repository entry.
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
                        /** @example 12345678 */
                        githubAppInstallationId: string;
                        /**
                         * Format: uri
                         * @example https://github.com/gitcord-org/core-service
                         */
                        repositoryUrl: string;
                        /** @example gitcord-org/core-service */
                        repositoryFullName: string;
                    };
                };
            };
            responses: {
                /** @description GitHub repository created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example repo_123456 */
                            id: string;
                            /** @example 12345678 */
                            githubAppInstallationId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example gitcord-org/core-service */
                            repositoryFullName: string;
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
    "/api/v1/github-repositories/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get GitHub repository by URL
         * @description Returns the GitHub repository matching a specific repository URL.
         */
        get: {
            parameters: {
                query: {
                    repositoryUrl: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description GitHub repository */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example repo_123456 */
                            id: string;
                            /** @example 12345678 */
                            githubAppInstallationId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example gitcord-org/core-service */
                            repositoryFullName: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description GitHub repository not found */
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
    "/api/v1/github-repositories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get GitHub repository
         * @description Returns a GitHub repository by ID.
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
                /** @description GitHub repository */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example repo_123456 */
                            id: string;
                            /** @example 12345678 */
                            githubAppInstallationId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example gitcord-org/core-service */
                            repositoryFullName: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description GitHub repository not found */
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
         * Delete GitHub repository
         * @description Deletes an existing GitHub repository entry.
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
                /** @description GitHub repository deleted */
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
                /** @description GitHub repository not found */
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
         * Update GitHub repository
         * @description Updates an existing GitHub repository entry.
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
                        /** @example 12345678 */
                        githubAppInstallationId?: string;
                        /**
                         * Format: uri
                         * @example https://github.com/gitcord-org/core-service
                         */
                        repositoryUrl?: string;
                        /** @example gitcord-org/core-service */
                        repositoryFullName?: string;
                    };
                };
            };
            responses: {
                /** @description GitHub repository updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example repo_123456 */
                            id: string;
                            /** @example 12345678 */
                            githubAppInstallationId: string;
                            /**
                             * Format: uri
                             * @example https://github.com/gitcord-org/core-service
                             */
                            repositoryUrl: string;
                            /** @example gitcord-org/core-service */
                            repositoryFullName: string;
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
                /** @description GitHub repository not found */
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
    "/api/v1/guild-repositories": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List guild repositories
         * @description Returns all guild repositories, optionally filtered by guildId or GitHub repository ID.
         */
        get: {
            parameters: {
                query?: {
                    guildId?: string;
                    githubRepositoryId?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild repositories */
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
                            /** @example repo_123456 */
                            githubRepositoryId: string;
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
         * Create guild repository
         * @description Creates a new guild repository subscription.
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
                        /** @example repo_123456 */
                        githubRepositoryId: string;
                        /** @example 123456789012345679 */
                        commandChannelId: string;
                        /** @example 123456789012345680 */
                        notificationChannelId: string;
                    };
                };
            };
            responses: {
                /** @description Guild repository created */
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
                            /** @example repo_123456 */
                            githubRepositoryId: string;
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
    "/api/v1/guild-repositories/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild repository by guild and GitHub repository
         * @description Returns the guild repository matching a specific guild ID and GitHub repository ID.
         */
        get: {
            parameters: {
                query: {
                    guildId: string;
                    githubRepositoryId: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild repository */
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
                            /** @example repo_123456 */
                            githubRepositoryId: string;
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
                /** @description Guild repository not found */
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
    "/api/v1/guild-repositories/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild repository
         * @description Returns a guild repository by ID.
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
                /** @description Guild repository */
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
                            /** @example repo_123456 */
                            githubRepositoryId: string;
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
                /** @description Guild repository not found */
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
         * Delete guild repository
         * @description Deletes an existing guild repository subscription.
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
                /** @description Guild repository deleted */
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
                /** @description Guild repository not found */
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
         * Update guild repository
         * @description Updates an existing guild repository subscription.
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
                        /** @example repo_123456 */
                        githubRepositoryId?: string;
                        /** @example 123456789012345679 */
                        commandChannelId?: string;
                        /** @example 123456789012345680 */
                        notificationChannelId?: string;
                    };
                };
            };
            responses: {
                /** @description Guild repository updated */
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
                            /** @example repo_123456 */
                            githubRepositoryId: string;
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
                /** @description Guild repository not found */
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
    "/api/v1/guild-repositories/command-channel/{commandChannelId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild repository by command channel
         * @description Returns the guild repository associated with a command channel.
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
                /** @description Guild repository */
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
                            /** @example repo_123456 */
                            githubRepositoryId: string;
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
                /** @description Guild repository not found */
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
         * @description Returns all guild settings configurations, optionally filtered by notifyOnConnection.
         */
        get: {
            parameters: {
                query?: {
                    notifyOnConnection?: boolean;
                };
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
                            /**
                             * @description Whether to notify on connection
                             * @example true
                             */
                            notifyOnConnection: boolean;
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
                        /**
                         * @description Whether to notify on connection
                         * @example true
                         */
                        notifyOnConnection?: boolean;
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
                            /**
                             * @description Whether to notify on connection
                             * @example true
                             */
                            notifyOnConnection: boolean;
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
                            /**
                             * @description Whether to notify on connection
                             * @example true
                             */
                            notifyOnConnection: boolean;
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
                        /**
                         * @description Whether to notify on connection
                         * @example true
                         */
                        notifyOnConnection?: boolean;
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
                            /**
                             * @description Whether to notify on connection
                             * @example true
                             */
                            notifyOnConnection: boolean;
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
                            /**
                             * @description Whether to notify on connection
                             * @example true
                             */
                            notifyOnConnection: boolean;
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
                            /**
                             * @description Whether to notify on connection
                             * @example true
                             */
                            notifyOnConnection: boolean;
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
    "/api/v1/guild-user-permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List guild user permissions
         * @description Returns all guild user permissions, optionally filtered by guildId.
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
                /** @description Guild user permissions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example perm_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 987654321098765432 */
                            discordUserId: string;
                            /** @example cmd_123456 */
                            commandId: string;
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
         * Create guild user permission
         * @description Grants a command permission to a user in a guild.
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
                        /** @example 987654321098765432 */
                        discordUserId: string;
                        /** @example cmd_123456 */
                        commandId: string;
                    };
                };
            };
            responses: {
                /** @description Guild user permission created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example perm_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 987654321098765432 */
                            discordUserId: string;
                            /** @example cmd_123456 */
                            commandId: string;
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
                /** @description Bot command not found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description Permission already exists */
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
    "/api/v1/guild-user-permissions/lookup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get permissions by guild and user
         * @description Returns all command permissions for a specific user within a guild.
         */
        get: {
            parameters: {
                query: {
                    guildId: string;
                    discordUserId: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Guild user permissions */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example perm_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 987654321098765432 */
                            discordUserId: string;
                            /** @example cmd_123456 */
                            commandId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        }[];
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
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/guild-user-permissions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get guild user permission by ID
         * @description Returns a guild user permission by ID.
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
                /** @description Guild user permission */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example perm_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 987654321098765432 */
                            discordUserId: string;
                            /** @example cmd_123456 */
                            commandId: string;
                            /** @example 2026-08-17T14:30:00.000Z */
                            updatedAt: string;
                            /** @example 2026-08-01T10:00:00.000Z */
                            createdAt: string;
                        };
                    };
                };
                /** @description Permission not found */
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
         * Delete guild user permission
         * @description Deletes an existing guild user permission.
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
                /** @description Guild user permission deleted */
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
                /** @description Permission not found */
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
         * Update guild user permission
         * @description Updates an existing guild user permission.
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
                        /** @example 987654321098765432 */
                        discordUserId?: string;
                        /** @example cmd_123456 */
                        commandId?: string;
                    };
                };
            };
            responses: {
                /** @description Guild user permission updated */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": {
                            /** @example perm_123456 */
                            id: string;
                            /** @example 123456789012345678 */
                            guildId: string;
                            /** @example 987654321098765432 */
                            discordUserId: string;
                            /** @example cmd_123456 */
                            commandId: string;
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
                /** @description Permission or command not found */
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
    "/webhook/github": {
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
                /** @description Invalid GitHub webhook payload */
                400: {
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
                /** @description Internal server error processing webhook */
                500: {
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
export interface webhooks {
    serverLifecycle: {
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
            requestBody: {
                content: {
                    "application/json": {
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /** @example ONLINE */
                            status: string;
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
    tableUpdate: {
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
            requestBody: {
                content: {
                    "application/json": {
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /**
                             * @example guild_settings
                             * @enum {string}
                             */
                            tableName: "users" | "user_sessions" | "github_app_installations" | "github_repositories" | "bot_commands" | "guild_user_permissions" | "guild_repositories" | "guild_settings";
                            /**
                             * @example UPDATE
                             * @enum {string}
                             */
                            action: "CREATE" | "UPDATE" | "DELETE";
                            /** @example 1234567890 */
                            recordId: string;
                            /**
                             * @example {
                             *       "prefix": "!"
                             *     }
                             */
                            record?: Record<string, never> | null;
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
    githubEvent: {
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
         * @description Outbound webhook dispatched by the server to forward unhandled GitHub event payloads to the bot for rendering and notifications.
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
                        /** @example 1723917300000 */
                        timestamp: number;
                        data: {
                            /** @example push */
                            eventName: string;
                            /**
                             * @example {
                             *       "ref": "refs/heads/main"
                             *     }
                             */
                            payload: Record<string, never>;
                        };
                    };
                };
            };
            responses: {
                /** @description GitHub event processed successfully by the bot */
                200: {
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
}
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
