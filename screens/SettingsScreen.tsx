import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>Branch Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Branch Name:</Text>
            <Text style={styles.infoValue}>{user?.branch?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{user?.branch?.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Login Email:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Restaurant:</Text>
            <Text style={styles.infoValue}>Taste of Peshawar</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>System:</Text>
            <Text style={styles.infoValue}>Order Management v1.0</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions</Text>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="danger"
            size="large"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpText}>How to create a new order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpText}>Managing order status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpText}>Understanding the dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem}>
            <Text style={styles.helpText}>Contact support</Text>
          </TouchableOpacity>
        </Card>
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  helpItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  helpText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
  },
});

export default SettingsScreen;