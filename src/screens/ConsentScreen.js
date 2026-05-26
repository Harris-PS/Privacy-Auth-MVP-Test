import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsentScreen({ navigation }) {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleApprove = () => {
    setSnackbarVisible(true);
    setTimeout(() => {
      setSnackbarVisible(false);
      navigation.reset({ index: 0, routes: [{ name: 'Scanner' }] });
    }, 2000);
  };

  const handleReject = () => {
    Alert.alert(
      'Session Cancelled',
      'Your session has been cancelled. No data was shared.',
      [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Scanner' }] }) }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Consent Request
        </Text>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="labelLarge" style={styles.sectionLabel}>Merchant</Text>
            <Text variant="titleMedium" style={styles.value}>Coffee Shop POS</Text>

            <Text variant="labelLarge" style={styles.sectionLabel}>Amount</Text>
            <Text variant="titleMedium" style={styles.value}>$4.50</Text>

            <Text variant="labelLarge" style={styles.sectionLabel}>Requested Data</Text>
            <Text variant="bodyMedium" style={styles.value}>
              Tokenized Identity Only - No Personal Data Shared
            </Text>
          </Card.Content>
        </Card>

        <Text variant="bodySmall" style={styles.disclaimer}>
          By approving, you authorize the merchant to receive a tokenized
          representation of your identity. No personal information is shared.
        </Text>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleApprove}
            style={styles.approveButton}
            contentStyle={styles.buttonContent}
          >
            Approve Consent
          </Button>
          <Button
            mode="outlined"
            onPress={handleReject}
            style={styles.rejectButton}
            contentStyle={styles.buttonContent}
          >
            Reject Consent
          </Button>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        Identity Tokenized & Consent Submitted to Backend
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionLabel: {
    marginTop: 12,
    opacity: 0.6,
    fontSize: 12,
    letterSpacing: 1,
  },
  value: {
    marginTop: 2,
    marginBottom: 4,
  },
  disclaimer: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 12,
  },
  approveButton: {
    borderRadius: 8,
  },
  rejectButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});
