import React from 'react';
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

interface DashboardScreenProps {
    username: string;
    onLogout: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ username, onLogout }) => {
    const insets = useSafeAreaInsets();

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
                        <Text style={[styles.statValueSmall, { color: theme.colors.error }]}>1</Text>
                    </Card>
                </View>


                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Manage Insurance</Text>
                </View>

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


                <View style={styles.featuredCard}>
                    <Text style={styles.featuredTitle}>Protect your cards</Text>
                    <Text style={styles.featuredSubtitle}>Enable dynamic CVV for added security.</Text>
                    <Button
                        title="Enable Now"
                        onPress={() => { }}
                        variant="primary"
                        style={styles.featuredButton}
                    />
                </View>
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
        ...theme.typography.h2,
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
    featuredCard: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.borderRadius.xxl,
        padding: theme.spacing.lg,
        marginTop: theme.spacing.lg,
    },
    featuredTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        marginBottom: 8,
    },
    featuredSubtitle: {
        ...theme.typography.body,
        fontSize: 14,
        color: theme.colors.primary,
        opacity: 0.7,
        marginBottom: 20,
    },
    featuredButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: 'auto',
        alignSelf: 'flex-start',
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
});

export default DashboardScreen;
