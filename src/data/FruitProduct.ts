// Product model for QuickMart fruit JSON data.
// Prices and stock counts in quickmart_fruits.json are SAMPLE DATA only.

export interface FruitProduct {
  id: number;
  name: string;
  category: 'Fruits';
  subcategory: string;
  unit: string;
  price: number;
  currency: 'INR';
  isSamplePrice: boolean;
  // Placeholder asset path. React Native requires a static require() mapping
  // for bundled local images; a string path cannot be passed to require().
  image: string;
  stock: number;
  isSampleStock: boolean;
  featured: boolean;
}
