import { Product, Category, DeliveryAddress, DeliveryZone, ProductVariant } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { SNACK_SUBCATEGORIES } from '../data/snacks';

export interface LocalUser {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role?: 'user' | 'admin';
  password?: string;
  created_at?: string;
}

export interface StoredOrder {
  id: string;
  user_id: number;
  items: any[];
  total: number;
  status: string;
  createdAt: Date;
  deliveryAddress: string;
  paymentMethod: string;
}

/**
 * Hash function to avoid storing passwords in plain text
 */
export const hashPassword = (password: string): string => {
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }
  const part1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `mg_hash_${part1}${part2}`;
};

// Complete In-Memory & Local Reactive Storage
const memoryStore = {
  users: [
    {
      id: 1,
      name: 'Shruti',
      mobile: '9876543210',
      role: 'user',
      password: hashPassword('Password123'),
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Ravalika',
      mobile: '9876500000',
      role: 'user',
      password: hashPassword('Password123'),
      created_at: new Date().toISOString(),
    },
    {
      id: 999,
      name: 'QuickMart Admin',
      mobile: '9999999999',
      email: 'admin@quickmart.com',
      role: 'admin',
      password: hashPassword('Admin@123'),
      created_at: new Date().toISOString(),
    },
  ] as LocalUser[],
  session: {
    id: 1,
    name: 'Shruti',
    mobile: '9876543210',
    created_at: new Date().toISOString(),
  } as LocalUser | null,
  cart: [] as { product_id: string; quantity: number; variant?: ProductVariant }[],
  wishlist: [] as string[],
  recentlyViewed: [] as string[],
  recentSearches: ['Tata Tea', 'boAt Earbuds', 'Maggi Noodles', 'Dove Soap', 'Pampers'] as string[],
  orders: [] as StoredOrder[],
  categories: [...CATEGORIES] as Category[],
  products: [...PRODUCTS] as Product[],
  addresses: [
    {
      id: 'addr-1',
      title: 'Home',
      type: 'home',
      name: 'Ravalika (Home)',
      flat: 'Flat 402, Tower B',
      street: 'Green Valley Apts, Silicon Boulevard',
      address: 'Flat 402, Green Valley Apts, Silicon Boulevard',
      pincode: '560100',
      city: 'Bengaluru',
      phone: '+91 98765 43210',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'Office',
      type: 'office',
      name: 'Ravalika (Office)',
      flat: 'Floor 7, Wing A',
      street: 'TechHub Tower, Innovation Way, Electronic City',
      address: 'Floor 7, TechHub Tower, Innovation Way',
      pincode: '560001',
      city: 'Bengaluru',
      phone: '+91 98765 43210',
      isDefault: false,
    },
    {
      id: 'addr-3',
      title: 'Studio',
      type: 'other',
      name: 'Studio',
      flat: 'Loft 14',
      street: 'Arts District, Maple Street',
      address: 'Loft 14, Arts District, Maple Street',
      pincode: '560034',
      city: 'Bengaluru',
      phone: '+91 98765 43210',
      isDefault: false,
    },
  ] as DeliveryAddress[],
  deliveryZones: [
    {
      id: 'zone-1',
      name: 'Electronic City Express Hub',
      description: 'Covers South Bangalore tech corridor and peripheral express hubs',
      pincode: '560100',
      pincodes: ['560100', '560102', '560103', '560068'],
      area: 'Electronic City',
      city: 'Bengaluru',
      isServiceable: true,
      deliveryTimeMins: 10,
      estimatedMinutes: 10,
      deliveryFee: 25,
      minOrderAmount: 99,
      freeDeliveryThreshold: 299,
    },
    {
      id: 'zone-2',
      name: 'Bangalore Central Express Zone',
      description: 'Covers MG Road, CBD, Shivaji Nagar, and Central Business District',
      pincode: '560001',
      pincodes: ['560001', '560002', '560025', '560020'],
      area: 'MG Road / Central',
      city: 'Bengaluru',
      isServiceable: true,
      deliveryTimeMins: 12,
      estimatedMinutes: 12,
      deliveryFee: 25,
      minOrderAmount: 99,
      freeDeliveryThreshold: 299,
    },
    {
      id: 'zone-3',
      name: 'Koramangala & Indiranagar Hub',
      description: 'Covers Koramangala 1st to 8th block, Domlur and HAL areas',
      pincode: '560034',
      pincodes: ['560034', '560095', '560008', '560038'],
      area: 'Koramangala',
      city: 'Bengaluru',
      isServiceable: true,
      deliveryTimeMins: 10,
      estimatedMinutes: 10,
      deliveryFee: 20,
      minOrderAmount: 99,
      freeDeliveryThreshold: 299,
    },
    {
      id: 'zone-4',
      name: 'North Suburban Express Hub',
      description: 'Covers Yelahanka, Hebbal, Sahakar Nagar and Airport Corridor',
      pincode: '560064',
      pincodes: ['560064', '560092', '560024'],
      area: 'Yelahanka / Hebbal',
      city: 'Bengaluru',
      isServiceable: true,
      deliveryTimeMins: 15,
      estimatedMinutes: 15,
      deliveryFee: 30,
      minOrderAmount: 99,
      freeDeliveryThreshold: 399,
    },
  ] as DeliveryZone[],
  inventoryLogs: [] as { timestamp: string; productId: string; variantId?: string; change: number; remainingStock: number; reason: string }[],
};

