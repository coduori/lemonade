import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

import { theme } from './src/theme';

import { NotificationProvider } from './src/context/NotificationContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Notification } from './src/components/Notification';

const AppContent = () => {
  const { isLoggedIn, username, logout, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoggedIn && username ? (
        <DashboardScreen
          key="dashboard-view"
          username={username}
          onLogout={logout}
        />
      ) : (
        <LoginScreen key="login-view" onLogin={() => { }} />
      )}
    </View>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <NotificationProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
          <AppContent />
          <Notification />
        </AuthProvider>
      </NotificationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

export default App;
