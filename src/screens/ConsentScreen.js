import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, Snackbar, Dialog, Portal, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../services/api';
import { storage } from '../services/storage';
import { biometric } from '../services/biometric';

export default function ConsentScreen({ navigation, route }) {
  const { sessionToken, merchantId, merchantName: routeMerchantName, signedToken } = route.params || {};

  const [merchantName] = useState(routeMerchantName || 'Coffee Shop POS');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [pinDialogVisible, setPinDialogVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const details = await api.getConsentDetails(sessionToken, merchantId);
        if (details) {
          console.log('Consent details loaded');
        }
      } catch (e) {
        console.log('Using fallback consent details');
      }
    })();
  }, []);

  const verifyBiometricOrPin = async (action) => {
    const bioAvailable = await biometric.isAvailable();
    if (bioAvailable) {
      const authenticated = await biometric.authenticate();
      if (authenticated) {
        await executeAction(action);
        return;
      }
    }

    const hasPin = await storage.hasAppPin();
    if (hasPin) {
      setPendingAction(action);
      setPinDialogVisible(true);
      return;
    }

    await executeAction(action);
  };

  const handlePinSubmit = async () => {
    const storedPin = await storage.getAppPin();
    if (pin === storedPin) {
      setPinDialogVisible(false);
      setPin('');
      await executeAction(pendingAction);
    } else {
      Alert.alert('Error', 'Incorrect PIN');
    }
  };

  const executeAction = async (action) => {
    setLoading(true);
    try {
      if (action === 'approve') {
        const result = await api.approveConsent(sessionToken, merchantId);
        setSnackbarMessage(result.message || 'Identity Tokenized & Consent Submitted to Backend');
        setSnackbarVisible(true);
        setTimeout(() => {
          setSnackbarVisible(false);
          navigation.reset({ index: 0, routes: [{ name: 'Scanner' }] });
        }, 2000);
      } else {
        const result = await api.rejectConsent(sessionToken, merchantId);
        setSnackbarMessage(result.message || 'Session Cancelled');
        setSnackbarVisible(true);
        setTimeout(() => {
          setSnackbarVisible(false);
          navigation.reset({ index: 0, routes: [{ name: 'Scanner' }] });
        }, 1500);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    verifyBiometricOrPin('approve');
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Consent',
      'Are you sure you want to cancel this session?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => executeAction('reject'),
        },
      ]
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
            <Text variant="titleMedium" style={styles.value}>{merchantName}</Text>

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
            loading={loading}
            disabled={loading}
            style={styles.approveButton}
            contentStyle={styles.buttonContent}
          >
            Approve Consent
          </Button>
          <Button
            mode="outlined"
            onPress={handleReject}
            disabled={loading}
            style={styles.rejectButton}
            contentStyle={styles.buttonContent}
          >
            Reject Consent
          </Button>
        </View>
      </View>

      <Portal>
        <Dialog visible={pinDialogVisible} onDismiss={() => setPinDialogVisible(false)}>
          <Dialog.Title>Enter PIN</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="PIN"
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
              secureTextEntry
              mode="outlined"
              maxLength={6}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPinDialogVisible(false)}>Cancel</Button>
            <Button onPress={handlePinSubmit}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
      >
        {snackbarMessage}
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
