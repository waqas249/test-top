import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOrders } from '../contexts/OrderContext';
import { Order } from '../types';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';

const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const { orders, updateOrderStatus } = useOrders();

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Order Not Found</Text>
        </View>
      </View>
    );
  }

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-GB')} at ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const getStatusActions = () => {
    switch (order.status) {
      case 'New':
        return [
          {
            title: 'Start Preparing',
            onPress: () => handleStatusUpdate('Preparing'),
            variant: 'warning' as const,
          },
        ];
      case 'Preparing':
        return [
          {
            title: 'Mark as Ready',
            onPress: () => handleStatusUpdate('Ready'),
            variant: 'success' as const,
          },
        ];
      case 'Ready':
        return [];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.tableNumber}>Table {order.table_number}</Text>
              <Text style={styles.orderDateTime}>
                Ordered on {formatDateTime(order.created_at)}
              </Text>
              {order.updated_at !== order.created_at && (
                <Text style={styles.updatedDateTime}>
                  Last updated: {formatDateTime(order.updated_at)}
                </Text>
              )}
            </View>
            <StatusBadge status={order.status} size="large" />
          </View>

          {order.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesTitle}>Order Notes:</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {order.order_items && order.order_items.length > 0 ? (
            <>
              {order.order_items.map((item, index) => (
                <View key={index} style={styles.orderItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.menu_item?.name}</Text>
                    <Text style={styles.itemPrice}>
                      £{item.item_price.toFixed(2)} each
                    </Text>
                    {item.notes && (
                      <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                    )}
                  </View>
                  <View style={styles.itemQuantity}>
                    <Text style={styles.quantityText}>×{item.quantity}</Text>
                    <Text style={styles.itemTotal}>
                      £{(item.item_price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
              
              <View style={styles.totalSection}>
                <Text style={styles.totalText}>
                  Total: {formatCurrency(order.total_amount)}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.noItems}>No items found</Text>
          )}
        </Card>

        {statusActions.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsContainer}>
              {statusActions.map((action, index) => (
                <Button
                  key={index}
                  title={action.title}
                  onPress={action.onPress}
                  variant={action.variant}
                  size="large"
                  style={[styles.actionButton, index > 0 && styles.actionButtonSpacing]}
                />
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
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
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginRight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tableNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderDateTime: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  updatedDateTime: {
    fontSize: 14,
    color: '#999999',
    marginTop: 2,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#8B4513',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
    marginTop: 4,
  },
  itemQuantity: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 4,
  },
  noItems: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 32,
  },
  totalSection: {
    borderTopWidth: 2,
    borderTopColor: '#FF6B35',
    paddingTop: 16,
    marginTop: 8,
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
  },
  actionButtonSpacing: {
    marginLeft: 12,
  },
});

export default OrderDetailScreen;