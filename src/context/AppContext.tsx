import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, OrderStage, Coupon, CategoryId } from '../types';
import { PRODUCTS, AVAILABLE_COUPONS } from '../data/products';
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
  getOrdersDB,
} from '../services/database';

interface AppContextType {
  currentUser: LocalUser | null;
  isCheckingSession: boolean;
  authScreen: 'splash' | 'login' | 'register' | null;
  products: Product[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  wishlist: string[];
  activeOrder: Order | null;
  ordersHistory: Order[];
  selectedAddress: string;
  appliedCoupon: Coupon | null;
  searchQuery: string;
  selectedCategory: CategoryId;
  activeTab: 'home' | 'categories' | 'cart' | 'tracking' | 'profile' | 'orders';
  selectedProduct: Product | null;
  toastMessage: string | null;

  setAuthScreen: (screen: 'splash' | 'login' | 'register' | null) => void;
  login: (mobile: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, mobile: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, mobile: string) => Promise<{ success: boolean; error?: string }>;

  addToCart: (product: Product) => boolean;
  removeFromCart: (productId: string) => void;
  deleteFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (paymentMethod: string, tipAmount: number) => Promise<void>;
  cancelActiveOrder: () => void;
  simulateNextStage: () => void;
  setSelectedAddress: (addr: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: CategoryId) => void;
  setActiveTab: (tab: 'home' | 'categories' | 'cart' | 'tracking' | 'profile' | 'orders') => void;
  setSelectedProduct: (prod: Product | null) => void;
  showToast: (msg: string) => void;
  refreshOrders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ORDER_STAGES: OrderStage[] = [
  'CONFIRMED',
  'PACKING',
  'RIDER_ASSIGNED',
  'OUT_FOR_DELIVERY',
  'ARRIVING',
  'DELIVERED',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<LocalUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authScreen, setAuthScreen] = useState<'splash' | 'login' | 'register' | null>('splash');

  const [products] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['fv-1', 'dairy-1']);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('Flat 402, Green Valley Apts, Silicon Boulevard');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'cart' | 'tracking' | 'profile' | 'orders'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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

