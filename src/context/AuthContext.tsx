import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    token: string | null;
    username: string | null;
    login: (username: string, token: string, ttl: string) => void;
    logout: () => void;
    authHeaders: { Authorization: string } | {};
    isLoggedIn: boolean;
    isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ASYNC_STORAGE_KEY = '@anchorage_auth_data';

const parseTTL = (ttl: string): number => {
    const numeric = parseInt(ttl, 10);
    if (ttl.endsWith('m')) return numeric * 60 * 1000;
    if (ttl.endsWith('h')) return numeric * 60 * 60 * 1000;
    if (ttl.endsWith('s')) return numeric * 1000;
    return numeric;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [logoutTimer, setLogoutTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const logout = useCallback(async () => {
        setToken(null);
        setUsername(null);
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            setLogoutTimer(null);
        }
        try {
            await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear auth data from storage', e);
        }
    }, [logoutTimer]);

    const startLogoutTimer = useCallback((duration: number) => {
        if (logoutTimer) clearTimeout(logoutTimer);
        const timer = setTimeout(() => {
            console.log('Session expired. Logging out.');
            logout();
        }, duration);
        setLogoutTimer(timer);
    }, [logout, logoutTimer]);

    const login = async (uName: string, authToken: string, ttl: string) => {
        setToken(authToken);
        setUsername(uName);

        const duration = parseTTL(ttl);
        const expiryTime = Date.now() + duration;

        try {
            await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify({
                token: authToken,
                username: uName,
                expiryTime
            }));
        } catch (e) {
            console.error('Failed to save auth data to storage', e);
        }

        startLogoutTimer(duration);
    };

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedData = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
                if (storedData) {
                    const { token: sToken, username: sUsername, expiryTime } = JSON.parse(storedData);
                    const remainingTime = expiryTime - Date.now();

                    if (remainingTime > 0) {
                        setToken(sToken);
                        setUsername(sUsername);
                        startLogoutTimer(remainingTime);
                    } else {
                        await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
                    }
                }
            } catch (e) {
                console.error('Failed to load auth data from storage', e);
            } finally {
                setIsInitializing(false);
            }
        };

        loadAuthData();
    }, []); // Run once on mount

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
            isLoggedIn: !!token,
            isInitializing
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
