import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { MaterialIcon } from './MaterialIcon';
import { theme } from '../theme';

interface PaymentCardProps {
    grossPremium: number;
    insurerName: string;
    productName: string;
    onPaymentPress: (phoneNumber: string) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    isLoading?: boolean;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
    grossPremium,
    insurerName,
    productName,
    onPaymentPress,
    showNotification,
    isLoading = false,
}) => {
    const [phoneNumber, setPhoneNumber] = React.useState('');

    return (
        <Card style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
                <Text style={styles.paymentLabel}>Payable Premium</Text>
                <View style={styles.paymentAmountContainer}>
                    <Text style={styles.paymentCurrency}>KES</Text>
                    <Text style={styles.paymentAmount}>
                        {grossPremium.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View style={styles.paymentDetailsRow}>
                <View style={styles.paymentDetailItem}>
                    <Text style={styles.detailLabel}>Provider</Text>
                    <Text style={styles.detailValue}>{insurerName}</Text>
                </View>
                <View style={styles.paymentDetailItem}>
                    <Text style={styles.detailLabel}>Product</Text>
                    <Text style={styles.detailValue}>{productName}</Text>
                </View>
            </View>

            <View style={styles.mpesaContainer}>
                <View style={styles.mpesaHeader}>
                    <MaterialIcon name="payments" size={20} color="#22C55E" />
                    <Text style={styles.mpesaTitle}>M-PESA Push</Text>
                </View>
                <Text style={styles.mpesaDesc}>
                    Enter your phone number to receive an STK push on your phone.
                </Text>
                <Input
                    label="Phone Number"
                    placeholder="07XX XXX XXX"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    style={{ marginTop: 12 }}
                    editable={!isLoading}
                />
                <Button
                    title={isLoading ? "Processing..." : "Make Payment"}
                    onPress={() => onPaymentPress(phoneNumber)}
                    style={styles.mpesaButton}
                    disabled={isLoading}
                />
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    paymentCard: {
        padding: 24,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.subtle,
    },
    paymentHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    paymentLabel: {
        ...theme.typography.caption,
        color: '#64748B',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    paymentAmountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    paymentCurrency: {
        fontSize: 18,
        fontWeight: '700',
        color: '#94A3B8',
        marginRight: 4,
    },
    paymentAmount: {
        fontSize: 42,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    paymentDetailsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
        paddingVertical: 20,
        marginBottom: 32,
    },
    paymentDetailItem: {
        flex: 1,
    },
    detailLabel: {
        ...theme.typography.caption,
        color: '#94A3B8',
        marginBottom: 4,
    },
    detailValue: {
        ...theme.typography.body,
        fontWeight: '700',
        color: '#1E293B',
    },
    mpesaContainer: {
        backgroundColor: '#F0FDF4',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    mpesaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    mpesaTitle: {
        ...theme.typography.body,
        fontWeight: '700',
        color: '#166534',
        marginLeft: 8,
    },
    mpesaDesc: {
        ...theme.typography.caption,
        color: '#15803D',
        lineHeight: 18,
    },
    mpesaButton: {
        marginTop: 20,
        backgroundColor: '#22C55E',
    },
});
