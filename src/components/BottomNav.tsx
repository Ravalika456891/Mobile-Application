import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, activeOrder } = useApp();

  const isLive = activeOrder && activeOrder.status !== 'DELIVERED' && activeOrder.status !== 'Delivered';

  const tabs: {
    id: 'home' | 'categories' | 'orders' | 'cart' | 'profile';
    label: string;
    icon: string;
    activeIcon: string;
    badge?: number | string;
  }[] = [
    { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { id: 'categories', label: 'Categories', icon: 'grid-outline', activeIcon: 'grid' },
    {
      id: 'orders',
      label: isLive ? 'Tracking' : 'Orders',
      icon: isLive ? 'bicycle-outline' : 'receipt-outline',
      activeIcon: isLive ? 'bicycle' : 'receipt',
      badge: isLive ? 'LIVE' : undefined,
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: 'cart-outline',
      activeIcon: 'cart',
      badge: cartCount > 0 ? cartCount : undefined,
    },
    { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || (tab.id === 'orders' && activeTab === 'tracking');
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabBtn}
            onPress={() => {
              if (tab.id === 'orders' && isLive) {
                setActiveTab('tracking');
              } else {
                setActiveTab(tab.id);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={22}
                color={isActive ? '#10B981' : '#6B7280'}
              />
              {tab.badge !== undefined && (
                <View
                  style={[
                    styles.badge,
                    typeof tab.badge === 'string' && styles.textBadge,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {typeof tab.badge === 'number' && tab.badge > 9 ? '9+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    padding: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#10B981',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -10,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  textBadge: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
