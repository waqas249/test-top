import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { OrderProvider } from '../../contexts/OrderContext';
import OrderListScreen from '../../screens/OrderListScreen';

export default function Orders() {
  return (
    <AuthProvider>
      <OrderProvider>
        <OrderListScreen />
      </OrderProvider>
    </AuthProvider>
  );
}