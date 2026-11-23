import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    selectedAddress,
    setSelectedAddress,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    activeOrder,
    cartCount,
    currentUser,
    showToast,
    isAdmin,
    setIsAdminMode,
  } = useApp();

  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const savedAddresses = [
    { id: '1', title: 'Home', address: 'Flat 402, Green Valley Apts, Silicon Boulevard' },
    { id: '2', title: 'Office', address: 'Floor 7, TechHub Tower, Innovation Way' },
    { id: '3', title: 'Studio', address: 'Loft 14, Arts District, Maple Street' },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = currentUser?.name || 'Ravalika';

  return (
    <View style={styles.container}>
      {/* Top Utility Row: Welcome Greeting & Cart Action */}
      <View style={styles.utilityRow}>
        <Text style={styles.welcomeGreeting}>
          {getTimeGreeting()}, {displayName} 👋
        </Text>

        <View style={styles.rightActionsRow}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminHeaderPill}
              onPress={() => setIsAdminMode(true)}
              activeOpacity={0.8}
            >
              <Icon name="shield-checkmark" size={13} color="#059669" />
              <Text style={styles.adminHeaderPillText}>Admin Hub</Text>
            </TouchableOpacity>
          )}

          {activeOrder && activeOrder.status !== 'DELIVERED' && (
            <TouchableOpacity
              style={styles.liveOrderPill}
              onPress={() => setActiveTab('tracking')}
              activeOpacity={0.8}
            >
              <View style={styles.pulseDot} />
              <Icon name="bicycle" size={13} color="#059669" />
              <Text style={styles.liveOrderPillText}>Live Track</Text>
            </TouchableOpacity>
          )}

          {/* Cart Icon with Item Badge */}
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => setActiveTab('cart')}
            activeOpacity={0.75}
            accessibilityLabel="Shopping Cart"
          >
            <Icon name="cart-outline" size={22} color="#1F2937" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Brand & Delivery Location Row */}
      <View style={styles.brandLocationRow}>
        <View style={styles.brandBadge}>
          <Icon name="flash" size={13} color="#FFFFFF" />
          <Text style={styles.brandBadgeTitle}>QuickMart</Text>
          <View style={styles.badgeDivider} />
          <Text style={styles.brandBadgeTime}>10 MINS</Text>
        </View>

        <TouchableOpacity
          style={styles.addressSelector}
          onPress={() => setAddressModalVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="location-outline" size={14} color="#059669" />
          <View style={styles.addressMeta}>
            <View style={styles.deliverToRow}>
              <Text style={styles.deliverToLabel}>DELIVER TO</Text>
              <Icon name="chevron-down" size={11} color="#059669" />
            </View>
            <Text style={styles.addressValue} numberOfLines={1}>
              {selectedAddress}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Prominent Rounded Search Bar Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groceries, fruits, vegetables..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.clearBtn}
            >
              <Icon name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Delivery Location Selection Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddressModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="location" size={18} color="#059669" />
                <Text style={styles.modalTitle}>Choose Delivery Address</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddressModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {savedAddresses.map((addr) => {
              const isSelected = selectedAddress === addr.address;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressItem,
                    isSelected && styles.addressItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedAddress(addr.address);
                    setAddressModalVisible(false);
                    showToast(`Delivery location set to ${addr.title}`);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.addressTitleText,
                        isSelected && styles.addressTitleTextSelected,
                      ]}
                    >
                      {addr.title}
                    </Text>
                    <Text style={styles.addressFullText} numberOfLines={1}>
                      {addr.address}
                    </Text>
                  </View>

                  {isSelected && (
                    <Icon name="checkmark-circle" size={18} color="#059669" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 8 : 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  utilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeGreeting: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  adminHeaderPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  liveOrderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveOrderPillText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  cartIconBtn: {
    position: 'relative',
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  brandLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  brandBadgeTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  badgeDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  brandBadgeTime: {
    color: '#D1FAE5',
    fontWeight: '700',
    fontSize: 10,
  },
  addressSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressMeta: {
    flex: 1,
  },
  deliverToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliverToLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.6,
  },
  addressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
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
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1.2,
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
  clearBtn: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    marginBottom: 10,
    gap: 10,
  },
  addressItemSelected: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#059669',
  },
  radioInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#059669',
  },
  addressTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  addressTitleTextSelected: {
    color: '#065F46',
  },
  addressFullText: {
    fontSize: 11,
    color: '#6B7280',
  },
});
