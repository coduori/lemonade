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
import { Input } from '../components/Input';
import { MaterialIcon } from '../components/MaterialIcon';
import * as yup from 'yup';

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

const vehicleDataSchema = yup.object({
    registration: yup.string().trim().optional(),
    passengerCapacity: yup.string().trim().optional(),
    tonnage: yup.string().trim().optional(),
    yearOfManufacture: yup.string().trim().optional(),
    make: yup.string().trim().optional(),
    model: yup.string().trim().optional(),
});

const comparePremiumsSchema = yup.object({
    vehicleValue: yup.number().optional(),
    productId: yup.string().trim().uuid().required(),
    vehicleId: yup.string().trim().uuid().optional(),
    vehicleData: vehicleDataSchema,
    riderOptions: yup.array()
        .of(
            yup.object({
                riderId: yup.string().trim().uuid().required(),
                value: yup.number().positive().min(1).optional(),
            })
        )
        .min(0)
        .required(),
})
    .test(
        'not-both-vehicle-id-and-data',
        'Cannot provide both vehicleId and vehicleData - choose one or none',
        function (premiumComparisonData: any) {
            const { vehicleId, vehicleData } = premiumComparisonData;
            const hasVehicleId = !!vehicleId;
            const hasVehicleData = !!vehicleData && Object.keys(vehicleData).length > 0;
            return !(hasVehicleId && hasVehicleData);
        }
    )
    .noUnknown(true, 'Unknown field provided')
    .strict(true);

type ViewMode = 'dashboard' | 'categories' | 'products' | 'compare';

interface VehicleData {
    registration?: string;
    passengerCapacity?: string;
    tonnage?: string;
    yearOfManufacture?: string;
    make?: string;
    model?: string;
    vehicleValue?: string;
}

