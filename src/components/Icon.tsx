import React from 'react';
import {
  Zap,
  ChevronDown,
  ChevronRight,
  Bike,
  User,
  Search,
  X,
  LayoutGrid,
  ShoppingCart,
  Heart,
  Star,
  Plus,
  Minus,
  MapPin,
  Clock,
  Store,
  Home,
  ShieldCheck,
  Snowflake,
  Package,
  Gift,
  CheckCircle,
  Phone,
  MessageSquare,
  Sparkles,
  Leaf,
  Ticket,
  CreditCard,
  ArrowRight,
  Navigation,
  Headphones,
  Bell,
  Utensils,
  Shirt,
  Watch,
  Apple,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react-native';

export type IconName =
  | 'flash'
  | 'chevron-down'
  | 'chevron-forward'
  | 'bicycle'
  | 'person'
  | 'person-circle-outline'
  | 'search'
  | 'close'
  | 'close-circle'
  | 'grid'
  | 'grid-outline'
  | 'cart'
  | 'cart-outline'
  | 'heart'
  | 'heart-outline'
  | 'star'
  | 'add'
  | 'remove'
  | 'location'
  | 'location-outline'
  | 'time'
  | 'business'
  | 'home'
  | 'home-outline'
  | 'shield-checkmark'
  | 'shield-checkmark-outline'
  | 'snow'
  | 'snow-outline'
  | 'cube'
  | 'gift'
  | 'checkmark-circle'
  | 'call'
  | 'call-outline'
  | 'chatbubble'
  | 'sparkles'
  | 'leaf'
  | 'ticket'
  | 'ticket-outline'
  | 'card-outline'
  | 'arrow-forward'
  | 'navigate'
  | 'headset-outline'
  | 'notifications-outline'
  | 'notifications-off-outline'
  | 'nutrition-outline'
  | 'shirt-outline'
  | 'watch-outline'
  | 'fast-food-outline'
  | 'play-forward'
  | 'person-pin'
  | 'refresh'
  | 'ellipse-outline'
  | 'log-out'
  | 'log-out-outline'
  | 'lock-closed-outline'
  | 'eye-outline'
  | 'eye-off-outline'
  | 'alert-circle';

interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#000000', style }) => {
  switch (name) {
    case 'flash':
      return <Zap size={size} color={color} style={style} />;
    case 'chevron-down':
      return <ChevronDown size={size} color={color} style={style} />;
    case 'chevron-forward':
      return <ChevronRight size={size} color={color} style={style} />;
    case 'bicycle':
      return <Bike size={size} color={color} style={style} />;
    case 'person':
    case 'person-circle-outline':
    case 'person-outline':
      return <User size={size} color={color} style={style} />;
    case 'search':
    case 'search-outline':
      return <Search size={size} color={color} style={style} />;
    case 'close':
    case 'close-circle':
      return <X size={size} color={color} style={style} />;
    case 'grid':
    case 'grid-outline':
      return <LayoutGrid size={size} color={color} style={style} />;
    case 'cart':
    case 'cart-outline':
      return <ShoppingCart size={size} color={color} style={style} />;
    case 'heart':
      return <Heart size={size} color={color} fill={color} style={style} />;
    case 'heart-outline':
      return <Heart size={size} color={color} style={style} />;
    case 'star':
      return <Star size={size} color={color} fill={color} style={style} />;
    case 'add':
      return <Plus size={size} color={color} style={style} />;
    case 'remove':
      return <Minus size={size} color={color} style={style} />;
    case 'location':
    case 'location-outline':
      return <MapPin size={size} color={color} style={style} />;
    case 'time':
      return <Clock size={size} color={color} style={style} />;
    case 'business':
      return <Store size={size} color={color} style={style} />;
    case 'home':
    case 'home-outline':
      return <Home size={size} color={color} style={style} />;
    case 'shield-checkmark':
    case 'shield-checkmark-outline':
      return <ShieldCheck size={size} color={color} style={style} />;
    case 'snow':
    case 'snow-outline':
      return <Snowflake size={size} color={color} style={style} />;
    case 'cube':
      return <Package size={size} color={color} style={style} />;
    case 'gift':
      return <Gift size={size} color={color} style={style} />;
    case 'checkmark-circle':
      return <CheckCircle size={size} color={color} style={style} />;
    case 'call':
    case 'call-outline':
      return <Phone size={size} color={color} style={style} />;
    case 'chatbubble':
      return <MessageSquare size={size} color={color} style={style} />;
    case 'sparkles':
      return <Sparkles size={size} color={color} style={style} />;
    case 'leaf':
      return <Leaf size={size} color={color} style={style} />;
    case 'ticket':
    case 'ticket-outline':
      return <Ticket size={size} color={color} style={style} />;
    case 'card-outline':
      return <CreditCard size={size} color={color} style={style} />;
    case 'arrow-forward':
      return <ArrowRight size={size} color={color} style={style} />;
    case 'navigate':
      return <Navigation size={size} color={color} style={style} />;
    case 'headset-outline':
      return <Headphones size={size} color={color} style={style} />;
    case 'notifications-outline':
    case 'notifications-off-outline':
      return <Bell size={size} color={color} style={style} />;
    case 'nutrition-outline':
      return <Apple size={size} color={color} style={style} />;
    case 'shirt-outline':
      return <Shirt size={size} color={color} style={style} />;
    case 'watch-outline':
      return <Watch size={size} color={color} style={style} />;
    case 'fast-food-outline':
      return <Utensils size={size} color={color} style={style} />;
    case 'play-forward':
      return <ArrowRight size={size} color={color} style={style} />;
    case 'log-out':
    case 'log-out-outline':
      return <LogOut size={size} color={color} style={style} />;
    case 'lock-closed-outline':
      return <Lock size={size} color={color} style={style} />;
    case 'eye-outline':
      return <Eye size={size} color={color} style={style} />;
    case 'eye-off-outline':
      return <EyeOff size={size} color={color} style={style} />;
    case 'alert-circle':
      return <AlertCircle size={size} color={color} style={style} />;
    default:
      return <Zap size={size} color={color} style={style} />;
  }
};
