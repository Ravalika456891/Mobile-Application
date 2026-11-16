import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { isCheckingSession, currentUser, setAuthScreen } = useApp();

  useEffect(() => {
    if (!isCheckingSession) {
      if (currentUser) {
        setAuthScreen(null);
      }
    }
  }, [isCheckingSession, currentUser]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Brand Logo with fallback */}
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>MyGroceries</Text>
        <Text style={styles.tagline}>Fresh Groceries Delivered in 10 Minutes</Text>

        <View style={styles.featurePills}>
          <View style={styles.pill}>
            <Ionicons name="flash" size={14} color="#10B981" />
            <Text style={styles.pillText}>Fast Delivery</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="leaf" size={14} color="#10B981" />
            <Text style={styles.pillText}>100% Organic</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.pillText}>Best Prices</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {isCheckingSession ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.loadingText}>Checking active session...</Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setAuthScreen('login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Get Started / Log In</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setAuthScreen('register')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.versionText}>Version 1.0 • Android Release</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    overflow: 'hidden',
  },
  logoImage: {
    width: 90,
    height: 90,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  featurePills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  secondaryButtonText: {
    color: '#065F46',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

