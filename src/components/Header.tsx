import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    selectedAddress,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    activeOrder,
    currentUser,
    cartCount,
  } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Greeting & Brand Bar */}
      <View style={styles.topRow}>
        <View style={styles.deliveryBadgeContainer}>
          <View style={styles.brandBadge}>
            <Ionicons name="flash" size={13} color="#FFF" />
            <Text style={styles.brandBadgeText}>10 MINS</Text>
          </View>
          <View style={styles.addressWrapper}>
            <View style={styles.locationTitleRow}>
              <Text style={styles.userNameGreeting}>
                {currentUser?.name ? `Hi, ${currentUser.name.split(' ')[0]}` : 'MyGroceries'}
              </Text>
              <Text style={styles.locationDot}>•</Text>
              <Text style={styles.locationLabel}>DELIVER TO</Text>
              <Ionicons name="chevron-down" size={11} color="#10B981" />
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {selectedAddress}
            </Text>
          </View>
        </View>

        {/* Right Action Icons */}
        <View style={styles.rightActions}>
          {activeOrder && activeOrder.status !== 'DELIVERED' && activeOrder.status !== 'Delivered' && (
            <TouchableOpacity
              style={styles.liveOrderPill}
              onPress={() => setActiveTab('tracking')}
              activeOpacity={0.8}
            >
              <View style={styles.pulseDot} />
              <Ionicons name="bicycle" size={13} color="#10B981" />
              <Text style={styles.liveOrderPillText}>Live</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.cartHeaderButton}
            onPress={() => setActiveTab('cart')}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={24} color="#1F2937" />
            {cartCount > 0 && (
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>
                  {cartCount > 9 ? '9+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setActiveTab('profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={26} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search fresh veggies, dairy, snacks, rice..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  deliveryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  brandBadge: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    gap: 3,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  addressWrapper: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userNameGreeting: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  locationDot: {
    fontSize: 11,
    color: '#D1D5DB',
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveOrderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveOrderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  cartHeaderButton: {
    position: 'relative',
    padding: 2,
  },
  headerCartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#10B981',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  iconButton: {
    padding: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 4,
  },
});
