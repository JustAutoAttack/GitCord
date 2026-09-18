import { useContext } from 'react';

import { HomeContext } from './HomeContext';

export const useHome = () => {
    const context = useContext(HomeContext);
    if (!context) {
        throw new Error('useHome must be used within an HomeProvider');
    }
    return context;
};
