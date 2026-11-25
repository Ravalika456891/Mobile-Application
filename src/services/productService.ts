/**
 * Product & Category Service for QuickMart
 * Handles Cloud Firestore integration with offline & local fallback resilience.
 *
 * Firebase Project: quickmart-9d228
 * Collections: 'products', 'categories'
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
} from '@react-native-firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Product, Category, CategoryId } from '../types';
import { PRODUCTS } from '../data/products';
import { ALL_28_CATEGORIES, CATEGORIES } from '../data/categories';
import { LOCAL_ASSET_FALLBACK_MAP, DEFAULT_FALLBACK_IMAGE } from '../utils/imageRegistry';

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
  inStock?: boolean;
  isVeg?: boolean;
  tags?: string[];
  brand?: string;
  [key: string]: any;
}

export interface FirestoreCategoryDoc {
  id?: string;
  name?: string;
  image?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  icon?: string;
  color?: string;
  subcategories?: string[];
  [key: string]: any;
}

const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Normalizes a raw Firestore document into the application's unified Product interface.
 */
export const mapFirestoreDocToProduct = (docId: string, data: FirestoreProductDoc): Product => {
  const stock = typeof data.stock === 'number'
    ? data.stock
    : (typeof data.stockCount === 'number' ? data.stockCount : 10);
  
  const rawCategory = (data.category || 'fruits').toLowerCase();
  
  // Normalize category to standard QuickMart CategoryId
  let categoryId: CategoryId = 'fruits-vegetables';
  if (rawCategory === 'fruits' || rawCategory === 'vegetables' || rawCategory === 'fruits-vegetables') {
    categoryId = 'fruits-vegetables';
  } else if (rawCategory === 'dairy' || rawCategory.includes('dairy-bread-eggs')) {
    categoryId = 'dairy-bread-eggs';
  } else if (rawCategory.includes('grain') || rawCategory.includes('atta') || rawCategory.includes('rice')) {
    categoryId = 'atta-rice-dal-grains';
  } else if (rawCategory.includes('spice') || rawCategory.includes('masala')) {
    categoryId = 'masala-spices';
  } else if (rawCategory.includes('oil') || rawCategory.includes('cooking-essentials')) {
    categoryId = 'cooking-oils-essentials';
  } else if (rawCategory.includes('snack')) {
    categoryId = 'snacks-munchies';
  } else if (rawCategory.includes('bakery') || rawCategory.includes('biscuit')) {
    categoryId = 'biscuits-bakery';
  } else if (rawCategory.includes('beverage')) {
    categoryId = 'beverages-drinks';
  } else if (rawCategory.includes('frozen')) {
    categoryId = 'frozen-icecream';
  } else if (rawCategory.includes('personal-care')) {
    categoryId = 'personal-care';
  } else if (rawCategory.includes('home-care') || rawCategory === 'household') {
    categoryId = 'home-care';
  } else if (rawCategory.includes('baby')) {
    categoryId = 'baby-care';
  } else if (rawCategory.includes('pet')) {
    categoryId = 'pet-care';
  } else if (rawCategory.includes('kitchen')) {
    categoryId = 'kitchen-dining';
  } else if (rawCategory.includes('living')) {
    categoryId = 'home-living';
  } else if (rawCategory.includes('stationery')) {
    categoryId = 'stationery-office';
  } else {
    categoryId = rawCategory as CategoryId;
  }

  // Resolve local image path or fallback image
  let imageUri = data.image || DEFAULT_FALLBACK_IMAGE;
  if (imageUri && LOCAL_ASSET_FALLBACK_MAP[imageUri]) {
    imageUri = LOCAL_ASSET_FALLBACK_MAP[imageUri];
  }

  return {
    id: String(data.id || docId),
    name: data.name || 'Sample Product',
    category: categoryId,
    subcategory: data.subcategory || 'Everyday Essentials',
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice
      ? Number(data.originalPrice)
      : (data.isSamplePrice ? Number(data.price) + 20 : undefined),
    currency: data.currency || 'INR',
    weightOrSize: data.unit || '1 kg',
    rating: typeof data.rating === 'number' ? data.rating : 4.8,
    reviewsCount: typeof data.reviewsCount === 'number' ? data.reviewsCount : 124,
    deliveryTimeMins: typeof data.deliveryTimeMins === 'number' ? data.deliveryTimeMins : 10,
    image: imageUri,
    inStock: typeof data.inStock === 'boolean' ? data.inStock : stock > 0,
    stockCount: stock,
    description: data.description || `${data.name || 'Product'} - fresh and high quality`,
    featured: Boolean(data.featured),
    isSamplePrice: Boolean(data.isSamplePrice),
    isSampleStock: Boolean(data.isSampleStock),
    isVeg: typeof data.isVeg === 'boolean' ? data.isVeg : true,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    brand: data.brand,
  };
};

/**
 * Normalizes a raw Firestore category document into Category interface.
 */
export const mapFirestoreDocToCategory = (docId: string, data: FirestoreCategoryDoc): Category => {
  return {
    id: (data.id || docId) as CategoryId,
    name: data.name || docId,
    icon: data.icon || 'basket-outline',
    color: data.color || '#10B981',
    image: data.image,
    description: data.description,
    subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
  };
};

