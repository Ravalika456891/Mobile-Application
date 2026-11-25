import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStage, Coupon, CategoryId, Category } from '../types';
import { PRODUCTS, AVAILABLE_COUPONS, CATEGORIES } from '../data/products';
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
} from '../services/database';

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

  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
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
    addProductDB(newProduct).catch(() => {});
    showToast(`Added ${newProduct.name} to catalog! 🎉`);
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductDB(productId).catch(() => {});
    showToast('Product removed from catalog 🗑️');
  };

  const addCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
    addCategoryDB(newCat).catch(() => {});
    showToast(`Category ${newCat.name} created! 🏷️`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    updateCategoryDB(id, updates).catch(() => {});
    showToast('Category updated! ✏️');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    deleteCategoryDB(id).catch(() => {});
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
    addSubcategoryDB(catId, subcategory).catch(() => {});
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
    deleteSubcategoryDB(catId, subcategory).catch(() => {});
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

  const recentlyViewed = React.useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewedIds, products]);

  const handleSetSelectedProduct = (prod: Product | null) => {
    setSelectedProduct(prod);
    if (prod) {
      setRecentlyViewedIds((prev) => [prod.id, ...prev.filter((id) => id !== prod.id)].slice(0, 15));
      addToRecentlyViewedDB(prod.id).catch(() => {});
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

  // Load session from database on startup
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        const savedSession = await getSessionDB();
        if (savedSession) {
          setCurrentUser(savedSession);
        }
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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const deleteFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
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

  const placeOrder = (paymentMethod: string, tipAmount: number) => {
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
      estimatedDeliveryMins: 10,
      remainingSeconds: 600,
      createdAt: new Date(),
      deliveryAddress: selectedAddress,
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
    setCart([]);
    setAppliedCoupon(null);
    setActiveTab('tracking');
    showToast('Order confirmed! Superfast delivery started ⚡');
  };

  const cancelActiveOrder = () => {
    setActiveOrder(null);
    showToast('Order cancelled');
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
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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
