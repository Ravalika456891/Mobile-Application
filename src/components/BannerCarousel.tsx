import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  category: CategoryId;
  bgGradient: string;
  image: string;
}

const BANNERS: PromoBanner[] = [
  {
    id: 'b1',
    title: 'Farm Fresh Organic Harvest',
    subtitle: 'Crisp veggies & fruits harvested this morning',
    tag: '🌱 100% ORGANIC',
    category: 'fruits-vegetables',
    bgGradient: '#047857',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b2',
    title: 'Pure Dairy & Farm Eggs',
    subtitle: 'Chilled cow milk, fresh paneer & brown eggs',
    tag: '🥛 CHILLED & FRESH',
    category: 'dairy',
    bgGradient: '#1D4ED8',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b3',
    title: 'Pantry Staples & Grains',
    subtitle: 'Royal Basmati rice, cold-pressed oils & spices',
    tag: '🌾 ESSENTIAL PANTRY',
    category: 'rice-grains',
    bgGradient: '#B45309',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'b4',
    title: 'Snacks & Quick Refreshments',
    subtitle: 'Artisan chips, nuts, fresh juices & treats',
    tag: '🍿 QUICK CRAVINGS',
    category: 'snacks',
    bgGradient: '#BE185D',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
  },
];

export const BannerCarousel: React.FC = () => {
  const { setSelectedCategory, setActiveTab } = useApp();

  const handlePressBanner = (category: CategoryId) => {
    setSelectedCategory(category);
    setActiveTab('categories');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={296}
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.bannerCard, { backgroundColor: banner.bgGradient }]}
            onPress={() => handlePressBanner(banner.category)}
            activeOpacity={0.9}
          >
            <View style={styles.bannerInfo}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{banner.tag}</Text>
              </View>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {banner.title}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={2}>
                {banner.subtitle}
              </Text>
              <View style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Shop Category</Text>
                <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
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
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bannerCard: {
    width: 284,
    height: 140,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 8,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  shopNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerImage: {
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
