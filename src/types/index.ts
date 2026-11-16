export type CategoryId = 
  | 'all'
  | 'fruits-vegetables'
  | 'fruits'
  | 'vegetables'
  | 'dairy'
  | 'bakery'
  | 'rice-grains'
  | 'snacks'
  | 'beverages'
  | 'cooking-essentials'
  | 'household'
  | 'personal-care'
  | 'groceries'
  | 'icecreams'
  | 'clothing'
  | 'accessories';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  badge?: string;
  color: string;
}

export interface Product {
  id: string;
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
  inStock: boolean;
  stockCount: number;
  description: string;
  tags?: string[];
  isVeg?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
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
