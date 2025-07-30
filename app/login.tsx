import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';

export default function Login() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}