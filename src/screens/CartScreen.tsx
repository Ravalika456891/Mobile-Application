import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { AVAILABLE_COUPONS } from '../data/products';

export const CartScreen: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartTotal,
    addToCart,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    placeOrder,
    selectedAddress,
    products,
    setActiveTab,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [selectedTip, setSelectedTip] = useState<number>(20);
  const [selectedPayment, setSelectedPayment] = useState<string>('UPI');
  const [selectedInstruction, setSelectedInstruction] = useState<string>('Leave at door');

  const discountAmount = appliedCoupon
    ? Number(
        Math.min(
          (cartSubtotal * appliedCoupon.discountPercentage) / 100,
          appliedCoupon.maxDiscount
        ).toFixed(0)
      )
    : 0;

  const deliveryFee = cartSubtotal > 299 ? 0 : 25;
  const finalTotal = Number((cartTotal + selectedTip).toFixed(0));

  const instructions = [
    { id: '1', label: 'Leave at door', icon: 'home-outline' },
    { id: '2', label: "Don't ring bell", icon: 'notifications-off-outline' },
    { id: '3', label: 'Call on arrival', icon: 'call-outline' },
  ];

  const paymentOptions = [
    { id: 'UPI', name: 'Instant UPI (GPay / PhonePe / Paytm)', icon: 'flash' },
    { id: 'Card', name: 'Credit / Debit Card', icon: 'card-outline' },
    { id: 'COD', name: 'Cash on Delivery', icon: 'card-outline' },
    { id: 'NetBanking', name: 'Net Banking', icon: 'card-outline' },
  ];

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="cart-outline" size={54} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Fill your bag with farm vegetables, artisanal ice creams, midnight snacks, or clothing delivered in 10 minutes.
        </Text>
        <TouchableOpacity
          style={styles.browseStoreBtn}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.85}
        >
          <Text style={styles.browseStoreBtnText}>Start Shopping</Text>
        </TouchableOpacity>

        <View style={styles.quickAddSection}>
          <Text style={styles.quickAddHeader}>Popular Quick Adds</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAddScroll}>
            {products.slice(0, 4).map((p) => (
              <View key={p.id} style={styles.quickItemCard}>
                <Image source={{ uri: p.image }} style={styles.quickItemImg} />
                <Text style={styles.quickItemName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.quickItemPrice}>₹{p.price}</Text>
                <TouchableOpacity
                  style={styles.quickItemAddBtn}
                  onPress={() => addToCart(p)}
                >
                  <Text style={styles.quickItemAddText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.speedBanner}>
          <View style={styles.speedIconBox}>
            <Icon name="flash" size={16} color="#FFF" />
          </View>
          <View style={styles.speedTextCol}>
            <Text style={styles.speedTitle}>Delivering in 10 Mins</Text>
            <Text style={styles.speedSubtitle}>Shipment packed in insulated thermal cold-bags</Text>
          </View>
        </View>

        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>Cart Items ({cart.length})</Text>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartRow}>
              <Image source={{ uri: item.product.image }} style={styles.productThumb} />
              <View style={styles.itemMeta}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.itemWeight}>{item.product.weightOrSize}</Text>
                <Text style={styles.itemPrice}>
                  ₹{(item.product.price * item.quantity)}
                </Text>
              </View>

              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={styles.qtyStepBtn}
                  onPress={() => removeFromCart(item.product.id)}
                >
                  <Icon name="remove" size={14} color="#10B981" />
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyStepBtn}
                  onPress={() => addToCart(item.product)}
                >
                  <Icon name="add" size={14} color="#10B981" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>Apply Promo Code</Text>
          {appliedCoupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.appliedCouponLeft}>
                <Icon name="ticket" size={16} color="#10B981" />
                <View>
                  <Text style={styles.appliedCode}>{appliedCoupon.code}</Text>
                  <Text style={styles.appliedSaved}>Saved ₹{discountAmount}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter code (e.g. QUICK50)"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  value={couponInput}
                  onChangeText={setCouponInput}
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    if (couponInput) {
                      applyCoupon(couponInput);
                      setCouponInput('');
                    }
                  }}
                >
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.couponChipsRow}>
                {AVAILABLE_COUPONS.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.couponChip}
                    onPress={() => applyCoupon(c.code)}
                  >
                    <Icon name="ticket-outline" size={12} color="#047857" />
                    <Text style={styles.couponChipText}>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>Delivery Instructions</Text>
          <View style={styles.instructionsRow}>
            {instructions.map((inst) => {
              const isSelected = selectedInstruction === inst.label;
              return (
                <TouchableOpacity
                  key={inst.id}
                  style={[
                    styles.instructionChip,
                    isSelected && styles.instructionChipSelected,
                  ]}
                  onPress={() => setSelectedInstruction(inst.label)}
                >
                  <Icon
                    name={inst.icon}
                    size={14}
                    color={isSelected ? '#10B981' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.instructionText,
                      isSelected && styles.instructionTextSelected,
                    ]}
                  >
                    {inst.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.cardBox}>
          <View style={styles.tipTitleRow}>
            <Text style={styles.boxTitle}>Tip Delivery Partner</Text>
            <Text style={styles.tipSub}>100% goes directly to Alex</Text>
          </View>
          <View style={styles.tipRow}>
            {[10, 20, 30, 50].map((tipVal) => {
              const isSelected = selectedTip === tipVal;
              return (
                <TouchableOpacity
                  key={tipVal}
                  style={[styles.tipPill, isSelected && styles.tipPillSelected]}
                  onPress={() => setSelectedTip(isSelected ? 0 : tipVal)}
                >
                  <Text style={[styles.tipPillText, isSelected && styles.tipPillTextSelected]}>
                    ₹{tipVal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>Payment Method</Text>
          {paymentOptions.map((pay) => {
            const isSelected = selectedPayment === pay.id;
            return (
              <TouchableOpacity
                key={pay.id}
                style={[styles.payRow, isSelected && styles.payRowSelected]}
                onPress={() => setSelectedPayment(pay.id)}
              >
                <View style={styles.payLeft}>
                  <Icon
                    name={pay.icon}
                    size={18}
                    color={isSelected ? '#10B981' : '#4B5563'}
                  />
                  <Text style={[styles.payName, isSelected && styles.payNameSelected]}>
                    {pay.name}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.cardBox}>
          <Text style={styles.boxTitle}>Bill Details</Text>
          <View style={styles.billLine}>
            <Text style={styles.billKey}>Item Subtotal</Text>
            <Text style={styles.billVal}>₹{cartSubtotal.toFixed(0)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.billLine}>
              <Text style={[styles.billKey, { color: '#059669' }]}>
                Promo Discount ({appliedCoupon?.code})
              </Text>
              <Text style={[styles.billVal, { color: '#059669' }]}>
                -₹{discountAmount.toFixed(0)}
              </Text>
            </View>
          )}

          <View style={styles.billLine}>
            <Text style={styles.billKey}>Delivery Fee</Text>
            <Text style={styles.billVal}>
              {deliveryFee === 0 ? (
                <Text style={{ color: '#10B981', fontWeight: '800' }}>FREE</Text>
              ) : (
                `₹${deliveryFee}`
              )}
            </Text>
          </View>

          {selectedTip > 0 && (
            <View style={styles.billLine}>
              <Text style={styles.billKey}>Rider Tip</Text>
              <Text style={styles.billVal}>₹{selectedTip}</Text>
            </View>
          )}

          <View style={styles.divider} />
          <View style={styles.billLineTotal}>
            <Text style={styles.totalKey}>To Pay</Text>
            <Text style={styles.totalVal}>₹{finalTotal.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.addressCard}>
          <Icon name="location" size={18} color="#10B981" />
          <View style={styles.addrTextCol}>
            <Text style={styles.addrHeading}>Delivering to</Text>
            <Text style={styles.addrVal} numberOfLines={2}>
              {selectedAddress}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.checkoutBar}>
        <View style={styles.checkoutLeft}>
          <Text style={styles.checkoutTotalLabel}>TOTAL</Text>
          <Text style={styles.checkoutTotalVal}>₹{finalTotal.toFixed(0)}</Text>
        </View>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={() => placeOrder(selectedPayment, selectedTip)}
          activeOpacity={0.88}
        >
          <Text style={styles.placeOrderText}>Place Order (10 Mins)</Text>
          <Icon name="arrow-forward" size={17} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 300,
  },
  browseStoreBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 30,
  },
  browseStoreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  quickAddSection: {
    width: '100%',
    marginTop: 10,
  },
  quickAddHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickAddScroll: {
    gap: 12,
  },
  quickItemCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    alignItems: 'center',
  },
  quickItemImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  quickItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 6,
  },
  quickItemAddBtn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickItemAddText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  speedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    gap: 12,
  },
  speedIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedTextCol: {
    flex: 1,
  },
  speedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  speedSubtitle: {
    fontSize: 11,
    color: '#047857',
  },
  cardBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  boxTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  itemMeta: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 17,
  },
  itemWeight: {
    fontSize: 11,
    color: '#6B7280',
    marginVertical: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  qtyStepBtn: {
    padding: 4,
  },
  qtyVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
    minWidth: 16,
    textAlign: 'center',
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
  },
  appliedCouponLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appliedCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  appliedSaved: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  removeCouponText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#111827',
  },
  applyBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  couponChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  couponChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  instructionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instructionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 6,
  },
  instructionChipSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  instructionTextSelected: {
    color: '#065F46',
    fontWeight: '700',
  },
  tipTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipSub: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tipPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tipPillSelected: {
    backgroundColor: '#10B981',
  },
  tipPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  tipPillTextSelected: {
    color: '#FFFFFF',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 8,
  },
  payRowSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  payLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  payNameSelected: {
    color: '#065F46',
    fontWeight: '700',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioCircleSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  billLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billKey: {
    fontSize: 13,
    color: '#6B7280',
  },
  billVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  billLineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalKey: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  addrTextCol: {
    flex: 1,
  },
  addrHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  addrVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  checkoutLeft: {},
  checkoutTotalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  checkoutTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
