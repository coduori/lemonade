import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { theme } from '../theme';

interface StatCardProps {
    label: string;
    value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
    <Card style={styles.card}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </Card>
);

const styles = StyleSheet.create({
    card: {
        flex: 0.48,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
    },
    label: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginBottom: 4,
    },
    value: {
        ...theme.typography.h2,
        fontSize: 20,
    },
});
