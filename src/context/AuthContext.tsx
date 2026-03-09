import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    login: (username: string, token: string, ttl: string) => void;
    logout: () => void;
    authHeaders: { Authorization: string } | {};
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const parseTTL = (ttl: string): number => {
    // Basic parser for "5m", "1h", etc.
    const numeric = parseInt(ttl, 10);
    if (ttl.endsWith('m')) return numeric * 60 * 1000;
    if (ttl.endsWith('h')) return numeric * 60 * 60 * 1000;
    if (ttl.endsWith('s')) return numeric * 1000;
    return numeric; // Assume ms if no unit
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [logoutTimer, setLogoutTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const logout = useCallback(() => {
        setToken(null);
        setUsername(null);
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            setLogoutTimer(null);
        }
    }, [logoutTimer]);

    const login = (uName: string, authToken: string, ttl: string) => {
        setToken(authToken);
        setUsername(uName);

        const duration = parseTTL(ttl);
        console.log(`Setting logout timer for ${duration}ms (${ttl})`);

        const timer = setTimeout(() => {
            console.log('Session expired. Logging out.');
            logout();
        }, duration);

        setLogoutTimer(timer);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
        };
    }, [logoutTimer]);

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    return (
        <AuthContext.Provider value={{
            token,
            username,
            login,
            logout,
            authHeaders,
            isLoggedIn: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
