import * as LocalAuthentication from 'expo-local-authentication';

class BiometricService {
  async isAvailable() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) return false;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  }

  async authenticate(reason = 'Authenticate to approve consent') {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    return result.success;
  }

  async getEnrolledLevel() {
    return LocalAuthentication.getEnrolledLevelAsync();
  }

  async supportedAuthenticationTypes() {
    return LocalAuthentication.supportedAuthenticationTypesAsync();
  }
}

export const biometric = new BiometricService();
export default BiometricService;
