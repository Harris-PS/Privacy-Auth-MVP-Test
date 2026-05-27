import { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Text, ActivityIndicator, Surface, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { api } from '../services/api';
import { storage } from '../services/storage';

export default function ScannerScreen({ navigation }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const scannerActive = useRef(true);

  useEffect(() => {
    scannerActive.current = true;
    return () => { scannerActive.current = false; };
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (!scannerActive.current || validating) return;
    setScanned(true);
    setValidating(true);
    setError('');

    try {
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch {
        throw new Error('Invalid QR code format');
      }

      const { session_token, signed_token } = qrData;
      if (!session_token || !signed_token) {
        throw new Error('Invalid QR payload');
      }

      const result = await api.validateSession(session_token, signed_token);

      if (!result.valid) {
        throw new Error(result.error || 'Invalid session');
      }

      if (!scannerActive.current) return;

      if (result.onboarding_required) {
        navigation.replace('Onboarding', {
          sessionToken: session_token,
          merchantId: result.merchant_id,
          signedToken: signed_token,
        });
      } else {
        navigation.replace('Consent', {
          sessionToken: session_token,
          merchantId: result.merchant_id,
          merchantName: result.merchant_name,
          signedToken: signed_token,
        });
      }
    } catch (e) {
      if (!scannerActive.current) return;
      setError(e.message || 'Session validation failed');
      setValidating(false);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setValidating(false);
    setError('');
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text variant="titleMedium">Camera permissions required</Text>
          <Button mode="contained" onPress={requestPermission} style={styles.button}>
            Grant Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text variant="titleMedium">Camera access denied</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Please enable camera access in your device settings.
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.button}>
            Retry Permission
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      {validating && (
        <Surface style={styles.overlay} elevation={4}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Validating session...
          </Text>
        </Surface>
      )}
      <Surface style={styles.instructions} elevation={2}>
        <Text variant="bodyLarge">Point your camera at the QR code</Text>
      </Surface>
      {scanned && !validating && !error && (
        <Button mode="outlined" onPress={handleReset} style={styles.rescanButton}>
          Tap to Scan Again
        </Button>
      )}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{ label: 'OK', onPress: handleReset }}
        duration={4000}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  overlay: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    right: '20%',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  instructions: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
  },
});
