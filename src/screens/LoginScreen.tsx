import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

interface LoginScreenProps {
    onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const { showNotification } = useNotification();
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            showNotification('Please enter both username and password', 'error');
            return;
        }

        setIsLoading(true);
        const loginUrl = `${config.baseUrl}/auth/login`;
        console.log('Attempting login at:', loginUrl);

        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim(),
                }),
            });

            const responseData = await response.json();
            console.log('Login response:', responseData);

            if (response.ok && responseData.data?.success) {
                const { token, ttl } = responseData.data;
                showNotification('Welcome back!', 'success');
                login(username, token, ttl);
                onLogin(username);
            } else {
                showNotification(responseData.message || responseData.data?.message || 'Invalid credentials', 'error');
            }
        } catch (error) {
            showNotification('Could not connect to the server. Please check your connection.', 'error');
            console.error('Login error detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingBottom: insets.bottom + theme.spacing.md,
                        paddingTop: insets.top + theme.spacing.md,
                    },
                ]}
            >
                <Card>
                    <Input
                        label="Username"
                        placeholder="arthur"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <Button
                        title={isLoading ? "Signing In..." : "Sign In"}
                        onPress={handleLogin}
                    />

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        justifyContent: 'center',
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    forgotPasswordText: {
        color: theme.colors.secondary,
        fontSize: theme.typography.label.fontSize,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;
