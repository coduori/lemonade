import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
    hideNotification: () => void;
    notification: {
        message: string;
        type: NotificationType;
        visible: boolean;
    };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<{
        message: string;
        type: NotificationType;
        visible: boolean;
    }>({
        message: '',
        type: 'info',
        visible: false,
    });

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        setNotification({ message, type, visible: true });

        // Auto-hide after 4 seconds
        setTimeout(() => {
            hideNotification();
        }, 4000);
    }, []);

    const hideNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification, notification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
