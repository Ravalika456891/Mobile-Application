import { Product, Category } from '../types';
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
  cart: [] as { product_id: string; quantity: number }[],
  wishlist: [] as string[],
  orders: [] as StoredOrder[],
  categories: [...CATEGORIES] as Category[],
  products: [...PRODUCTS] as Product[],
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
 * GET products by category
 */
export const getProductsByCategoryDB = async (category: string): Promise<Product[]> => {
  if (category === 'all') return [...memoryStore.products];
  return memoryStore.products.filter((p) => p.category === category);
};

/**
 * GET products by subcategory
 */
export const getProductsBySubcategoryDB = async (
  category: string,
  subcategory: string
): Promise<Product[]> => {
  const prods = category === 'all' ? memoryStore.products : memoryStore.products.filter((p) => p.category === category);
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
