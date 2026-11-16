import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { OrderStage } from '../types';

export const TrackingScreen: React.FC = () => {
  const {
    activeOrder,
    cancelActiveOrder,
    simulateNextStage,
    placeOrder,
    products,
    addToCart,
    setActiveTab,
    showToast,
  } = useApp();

  const handleStartDemoOrder = () => {
    addToCart(products[0]);
    addToCart(products[5]);
    addToCart(products[9]);
    setTimeout(() => {
      placeOrder('Apple Pay / GPay', 2.0);
    }, 100);
  };

  if (!activeOrder) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="bicycle" size={54} color="#10B981" />
        </View>
        <Text style={styles.emptyTitle}>No Live Deliveries</Text>
        <Text style={styles.emptySubtitle}>
          You don't have an ongoing order right now. Place an order or start a demo to watch real-time tracking in action!
        </Text>
        <TouchableOpacity
          style={styles.demoOrderBtn}
          onPress={handleStartDemoOrder}
          activeOpacity={0.85}
        >
          <Icon name="flash" size={18} color="#FFF" />
          <Text style={styles.demoOrderBtnText}>Launch Live Demo Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.browseBtnText}>Browse Store Items</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const STAGES: { stage: OrderStage; label: string; icon: string; desc: string }[] = [
    {
      stage: 'CONFIRMED',
      label: 'Order Confirmed',
      icon: 'checkmark-circle',
      desc: 'Order placed & sent to dark store',
    },
    {
      stage: 'PACKING',
      label: 'Packing Items',
      icon: 'cube',
      desc: 'Chilled items placed in insulated bags',
    },
    {
      stage: 'RIDER_ASSIGNED',
      label: 'Rider Assigned',
      icon: 'person-pin',
      desc: `${activeOrder.rider.name} is at the hub`,
    },
    {
      stage: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      icon: 'bicycle',
      desc: 'Rider is speeding towards your location',
    },
    {
      stage: 'ARRIVING',
      label: 'Arriving at Door',
      icon: 'navigate',
      desc: 'Rider is entering your premises',
    },
    {
      stage: 'DELIVERED',
      label: 'Delivered',
      icon: 'gift',
      desc: 'Enjoy your fresh items!',
    },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.stage === activeOrder.status);

  const formatMinutesSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStageHeader = () => {
    switch (activeOrder.status) {
      case 'CONFIRMED':
        return {
          title: 'Order Confirmed!',
          subtitle: 'Store received your order & starting packaging',
          color: '#3B82F6',
        };
      case 'PACKING':
        return {
          title: 'Packing Your Items Fresh',
          subtitle: 'Items double-checked and packed securely',
          color: '#8B5CF6',
        };
      case 'RIDER_ASSIGNED':
        return {
          title: 'Rider Assigned & Ready',
          subtitle: `${activeOrder.rider.name} picked up the temperature-sealed box`,
          color: '#EC4899',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          title: 'Out For Delivery 🛵',
          subtitle: 'Rider is en-route with live GPS tracking',
          color: '#10B981',
        };
      case 'ARRIVING':
        return {
          title: 'Rider is at Your Gate!',
          subtitle: 'Please keep phone handy for contactless delivery',
          color: '#F59E0B',
        };
      case 'DELIVERED':
        return {
          title: 'Order Delivered! 🎉',
          subtitle: 'Delivered in 10 minutes. Thank you for choosing MyGroceries!',
          color: '#10B981',
        };
      default:
        return {
          title: 'Order in Progress',
          subtitle: 'Your groceries are on the way',
          color: '#10B981',
        };
    }
  };

  const stageHeader = getStageHeader() || {
    title: 'Order in Progress',
    subtitle: 'Your groceries are on the way',
    color: '#10B981',
  };

  const handleCallRider = () => {
    Alert.alert(
      'Calling Delivery Partner',
      `Connecting to ${activeOrder.rider.name} (${activeOrder.rider.phone})...`,
      [{ text: 'End Call' }]
    );
  };

  const handleMessageRider = () => {
    showToast(`Quick instructions sent to ${activeOrder.rider.name}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.statusHero, { borderColor: stageHeader.color }]}>
        <View style={styles.timerRow}>
          <View style={styles.etaBadge}>
            <Icon name="time" size={16} color="#10B981" />
            <Text style={styles.etaText}>ESTIMATED TIME</Text>
          </View>
          <Text style={styles.countdown}>
            {activeOrder.status === 'DELIVERED'
              ? 'COMPLETED'
              : formatMinutesSeconds(activeOrder.remainingSeconds)}
          </Text>
        </View>

        <Text style={styles.heroTitle}>{stageHeader.title}</Text>
        <Text style={styles.heroSubtitle}>{stageHeader.subtitle}</Text>
        <Text style={styles.orderIdBadge}>Order #{activeOrder.id}</Text>
      </View>

      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View style={styles.mapTitleRow}>
            <Icon name="location" size={16} color="#10B981" />
            <Text style={styles.mapTitle}>Real-Time GPS Route</Text>
          </View>
          <View style={styles.liveLiveDot}>
            <View style={styles.dotBlink} />
            <Text style={styles.liveLiveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.roadContainer}>
          <View style={styles.locationPin}>
            <View style={[styles.pinCircle, { backgroundColor: '#4F46E5' }]}>
              <Icon name="business" size={16} color="#FFF" />
            </View>
            <Text style={styles.pinLabel}>Dark Store</Text>
          </View>

          <View style={styles.trackLine}>
            <View
              style={[
                styles.trackFilled,
                {
                  width: `${Math.min(
                    100,
                    Math.max(10, ((currentStageIndex + 1) / STAGES.length) * 100)
                  )}%`,
                },
              ]}
            />
            <View
              style={[
                styles.scooterMarker,
                {
                  left: `${Math.min(
                    88,
                    Math.max(5, ((currentStageIndex + 1) / STAGES.length) * 88)
                  )}%`,
                },
              ]}
            >
              <Icon name="bicycle" size={16} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.locationPin}>
            <View style={[styles.pinCircle, { backgroundColor: '#10B981' }]}>
              <Icon name="home" size={16} color="#FFF" />
            </View>
            <Text style={styles.pinLabel}>Your Door</Text>
          </View>
        </View>

        {activeOrder.status !== 'DELIVERED' && (
          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={simulateNextStage}
            activeOpacity={0.8}
          >
            <Icon name="play-forward" size={15} color="#047857" />
            <Text style={styles.simulateBtnText}>
              Fast-Forward Next Step (Demo Test)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.riderCard}>
        <Image source={{ uri: activeOrder.rider.avatar }} style={styles.riderAvatar} />
        <View style={styles.riderInfo}>
          <Text style={styles.riderName}>{activeOrder.rider.name}</Text>
          <Text style={styles.riderVehicle}>
            {activeOrder.rider.vehicle} • {activeOrder.rider.vehicleNumber}
          </Text>
          <View style={styles.riderRating}>
            <Icon name="star" size={12} color="#F59E0B" />
            <Text style={styles.riderRatingText}>{activeOrder.rider.rating} Rating</Text>
            <Text style={styles.vaccinatedBadge}>• Vaccinated & Masked</Text>
          </View>
        </View>

        <View style={styles.riderActions}>
          <TouchableOpacity
            style={styles.actionCircle}
            onPress={handleCallRider}
            activeOpacity={0.7}
          >
            <Icon name="call" size={16} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCircle}
            onPress={handleMessageRider}
            activeOpacity={0.7}
          >
            <Icon name="chatbubble" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timelineCard}>
        <Text style={styles.timelineHeading}>Delivery Milestones</Text>
        {STAGES.map((s, idx) => {
          const isDone = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <View key={s.stage} style={styles.timelineRow}>
              <View style={styles.timelineLeftCol}>
                <View
                  style={[
                    styles.stepDot,
                    isDone && styles.stepDotDone,
                    isCurrent && styles.stepDotCurrent,
                  ]}
                >
                  <Icon
                    name={isDone ? s.icon : 'ellipse-outline'}
                    size={12}
                    color={isDone ? '#FFF' : '#9CA3AF'}
                  />
                </View>
                {idx < STAGES.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      idx < currentStageIndex && styles.stepConnectorDone,
                    ]}
                  />
                )}
              </View>

              <View style={styles.timelineRightCol}>
                <Text
                  style={[
                    styles.stepLabel,
                    isDone && styles.stepLabelDone,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {s.label}
                </Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.itemsCard}>
        <Text style={styles.itemsCardTitle}>
          Items in this Order ({activeOrder.items.length})
        </Text>
        {activeOrder.items.map((item) => (
          <View key={item.product.id} style={styles.itemRow}>
            <Image source={{ uri: item.product.image }} style={styles.itemThumb} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemWeight}>
                {item.quantity} x {item.product.weightOrSize}
              </Text>
            </View>
            <Text style={styles.itemPrice}>
              ₹{(item.product.price * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Total Paid ({activeOrder.paymentMethod})</Text>
          <Text style={styles.billTotal}>₹{activeOrder.total.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.addressBox}>
        <Icon name="location-outline" size={18} color="#10B981" />
        <View style={styles.addressInfo}>
          <Text style={styles.addressHeading}>Delivery Address</Text>
          <Text style={styles.addressValue}>{activeOrder.deliveryAddress}</Text>
        </View>
      </View>

      {activeOrder.status !== 'DELIVERED' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={cancelActiveOrder}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 320,
  },
  demoOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  demoOrderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  browseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  browseBtnText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  statusHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  countdown: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10B981',
    fontVariant: ['tabular-nums'],
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  orderIdBadge: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
  },
  liveLiveDot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  dotBlink: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveLiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  roadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  locationPin: {
    alignItems: 'center',
    width: 68,
  },
  pinCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pinLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  trackLine: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFilled: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  scooterMarker: {
    position: 'absolute',
    top: -12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
  },
  simulateBtnText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '800',
  },
  riderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  riderAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 12,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  riderVehicle: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 2,
  },
  riderRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  riderRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  vaccinatedBadge: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timelineHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepDotCurrent: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
    transform: [{ scale: 1.15 }],
  },
  stepConnector: {
    width: 2,
    height: 34,
    backgroundColor: '#E5E7EB',
  },
  stepConnectorDone: {
    backgroundColor: '#10B981',
  },
  timelineRightCol: {
    flex: 1,
    paddingBottom: 20,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  stepLabelDone: {
    color: '#111827',
    fontWeight: '700',
  },
  stepLabelCurrent: {
    color: '#2563EB',
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  itemsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemWeight: {
    fontSize: 11,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  billTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  addressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
