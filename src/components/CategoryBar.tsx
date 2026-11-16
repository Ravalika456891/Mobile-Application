import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from './Icon';
import { CATEGORIES } from '../data/products';
import { useApp } from '../context/AppContext';
import { CategoryId } from '../types';

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useApp();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id as CategoryId)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconCircle,
                  isSelected
                    ? styles.iconCircleSelected
                    : { backgroundColor: isSelected ? '#059669' : '#F3F4F6' },
                ]}
              >
                <Icon
                  name={cat.icon}
                  size={15}
                  color={isSelected ? '#FFFFFF' : '#4B5563'}
                />
              </View>

              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}
                numberOfLines={1}
              >
                {cat.name}
              </Text>

              {cat.badge && (
                <View
                  style={[
                    styles.badge,
                    isSelected
                      ? styles.badgeSelected
                      : {
                          backgroundColor:
                            cat.badge === 'Fresh'
                              ? '#D1FAE5'
                              : cat.badge === 'Organic'
                              ? '#DCFCE7'
                              : '#FEF3C7',
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isSelected
                        ? styles.badgeTextSelected
                        : {
                            color:
                              cat.badge === 'Fresh'
                                ? '#065F46'
                                : cat.badge === 'Organic'
                                ? '#166534'
                                : '#92400E',
                          },
                    ]}
                  >
                    {cat.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
  },
  categoryCardSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  categoryNameSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
});
