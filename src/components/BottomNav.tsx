import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, activeOrder, isAdmin, setIsAdminMode } = useApp();

  const tabs: {
    id: 'home' | 'categories' | 'cart' | 'tracking' | 'profile' | 'admin';
    label: string;
    icon: string;
    badge?: number | string;
    action?: () => void;
  }[] = [
    { id: 'home', label: 'Shop', icon: 'home-outline' },
    { id: 'categories', label: 'Categories', icon: 'grid-outline' },
    {
      id: 'cart',
      label: 'Cart',
      icon: 'cart-outline',
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'tracking',
      label: 'Live Track',
      icon: 'bicycle',
      badge: activeOrder && activeOrder.status !== 'DELIVERED' ? 'LIVE' : undefined,
    },
    { id: 'profile', label: 'Account', icon: 'person-outline' },
    ...(isAdmin
      ? [
          {
            id: 'admin' as const,
            label: 'Admin Hub',
            icon: 'shield-checkmark',
            badge: 'PRO',
            action: () => setIsAdminMode(true),
          },
        ]
      : []),
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabBtn}
            onPress={() => {
              if (tab.action) {
                tab.action();
              } else {
                setActiveTab(tab.id as any);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Icon
                name={tab.icon}
                size={22}
                color={isActive || tab.id === 'admin' ? '#10B981' : '#6B7280'}
              />

              {tab.badge !== undefined && (
                <View
                  style={[
                    styles.badge,
                    tab.id === 'tracking' && styles.liveBadge,
                    tab.id === 'admin' && styles.adminBadge,
                  ]}
                >
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.tabLabel,
                (isActive || tab.id === 'admin') && styles.tabLabelActive,
              ]}
            >
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
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  liveBadge: {
    backgroundColor: '#10B981',
    minWidth: 28,
  },
  adminBadge: {
    backgroundColor: '#059669',
    minWidth: 26,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 3,
  },
  tabLabelActive: {
    color: '#10B981',
    fontWeight: '800',
  },
});
