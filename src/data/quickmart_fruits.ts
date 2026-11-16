// Place this file alongside quickmart_fruits.json and FruitProduct.ts,
// or adjust the import paths to your existing project structure.
import fruitData from './quickmart_fruits.json';
import type { FruitProduct } from './FruitProduct';

export const fruits: FruitProduct[] = fruitData as FruitProduct[];
export const popularFruits = fruits.filter((fruit) => fruit.featured);

export const searchFruits = (query: string): FruitProduct[] => {
  const normalized = query.trim().toLowerCase();
  return fruits.filter((fruit) => fruit.name.toLowerCase().includes(normalized));
};
