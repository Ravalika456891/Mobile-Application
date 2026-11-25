import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';
import { getSearchSuggestionsDB } from '../services/database';

export const Header: React.FC = () => {
  const {
    selectedAddress,
    setSelectedAddress,
    addresses,
    selectedDeliveryAddress,
    setSelectedDeliveryAddress,
    addDeliveryAddress,
    checkPincodeServiceability,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
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
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  // New Address Form States
  const [newType, setNewType] = useState<'home' | 'office' | 'other'>('home');
  const [newName, setNewName] = useState('');
  const [newFlat, setNewFlat] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Bangalore');
  const [newPincode, setNewPincode] = useState('');
  const [newPhone, setNewPhone] = useState('+91 98765 43210');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      getSearchSuggestionsDB(searchQuery, 6)
        .then((res) => {
          setSuggestions(res);
        })
        .catch(() => {
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSelectSearch = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
    setSearchFocused(false);
  };

  const handleVerifyPincode = async () => {
    if (!newPincode.trim() || newPincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit PIN code');
      return;
    }
    const res = await checkPincodeServiceability(newPincode.trim());
    setPincodeStatus(res.message);
  };

  const handleSaveAddress = async () => {
    if (!newFlat.trim() || !newStreet.trim() || !newPincode.trim()) {
      showToast('Please fill flat, street and pincode');
      return;
    }
    const flatStr = newFlat.trim();
    const streetStr = newStreet.trim();
    const cityStr = newCity.trim() || 'Bangalore';
    const pinStr = newPincode.trim();
    const titleStr = newName.trim() || (newType === 'home' ? 'Home' : 'Office');
    const created = await addDeliveryAddress({
      userId: currentUser?.id || 1,
      type: newType,
      name: titleStr,
      title: titleStr,
      flat: flatStr,
      street: streetStr,
      address: `${flatStr}, ${streetStr}, ${cityStr} - ${pinStr}`,
      city: cityStr,
      state: 'Karnataka',
      pincode: pinStr,
      phone: newPhone.trim(),
      isDefault: false,
    });
    setSelectedDeliveryAddress(created);
    setShowAddAddressForm(false);
    setAddressModalVisible(false);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = currentUser?.name || 'Ravalika';

  const POPULAR_SEARCHES = ['Basmati Rice', 'Amul Butter', 'Lay\'s', 'Face Cream', 'Earbuds', 'Dry Fruits'];

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
          onPress={() => {
            setShowAddAddressForm(false);
            setAddressModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Icon name="location-outline" size={14} color="#059669" />
          <View style={styles.addressMeta}>
            <View style={styles.deliverToRow}>
              <Text style={styles.deliverToLabel}>
                DELIVER TO ({selectedDeliveryAddress?.type?.toUpperCase() || 'HOME'})
              </Text>
              <Icon name="chevron-down" size={11} color="#059669" />
            </View>
            <Text style={styles.addressValue} numberOfLines={1}>
              {selectedDeliveryAddress
                ? `${selectedDeliveryAddress.flat}, ${selectedDeliveryAddress.street} (${selectedDeliveryAddress.pincode})`
                : selectedAddress}
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
            placeholder="Search all 28 categories: food, electronics, beauty..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                addRecentSearch(searchQuery.trim());
              }
              setSearchFocused(false);
            }}
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

        {/* Live Search Suggestions (Autocomplete) */}
        {suggestions.length > 0 && searchQuery.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {suggestions.map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionPill}
                onPress={() => handleSelectSearch(s)}
                activeOpacity={0.8}
              >
                <Icon name="search-outline" size={11} color="#059669" />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Recent Searches & Popular Searches When Search Is Focused & Input is empty */}
        {searchFocused && searchQuery.length === 0 && (
          <View style={styles.searchDropdownCard}>
            {recentSearches.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                <View style={styles.searchDropdownHeader}>
                  <Text style={styles.searchDropdownTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.searchClearText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.searchTagsWrap}>
                  {recentSearches.slice(0, 6).map((term, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.recentSearchTag}
                      onPress={() => handleSelectSearch(term)}
                    >
                      <Icon name="time-outline" size={12} color="#6B7280" />
                      <Text style={styles.recentSearchTagText}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View>
              <Text style={styles.searchDropdownTitle}>Popular Right Now 🔥</Text>
              <View style={styles.searchTagsWrap}>
                {POPULAR_SEARCHES.map((term, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.popularSearchTag}
                    onPress={() => handleSelectSearch(term)}
                  >
                    <Icon name="trending-up" size={12} color="#059669" />
                    <Text style={styles.popularSearchTagText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Delivery Location Selection & Management Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Icon name="location" size={18} color="#059669" />
                <Text style={styles.modalTitle}>
                  {showAddAddressForm ? 'Add Delivery Address' : 'Select Delivery Location'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setAddressModalVisible(false);
                  setShowAddAddressForm(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {!showAddAddressForm ? (
                <>
                  {addresses.map((addr) => {
                    const isSelected = selectedDeliveryAddress?.id === addr.id;
                    return (
                      <TouchableOpacity
                        key={addr.id}
                        style={[
                          styles.addressItem,
                          isSelected && styles.addressItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedDeliveryAddress(addr);
                          setAddressModalVisible(false);
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text
                              style={[
                                styles.addressTitleText,
                                isSelected && styles.addressTitleTextSelected,
                              ]}
                            >
                              {addr.name}
                            </Text>
                            <View style={styles.addressTypeBadge}>
                              <Text style={styles.addressTypeBadgeText}>
                                {(addr.type || 'home').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.addressFullText} numberOfLines={2}>
                            {addr.flat}, {addr.street}, {addr.city} - {addr.pincode}
                          </Text>
                          <Text style={styles.addressPhoneText}>📞 {addr.phone}</Text>
                        </View>

                        {isSelected && (
                          <Icon name="checkmark-circle" size={18} color="#059669" />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.addNewAddrBtn}
                    onPress={() => setShowAddAddressForm(true)}
                    activeOpacity={0.8}
                  >
                    <Icon name="add-circle-outline" size={18} color="#059669" />
                    <Text style={styles.addNewAddrBtnText}>+ Add New Address</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.addFormContainer}>
                  {/* Address Type Selector */}
                  <View style={styles.typeSelectorRow}>
                    {(['home', 'office', 'other'] as const).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.typePill,
                          newType === t && styles.typePillActive,
                        ]}
                        onPress={() => setNewType(t)}
                      >
                        <Icon
                          name={t === 'home' ? 'home' : t === 'office' ? 'business' : 'location'}
                          size={14}
                          color={newType === t ? '#FFFFFF' : '#4B5563'}
                        />
                        <Text
                          style={[
                            styles.typePillText,
                            newType === t && styles.typePillTextActive,
                          ]}
                        >
                          {t.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.formInput}
                    placeholder="Address Label (e.g. My Apartment, HQ)"
                    value={newName}
                    onChangeText={setNewName}
                  />

                  <TextInput
                    style={styles.formInput}
                    placeholder="Flat / House / Door No. *"
                    value={newFlat}
                    onChangeText={setNewFlat}
                  />

                  <TextInput
                    style={styles.formInput}
                    placeholder="Street / Area / Colony *"
                    value={newStreet}
                    onChangeText={setNewStreet}
                  />

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      placeholder="City"
                      value={newCity}
                      onChangeText={setNewCity}
                    />
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      placeholder="PIN Code *"
                      keyboardType="numeric"
                      maxLength={6}
                      value={newPincode}
                      onChangeText={(t) => {
                        setNewPincode(t);
                        setPincodeStatus(null);
                      }}
                    />
                  </View>

                  {/* Pincode verification button */}
                  <TouchableOpacity
                    style={styles.verifyPincodeBtn}
                    onPress={handleVerifyPincode}
                  >
                    <Icon name="shield-checkmark" size={13} color="#059669" />
                    <Text style={styles.verifyPincodeBtnText}>Verify PIN Code Serviceability</Text>
                  </TouchableOpacity>
                  {pincodeStatus && (
                    <Text style={styles.pincodeStatusText}>{pincodeStatus}</Text>
                  )}

                  <TextInput
                    style={styles.formInput}
                    placeholder="Mobile Number"
                    keyboardType="phone-pad"
                    value={newPhone}
                    onChangeText={setNewPhone}
                  />

                  <View style={styles.formActionButtons}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setShowAddAddressForm(false)}
                    >
                      <Text style={styles.cancelBtnText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveAddrBtn}
                      onPress={handleSaveAddress}
                    >
                      <Text style={styles.saveAddrBtnText}>Save & Deliver Here</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
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
    flexDirection: 'column',
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
  },
  suggestionsScroll: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 2,
    gap: 8,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  suggestionText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
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
  addressPhoneText: {
    fontSize: 10.5,
    color: '#059669',
    marginTop: 2,
    fontWeight: '600',
  },
  addressTypeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  addressTypeBadgeText: {
    fontSize: 9.5,
    color: '#0369A1',
    fontWeight: '800',
  },
  addNewAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#059669',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#F0FDF4',
  },
  addNewAddrBtnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  addFormContainer: {
    paddingVertical: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typePillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 10,
  },
  verifyPincodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifyPincodeBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#065F46',
  },
  pincodeStatusText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  formActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 13,
  },
  saveAddrBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
  },
  saveAddrBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  searchDropdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchDropdownTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchClearText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  searchTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  recentSearchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  recentSearchTagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  popularSearchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  popularSearchTagText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
  },
});
