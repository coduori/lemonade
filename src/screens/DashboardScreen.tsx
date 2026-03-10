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
import { ComboBox } from '../components/ComboBox';
import { buildPremiumPayload, buildQuotePayload } from '../utils/insuranceUtils';
import { SectionHeader } from '../components/SectionHeader';
import { ManageInsuranceCard } from '../components/ManageInsuranceCard';
import { ComparisonResultCard } from '../components/ComparisonResultCard';
import { StatCard } from '../components/StatCard';
import { PaymentCard } from '../components/PaymentCard';
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

interface Rider {
    id: string;
    name: string;
    description: string;
    requiresValue: boolean;
}

interface SelectedRider {
    riderId: string;
    value?: string;
}

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
    includeMandatory: yup.boolean().optional(),
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

type ViewMode = 'dashboard' | 'categories' | 'products' | 'compare' | 'results' | 'payment';

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
    const [riders, setRiders] = useState<Rider[]>([]);
    const [selectedRiders, setSelectedRiders] = useState<SelectedRider[]>([]);
    const [vehicleData, setVehicleData] = useState<VehicleData>({});
    const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
    const [quoteResult, setQuoteResult] = useState<any>(null);
    const [selectedInsurerProduct, setSelectedInsurerProduct] = useState<ComparisonResult | null>(null);
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

    const fetchRiders = async () => {
        try {
            const response = await fetch(`${config.baseUrl}/riders`, {
                headers: authHeaders,
            });
            const data = await response.json();
            if (response.ok) {
                setRiders(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch riders:', error);
        }
    };

    const handleCompare = async (updatedRidersArg?: any) => {
        if (!selectedProduct) return;
        setIsLoading(true);
        const ridersToUse = Array.isArray(updatedRidersArg) ? updatedRidersArg : selectedRiders;
        try {
            const payload = buildPremiumPayload(selectedProduct.id, vehicleData, ridersToUse);

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
                setComparisonResults(data.data || []);
                setViewMode('results');
                showNotification('Comparison updated!', 'success');
            } else {
                showNotification(data.message || 'Comparison failed', 'error');
            }
        } catch (error) {
            showNotification('Network error during premium comparison', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveRider = (riderId: string) => {
        const updatedRiders = selectedRiders.filter(r => r.riderId !== riderId);
        setSelectedRiders(updatedRiders);
        handleCompare(updatedRiders);
    };

    const handleSelectProvider = async (result: ComparisonResult) => {
        setSelectedInsurerProduct(result);
        setIsLoading(true);
        try {
            const payload = buildQuotePayload(result.insurerProductId, vehicleData, selectedRiders);

            const response = await fetch(`${config.baseUrl}/premiums/get-quote`, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.ok) {
                setQuoteResult(data.data);
                setViewMode('payment');
            } else {
                showNotification(data.message || 'Failed to get final quote', 'error');
            }
        } catch (error) {
            showNotification('Network error during quote request', 'error');
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
                    <StatCard label="Active Policies" value="3" />
                    <StatCard label="Active Claims" value="0" />
                </View>


                {viewMode === 'dashboard' && (
                    <>
                        <SectionHeader title="Manage Insurance" />

                        <ManageInsuranceCard
                            title="Apply for new Policy"
                            description={isLoading ? 'Loading products...' : 'Start a new insurance application'}
                            icon="description"
                            backgroundColor="#E0F2FE"
                            iconColor="#0EA5E9"
                            onPress={fetchProducts}
                            disabled={isLoading}
                        />

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
                            <ManageInsuranceCard
                                key={i}
                                title={item.title}
                                description={item.description}
                                icon={item.icon}
                                backgroundColor={item.color}
                                iconColor={item.iconColor}
                            />
                        ))}
                    </>
                )}

                {viewMode === 'categories' && (
                    <>
                        <SectionHeader title="Browse Products" onBack={() => setViewMode('dashboard')} />

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
                                        <ManageInsuranceCard
                                            key={product.id}
                                            title={product.name}
                                            description={product.description}
                                            icon="verified-user"
                                            backgroundColor={theme.colors.accentSoft}
                                            iconColor={theme.colors.primary}
                                            onPress={() => {
                                                setSelectedProduct(product);
                                                setVehicleData({});
                                                setSelectedRiders([]);
                                                if (product.category.toUpperCase() === 'COMP' || product.name.toUpperCase().includes('COMP')) {
                                                    fetchRiders();
                                                }
                                                setViewMode('compare');
                                            }}
                                        />
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
                        <SectionHeader title={selectedCategory || ''} onBack={() => setViewMode('categories')} />

                        <Input
                            label=""
                            placeholder={`Search in ${selectedCategory}...`}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchBar}
                        />

                        {(searchQuery.trim() !== '' ? searchResults.filter(p => p.category === selectedCategory) : filteredProducts).map((product) => (
                            <ManageInsuranceCard
                                key={product.id}
                                title={product.name}
                                description={product.description}
                                icon="verified-user"
                                backgroundColor={theme.colors.accentSoft}
                                iconColor={theme.colors.primary}
                                onPress={() => {
                                    setSelectedProduct(product);
                                    setVehicleData({});
                                    setSelectedRiders([]);
                                    if (product.category.toUpperCase() === 'COMP' || product.name.toUpperCase().includes('COMP')) {
                                        fetchRiders();
                                    }
                                    setViewMode('compare');
                                }}
                            />
                        ))}
                    </>
                )}

                {viewMode === 'compare' && selectedProduct && (
                    <>
                        <SectionHeader title="Vehicle Details" onBack={() => setViewMode('products')} />

                        <Card style={styles.formCard}>
                            <Text style={styles.formTitle}>{selectedProduct.name}</Text>
                            <Text style={styles.formCategory}>{selectedProduct.category}</Text>


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

                                    {riders.length > 0 && (
                                        <View style={styles.ridersSection}>
                                            <ComboBox
                                                label="Desired Insurance Riders"
                                                options={riders}
                                                selectedIds={selectedRiders.map(r => r.riderId)}
                                                onSelect={(id) => setSelectedRiders([...selectedRiders, { riderId: id }])}
                                                onRemove={(id) => setSelectedRiders(selectedRiders.filter(r => r.riderId !== id))}
                                                placeholder="Choose riders..."
                                            />

                                            {selectedRiders.map((selectedRider) => {
                                                const rider = riders.find(r => r.id === selectedRider.riderId);
                                                if (rider && rider.requiresValue) {
                                                    return (
                                                        <View key={rider.id} style={styles.riderValueInput}>
                                                            <Input
                                                                label={`Value for ${rider.name}`}
                                                                placeholder="Enter amount"
                                                                keyboardType="numeric"
                                                                value={selectedRider.value}
                                                                onChangeText={(text) => {
                                                                    setSelectedRiders(selectedRiders.map(r =>
                                                                        r.riderId === rider.id ? { ...r, value: text } : r
                                                                    ));
                                                                }}
                                                            />
                                                        </View>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </View>
                                    )}
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

                {viewMode === 'results' && (
                    <>
                        <SectionHeader title="Price Comparison" onBack={() => setViewMode('compare')} />

                        <Text style={styles.resultsSubtitle}>
                            We found {comparisonResults.length} options for your {selectedProduct?.name}
                        </Text>

                        {comparisonResults.map((result, index) => (
                            <ComparisonResultCard
                                key={index}
                                result={result}
                                onSelect={handleSelectProvider}
                                isLoading={isLoading}
                                selectedRiders={selectedRiders}
                                ridersRegistry={riders}
                                onRemoveRider={handleRemoveRider}
                            />
                        ))}

                        {comparisonResults.length === 0 && (
                            <View style={styles.emptyResults}>
                                <MaterialIcon name="search-off" size={64} color="#CBD5E1" />
                                <Text style={styles.emptyResultsText}>No providers found for the selected criteria.</Text>
                                <Button title="Go Back" onPress={() => setViewMode('compare')} style={{ marginTop: 16 }} />
                            </View>
                        )}
                    </>
                )}

                {viewMode === 'payment' && quoteResult && selectedInsurerProduct && (
                    <>
                        <SectionHeader title="Complete Payment" onBack={() => setViewMode('results')} />
                        <PaymentCard
                            grossPremium={quoteResult.grossPremium}
                            insurerName={selectedInsurerProduct.insurerName}
                            productName={selectedInsurerProduct.productName}
                            onPaymentPress={(phone) => showNotification(`Payment initiated for ${phone}`, 'info')}
                            showNotification={showNotification}
                        />
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
    ridersSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    riderValueInput: {
        marginTop: 12,
        marginLeft: 36,
    },
    resultsSubtitle: {
        ...theme.typography.body,
        color: '#64748B',
        marginBottom: 24,
    },
    emptyResults: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyResultsText: {
        ...theme.typography.body,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 16,
    },
});

export default DashboardScreen;
