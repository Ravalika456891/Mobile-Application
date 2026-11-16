import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { BottomNav } from './src/components/BottomNav';
import { Toast } from './src/components/Toast';
import { ProductDetailModal } from './src/components/ProductDetailModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { CartScreen } from './src/screens/CartScreen';
import { TrackingScreen } from './src/screens/TrackingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

const SafeStatusBar: React.FC = () => {
  try {
    return <StatusBar barStyle="dark-content" />;
  } catch {
    return null;
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>🛒 MyGroceries</Text>
          <Text style={styles.errorSubtitle}>Something unexpected happened</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={this.handleReset}>
            <Text style={styles.errorButtonText}>Tap to Refresh</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

const MainNavigator: React.FC = () => {
  const { activeTab, authScreen } = useApp();

  if (authScreen === 'login') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SafeStatusBar />
        <Toast />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  if (authScreen === 'register') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <SafeStatusBar />
        <Toast />
        <RegisterScreen />
      </SafeAreaView>
    );
  }

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'categories':
        return <ExploreScreen />;
      case 'cart':
        return <CartScreen />;
      case 'tracking':
        return <TrackingScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SafeStatusBar />
      <Toast />
      
      {activeTab !== 'cart' && <Header />}

      <View style={styles.body}>{renderCurrentScreen()}</View>

      <BottomNav />

      <ProductDetailModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  body: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    maxWidth: 320,
  },
  errorButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
