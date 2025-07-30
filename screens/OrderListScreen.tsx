import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useOrders } from '../contexts/OrderContext';
import { Order } from '../types';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';

const OrderListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { orders, loading, refreshOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'All'>('All');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const OrderItem: React.FC<{ order: Order }> = ({ order }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <Card style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.tableNumber}>Table {order.table_number}</Text>
            <Text style={styles.orderDateTime}>{formatDateTime(order.created_at)}</Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        <Text style={styles.orderTotal}>{formatCurrency(order.total_amount)}</Text>

        {order.order_items && order.order_items.length > 0 && (
          <View style={styles.itemsPreview}>
            <Text style={styles.itemsCount}>
              {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.firstItem}>
              {order.order_items[0].menu_item?.name}
              {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
            </Text>
          </View>
        )}

        {order.notes && (
          <Text style={styles.orderNotes}>Note: {order.notes}</Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Orders</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['All', 'New', 'Preparing', 'Ready'] as const).map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.activeFilterButton,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === status && styles.activeFilterButtonText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <OrderItem order={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {statusFilter === 'All' ? 'No orders found' : `No ${statusFilter.toLowerCase()} orders`}
            </Text>
          </Card>
        }
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  activeFilterButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderDateTime: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  itemsPreview: {
    marginBottom: 8,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  firstItem: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  orderNotes: {
    fontSize: 14,
    color: '#8B4513',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
  },
});

export default OrderListScreen;