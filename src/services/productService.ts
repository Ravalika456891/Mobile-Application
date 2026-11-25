/**
 * Product Service for QuickMart
 * Handles Cloud Firestore integration with offline & local fallback resilience.
 *
 * Firebase Project: quickmart-9d228
 * Collection: products
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
} from '@react-native-firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Product, CategoryId } from '../types';
import { PRODUCTS } from '../data/products';

export interface FirestoreProductDoc {
  id?: number | string;
  name?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  originalPrice?: number;
  currency?: string;
  unit?: string;
  stock?: number;
  stockCount?: number;
  image?: string;
  featured?: boolean;
  isSamplePrice?: boolean;
  isSampleStock?: boolean;
  rating?: number;
  reviewsCount?: number;
  deliveryTimeMins?: number;
  description?: string;
  [key: string]: any;
}

const PRODUCTS_COLLECTION = 'products';

/**
 * Normalizes a raw Firestore document into the application's unified Product interface.
 */
export const mapFirestoreDocToProduct = (docId: string, data: FirestoreProductDoc): Product => {
  const stock = typeof data.stock === 'number' ? data.stock : (typeof data.stockCount === 'number' ? data.stockCount : 10);
  const rawCategory = (data.category || 'fruits').toLowerCase();
  
  // Normalize category to standard QuickMart CategoryId
  let categoryId: CategoryId = 'fruits';
  if (rawCategory.includes('fruit')) categoryId = 'fruits';
  else if (rawCategory.includes('veg')) categoryId = 'vegetables';
  else if (rawCategory.includes('snack')) categoryId = 'snacks';
  else if (rawCategory.includes('dairy')) categoryId = 'dairy';
  else if (rawCategory.includes('grain') || rawCategory.includes('atta') || rawCategory.includes('rice')) categoryId = 'rice-grains';
  else if (rawCategory.includes('spice') || rawCategory.includes('masala')) categoryId = 'masala-spices';
  else if (rawCategory.includes('oil')) categoryId = 'cooking-essentials';
  else if (rawCategory.includes('beverage')) categoryId = 'beverages';
  else if (rawCategory.includes('bakery')) categoryId = 'bakery';
  else categoryId = rawCategory as CategoryId;

  // Resolve local image path or fallback image
  let imageUri = data.image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80';
  if (imageUri === 'assets/images/fruits/apple.png' || imageUri.includes('apple')) {
    imageUri = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80';
  }

  return {
    id: String(data.id || docId),
    name: data.name || 'Sample Product',
    category: categoryId,
    subcategory: data.subcategory || 'Everyday Fruits',
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice ? Number(data.originalPrice) : (data.isSamplePrice ? Number(data.price) + 20 : undefined),
    currency: data.currency || 'INR',
    weightOrSize: data.unit || '1 kg',
    rating: typeof data.rating === 'number' ? data.rating : 4.8,
    reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 124,
    deliveryTimeMins: typeof data.deliveryTimeMins === 'number' ? data.deliveryTimeMins : 10,
    image: imageUri,
    inStock: stock > 0,
    stockCount: stock,
    description: data.description || `${data.name || 'Product'} - fresh and high quality`,
    featured: Boolean(data.featured),
    isSamplePrice: Boolean(data.isSamplePrice),
    isSampleStock: Boolean(data.isSampleStock),
    isVeg: true,
  };
};

/**
 * Fetches all products from the Firestore `products` collection.
 * Gracefully handles connection issues, permission errors, and empty collections.
 */
export const fetchProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) {
      console.warn('[ProductService] Firestore is not available on this platform/runtime.');
      return [];
    }

    const collRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(collRef);
    if (!snapshot || snapshot.empty) {
      console.log('[ProductService] Firestore collection "products" is currently empty.');
      return [];
    }

    const products: Product[] = [];
    snapshot.docs.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
      const data = d.data() as FirestoreProductDoc;
      products.push(mapFirestoreDocToProduct(d.id, data));
    });

    return products;
  } catch (error: any) {
    console.warn('[ProductService] Error fetching products from Firestore:', error?.message || error);
    return [];
  }
};

/**
 * Fetches a single product from Firestore by its document ID.
 */
export const fetchProductByIdFromFirestore = async (id: string | number): Promise<Product | null> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) return null;

    const docId = String(id);
    const docRef = doc(db, PRODUCTS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Also query by "id" field in case document key differs from id field
      const q = query(collection(db, PRODUCTS_COLLECTION), where('id', '==', Number(id)), limit(1));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        return mapFirestoreDocToProduct(firstDoc.id, firstDoc.data() as FirestoreProductDoc);
      }
      return null;
    }

    return mapFirestoreDocToProduct(docSnap.id, docSnap.data() as FirestoreProductDoc);
  } catch (error: any) {
    console.warn(`[ProductService] Error fetching product ${id} from Firestore:`, error?.message || error);
    return null;
  }
};

/**
 * Fetches products by category from Firestore.
 */
export const fetchProductsByCategoryFromFirestore = async (category: string): Promise<Product[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) return [];

    const q = query(collection(db, PRODUCTS_COLLECTION), where('category', '==', category));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) =>
      mapFirestoreDocToProduct(d.id, d.data() as FirestoreProductDoc)
    );
  } catch (error: any) {
    console.warn(`[ProductService] Error fetching category "${category}":`, error?.message || error);
    return [];
  }
};

/**
 * Fetches featured products from Firestore.
 */
export const fetchFeaturedProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) return [];

    const q = query(collection(db, PRODUCTS_COLLECTION), where('featured', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) =>
      mapFirestoreDocToProduct(d.id, d.data() as FirestoreProductDoc)
    );
  } catch (error: any) {
    console.warn('[ProductService] Error fetching featured products:', error?.message || error);
    return [];
  }
};

/**
 * Searches products by name in Firestore.
 */
export const searchProductsByNameFromFirestore = async (queryText: string): Promise<Product[]> => {
  const q = queryText.trim().toLowerCase();
  if (!q) return [];

  try {
    const all = await fetchProductsFromFirestore();
    return all.filter(p => p.name.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q));
  } catch (error: any) {
    console.warn('[ProductService] Error searching products:', error?.message || error);
    return [];
  }
};

/**
 * Unified getter: fetches products from Firestore and merges with local catalog.
 * Prioritizes Firestore documents while guaranteeing that local products serve as
 * reliable fallbacks if Firestore has network or permission restrictions.
 */
export const getAllProductsWithFirestore = async (fallbackToLocal = true): Promise<Product[]> => {
  const firestoreProducts = await fetchProductsFromFirestore();
  
  if (!fallbackToLocal) {
    return firestoreProducts;
  }

  if (firestoreProducts.length === 0) {
    return PRODUCTS;
  }

  // Merge: Firestore products take priority by ID, local products supplement without duplicates
  const firestoreIds = new Set(firestoreProducts.map(p => p.id));
  const localOnlyProducts = PRODUCTS.filter(p => !firestoreIds.has(p.id));

  return [...firestoreProducts, ...localOnlyProducts];
};

export default {
  mapFirestoreDocToProduct,
  fetchProductsFromFirestore,
  fetchProductByIdFromFirestore,
  fetchProductsByCategoryFromFirestore,
  fetchFeaturedProductsFromFirestore,
  searchProductsByNameFromFirestore,
  getAllProductsWithFirestore,
};
