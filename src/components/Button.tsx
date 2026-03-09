import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'accent';
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, style, textStyle, variant = 'primary', disabled }) => {
    return (
        <TouchableOpacity
            style={[styles.button, styles[variant], disabled && styles.disabled, style]}
            onPress={disabled ? undefined : onPress}
            activeOpacity={disabled ? 1 : 0.8}
            disabled={disabled}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.pill,
        paddingVertical: 18,
        alignItems: 'center',
        width: '100%',
    },
    text: {
        ...theme.typography.buttonSuccess,
        color: theme.colors.white,
    },
    primary: {
        backgroundColor: theme.colors.primary,
    },
    secondary: {
        backgroundColor: theme.colors.secondary,
    },
    accent: {
        backgroundColor: theme.colors.accent,
    },
    disabled: {
        opacity: 0.5,
    },
});