/**
 * Initialize database - clean, asynchronous, no native binary required
 */
export const initDatabase = async (): Promise<any> => {
  return true;
};

/**
 * Register a new user
 */
export const registerUserDB = async (
  name: string,
  mobile: string,
  plainPassword: string
): Promise<{ success: boolean; user?: LocalUser; error?: string }> => {
  const cleanMobile = mobile.trim();
  const cleanName = name.trim();
  const passwordHash = hashPassword(plainPassword);

  const existing = memoryStore.users.find((u) => u.mobile === cleanMobile);
  if (existing) {
    return { success: false, error: 'Mobile number already registered' };
  }

  const newUser: LocalUser = {
    id: memoryStore.users.length + 1,
    name: cleanName,
    mobile: cleanMobile,
    password: passwordHash,
    created_at: new Date().toISOString(),
  };

  memoryStore.users.push(newUser);
  await saveSessionDB(newUser);
  return { success: true, user: newUser };
};

/**
 * Authenticate user or admin with mobile/email and password
 */
export const loginUserDB = async (
  identifier: string,
  plainPassword: string
): Promise<{ success: boolean; user?: LocalUser; error?: string }> => {
  const cleanId = identifier.trim();
  const passwordHash = hashPassword(plainPassword);

  const user = memoryStore.users.find(
    (u) =>
      (u.mobile === cleanId || (u.email && u.email.toLowerCase() === cleanId.toLowerCase())) &&
      u.password === passwordHash
  );

  if (user) {
    await saveSessionDB(user);
    return { success: true, user };
  }

  const accountExists = memoryStore.users.some(
    (u) => u.mobile === cleanId || (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
  );
  if (accountExists) {
    return { success: false, error: 'Incorrect password entered' };
  }

  return { success: false, error: 'No account registered with this mobile number or email' };
};

/**
 * Reset / Update password for Forgot Password flow
 */
export const resetPasswordDB = async (
  mobile: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const cleanMobile = mobile.trim();
  const newHash = hashPassword(newPassword);

  const user = memoryStore.users.find((u) => u.mobile === cleanMobile);
  if (!user) {
    return { success: false, error: 'Mobile number not found' };
  }

  user.password = newHash;
  return { success: true };
};

/**
 * Update user profile details
 */
export const updateUserDB = async (
  id: number,
  name: string,
  mobile: string
): Promise<{ success: boolean; error?: string }> => {
  const cleanName = name.trim();
  const cleanMobile = mobile.trim();

  const user = memoryStore.users.find((u) => u.id === id);
  if (user) {
    user.name = cleanName;
    user.mobile = cleanMobile;
  }

  const updatedUser: LocalUser = { id, name: cleanName, mobile: cleanMobile };
  await saveSessionDB(updatedUser);
  return { success: true };
};

/**
 * Session persistence
 */
export const saveSessionDB = async (user: LocalUser): Promise<void> => {
  memoryStore.session = { ...user };
};

export const getSessionDB = async (): Promise<LocalUser | null> => {
  return memoryStore.session ? { ...memoryStore.session } : null;
};

export const clearSessionDB = async (): Promise<void> => {
  memoryStore.session = null;
};

/**
 * Cart state
 */
export const saveCartDB = async (
  items: { productId: string; quantity: number }[]
): Promise<void> => {
  memoryStore.cart = items.map((i) => ({ product_id: i.productId, quantity: i.quantity }));
};

export const loadCartDB = async (): Promise<{ product_id: string; quantity: number }[]> => {
  return [...memoryStore.cart];
};

/**
 * Order history
 */
export const saveOrderDB = async (
  order: {
    id: string;
    items: any[];
    total: number;
    status: string;
    createdAt: Date | string;
    deliveryAddress: string;
    paymentMethod: string;
  },
  userId?: number
): Promise<void> => {
  const newOrder: StoredOrder = {
    id: order.id,
    user_id: userId || 1,
    items: order.items,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
  };
  memoryStore.orders.unshift(newOrder);
};

export const getOrdersDB = async (): Promise<any[]> => {
  return [...memoryStore.orders];
};

export const getUsersDB = async (): Promise<LocalUser[]> => {
  return memoryStore.users.map(({ password, ...rest }) => rest);
};

// ==========================================
// 16 CATEGORIES & SUBCATEGORIES APIS
// ==========================================

/**
 * GET all categories
 */
export const getCategoriesDB = async (): Promise<Category[]> => {
  return [...memoryStore.categories];
};

/**
 * GET category by ID
 */
export const getCategoryByIdDB = async (id: string): Promise<Category | null> => {
  const cat = memoryStore.categories.find((c) => c.id === id);
  return cat ? { ...cat } : null;
};

/**
 * GET subcategories for a given category
 */
export const getSubcategoriesByCategoryDB = async (categoryId: string): Promise<string[]> => {
  const cat = memoryStore.categories.find((c) => c.id === categoryId);
  return cat?.subcategories ? [...cat.subcategories] : [];
};

/**
 * ADD new category
 */
export const addCategoryDB = async (
  category: Category
): Promise<{ success: boolean; categories: Category[] }> => {
  const existing = memoryStore.categories.findIndex((c) => c.id === category.id);
  if (existing >= 0) {
    memoryStore.categories[existing] = { ...category };
  } else {
    memoryStore.categories.push({ ...category });
  }
  return { success: true, categories: [...memoryStore.categories] };
};

/**
 * UPDATE category
 */
export const updateCategoryDB = async (
  id: string,
  updates: Partial<Category>
): Promise<{ success: boolean; category?: Category }> => {
  const idx = memoryStore.categories.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false };
  memoryStore.categories[idx] = { ...memoryStore.categories[idx], ...updates };
  return { success: true, category: { ...memoryStore.categories[idx] } };
};

