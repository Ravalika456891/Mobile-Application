import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Icon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { Product, CategoryId, Category, Order, OrderStage } from '../types';
import { getUsersDB, LocalUser } from '../services/database';

export const AdminDashboardScreen: React.FC = () => {
  const {
    products,
    categories,
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
    setIsAdminMode,
    logout,
    currentUser,
    showToast,
    deliveryZones,
    checkPincodeServiceability,
    inventoryReport,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpi' | 'categories' | 'products' | 'orders' | 'zones' | 'users'>('kpi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [stockOnlyFilter, setStockOnlyFilter] = useState<boolean>(false);
  const [lowStockFilter, setLowStockFilter] = useState<boolean>(false);

  // Delivery Zone test state
  const [testPincode, setTestPincode] = useState('');
  const [testPincodeResult, setTestPincodeResult] = useState<string | null>(null);

  // Category Management States
  const [addCatModalVisible, setAddCatModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatBadge, setNewCatBadge] = useState('');
  const [newCatColor, setNewCatColor] = useState('#10B981');
  const [newCatSubcats, setNewCatSubcats] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [editCatModalVisible, setEditCatModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatBadge, setEditCatBadge] = useState('');
  const [editCatColor, setEditCatColor] = useState('#10B981');
  const [editCatDesc, setEditCatDesc] = useState('');

  const [subcatModalVisible, setSubcatModalVisible] = useState(false);
  const [managingCat, setManagingCat] = useState<Category | null>(null);
  const [newSubcatInput, setNewSubcatInput] = useState('');

  // Edit Product Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editStockCount, setEditStockCount] = useState('');
  const [editWeight, setEditWeight] = useState('');

  // Add Product Modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('vegetables');
  const [newSubcategory, setNewSubcategory] = useState('Fresh Produce');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newWeight, setNewWeight] = useState('500 g');
  const [newStockCount, setNewStockCount] = useState('50');
  const [newDescription, setNewDescription] = useState('');

  // Users List
  const [usersList, setUsersList] = useState<LocalUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Order Filter
  const [orderFilter, setOrderFilter] = useState<string>('all');

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const u = await getUsersDB();
      setUsersList(u);
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditPrice(String(product.price));
    setEditOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setEditStockCount(String(product.stockCount));
    setEditWeight(product.weightOrSize);
    setEditModalVisible(true);
  };

  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid selling price.');
      return;
    }
    const stockNum = parseInt(editStockCount, 10);
    const origPriceNum = editOriginalPrice ? parseFloat(editOriginalPrice) : undefined;

    updateProduct(editingProduct.id, {
      price: priceNum,
      originalPrice: origPriceNum,
      stockCount: isNaN(stockNum) ? 0 : stockNum,
      inStock: isNaN(stockNum) ? false : stockNum > 0,
      weightOrSize: editWeight.trim() || editingProduct.weightOrSize,
    });

    setEditModalVisible(false);
    setEditingProduct(null);
  };

  // Save New Product
  const handleCreateProduct = () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter the product name.');
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }
    const stockNum = parseInt(newStockCount, 10) || 50;
    const origPriceNum = newOriginalPrice ? parseFloat(newOriginalPrice) : priceNum + 20;

    const newProd: Product = {
      id: `adm-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      subcategory: newSubcategory.trim() || 'Everyday Essentials',
      price: priceNum,
      originalPrice: origPriceNum,
      weightOrSize: newWeight.trim() || '500 g',
      rating: 4.8,
      reviewsCount: 12,
      deliveryTimeMins: 10,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
      inStock: stockNum > 0,
      stockCount: stockNum,
      description: newDescription.trim() || `Fresh quality ${newName.trim()} delivered instantly.`,
      isVeg: true,
    };

    addProduct(newProd);
    setAddModalVisible(false);
    setNewName('');
    setNewPrice('');
    setNewOriginalPrice('');
    setNewDescription('');
  };

  // Category Management Handlers
  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }
    const id = (newCatId.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-')) as CategoryId;
    const subcats = newCatSubcats
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCategoryObj: Category = {
      id,
      name: newCatName.trim(),
      icon: 'grid-outline',
      badge: newCatBadge.trim() || undefined,
      color: newCatColor || '#10B981',
      description: newCatDesc.trim() || `Shop fresh ${newCatName.trim()} delivered in minutes.`,
      subcategories: subcats.length > 0 ? subcats : ['General'],
    };

    addCategory(newCategoryObj);
    setAddCatModalVisible(false);
    setNewCatName('');
    setNewCatId('');
    setNewCatBadge('');
    setNewCatSubcats('');
    setNewCatDesc('');
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatBadge(cat.badge || '');
    setEditCatColor(cat.color || '#10B981');
    setEditCatDesc(cat.description || '');
    setEditCatModalVisible(true);
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;
    if (!editCatName.trim()) {
      Alert.alert('Required', 'Category name cannot be empty.');
      return;
    }
    updateCategory(editingCategory.id, {
      name: editCatName.trim(),
      badge: editCatBadge.trim() || undefined,
      color: editCatColor,
      description: editCatDesc.trim(),
    });
    setEditCatModalVisible(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"? Products in this category may be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ]
    );
  };

  const handleOpenSubcats = (cat: Category) => {
    setManagingCat(cat);
    setNewSubcatInput('');
    setSubcatModalVisible(true);
  };

  const handleAddSubcatToManaging = () => {
    if (!managingCat || !newSubcatInput.trim()) return;
    addSubcategory(managingCat.id, newSubcatInput.trim());
    setManagingCat((prev) =>
      prev ? { ...prev, subcategories: [...(prev.subcategories || []), newSubcatInput.trim()] } : null
    );
    setNewSubcatInput('');
  };

  const handleDeleteSubcatFromManaging = (sub: string) => {
    if (!managingCat) return;
    deleteSubcategory(managingCat.id, sub);
    setManagingCat((prev) =>
      prev
        ? {
            ...prev,
            subcategories: (prev.subcategories || []).filter((s) => s !== sub),
          }
        : null
    );
  };

  const handleDeleteProductPrompt = (prod: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${prod.name}" from the store catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(prod.id),
        },
      ]
    );
  };

  // KPI calculations
  const totalRevenue = ordersList.reduce((sum, o) => sum + o.total, 0) + 18450;
  const outOfStockCount = products.filter((p) => !p.inStock || p.stockCount === 0).length;
  const lowStockCount = products.filter((p) => p.stockCount <= 10 || !p.inStock).length;
  const inStockCount = products.length - outOfStockCount;

  const displayCategories = (categories && categories.length > 0 ? categories : []).filter(
    (c) => c.id !== 'all'
  );

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat =
      selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    const matchStock = stockOnlyFilter ? !p.inStock || p.stockCount === 0 : true;
    const matchLowStock = lowStockFilter ? p.stockCount <= 10 || !p.inStock : true;
    return matchQuery && matchCat && matchStock && matchLowStock;
  });

  // Filtered Orders
  const filteredOrders = ordersList.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const getNextStage = (current: OrderStage): OrderStage | null => {
    switch (current) {
      case 'CONFIRMED':
        return 'PACKING';
      case 'PACKING':
        return 'RIDER_ASSIGNED';
      case 'RIDER_ASSIGNED':
        return 'OUT_FOR_DELIVERY';
      case 'OUT_FOR_DELIVERY':
        return 'DELIVERED';
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Admin Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.adminBadgeRow}>
          <View style={styles.shieldIconWrapper}>
            <Icon name="shield-checkmark" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>QuickMart Admin Hub</Text>
            <Text style={styles.headerSubtitle}>
              Store Manager: {currentUser?.name || 'Administrator'} 🟢 Live
            </Text>
          </View>
        </View>

        <View style={styles.topHeaderButtons}>
          <TouchableOpacity
            style={styles.storeViewBtn}
            onPress={() => {
              setIsAdminMode(false);
              showToast('Switched to Customer Store View 🛒');
            }}
            activeOpacity={0.8}
          >
            <Icon name="cart-outline" size={16} color="#059669" />
            <Text style={styles.storeViewBtnText}>Store View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert('Log Out Admin', 'Are you sure you want to log out of the admin portal?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: async () => {
                    await logout();
                  },
                },
              ]);
            }}
            activeOpacity={0.8}
          >
            <Icon name="log-out-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Admin Navigation Tabs */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'kpi' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('kpi')}
        >
          <Icon name="flash" size={15} color={activeTab === 'kpi' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabNavText, activeTab === 'kpi' && styles.tabNavTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'categories' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('categories')}
        >
          <Icon name="grid-outline" size={15} color={activeTab === 'categories' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabNavText, activeTab === 'categories' && styles.tabNavTextActive]}>
            Categories ({displayCategories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'products' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('products')}
        >
          <Icon name="cube" size={15} color={activeTab === 'products' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabNavText, activeTab === 'products' && styles.tabNavTextActive]}>
            Inventory ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'orders' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Icon name="bicycle" size={15} color={activeTab === 'orders' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabNavText, activeTab === 'orders' && styles.tabNavTextActive]}>
            Orders ({ordersList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'zones' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('zones')}
        >
          <Icon name="location-outline" size={15} color={activeTab === 'zones' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabNavText, activeTab === 'zones' && styles.tabNavTextActive]}>
            Delivery Zones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'users' && styles.tabNavBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Icon name="person" size={15} color={activeTab === 'users' ? '#059669' : '#6B7280'} />
          <Text style={[styles.tabNavText, activeTab === 'users' && styles.tabNavTextActive]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB CONTENT */}
      {activeTab === 'kpi' && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          {/* KPI Cards Grid */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { borderLeftColor: '#10B981' }]}>
              <View style={styles.kpiIconBoxGreen}>
                <Text style={styles.kpiCurrencySymbol}>₹</Text>
              </View>
              <Text style={styles.kpiLabel}>Total Revenue</Text>
              <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
              <Text style={styles.kpiSubtext}>+18.4% today</Text>
            </View>

            <View style={[styles.kpiCard, { borderLeftColor: '#3B82F6' }]}>
              <View style={styles.kpiIconBoxBlue}>
                <Icon name="cube" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.kpiLabel}>Total Catalog Items</Text>
              <Text style={styles.kpiValue}>{products.length}</Text>
              <Text style={styles.kpiSubtext}>{inStockCount} active in stock</Text>
            </View>

            <View style={[styles.kpiCard, { borderLeftColor: '#F59E0B' }]}>
              <View style={styles.kpiIconBoxYellow}>
                <Icon name="bicycle" size={18} color="#D97706" />
              </View>
              <Text style={styles.kpiLabel}>Active Orders</Text>
              <Text style={styles.kpiValue}>{ordersList.length}</Text>
              <Text style={styles.kpiSubtext}>100% 10-min target</Text>
            </View>

            <View style={[styles.kpiCard, { borderLeftColor: outOfStockCount > 0 ? '#EF4444' : '#10B981' }]}>
              <View style={styles.kpiIconBoxRed}>
                <Icon name="alert-circle" size={18} color="#EF4444" />
              </View>
              <Text style={styles.kpiLabel}>Out of Stock</Text>
              <Text style={[styles.kpiValue, { color: outOfStockCount > 0 ? '#DC2626' : '#10B981' }]}>
                {outOfStockCount}
              </Text>
              <TouchableOpacity onPress={() => {
                setActiveTab('products');
                setStockOnlyFilter(true);
              }}>
                <Text style={styles.kpiActionLink}>Review Items ›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActionCard}>
            <Text style={styles.cardHeaderTitle}>⚡ Admin Fast Actions</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.actionPillBtn}
                onPress={() => setAddModalVisible(true)}
              >
                <Icon name="add" size={16} color="#FFFFFF" />
                <Text style={styles.actionPillBtnText}>Add Product</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionPillBtn, { backgroundColor: '#3B82F6' }]}
                onPress={() => setActiveTab('orders')}
              >
                <Icon name="bicycle" size={16} color="#FFFFFF" />
                <Text style={styles.actionPillBtnText}>Dispatch Orders</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionPillBtn, { backgroundColor: '#8B5CF6' }]}
                onPress={() => {
                  setActiveTab('products');
                  setSelectedCategoryFilter('vegetables');
                }}
              >
                <Icon name="leaf" size={16} color="#FFFFFF" />
                <Text style={styles.actionPillBtnText}>Vegetables (60)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Store Health & Category Stats */}
          <View style={styles.infoCard}>
            <Text style={styles.cardHeaderTitle}>📊 Catalog Category Health</Text>
            <View style={styles.healthRow}>
              <Text style={styles.healthCategory}>🥕 Fresh Vegetables</Text>
              <Text style={styles.healthCount}>60 Products</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthCategory}>🍎 Popular Fruits</Text>
              <Text style={styles.healthCount}>18 Products</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthCategory}>🥛 Dairy, Bread & Eggs</Text>
              <Text style={styles.healthCount}>14 Products</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthCategory}>🌾 Rice, Atta & Grains</Text>
              <Text style={styles.healthCount}>12 Products</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* TAB: CATEGORIES & SUBCATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <View style={{ flex: 1 }}>
          <View style={styles.productSearchBox}>
            <View style={styles.searchInputWrapper}>
              <Icon name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search categories..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.addNewProdHeaderBtn}
              onPress={() => setAddCatModalVisible(true)}
              activeOpacity={0.8}
            >
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addNewProdHeaderText}>Add Category</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultsCount}>
              Managing {displayCategories.length} Main Categories
            </Text>

            {displayCategories
              .filter(
                (c) =>
                  !searchQuery ||
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.id.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((cat) => {
                const catProdCount = products.filter((p) => p.category === cat.id).length;
                return (
                  <View key={cat.id} style={styles.categoryManageCard}>
                    <View style={styles.catManageHeader}>
                      <View style={[styles.catManageIconCircle, { backgroundColor: cat.color || '#10B981' }]}>
                        <Icon name={cat.icon || 'grid-outline'} size={20} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.catManageTitle}>{cat.name}</Text>
                          {cat.badge && (
                            <View style={styles.catManageBadge}>
                              <Text style={styles.catManageBadgeText}>{cat.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.catManageSub}>
                          ID: {cat.id} • {catProdCount} Products • {cat.subcategories?.length || 0} Subcategories
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          style={styles.catEditBtn}
                          onPress={() => handleOpenEditCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.catEditBtnText}>Edit ✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.catDeleteBtn}
                          onPress={() => handleDeleteCategory(cat)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.catDeleteBtnText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Subcategories chips & manager */}
                    <View style={styles.catSubcategoriesRow}>
                      <Text style={styles.subcatsLabel}>Subcategories ({cat.subcategories?.length || 0}):</Text>
                      <View style={styles.subcatsChipsWrap}>
                        {(cat.subcategories || []).map((sub) => (
                          <View key={sub} style={styles.subcatChip}>
                            <Text style={styles.subcatChipText}>{sub}</Text>
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={styles.manageSubcatsBtn}
                        onPress={() => handleOpenSubcats(cat)}
                        activeOpacity={0.8}
                      >
                        <Icon name="pencil" size={12} color="#059669" />
                        <Text style={styles.manageSubcatsBtnText}>Manage Subcategories</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB: PRODUCTS & INVENTORY */}
      {activeTab === 'products' && (
        <View style={{ flex: 1 }}>
          {/* Search & Filter Header */}
          <View style={styles.productSearchBox}>
            <View style={styles.searchInputWrapper}>
              <Icon name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchTextInput}
                placeholder="Search products to manage..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.addNewProdHeaderBtn}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.8}
            >
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addNewProdHeaderText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFiltersScroll}
          >
            {[
              { id: 'all', label: 'All Items' },
              ...displayCategories.map((c) => ({
                id: c.id,
                label: `${c.name} (${products.filter((p) => p.category === c.id).length})`,
              })),
            ].map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterPill,
                  selectedCategoryFilter === cat.id && styles.filterPillActive,
                ]}
                onPress={() => {
                  setSelectedCategoryFilter(cat.id);
                  setStockOnlyFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selectedCategoryFilter === cat.id && styles.filterPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.filterPill,
                stockOnlyFilter && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
              ]}
              onPress={() => {
                setStockOnlyFilter(!stockOnlyFilter);
                if (!stockOnlyFilter) setLowStockFilter(false);
              }}
            >
              <Text
                style={[
                  styles.filterPillText,
                  stockOnlyFilter && { color: '#DC2626', fontWeight: '700' },
                ]}
              >
                ⚠️ Out of Stock ({outOfStockCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                lowStockFilter && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
              ]}
              onPress={() => {
                setLowStockFilter(!lowStockFilter);
                if (!lowStockFilter) setStockOnlyFilter(false);
              }}
            >
              <Text
                style={[
                  styles.filterPillText,
                  lowStockFilter && { color: '#B45309', fontWeight: '700' },
                ]}
              >
                🔔 Low Stock &lt;10 ({lowStockCount})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Product Items List */}
          <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultsCount}>
              Showing {filteredProducts.length} products
            </Text>

            {filteredProducts.map((prod) => (
              <View key={prod.id} style={styles.productRowCard}>
                <Image
                  source={{ uri: prod.image }}
                  style={styles.prodThumb}
                  defaultSource={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100' }}
                />

                <View style={styles.prodRowInfo}>
                  <Text style={styles.prodRowName} numberOfLines={1}>
                    {prod.name}
                  </Text>
                  <Text style={styles.prodRowSub}>
                    {prod.subcategory} • {prod.weightOrSize}
                  </Text>

                  <View style={styles.prodPriceStockRow}>
                    <Text style={styles.prodRowPrice}>₹{prod.price}</Text>
                    {prod.originalPrice ? (
                      <Text style={styles.prodRowOrigPrice}>₹{prod.originalPrice}</Text>
                    ) : null}

                    <View
                      style={[
                        styles.stockBadge,
                        prod.inStock ? styles.stockBadgeIn : styles.stockBadgeOut,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stockBadgeText,
                          prod.inStock ? styles.stockTextIn : styles.stockTextOut,
                        ]}
                      >
                        {prod.inStock ? `In Stock (${prod.stockCount || 20})` : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Quick Stock, Edit, and Delete Buttons */}
                <View style={styles.prodActionsCol}>
                  <TouchableOpacity
                    style={[
                      styles.quickStockBtn,
                      prod.inStock ? styles.stockBtnOut : styles.stockBtnIn,
                    ]}
                    onPress={() => toggleProductStock(prod.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.quickStockBtnText,
                        prod.inStock ? { color: '#DC2626' } : { color: '#059669' },
                      ]}
                    >
                      {prod.inStock ? 'Mark OOS' : 'Make In Stock'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editPriceBtn}
                    onPress={() => handleOpenEdit(prod)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editPriceBtnText}>Edit ✏️</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.editPriceBtn, { backgroundColor: '#FEE2E2', marginTop: 4 }]}
                    onPress={() => handleDeleteProductPrompt(prod)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.editPriceBtnText, { color: '#DC2626' }]}>Delete 🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <View style={{ flex: 1 }}>
          {/* Order Status Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFiltersScroll}
          >
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'CONFIRMED', label: 'Confirmed' },
              { id: 'PACKING', label: 'Packing' },
              { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
              { id: 'DELIVERED', label: 'Delivered' },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterPill, orderFilter === f.id && styles.filterPillActive]}
                onPress={() => setOrderFilter(f.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    orderFilter === f.id && styles.filterPillTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.ordersScroll} showsVerticalScrollIndicator={false}>
            {filteredOrders.length === 0 ? (
              <View style={styles.emptyOrdersBox}>
                <Icon name="bicycle" size={40} color="#9CA3AF" />
                <Text style={styles.emptyOrdersTitle}>No orders in this status</Text>
              </View>
            ) : (
              filteredOrders.map((ord) => {
                const next = getNextStage((ord.stage || ord.status) as OrderStage);
                return (
                  <View key={ord.id} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View>
                        <Text style={styles.orderCardId}>{ord.id}</Text>
                        <Text style={styles.orderCardDate}>
                          {new Date(ord.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} • {ord.paymentMethod}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.orderStatusBadge,
                          ord.status === 'DELIVERED'
                            ? styles.statusDelivered
                            : styles.statusLive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.orderStatusBadgeText,
                            ord.status === 'DELIVERED'
                              ? { color: '#059669' }
                              : { color: '#D97706' },
                          ]}
                        >
                          {ord.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.orderAddressText} numberOfLines={1}>
                      📍 {ord.deliveryAddress}
                    </Text>

                    {/* Items mini list */}
                    <View style={styles.orderItemsBox}>
                      {ord.items.map((item, idx) => (
                        <Text key={idx} style={styles.orderItemRow}>
                          • {item.quantity}x {item.product.name} (₹{item.product.price})
                        </Text>
                      ))}
                    </View>

                    <View style={styles.orderFooterRow}>
                      <Text style={styles.orderTotalText}>Total: ₹{ord.total}</Text>

                      {next ? (
                        <TouchableOpacity
                          style={styles.advanceStatusBtn}
                          onPress={() => updateOrderStatus(ord.id, next)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.advanceStatusBtnText}>
                            Advance to {next.replace(/_/g, ' ')} ›
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>Completed ✅</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      )}

      {/* TAB: USERS & ACCOUNTS */}
      {activeTab === 'users' && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.cardHeaderTitle}>👥 Registered Accounts ({usersList.length})</Text>

          {loadingUsers ? (
            <ActivityIndicator style={{ marginTop: 30 }} color="#059669" />
          ) : (
            usersList.map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userAvatarBox}>
                  <Text style={styles.userAvatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.userNameText}>{u.name}</Text>
                    {u.role === 'admin' && (
                      <View style={styles.adminRoleTag}>
                        <Text style={styles.adminRoleTagText}>Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userMobileText}>📱 +91 {u.mobile}</Text>
                  {u.email && <Text style={styles.userEmailText}>✉️ {u.email}</Text>}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* TAB: DELIVERY ZONES & PINCODES */}
      {activeTab === 'zones' && (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.cardHeaderTitle}>📍 Serviceable Delivery Zones ({deliveryZones.length})</Text>

          {/* Live Pincode Serviceability Tester */}
          <View style={styles.testerCard}>
            <Text style={styles.testerTitle}>🔍 Test PIN Code Serviceability & Routing</Text>
            <Text style={styles.testerSubtitle}>
              Check real-time fulfillment route, SLA and estimated delivery time for any Indian PIN code
            </Text>
            <View style={styles.testerInputRow}>
              <TextInput
                style={styles.testerInput}
                placeholder="Enter 6-digit PIN Code (e.g. 560001, 560100)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={6}
                value={testPincode}
                onChangeText={(t) => {
                  setTestPincode(t);
                  setTestPincodeResult(null);
                }}
              />
              <TouchableOpacity
                style={styles.testerBtn}
                onPress={async () => {
                  if (!testPincode.trim() || testPincode.trim().length < 6) {
                    Alert.alert('Invalid PIN', 'Enter a 6-digit PIN code.');
                    return;
                  }
                  const res = await checkPincodeServiceability(testPincode.trim());
                  setTestPincodeResult(res.message);
                }}
              >
                <Text style={styles.testerBtnText}>Verify</Text>
              </TouchableOpacity>
            </View>
            {testPincodeResult && (
              <View style={styles.testerResultBox}>
                <Icon name="information-circle" size={16} color="#059669" />
                <Text style={styles.testerResultText}>{testPincodeResult}</Text>
              </View>
            )}
          </View>

          {/* Zones List */}
          {deliveryZones.map((z, idx) => {
            const pinList = z.pincodes && z.pincodes.length > 0 ? z.pincodes : [z.pincode];
            return (
              <View key={z.id || z.pincode || idx} style={styles.zoneCard}>
                <View style={styles.zoneHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.zoneName}>{z.name || `${z.area} Zone`}</Text>
                    <Text style={styles.zoneDesc}>{z.description || `${z.city} fulfillment corridor`}</Text>
                  </View>
                  <View style={styles.zoneActiveBadge}>
                    <Text style={styles.zoneActiveBadgeText}>Active 🟢</Text>
                  </View>
                </View>

                <View style={styles.zoneMetaRow}>
                  <View style={styles.zoneMetaItem}>
                    <Icon name="flash" size={13} color="#059669" />
                    <Text style={styles.zoneMetaLabel}>SLA: {z.estimatedMinutes || z.deliveryTimeMins || 10} Mins</Text>
                  </View>
                  <View style={styles.zoneMetaItem}>
                    <Icon name="cash-outline" size={13} color="#2563EB" />
                    <Text style={styles.zoneMetaLabel}>Base Fee: ₹{z.deliveryFee || 25}</Text>
                  </View>
                  <View style={styles.zoneMetaItem}>
                    <Icon name="cube-outline" size={13} color="#7C3AED" />
                    <Text style={styles.zoneMetaLabel}>Min: ₹{z.minOrderAmount || 99}</Text>
                  </View>
                </View>

                <Text style={styles.pincodesSectionTitle}>
                  Serviceable PIN Codes ({pinList.length}):
                </Text>
                <View style={styles.pincodesWrap}>
                  {pinList.map((pin: string) => (
                    <View key={pin} style={styles.pincodeTag}>
                      <Text style={styles.pincodeTagText}>{pin}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* MODAL: EDIT PRODUCT */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalProdName}>{editingProduct?.name}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Selling Price (₹)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="Price"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Original Price (₹ MRP)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={editOriginalPrice}
                onChangeText={setEditOriginalPrice}
                placeholder="Original Price"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stock Quantity (Units)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={editStockCount}
                onChangeText={setEditStockCount}
                placeholder="Stock quantity"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight or Pack Size</Text>
              <TextInput
                style={styles.modalInput}
                value={editWeight}
                onChangeText={setEditWeight}
                placeholder="e.g. 500 g, 1 kg, 1 bunch"
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProductEdit}>
              <Text style={styles.saveBtnText}>Save Product Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD PRODUCT */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Grocery Item</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <Icon name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Item Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Organic Baby Spinach"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                  {displayCategories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.catPillBtn,
                        newCategory === c.id && styles.catPillBtnActive,
                      ]}
                      onPress={() => {
                        setNewCategory(c.id as CategoryId);
                        if (c.subcategories && c.subcategories.length > 0) {
                          setNewSubcategory(c.subcategories[0]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.catPillText,
                          newCategory === c.id && styles.catPillTextActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subcategory</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Fresh Vegetables"
                  value={newSubcategory}
                  onChangeText={setNewSubcategory}
                />
                {/* Quick subcategory suggestions */}
                {displayCategories.find((c) => c.id === newCategory)?.subcategories && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 6 }}>
                    {displayCategories
                      .find((c) => c.id === newCategory)
                      ?.subcategories?.map((sub) => (
                        <TouchableOpacity
                          key={sub}
                          style={[
                            styles.subcatChip,
                            newSubcategory === sub && { backgroundColor: '#D1FAE5', borderColor: '#10B981', borderWidth: 1 },
                          ]}
                          onPress={() => setNewSubcategory(sub)}
                        >
                          <Text style={[styles.subcatChipText, newSubcategory === sub && { color: '#065F46', fontWeight: '700' }]}>
                            {sub}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selling Price (₹) *</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="e.g. 45"
                  value={newPrice}
                  onChangeText={setNewPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Original Price (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="e.g. 60"
                  value={newOriginalPrice}
                  onChangeText={setNewOriginalPrice}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight or Unit</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 250 g, 1 bunch"
                  value={newWeight}
                  onChangeText={setNewWeight}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateProduct}>
                <Text style={styles.saveBtnText}>Add Product to Store</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL: ADD CATEGORY */}
      <Modal
        visible={addCatModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddCatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Category</Text>
                <TouchableOpacity onPress={() => setAddCatModalVisible(false)}>
                  <Icon name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Organic Health Foods"
                  value={newCatName}
                  onChangeText={setNewCatName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category ID (slug, optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. organic-health"
                  value={newCatId}
                  onChangeText={setNewCatId}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Badge Label (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Fresh, Organic, Hot, 10% Off"
                  value={newCatBadge}
                  onChangeText={setNewCatBadge}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Theme Color Hex</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="#10B981"
                  value={newCatColor}
                  onChangeText={setNewCatColor}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subcategories (comma separated)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Muesli, Super Seeds, Nuts"
                  value={newCatSubcats}
                  onChangeText={setNewCatSubcats}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Brief description of products in category"
                  value={newCatDesc}
                  onChangeText={setNewCatDesc}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateCategory}>
                <Text style={styles.saveBtnText}>Create Category</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL: EDIT CATEGORY */}
      <Modal
        visible={editCatModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditCatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Category</Text>
              <TouchableOpacity onPress={() => setEditCatModalVisible(false)}>
                <Icon name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={editCatName}
                onChangeText={setEditCatName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Badge Label</Text>
              <TextInput
                style={styles.modalInput}
                value={editCatBadge}
                onChangeText={setEditCatBadge}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Theme Color</Text>
              <TextInput
                style={styles.modalInput}
                value={editCatColor}
                onChangeText={setEditCatColor}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.modalInput}
                value={editCatDesc}
                onChangeText={setEditCatDesc}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCategoryEdit}>
              <Text style={styles.saveBtnText}>Save Category Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: MANAGE SUBCATEGORIES */}
      <Modal
        visible={subcatModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSubcatModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Subcategories for {managingCat?.name}</Text>
              <TouchableOpacity onPress={() => setSubcatModalVisible(false)}>
                <Icon name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>
              Existing Subcategories ({managingCat?.subcategories?.length || 0}):
            </Text>

            <ScrollView style={{ maxHeight: 180, marginBottom: 12 }}>
              {(managingCat?.subcategories || []).map((sub) => (
                <View
                  key={sub}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontSize: 13, color: '#111827', fontWeight: '500' }}>• {sub}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteSubcatFromManaging(sub)}
                    style={{ padding: 4 }}
                  >
                    <Icon name="close-circle" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <TextInput
                style={[styles.modalInput, { flex: 1 }]}
                placeholder="New subcategory name..."
                value={newSubcatInput}
                onChangeText={setNewSubcatInput}
              />
              <TouchableOpacity
                style={[styles.saveBtn, { marginTop: 0, paddingHorizontal: 14 }]}
                onPress={handleAddSubcatToManaging}
              >
                <Text style={styles.saveBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topHeader: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shieldIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 2,
  },
  topHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeViewBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeViewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 8,
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabNavBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabNavBtnActive: {
    borderColor: '#059669',
  },
  tabNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabNavTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconBoxGreen: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiCurrencySymbol: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  kpiIconBoxBlue: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIconBoxYellow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIconBoxRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  kpiSubtext: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
    fontWeight: '500',
  },
  kpiActionLink: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 4,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionPillBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionPillBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 30,
    elevation: 2,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  healthCategory: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  healthCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  productSearchBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    padding: 0,
  },
  addNewProdHeaderBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addNewProdHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryFiltersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterPillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  productsScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  resultsCount: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  productRowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
    gap: 10,
  },
  prodThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  prodRowInfo: {
    flex: 1,
  },
  prodRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  prodRowSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  prodPriceStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  prodRowPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  prodRowOrigPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadgeIn: {
    backgroundColor: '#D1FAE5',
  },
  stockBadgeOut: {
    backgroundColor: '#FEE2E2',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockTextIn: {
    color: '#059669',
  },
  stockTextOut: {
    color: '#DC2626',
  },
  prodActionsCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  quickStockBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  stockBtnIn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  stockBtnOut: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  quickStockBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  editPriceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editPriceBtnText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  ordersScroll: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderCardId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  orderCardDate: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusLive: {
    backgroundColor: '#FEF3C7',
  },
  statusDelivered: {
    backgroundColor: '#D1FAE5',
  },
  orderStatusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderAddressText: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 6,
  },
  orderItemsBox: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    marginVertical: 6,
  },
  orderItemRow: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  orderTotalText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  advanceStatusBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  advanceStatusBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  emptyOrdersBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyOrdersTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  userAvatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  adminRoleTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  adminRoleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  userMobileText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  userEmailText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScroll: {
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalProdName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  catPickerRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  catPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  catPillBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  catPillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  categoryManageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  catManageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catManageIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catManageTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  catManageBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catManageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  catManageSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  catEditBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catEditBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  catDeleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catDeleteBtnText: {
    fontSize: 11,
    color: '#DC2626',
  },
  catSubcategoriesRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subcatsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 6,
  },
  subcatsChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subcatChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subcatChipText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  manageSubcatsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  manageSubcatsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  testerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  testerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  testerInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testerInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
    color: '#0F172A',
  },
  testerBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  testerResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  testerResultText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  zoneDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  zoneActiveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  zoneActiveBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  zoneMetaRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginVertical: 8,
  },
  zoneMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoneMetaLabel: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  pincodesSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  pincodesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pincodeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pincodeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
});