  // Session & database initialization
  useEffect(() => {
    const initApp = async () => {
      try {
        await initDatabase();
        const savedSession = await getSessionDB();
        if (savedSession) {
          setCurrentUser(savedSession);
          setAuthScreen(null);
        } else {
          setAuthScreen('splash');
        }

        // Load persisted orders
        const savedOrders = await getOrdersDB();
        if (savedOrders && savedOrders.length > 0) {
          setOrdersHistory(savedOrders);
        }

        // Load persisted cart
        const savedCartRows = await loadCartDB();
        if (savedCartRows && savedCartRows.length > 0) {
          const restoredCart: CartItem[] = [];
          for (const row of savedCartRows) {
            const product = PRODUCTS.find((p) => p.id === row.product_id);
            if (product) {
              restoredCart.push({ product, quantity: row.quantity });
            }
          }
          if (restoredCart.length > 0) {
            setCart(restoredCart);
          }
        }
      } catch (err) {
        console.warn('App initialization warning:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };

    initApp();
  }, []);

  const login = async (mobile: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await loginUserDB(mobile, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthScreen(null);
      showToast(`Welcome back, ${res.user.name}! 👋`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const register = async (name: string, mobile: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await registerUserDB(name, mobile, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAuthScreen(null);
      showToast(`Account created! Welcome, ${res.user.name} 🎉`);
      return { success: true };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const logout = async () => {
    await clearSessionDB();
    setCurrentUser(null);
    setAuthScreen('login');
    setActiveTab('home');
    showToast('Logged out successfully');
  };

  const updateProfile = async (name: string, mobile: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active user session' };
    const res = await updateUserDB(currentUser.id, name, mobile);
    if (res.success) {
      setCurrentUser({ ...currentUser, name, mobile });
      showToast('Profile updated successfully');
      return { success: true };
    }
    return { success: false, error: res.error || 'Update failed' };
  };

  const refreshOrders = async () => {
    const orders = await getOrdersDB();
    setOrdersHistory(orders);
  };

  // Cart operations with stock limit enforcement (PRD Section 6.8)
  const addToCart = (product: Product): boolean => {
    let success = true;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockCount) {
          showToast(`Cannot add more. Only ${product.stockCount} available in stock.`);
          success = false;
          return prev;
        }
        const updated = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
        saveCartDB(updated.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
        return updated;
      }
      if (product.stockCount <= 0) {
        showToast('Sorry, this item is currently out of stock.');
        success = false;
        return prev;
      }
      const updated = [...prev, { product, quantity: 1 }];
      saveCartDB(updated.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
      return updated;
    });

    if (success) {
      showToast(`Added ${product.name} to cart`);
    }
    return success;
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      let updated: CartItem[];
      if (existing.quantity <= 1) {
        updated = prev.filter((item) => item.product.id !== productId);
      } else {
        updated = prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      saveCartDB(updated.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
      return updated;
    });
  };

  const deleteFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      saveCartDB(updated.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
      return updated;
    });
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    saveCartDB([]);
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

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string) => {
    const coupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
    if (!coupon) {
      showToast('Invalid promo coupon');
      return false;
    }
    if (cartSubtotal < coupon.minOrder) {
      showToast(`Min order for ${coupon.code} is ₹${coupon.minOrder}`);
      return false;
    }
    setAppliedCoupon(coupon);
    showToast(`Coupon ${coupon.code} applied! Saved ₹${calculateDiscount(coupon)}`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = Number(
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(0)
  );

  const calculateDiscount = (coupon: Coupon | null) => {
    if (!coupon) return 0;
    const discount = (cartSubtotal * coupon.discountPercentage) / 100;
    return Number(Math.min(discount, coupon.maxDiscount).toFixed(0));
  };

  const discountAmount = calculateDiscount(appliedCoupon);
  const deliveryFee = cartSubtotal > 299 ? 0 : 25;
  const cartTotal = Number(
    Math.max(0, cartSubtotal - discountAmount + (cartCount > 0 ? deliveryFee : 0)).toFixed(2)
  );

  // REAL-TIME ORDER SIMULATION
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'DELIVERED') return;

    const secondTimer = setInterval(() => {
      setActiveOrder((prev) => {
        if (!prev || prev.status === 'DELIVERED') return prev;
        const newSec = Math.max(0, prev.remainingSeconds - 1);
        return {
          ...prev,
          remainingSeconds: newSec,
          rider: {
            ...prev.rider,
            currentLatProgress: Math.min(1, prev.rider.currentLatProgress + 0.005),
          },
        };
      });
    }, 1000);

    const stageTimer = setInterval(() => {
      setActiveOrder((prev) => {
        if (!prev) return null;
        const currentIndex = ORDER_STAGES.indexOf(prev.status);
        if (currentIndex < ORDER_STAGES.length - 1) {
          const nextStatus = ORDER_STAGES[currentIndex + 1];
          let statusMessage = '';
          switch (nextStatus) {
            case 'PACKING':
              statusMessage = 'Store is packing your groceries fresh!';
              break;
            case 'RIDER_ASSIGNED':
              statusMessage = `${prev.rider.name} is on the way to pick up!`;
              break;
            case 'OUT_FOR_DELIVERY':
              statusMessage = 'Order is out for delivery! 🛵';
              break;
            case 'ARRIVING':
              statusMessage = 'Rider has reached your address!';
              break;
            case 'DELIVERED':
              statusMessage = 'Order delivered! Enjoy your fresh groceries 🎉';
              break;
          }
          if (statusMessage) showToast(statusMessage);
          return {
            ...prev,
            status: nextStatus,
          };
        }
        return prev;
      });
    }, 20000);

    return () => {
      clearInterval(secondTimer);
      clearInterval(stageTimer);
    };
  }, [activeOrder]);

  const simulateNextStage = () => {
    if (!activeOrder) return;
    const currentIndex = ORDER_STAGES.indexOf(activeOrder.status);
    if (currentIndex < ORDER_STAGES.length - 1) {
      const nextStatus = ORDER_STAGES[currentIndex + 1];
      setActiveOrder((prev) => (prev ? { ...prev, status: nextStatus } : null));
      showToast(`Status updated to ${nextStatus.replace(/_/g, ' ')}`);
    }
  };

  const placeOrder = async (paymentMethod: string, tipAmount: number) => {
    if (cart.length === 0) return;

    const totalWithTip = Number((cartTotal + tipAmount).toFixed(2));
    const newOrder: Order = {
      id: 'MG-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date(),
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryFee: deliveryFee,
      discount: discountAmount,
      tip: tipAmount,
      total: totalWithTip,
      status: 'CONFIRMED',
      estimatedDeliveryMins: 10,
      remainingSeconds: 10 * 60,
      deliveryAddress: selectedAddress,
      paymentMethod,
      rider: {
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        rating: 4.9,
        vehicle: 'Eco Electric Scooter',
        vehicleNumber: 'KA-05-EV-4091',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        currentLatProgress: 0.1,
      },
    };

    // Save to SQLite
    await saveOrderDB(newOrder, currentUser?.id);

    setActiveOrder(newOrder);
    setOrdersHistory((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveTab('tracking');
    showToast('🎉 Order placed successfully! Tracking your delivery.');
  };

  const cancelActiveOrder = () => {
    if (activeOrder) {
      const cancelled: Order = { ...activeOrder, status: 'Cancelled' };
      setActiveOrder(null);
      saveOrderDB(cancelled, currentUser?.id);
      refreshOrders();
      showToast('Active order cancelled');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isCheckingSession,
        authScreen,
        products,
        cart,
        cartCount,
        cartSubtotal,
        cartTotal,
        wishlist,
        activeOrder,
        ordersHistory,
        selectedAddress,
        appliedCoupon,
        searchQuery,
        selectedCategory,
        activeTab,
        selectedProduct,
        toastMessage,
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
        setSelectedProduct,
        showToast,
        refreshOrders,
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