/**
 * Fetches all products from Cloud Firestore.
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

    return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) =>
      mapFirestoreDocToProduct(d.id, d.data() as FirestoreProductDoc)
    );
  } catch (error: any) {
    console.warn('[ProductService] Error fetching products from Firestore:', error?.message || error);
    return [];
  }
};

/**
 * Fetches only currently available/in-stock products from Firestore.
 */
export const fetchAvailableProductsFromFirestore = async (): Promise<Product[]> => {
  try {
    const all = await fetchProductsFromFirestore();
    return all.filter((p) => p.inStock && p.stockCount > 0);
  } catch (error: any) {
    console.warn('[ProductService] Error fetching available products:', error?.message || error);
    return [];
  }
};

/**
 * Fetches a single product by its document ID or numeric ID.
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
 * Searches products by name or subcategory in Firestore.
 */
export const searchProductsByNameFromFirestore = async (queryText: string): Promise<Product[]> => {
  const q = queryText.trim().toLowerCase();
  if (!q) return [];

  try {
    const all = await fetchProductsFromFirestore();
    return all.filter((p) =>
      p.name.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q)
    );
  } catch (error: any) {
    console.warn('[ProductService] Error searching products:', error?.message || error);
    return [];
  }
};

/**
 * Fetches all categories from the `categories` collection in Firestore.
 */
export const fetchCategoriesFromFirestore = async (): Promise<Category[]> => {
  try {
    const db = getFirebaseFirestore();
    if (!db) return ALL_28_CATEGORIES;

    const collRef = collection(db, CATEGORIES_COLLECTION);
    const q = query(collRef, orderBy('displayOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return ALL_28_CATEGORIES;

    return snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) =>
      mapFirestoreDocToCategory(d.id, d.data() as FirestoreCategoryDoc)
    );
  } catch (error: any) {
    console.warn('[ProductService] Error fetching categories from Firestore, using local fallback:', error?.message || error);
    return ALL_28_CATEGORIES;
  }
};

/**
 * Real-time subscription to products collection.
 */
export const subscribeToProducts = (
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  try {
    const db = getFirebaseFirestore();
    if (!db) {
      onUpdate(PRODUCTS);
      return () => {};
    }

    const collRef = collection(db, PRODUCTS_COLLECTION);
    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        if (!snapshot || snapshot.empty) {
          onUpdate(PRODUCTS);
          return;
        }
        const updated = snapshot.docs.map((d) =>
          mapFirestoreDocToProduct(d.id, d.data() as FirestoreProductDoc)
        );
        onUpdate(updated);
      },
      (error) => {
        console.warn('[ProductService] Real-time products listener error:', error);
        if (onError) onError(error);
        onUpdate(PRODUCTS);
      }
    );

    return unsubscribe;
  } catch (e: any) {
    console.warn('[ProductService] Failed to attach products listener:', e);
    onUpdate(PRODUCTS);
    return () => {};
  }
};

/**
 * Real-time subscription to categories collection.
 */
export const subscribeToCategories = (
  onUpdate: (categories: Category[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  try {
    const db = getFirebaseFirestore();
    if (!db) {
      onUpdate(ALL_28_CATEGORIES);
      return () => {};
    }

    const collRef = collection(db, CATEGORIES_COLLECTION);
    const unsubscribe = onSnapshot(
      collRef,
      (snapshot) => {
        if (!snapshot || snapshot.empty) {
          onUpdate(ALL_28_CATEGORIES);
          return;
        }
        const updated = snapshot.docs.map((d) =>
          mapFirestoreDocToCategory(d.id, d.data() as FirestoreCategoryDoc)
        );
        onUpdate(updated);
      },
      (error) => {
        console.warn('[ProductService] Real-time categories listener error:', error);
        if (onError) onError(error);
        onUpdate(ALL_28_CATEGORIES);
      }
    );

    return unsubscribe;
  } catch (e: any) {
    console.warn('[ProductService] Failed to attach categories listener:', e);
    onUpdate(ALL_28_CATEGORIES);
    return () => {};
  }
};

/**
 * Unified getter: fetches products from Firestore and merges with local catalog.
 * Prioritizes Firestore documents while guaranteeing that local products serve as
 * reliable fallbacks if Firestore has network or permission restrictions.
 */
export const getAllProductsWithFirestore = async (
  fallbackToLocal = true
): Promise<{ products: Product[]; isFromServer: boolean }> => {
  const firestoreProducts = await fetchProductsFromFirestore();

  if (firestoreProducts.length > 0) {
    if (!fallbackToLocal) {
      return { products: firestoreProducts, isFromServer: true };
    }
    // Merge: Firestore products take priority by ID, local products supplement without duplicates
    const firestoreIds = new Set(firestoreProducts.map((p) => p.id));
    const localOnlyProducts = PRODUCTS.filter((p) => !firestoreIds.has(p.id));
    return {
      products: [...firestoreProducts, ...localOnlyProducts],
      isFromServer: true,
    };
  }

  // Fallback to local catalog
  return { products: PRODUCTS, isFromServer: false };
};

export default {
  mapFirestoreDocToProduct,
  mapFirestoreDocToCategory,
  fetchProductsFromFirestore,
  fetchAvailableProductsFromFirestore,
  fetchProductByIdFromFirestore,
  fetchProductsByCategoryFromFirestore,
  fetchFeaturedProductsFromFirestore,
  searchProductsByNameFromFirestore,
  fetchCategoriesFromFirestore,
  subscribeToProducts,
  subscribeToCategories,
  getAllProductsWithFirestore,
};
