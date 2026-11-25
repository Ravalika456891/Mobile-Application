import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
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
  CATEGORIES,
  PHASE1_CATEGORIES,
  getCategorySubcategories,
} from '../data/products';
import {
  SNACK_SUBCATEGORIES,
  SNACK_BRANDS,
  SNACK_FLAVOURS,
  SNACK_PRICE_RANGES,
  SNACK_DIETARY_PREFERENCES,
  SNACK_SORT_OPTIONS,
} from '../data/snacks';
import { Product } from '../types';
import { mapCategoryToLegacy } from '../services/database';

type VegSortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export const HomeScreen: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    setActiveTab,
    recentlyViewed,
  } = useApp();

  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);

  // Dedicated Category Screen States (for all 16 categories)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [categorySortBy, setCategorySortBy] = useState('Popularity');

  useEffect(() => {
    setSelectedSubcategory('All');
    setCategorySearchQuery('');
  }, [selectedCategory]);

  // Dedicated Vegetables Screen States
  const [selectedVegSubcategory, setSelectedVegSubcategory] =
    useState<VegetableSubcategory>('All Vegetables');
  const [vegSearchQuery, setVegSearchQuery] = useState('');
  const [vegSortBy, setVegSortBy] = useState<VegSortOption>('popular');

  // Dedicated Snacks Screen States
  const [selectedSnackSubcategory, setSelectedSnackSubcategory] =
    useState<string>('All Snacks');
  const [snackSearchQuery, setSnackSearchQuery] = useState('');
  const [snackBrandFilter, setSnackBrandFilter] = useState('All Brands');
  const [snackPriceFilter, setSnackPriceFilter] = useState('All Prices');
  const [snackFlavourFilter, setSnackFlavourFilter] = useState('All Flavours');
  const [snackDietaryFilter, setSnackDietaryFilter] = useState('All');
  const [snackSortBy, setSnackSortBy] = useState('Popularity');

  const isSearching = searchQuery.trim().length > 0;

  const displayCategories = useMemo(
    () => (categories && categories.length > 0 ? categories : CATEGORIES).filter((c) => c.id !== 'all'),
    [categories]
  );

  const currentCatObj = useMemo(
    () => (categories && categories.length > 0 ? categories : CATEGORIES).find((c) => c.id === selectedCategory),
    [categories, selectedCategory]
  );

  const currentSubcategories = useMemo(() => {
    if (!currentCatObj || !currentCatObj.subcategories) {
      return getCategorySubcategories(selectedCategory);
    }
    return currentCatObj.subcategories;
  }, [currentCatObj, selectedCategory]);

  const trendingProducts = useMemo(
    () => products.filter((p) => (p.originalPrice && p.originalPrice > p.price) || p.rating >= 4.8).slice(0, 10),
    [products]
  );

  const featuredPicks = useMemo(
    () => products.filter((p) => p.tags?.some((t) => t.toLowerCase().includes('fresh') || t.toLowerCase().includes('best seller'))).slice(0, 10),
    [products]
  );

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

  // General Category Products Filtered & Sorted (for any of the 13 Phase 1 & marketplace categories)
  const categoryProducts = useMemo(() => {
    const targetCats = mapCategoryToLegacy(selectedCategory);
    let list = products.filter((p) => {
      if (selectedCategory === 'fruits') {
        return (
          p.category === 'fruits' ||
          (p.category === 'fruits-vegetables' &&
            (p.subcategory.toLowerCase().includes('fruit') ||
              p.tags?.some((t) => t.toLowerCase().includes('fruit'))))
        );
      }
      return targetCats.includes(p.category);
    });

    // Subcategory filter
    if (selectedSubcategory !== 'All') {
      list = list.filter((p) => p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
    }

    // In-category search filter
    if (categorySearchQuery.trim().length > 0) {
      const q = categorySearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Fast delivery filter
    if (filterFastDelivery) {
      list = list.filter((p) => p.deliveryTimeMins <= 10);
    }

    // Veg only filter
    if (filterVegOnly) {
      list = list.filter((p) => p.isVeg);
    }

    // Sorting
    const sorted = [...list];
    switch (categorySortBy) {
      case 'Price: Low to High':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'Rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'Discount':
        sorted.sort((a, b) => {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
      case 'New Arrivals':
        sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
      case 'Popularity':
      default:
        sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
    }
    return sorted;
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    categorySearchQuery,
    filterFastDelivery,
    filterVegOnly,
    categorySortBy,
  ]);

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

  // Dedicated Snacks Products List
  const snackProducts = useMemo(() => {
    return products.filter((p) => p.category === 'snacks');
  }, [products]);

  // Filtered & Sorted Snacks List for Dedicated Snacks View
  const processedSnacks = useMemo(() => {
    let list = snackProducts;

    // Subcategory filter
    if (selectedSnackSubcategory !== 'All Snacks') {
      list = list.filter(
        (p) => p.subcategory.toLowerCase() === selectedSnackSubcategory.toLowerCase()
      );
    }

    // In-category search filter
    if (snackSearchQuery.trim().length > 0) {
      const q = snackSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.flavour && p.flavour.toLowerCase().includes(q)) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (snackBrandFilter !== 'All Brands') {
      list = list.filter(
        (p) => p.brand && p.brand.toLowerCase() === snackBrandFilter.toLowerCase()
      );
    }

    // Price filter
    if (snackPriceFilter === 'Under ₹10') {
      list = list.filter((p) => p.price <= 10);
    } else if (snackPriceFilter === '₹10–₹50') {
      list = list.filter((p) => p.price >= 10 && p.price <= 50);
    } else if (snackPriceFilter === '₹50–₹100') {
      list = list.filter((p) => p.price > 50 && p.price <= 100);
    } else if (snackPriceFilter === '₹100–₹200') {
      list = list.filter((p) => p.price > 100 && p.price <= 200);
    } else if (snackPriceFilter === 'Above ₹200') {
      list = list.filter((p) => p.price > 200);
    }

    // Flavour filter
    if (snackFlavourFilter !== 'All Flavours') {
      list = list.filter(
        (p) => p.flavour && p.flavour.toLowerCase() === snackFlavourFilter.toLowerCase()
      );
    }

    // Dietary preferences filter
    if (snackDietaryFilter === 'Vegetarian') {
      list = list.filter((p) => p.isVeg === true);
    } else if (snackDietaryFilter === 'Vegan') {
      list = list.filter((p) => p.isVegan === true);
    } else if (snackDietaryFilter === 'Jain-friendly') {
      list = list.filter((p) => p.isJainFriendly === true);
    }

    // Fast delivery filter
    if (filterFastDelivery) {
      list = list.filter((p) => p.deliveryTimeMins <= 10);
    }

    // Sorting
    const sorted = [...list];
    switch (snackSortBy) {
      case 'Price: Low to High':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'Discount':
        sorted.sort((a, b) => {
          const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
      case 'New Arrivals':
        sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
      case 'Popularity':
      default:
        sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
    }
    return sorted;
  }, [
    snackProducts,
    selectedSnackSubcategory,
    snackSearchQuery,
    snackBrandFilter,
    snackPriceFilter,
    snackFlavourFilter,
    snackDietaryFilter,
    filterFastDelivery,
    snackSortBy,
  ]);

  // Promotional Carousels for Homepage (Section 8 Prompt)
  const bestsellingChips = useMemo(
    () => snackProducts.filter((p) => p.subcategory === 'Chips & Crisps'),
    [snackProducts]
  );

  const chocolateLovers = useMemo(
    () => snackProducts.filter((p) => p.subcategory === 'Chocolates'),
    [snackProducts]
  );

  const snacksUnder50 = useMemo(
    () => snackProducts.filter((p) => p.price <= 50),
    [snackProducts]
  );

  const popularNamkeen = useMemo(
    () => snackProducts.filter((p) => p.subcategory === 'Namkeen & Indian Snacks'),
    [snackProducts]
  );

  const healthySnacks = useMemo(
    () => snackProducts.filter((p) => p.subcategory === 'Healthy Snacks'),
    [snackProducts]
  );

  const newSnackArrivals = useMemo(
    () =>
      [...snackProducts]
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, 10),
    [snackProducts]
  );

  const specialSnackCombos = useMemo(
    () => snackProducts.filter((p) => p.tags?.some((t) => t.toLowerCase().includes('combo'))),
    [snackProducts]
  );

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
      } else if (selectedCategory !== 'all') {
        const targetCats = mapCategoryToLegacy(selectedCategory);
        if (!targetCats.includes(p.category)) return false;
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
      case 'fruits-vegetables':
        return 'Fruits & Fresh Vegetables';
      case 'dairy-bread-eggs':
        return 'Dairy, Bread & Farm Eggs';
      case 'atta-rice-dal-grains':
        return 'Atta, Rice, Dal & Grains';
      case 'masala-spices':
        return 'Masala, Spices & Seasonings';
      case 'cooking-oils-essentials':
        return 'Cooking Oils, Desi Ghee & Essentials';
      case 'snacks-munchies':
        return 'Snacks & Munchies';
      case 'biscuits-bakery':
        return 'Biscuits, Cookies & Bakery';
      case 'beverages-drinks':
        return 'Beverages & Soft Drinks';
      case 'tea-coffee-breakfast':
        return 'Tea, Coffee & Breakfast';
      case 'instant-food':
        return 'Instant & Ready-to-Eat Food';
      case 'frozen-icecream':
        return 'Frozen Foods & Ice Cream';
      case 'sauces-spreads':
        return 'Sauces, Spreads & Condiments';
      case 'meat-seafood-eggs':
        return 'Meat, Seafood & Farm Eggs';
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

  const getSnackSubcategoryCount = (sub: string) => {
    if (sub === 'All Snacks') return snackProducts.length;
    return snackProducts.filter((p) => p.subcategory.toLowerCase() === sub.toLowerCase()).length;
  };

  const getSnackSubcategoryIcon = (subcat: string) => {
    switch (subcat) {
      case 'Chips & Crisps':
        return 'disc-outline';
      case 'Extruded Snacks & Puffs':
        return 'sparkles';
      case 'Chocolates':
        return 'heart';
      case 'Biscuits & Cookies':
        return 'cafe-outline';
      case 'Namkeen & Indian Snacks':
        return 'flame';
      case 'Popcorn & Nachos':
        return 'film-outline';
      case 'Candies & Toffees':
        return 'color-wand-outline';
      case 'Cakes & Bakery Snacks':
        return 'gift-outline';
      case 'Healthy Snacks':
        return 'leaf';
      case 'Instant & Ready-to-Eat Snacks':
        return 'timer-outline';
      default:
        return 'fast-food-outline';
    }
  };

  const isVegetablesCategory = selectedCategory === 'vegetables' && !isSearching;
  const isSnacksCategory = selectedCategory === 'snacks' && !isSearching;
  const isOtherDedicatedCategory =
    selectedCategory !== 'all' &&
    !isVegetablesCategory &&
    !isSnacksCategory &&
    !isSearching;

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
      ) : isSnacksCategory ? (
        /* ============================================================ */
        /* CASE B: DEDICATED SNACKS & MUNCHIES CATEGORY VIEW            */
        /* ============================================================ */
        <View style={styles.snackScreenContainer}>
          {/* Back Navigation Bar */}
          <View style={styles.categoryNavRow}>
            <TouchableOpacity
              style={styles.snackBackPill}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={16} color="#DB2777" />
              <Text style={styles.snackBackPillText}>All Departments</Text>
            </TouchableOpacity>

            <View style={styles.snackTotalBadge}>
              <Icon name="fast-food-outline" size={13} color="#DB2777" />
              <Text style={styles.snackTotalBadgeText}>{snackProducts.length} Crunchy Snacks</Text>
            </View>
          </View>

          {/* Dedicated Category Hero Banner */}
          <View style={styles.snackHeroBanner}>
            <View style={styles.snackHeroTextCol}>
              <View style={styles.snackBadgeTag}>
                <Icon name="flash" size={12} color="#FFFFFF" />
                <Text style={styles.snackBadgeTagText}>10-MIN MUNCHIES DELIVERY • 100% QUALITY</Text>
              </View>
              <Text style={styles.snackHeroTitle}>Snacks & Munchies</Text>
              <Text style={styles.snackHeroSub}>
                Crispy chips, chocolates, spicy namkeen, biscuits & healthy snacks delivered in 10 mins
              </Text>
            </View>
          </View>

          {/* In-Category Search Box */}
          <View style={styles.snackSearchBox}>
            <Icon name="search-outline" size={17} color="#6B7280" />
            <TextInput
              style={styles.snackSearchInput}
              placeholder="Search in 60+ snacks (e.g. Lay's, KitKat, Kurkure, Makhana)..."
              placeholderTextColor="#9CA3AF"
              value={snackSearchQuery}
              onChangeText={setSnackSearchQuery}
              returnKeyType="search"
            />
            {snackSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSnackSearchQuery('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="close-circle" size={17} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Subcategories Horizontal Scroll (All 10 Subcategories) */}
          <View style={styles.subcatSection}>
            <Text style={styles.filterSectionTitle}>Subcategories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcatScroll}
            >
              {SNACK_SUBCATEGORIES.map((subcat) => {
                const isSelected = selectedSnackSubcategory === subcat;
                const count = getSnackSubcategoryCount(subcat);
                const iconName = getSnackSubcategoryIcon(subcat);
                return (
                  <TouchableOpacity
                    key={subcat}
                    style={[
                      styles.snackSubcatPill,
                      isSelected && styles.snackSubcatPillActive,
                    ]}
                    onPress={() => setSelectedSnackSubcategory(subcat)}
                    activeOpacity={0.75}
                  >
                    <Icon
                      name={iconName}
                      size={14}
                      color={isSelected ? '#FFFFFF' : '#DB2777'}
                    />
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

          {/* Brand Filter (Prompt Requirement 4) */}
          <View style={styles.filterRowSection}>
            <Text style={styles.filterSectionTitle}>Brand</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  snackBrandFilter === 'All Brands' && styles.filterPillActive,
                ]}
                onPress={() => setSnackBrandFilter('All Brands')}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    snackBrandFilter === 'All Brands' && styles.filterPillTextActive,
                  ]}
                >
                  All Brands
                </Text>
              </TouchableOpacity>
              {SNACK_BRANDS.map((brand) => {
                const isSelected = snackBrandFilter === brand;
                return (
                  <TouchableOpacity
                    key={brand}
                    style={[styles.filterPill, isSelected && styles.filterPillActive]}
                    onPress={() => setSnackBrandFilter(brand)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected && styles.filterPillTextActive,
                      ]}
                    >
                      {brand}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Price Range Filter (Prompt Requirement 4) */}
          <View style={styles.filterRowSection}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {SNACK_PRICE_RANGES.map((range) => {
                const isSelected = snackPriceFilter === range;
                return (
                  <TouchableOpacity
                    key={range}
                    style={[styles.filterPill, isSelected && styles.filterPillActive]}
                    onPress={() => setSnackPriceFilter(range)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected && styles.filterPillTextActive,
                      ]}
                    >
                      {range}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Flavour Filter (Prompt Requirement 4) */}
          <View style={styles.filterRowSection}>
            <Text style={styles.filterSectionTitle}>Flavour</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  snackFlavourFilter === 'All Flavours' && styles.filterPillActive,
                ]}
                onPress={() => setSnackFlavourFilter('All Flavours')}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    snackFlavourFilter === 'All Flavours' && styles.filterPillTextActive,
                  ]}
                >
                  All Flavours
                </Text>
              </TouchableOpacity>
              {SNACK_FLAVOURS.map((flav) => {
                const isSelected = snackFlavourFilter === flav;
                return (
                  <TouchableOpacity
                    key={flav}
                    style={[styles.filterPill, isSelected && styles.filterPillActive]}
                    onPress={() => setSnackFlavourFilter(flav)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected && styles.filterPillTextActive,
                      ]}
                    >
                      {flav}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Dietary Preferences Filter (Prompt Requirement 4) */}
          <View style={styles.filterRowSection}>
            <Text style={styles.filterSectionTitle}>Dietary Preference</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {SNACK_DIETARY_PREFERENCES.map((diet) => {
                const isSelected = snackDietaryFilter === diet;
                return (
                  <TouchableOpacity
                    key={diet}
                    style={[
                      styles.filterPill,
                      isSelected && styles.dietaryPillActive,
                    ]}
                    onPress={() => setSnackDietaryFilter(diet)}
                    activeOpacity={0.75}
                  >
                    {diet === 'Vegetarian' && (
                      <View style={styles.miniVegDot} />
                    )}
                    {diet === 'Vegan' && (
                      <Icon name="leaf" size={11} color={isSelected ? '#FFF' : '#059669'} />
                    )}
                    {diet === 'Jain-friendly' && (
                      <Icon name="shield-checkmark" size={11} color={isSelected ? '#FFF' : '#D97706'} />
                    )}
                    <Text
                      style={[
                        styles.filterPillText,
                        isSelected && styles.filterPillTextActive,
                      ]}
                    >
                      {diet}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Sort By Section (Prompt Requirement 4) */}
          <View style={styles.sortSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortScroll}
            >
              {SNACK_SORT_OPTIONS.map((sortOpt) => {
                const isSelected = snackSortBy === sortOpt;
                return (
                  <TouchableOpacity
                    key={sortOpt}
                    style={[styles.sortPill, isSelected && styles.sortPillActive]}
                    onPress={() => setSnackSortBy(sortOpt)}
                    activeOpacity={0.75}
                  >
                    {sortOpt === 'Popularity' && (
                      <Icon
                        name="flame"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#4B5563'}
                      />
                    )}
                    {sortOpt === 'Price: Low to High' && (
                      <Icon
                        name="arrow-up"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#4B5563'}
                      />
                    )}
                    {sortOpt === 'Price: High to Low' && (
                      <Icon
                        name="arrow-down"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#4B5563'}
                      />
                    )}
                    {sortOpt === 'New Arrivals' && (
                      <Icon
                        name="sparkles"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#4B5563'}
                      />
                    )}
                    {sortOpt === 'Discount' && (
                      <Icon
                        name="pricetag"
                        size={12}
                        color={isSelected ? '#FFFFFF' : '#4B5563'}
                      />
                    )}
                    <Text
                      style={[
                        styles.sortPillText,
                        isSelected && styles.sortPillTextActive,
                      ]}
                    >
                      {sortOpt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Active Filter Counter & Reset Bar */}
          <View style={styles.activeFilterBar}>
            <Text style={styles.activeFilterCountText}>
              Showing <Text style={{ fontWeight: '800', color: '#111827' }}>{processedSnacks.length}</Text> snacks
            </Text>
            {(selectedSnackSubcategory !== 'All Snacks' ||
              snackSearchQuery !== '' ||
              snackBrandFilter !== 'All Brands' ||
              snackPriceFilter !== 'All Prices' ||
              snackFlavourFilter !== 'All Flavours' ||
              snackDietaryFilter !== 'All' ||
              snackSortBy !== 'Popularity') && (
                <TouchableOpacity
                  style={styles.snackResetPill}
                  onPress={() => {
                    setSelectedSnackSubcategory('All Snacks');
                    setSnackSearchQuery('');
                    setSnackBrandFilter('All Brands');
                    setSnackPriceFilter('All Prices');
                    setSnackFlavourFilter('All Flavours');
                    setSnackDietaryFilter('All');
                    setSnackSortBy('Popularity');
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="refresh-outline" size={13} color="#DB2777" />
                  <Text style={styles.snackResetPillText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Product Grid or Empty State */}
          {processedSnacks.length === 0 ? (
            <View style={styles.emptyResults}>
              <View style={styles.emptyIconCircle}>
                <Icon name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No snacks match your filters</Text>
              <Text style={styles.emptySub}>
                Try selecting a different brand, flavour, or clearing price filters.
              </Text>
              <TouchableOpacity
                style={styles.resetSnackButton}
                onPress={() => {
                  setSelectedSnackSubcategory('All Snacks');
                  setSnackSearchQuery('');
                  setSnackBrandFilter('All Brands');
                  setSnackPriceFilter('All Prices');
                  setSnackFlavourFilter('All Flavours');
                  setSnackDietaryFilter('All');
                  setSnackSortBy('Popularity');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetSearchButtonText}>
                  Show All {snackProducts.length} Snacks
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {processedSnacks.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      ) : isOtherDedicatedCategory ? (
        /* ============================================================ */
        /* CASE C: DEDICATED VIEW FOR ANY OF THE OTHER 14 CATEGORIES    */
        /* ============================================================ */
        <View style={styles.vegScreenContainer}>
          {/* Back Navigation Bar */}
          <View style={styles.categoryNavRow}>
            <TouchableOpacity
              style={styles.backPill}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.7}
            >
              <Icon name="arrow-back" size={16} color={currentCatObj?.color || '#059669'} />
              <Text style={[styles.backPillText, { color: currentCatObj?.color || '#059669' }]}>
                All Departments
              </Text>
            </TouchableOpacity>

            <View style={styles.totalBadge}>
              <Icon name={currentCatObj?.icon || 'grid-outline'} size={13} color={currentCatObj?.color || '#059669'} />
              <Text style={[styles.totalBadgeText, { color: currentCatObj?.color || '#059669' }]}>
                {categoryProducts.length} Items Available
              </Text>
            </View>
          </View>

          {/* Dedicated Category Hero Banner */}
          <View style={[styles.vegHeroBanner, { backgroundColor: currentCatObj?.color || '#059669' }]}>
            <View style={styles.vegHeroTextCol}>
              {currentCatObj?.badge && (
                <View style={styles.vegBadgeTag}>
                  <Icon name="flash" size={12} color="#FFFFFF" />
                  <Text style={styles.vegBadgeTagText}>{currentCatObj.badge.toUpperCase()} • 10-MIN EXPRESS</Text>
                </View>
              )}
              <Text style={styles.vegHeroTitle}>{currentCatObj?.name}</Text>
              <Text style={styles.vegHeroSub}>
                {currentCatObj?.description || 'Guaranteed freshness delivered straight to your door in 10 minutes.'}
              </Text>
            </View>
          </View>

          {/* In-Category Search Box */}
          <View style={styles.vegSearchBox}>
            <Icon name="search-outline" size={17} color="#6B7280" />
            <TextInput
              style={styles.vegSearchInput}
              placeholder={`Search in ${currentCatObj?.name || 'this category'}...`}
              placeholderTextColor="#9CA3AF"
              value={categorySearchQuery}
              onChangeText={setCategorySearchQuery}
              returnKeyType="search"
            />
            {categorySearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setCategorySearchQuery('')}>
                <Icon name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Subcategories Horizontal Bar */}
          {currentSubcategories.length > 0 && (
            <View style={styles.subcatSection}>
              <Text style={styles.filterSectionTitle}>Subcategories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.subcatScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.subcatPill,
                    selectedSubcategory === 'All' && [
                      styles.subcatPillActive,
                      {
                        backgroundColor: currentCatObj?.color || '#059669',
                        borderColor: currentCatObj?.color || '#059669',
                      },
                    ],
                  ]}
                  onPress={() => setSelectedSubcategory('All')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.subcatPillText,
                      selectedSubcategory === 'All' && styles.subcatPillTextActive,
                    ]}
                  >
                    All {currentCatObj?.name}
                  </Text>
                </TouchableOpacity>

                {currentSubcategories.map((subcat) => {
                  const isSelected = selectedSubcategory.toLowerCase() === subcat.toLowerCase();
                  const count = products.filter(
                    (p) =>
                      p.category === selectedCategory &&
                      p.subcategory.toLowerCase() === subcat.toLowerCase()
                  ).length;

                  return (
                    <TouchableOpacity
                      key={subcat}
                      style={[
                        styles.subcatPill,
                        isSelected && [
                          styles.subcatPillActive,
                          {
                            backgroundColor: currentCatObj?.color || '#059669',
                            borderColor: currentCatObj?.color || '#059669',
                          },
                        ],
                      ]}
                      onPress={() => setSelectedSubcategory(subcat)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.subcatPillText,
                          isSelected && styles.subcatPillTextActive,
                        ]}
                      >
                        {subcat} {count > 0 ? `(${count})` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Sort By Row */}
          <View style={styles.sortSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortScroll}
            >
              {[
                'Popularity',
                'Price: Low to High',
                'Price: High to Low',
                'Rating',
                'Discount',
                'New Arrivals',
              ].map((opt) => {
                const isSelected = categorySortBy === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.sortPill, isSelected && styles.sortPillActive]}
                    onPress={() => setCategorySortBy(opt)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.sortPillText,
                        isSelected && styles.sortPillTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Active Filter Counter & Reset Bar */}
          <View style={styles.activeFilterBar}>
            <Text style={styles.activeFilterCountText}>
              Showing <Text style={{ fontWeight: '800', color: '#111827' }}>{categoryProducts.length}</Text> products
              {selectedSubcategory !== 'All' ? ` in ${selectedSubcategory}` : ''}
            </Text>
            {(selectedSubcategory !== 'All' ||
              categorySearchQuery !== '' ||
              categorySortBy !== 'Popularity' ||
              filterFastDelivery ||
              filterVegOnly) && (
                <TouchableOpacity
                  style={styles.snackResetPill}
                  onPress={() => {
                    setSelectedSubcategory('All');
                    setCategorySearchQuery('');
                    setCategorySortBy('Popularity');
                    setFilterFastDelivery(false);
                    setFilterVegOnly(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Icon name="refresh-outline" size={13} color="#059669" />
                  <Text style={[styles.snackResetPillText, { color: '#059669' }]}>Reset Filters</Text>
                </TouchableOpacity>
              )}
          </View>

          {/* Product Grid or Empty State */}
          {categoryProducts.length === 0 ? (
            <View style={styles.emptyResults}>
              <View style={styles.emptyIconCircle}>
                <Icon name="search-outline" size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No products match your filters</Text>
              <Text style={styles.emptySub}>
                Try selecting a different subcategory or clearing the search query.
              </Text>
              <TouchableOpacity
                style={styles.resetSnackButton}
                onPress={() => {
                  setSelectedSubcategory('All');
                  setCategorySearchQuery('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetSearchButtonText}>
                  Show All {currentCatObj?.name} Products
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
        </View>
      ) : (
        /* ============================================================ */
        /* CASE D: STANDARD SHOP HOMEPAGE & PROMOTIONS                  */
        /* ============================================================ */
        <View>
          {/* Promotional Banners Section (hidden while searching) */}
          {!isSearching && <BannerCarousel />}

          {/* 16-Category Visual Showcase Grid (Prompt Requirement 2) */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.showcaseCategoriesSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="grid-outline" size={16} color="#059669" />
                    <Text style={styles.sectionHeading}>Shop By Category</Text>
                    <View style={styles.countBadgePill}>
                      <Text style={styles.countBadgePillText}>13 Core Categories</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Explore our complete grocery, food & fresh daily essentials
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

              <View style={styles.homeCategoryGrid}>
                {displayCategories.slice(0, 16).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.homeCategoryCard}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.homeCatImgWrapper, { borderColor: cat.color || '#10B981' }]}>
                      {cat.image ? (
                        <Image source={{ uri: cat.image }} style={styles.homeCatImg} />
                      ) : (
                        <View style={[styles.homeCatIconPlaceholder, { backgroundColor: cat.color || '#10B981' }]}>
                          <Icon name={cat.icon || 'grid-outline'} size={24} color="#FFFFFF" />
                        </View>
                      )}
                      {cat.badge && (
                        <View style={[styles.homeCatBadge, { backgroundColor: cat.color || '#059669' }]}>
                          <Text style={styles.homeCatBadgeText}>{cat.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.homeCatTitle} numberOfLines={2}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Recently Viewed Carousel */}
          {!isSearching && selectedCategory === 'all' && recentlyViewed && recentlyViewed.length > 0 && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="time-outline" size={16} color="#059669" />
                    <Text style={styles.sectionHeading}>Recently Viewed</Text>
                    <View style={[styles.countBadgePill, { backgroundColor: '#ECFDF5' }]}>
                      <Text style={[styles.countBadgePillText, { color: '#059669' }]}>HISTORY</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Pick up right where you left off
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {recentlyViewed.map((product) => (
                  <ProductCard
                    key={`rv-${product.id}`}
                    product={product}
                    customWidth={175}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Trending Deals & Offers Carousel */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="flame" size={16} color="#EF4444" />
                    <Text style={styles.sectionHeading}>Trending Deals & Offers</Text>
                    <View style={[styles.countBadgePill, { backgroundColor: '#FEE2E2' }]}>
                      <Text style={[styles.countBadgePillText, { color: '#DC2626' }]}>HOT PICKS</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Top savings with up to 25% instant discount
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={`trending-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

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

          {/* Section 5: Rice, Grains & Healthy Flours Horizontal Section */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="leaf-outline" size={15} color="#F59E0B" />
                    <Text style={styles.sectionHeading}>Rice, Grains & Healthy Flours</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Rice flour, millet flours, oats, quinoa, muesli & organic staples • 10-Min Delivery
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('rice-grains')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#D97706' }]}>View All Grains</Text>
                  <Icon name="chevron-forward" size={12} color="#D97706" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {products
                  .filter((p) => p.category === 'rice-grains')
                  .slice(0, 10)
                  .map((product) => (
                    <ProductCard
                      key={`rg-row-${product.id}`}
                      product={product}
                      customWidth={165}
                    />
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Section 6: Chilled Beverages, Juices & Refreshments Horizontal Section */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="wine-outline" size={15} color="#8B5CF6" />
                    <Text style={styles.sectionHeading}>Chilled Beverages & Refreshments</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Cold-pressed juices, soft drinks, tender coconut, energy drinks & plant milk • 10-Min Delivery
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('beverages')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#8B5CF6' }]}>View All Drinks</Text>
                  <Icon name="chevron-forward" size={12} color="#8B5CF6" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {products
                  .filter((p) => p.category === 'beverages')
                  .slice(0, 10)
                  .map((product) => (
                    <ProductCard
                      key={`bev-row-${product.id}`}
                      product={product}
                      customWidth={165}
                    />
                  ))}
              </ScrollView>
            </View>
          )}

          {/* ============================================================ */}
          {/* HOMEPAGE SNACKS & MUNCHIES PROMOTIONAL SECTIONS (PROMPT 8)    */}
          {/* ============================================================ */}

          {/* 1. Snacks & Munchies Subcategory Explore Bar */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="fast-food-outline" size={16} color="#DB2777" />
                    <Text style={styles.sectionHeading}>Snacks & Munchies</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    10 subcategories: Chips, chocolates, namkeen, biscuits & healthy snacks • 10-Min Delivery
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('snacks')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#DB2777' }]}>Explore All</Text>
                  <Icon name="chevron-forward" size={12} color="#DB2777" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {SNACK_SUBCATEGORIES.filter((sub) => sub !== 'All Snacks').map((subcat) => {
                  const count = getSnackSubcategoryCount(subcat);
                  const iconName = getSnackSubcategoryIcon(subcat);
                  return (
                    <TouchableOpacity
                      key={`home-sub-${subcat}`}
                      style={styles.snackSubcatCard}
                      onPress={() => {
                        setSelectedSnackSubcategory(subcat);
                        setSelectedCategory('snacks');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.snackSubcatIconCircle}>
                        <Icon name={iconName} size={20} color="#DB2777" />
                      </View>
                      <Text style={styles.snackSubcatCardTitle} numberOfLines={2}>
                        {subcat}
                      </Text>
                      <Text style={styles.snackSubcatCardCount}>{count} Items</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* 2. Bestselling Chips */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="disc-outline" size={15} color="#E11D48" />
                    <Text style={styles.sectionHeading}>Bestselling Chips & Crisps</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Lay's, Uncle Chipps, Bingo, Pringles, Too Yumm! & Banana Chips
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSelectedSnackSubcategory('Chips & Crisps');
                    setSelectedCategory('snacks');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#E11D48' }]}>View All Chips</Text>
                  <Icon name="chevron-forward" size={12} color="#E11D48" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {bestsellingChips.map((product) => (
                  <ProductCard
                    key={`chips-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3. Chocolate Lovers */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="heart" size={15} color="#9333EA" />
                    <Text style={styles.sectionHeading}>Chocolate Lovers Paradise</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Cadbury Silk, KitKat, 5 Star, Ferrero Rocher, Amul & Bournville
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSelectedSnackSubcategory('Chocolates');
                    setSelectedCategory('snacks');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#9333EA' }]}>View All Chocolates</Text>
                  <Icon name="chevron-forward" size={12} color="#9333EA" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {chocolateLovers.map((product) => (
                  <ProductCard
                    key={`choco-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 4. Snacks Under ₹50 */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="pricetag" size={15} color="#059669" />
                    <Text style={styles.sectionHeading}>Snacks Under ₹50</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Budget-friendly cravings: Parle-G, Maggi, Kurkure, Perk, Crax & Pulse
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSnackPriceFilter('Under ₹10');
                    setSelectedCategory('snacks');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#059669' }]}>View Budget Snacks</Text>
                  <Icon name="chevron-forward" size={12} color="#059669" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {snacksUnder50.slice(0, 10).map((product) => (
                  <ProductCard
                    key={`under50-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 5. Popular Indian Namkeen */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="flame" size={15} color="#D97706" />
                    <Text style={styles.sectionHeading}>Popular Indian Namkeen</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Haldiram's Aloo Bhujia, Khatta Meetha, Ratlami Sev, Moong Dal & Murukku
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSelectedSnackSubcategory('Namkeen & Indian Snacks');
                    setSelectedCategory('snacks');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#D97706' }]}>View All Namkeen</Text>
                  <Icon name="chevron-forward" size={12} color="#D97706" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {popularNamkeen.map((product) => (
                  <ProductCard
                    key={`namkeen-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 6. Healthy Snacking */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="leaf" size={15} color="#10B981" />
                    <Text style={styles.sectionHeading}>Healthy Snacking</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Farmley Makhana, Protein Bars, Yoga Bar, Super Seeds & Roasted Almonds
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSelectedSnackSubcategory('Healthy Snacks');
                    setSelectedCategory('snacks');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#10B981' }]}>View Healthy Snacks</Text>
                  <Icon name="chevron-forward" size={12} color="#10B981" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {healthySnacks.map((product) => (
                  <ProductCard
                    key={`healthy-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 7. New Arrivals */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="sparkles" size={15} color="#8B5CF6" />
                    <Text style={styles.sectionHeading}>New Arrivals in Munchies</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Freshly stocked crunchy treats & newly released snacks
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSnackSortBy('New Arrivals');
                    setSelectedCategory('snacks');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#8B5CF6' }]}>View New Arrivals</Text>
                  <Icon name="chevron-forward" size={12} color="#8B5CF6" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {newSnackArrivals.map((product) => (
                  <ProductCard
                    key={`new-snack-row-${product.id}`}
                    product={product}
                    customWidth={165}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 8. Special Snack Combos */}
          {!isSearching && selectedCategory === 'all' && (
            <View style={styles.horizontalSection}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleCol}>
                  <View style={styles.titleBadgeRow}>
                    <Icon name="gift-outline" size={15} color="#F59E0B" />
                    <Text style={styles.sectionHeading}>Special Snack Combos</Text>
                  </View>
                  <Text style={styles.sectionSubheading}>
                    Movie Night & Chai-Time curated combos with bundled savings
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => setSelectedCategory('snacks')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewAllText, { color: '#F59E0B' }]}>View All Combos</Text>
                  <Icon name="chevron-forward" size={12} color="#F59E0B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              >
                {specialSnackCombos.map((product) => (
                  <ProductCard
                    key={`combo-row-${product.id}`}
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

  // Dedicated Snacks Screen Styles
  snackScreenContainer: {
    paddingBottom: 16,
  },
  snackBackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  snackBackPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DB2777',
  },
  snackTotalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  snackTotalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE185D',
  },
  snackHeroBanner: {
    backgroundColor: '#BE185D',
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  snackHeroTextCol: {
    gap: 4,
  },
  snackBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginBottom: 4,
  },
  snackBadgeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  snackHeroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  snackHeroSub: {
    fontSize: 12,
    color: '#FCE7F3',
    lineHeight: 17,
  },
  snackSearchBox: {
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
  snackSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    padding: 0,
  },
  snackSubcatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#FBCFE8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  snackSubcatPillActive: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
  },
  filterRowSection: {
    marginBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 14,
    gap: 6,
    paddingBottom: 4,
  },
  filterPill: {
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
  filterPillActive: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
  },
  dietaryPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  miniVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 6,
  },
  activeFilterCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  snackResetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  snackResetPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DB2777',
  },
  resetSnackButton: {
    backgroundColor: '#DB2777',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  snackSubcatCard: {
    width: 115,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  snackSubcatIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  snackSubcatCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
  snackSubcatCardCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DB2777',
    marginTop: 4,
  },
  showcaseCategoriesSection: {
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  countBadgePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  countBadgePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  homeCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  homeCategoryCard: {
    width: '23.5%',
    alignItems: 'center',
    marginBottom: 14,
  },
  homeCatImgWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeCatImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  homeCatIconPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeCatBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  homeCatBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  homeCatTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});
