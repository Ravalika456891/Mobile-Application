import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Icon } from './Icon';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { resolveProductImageSource, DEFAULT_FALLBACK_IMAGE } from '../utils/imageRegistry';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';

interface ProductCardProps {
  product: Product;
  customWidth?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  customWidth,
}) => {
  const {
    addToCart,
    removeFromCart,
    getItemQuantity,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
  } = useApp();

  const { width } = useWindowDimensions();
  // Responsive card width: Exactly 2 columns with 12px screen padding & 10px gap
  const cardWidth = customWidth || Math.floor((width - 34) / 2);

  const quantity = getItemQuantity(product.id);
  const isFavorite = isInWishlist(product.id);
  const [imgError, setImgError] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => setSelectedProduct(product)}
      activeOpacity={0.9}
    >
      {/* Top Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={imgError ? { uri: DEFAULT_FALLBACK_IMAGE } : resolveProductImageSource(product.image)}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />

        {/* Delivery Time Badge */}
        <View style={styles.deliveryBadge}>
          <Icon name="flash" size={10} color="#065F46" />
          <Text style={styles.deliveryBadgeText}>
            {product.deliveryTimeMins}m
          </Text>
        </View>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleWishlist(product.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={16}
            color={isFavorite ? '#EF4444' : '#64748B'}
          />
        </TouchableOpacity>
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* Subcategory & Veg / Non-Veg Indicator */}
        <View style={styles.metaRow}>
          <Text style={styles.subcategoryText} numberOfLines={1}>
            {product.subcategory}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            {product.storageType && product.storageType !== 'ambient' && (
              <View
                style={[
                  styles.storagePill,
                  product.storageType === 'frozen' ? styles.frozenPill : styles.chilledPill,
                ]}
              >
                <Text style={styles.storagePillText}>
                  {product.storageType === 'frozen' ? '-18°C' : 'Chilled'}
                </Text>
              </View>
            )}
            {(product.isVeg !== undefined || product.isNonVeg) && (
              <View
                style={[
                  styles.vegBox,
                  { borderColor: product.isNonVeg || !product.isVeg ? '#991B1B' : '#10B981' },
                ]}
              >
                <View
                  style={[
                    styles.vegDot,
                    { backgroundColor: product.isNonVeg || !product.isVeg ? '#991B1B' : '#10B981' },
                  ]}
                />
              </View>
            )}
          </View>
        </View>

        {/* Brand if available */}
        {product.brand && (
          <Text style={styles.brandText} numberOfLines={1}>
            {product.brand}
          </Text>
        )}

        {/* Product Name */}
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Weight or Size & Sugar Label & Variant Count */}
        <View style={styles.specRow}>
          <Text style={styles.weightText}>{product.weightOrSize}</Text>
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantBadge}>
              <Text style={styles.variantBadgeText}>{product.variants.length} options</Text>
            </View>
          )}
          {product.warranty && (
            <View style={styles.warrantyBadge}>
              <Text style={styles.warrantyBadgeText}>{product.warranty}</Text>
            </View>
          )}
          {product.sugarLabel && (
            <View
              style={[
                styles.sugarBadge,
                product.sugarLabel === 'Sugar-Free' || product.sugarLabel === 'Zero Added Sugar'
                  ? styles.sugarBadgeGreen
                  : styles.sugarBadgeBlue,
              ]}
            >
              <Text
                style={[
                  styles.sugarBadgeText,
                  product.sugarLabel === 'Sugar-Free' || product.sugarLabel === 'Zero Added Sugar'
                    ? styles.sugarBadgeTextGreen
                    : styles.sugarBadgeTextBlue,
                ]}
                numberOfLines={1}
              >
                {product.sugarLabel}
              </Text>
            </View>
          )}
        </View>

        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Icon name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviewsCount})</Text>
        </View>

        {/* Sample Identification (Price & Inventory) */}
        {(product.isSamplePrice || product.isSampleStock) && (
          <View style={styles.sampleRow}>
            {product.isSamplePrice && (
              <View style={styles.sampleBadge}>
                <Text style={styles.sampleBadgeText}>Sample Price</Text>
              </View>
            )}
            {product.isSampleStock && (
              <View style={styles.sampleStockBadge}>
                <Text style={styles.sampleStockText}>Stock: {product.stockCount} (Sample)</Text>
              </View>
            )}
          </View>
        )}

        {/* Price & Add to Cart Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ₹{product.originalPrice}
              </Text>
            )}
          </View>

          {/* Quantity Controls */}
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation?.();
                addToCart(product);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>ADD</Text>
              <Icon name="add" size={13} color="#059669" />
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyCounter}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  removeFromCart(product.id);
                }}
              >
                <Icon name="remove" size={13} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  addToCart(product);
                }}
              >
                <Icon name="add" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  imageContainer: {
    height: 130,
    width: '100%',
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(236, 253, 245, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  deliveryBadgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subcategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  storagePill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  chilledPill: {
    backgroundColor: '#E0F2FE',
  },
  frozenPill: {
    backgroundColor: '#EFF6FF',
  },
  storagePillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0284C7',
  },
  vegBox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 3,
    minHeight: 36,
  },
  weightText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  variantBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 4,
    marginBottom: 4,
  },
  variantBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  warrantyBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginLeft: 4,
    marginBottom: 4,
  },
  warrantyBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#047857',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  reviewsText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  originalPrice: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 5.5,
    borderRadius: 8,
    gap: 2,
  },
  addButtonText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 12,
  },
  qtyCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  qtyBtn: {
    padding: 3,
  },
  qtyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    minWidth: 16,
    textAlign: 'center',
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 4,
  },
  sugarBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  sugarBadgeGreen: {
    backgroundColor: '#ECFDF5',
  },
  sugarBadgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  sugarBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  sugarBadgeTextGreen: {
    color: '#059669',
  },
  sugarBadgeTextBlue: {
    color: '#2563EB',
  },
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  sampleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#F59E0B',
  },
  sampleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  sampleStockBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#A855F7',
  },
  sampleStockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7E22CE',
  },
});
