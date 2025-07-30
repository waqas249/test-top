import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { OrderProvider } from '../contexts/OrderContext';
import OrderDetailScreen from '../screens/OrderDetailScreen';

export default function OrderDetail() {
  return (
    <AuthProvider>
      <OrderProvider>
        <OrderDetailScreen />
      </OrderProvider>
    </AuthProvider>
  );
}