import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { CategoryBar } from '../components/CategoryBar';
import { BannerCarousel } from '../components/BannerCarousel';
import { ProductCard } from '../components/ProductCard';
import {
  popularVegetables,
  VEGETABLE_SUBCATEGORIES,
  VegetableSubcategory,
} from '../data/products';
import { Product } from '../types';

type VegSortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export const HomeScreen: React.FC = () => {
  const {
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setActiveTab,
  } = useApp();

  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);

  // Dedicated Vegetables Screen States
  const [selectedVegSubcategory, setSelectedVegSubcategory] =
    useState<VegetableSubcategory>('All Vegetables');
  const [vegSearchQuery, setVegSearchQuery] = useState('');
  const [vegSortBy, setVegSortBy] = useState<VegSortOption>('popular');

  const isSearching = searchQuery.trim().length > 0;

  // Recommended Products: Top rated products (>= 4.8)
  const recommendedProducts = useMemo(
    () => products.filter((p) => p.rating >= 4.8).slice(0, 8),
    [products]
  );

  // Popular Farm Fruits: Top 10 fruits
  const popularFarmFruits = useMemo(
    () => products.filter((p) => p.category === 'fruits').slice(0, 10),
    [products]
  );

  // Dedicated Vegetable Products List (All 60 items)
  const vegetableProducts = useMemo(() => {
    return products.filter((p) => {
      return (
        p.category === 'vegetables' ||
        (p.category === 'fruits-vegetables' &&
          !p.subcategory.toLowerCase().includes('fruit'))
      );
    });
  }, [products]);

  // Filtered & Sorted Vegetable List for Dedicated Vegetables View
  const processedVegetables = useMemo(() => {
    let list = vegetableProducts;

    // Subcategory filter
    if (selectedVegSubcategory !== 'All Vegetables') {
      list = list.filter((p) => p.subcategory === selectedVegSubcategory);
    }

    // In-category search filter
    if (vegSearchQuery.trim().length > 0) {
      const q = vegSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Fast delivery filter
    if (filterFastDelivery) {
      list = list.filter((p) => p.deliveryTimeMins <= 10);
    }

    // Sorting
    const sorted = [...list];
    switch (vegSortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
    }
    return sorted;
  }, [
    vegetableProducts,
    selectedVegSubcategory,
    vegSearchQuery,
    filterFastDelivery,
    vegSortBy,
  ]);

  // General Filtered Products (for search and non-vegetables categories)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (isSearching) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSub = p.subcategory.toLowerCase().includes(q);
        const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchSub && !matchTags) return false;
      }

      if (selectedCategory === 'fruits') {
        const isFruit =
          p.category === 'fruits' ||
          (p.category === 'fruits-vegetables' &&
            (p.subcategory.toLowerCase().includes('fruit') ||
              p.tags?.some((t) => t.toLowerCase().includes('fruit'))));
        if (!isFruit) return false;
      } else if (selectedCategory === 'vegetables') {
        const isVeggie =
          p.category === 'vegetables' ||
          (p.category === 'fruits-vegetables' &&
            !p.subcategory.toLowerCase().includes('fruit'));
        if (!isVeggie) return false;
      } else if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      if (filterVegOnly && !p.isVeg) {
        return false;
      }

      if (filterFastDelivery && p.deliveryTimeMins > 10) {
        return false;
      }

      return true;
    });
  }, [
    products,
    isSearching,
    searchQuery,
    selectedCategory,
    filterVegOnly,
    filterFastDelivery,
  ]);

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'all':
        return 'Popular Groceries';
      case 'fruits':
        return 'Fresh Farm Fruits';
      case 'vegetables':
        return 'Fresh Farm Vegetables';
      case 'dairy':
        return 'Dairy, Milk & Farm Eggs';
      case 'bakery':
        return 'Fresh Artisan Bakery & Breads';
      case 'snacks':
        return 'Snacks, Chips & Munchies';
      case 'beverages':
        return 'Beverages & Cold Pressed Juices';
      case 'rice-grains':
        return 'Rice, Pulses & Whole Grains';
      case 'cooking-essentials':
        return 'Cooking Oils, Ghee & Spices';
      case 'household':
        return 'Household Cleaning Essentials';
      case 'personal-care':
        return 'Personal Care & Hygiene';
      default:
        return 'Superfast Delivery Catalog';
    }
  };

  const getSubcategoryCount = (sub: string) => {
    if (sub === 'All Vegetables') return vegetableProducts.length;
    return vegetableProducts.filter((p) => p.subcategory === sub).length;
  };

  const isVegetablesCategory = selectedCategory === 'vegetables' && !isSearching;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Category Pills Bar (always visible at top of catalog) */}
      <CategoryBar />

      {/* ============================================================ */}
      {/* CASE A: DEDICATED VEGETABLES CATEGORY VIEW (Task 4)           */}
      {/* ============================================================ */}
      {isVegetablesCategory ? (
        <View style={styles.vegScreenContainer}>
          {/* Back Navigation Bar */}
          <View style={styles.categoryNavRow}>
            <TouchableOpacity
              style={styles.backPill}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={16} color="#059669" />
              <Text style={styles.backPillText}>All Departments</Text>
            </TouchableOpacity>

            <View style={styles.totalBadge}>
              <Icon name="leaf" size={13} color="#059669" />
              <Text style={styles.totalBadgeText}>60 Farm Fresh Items</Text>
            </View>
          </View>

          {/* Dedicated Category Hero Banner */}
          <View style={styles.vegHeroBanner}>
            <View style={styles.vegHeroTextCol}>
              <View style={styles.vegBadgeTag}>
                <Icon name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.vegBadgeTagText}>100% ORGANIC & VERIFIED</Text>
              </View>
              <Text style={styles.vegHeroTitle}>Farm Fresh Vegetables</Text>
              <Text style={styles.vegHeroSub}>
                Crisp, hand-harvested & pesticide-tested vegetables from partner farms • 10-Min Delivery
              </Text>
            </View>
          </View>

          {/* In-Category Search Box */}
          <View style={styles.vegSearchBox}>
            <Icon name="search-outline" size={17} color="#6B7280" />
            <TextInput
              style={styles.vegSearchInput}
              placeholder="Search in 60 vegetables (e.g. Tomato, Palak, Broccoli)..."
              placeholderTextColor="#9CA3AF"
              value={vegSearchQuery}
              onChangeText={setVegSearchQuery}
              returnKeyType="search"
            />
            {vegSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setVegSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close-circle" size={17} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Subcategory Filter Pills (Horizontal Scroll) */}
          <View style={styles.subcatSection}>
            <Text style={styles.filterSectionTitle}>Subcategories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcatScroll}
            >
              {VEGETABLE_SUBCATEGORIES.map((subcat) => {
                const isSelected = selectedVegSubcategory === subcat;
                const count = getSubcategoryCount(subcat);
                return (
                  <TouchableOpacity
                    key={subcat}
                    style={[
                      styles.subcatPill,
                      isSelected && styles.subcatPillActive,
                    ]}
                    onPress={() => setSelectedVegSubcategory(subcat)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.subcatPillText,
                        isSelected && styles.subcatPillTextActive,
                      ]}
                    >
                      {subcat}
                    </Text>
                    <View
                      style={[
                        styles.subcatCountBadge,
                        isSelected && styles.subcatCountBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.subcatCountText,
                          isSelected && styles.subcatCountTextActive,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Sort By Filter Pills */}
          <View style={styles.sortSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortScroll}
            >
              <TouchableOpacity
                style={[
                  styles.sortPill,
                  vegSortBy === 'popular' && styles.sortPillActive,
                ]}
                onPress={() => setVegSortBy('popular')}
                activeOpacity={0.75}
              >
                <Icon
                  name="flame"
                  size={12}
                  color={vegSortBy === 'popular' ? '#FFFFFF' : '#4B5563'}
                />
                <Text
                  style={[
                    styles.sortPillText,
                    vegSortBy === 'popular' && styles.sortPillTextActive,
                  ]}
                >
                  Popular
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortPill,
                  vegSortBy === 'price-asc' && styles.sortPillActive,
                ]}
                onPress={() => setVegSortBy('price-asc')}
                activeOpacity={0.75}
              >
                <Icon
                  name="arrow-up"
                  size={12}
                  color={vegSortBy === 'price-asc' ? '#FFFFFF' : '#4B5563'}
                />
                <Text
                  style={[
                    styles.sortPillText,
                    vegSortBy === 'price-asc' && styles.sortPillTextActive,
                  ]}
                >
                  Price: Low to High
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortPill,
                  vegSortBy === 'price-desc' && styles.sortPillActive,
                ]}
                onPress={() => setVegSortBy('price-desc')}
                activeOpacity={0.75}
              >
                <Icon
                  name="arrow-down"
                  size={12}
                  color={vegSortBy === 'price-desc' ? '#FFFFFF' : '#4B5563'}
                />
                <Text
                  style={[
                    styles.sortPillText,
                    vegSortBy === 'price-desc' && styles.sortPillTextActive,
                  ]}
                >
                  Price: High to Low
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortPill,
                  vegSortBy === 'rating' && styles.sortPillActive,
                ]}
                onPress={() => setVegSortBy('rating')}
                activeOpacity={0.75}
              >
                <Icon
                  name="star"
                  size={12}
                  color={vegSortBy === 'rating' ? '#FFFFFF' : '#F59E0B'}
                />
                <Text
                  style={[
                    styles.sortPillText,
                    vegSortBy === 'rating' && styles.sortPillTextActive,
                  ]}
                >
                  Top Rated
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Results Summary Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionHeading}>
                {selectedVegSubcategory}
              </Text>
              <Text style={styles.sectionSubheading}>
                Showing {processedVegetables.length} vegetables in stock
              </Text>
            </View>

            {(selectedVegSubcategory !== 'All Vegetables' ||
              vegSearchQuery.length > 0 ||
              vegSortBy !== 'popular') && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => {
                  setSelectedVegSubcategory('All Vegetables');
                  setVegSearchQuery('');
                  setVegSortBy('popular');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product Grid or Empty State */}
          {processedVegetables.length === 0 ? (
            <View style={styles.emptyResults}>
              <View style={styles.emptyIconCircle}>
                <Icon name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No vegetables found</Text>
              <Text style={styles.emptySub}>
                No vegetables match your search or subcategory filter. Tap below to see all 60 fresh vegetables.
              </Text>
              <TouchableOpacity
                style={styles.resetSearchButton}
                onPress={() => {
                  setSelectedVegSubcategory('All Vegetables');
                  setVegSearchQuery('');
                  setVegSortBy('popular');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetSearchButtonText}>
                  Show All 60 Vegetables
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {processedVegetables.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      ) : (
        /* ============================================================ */
        /* CASE B: STANDARD SHOP HOMEPAGE & OTHER CATEGORIES            */
        /* ============================================================ */
        <View>
          {/* Promotional Banners Section (hidden while searching) */}
          {!isSearching && <BannerCarousel />}

          {/* Quick Filter Bar */}
          <View style={styles.filterBar}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                filterFastDelivery && styles.filterChipActive,
              ]}
              onPress={() => setFilterFastDelivery(!filterFastDelivery)}
              activeOpacity={0.75}
            >
              <Icon
                name="flash"
                size={13}
                color={filterFastDelivery ? '#FFFFFF' : '#059669'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filterFastDelivery && styles.filterChipTextActive,
                ]}
              >
                Under 10 Mins
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                filterVegOnly && styles.filterChipActive,
              ]}
              onPress={() => setFilterVegOnly(!filterVegOnly)}
              activeOpacity={0.75}
            >
              <Icon
                name="leaf"
                size={13}
                color={filterVegOnly ? '#FFFFFF' : '#10B981'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filterVegOnly && styles.filterChipTextActive,
                ]}
              >
                Vegetarian
              </Text>
            </TouchableOpacity>

            {(selectedCategory !== 'all' ||
              filterVegOnly ||
              filterFastDelivery) && (
              <TouchableOpacity
                style={styles.clearFilterChip}
                onPress={() => {
                  setSelectedCategory('all');
                  setFilterVegOnly(false);
                  setFilterFastDelivery(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearFilterText}>Reset Filters</Text>
                <Icon name="close-circle" size={13} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Section 1: Recommended Products Horizontal Section */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="star" size={15} color="#F59E0B" />
                    <Text style={styles.sectionHeading}>Recommended For You</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Top-rated customer favorites delivered in 10 mins
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setActiveTab('categories')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <Icon name="chevron-forward" size={12} color="#059669" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {recommendedProducts.map((product) => (
                  <ProductCard
                    key={`rec-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 2: Popular Farm Fruits Section */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="nutrition-outline" size={15} color="#10B981" />
                    <Text style={styles.sectionHeading}>Popular Farm Fruits</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Juicy, seasonal and farm-picked fruits
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('fruits')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All Fruits</Text>
                  <Icon name="chevron-forward" size={12} color="#059669" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {popularFarmFruits.map((product) => (
                  <ProductCard
                    key={`fruit-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 3: Fresh Vegetables Section (Task 3!) */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="leaf" size={15} color="#059669" />
                    <Text style={styles.sectionHeading}>Fresh Vegetables</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    100% Crisp & cleaned • 60+ farm varieties in stock
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('vegetables')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAllText}>View All Vegetables</Text>
                  <Icon name="chevron-forward" size={12} color="#059669" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {popularVegetables.map((product) => (
                  <ProductCard
                    key={`veg-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 4: Dairy, Milk & Farm Eggs Horizontal Section */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="water-outline" size={15} color="#3B82F6" />
                    <Text style={styles.sectionHeading}>Dairy, Milk & Farm Eggs</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Fresh milk, dahi, paneer, butter, ghee & chilled milkshakes • 10-Min Delivery
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('dairy')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#2563EB' }]}>View All Dairy</Text>
                  <Icon name="chevron-forward" size={12} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {products
                  .filter((p) => p.category === 'dairy')
                  .slice(0, 10)
                  .map((product) => (
                    <ProductCard
                      key={`dairy-row-${product.id}`}
                      product={product}
                      customWidth={165}
                    />
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Section Header: Popular Products / Filtered Catalog */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionHeading}>
                {isSearching
                  ? `Results for "${searchQuery}"`
                  : getCategoryTitle()}
              </Text>
              <Text style={styles.sectionSubheading}>
                {filteredProducts.length} items available in stock
              </Text>
            </View>

            {isSearching && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}

            {selectedCategory !== 'all' && !isSearching && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSelectedCategory('all')}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchText}>Back to All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product Grid or No-Results Empty State */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyResults}>
              <View style={styles.emptyIconCircle}>
                <Icon name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No matching products found</Text>
              <Text style={styles.emptySub}>
                We couldn't find anything matching your search. Try searching for milk, tomatoes, bread, or basmati rice.
              </Text>
              {isSearching && (
                <TouchableOpacity
                  style={styles.resetSearchButton}
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetSearchButtonText}>
                    Clear Search & View All
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Trust & Quality Assurance Strip */}
      <View style={styles.trustStrip}>
        <View style={styles.trustItem}>
          <Icon name="time" size={22} color="#10B981" />
          <Text style={styles.trustTitle}>10-Min Delivery</Text>
          <Text style={styles.trustDesc}>From local dark stores</Text>
        </View>
        <View style={styles.trustItem}>
          <Icon name="shield-checkmark" size={22} color="#3B82F6" />
          <Text style={styles.trustTitle}>Best Quality</Text>
          <Text style={styles.trustDesc}>Farm fresh & verified</Text>
        </View>
        <View style={styles.trustItem}>
          <Icon name="snow" size={22} color="#EC4899" />
          <Text style={styles.trustTitle}>Cold Chain</Text>
          <Text style={styles.trustDesc}>Chilled dairy & ice creams</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  content: {
    paddingBottom: 90,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  filterChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    marginLeft: 'auto',
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  horizontalSection: {
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sectionTitleCol: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubheading: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  clearSearchBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  clearSearchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  horizontalListContent: {
    paddingHorizontal: 12,
    gap: 10,
    paddingBottom: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  resetSearchButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Dedicated Vegetables Screen Styles
  vegScreenContainer: {
    paddingBottom: 16,
  },
  categoryNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  backPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  vegHeroBanner: {
    backgroundColor: '#065F46',
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  vegHeroTextCol: {
    gap: 4,
  },
  vegBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginBottom: 4,
  },
  vegBadgeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vegHeroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  vegHeroSub: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 17,
  },
  vegSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    gap: 8,
    marginBottom: 12,
  },
  vegSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    padding: 0,
  },
  subcatSection: {
    marginBottom: 10,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  subcatScroll: {
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 4,
  },
  subcatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  subcatPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  subcatPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  subcatPillTextActive: {
    color: '#FFFFFF',
  },
  subcatCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  subcatCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  subcatCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
  },
  subcatCountTextActive: {
    color: '#FFFFFF',
  },
  sortSection: {
    marginBottom: 10,
  },
  sortScroll: {
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 4,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  sortPillActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  trustStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustItem: {
    alignItems: 'center',
    maxWidth: 95,
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 6,
    textAlign: 'center',
  },
  trustDesc: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
});
