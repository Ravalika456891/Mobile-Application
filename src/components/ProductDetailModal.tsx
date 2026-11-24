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
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);

  useEffect(() => {
    setImgError(false);
    setSelectedVolume(null);
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const activeOption = selectedProduct.volumeOptions?.find(
    (opt) => opt.size === (selectedVolume || selectedProduct.weightOrSize)
  );

  const displayPrice = activeOption ? activeOption.price : selectedProduct.price;
  const displayOriginalPrice = activeOption
    ? (activeOption.originalPrice || selectedProduct.originalPrice)
    : selectedProduct.originalPrice;
  const displayWeightOrSize = activeOption ? activeOption.size : selectedProduct.weightOrSize;

  const currentProductToAdd = activeOption
    ? {
        ...selectedProduct,
        price: displayPrice,
        originalPrice: displayOriginalPrice,
        weightOrSize: displayWeightOrSize,
      }
    : selectedProduct;

  const quantity = getItemQuantity(selectedProduct.id);
  const isFavorite = isInWishlist(selectedProduct.id);

  const discountPercent = displayOriginalPrice
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
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

            {/* Subcategory */}
            <Text style={styles.categorySub}>{selectedProduct.subcategory}</Text>

            {/* Brand & Flavour Pills */}
            {selectedProduct.brand && (
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Icon name="ribbon-outline" size={13} color="#4F46E5" />
                  <Text style={styles.brandBadgeText}>{selectedProduct.brand}</Text>
                </View>
                {selectedProduct.flavour && (
                  <View style={styles.flavourBadge}>
                    <Text style={styles.flavourBadgeText} numberOfLines={1}>
                      {selectedProduct.flavour}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Dietary Badges */}
            {(selectedProduct.isVeg || selectedProduct.isVegan || selectedProduct.isJainFriendly) && (
              <View style={styles.dietaryRow}>
                {selectedProduct.isVeg && (
                  <View style={styles.dietBadgeVeg}>
                    <View style={styles.greenDietDot} />
                    <Text style={styles.dietBadgeVegText}>Vegetarian</Text>
                  </View>
                )}
                {selectedProduct.isVegan && (
                  <View style={styles.dietBadgeVegan}>
                    <Icon name="leaf" size={11} color="#059669" />
                    <Text style={styles.dietBadgeVeganText}>Vegan</Text>
                  </View>
                )}
                {selectedProduct.isJainFriendly && (
                  <View style={styles.dietBadgeJain}>
                    <Icon name="shield-checkmark" size={11} color="#D97706" />
                    <Text style={styles.dietBadgeJainText}>Jain-Friendly</Text>
                  </View>
                )}
              </View>
            )}

            {/* Title & Weight */}
            <Text style={styles.title}>{selectedProduct.name}</Text>
            <Text style={styles.weight}>{displayWeightOrSize}</Text>

            {/* Verified Sugar Banner */}
            {selectedProduct.sugarLabel && (
              <View
                style={[
                  styles.sugarBanner,
                  selectedProduct.sugarLabel === 'Sugar-Free' ||
                  selectedProduct.sugarLabel === 'Zero Added Sugar'
                    ? styles.sugarBannerGreen
                    : styles.sugarBannerBlue,
                ]}
              >
                <Icon
                  name="shield-checkmark"
                  size={18}
                  color={
                    selectedProduct.sugarLabel === 'Sugar-Free' ||
                    selectedProduct.sugarLabel === 'Zero Added Sugar'
                      ? '#059669'
                      : '#2563EB'
                  }
                />
                <View style={styles.sugarBannerCol}>
                  <Text
                    style={[
                      styles.sugarBannerTitle,
                      {
                        color:
                          selectedProduct.sugarLabel === 'Sugar-Free' ||
                          selectedProduct.sugarLabel === 'Zero Added Sugar'
                            ? '#065F46'
                            : '#1E40AF',
                      },
                    ]}
                  >
                    {selectedProduct.sugarLabel} Certified
                  </Text>
                  <Text style={styles.sugarBannerSubtitle}>
                    {selectedProduct.sugarLabel === 'Sugar-Free'
                      ? 'Zero grams of sugar • 100% diabetic and keto friendly'
                      : selectedProduct.sugarLabel === 'Zero Added Sugar'
                      ? 'No refined sugars added • Sweetened only by real fruit arils'
                      : selectedProduct.sugarLabel === 'Low-Sugar'
                      ? 'Reduced sugar formulation • Balanced calorie intake'
                      : 'Authentic classic recipe with certified quality'}
                  </Text>
                </View>
              </View>
            )}

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
              <Text style={styles.price}>₹{displayPrice}</Text>
              {displayOriginalPrice && (
                <Text style={styles.originalPrice}>₹{displayOriginalPrice}</Text>
              )}
              {discountPercent > 0 && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>

            {/* Volume / Pack Size Selector (200 ml, 250 ml, 500 ml, 750 ml, 1 L, 2 L) */}
            {selectedProduct.volumeOptions && selectedProduct.volumeOptions.length > 0 && (
              <View style={styles.volumeContainer}>
                <View style={styles.volumeTitleRow}>
                  <Icon name="layers-outline" size={15} color="#4F46E5" />
                  <Text style={styles.volumeTitle}>Select Pack Size / Volume</Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.volumeList}
                >
                  {selectedProduct.volumeOptions.map((opt) => {
                    const isSelected = displayWeightOrSize === opt.size;
                    return (
                      <TouchableOpacity
                        key={opt.size}
                        style={[styles.volumeCard, isSelected && styles.volumeCardActive]}
                        onPress={() => setSelectedVolume(opt.size)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.volumeCardSize,
                            isSelected && styles.volumeCardSizeActive,
                          ]}
                        >
                          {opt.size}
                        </Text>
                        <Text
                          style={[
                            styles.volumeCardPrice,
                            isSelected && styles.volumeCardPriceActive,
                          ]}
                        >
                          ₹{opt.price}
                        </Text>
                        {opt.originalPrice && opt.originalPrice > opt.price && (
                          <Text style={styles.volumeCardOriginalPrice}>
                            ₹{opt.originalPrice}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Product Overview / Description */}
            <Text style={styles.sectionHeading}>Product Overview</Text>
            <Text style={styles.descriptionText}>{selectedProduct.description}</Text>

            {/* Ingredients Section */}
            {selectedProduct.ingredients && (
              <View style={styles.specCard}>
                <View style={styles.specCardHeader}>
                  <Icon name="nutrition-outline" size={16} color="#059669" />
                  <Text style={styles.specCardTitle}>Ingredients</Text>
                </View>
                <Text style={styles.specCardText}>{selectedProduct.ingredients}</Text>
              </View>
            )}

            {/* Nutritional Facts Table */}
            {selectedProduct.nutritionInfo && (
              <View style={styles.specCard}>
                <View style={styles.specCardHeader}>
                  <Icon name="fitness-outline" size={16} color="#2563EB" />
                  <Text style={styles.specCardTitle}>
                    Nutritional Information{' '}
                    {selectedProduct.nutritionInfo.servingSize
                      ? `(${selectedProduct.nutritionInfo.servingSize})`
                      : ''}
                  </Text>
                </View>
                <View style={styles.nutritionTable}>
                  {selectedProduct.nutritionInfo.energy && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Energy</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.energy}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.carbohydrates && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Carbohydrates</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.carbohydrates}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.sugars && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Total Sugars</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.sugars}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.addedSugar && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Added Sugars</Text>
                      <Text
                        style={[
                          styles.nutritionColVal,
                          selectedProduct.nutritionInfo.addedSugar === '0 g' && {
                            color: '#059669',
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {selectedProduct.nutritionInfo.addedSugar}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.protein && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Protein</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.protein}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.fat && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Total Fat</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.fat}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.sodium && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Sodium</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.sodium}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.potassium && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Potassium</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.potassium}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.calcium && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Calcium</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.calcium}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.vitaminC && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Vitamin C</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.vitaminC}
                      </Text>
                    </View>
                  )}
                  {selectedProduct.nutritionInfo.vitaminD && (
                    <View style={styles.nutritionRow}>
                      <Text style={styles.nutritionColKey}>Vitamin D</Text>
                      <Text style={styles.nutritionColVal}>
                        {selectedProduct.nutritionInfo.vitaminD}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Shelf Life, Expiry Date & Storage Instructions */}
            {(selectedProduct.expiryDate || selectedProduct.storageInstructions) && (
              <View style={styles.specCard}>
                <View style={styles.specCardHeader}>
                  <Icon name="time-outline" size={16} color="#D97706" />
                  <Text style={styles.specCardTitle}>
                    Expiry Date & Storage Instructions
                  </Text>
                </View>
                {selectedProduct.expiryDate && (
                  <View style={styles.specInfoRow}>
                    <Text style={styles.specInfoKey}>Expiry / Best Before:</Text>
                    <Text style={styles.specInfoVal}>{selectedProduct.expiryDate}</Text>
                  </View>
                )}
                {selectedProduct.shelfLife && (
                  <View style={styles.specInfoRow}>
                    <Text style={styles.specInfoKey}>Shelf Life:</Text>
                    <Text style={styles.specInfoVal}>{selectedProduct.shelfLife}</Text>
                  </View>
                )}
                {selectedProduct.storageInstructions && (
                  <View style={styles.storageBox}>
                    <Icon name="snow-outline" size={15} color="#0284C7" />
                    <Text style={styles.storageText}>
                      {selectedProduct.storageInstructions}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Guarantees Box */}
            <View style={styles.guaranteeBox}>
              <View style={styles.guaranteeItem}>
                <Icon name="shield-checkmark" size={18} color="#10B981" />
                <Text style={styles.guaranteeLabel}>100% Quality & Hygiene Assured</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Icon name="snow" size={18} color="#06B6D4" />
                <Text style={styles.guaranteeLabel}>Chilled Cold Chain Delivery</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Icon name="refresh" size={18} color="#8B5CF6" />
                <Text style={styles.guaranteeLabel}>Instant Return at Doorstep</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Fixed Action Bar */}
          <View style={styles.bottomBar}>
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomPriceLabel}>
                Total ({displayWeightOrSize})
              </Text>
              <Text style={styles.bottomPriceValue}>
                ₹{displayPrice * Math.max(1, quantity)}
              </Text>
            </View>

            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addCartBtn}
                onPress={() => addToCart(currentProductToAdd)}
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
                  onPress={() => addToCart(currentProductToAdd)}
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
    maxHeight: '92%',
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
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    position: 'relative',
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deliveryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  categorySub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  brandBadgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  flavourBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  flavourBadgeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  dietaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  dietBadgeVeg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  greenDietDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  dietBadgeVegText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
  },
  dietBadgeVegan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  dietBadgeVeganText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  dietBadgeJain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  dietBadgeJainText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 4,
  },
  weight: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
    marginBottom: 10,
  },
  sugarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 10,
    marginBottom: 14,
  },
  sugarBannerGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  sugarBannerBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sugarBannerCol: {
    flex: 1,
  },
  sugarBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sugarBannerSubtitle: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontSize: 12,
    color: '#6B7280',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 15,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  volumeContainer: {
    marginBottom: 16,
  },
  volumeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  volumeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  volumeList: {
    gap: 8,
  },
  volumeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  volumeCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  volumeCardSize: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 2,
  },
  volumeCardSizeActive: {
    color: '#4F46E5',
    fontWeight: '800',
  },
  volumeCardPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  volumeCardPriceActive: {
    color: '#4F46E5',
  },
  volumeCardOriginalPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 14,
  },
  specCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  specCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  specCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  specCardText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  nutritionTable: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4.5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  nutritionColKey: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  nutritionColVal: {
    fontSize: 11.5,
    color: '#0F172A',
    fontWeight: '700',
  },
  specInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  specInfoKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  specInfoVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  storageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 6,
  },
  storageText: {
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
  },
  guaranteeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guaranteeLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#374151',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
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
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  addCartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  counterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 12,
  },
  counterBtn: {
    padding: 4,
  },
  counterQty: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
});
