import { createContext } from 'react';

export interface IHomeContext {}

export const HomeContext = createContext<IHomeContext | undefined>(undefined);
