import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Icon } from './Icon';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  discountBadge: string;
  category: CategoryId;
  bgGradient: string;
  image: string;
}

const BANNERS: PromoBanner[] = [
  {
    id: 'b1',
    title: 'Fresh Farm Fruits & Veggies',
    subtitle: 'Organic, pesticide-free harvest directly from farms',
    tag: '⚡ 10 MIN DELIVERY',
    discountBadge: 'UP TO 30% OFF',
    category: 'fruits',
    bgGradient: '#047857',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b2',
    title: 'Pure Chilled Dairy & Eggs',
    subtitle: 'Fresh whole milk, malai paneer & organic brown eggs',
    tag: '🥛 CHILLED COLD-CHAIN',
    discountBadge: 'FLAT 20% OFF',
    category: 'dairy',
    bgGradient: '#1D4ED8',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b3',
    title: 'Artisan Bakery & Breads',
    subtitle: 'Warm sourdough, brioche burger buns & buttery croissants',
    tag: '🥐 BAKED FRESH DAILY',
    discountBadge: 'STARTING AT ₹35',
    category: 'bakery',
    bgGradient: '#B45309',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b4',
    title: 'Crunchy Snacks & Munchies',
    subtitle: 'Sea salt crisps, roasted peri peri almonds & pretzels',
    tag: '🍿 CRAVINGS RESOLVED',
    discountBadge: 'BUY 1 GET 1 AT 50%',
    category: 'snacks',
    bgGradient: '#7C3AED',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
  },
];

export const BannerCarousel: React.FC = () => {
  const { setSelectedCategory } = useApp();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={312}
        decelerationRate="fast"
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.bannerCard, { backgroundColor: banner.bgGradient }]}
            onPress={() => setSelectedCategory(banner.category)}
            activeOpacity={0.88}
          >
            <View style={styles.contentCol}>
              <View style={styles.badgeRow}>
                <View style={styles.tagBadge}>
                  <Icon name="flash" size={11} color="#FFF" />
                  <Text style={styles.tagText}>{banner.tag}</Text>
                </View>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>{banner.discountBadge}</Text>
                </View>
              </View>
              <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {banner.subtitle}
              </Text>
              <View style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Shop Now</Text>
                <Icon name="arrow-forward" size={13} color="#FFFFFF" />
              </View>
            </View>
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bannerCard: {
    width: 300,
    height: 148,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  discountPill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 10,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
