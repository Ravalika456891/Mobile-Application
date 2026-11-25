export type CategoryId =
  | 'all'
  // Phase 1: Core Grocery (1-13)
  | 'fruits-vegetables'
  | 'dairy-bread-eggs'
  | 'atta-rice-dal-grains'
  | 'masala-spices'
  | 'cooking-oils-essentials'
  | 'snacks-munchies'
  | 'biscuits-bakery'
  | 'beverages-drinks'
  | 'tea-coffee-breakfast'
  | 'instant-food'
  | 'frozen-icecream'
  | 'sauces-spreads'
  | 'meat-seafood-eggs'
  // Phase 2: Everyday Essentials (14-21)
  | 'personal-care'
  | 'beauty-cosmetics'
  | 'home-care'
  | 'baby-care'
  | 'pet-care'
  | 'kitchen-dining'
  | 'home-living'
  | 'stationery-office'
  // Phase 3: Lifestyle Marketplace (22-28)
  | 'electronics-accessories'
  | 'fashion-accessories'
  | 'jewellery-accessories'
  | 'health-wellness'
  | 'toys-games'
  | 'pooja-essentials'
  | 'books-gifts'
  // Compatibility & Legacy Aliases
  | 'vegetables'
  | 'fruits'
  | 'rice-grains'
  | 'dairy'
  | 'snacks'
  | 'beverages'
  | 'cooking-essentials'
  | 'bakery'
  | 'frozen-foods'
  | 'pet-supplies'
  | 'kitchen-home'
  | 'household'
  | 'groceries'
  | 'icecreams'
  | 'clothing'
  | 'accessories'
  | 'stationery';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  badge?: string;
  color: string;
  image?: string;
  subcategories?: string[];
  description?: string;
  featured?: boolean;
}

export interface NutritionInfo {
  servingSize?: string;
  energy?: string;
  calories?: number | string;
  carbohydrates?: string | number;
  sugars?: string | number;
  addedSugar?: string | number;
  protein?: string | number;
  fat?: string | number;
  sodium?: string | number;
  potassium?: string | number;
  calcium?: string | number;
  vitaminC?: string | number;
  vitaminD?: string | number;
  [key: string]: any;
}

export interface VolumeOption {
  size: string;
  price: number;
  originalPrice?: number;
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  name?: string;          // Variant display name, e.g. '500g', 'XL', 'Ruby Red'
  size?: string;          // e.g. '500g', '1kg', 'XL', '250 ml', '128GB'
  color?: string;         // e.g. 'Midnight Blue', 'Matte Black'
  colorCode?: string;     // e.g. '#000000', '#10B981'
  shade?: string;         // e.g. 'Ruby Red', 'Warm Beige'
  material?: string;      // e.g. '100% Cotton', 'Pure Brass'
  model?: string;         // e.g. 'Pro', 'Max'
  price: number;
  originalPrice?: number;
  stock?: number;
  stockCount?: number;
  inStock?: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface DeliveryAddress {
  id: string;
  userId?: number;
  type?: 'home' | 'office' | 'other' | string;
  name?: string;
  flat?: string;
  street?: string;
  landmark?: string;
  title: string;        // 'Home' | 'Office' | 'Other'
  address: string;
  pincode: string;
  city?: string;
  state?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface DeliveryZone {
  id?: string;
  name?: string;
  description?: string;
  pincode: string;
  pincodes?: string[];
  area: string;
  city: string;
  isServiceable: boolean;
  deliveryTimeMins: number;
  estimatedMinutes?: number;
  deliveryFee: number;
  minOrderAmount?: number;
  freeDeliveryThreshold: number;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: CategoryId;
  subcategory: string;
  price: number;
  originalPrice?: number;
  weightOrSize: string;
  rating: number;
  reviewsCount: number;
  deliveryTimeMins: number;
  image: string;
  images?: string[];
  inStock: boolean;
  stockCount: number;
  description: string;
  tags?: string[];
  brand?: string;
  discountPercentage?: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Reusable variant & attributes system
  variants?: ProductVariant[];
  volumeOptions?: VolumeOption[];
  attributes?: ProductAttribute[];
  specifications?: ProductAttribute[];

  // Food & Grocery Specifications
  isVeg?: boolean;
  isNonVeg?: boolean;
  isVegan?: boolean;
  isJainFriendly?: boolean;
  storageType?: 'ambient' | 'refrigerated' | 'frozen';
  temperature?: string;
  freshnessBadge?: string;
  meatCut?: string;
  unit?: string;
  availableQuantity?: number;
  flavour?: string;
  sugarLabel?: 'Sugar-Free' | 'Low-Sugar' | 'Zero Added Sugar' | 'Naturally Sweet' | 'Classic';
  isSugarVerified?: boolean;
  ingredients?: string;
  nutritionInfo?: NutritionInfo;
  shelfLife?: string;
  expiryDate?: string;
  storageInstructions?: string;

  // Lifestyle, Beauty & Electronics Specifications
  skinType?: string;
  hairType?: string;
  shade?: string;
  color?: string;
  size?: string;
  material?: string;
  gender?: 'Men' | 'Women' | 'Kids' | 'Unisex';
  modelNumber?: string;
  warranty?: string;
  storageCapacity?: string;
  ageGroup?: string;
  author?: string;
  publisher?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export type OrderStage =
  | 'Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'CONFIRMED'
  | 'PACKING'
  | 'RIDER_ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVING'
  | 'DELIVERED';

export interface RiderInfo {
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  vehicleNumber: string;
  avatar: string;
  currentLatProgress: number; // 0 to 1 for progress on route
}

export interface Order {
  id: string;
  createdAt: Date | string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tip: number;
  total: number;
  status: OrderStage;
  stage?: OrderStage;
  estimatedDeliveryMins: number;
  remainingSeconds: number;
  rider: RiderInfo;
  riderName?: string;
  riderPhone?: string;
  deliveryAddress: string;
  paymentMethod: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrder: number;
  description: string;
}

export interface User {
  id: number;
  name: string;
  mobile: string;
  createdAt?: string;
}
