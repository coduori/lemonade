import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { config } from '../config';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface DashboardScreenProps {
    username: string;
    onLogout: () => void;
}

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    basePremium?: number;
}

type ViewMode = 'dashboard' | 'categories' | 'products';

const DashboardScreen = ({ username, onLogout }: DashboardScreenProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const { showNotification } = useNotification();
    const { authHeaders } = useAuth();

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${config.baseUrl}/products`, {
                headers: {
                    ...authHeaders,
                }
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setProducts(data);
                setViewMode('categories');
            } else {
                showNotification(data?.message || 'Failed to fetch products or invalid data format', 'error');
            }
        } catch (error) {
            showNotification('Network error while fetching products', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const safeProducts = Array.isArray(products) ? products : [];
    const categories = Array.from(new Set(safeProducts.map(p => p.category)));
    const filteredProducts = safeProducts.filter(p => p.category === selectedCategory);

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View>
                    <Text style={styles.greeting}>Good morning, {username.split('_')[0]}</Text>
                    <Text style={styles.subGreeting}>Welcome back to Anchorage</Text>
                </View>
                <TouchableOpacity style={styles.profileButton} onPress={onLogout}>
                    <View style={styles.profileCircle}>
                        <Text style={styles.profileLetter}>{username[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.statsRow}>
                    <Card style={styles.statCardSmall}>
                        <Text style={styles.statLabelSmall}>Active Policies</Text>
                        <Text style={styles.statValueSmall}>3</Text>
                    </Card>
                    <Card style={styles.statCardSmall}>
                        <Text style={styles.statLabelSmall}>Active Claims</Text>
                        <Text style={styles.statValueSmall}>0</Text>
                    </Card>
                </View>


                {viewMode === 'dashboard' && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Manage Insurance</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.manageCard}
                            onPress={fetchProducts}
                            disabled={isLoading}
                        >
                            <View style={[styles.manageIconContainer, { backgroundColor: '#E0F2FE' }]}>
                                <Text style={[styles.manageIcon, { color: '#0EA5E9' }]}>📄</Text>
                            </View>
                            <View style={styles.manageDetails}>
                                <Text style={styles.manageTitle}>Apply for new Policy</Text>
                                <Text style={styles.manageDescription}>{isLoading ? 'Loading products...' : 'Start a new insurance application'}</Text>
                            </View>
                            <Text style={styles.manageChevron}>›</Text>
                        </TouchableOpacity>

                        {[
                            {
                                title: 'Check Validity',
                                description: 'Check if your sticker is expired',
                                icon: '🕒',
                                color: '#FFF8F0',
                                iconColor: '#FF8C00',
                            },
                            {
                                title: 'Get Certificate',
                                description: 'Download your insurance certificate',
                                icon: '📥',
                                color: '#F0FFF4',
                                iconColor: '#22C55E',
                            },
                            {
                                title: 'Cancel Cover',
                                description: 'Request cancellation of policy',
                                icon: '❌',
                                color: '#FFF5F5',
                                iconColor: '#EF4444',
                            },
                        ].map((item, i) => (
                            <TouchableOpacity key={i} style={styles.manageCard}>
                                <View style={[styles.manageIconContainer, { backgroundColor: item.color }]}>
                                    <Text style={[styles.manageIcon, { color: item.iconColor }]}>{item.icon}</Text>
                                </View>
                                <View style={styles.manageDetails}>
                                    <Text style={styles.manageTitle}>{item.title}</Text>
                                    <Text style={styles.manageDescription}>{item.description}</Text>
                                </View>
                                <Text style={styles.manageChevron}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {viewMode === 'categories' && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <TouchableOpacity onPress={() => setViewMode('dashboard')} style={styles.backButton}>
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={styles.sectionTitle}>Select Category</Text>
                        </View>
                        <View style={styles.categoryGrid}>
                            {categories.map((category, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.categoryCard}
                                    onPress={() => {
                                        setSelectedCategory(category);
                                        setViewMode('products');
                                    }}
                                >
                                    <Text style={styles.categoryIcon}>📦</Text>
                                    <Text style={styles.categoryName}>{category}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {viewMode === 'products' && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <TouchableOpacity onPress={() => setViewMode('categories')} style={styles.backButton}>
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={styles.sectionTitle}>{selectedCategory}</Text>
                        </View>
                        {filteredProducts.map((product) => (
                            <TouchableOpacity key={product.id} style={styles.manageCard}>
                                <View style={[styles.manageIconContainer, { backgroundColor: theme.colors.accentSoft }]}>
                                    <Text style={[styles.manageIcon, { color: theme.colors.primary }]}>🛡️</Text>
                                </View>
                                <View style={styles.manageDetails}>
                                    <Text style={styles.manageTitle}>{product.name}</Text>
                                    <Text style={styles.manageDescription}>{product.description}</Text>
                                </View>
                                <Text style={styles.manageChevron}>›</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                )}


            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
    },
    greeting: {
        ...theme.typography.h2,
        color: theme.colors.primary,
    },
    subGreeting: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginTop: 2,
    },
    profileButton: {
        padding: 4,
    },
    profileCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileLetter: {
        color: theme.colors.white,
        fontWeight: '700',
        fontSize: 16,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xxl,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    statCardSmall: {
        flex: 0.48,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
    },
    statLabelSmall: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginBottom: 4,
    },
    statValueSmall: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        ...theme.typography.h2,
        fontSize: 18,
    },
    manageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...theme.shadows.subtle,
    },
    manageIconContainer: {
        width: 52,
        height: 52,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    manageIcon: {
        fontSize: 24,
    },
    manageDetails: {
        flex: 1,
    },
    manageTitle: {
        ...theme.typography.h2,
        fontSize: 18,
        color: '#1E293B',
        marginBottom: 4,
    },
    manageDescription: {
        ...theme.typography.caption,
        color: '#64748B',
        fontSize: 14,
    },
    manageChevron: {
        fontSize: 24,
        color: '#94A3B8',
        marginLeft: 8,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    backButtonText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 16,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...theme.shadows.subtle,
    },
    categoryIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    categoryName: {
        ...theme.typography.label,
        textAlign: 'center',
        color: theme.colors.primary,
    },
});

export default DashboardScreen;
