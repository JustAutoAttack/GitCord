import { createContext } from 'react';

import {
	User
} from '@types';

export interface IUserContext {
	user: User | null;
	isLoading: boolean;
	error: Error | null;
	refresh: () => Promise<void>;
}

export const UserContext = createContext<IUserContext | undefined>(undefined);
