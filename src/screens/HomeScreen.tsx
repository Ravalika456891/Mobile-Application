import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { CategoryBar } from '../components/CategoryBar';
import { BannerCarousel } from '../components/BannerCarousel';
import { ProductCard } from '../components/ProductCard';

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

  const isSearching = searchQuery.trim().length > 0;

  const filteredProducts = products.filter((p) => {
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

  // Recommended Products: Top rated products (>= 4.8)
  const recommendedProducts = products.filter((p) => p.rating >= 4.8).slice(0, 8);

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'all':
        return 'Popular Groceries';
      case 'fruits':
        return 'Fresh Farm Fruits';
      case 'vegetables':
        return 'Organic Vegetables & Greens';
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

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Category Pills Bar */}
      <CategoryBar />

      {/* Promotional Banners Section (hidden while searching to focus on search results) */}
      {!isSearching && <BannerCarousel />}

      {/* Quick Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, filterFastDelivery && styles.filterChipActive]}
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
          style={[styles.filterChip, filterVegOnly && styles.filterChipActive]}
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

        {(selectedCategory !== 'all' || filterVegOnly || filterFastDelivery) && (
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

      {/* Recommended Products Horizontal Section (Step 2 - F) */}
      {!isSearching && selectedCategory === 'all' && (
        <View style={styles.recommendedSection}>
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

      {/* Section Header: Popular Products / Catalog */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleCol}>
          <Text style={styles.sectionHeading}>
            {isSearching ? `Results for "${searchQuery}"` : getCategoryTitle()}
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
              <Text style={styles.resetSearchButtonText}>Clear Search & View All</Text>
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
  recommendedSection: {
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
