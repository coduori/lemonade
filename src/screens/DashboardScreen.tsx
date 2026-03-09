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

                <Card style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Overall coverage status</Text>
                    <View style={styles.balanceRow}>
                        <Text style={styles.balanceValue}>Excellent</Text>
                        <View style={styles.trendBadge}>
                            <Text style={styles.trendText}>Secure</Text>
                        </View>
                    </View>
                    <Button
                        title="View all policies"
                        onPress={() => { }}
                        style={styles.actionButton}
                    />
                </Card>

                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>

                {[
                    { title: 'Login from iPhone 15', time: '2 hours ago', icon: '📱' },
                    { title: 'Password changed', time: 'Yesterday', icon: '🔑' },
                    { title: 'New device authorized', time: '3 days ago', icon: '🛡️' },
                ].map((item, i) => (
                    <View key={i} style={styles.activityItem}>
                        <View style={styles.activityIconContainer}>
                            <Text style={styles.activityIcon}>{item.icon}</Text>
                        </View>
                        <View style={styles.activityDetails}>
                            <Text style={styles.activityTitle}>{item.title}</Text>
                            <Text style={styles.activityTime}>{item.time}</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </View>
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
    balanceCard: {
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
    },
    balanceLabel: {
        ...theme.typography.label,
        color: theme.colors.secondary,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginVertical: theme.spacing.md,
    },
    balanceValue: {
        ...theme.typography.h1,
        fontSize: 40,
        color: theme.colors.primary,
    },
    trendBadge: {
        backgroundColor: theme.colors.accentSoft,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: theme.borderRadius.pill,
        marginLeft: 12,
        marginBottom: 8,
    },
    trendText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    actionButton: {
        paddingVertical: 14,
        marginTop: 8,
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
    seeAllText: {
        ...theme.typography.label,
        color: theme.colors.secondary,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        marginBottom: 12,
    },
    activityIconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.inputBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    activityIcon: {
        fontSize: 20,
    },
    activityDetails: {
        flex: 1,
    },
    activityTitle: {
        ...theme.typography.label,
        color: theme.colors.primary,
        fontWeight: '700',
    },
    activityTime: {
        ...theme.typography.caption,
        color: theme.colors.secondary,
        marginTop: 2,
    },
    chevron: {
        fontSize: 20,
        color: theme.colors.secondary,
        marginLeft: 8,
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
});

export default DashboardScreen;
