import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrderContext';
import Card from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { Order } from '../types';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { orders, loading, refreshOrders, updateOrderStatus } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const getOrdersByStatus = () => {
    return {
      new: orders.filter(order => order.status === 'New'),
      preparing: orders.filter(order => order.status === 'Preparing'),
      ready: orders.filter(order => order.status === 'Ready'),
    };
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toFixed(2)}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.tableNumber}>Table {order.table_number}</Text>
          <Text style={styles.orderTime}>{formatTime(order.created_at)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <Text style={styles.orderTotal}>{formatCurrency(order.total_amount)}</Text>
      
      {order.order_items && order.order_items.length > 0 && (
        <View style={styles.itemsList}>
          {order.order_items.slice(0, 3).map((item, index) => (
            <Text key={index} style={styles.itemText}>
              {item.quantity}x {item.menu_item?.name}
            </Text>
          ))}
          {order.order_items.length > 3 && (
            <Text style={styles.moreItems}>
              +{order.order_items.length - 3} more items
            </Text>
          )}
        </View>
      )}

      <View style={styles.orderActions}>
        {order.status === 'New' && (
          <Button
            title="Start Preparing"
            onPress={() => handleStatusUpdate(order.id, 'Preparing')}
            variant="warning"
            size="small"
            style={styles.actionButton}
          />
        )}
        {order.status === 'Preparing' && (
          <Button
            title="Mark Ready"
            onPress={() => handleStatusUpdate(order.id, 'Ready')}
            variant="success"
            size="small"
            style={styles.actionButton}
          />
        )}
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const ordersByStatus = getOrdersByStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.branchName}>
          {user?.branch?.name} - {user?.branch?.location}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{ordersByStatus.new.length}</Text>
            <Text style={styles.statLabel}>New Orders</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{ordersByStatus.preparing.length}</Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{ordersByStatus.ready.length}</Text>
            <Text style={styles.statLabel}>Ready</Text>
          </Card>
        </View>

        <View style={styles.sectionsContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Orders</Text>
            {ordersByStatus.new.length > 0 ? (
              ordersByStatus.new.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <Card>
                <Text style={styles.emptyText}>No new orders</Text>
              </Card>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preparing</Text>
            {ordersByStatus.preparing.length > 0 ? (
              ordersByStatus.preparing.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <Card>
                <Text style={styles.emptyText}>No orders being prepared</Text>
              </Card>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ready</Text>
            {ordersByStatus.ready.length > 0 ? (
              ordersByStatus.ready.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <Card>
                <Text style={styles.emptyText}>No orders ready</Text>
              </Card>
            )}
          </View>
        </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  branchName: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    padding: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  sectionsContainer: {
    flexDirection: 'row',
  },
  section: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderTime: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  itemsList: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  detailsButtonText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;