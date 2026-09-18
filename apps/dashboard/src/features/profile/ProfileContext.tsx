import { createContext } from 'react';

export interface IProfileContext {}

export const ProfileContext = createContext<IProfileContext | undefined>(undefined);
