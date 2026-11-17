import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    removeFromCart,
    getItemQuantity,
    toggleWishlist,
    isInWishlist,
  } = useApp();

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const quantity = getItemQuantity(selectedProduct.id);
  const isFavorite = isInWishlist(selectedProduct.id);

  const discountPercent = selectedProduct.originalPrice
    ? Math.round(
        ((selectedProduct.originalPrice - selectedProduct.price) /
          selectedProduct.originalPrice) *
          100
      )
    : 0;

  return (
    <Modal
      visible={!!selectedProduct}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedProduct(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedProduct(null)}
            >
              <Icon name="close" size={20} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favBtn}
              onPress={() => toggleWishlist(selectedProduct.id)}
            >
              <Icon
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#4B5563'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Product Image */}
            <View style={styles.imageBox}>
              <Image
                source={{
                  uri: imgError ? FALLBACK_IMAGE : selectedProduct.image,
                }}
                style={styles.mainImage}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
              <View style={styles.deliveryBadge}>
                <Icon name="flash" size={13} color="#FFF" />
                <Text style={styles.deliveryBadgeText}>
                  Lightning {selectedProduct.deliveryTimeMins} Mins Delivery
                </Text>
              </View>
            </View>

            {/* Tags Row */}
            <View style={styles.tagsRow}>
              {selectedProduct.tags?.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Title & Category */}
            <Text style={styles.categorySub}>{selectedProduct.subcategory}</Text>
            <Text style={styles.title}>{selectedProduct.name}</Text>
            <Text style={styles.weight}>{selectedProduct.weightOrSize}</Text>

            {/* Rating & Stock */}
            <View style={styles.statsRow}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingValue}>{selectedProduct.rating}</Text>
                <Text style={styles.reviewCount}>
                  ({selectedProduct.reviewsCount} reviews)
                </Text>
              </View>

              <View style={styles.stockBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.stockText}>
                  In Stock ({selectedProduct.stockCount} left)
                </Text>
              </View>
            </View>

            {/* Pricing Section */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{selectedProduct.price}
              </Text>
              {selectedProduct.originalPrice && (
                <Text style={styles.originalPrice}>
                  ₹{selectedProduct.originalPrice}
                </Text>
              )}
              {discountPercent > 0 && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={styles.sectionHeading}>Product Details</Text>
            <Text style={styles.descriptionText}>{selectedProduct.description}</Text>

            {/* Guarantees Box */}
            <View style={styles.guaranteeBox}>
              <View style={styles.guaranteeItem}>
                <Icon name="shield-checkmark" size={18} color="#10B981" />
                <Text style={styles.guaranteeLabel}>100% Quality Assured</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Icon name="snow" size={18} color="#06B6D4" />
                <Text style={styles.guaranteeLabel}>Cold Chain Delivered</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Icon name="refresh" size={18} color="#8B5CF6" />
                <Text style={styles.guaranteeLabel}>Instant Return at Door</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Fixed Action Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomPriceLabel}>Total Price</Text>
              <Text style={styles.bottomPriceValue}>
                ₹{(selectedProduct.price * Math.max(1, quantity))}
              </Text>
            </View>

            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addCartBtn}
                onPress={() => addToCart(selectedProduct)}
                activeOpacity={0.85}
              >
                <Icon name="cart" size={17} color="#FFF" />
                <Text style={styles.addCartBtnText}>Add To Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.counterBar}>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => removeFromCart(selectedProduct.id)}
                >
                  <Icon name="remove" size={17} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.counterQty}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.counterBtn}
                  onPress={() => addToCart(selectedProduct)}
                >
                  <Icon name="add" size={17} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageBox: {
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F9FAFB',
    marginBottom: 14,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  deliveryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tagPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPillText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '700',
  },
  categorySub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
    marginBottom: 4,
  },
  weight: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  reviewCount: {
    fontSize: 11,
    color: '#6B7280',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 18,
  },
  guaranteeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guaranteeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bottomPriceCol: {},
  bottomPriceLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  bottomPriceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  counterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 14,
  },
  counterBtn: {
    padding: 4,
  },
  counterQty: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
});
