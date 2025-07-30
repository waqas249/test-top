import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { OrderProvider } from '../../contexts/OrderContext';
import DashboardScreen from '../../screens/DashboardScreen';

export default function Dashboard() {
  return (
    <AuthProvider>
      <OrderProvider>
        <DashboardScreen />
      </OrderProvider>
    </AuthProvider>
  );
}