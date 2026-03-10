import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../theme';

interface InputProps extends TextInputProps {
    label: string;
    rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, rightElement, style, ...props }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, style]}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.placeholder}
                    {...props}
                />
                {rightElement && (
                    <View style={styles.rightElement}>
                        {rightElement}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.borderRadius.lg,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 20,
        color: theme.colors.primary,
        fontSize: theme.typography.body.fontSize,
    },
    rightElement: {
        paddingRight: 16,
    },
});
