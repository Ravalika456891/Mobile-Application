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
import { Icon } from '../components/Icon';
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
    setAuthScreen,
    isAdmin,
    isAdminMode,
    setIsAdminMode,
    setInitialLoginMode,
  } = useApp();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || 'Ravalika');
  const [editMobile, setEditMobile] = useState(currentUser?.mobile || '9876543210');
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
      'Log Out Account',
      'Are you sure you want to log out of MyGroceries?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const displayName = currentUser?.name || 'Ravalika';
  const displayMobile = currentUser?.mobile
    ? `+91 ${currentUser.mobile}`
    : '+91 98765 43210';
  const displayEmail = `${displayName.toLowerCase().replace(/\s+/g, '')}@mygroceries.in`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Card */}
      {currentUser ? (
        <View style={styles.profileCard}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            }}
            style={styles.avatar}
          />
          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.vipBadge}>
                <Icon name="sparkles" size={10} color="#F59E0B" />
                <Text style={styles.vipText}>VIP CLUB</Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <Text style={styles.userPhone}>{displayMobile}</Text>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => {
                setEditName(displayName);
                setEditMobile(currentUser?.mobile || '9876543210');
                setEditModalVisible(true);
              }}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileCard}>
          <View style={[styles.avatar, styles.guestAvatar]}>
            <Icon name="person" size={32} color="#059669" />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userEmail}>Log in to save addresses & view orders</Text>
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: '#059669', borderColor: '#059669', marginTop: 8 }]}
              onPress={() => setAuthScreen('login')}
            >
              <Text style={[styles.editProfileText, { color: '#FFFFFF' }]}>Log In / Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Admin Hub Direct Launch Banner (shown when user is Admin) */}
      {isAdmin && (
        <View style={styles.adminHubBannerCard}>
          <View style={styles.adminHubBannerLeft}>
            <View style={styles.adminHubShield}>
              <Icon name="shield-checkmark" size={24} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.adminRoleRow}>
                <Text style={styles.adminHubTitle}>Store Administrator</Text>
                <View style={styles.adminLivePill}>
                  <Text style={styles.adminLivePillText}>FULL ACCESS</Text>
                </View>
              </View>
              <Text style={styles.adminHubDesc}>Manage catalog items, live stock, prices & active orders</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.adminHubLaunchBtn}
            onPress={() => setIsAdminMode(true)}
            activeOpacity={0.8}
          >
            <Icon name="speedometer-outline" size={16} color="#FFFFFF" />
            <Text style={styles.adminHubLaunchText}>Open Admin Hub 🛡️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Saved Addresses */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Icon name="location-outline" size={18} color="#10B981" />
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
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
                <View
                  style={[
                    styles.radioDot,
                    isSelected && styles.radioDotSelected,
                  ]}
                />
                <View style={{ flex: 1 }}>
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

      {/* Saved Favorites */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Icon name="heart-outline" size={18} color="#EF4444" />
          <Text style={styles.sectionTitle}>
            Saved Favorites ({wishlistProducts.length})
          </Text>
        </View>

        {wishlistProducts.length === 0 ? (
          <Text style={styles.emptyWishlistText}>
            No favorites yet. Tap the heart on any product to save it here!
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wishlistScroll}
          >
            {wishlistProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.wishItemCard}
                onPress={() => setActiveTab('home')}
              >
                <Image source={{ uri: p.image }} style={styles.wishItemImg} />
                <Text style={styles.wishItemName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.wishItemPrice}>₹{p.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Quick Menu Options */}
      <View style={styles.sectionCard}>
        <TouchableOpacity style={styles.menuRow} onPress={handleSupport}>
          <View style={styles.menuLeft}>
            <Icon name="headset-outline" size={18} color="#3B82F6" />
            <Text style={styles.menuText}>24x7 Live Customer Care</Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => setActiveTab('tracking')}
        >
          <View style={styles.menuLeft}>
            <Icon name="bicycle" size={18} color="#10B981" />
            <Text style={styles.menuText}>Track Ongoing Delivery</Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => showToast('App notifications enabled')}
        >
          <View style={styles.menuLeft}>
            <Icon name="notifications-outline" size={18} color="#F59E0B" />
            <Text style={styles.menuText}>Real-Time Push Alerts</Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => showToast('Security & encryption active')}
        >
          <View style={styles.menuLeft}>
            <Icon name="shield-checkmark-outline" size={18} color="#8B5CF6" />
            <Text style={styles.menuText}>Payment Safety & Privacy</Text>
          </View>
          <Icon name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Store Manager / Admin Portal row */}
        <TouchableOpacity
          style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6' }]}
          onPress={() => {
            if (isAdmin) {
              setIsAdminMode(true);
            } else {
              setInitialLoginMode('admin');
              setAuthScreen('login');
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.menuLeft}>
            <Icon name="shield-checkmark-outline" size={18} color="#059669" />
            <Text style={[styles.menuText, { color: '#059669', fontWeight: '700' }]}>
              {isAdmin ? 'Store Admin Hub' : 'Store Manager / Admin Portal'}
            </Text>
          </View>
          <View style={styles.adminTagBadge}>
            <Text style={styles.adminTagText}>{isAdmin ? 'MANAGE' : 'PORTAL'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Prominent Log Out Button (or Log In button if guest) */}
      {currentUser ? (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Icon name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.loginBannerButton}
          onPress={() => setAuthScreen('login')}
          activeOpacity={0.85}
        >
          <Icon name="person" size={20} color="#FFFFFF" />
          <Text style={styles.loginBannerText}>Log In or Create Account</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footerInfo}>
        <Text style={styles.footerBrand}>⚡ MyGroceries Native v1.0.0</Text>
        <Text style={styles.footerDesc}>
          Direct Native Android App • Superfast 10-Minute Delivery (₹ INR)
        </Text>
      </View>

      {/* Logout Confirmation In-App Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalCard}>
            <View style={styles.logoutIconCircle}>
              <Icon name="log-out-outline" size={30} color="#DC2626" />
            </View>
            <Text style={styles.logoutModalTitle}>Log Out of MyGroceries?</Text>
            <Text style={styles.logoutModalDesc}>
              Are you sure you want to log out, {displayName}? You can sign back in anytime with your mobile number.
            </Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLogoutText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={async () => {
                  setLogoutModalVisible(false);
                  await logout();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                <Icon name="close" size={22} color="#6B7280" />
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
    paddingBottom: 90,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  vipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  editProfileBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  editProfileText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  addressItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  addressItemSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  radioDotSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  addressDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyWishlistText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  wishlistScroll: {
    gap: 10,
  },
  wishItemCard: {
    width: 100,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wishItemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
  },
  wishItemName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  wishItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
  },
  footerDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  saveProfileBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  guestAvatar: {
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutModalDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  cancelLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginBannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 6,
    marginBottom: 16,
    gap: 8,
  },
  loginBannerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  adminHubBannerCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  adminHubBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  adminHubShield: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adminHubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  adminLivePill: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminLivePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  adminHubDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
    lineHeight: 16,
  },
  adminHubLaunchBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  adminHubLaunchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  adminTagBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminTagText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
