import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcon } from './MaterialIcon';

interface ManageInsuranceCardProps {
    title: string;
    description: string;
    icon: string;
    backgroundColor: string;
    iconColor: string;
    onPress?: () => void;
    disabled?: boolean;
}

export const ManageInsuranceCard: React.FC<ManageInsuranceCardProps> = ({
    title,
    description,
    icon,
    backgroundColor,
    iconColor,
    onPress,
    disabled = false
}) => (
    <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        disabled={disabled}
    >
        <View style={[styles.iconContainer, { backgroundColor }]}>
            <MaterialIcon name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.details}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
        <MaterialIcon name="chevron-right" size={24} color="#94A3B8" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    details: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
});
