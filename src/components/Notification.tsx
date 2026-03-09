import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Dimensions, View } from 'react-native';
import { useNotification } from '../context/NotificationContext';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const Notification: React.FC = () => {
    const { notification, hideNotification } = useNotification();
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (notification.visible) {
            Animated.spring(translateY, {
                toValue: insets.top + 10,
                useNativeDriver: true,
                tension: 40,
                friction: 7,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [notification.visible, insets.top, translateY]);

    if (!notification.message && !notification.visible) return null;

    const backgroundColor = notification.type === 'error'
        ? theme.colors.error
        : notification.type === 'success'
            ? theme.colors.accent
            : theme.colors.primary;

    const textColor = notification.type === 'success' ? theme.colors.primary : theme.colors.white;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }], backgroundColor }
            ]}
        >
            <Text style={[styles.text, { color: textColor }]}>{notification.message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 16,
        zIndex: 1000,
        ...theme.shadows.subtle,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        ...theme.typography.label,
        textAlign: 'center',
        fontWeight: '700',
    },
});
