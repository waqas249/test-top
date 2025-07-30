import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '../../types';

interface StatusBadgeProps {
  status: Order['status'];
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'New':
        return '#FF6B35';
      case 'Preparing':
        return '#FFC107';
      case 'Ready':
        return '#28A745';
      default:
        return '#6C757D';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'New':
        return '#FFFFFF';
      case 'Preparing':
        return '#000000';
      case 'Ready':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        styles[size],
        { backgroundColor: getStatusColor() },
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`${size}Text`],
          { color: getTextColor() },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  small: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  medium: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  large: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});

export default StatusBadge;