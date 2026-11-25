import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStage, Coupon, CategoryId, Category, ProductVariant, DeliveryAddress, DeliveryZone } from '../types';
import { PRODUCTS, AVAILABLE_COUPONS, CATEGORIES } from '../data/products';
import { getAllProductsWithFirestore } from '../services/productService';
import {
  LocalUser,
  initDatabase,
  loginUserDB,
  registerUserDB,
  getSessionDB,
  saveSessionDB,
  clearSessionDB,
  updateUserDB,
  saveCartDB,
  loadCartDB,
  saveOrderDB,
  addCategoryDB,
  updateCategoryDB,
  deleteCategoryDB,
  addSubcategoryDB,
  deleteSubcategoryDB,
  addProductDB,
  updateProductDB,
  deleteProductDB,
  addToRecentlyViewedDB,
  getRecentlyViewedDB,
  getDeliveryAddressesDB,
  addDeliveryAddressDB,
  updateDeliveryAddressDB,
  deleteDeliveryAddressDB,
  checkServiceabilityDB,
  getDeliveryZonesDB,
  getRecentSearchesDB,
  addRecentSearchDB,
  clearRecentSearchesDB,
  reserveOrderStockDB,
  releaseOrderStockDB,
  getInventoryReportDB,
} from '../services/database';

interface InventoryReportState {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface AppContextType {
  currentUser: LocalUser | null;
  authScreen: 'login' | 'register' | null;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  wishlist: string[];
  recentlyViewed: Product[];
  activeOrder: Order | null;
  selectedAddress: string;
  appliedCoupon: Coupon | null;
  searchQuery: string;
  selectedCategory: CategoryId;
  activeTab: 'home' | 'categories' | 'cart' | 'tracking' | 'profile';
  selectedProduct: Product | null;
  toastMessage: string | null;

  // Delivery & Location
  addresses: DeliveryAddress[];
  selectedDeliveryAddress: DeliveryAddress | null;
  setSelectedDeliveryAddress: (addr: DeliveryAddress) => void;
  addDeliveryAddress: (addr: Omit<DeliveryAddress, 'id'>) => Promise<DeliveryAddress>;
  updateDeliveryAddress: (id: string, updates: Partial<DeliveryAddress>) => Promise<boolean>;
  deleteDeliveryAddress: (id: string) => Promise<boolean>;
  checkPincodeServiceability: (pincode: string) => Promise<{ serviceable: boolean; zone?: DeliveryZone; message: string }>;
  deliveryZones: DeliveryZone[];

  // Advanced Search
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Inventory & Variants
  addToCartWithVariant: (product: Product, variant?: ProductVariant) => void;
  removeFromCartWithVariant: (productId: string, variantId?: string) => void;
  deleteFromCartWithVariant: (productId: string, variantId?: string) => void;
  getItemVariantQuantity: (productId: string, variantId?: string) => number;
  inventoryReport: InventoryReportState;
  refreshInventoryReport: () => Promise<void>;

  // Admin capabilities
  isAdmin: boolean;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  initialLoginMode: 'customer' | 'admin';
  setInitialLoginMode: (mode: 'customer' | 'admin') => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  toggleProductStock: (productId: string) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (catId: string, subcategory: string) => void;
  deleteSubcategory: (catId: string, subcategory: string) => void;
  ordersList: Order[];
  updateOrderStatus: (orderId: string, status: OrderStage) => void;