/**
 * DELETE category
 */
export const deleteCategoryDB = async (
  id: string
): Promise<{ success: boolean; categories: Category[] }> => {
  memoryStore.categories = memoryStore.categories.filter((c) => c.id !== id);
  return { success: true, categories: [...memoryStore.categories] };
};

/**
 * ADD subcategory to category
 */
export const addSubcategoryDB = async (
  categoryId: string,
  subcategory: string
): Promise<{ success: boolean; subcategories: string[] }> => {
  const cat = memoryStore.categories.find((c) => c.id === categoryId);
  if (!cat) return { success: false, subcategories: [] };
  if (!cat.subcategories) cat.subcategories = [];
  if (!cat.subcategories.includes(subcategory)) {
    cat.subcategories.push(subcategory);
  }
  return { success: true, subcategories: [...cat.subcategories] };
};

/**
 * DELETE subcategory from category
 */
export const deleteSubcategoryDB = async (
  categoryId: string,
  subcategory: string
): Promise<{ success: boolean; subcategories: string[] }> => {
  const cat = memoryStore.categories.find((c) => c.id === categoryId);
  if (!cat || !cat.subcategories) return { success: false, subcategories: [] };
  cat.subcategories = cat.subcategories.filter((s) => s !== subcategory);
  return { success: true, subcategories: [...cat.subcategories] };
};

// ==========================================
// PRODUCT & INVENTORY MANAGEMENT APIS
// ==========================================

/**
 * ADD product
 */
