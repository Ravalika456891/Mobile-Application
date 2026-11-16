import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { 
    selectedAddress, 
    searchQuery, 
    setSearchQuery, 
    setActiveTab, 
    activeOrder 
  } = useApp();

  return (
    <View style={styles.container}>
      {/* Top Row: Brand & Delivery Info */}
      <View style={styles.topRow}>
        <View style={styles.deliveryBadgeContainer}>
          <View style={styles.brandBadge}>
            <Icon name="flash" size={13} color="#FFF" />
            <Text style={styles.brandBadgeText}>10 MINS</Text>
          </View>
          <TouchableOpacity 
            style={styles.addressWrapper}
            onPress={() => setActiveTab('profile')}
            activeOpacity={0.7}
          >
            <View style={styles.locationTitleRow}>
              <Text style={styles.locationLabel}>DELIVER TO</Text>
              <Icon name="chevron-down" size={12} color="#059669" />
            </View>
            <Text style={styles.addressText} numberOfLines={1}>
              {selectedAddress}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions: Only show Live tracking chip when an order is active */}
        {activeOrder && activeOrder.status !== 'DELIVERED' && (
          <TouchableOpacity 
            style={styles.liveOrderPill} 
            onPress={() => setActiveTab('tracking')}
            activeOpacity={0.8}
          >
            <View style={styles.pulseDot} />
            <Icon name="bicycle" size={14} color="#10B981" />
            <Text style={styles.liveOrderPillText}>Live</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries, ice creams, clothing, snacks..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="close-circle" size={18} color="#9CA3AF" />
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
    paddingTop: Platform.OS === 'ios' ? 12 : 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 10,
    gap: 4,
  },
  brandBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  addressWrapper: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.8,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveOrderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    marginLeft: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveOrderPillText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingVertical: 0,
  },
});