  setAuthScreen: (screen: 'login' | 'register' | null) => void;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, mobile: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, mobile: string) => Promise<{ success: boolean; error?: string }>;

  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  deleteFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (paymentMethod: string, tipAmount: number) => void;
  cancelActiveOrder: () => void;
  simulateNextStage: () => void;
  setSelectedAddress: (addr: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: CategoryId) => void;
  setActiveTab: (tab: 'home' | 'categories' | 'cart' | 'tracking' | 'profile') => void;
  setSelectedProduct: (prod: Product | null) => void;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ORDER_STAGES: OrderStage[] = [
  'CONFIRMED',
  'PACKING',
  'RIDER_ASSIGNED',
  'OUT_FOR_DELIVERY',
  'ARRIVING',
  'DELIVERED'
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>({
    id: 1,
    name: 'Ravalika',
    mobile: '9876543210',
    created_at: new Date().toISOString(),
  });
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | null>(null);

  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  // Sync products and categories from Cloud Firestore (falls back to local catalog automatically)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { getAllProductsWithFirestore, fetchCategoriesFromFirestore } = await import('../services/productService');
        const [result, fetchedCategories] = await Promise.all([
          getAllProductsWithFirestore(true),
          fetchCategoriesFromFirestore(),
        ]);
        if (isMounted && result && result.products && result.products.length > 0) {
          setProducts(result.products);
        }
        if (isMounted && fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        }
      } catch (err) {
        console.warn('[AppContext] Firestore sync notice (using local products fallback):', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [initialLoginMode, setInitialLoginMode] = useState<'customer' | 'admin'>('customer');
  const [ordersList, setOrdersList] = useState<Order[]>([
    {
      id: 'ORD-894210',
      items: [
        { product: PRODUCTS[0], quantity: 2 },
        { product: PRODUCTS[1], quantity: 1 },
      ],
      total: 185,
      subtotal: 170,
      deliveryFee: 15,
      discount: 0,
      tip: 0,
      status: 'CONFIRMED',
      stage: 'CONFIRMED',
      estimatedDeliveryMins: 10,
      remainingSeconds: 600,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      deliveryAddress: 'Flat 402, Green Valley Apts, Silicon Boulevard',
      paymentMethod: 'UPI (Google Pay)',
      rider: {
        name: 'Vikram Singh',
        phone: '+91 98765 43210',
        rating: 4.9,
        vehicle: 'Electric Superbike',
        vehicleNumber: 'MH 02 EQ 8812',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        currentLatProgress: 0.45,
      },
    },
    {
      id: 'ORD-761239',
      items: [
        { product: PRODUCTS[2] || PRODUCTS[0], quantity: 3 },
      ],
      total: 135,
      subtotal: 120,
      deliveryFee: 15,
      discount: 0,
      tip: 0,
      status: 'DELIVERED',
      stage: 'DELIVERED',
      estimatedDeliveryMins: 0,
      remainingSeconds: 0,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      deliveryAddress: 'Floor 7, TechHub Tower, Innovation Way',
      paymentMethod: 'Cash on Delivery',
      rider: {
        name: 'Rahul Verma',
        phone: '+91 98765 11223',
        rating: 4.8,
        vehicle: 'Eco Scooter',
        vehicleNumber: 'MH 02 AB 4590',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        currentLatProgress: 1.0,
      },
    },
  ]);

  const isAdmin = currentUser?.role === 'admin';

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
    showToast('Product updated successfully 📦');
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = !p.inStock;
          showToast(`${p.name} is now ${nextStock ? 'In Stock' : 'Out of Stock'}`);
          return {
            ...p,
            inStock: nextStock,
            stockCount: nextStock ? (p.stockCount > 0 ? p.stockCount : 30) : 0,
          };
        }
        return p;
      })
    );
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    addProductDB(newProduct).catch(() => { });
    showToast(`Added ${newProduct.name} to catalog! 🎉`);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductDB(productId).catch(() => { });
    showToast('Product removed from catalog 🗑️');
  };

  const addCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    addCategoryDB(newCat).catch(() => { });
    showToast(`Category ${newCat.name} created! 🏷️`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    updateCategoryDB(id, updates).catch(() => { });
    showToast('Category updated! ✏️');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteCategoryDB(id).catch(() => { });
    showToast('Category deleted! 🗑️');
  };

  const addSubcategory = (catId: string, subcategory: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId) {
          const subs = c.subcategories || [];
          if (!subs.includes(subcategory)) {
            return { ...c, subcategories: [...subs, subcategory] };
          }
        }
        return c;
      })
    );
    addSubcategoryDB(catId, subcategory).catch(() => { });
    showToast(`Added subcategory: ${subcategory}`);
  };

  const deleteSubcategory = (catId: string, subcategory: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === catId && c.subcategories) {
          return {
            ...c,
            subcategories: c.subcategories.filter((s) => s !== subcategory),
          };
        }
        return c;
      })
    );
    deleteSubcategoryDB(catId, subcategory).catch(() => { });
    showToast(`Removed subcategory: ${subcategory}`);
  };

  const updateOrderStatus = (orderId: string, newStage: OrderStage) => {
    setOrdersList((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, status: newStage, stage: newStage } : ord
      )
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStage, stage: newStage } : null));
    }
    showToast(`Order status updated: ${newStage.replace(/_/g, ' ')}`);
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['fv-1', 'dairy-1']);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('Flat 402, Green Valley Apts, Silicon Boulevard');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'cart' | 'tracking' | 'profile'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(['tcb-1', 'inst-1', 'ss-1', 'mse-1']);

  // Delivery & Location States
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: 'addr-1',
      userId: 1,
      type: 'home',
      name: 'Ravalika (Home)',
      title: 'Home',
      flat: 'Flat 402, Tower B',
      street: 'Green Valley Apts, Silicon Boulevard',
      address: 'Flat 402, Green Valley Apts, Silicon Boulevard',
      landmark: 'Near Central Park',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      phone: '+91 98765 43210',
      isDefault: true,
    },
    {
      id: 'addr-2',
      userId: 1,
      type: 'office',
      name: 'Ravalika (Work)',
      title: 'Office',
      flat: 'Floor 7, Wing A',
      street: 'TechHub Tower, Innovation Way, Electronic City',
      address: 'Floor 7, TechHub Tower, Innovation Way, Electronic City',
      landmark: 'Opposite Metro Station',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      phone: '+91 98765 43210',
      isDefault: false,
    },
  ]);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<DeliveryAddress | null>(addresses[0]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // Advanced Search State
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Basmati Rice',
    'Amul Butter',
    'Organic Honey',
    'Face Cream',
    'Earbuds',
  ]);

  // Centralized Inventory State
  const [inventoryReport, setInventoryReport] = useState<InventoryReportState>({
    totalProducts: PRODUCTS.length,
    inStockCount: PRODUCTS.filter((p) => p.inStock).length,
    lowStockCount: PRODUCTS.filter((p) => p.inStock && p.stockCount <= 10).length,
    outOfStockCount: PRODUCTS.filter((p) => !p.inStock || p.stockCount === 0).length,
  });

  const refreshInventoryReport = async () => {
    try {
      const rep = await getInventoryReportDB();
      setInventoryReport({
        totalProducts: rep.total,
        inStockCount: rep.inStock,
        lowStockCount: rep.lowStock,
        outOfStockCount: rep.outOfStock,
      });
    } catch {
      setInventoryReport({
        totalProducts: products.length,
        inStockCount: products.filter((p) => p.inStock).length,
        lowStockCount: products.filter((p) => p.inStock && p.stockCount <= 10).length,
        outOfStockCount: products.filter((p) => !p.inStock || p.stockCount === 0).length,
      });
    }
  };

  const recentlyViewed = React.useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewedIds, products]);

  const handleSetSelectedProduct = (prod: Product | null) => {
    setSelectedProduct(prod);
    if (prod) {
      setRecentlyViewedIds((prev) => [prod.id, ...prev.filter((id) => id !== prod.id)].slice(0, 15));
      addToRecentlyViewedDB(prod.id).catch(() => { });
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load session, addresses, delivery zones and searches from database on startup
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        const savedSession = await getSessionDB();
        if (savedSession) {
          setCurrentUser(savedSession);
        }
        const dbAddresses = await getDeliveryAddressesDB();
        if (dbAddresses && dbAddresses.length > 0) {
          setAddresses(dbAddresses);
          const defaultAddr = dbAddresses.find((a) => a.isDefault) || dbAddresses[0];
          setSelectedDeliveryAddress(defaultAddr);
          setSelectedAddress(`${defaultAddr.flat}, ${defaultAddr.street}, ${defaultAddr.city} - ${defaultAddr.pincode}`);
        }
        const zones = await getDeliveryZonesDB();
        setDeliveryZones(zones);
        const searches = await getRecentSearchesDB();
        if (searches && searches.length > 0) {
          setRecentSearches(searches);
        }
        await refreshInventoryReport();
      } catch (e) {
        console.warn('Session init warning:', e);
      }
    };
    init();
  }, []);

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await loginUserDB(identifier, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthScreen(null);
      if (res.user.role === 'admin') {
        setIsAdminMode(true);
        showToast(`Welcome Admin ${res.user.name}! 🛡️ Control Hub Active.`);
      } else {
        setIsAdminMode(false);
        showToast(`Welcome back, ${res.user.name}! 👋`);
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const register = async (name: string, mobile: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await registerUserDB(name, mobile, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthScreen(null);
      setIsAdminMode(false);
      showToast(`Account created! Welcome, ${res.user.name} 🎉`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const logout = async () => {
    await clearSessionDB();
    setCurrentUser(null);
    setIsAdminMode(false);
    setAuthScreen('login');
    setActiveTab('home');
    showToast('Logged out of account');
  };

  const updateProfile = async (name: string, mobile: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active session' };
    const res = await updateUserDB(currentUser.id, name, mobile);
    if (res.success) {
      setCurrentUser({ ...currentUser, name, mobile });
      showToast('Profile updated successfully');
      return { success: true };
    }
    return { success: false, error: res.error || 'Update failed' };
  };

  // Delivery Location Management
  const handleSelectDeliveryAddress = (addr: DeliveryAddress) => {
    setSelectedDeliveryAddress(addr);
    setSelectedAddress(`${addr.flat}, ${addr.street}, ${addr.city} - ${addr.pincode}`);
    showToast(`Delivery set to ${(addr.type || 'home').toUpperCase()}: ${addr.pincode}`);
  };

  const addDeliveryAddress = async (addrData: Omit<DeliveryAddress, 'id'>): Promise<DeliveryAddress> => {
    const created = await addDeliveryAddressDB(addrData);
    setAddresses((prev) => [...prev, created]);
    if (addrData.isDefault || addresses.length === 0) {
      handleSelectDeliveryAddress(created);
    }
    showToast('New delivery address saved 📍');
    return created;
  };

  const updateDeliveryAddress = async (id: string, updates: Partial<DeliveryAddress>): Promise<boolean> => {
    const success = await updateDeliveryAddressDB(id, updates);
    if (success) {
      setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
      if (selectedDeliveryAddress?.id === id) {
        const updated = { ...selectedDeliveryAddress, ...updates };
        setSelectedDeliveryAddress(updated);
        setSelectedAddress(`${updated.flat}, ${updated.street}, ${updated.city} - ${updated.pincode}`);
      }
      showToast('Address updated successfully ✏️');
    }
    return success;
  };

  const deleteDeliveryAddress = async (id: string): Promise<boolean> => {
    const success = await deleteDeliveryAddressDB(id);
    if (success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedDeliveryAddress?.id === id) {
        const remaining = addresses.filter((a) => a.id !== id);
        if (remaining.length > 0) {
          handleSelectDeliveryAddress(remaining[0]);
        }
      }
      showToast('Address removed 🗑️');
    }
    return success;
  };

  const checkPincodeServiceability = async (pincode: string) => {
    return await checkServiceabilityDB(pincode);
  };

  // Recent Searches
  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    addRecentSearchDB(query).then((list) => {
      setRecentSearches(list);
    });
  };

  const clearRecentSearches = () => {
    clearRecentSearchesDB().then(() => {
      setRecentSearches([]);
      showToast('Search history cleared');
    });
  };

  // Unified Cart & Variant Handling
  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          (variant ? item.selectedVariant?.id === variant.id : !item.selectedVariant)
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
    const label = variant ? `${product.name} (${variant.name || variant.size || ''})` : product.name;
    showToast(`Added ${label} to cart 🛒`);
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === productId &&
          (variantId ? item.selectedVariant?.id === variantId : !item.selectedVariant)
      );
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item !== existing);
      }
      return prev.map((item) =>
        item === existing ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const deleteFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (variantId ? item.selectedVariant?.id === variantId : !item.selectedVariant)
          )
      )
    );
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const getItemQuantity = (productId: string) => {
    return cart
      .filter((i) => i.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getItemVariantQuantity = (productId: string, variantId?: string) => {
    if (!variantId) return getItemQuantity(productId);
    const item = cart.find(
      (i) => i.product.id === productId && i.selectedVariant?.id === variantId
    );
    return item ? item.quantity : 0;
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from favorites');
        return prev.filter((id) => id !== productId);
      }
      showToast('Saved to favorites ❤️');
      return [...prev, productId];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const applyCoupon = (code: string): boolean => {
    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (!coupon) {
      showToast('Invalid coupon code');
      return false;
    }
    if (cartSubtotal < coupon.minOrder) {
      showToast(`Add ₹${coupon.minOrder - cartSubtotal} more to apply this coupon`);
      return false;
    }
    setAppliedCoupon(coupon);
    showToast(`Coupon applied! ${coupon.discountPercentage}% OFF`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const placeOrder = async (paymentMethod: string, tipAmount: number) => {
    if (cart.length === 0) {
      showToast('Cart is empty!');
      return;
    }

    // Centralized stock reservation
    const reservationItems = cart.map((item) => ({
      productId: item.product.id,
      variantId: item.selectedVariant?.id,
      quantity: item.quantity,
    }));

    const stockCheck = await reserveOrderStockDB(reservationItems);
    if (!stockCheck.success) {
      showToast(stockCheck.message || 'Some items are out of stock!');
      return;
    }

    // Decrement product and variant stock in local products state
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatches = cart.filter((item) => item.product.id === prod.id);
        if (cartMatches.length === 0) return prod;
        const totalOrdered = cartMatches.reduce((sum, it) => sum + it.quantity, 0);
        const newStock = Math.max(0, prod.stockCount - totalOrdered);

        // Also update variants if present
        let updatedVariants = prod.variants;
        if (prod.variants) {
          updatedVariants = prod.variants.map((v) => {
            const vMatch = cartMatches.find((it) => it.selectedVariant?.id === v.id);
            if (!vMatch) return v;
            const currentStock = v.stock ?? v.stockCount ?? 10;
            const newVarStock = Math.max(0, currentStock - vMatch.quantity);
            return { ...v, stock: newVarStock, stockCount: newVarStock, inStock: newVarStock > 0 };
          });
        }

        return {
          ...prod,
          stockCount: newStock,
          inStock: newStock > 0,
          variants: updatedVariants,
        };
      })
    );

    const discountVal = appliedCoupon
      ? Math.min((cartSubtotal * appliedCoupon.discountPercentage) / 100, appliedCoupon.maxDiscount)
      : 0;

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      items: [...cart],
      total: Math.max(0, cartSubtotal - discountVal) + 15 + tipAmount,
      subtotal: cartSubtotal,
      deliveryFee: 15,
      discount: discountVal,
      tip: tipAmount,
      status: 'CONFIRMED',
      stage: 'CONFIRMED',
      estimatedDeliveryMins: selectedDeliveryAddress?.pincode ? 10 : 15,
      remainingSeconds: 600,
      createdAt: new Date(),
      deliveryAddress: selectedDeliveryAddress
        ? `${selectedDeliveryAddress.flat}, ${selectedDeliveryAddress.street}, ${selectedDeliveryAddress.city} - ${selectedDeliveryAddress.pincode}`
        : selectedAddress,
      rider: {
        name: 'Vikram Singh',
        phone: '+91 98765 43210',
        rating: 4.9,
        vehicle: 'Electric Superbike',
        vehicleNumber: 'MH 02 EQ 8812',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        currentLatProgress: 0.15,
      },
      riderName: 'Vikram Singh',
      riderPhone: '+91 98765 43210',
      paymentMethod,
    };

    setActiveOrder(newOrder);
    setOrdersList((prev) => [newOrder, ...prev]);
    saveOrderDB(newOrder).catch(() => { });
    setCart([]);
    setAppliedCoupon(null);
    setActiveTab('tracking');
    refreshInventoryReport();
    showToast('Order confirmed! Superfast delivery started ⚡');
  };

  const cancelActiveOrder = async () => {
    if (activeOrder) {
      // Release inventory restock
      const releaseItems = activeOrder.items.map((item) => ({
        productId: item.product.id,
        variantId: item.selectedVariant?.id,
        quantity: item.quantity,
      }));
      await releaseOrderStockDB(releaseItems);

      // Restore stock in local state
      setProducts((prev) =>
        prev.map((prod) => {
          const orderMatches = activeOrder.items.filter((item) => item.product.id === prod.id);
          if (orderMatches.length === 0) return prod;
          const totalReturned = orderMatches.reduce((sum, it) => sum + it.quantity, 0);
          const restoredStock = prod.stockCount + totalReturned;

          let updatedVariants = prod.variants;
          if (prod.variants) {
            updatedVariants = prod.variants.map((v) => {
              const vMatch = orderMatches.find((it) => it.selectedVariant?.id === v.id);
              if (!vMatch) return v;
              const currentStock = v.stock ?? v.stockCount ?? 0;
              const restoredVarStock = currentStock + vMatch.quantity;
              return { ...v, stock: restoredVarStock, stockCount: restoredVarStock, inStock: true };
            });
          }

          return {
            ...prod,
            stockCount: restoredStock,
            inStock: true,
            variants: updatedVariants,
          };
        })
      );

      setActiveOrder(null);
      refreshInventoryReport();
      showToast('Order cancelled and inventory restored 🔄');
    } else {
      setActiveOrder(null);
      showToast('Order cancelled');
    }
  };

  const simulateNextStage = () => {
    if (!activeOrder) return;
    const currentStage = (activeOrder.stage || activeOrder.status) as OrderStage;
    const currentIndex = ORDER_STAGES.indexOf(currentStage);
    if (currentIndex >= 0 && currentIndex < ORDER_STAGES.length - 1) {
      const nextStage = ORDER_STAGES[currentIndex + 1];
      setActiveOrder({ ...activeOrder, stage: nextStage, status: nextStage });
      showToast(`Order status updated: ${nextStage.replace(/_/g, ' ')}`);
    } else {
      showToast('Order already delivered!');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  let discount = 0;
  if (appliedCoupon) {
    const calculated = (cartSubtotal * appliedCoupon.discountPercentage) / 100;
    discount = Math.min(calculated, appliedCoupon.maxDiscount);
  }
  const deliveryFee = cartSubtotal > 299 ? 0 : 25;
  const cartTotal = Math.max(0, cartSubtotal - discount + deliveryFee);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authScreen,
        products,
        categories,
        cart,
        cartCount,
        cartSubtotal,
        cartTotal,
        wishlist,
        activeOrder,
        selectedAddress,
        appliedCoupon,
        searchQuery,
        selectedCategory,
        activeTab,
        selectedProduct,
        toastMessage,

        // Delivery Location
        addresses,
        selectedDeliveryAddress,
        setSelectedDeliveryAddress: handleSelectDeliveryAddress,
        addDeliveryAddress,
        updateDeliveryAddress,
        deleteDeliveryAddress,
        checkPincodeServiceability,
        deliveryZones,

        // Advanced Search
        recentSearches,
        addRecentSearch,
        clearRecentSearches,

        // Inventory & Variants
        addToCartWithVariant: addToCart,
        removeFromCartWithVariant: removeFromCart,
        deleteFromCartWithVariant: deleteFromCart,
        getItemVariantQuantity,
        inventoryReport,
        refreshInventoryReport,

        isAdmin,
        isAdminMode,
        setIsAdminMode,
        initialLoginMode,
        setInitialLoginMode,
        updateProduct,
        toggleProductStock,
        addProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,
        ordersList,
        updateOrderStatus,

        setAuthScreen,
        login,
        register,
        logout,
        updateProfile,

        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        getItemQuantity,
        applyCoupon,
        removeCoupon,
        placeOrder,
        cancelActiveOrder,
        simulateNextStage,
        setSelectedAddress,
        setSearchQuery,
        setSelectedCategory,
        setActiveTab,
        setSelectedProduct: handleSetSelectedProduct,
        recentlyViewed,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
