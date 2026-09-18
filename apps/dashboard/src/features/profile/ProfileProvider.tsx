import React, { useMemo } from 'react';

import { ProfileContext, IProfileContext } from './ProfileContext';

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const value = useMemo<IProfileContext>(() => ({}), []);

    return (
        <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
    );
};
