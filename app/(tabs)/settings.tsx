import React from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import SettingsScreen from '../../screens/SettingsScreen';

export default function Settings() {
  return (
    <AuthProvider>
      <SettingsScreen />
    </AuthProvider>
  );
}