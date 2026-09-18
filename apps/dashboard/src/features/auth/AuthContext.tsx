import { createContext } from 'react';

export interface IAuthContext {
	isAuthenticated: boolean;
	isLoading: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	signIn: (client: 'browser' | 'tauri') => Promise<void>;
	signOut: () => Promise<void>;
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);
