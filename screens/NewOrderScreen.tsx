import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMenu } from '../hooks/useMenu';
import { useOrders } from '../contexts/OrderContext';
import { CartItem, MenuItem } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const NewOrderScreen: React.FC = () => {
  const navigation = useNavigation();
  const { getMenuByCategory, loading } = useMenu();
  const { createOrder } = useOrders();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const menuByCategory = getMenuByCategory();
  const categories = Object.keys(menuByCategory);

  if (!selectedCategory && categories.length > 0) {
    setSelectedCategory(categories[0]);
  }

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menu_item.id === menuItem.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.menu_item.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menu_item: menuItem, quantity: 1 }]);
    }
  };

  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.menu_item.id !== menuItemId));
    } else {
      setCart(cart.map(item =>
        item.menu_item.id === menuItemId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menu_item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (!tableNumber.trim()) {
      Alert.alert('Error', 'Please enter a table number');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Please add items to your order');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        table_number: parseInt(tableNumber),
        order_items: cart.map(item => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
          item_price: item.menu_item.price,
          notes: item.notes,
        })),
        total_amount: getCartTotal(),
        notes: orderNotes.trim() || undefined,
      };

      const { data, error } = await createOrder(orderData);

      if (error) {
        Alert.alert('Error', 'Failed to create order');
        return;
      }

      Alert.alert('Success', 'Order created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setCart([]);
            setTableNumber('');
            setOrderNotes('');
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
    const cartItem = cart.find(cartItem => cartItem.menu_item.id === item.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <Card style={styles.menuItemCard}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
          <Text style={styles.menuItemPrice}>£{item.price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.quantityControls}>
          {quantity > 0 ? (
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartItemQuantity(item.id, quantity - 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateCartItemQuantity(item.id, quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Add"
              onPress={() => addToCart(item)}
              size="small"
              style={styles.addButton}
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Order</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <Card>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Table Number</Text>
              <TextInput
                style={styles.input}
                value={tableNumber}
                onChangeText={setTableNumber}
                placeholder="Enter table number"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Order Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={orderNotes}
                onChangeText={setOrderNotes}
                placeholder="Special instructions..."
                multiline
                numberOfLines={3}
              />
            </View>
          </Card>

          <Card style={styles.cartCard}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cart.length > 0 ? (
              <>
                <ScrollView style={styles.cartItems}>
                  {cart.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>{item.menu_item.name}</Text>
                        <Text style={styles.cartItemPrice}>
                          {item.quantity} × £{item.menu_item.price.toFixed(2)} = £{(item.quantity * item.menu_item.price).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.cartItemControls}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateCartItemQuantity(item.menu_item.id, item.quantity - 1)}
                        >
                          <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => updateCartItemQuantity(item.menu_item.id, item.quantity + 1)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.cartTotal}>
                  <Text style={styles.totalText}>Total: £{getCartTotal().toFixed(2)}</Text>
                </View>
                <Button
                  title={isSubmitting ? "Creating Order..." : "Create Order"}
                  onPress={handleSubmitOrder}
                  disabled={isSubmitting}
                  size="large"
                />
              </>
            ) : (
              <Text style={styles.emptyCart}>No items in cart</Text>
            )}
          </Card>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.categoryTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category && styles.activeCategoryTab,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedCategory === category && styles.activeCategoryTabText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.menuItems}>
            {menuByCategory[selectedCategory]?.map(item => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  leftPanel: {
    width: 400,
    marginRight: 16,
  },
  rightPanel: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cartCard: {
    marginTop: 16,
    flex: 1,
  },
  cartItems: {
    maxHeight: 300,
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartTotal: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#FF6B35',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
  },
  emptyCart: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 32,
  },
  categoryTabs: {
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  menuItems: {
    flex: 1,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: 8,
  },
  quantityControls: {
    alignItems: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FF6B35',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  addButton: {
    minWidth: 80,
  },
});

export default NewOrderScreen;