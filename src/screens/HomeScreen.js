import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, List, Text, Surface, Divider } from 'react-native-paper';

// Mock data representing previous or active authenticated sessions
const mockSessions = [
  { id: '1', merchant: 'Coffee Shop POS', date: 'Today, 08:30 AM', status: 'Active' },
  { id: '2', merchant: 'Grocery Store', date: 'Yesterday, 06:15 PM', status: 'Expired' },
  { id: '3', merchant: 'Bookstore', date: 'May 20, 02:00 PM', status: 'Expired' },
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Surface style={styles.headerContainer} elevation={0}>
        <Text variant="headlineSmall" style={styles.headerText}>
          Connected Merchants
        </Text>
        <Text variant="bodyMedium" style={styles.subHeaderText}>
          Your tokenized identities are actively securing these sessions.
        </Text>
      </Surface>

      <FlatList
        data={mockSessions}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <List.Item
            title={item.merchant}
            description={item.date}
            left={props => <List.Icon {...props} icon="shield-check" color={item.status === 'Active' ? 'green' : 'gray'} />}
            right={props => <Text {...props} style={styles.statusText(item.status)}>{item.status}</Text>}
          />
        )}
      />

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        label="Scan QR"
        onPress={() => navigation.navigate('Scanner')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontWeight: 'bold',
  },
  subHeaderText: {
    color: '#666',
    marginTop: 4,
  },
  statusText: (status) => ({
    alignSelf: 'center',
    color: status === 'Active' ? 'green' : 'gray',
    fontWeight: '600',
    marginRight: 10,
  }),
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 24,
  },
});