import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from './Card';
import { MaterialIcon } from './MaterialIcon';
import { theme } from '../theme';

interface ResultRider {
    mandatory: boolean;
    name: string;
    code: string;
    premium: number;
}

interface ComparisonResult {
    insurerProductId: string;
    insurerId: string;
    productId: string;
    insurerName: string;
    productName: string;
    premium: number;
    riders: ResultRider[];
}

interface ComparisonResultCardProps {
    result: ComparisonResult;
    onSelect: (result: ComparisonResult) => void;
    isLoading: boolean;
    selectedRiders: any[];
    ridersRegistry: any[];
    onRemoveRider: (riderId: string) => void;
}

export const ComparisonResultCard: React.FC<ComparisonResultCardProps> = ({
    result,
    onSelect,
    isLoading,
    selectedRiders,
    ridersRegistry,
    onRemoveRider,
}) => (
    <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
            <View style={styles.insurerInfo}>
                <Text style={styles.insurerName}>{result.insurerName}</Text>
                <Text style={styles.productNameSnippet}>{result.productName}</Text>
            </View>
            <View style={styles.premiumContainer}>
                <Text style={styles.currencyPrefix}>KES</Text>
                <Text style={styles.premiumValue}>{result.premium.toLocaleString()}</Text>
            </View>
        </View>

        {result.riders && result.riders.length > 0 && (
            <View style={styles.resultRidersList}>
                <Text style={styles.ridersListTitle}>Included Riders & Costs</Text>
                {result.riders.map((rider, rIdx) => {
                    const originalRiderId = ridersRegistry.find(ro => ro.name === rider.name)?.id;
                    const isRemovable = selectedRiders.some(sr => sr.riderId === originalRiderId);

                    return (
                        <View key={rIdx} style={styles.resultRiderItem}>
                            <View style={styles.riderBullet} />
                            <Text style={styles.resultRiderName}>{rider.name}</Text>
                            <Text style={styles.resultRiderPremium}>
                                KES {rider.premium.toLocaleString()}
                            </Text>
                            {isRemovable && originalRiderId && (
                                <TouchableOpacity
                                    onPress={() => onRemoveRider(originalRiderId)}
                                    style={styles.deleteRiderButton}
                                >
                                    <MaterialIcon name="delete-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
            </View>
        )}

        <TouchableOpacity
            style={styles.selectProviderButton}
            onPress={() => onSelect(result)}
            disabled={isLoading}
        >
            <Text style={styles.selectProviderText}>
                {isLoading ? "Processing..." : "Select Provider"}
            </Text>
            <MaterialIcon name="arrow-forward" size={18} color={theme.colors.white} />
        </TouchableOpacity>
    </Card>
);

const styles = StyleSheet.create({
    resultCard: {
        marginBottom: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    insurerInfo: {
        flex: 1,
        marginRight: 12,
    },
    insurerName: {
        ...theme.typography.label,
        fontSize: 16,
        color: '#1E293B',
    },
    productNameSnippet: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        marginTop: 4,
        fontWeight: '600',
    },
    premiumContainer: {
        alignItems: 'flex-end',
    },
    currencyPrefix: {
        ...theme.typography.caption,
        color: '#94A3B8',
        fontWeight: '700',
    },
    premiumValue: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        fontSize: 22,
    },
    resultRidersList: {
        marginTop: 16,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
    },
    ridersListTitle: {
        ...theme.typography.caption,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    resultRiderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    riderBullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
        marginRight: 8,
    },
    resultRiderName: {
        ...theme.typography.caption,
        color: '#334155',
        flex: 1,
    },
    resultRiderPremium: {
        ...theme.typography.caption,
        color: '#1E293B',
        fontWeight: '600',
    },
    deleteRiderButton: {
        padding: 4,
        marginLeft: 8,
    },
    selectProviderButton: {
        marginTop: 16,
        backgroundColor: theme.colors.primary,
        height: 44,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectProviderText: {
        color: theme.colors.white,
        fontWeight: '700',
        marginRight: 8,
    },
});
