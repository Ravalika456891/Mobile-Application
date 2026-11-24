import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/products';
import { CategoryId } from '../types';

export const ExploreScreen: React.FC = () => {
  const { products, categories, setSelectedCategory, setActiveTab } = useApp();

  const getCategoryStats = (catId: CategoryId) => {
    if (catId === 'all') {
      return { count: products.length, speed: '8-15 mins' };
    }
    const catProds = products.filter((p) => p.category === catId);
    const minTime = Math.min(...catProds.map((p) => p.deliveryTimeMins), 10);
    return { count: catProds.length, speed: `${minTime || 10} mins` };
  };

  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    setActiveTab('home');
  };

  const displayCategories = (categories && categories.length > 0 ? categories : CATEGORIES).filter(
    (c) => c.id !== 'all'
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All 16 Departments</Text>
        <Text style={styles.headerSubtitle}>
          Select a category to shop fresh items, daily essentials and groceries delivered in 10 minutes
        </Text>
      </View>

      <View style={styles.grid}>
        {displayCategories.map((cat) => {
          const stats = getCategoryStats(cat.id);
          const sampleProduct = products.find((p) => p.category === cat.id);
          const displayImg = cat.image || sampleProduct?.image;

          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => handleSelectCategory(cat.id)}
              activeOpacity={0.88}
            >
              <View style={[styles.cardHeader, { backgroundColor: cat.color }]}>
                <Icon name={cat.icon} size={22} color="#FFFFFF" />
                <View style={styles.speedPill}>
                  <Icon name="flash" size={10} color="#FFFFFF" />
                  <Text style={styles.speedText}>{stats.speed}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {displayImg && (
                  <Image
                    source={{ uri: displayImg }}
                    style={styles.sampleImg}
                  />
                )}
                <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
                <Text style={styles.itemsCount}>{stats.count} Products</Text>

                {cat.badge && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{cat.badge}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    paddingTop: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cardBody: {
    padding: 12,
    alignItems: 'center',
  },
  sampleImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginBottom: 8,
  },
  catName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemsCount: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  badgePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
