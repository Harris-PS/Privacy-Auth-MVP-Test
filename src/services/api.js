const API_BASE_URL = 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.accessToken = null;
  }

  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async sendOtp(phone) {
    return this._request('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone, otp, otpRef, deviceId, deviceName) {
    return this._request('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, otp_ref: otpRef, device_id: deviceId, device_name: deviceName }),
    });
  }

  async refreshToken(refreshToken) {
    return this._request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async createSession(merchantId, posId, apiKey) {
    return this._request('/api/v1/session/create', {
      method: 'POST',
      body: JSON.stringify({ merchant_id: merchantId, pos_id: posId, api_key: apiKey }),
    });
  }

  async validateSession(sessionToken, signedToken) {
    return this._request('/api/v1/session/validate', {
      method: 'POST',
      body: JSON.stringify({ session_token: sessionToken, signed_token: signedToken }),
    });
  }

  async getConsentDetails(sessionId, merchantId) {
    return this._request(`/api/v1/consent/details?session_id=${sessionId}&merchant_id=${merchantId}`);
  }

  async approveConsent(sessionId, merchantId) {
    return this._request('/api/v1/consent/approve', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, merchant_id: merchantId }),
    });
  }

  async rejectConsent(sessionId, merchantId, reason) {
    return this._request('/api/v1/consent/reject', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, merchant_id: merchantId, reason }),
    });
  }
}

export const api = new ApiClient();
export default ApiClient;
