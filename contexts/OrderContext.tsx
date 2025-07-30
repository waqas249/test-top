import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  createOrder: (orderData: {
    table_number: number;
    order_items: { menu_item_id: string; quantity: number; item_price: number; notes?: string }[];
    total_amount: number;
    notes?: string;
  }) => Promise<{ data: Order | null; error: any }>;
}

const OrderContext = createContext<OrderContextType>({} as OrderContextType);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.branch_id) {
      fetchOrders();
      setupRealtimeSubscription();
    }
  }, [user?.branch_id]);

  const fetchOrders = async () => {
    if (!user?.branch_id) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('branch_id', user.branch_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user?.branch_id) return;

    const subscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `branch_id=eq.${user.branch_id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      await refreshOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const createOrder = async (orderData: {
    table_number: number;
    order_items: { menu_item_id: string; quantity: number; item_price: number; notes?: string }[];
    total_amount: number;
    notes?: string;
  }) => {
    if (!user?.branch_id) {
      return { data: null, error: 'No branch selected' };
    }

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          branch_id: user.branch_id,
          table_number: orderData.table_number,
          total_amount: orderData.total_amount,
          notes: orderData.notes,
          status: 'New',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItemsData = orderData.order_items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        item_price: item.item_price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      await refreshOrders();
      return { data: order, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    orders,
    loading,
    refreshOrders,
    updateOrderStatus,
    createOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};