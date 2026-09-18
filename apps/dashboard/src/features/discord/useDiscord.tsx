import { useContext } from 'react';

import { DiscordContext } from './DiscordContext';

export const useDiscord = () => {
    const context = useContext(DiscordContext);
    if (!context) {
        throw new Error('useDiscord must be used within an userProvider');
    }
    return context;
};
