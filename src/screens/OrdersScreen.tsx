import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Order } from '../types';

export const OrdersScreen: React.FC = () => {
  const { ordersHistory, activeOrder, setActiveTab, showToast, addToCart } = useApp();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Combine active order and history
  const allOrders = [...(activeOrder ? [activeOrder] : []), ...ordersHistory.filter((o) => o.id !== activeOrder?.id)];

  const filteredOrders = allOrders.filter((order) => {
    if (filter === 'ACTIVE') {
      return order.status !== 'DELIVERED' && order.status !== 'Delivered' && order.status !== 'Cancelled';
    }
    if (filter === 'COMPLETED') {
      return order.status === 'DELIVERED' || order.status === 'Delivered' || order.status === 'Cancelled';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DELIVERED')) {
      return { bg: '#ECFDF5', text: '#065F46', icon: 'checkmark-circle' };
    }
    if (s.includes('CANCEL')) {
      return { bg: '#FEF2F2', text: '#B91C1C', icon: 'close-circle' };
    }
    if (s.includes('OUT_FOR_DELIVERY') || s.includes('OUT FOR DELIVERY')) {
      return { bg: '#EFF6FF', text: '#1D4ED8', icon: 'bicycle' };
    }
    if (s.includes('CONFIRM') || s.includes('PLACED') || s.includes('PACKING') || s.includes('PREPARING')) {
      return { bg: '#FFFBEB', text: '#B45309', icon: 'time' };
    }
    return { bg: '#F3F4F6', text: '#374151', icon: 'ellipse' };
  };

  const handleReorder = (order: Order) => {
    let count = 0;
    order.items.forEach((item) => {
      addToCart(item.product);
      count++;
    });
    showToast(`Added ${count} items from ${order.id} to cart!`);
    setActiveTab('cart');
  };

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>
          Track live deliveries and view past grocery purchases
        </Text>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === tab && styles.filterChipTextActive,
                ]}
              >
                {tab === 'ALL' ? 'All Orders' : tab === 'ACTIVE' ? 'Live / Active' : 'Completed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={44} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't placed any grocery orders yet. Fresh produce and daily essentials are just a tap away!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => setActiveTab('home')}
            >
              <Text style={styles.browseButtonText}>Start Shopping</Text>
              <Ionicons name="cart" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isLive = order.status !== 'DELIVERED' && order.status !== 'Delivered' && order.status !== 'Cancelled';

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Top Row: Order ID & Status */}
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={14} color={badge.text} />
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                      {order.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {/* Items Summary Preview */}
                <View style={styles.itemsPreview}>
                  <Text style={styles.itemSummaryText} numberOfLines={2}>
                    {order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(' • ')}
                  </Text>
                </View>

                {/* Bottom Row: Total & Actions */}
                <View style={styles.orderCardFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₹{order.total.toFixed(0)}</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    {isLive && (
                      <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => setActiveTab('tracking')}
                      >
                        <Ionicons name="navigate" size={14} color="#FFFFFF" />
                        <Text style={styles.trackButtonText}>Track Live</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => setSelectedOrder(order)}
                    >
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.reorderButton}
                      onPress={() => handleReorder(order)}
                    >
                      <Ionicons name="repeat" size={14} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalOrderTitle}>{selectedOrder.id}</Text>
                    <Text style={styles.modalDate}>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                    <Ionicons name="close-circle" size={26} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Items Ordered</Text>
                    {selectedOrder.items.map((item, idx) => (
                      <View key={idx} style={styles.modalItemRow}>
                        <Image source={{ uri: item.product.image }} style={styles.modalItemThumb} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalItemName}>{item.product.name}</Text>
                          <Text style={styles.modalItemQty}>
                            {item.quantity} x ₹{item.product.price} ({item.product.weightOrSize})
                          </Text>
                        </View>
                        <Text style={styles.modalItemTotal}>
                          ₹{(item.quantity * item.product.price)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Delivery Details</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={16} color="#6B7280" />
                      <Text style={styles.infoText}>{selectedOrder.deliveryAddress}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Ionicons name="card-outline" size={16} color="#6B7280" />
                      <Text style={styles.infoText}>Paid via {selectedOrder.paymentMethod}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Bill Summary</Text>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Subtotal</Text>
                      <Text style={styles.billValue}>₹{selectedOrder.subtotal?.toFixed(0) || selectedOrder.total.toFixed(0)}</Text>
                    </View>
                    <View style={styles.billRow}>
                      <Text style={styles.billLabel}>Delivery Fee</Text>
                      <Text style={styles.billValue}>₹{selectedOrder.deliveryFee?.toFixed(0) || '0'}</Text>
                    </View>
                    <View style={[styles.billRow, styles.billRowTotal]}>
                      <Text style={styles.billTotalLabel}>Order Total</Text>
                      <Text style={styles.billTotalValue}>₹{selectedOrder.total.toFixed(0)}</Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedOrder(null)}
                >
                  <Text style={styles.modalCloseButtonText}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#065F46',
  },
  listContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  orderDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemsPreview: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemSummaryText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  reorderButton: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOrderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalScroll: {
    maxHeight: 380,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  modalItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalItemQty: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  modalItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  billValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  billRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 4,
  },
  billTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  billTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  modalCloseButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

