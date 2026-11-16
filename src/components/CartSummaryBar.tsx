import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';

export const CartSummaryBar: React.FC = () => {
  const { cartCount, cartTotal, setActiveTab } = useApp();

  if (cartCount === 0) return null;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setActiveTab('cart')}
        activeOpacity={0.9}
        accessibilityLabel={`View cart, ${cartCount} items, total ₹${cartTotal}`}
      >
        {/* Left Side: Cart Icon & Item Count / Subtotal */}
        <View style={styles.cartLeft}>
          <View style={styles.cartIconBadge}>
            <Icon name="cart" size={17} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.itemCountText}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </Text>
            <Text style={styles.totalPriceText}>₹{cartTotal}</Text>
          </View>
        </View>

        {/* Right Side: View Cart Action */}
        <View style={styles.viewCartAction}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Icon name="arrow-forward" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 4 : 4,
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCountText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  totalPriceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  viewCartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
