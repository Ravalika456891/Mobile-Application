import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CategoryBar } from '../components/CategoryBar';
import { BannerCarousel } from '../components/BannerCarousel';
import { ProductCard } from '../components/ProductCard';

export const HomeScreen: React.FC = () => {
  const { products, selectedCategory, searchQuery, setSelectedCategory, currentUser } = useApp();
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);

  // Filter products based on search, selected category, and active filters
  const filteredProducts = products.filter((p) => {
    // Search match
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSub = p.subcategory.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchSub && !matchTags) return false;
    }

    // Category match
    if (selectedCategory !== 'all' && p.category !== selectedCategory) {
      return false;
    }

    // Veg filter
    if (filterVegOnly && !p.isVeg) {
      return false;
    }

    // Fast delivery (< 10 mins)
    if (filterFastDelivery && p.deliveryTimeMins > 10) {
      return false;
    }

    return true;
  });

  const featuredProducts = products.filter((p) => p.tags?.includes('Best Seller') || p.rating >= 4.9);
  const popularProducts = products.filter((p) => p.reviewsCount > 300);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Category Strip */}
      <CategoryBar />

      {/* Hero Promo Banner Carousel (hide if searching) */}
      {!searchQuery && <BannerCarousel />}

      {/* Filter Chips Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterChip, filterFastDelivery && styles.filterChipActive]}
          onPress={() => setFilterFastDelivery(!filterFastDelivery)}
        >
          <Ionicons
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
        >
          <Ionicons
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
            100% Vegetarian
          </Text>
        </TouchableOpacity>

        {selectedCategory !== 'all' && (
          <TouchableOpacity
            style={styles.clearFilterChip}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={styles.clearFilterText}>All Categories</Text>
            <Ionicons name="close-circle" size={13} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Catalog or Search Results */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? searchQuery
                ? `Results for "${searchQuery}"`
                : 'All Fresh Groceries'
              : `${selectedCategory.replace(/-/g, ' ').toUpperCase()} COLLECTION`}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredProducts.length} items in stock • 10-min delivery
          </Text>
        </View>
      </View>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyResults}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No matching groceries found</Text>
          <Text style={styles.emptySub}>
            Try searching for tomatoes, milk, eggs, rice, olive oil, or chips
          </Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      )}

      {/* Featured Products Section (when browsing all items) */}
      {!searchQuery && selectedCategory === 'all' && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>⭐ Featured Top Picks</Text>
              <Text style={styles.sectionSubtitle}>Highly rated by MyGroceries customers</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {featuredProducts.slice(0, 5).map((product) => (
              <View key={'feat-' + product.id} style={{ width: 180 }}>
                <ProductCard product={product} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Features Trust Strip */}
      <View style={styles.trustStrip}>
        <View style={styles.trustItem}>
          <Ionicons name="time" size={24} color="#10B981" />
          <Text style={styles.trustTitle}>10-Min Delivery</Text>
          <Text style={styles.trustDesc}>Local dark store hubs</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          <Text style={styles.trustTitle}>Quality Assured</Text>
          <Text style={styles.trustDesc}>Fresh or 100% refund</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="pricetag" size={24} color="#F59E0B" />
          <Text style={styles.trustTitle}>Wholesale Prices</Text>
          <Text style={styles.trustDesc}>Direct from farms</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 24,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  clearFilterText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredSection: {
    marginTop: 16,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  trustStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 6,
    textAlign: 'center',
  },
  trustDesc: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
});
