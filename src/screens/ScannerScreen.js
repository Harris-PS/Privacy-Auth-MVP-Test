import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Text, ActivityIndicator, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [validating, setValidating] = useState(false);
  const scannerActive = useRef(true);

  useEffect(() => {
    scannerActive.current = true;
    return () => { scannerActive.current = false; };
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (!scannerActive.current || validating) return;
    setScanned(true);
    setValidating(true);

    setTimeout(() => {
      if (!scannerActive.current) return;
      const isNewCustomer = Math.random() > 0.5;
      if (isNewCustomer) {
        navigation.replace('Onboarding', { sessionToken: data });
      } else {
        navigation.replace('Consent', { sessionToken: data });
      }
    }, 1000);
  };

  const handleReset = () => {
    setScanned(false);
    setValidating(false);
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
      {scanned && !validating && (
        <Button mode="outlined" onPress={handleReset} style={styles.rescanButton}>
          Tap to Scan Again
        </Button>
      )}
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
