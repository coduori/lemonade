import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcon } from './MaterialIcon';
import { theme } from '../theme';

interface SectionHeaderProps {
    title: string;
    onBack?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onBack }) => (
    <View style={styles.container}>
        {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialIcon name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        fontSize: 22,
    },
});