export const addProductDB = async (
  product: Product
): Promise<{ success: boolean; products: Product[] }> => {
  const idx = memoryStore.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) {
    memoryStore.products[idx] = { ...product, updatedAt: new Date().toISOString() };
  } else {
    memoryStore.products.unshift({
      ...product,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return { success: true, products: [...memoryStore.products] };
};

/**
 * UPDATE product
 */
export const updateProductDB = async (
  productId: string,
  updates: Partial<Product>
): Promise<{ success: boolean; product?: Product }> => {
  const idx = memoryStore.products.findIndex((p) => p.id === productId);
  if (idx === -1) return { success: false };
  memoryStore.products[idx] = {
    ...memoryStore.products[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return { success: true, product: { ...memoryStore.products[idx] } };
};

/**
 * DELETE product
 */
export const deleteProductDB = async (
  productId: string
): Promise<{ success: boolean; products: Product[] }> => {
  memoryStore.products = memoryStore.products.filter((p) => p.id !== productId);
  return { success: true, products: [...memoryStore.products] };
};

/**
 * UPDATE inventory / stock count
 */
export const updateInventoryDB = async (
  productId: string,
  stockCount: number
): Promise<{ success: boolean; product?: Product }> => {
  return updateProductDB(productId, {
    stockCount,
    inStock: stockCount > 0,
  });
};

/**
 * TOGGLE product stock status
 */
export const toggleProductStatusDB = async (
  productId: string
): Promise<{ success: boolean; inStock: boolean }> => {
  const prod = memoryStore.products.find((p) => p.id === productId);
  if (!prod) return { success: false, inStock: false };
  const newStatus = !prod.inStock;
  prod.inStock = newStatus;
  prod.stockCount = newStatus ? (prod.stockCount > 0 ? prod.stockCount : 20) : 0;
  prod.updatedAt = new Date().toISOString();
  return { success: true, inStock: newStatus };
};

// ==========================================
// SNACKS & SHOPPING DATABASE APIS
// ==========================================

/**
 * GET all snack categories
 */
export const getSnackCategoriesDB = async (): Promise<Category[]> => {
  return CATEGORIES.filter((c) => c.id === 'snacks' || c.id === 'all');
};

/**
 * GET snack subcategories
 */
export const getSnackSubcategoriesDB = async (): Promise<string[]> => {
  return [...SNACK_SUBCATEGORIES];
};

/**
 * Maps any of the 28 category IDs to its corresponding legacy aliases and product tags
 */
export const mapCategoryToLegacy = (cat: string): string[] => {
  switch (cat) {
    // Phase 1 (1-13)
    case 'fruits-vegetables':
      return ['fruits-vegetables', 'fruits', 'vegetables'];
    case 'dairy-bread-eggs':
      return ['dairy-bread-eggs', 'dairy'];
    case 'atta-rice-dal-grains':
    case 'rice-grains':
      return ['atta-rice-dal-grains', 'rice-grains'];
    case 'cooking-oils-essentials':
    case 'cooking-essentials':
      return ['cooking-oils-essentials', 'cooking-essentials'];
    case 'snacks-munchies':
      return ['snacks-munchies', 'snacks'];
    case 'biscuits-bakery':
      return ['biscuits-bakery', 'bakery'];
    case 'beverages-drinks':
      return ['beverages-drinks', 'beverages'];
    case 'frozen-icecream':
      return ['frozen-icecream', 'frozen-foods', 'icecreams'];
    case 'tea-coffee-breakfast':
      return ['tea-coffee-breakfast'];
    case 'instant-food':
      return ['instant-food'];
    case 'sauces-spreads':
      return ['sauces-spreads'];
    case 'meat-seafood-eggs':
      return ['meat-seafood-eggs'];
    case 'masala-spices':
      return ['masala-spices'];

    // Phase 2: Everyday Essentials (14-21)
    case 'personal-care':
      return ['personal-care'];
    case 'beauty-cosmetics':
      return ['beauty-cosmetics'];
    case 'home-care':
      return ['home-care', 'household'];
    case 'baby-care':
      return ['baby-care'];
    case 'pet-care':
    case 'pet-supplies':
      return ['pet-care', 'pet-supplies'];
    case 'kitchen-dining':
    case 'kitchen-home':
      return ['kitchen-dining', 'kitchen-home'];
    case 'home-living':
      return ['home-living', 'household'];
    case 'stationery-office':
    case 'stationery':
      return ['stationery-office', 'stationery'];

    // Phase 3: Lifestyle Marketplace (22-28)
    case 'electronics-accessories':
      return ['electronics-accessories'];
    case 'fashion-accessories':
    case 'clothing':
      return ['fashion-accessories', 'clothing'];
    case 'jewellery-accessories':
    case 'accessories':
      return ['jewellery-accessories', 'accessories'];
    case 'health-wellness':
      return ['health-wellness'];
    case 'toys-games':
      return ['toys-games'];
    case 'pooja-essentials':
      return ['pooja-essentials'];
    case 'books-gifts':
      return ['books-gifts'];

    default:
      return [cat];
  }
};

/**
 * GET products by category
 */
export const getProductsByCategoryDB = async (category: string): Promise<Product[]> => {
  if (category === 'all') return [...memoryStore.products];
  const targetCategories = mapCategoryToLegacy(category);
  return memoryStore.products.filter((p) => targetCategories.includes(p.category));
};

/**
 * GET products by subcategory
 */
export const getProductsBySubcategoryDB = async (
  category: string,
  subcategory: string
): Promise<Product[]> => {
  const targetCategories = mapCategoryToLegacy(category);
  const prods = category === 'all'
    ? memoryStore.products
    : memoryStore.products.filter((p) => targetCategories.includes(p.category));
  if (!subcategory || subcategory === 'All' || subcategory === 'All Snacks' || subcategory === 'All Vegetables') {
    return prods;
  }
  return prods.filter((p) => p.subcategory.toLowerCase() === subcategory.toLowerCase());
};

/**
 * GET product details by ID
 */
export const getProductDetailsDB = async (productId: string): Promise<Product | null> => {
  const found = memoryStore.products.find((p) => p.id === productId);
  return found ? { ...found } : null;
};

/**
 * GET products by brand
 */
export const getProductsByBrandDB = async (
  category: string,
  brand: string
): Promise<Product[]> => {
  const prods = category === 'all' ? memoryStore.products : memoryStore.products.filter((p) => p.category === category);
  if (!brand || brand === 'All Brands') return prods;
  return prods.filter((p) => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
};

/**
 * GET products by price range
 */
export const getProductsByPriceRangeDB = async (
  category: string,
  minPrice: number,
  maxPrice: number
): Promise<Product[]> => {
  const prods = category === 'all' ? memoryStore.products : memoryStore.products.filter((p) => p.category === category);
  return prods.filter((p) => p.price >= minPrice && p.price <= maxPrice);
};

/**
 * GET search results
 */
export const searchProductsDB = async (
  query: string,
  category?: string
): Promise<Product[]> => {
  const q = query.trim().toLowerCase();
  let prods = category && category !== 'all' ? memoryStore.products.filter((p) => p.category === category) : memoryStore.products;
  if (!q) return prods;
  return prods.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.flavour && p.flavour.toLowerCase().includes(q)) ||
      p.tags?.some((t) => t.toLowerCase().includes(q))
  );
};

/**
 * POST add to cart
 */
export const addToCartDB = async (
  productId: string,
  quantity = 1
): Promise<{ success: boolean; cart: { product_id: string; quantity: number }[] }> => {
  const existing = memoryStore.cart.find((item) => item.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    memoryStore.cart.push({ product_id: productId, quantity });
  }
  return { success: true, cart: [...memoryStore.cart] };
};

/**
 * PUT update cart quantity
 */
export const updateCartQuantityDB = async (
  productId: string,
  quantity: number
): Promise<{ success: boolean; cart: { product_id: string; quantity: number }[] }> => {
  if (quantity <= 0) {
    memoryStore.cart = memoryStore.cart.filter((item) => item.product_id !== productId);
  } else {
    const existing = memoryStore.cart.find((item) => item.product_id === productId);
    if (existing) {
      existing.quantity = quantity;
    } else {
      memoryStore.cart.push({ product_id: productId, quantity });
    }
  }
  return { success: true, cart: [...memoryStore.cart] };
};

/**
 * DELETE remove from cart
 */
export const removeFromCartDB = async (
  productId: string
): Promise<{ success: boolean; cart: { product_id: string; quantity: number }[] }> => {
  memoryStore.cart = memoryStore.cart.filter((item) => item.product_id !== productId);
  return { success: true, cart: [...memoryStore.cart] };
};

/**
 * POST add to wishlist / toggle
 */
export const toggleWishlistDB = async (
  productId: string
): Promise<{ success: boolean; inWishlist: boolean; wishlist: string[] }> => {
  const index = memoryStore.wishlist.indexOf(productId);
  let inWishlist = false;
  if (index > -1) {
    memoryStore.wishlist.splice(index, 1);
    inWishlist = false;
  } else {
    memoryStore.wishlist.push(productId);
    inWishlist = true;
  }
  return { success: true, inWishlist, wishlist: [...memoryStore.wishlist] };
};

/**
 * GET wishlist
 */
export const getWishlistDB = async (): Promise<string[]> => {
  return [...memoryStore.wishlist];
};

/**
 * GET low stock products (inventory count < threshold)
 */
export const getLowStockProductsDB = async (threshold = 10): Promise<Product[]> => {
  return memoryStore.products.filter((p) => p.stockCount <= threshold || !p.inStock);
};

/**
 * RECENTLY VIEWED PRODUCTS
 */
export const addToRecentlyViewedDB = async (productId: string): Promise<void> => {
  const existingIdx = memoryStore.recentlyViewed.indexOf(productId);
  if (existingIdx > -1) {
    memoryStore.recentlyViewed.splice(existingIdx, 1);
  }
  memoryStore.recentlyViewed.unshift(productId);
  if (memoryStore.recentlyViewed.length > 20) {
    memoryStore.recentlyViewed.pop();
  }
};

export const getRecentlyViewedDB = async (): Promise<Product[]> => {
  return memoryStore.recentlyViewed
    .map((id) => memoryStore.products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
};

/**
 * GET related products based on category, subcategory and tags
 */
export const getRelatedProductsDB = async (
  productId: string,
  limit = 6
): Promise<Product[]> => {
  const target = memoryStore.products.find((p) => p.id === productId);
  if (!target) return memoryStore.products.slice(0, limit);

  return memoryStore.products
    .filter(
      (p) =>
        p.id !== productId &&
        (p.category === target.category ||
          p.subcategory === target.subcategory ||
          p.tags?.some((t) => target.tags?.includes(t)))
    )
    .slice(0, limit);
};

/**
 * GET search query suggestions with autocomplete keywords
 */
export const getSearchSuggestionsDB = async (
  query: string,
  limit = 5
): Promise<string[]> => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const suggestions = new Set<string>();
  for (const product of memoryStore.products) {
    if (product.name.toLowerCase().includes(q)) suggestions.add(product.name);
    if (product.brand && product.brand.toLowerCase().includes(q)) suggestions.add(product.brand);
    if (product.subcategory.toLowerCase().includes(q)) suggestions.add(product.subcategory);
    if (suggestions.size >= limit) break;
  }
  return Array.from(suggestions).slice(0, limit);
};

// ==========================================
// CENTRALIZED INVENTORY MANAGEMENT (PHASE 4)
// ==========================================

export const getOutOfStockProductsDB = async (): Promise<Product[]> => {
  return memoryStore.products.filter((p) => !p.inStock || p.stockCount === 0);
};

export const updateVariantInventoryDB = async (
  productId: string,
  variantSizeOrId: string,
  newStock: number
): Promise<{ success: boolean; product?: Product }> => {
  const prod = memoryStore.products.find((p) => p.id === productId);
  if (!prod) return { success: false };

  if (prod.variants) {
    const v = prod.variants.find((item) => item.id === variantSizeOrId || item.size === variantSizeOrId);
    if (v) {
      v.stockCount = newStock;
      v.inStock = newStock > 0;
    }
  }

  // Update total stock count
  const totalStock = prod.variants && prod.variants.length > 0
    ? prod.variants.reduce((sum, item) => sum + (item.stockCount || 0), 0)
    : newStock;

  prod.stockCount = totalStock;
  prod.inStock = totalStock > 0;
  prod.updatedAt = new Date().toISOString();

  memoryStore.inventoryLogs.unshift({
    timestamp: new Date().toISOString(),
    productId,
    variantId: variantSizeOrId,
    change: newStock,
    remainingStock: totalStock,
    reason: 'Manual Admin Adjustment',
  });

  return { success: true, product: { ...prod } };
};

export const reserveOrderStockDB = async (
  items: { productId: string; quantity: number; variantId?: string; variantSize?: string }[]
): Promise<{ success: boolean; message: string }> => {
  // First verify availability for all items
  for (const item of items) {
    const prod = memoryStore.products.find((p) => p.id === item.productId);
    if (!prod || !prod.inStock || prod.stockCount < item.quantity) {
      return { success: false, message: `Product ${prod?.name || 'Item'} is currently out of stock.` };
    }
  }

  // Deduct inventory safely
  for (const item of items) {
    const prod = memoryStore.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stockCount = Math.max(0, prod.stockCount - item.quantity);
      if (prod.stockCount === 0) prod.inStock = false;
      prod.updatedAt = new Date().toISOString();

      memoryStore.inventoryLogs.unshift({
        timestamp: new Date().toISOString(),
        productId: item.productId,
        change: -item.quantity,
        remainingStock: prod.stockCount,
        reason: 'Order Checkout Reservation',
      });
    }
  }
  return { success: true, message: 'Stock reserved successfully' };
};

export const releaseOrderStockDB = async (
  items: { productId: string; quantity: number; variantId?: string }[]
): Promise<void> => {
  for (const item of items) {
    const prod = memoryStore.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stockCount += item.quantity;
      prod.inStock = true;
      prod.updatedAt = new Date().toISOString();

      memoryStore.inventoryLogs.unshift({
        timestamp: new Date().toISOString(),
        productId: item.productId,
        change: item.quantity,
        remainingStock: prod.stockCount,
        reason: 'Order Cancellation Restock',
      });
    }
  }
};

export const getInventoryReportDB = async () => {
  const totalItems = memoryStore.products.length;
  const inStockItems = memoryStore.products.filter((p) => p.inStock && p.stockCount > 0).length;
  const lowStockItems = memoryStore.products.filter((p) => p.stockCount <= 10 && p.stockCount > 0).length;
  const outOfStockItems = memoryStore.products.filter((p) => !p.inStock || p.stockCount === 0).length;

  return {
    total: totalItems,
    inStock: inStockItems,
    lowStock: lowStockItems,
    outOfStock: outOfStockItems,
    totalItems,
    inStockItems,
    lowStockItems,
    outOfStockItems,
    recentLogs: memoryStore.inventoryLogs.slice(0, 25),
  };
};

// ==========================================
// DELIVERY LOCATION MANAGEMENT (PHASE 4)
// ==========================================

export const getDeliveryAddressesDB = async (): Promise<DeliveryAddress[]> => {
  return [...memoryStore.addresses];
};

export const addDeliveryAddressDB = async (
  address: Partial<DeliveryAddress>
): Promise<DeliveryAddress> => {
  const flatStr = address.flat || '';
  const streetStr = address.street || '';
  const cityStr = address.city || 'Bengaluru';
  const pinStr = address.pincode || '560001';
  const genAddr = address.address || [flatStr, streetStr, cityStr].filter(Boolean).join(', ') + ` - ${pinStr}`;
  const newAddr: DeliveryAddress = {
    id: address.id || String(Date.now()),
    title: address.title || address.name || 'Home',
    address: genAddr,
    pincode: pinStr,
    city: cityStr,
    type: address.type || 'home',
    name: address.name || address.title || 'Home',
    flat: flatStr,
    street: streetStr,
    phone: address.phone || '+91 98765 43210',
    isDefault: !!address.isDefault,
  };
  if (newAddr.isDefault) {
    memoryStore.addresses.forEach((a) => (a.isDefault = false));
  }
  memoryStore.addresses.push(newAddr);
  return newAddr;
};

export const updateDeliveryAddressDB = async (
  idOrAddress: string | DeliveryAddress,
  updates?: Partial<DeliveryAddress>
): Promise<boolean> => {
  const id = typeof idOrAddress === 'string' ? idOrAddress : idOrAddress.id;
  const data = typeof idOrAddress === 'string' ? (updates || {}) : idOrAddress;
  const idx = memoryStore.addresses.findIndex((a) => a.id === id);
  if (idx === -1) return false;

  if (data.isDefault) {
    memoryStore.addresses.forEach((a) => (a.isDefault = false));
  }
  memoryStore.addresses[idx] = { ...memoryStore.addresses[idx], ...data };
  return true;
};

export const deleteDeliveryAddressDB = async (
  id: string
): Promise<boolean> => {
  const prevLen = memoryStore.addresses.length;
  memoryStore.addresses = memoryStore.addresses.filter((a) => a.id !== id);
  return memoryStore.addresses.length < prevLen;
};

export const getDeliveryZonesDB = async (): Promise<DeliveryZone[]> => {
  return [...memoryStore.deliveryZones];
};

export const addOrUpdateDeliveryZoneDB = async (
  zone: DeliveryZone
): Promise<{ success: boolean; zones: DeliveryZone[] }> => {
  const existing = memoryStore.deliveryZones.findIndex((z) => z.pincode === zone.pincode);
  if (existing >= 0) {
    memoryStore.deliveryZones[existing] = { ...zone };
  } else {
    memoryStore.deliveryZones.push({ ...zone });
  }
  return { success: true, zones: [...memoryStore.deliveryZones] };
};

export const checkServiceabilityDB = async (
  pincode: string
): Promise<{
  isServiceable: boolean;
  serviceable: boolean;
  zone?: DeliveryZone;
  message: string;
}> => {
  const cleanPincode = pincode.trim();
  const zone = memoryStore.deliveryZones.find(
    (z) => z.pincode === cleanPincode || z.pincodes?.includes(cleanPincode)
  );

  if (zone && zone.isServiceable) {
    return {
      isServiceable: true,
      serviceable: true,
      zone,
      message: `Lightning fast delivery to ${zone.area}, ${zone.city} in ${zone.deliveryTimeMins || zone.estimatedMinutes || 10} mins!`,
    };
  }

  return {
    isServiceable: false,
    serviceable: false,
    message: `Delivery is currently expanding to PIN ${cleanPincode}. Select another location or pincode.`,
  };
};

// ==========================================
// ADVANCED SEARCH & RECENT SEARCHES (PHASE 4)
// ==========================================

export const getRecentSearchesDB = async (): Promise<string[]> => {
  return [...memoryStore.recentSearches];
};

export const addRecentSearchDB = async (query: string): Promise<string[]> => {
  const clean = query.trim();
  if (!clean) return [...memoryStore.recentSearches];

  const idx = memoryStore.recentSearches.indexOf(clean);
  if (idx > -1) {
    memoryStore.recentSearches.splice(idx, 1);
  }
  memoryStore.recentSearches.unshift(clean);
  if (memoryStore.recentSearches.length > 10) {
    memoryStore.recentSearches.pop();
  }
  return [...memoryStore.recentSearches];
};

export const clearRecentSearchesDB = async (): Promise<void> => {
  memoryStore.recentSearches = [];
};

export const getPopularSearchesDB = async (): Promise<string[]> => {
  return [
    'Atta & Flours',
    'Farm Fresh Milk',
    'boAt TWS Earbuds',
    'Maggi 2-Minute',
    'Dove Body Wash',
    'Yoga Mat',
    'Pampers Diapers',
    'Ferrero Rocher',
  ];
};

export const searchProductsAdvancedDB = async (options: {
  query?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  brand?: string;
  sortBy?: 'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}): Promise<Product[]> => {
  let results = [...memoryStore.products];

  if (options.category && options.category !== 'all') {
    const targetCats = mapCategoryToLegacy(options.category);
    results = results.filter((p) => targetCats.includes(p.category));
  }

  if (options.subcategory && options.subcategory !== 'All') {
    results = results.filter(
      (p) => p.subcategory.toLowerCase() === options.subcategory!.toLowerCase()
    );
  }

  if (options.query && options.query.trim().length > 0) {
    const q = options.query.toLowerCase().trim();
    results = results.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand && p.brand.toLowerCase().includes(q);
      const matchSub = p.subcategory.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchTags = p.tags?.some((t) => t.toLowerCase().includes(q));
      const matchAttrs = p.attributes?.some((a) => a.value.toLowerCase().includes(q));
      return matchName || matchBrand || matchSub || matchDesc || matchTags || matchAttrs;
    });
  }

  if (options.brand && options.brand !== 'All Brands') {
    results = results.filter(
      (p) => p.brand && p.brand.toLowerCase() === options.brand!.toLowerCase()
    );
  }

  if (options.minPrice !== undefined) {
    results = results.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.inStockOnly) {
    results = results.filter((p) => p.inStock && p.stockCount > 0);
  }

  // Sorting
  switch (options.sortBy) {
    case 'price-asc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      break;
    case 'popularity':
    default:
      results.sort((a, b) => b.reviewsCount - a.reviewsCount);
      break;
  }

  return results;
};
