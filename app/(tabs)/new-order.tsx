import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { OrderProvider } from '../../contexts/OrderContext';
import NewOrderScreen from '../../screens/NewOrderScreen';

export default function NewOrder() {
  return (
    <AuthProvider>
      <OrderProvider>
        <NewOrderScreen />
      </OrderProvider>
    </AuthProvider>
  );
}