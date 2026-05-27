import { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../App';
import { api } from '../services/api';
import { storage } from '../services/storage';

export default function OnboardingScreen({ navigation, route }) {
  const { isAuthenticated, signIn } = useContext(AuthContext);
  const { sessionToken, merchantId, signedToken } = route.params || {};

  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRef, setOtpRef] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!mobileNumber.trim()) {
      setError('Please enter a mobile number');
      return;
    }
    setError('');
    setSendingOtp(true);

    try {
      const result = await api.sendOtp(mobileNumber.trim());
      setOtpRef(result.otp_ref);
      setOtpSent(true);
    } catch (e) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    setError('');
    setVerifying(true);

    try {
      const deviceId = await storage.getDeviceId();
      const result = await api.verifyOtp(
        mobileNumber.trim(),
        otp.trim(),
        otpRef,
        deviceId,
        Platform.OS === 'web' ? 'Web Browser' : 'Mobile Device',
      );

      if (!isAuthenticated) {
        await signIn(result.access_token, result.refresh_token, result.user_id);
      }

      navigation.replace('Consent', {
        sessionToken,
        merchantId,
        signedToken,
      });
    } catch (e) {
      setError(e.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium">Verify Your Device</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your mobile number to receive a one-time passcode.
          </Text>
        </View>

        <TextInput
          label="Mobile Number"
          value={mobileNumber}
          onChangeText={(text) => { setMobileNumber(text); setError(''); }}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
          disabled={otpSent}
          placeholder="+1 (555) 123-4567"
        />

        <Button
          mode="contained"
          onPress={handleSendOtp}
          loading={sendingOtp}
          disabled={sendingOtp || otpSent}
          style={styles.button}
        >
          {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
        </Button>

        {otpSent && (
          <>
            <TextInput
              label="One-Time Passcode"
              value={otp}
              onChangeText={(text) => { setOtp(text); setError(''); }}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
              maxLength={6}
              placeholder="123456"
            />

            <Button
              mode="contained"
              onPress={handleVerifyOtp}
              loading={verifying}
              disabled={verifying}
              style={styles.button}
            >
              {verifying ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </>
        )}

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 4,
    paddingVertical: 6,
  },
});
