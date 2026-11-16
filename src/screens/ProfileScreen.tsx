import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    selectedAddress,
    setSelectedAddress,
    wishlist,
    products,
    setActiveTab,
    showToast,
    logout,
    updateProfile,
    ordersHistory,
  } = useApp();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editMobile, setEditMobile] = useState(currentUser?.mobile || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const savedAddresses = [
    { id: '1', title: 'Home', address: 'Flat 402, Green Valley Apts, Silicon Boulevard' },
    { id: '2', title: 'Office', address: 'Floor 7, TechHub Tower, Innovation Way' },
    { id: '3', title: 'Studio', address: 'Loft 14, Arts District, Maple Street' },
  ];

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleSupport = () => {
    Alert.alert(
      '24x7 Customer Support',
      'Connecting to MyGroceries Help Desk. An agent is available right away on +91 1800-456-7890.',
      [{ text: 'Close' }]
    );
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Name cannot be empty.');
      return;
    }
    const cleanMobile = editMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      Alert.alert('Invalid', 'Mobile number must be 10 digits.');
      return;
    }

    setSavingProfile(true);
    const res = await updateProfile(editName.trim(), cleanMobile);
    setSavingProfile(false);

    if (res.success) {
      setEditModalVisible(false);
    } else {
      Alert.alert('Error', res.error || 'Failed to update profile.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of MyGroceries?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
            }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.profileMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{currentUser?.name || 'Ravalika Sharma'}</Text>
            <View style={styles.vipBadge}>
              <Ionicons name="sparkles" size={10} color="#F59E0B" />
              <Text style={styles.vipText}>PREMIUM</Text>
            </View>
          </View>
          <Text style={styles.userPhone}>+91 {currentUser?.mobile || '9876543210'}</Text>
          <Text style={styles.userJoined}>Member since Nov 2026</Text>
        </View>

        <TouchableOpacity
          style={styles.editIconBtn}
          onPress={() => {
            setEditName(currentUser?.name || '');
            setEditMobile(currentUser?.mobile || '');
            setEditModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Quick Statistics Banner */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setActiveTab('orders')}
        >
          <Text style={styles.statNumber}>{ordersHistory.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{wishlist.length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>100%</Text>
          <Text style={styles.statLabel}>On Time</Text>
        </View>
      </View>

      {/* Shortcuts List */}
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => setActiveTab('orders')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="receipt-outline" size={20} color="#10B981" />
            </View>
            <View>
              <Text style={styles.menuTitle}>My Orders</Text>
              <Text style={styles.menuSubtitle}>View past receipts and live tracking</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => setActiveTab('cart')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="cart-outline" size={20} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.menuTitle}>Shopping Cart</Text>
              <Text style={styles.menuSubtitle}>Items saved for purchase</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Saved Addresses Selector */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="location-outline" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Saved Delivery Addresses</Text>
        </View>

        {savedAddresses.map((addr) => {
          const isSelected = selectedAddress === addr.address;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressItem, isSelected && styles.addressItemSelected]}
              onPress={() => {
                setSelectedAddress(addr.address);
                showToast(`Switched delivery address to ${addr.title}`);
              }}
            >
              <View style={styles.addressLeft}>
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isSelected ? '#10B981' : '#9CA3AF'}
                />
                <View>
                  <Text style={styles.addressTitle}>{addr.title}</Text>
                  <Text style={styles.addressDetail} numberOfLines={1}>
                    {addr.address}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Customer Support & Help */}
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.menuRow} onPress={handleSupport}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, { backgroundColor: '#FFFBEB' }]}>
              <Ionicons name="headset-outline" size={20} color="#D97706" />
            </View>
            <View>
              <Text style={styles.menuTitle}>24x7 Customer Support</Text>
              <Text style={styles.menuSubtitle}>Instant help for any delivery issue</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Log Out Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={confirmLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.appFooterText}>MyGroceries v1.0 • React Native & SQLite</Text>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your Name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number (10 digits)</Text>
              <TextInput
                style={styles.modalInput}
                value={editMobile}
                onChangeText={(t) => setEditMobile(t.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveProfileBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  userPhone: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  userJoined: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  addressItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  addressItemSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addressDetail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    maxWidth: 240,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  appFooterText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  saveProfileBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