const DashboardScreen = ({ username, onLogout }: DashboardScreenProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [vehicleData, setVehicleData] = useState<VehicleData>({});
    const [searchQuery, setSearchQuery] = useState('');
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
            const responseData = await response.json();
            if (response.ok && responseData.data) {
                setProducts(responseData.data.products || []);
                setCategories(responseData.data.categories || []);
                setViewMode('categories');
            } else {
                showNotification(responseData?.message || 'Failed to fetch products or invalid data format', 'error');
            }
        } catch (error) {
            showNotification('Network error while fetching products', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompare = async () => {
        if (!selectedProduct) return;
        setIsLoading(true);
        try {
            const payload = {
                productId: selectedProduct.id,
                vehicleData: {
                    ...vehicleData,
                    vehicleValue: undefined, // ensure it's not in vehicleData if it belongs outside
                },
                riderOptions: [], // Base implementation
                vehicleValue: vehicleData.vehicleValue ? parseFloat(vehicleData.vehicleValue) : undefined,
            };

            // Validate using schema
            await comparePremiumsSchema.validate(payload);

            const response = await fetch(`${config.baseUrl}/premiums/compare`, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                showNotification('Premium comparison successful!', 'success');
                // Handle results (e.g., show a results modal or screen)
                console.log('Comparison results:', data);
            } else {
                showNotification(data?.message || 'Failed to compare premiums', 'error');
            }
        } catch (error) {
            showNotification('Network error during premium comparison', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const safeProducts = Array.isArray(products) ? products : [];
    const safeCategories = Array.isArray(categories) && categories.length > 0
        ? categories
        : Array.from(new Set(safeProducts.map(p => p.category)));

    const filteredProducts = safeProducts.filter(p => p.category === selectedCategory);

    const searchResults = searchQuery.trim()
        ? safeProducts.filter(p =>
            (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (p.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        )
        : [];

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
                                <MaterialIcon name="description" size={24} color="#0EA5E9" />
                            </View>
                            <View style={styles.manageDetails}>
                                <Text style={styles.manageTitle}>Apply for new Policy</Text>
                                <Text style={styles.manageDescription}>{isLoading ? 'Loading products...' : 'Start a new insurance application'}</Text>
                            </View>
                            <MaterialIcon name="chevron-right" size={24} color="#94A3B8" />
                        </TouchableOpacity>

                        {[
                            {
                                title: 'Check Validity',
                                description: 'Check if your sticker is expired',
                                icon: 'schedule',
                                color: '#FFF8F0',
                                iconColor: '#FF8C00',
                            },
                            {
                                title: 'Get Certificate',
                                description: 'Download your insurance certificate',
                                icon: 'file-download',
                                color: '#F0FFF4',
                                iconColor: '#22C55E',
                            },
                            {
                                title: 'Cancel Cover',
                                description: 'Request cancellation of policy',
                                icon: 'cancel',
                                color: '#FFF5F5',
                                iconColor: '#EF4444',
                            },
                        ].map((item, i) => (
                            <TouchableOpacity key={i} style={styles.manageCard}>
                                <View style={[styles.manageIconContainer, { backgroundColor: item.color }]}>
                                    <MaterialIcon name={item.icon} size={24} color={item.iconColor} />
                                </View>
                                <View style={styles.manageDetails}>
                                    <Text style={styles.manageTitle}>{item.title}</Text>
                                    <Text style={styles.manageDescription}>{item.description}</Text>
                                </View>
                                <MaterialIcon name="chevron-right" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {viewMode === 'categories' && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <TouchableOpacity onPress={() => setViewMode('dashboard')} style={styles.backButton}>
                                <MaterialIcon name="arrow-back" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.sectionTitle}>Browse Products</Text>
                        </View>

                        <Input
                            label=""
                            placeholder="Search products..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchBar}
                        />

                        {searchQuery.trim() !== '' ? (
                            <>
                                <Text style={styles.subSectionTitle}>Search Results</Text>
                                {searchResults.length > 0 ? (
                                    searchResults.map((product) => (
                                        <TouchableOpacity key={product.id} style={styles.manageCard}>
                                            <View style={[styles.manageIconContainer, { backgroundColor: theme.colors.accentSoft }]}>
                                                <MaterialIcon name="verified-user" size={24} color={theme.colors.primary} />
                                            </View>
                                            <View style={styles.manageDetails}>
                                                <Text style={styles.manageTitle}>{product.name}</Text>
                                                <Text style={styles.manageDescription}>{product.description}</Text>
                                                <Text style={styles.categoryBadge}>{product.category}</Text>
                                            </View>
                                            <MaterialIcon name="chevron-right" size={24} color="#94A3B8" />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text style={styles.noResultsText}>No products match your search.</Text>
                                )}
                            </>
                        ) : (
                            <>
                                <Text style={styles.subSectionTitle}>Select Category</Text>
                                <View style={styles.categoryGrid}>
                                    {safeCategories.map((category, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            style={styles.categoryCard}
                                            onPress={() => {
                                                const categoryName = typeof category === 'string' ? category : (category as any).name;
                                                setSelectedCategory(categoryName);
                                                setViewMode('products');
                                            }}
                                        >
                                            <MaterialIcon name="inventory-2" size={32} color={theme.colors.primary} style={{ marginBottom: 12 }} />
                                            <Text style={styles.categoryName}>{typeof category === 'string' ? category : (category as any).name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </>
                )}

                {viewMode === 'products' && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <TouchableOpacity onPress={() => setViewMode('categories')} style={styles.backButton}>
                                <MaterialIcon name="arrow-back" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.sectionTitle}>{selectedCategory}</Text>
                        </View>

                        <Input
                            label=""
                            placeholder={`Search in ${selectedCategory}...`}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchBar}
                        />

                        {(searchQuery.trim() !== '' ? searchResults.filter(p => p.category === selectedCategory) : filteredProducts).map((product) => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.manageCard}
                                onPress={() => {
                                    setSelectedProduct(product);
                                    setVehicleData({});
                                    setViewMode('compare');
                                }}
                            >
                                <View style={[styles.manageIconContainer, { backgroundColor: theme.colors.accentSoft }]}>
                                    <MaterialIcon name="verified-user" size={24} color={theme.colors.primary} />
                                </View>
                                <View style={styles.manageDetails}>
                                    <Text style={styles.manageTitle}>{product.name}</Text>
                                    <Text style={styles.manageDescription}>{product.description}</Text>
                                </View>
                                <MaterialIcon name="chevron-right" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {viewMode === 'compare' && selectedProduct && (
                    <>
                        <View style={styles.sectionHeaderRow}>
                            <TouchableOpacity onPress={() => setViewMode('products')} style={styles.backButton}>
                                <MaterialIcon name="arrow-back" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.sectionTitle}>Vehicle Details</Text>
                        </View>

                        <Card style={styles.formCard}>
                            <Text style={styles.formTitle}>{selectedProduct.name}</Text>
                            <Text style={styles.formCategory}>{selectedProduct.category}</Text>

                            <Input
                                label="Vehicle Registration"
                                placeholder="KAA123A"
                                value={vehicleData.registration}
                                autoCapitalize="characters"
                                onChangeText={(text) => {
                                    const formatted = text.toUpperCase().replace(/\s/g, '');
                                    setVehicleData({ ...vehicleData, registration: formatted });
                                }}
                            />

                            {(selectedProduct.category.toUpperCase() === 'COMMERCIAL' || selectedProduct.name.toUpperCase().includes('COMMERCIAL')) && (
                                <Input
                                    label="Tonnage (1 - 30)"
                                    placeholder="Enter tonnage"
                                    keyboardType="numeric"
                                    value={vehicleData.tonnage}
                                    onChangeText={(text) => {
                                        const ton = parseInt(text);
                                        if (!isNaN(ton) && ton >= 1 && ton <= 30) {
                                            setVehicleData({ ...vehicleData, tonnage: text });
                                        } else if (text === '') {
                                            setVehicleData({ ...vehicleData, tonnage: '' });
                                        }
                                    }}
                                />
                            )}

                            {(selectedProduct.category.toUpperCase() === 'PSV' || selectedProduct.name.toUpperCase().includes('PSV')) && (
                                <Input
                                    label="Passenger Capacity"
                                    placeholder="Number of passengers"
                                    keyboardType="numeric"
                                    value={vehicleData.passengerCapacity}
                                    onChangeText={(text) => setVehicleData({ ...vehicleData, passengerCapacity: text })}
                                />
                            )}

                            {(selectedProduct.category.toUpperCase() === 'COMP' || selectedProduct.name.toUpperCase().includes('COMP')) && (
                                <>
                                    <Input
                                        label="Vehicle Value"
                                        placeholder="Enter value"
                                        keyboardType="numeric"
                                        value={vehicleData.vehicleValue}
                                        onChangeText={(text) => setVehicleData({ ...vehicleData, vehicleValue: text })}
                                    />
                                    <Input
                                        label="Year of Manufacture"
                                        placeholder="e.g. 2020"
                                        keyboardType="numeric"
                                        value={vehicleData.yearOfManufacture}
                                        onChangeText={(text) => setVehicleData({ ...vehicleData, yearOfManufacture: text })}
                                    />
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Input
                                                label="Make"
                                                placeholder="Toyota"
                                                value={vehicleData.make}
                                                onChangeText={(text) => setVehicleData({ ...vehicleData, make: text })}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Input
                                                label="Model"
                                                placeholder="Axio"
                                                value={vehicleData.model}
                                                onChangeText={(text) => setVehicleData({ ...vehicleData, model: text })}
                                            />
                                        </View>
                                    </View>
                                </>
                            )}

                            <Button
                                title={isLoading ? "Processing..." : "Compare Premiums"}
                                onPress={handleCompare}
                                disabled={isLoading}
                                style={{ marginTop: 20 }}
                            />
                        </Card>
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
    backButton: {
        marginRight: 12,
        padding: 4,
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
    categoryName: {
        ...theme.typography.label,
        textAlign: 'center',
        color: theme.colors.primary,
    },
    searchBar: {
        marginBottom: theme.spacing.md,
    },
    subSectionTitle: {
        ...theme.typography.h2,
        fontSize: 14,
        color: theme.colors.secondary,
        marginBottom: 12,
        marginTop: 4,
    },
    categoryBadge: {
        ...theme.typography.caption,
        color: theme.colors.primary,
        backgroundColor: theme.colors.accentSoft,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
        fontSize: 10,
        fontWeight: '700',
    },
    noResultsText: {
        ...theme.typography.body,
        color: theme.colors.secondary,
        textAlign: 'center',
        marginTop: 20,
    },
    formCard: {
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.subtle,
    },
    formTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        color: theme.colors.primary,
        marginBottom: 4,
    },
    formCategory: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginBottom: 24,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default DashboardScreen;
