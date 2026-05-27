import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'privacy_auth_access_token',
  REFRESH_TOKEN: 'privacy_auth_refresh_token',
  USER_ID: 'privacy_auth_user_id',
  DEVICE_ID: 'privacy_auth_device_id',
  BIOMETRIC_ENABLED: 'privacy_auth_biometric_enabled',
  APP_PIN: 'privacy_auth_app_pin',
};

class SecureStorageService {
  async set(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore set error:', error);
    }
  }

  async get(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore get error:', error);
      return null;
    }
  }

  async delete(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore delete error:', error);
    }
  }

  async saveAuthTokens(accessToken, refreshToken) {
    await Promise.all([
      this.set(KEYS.ACCESS_TOKEN, accessToken),
      this.set(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  }

  async getAccessToken() {
    return this.get(KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken() {
    return this.get(KEYS.REFRESH_TOKEN);
  }

  async clearAuth() {
    await Promise.all([
      this.delete(KEYS.ACCESS_TOKEN),
      this.delete(KEYS.REFRESH_TOKEN),
      this.delete(KEYS.USER_ID),
    ]);
  }

  async saveUserId(userId) {
    await this.set(KEYS.USER_ID, userId);
  }

  async getUserId() {
    return this.get(KEYS.USER_ID);
  }

  async saveDeviceId(deviceId) {
    await this.set(KEYS.DEVICE_ID, deviceId);
  }

  async getDeviceId() {
    let deviceId = await this.get(KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await this.saveDeviceId(deviceId);
    }
    return deviceId;
  }

  async setBiometricEnabled(enabled) {
    await this.set(KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
  }

  async isBiometricEnabled() {
    const val = await this.get(KEYS.BIOMETRIC_ENABLED);
    return val === 'true';
  }

  async saveAppPin(pin) {
    await this.set(KEYS.APP_PIN, pin);
  }

  async getAppPin() {
    return this.get(KEYS.APP_PIN);
  }

  async hasAppPin() {
    const pin = await this.getAppPin();
    return pin !== null;
  }
}

export const storage = new SecureStorageService();
export default SecureStorageService;
