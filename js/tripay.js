// =====================================================
// GAMEFLASH - Tripay Payment Gateway Integration
// =====================================================

const Tripay = {
  BASE_URL: 'https://tripay.co.id/api',

  PAYMENT_METHODS: [
    // QRIS
    { id: 'QRIS', name: 'QRIS', category: 'qris', icon: '📱', desc: 'Scan QR — semua e-wallet & m-banking', fee: 0, gateway: 'tripay' },
    { id: 'QRISC', name: 'QRIS (Customizable)', category: 'qris', icon: '📱', desc: 'QRIS open / closed amount', fee: 0, gateway: 'tripay' },
    // Virtual Account
    { id: 'BRIVA', name: 'BRI Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA BRI', fee: 0, gateway: 'tripay' },
    { id: 'BCAVA', name: 'BCA Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA BCA', fee: 0, gateway: 'tripay' },
    { id: 'BNIVA', name: 'BNI Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA BNI', fee: 0, gateway: 'tripay' },
    { id: 'MANDIRIVA', name: 'Mandiri Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA Mandiri', fee: 0, gateway: 'tripay' },
    { id: 'BSIVA', name: 'BSI Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA BSI', fee: 0, gateway: 'tripay' },
    { id: 'PERMATAVA', name: 'Permata Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA Permata', fee: 0, gateway: 'tripay' },
    { id: 'CIMBVA', name: 'CIMB Niaga Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke VA CIMB', fee: 0, gateway: 'tripay' },
    // E-Wallet
    { id: 'OVO', name: 'OVO', category: 'ewallet', icon: '💜', desc: 'Bayar dengan OVO', fee: 0, gateway: 'tripay' },
    { id: 'DANA', name: 'DANA', category: 'ewallet', icon: '💙', desc: 'Bayar dengan DANA', fee: 0, gateway: 'tripay' },
    { id: 'SHOPEEPAY', name: 'ShopeePay', category: 'ewallet', icon: '🧡', desc: 'Bayar dengan ShopeePay', fee: 0, gateway: 'tripay' },
    // Convenience Store
    { id: 'ALFAMART', name: 'Alfamart', category: 'retail', icon: '🏪', desc: 'Bayar di Alfamart', fee: 0, gateway: 'tripay' },
    { id: 'INDOMARET', name: 'Indomaret', category: 'retail', icon: '🏪', desc: 'Bayar di Indomaret', fee: 0, gateway: 'tripay' },
  ],

  getCredentials() {
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    return {
      apiKey: settings.tripayApiKey || '',
      privateKey: settings.tripayPrivateKey || '',
      merchantCode: settings.tripayMerchantCode || '',
      production: settings.tripayProduction || false
    };
  },

  isConfigured() {
    const { apiKey, privateKey, merchantCode } = this.getCredentials();
    return !!(apiKey && privateKey && merchantCode);
  },

  getBaseUrl() {
    const { production } = this.getCredentials();
    return production
      ? 'https://tripay.co.id/api'
      : 'https://tripay.co.id/api-sandbox';
  },

  // Generate HMAC-SHA256 signature
  // Tripay: HMAC_SHA256(merchantCode + merchantRef + amount, privateKey)
  async generateSignature(merchantCode, merchantRef, amount, privateKey) {
    const message = merchantCode + merchantRef + amount;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(privateKey);
    const msgData = encoder.encode(message);

    try {
      const key = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const sig = await crypto.subtle.sign('HMAC', key, msgData);
      return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback: simple hash for demo
      return DigiFlazz.simpleMD5(message + privateKey);
    }
  },

  // Create closed payment (fixed amount)
  async createOrder({ refId, amount, paymentMethod, customerName, customerPhone, items, returnUrl }) {
    const { apiKey, privateKey, merchantCode } = this.getCredentials();
    if (!apiKey || !privateKey || !merchantCode) {
      return { success: false, error: 'Tripay credentials not configured' };
    }

    const signature = await this.generateSignature(merchantCode, refId, amount, privateKey);
    const baseUrl = this.getBaseUrl();

    const payload = {
      method: paymentMethod,
      merchant_ref: refId,
      amount: amount,
      customer_name: customerName || 'Customer',
      customer_email: 'customer@gameflash.id',
      customer_phone: customerPhone || '',
      order_items: items || [{ name: 'Top Up Game', price: amount, quantity: 1 }],
      return_url: returnUrl || window.location.href,
      expired_time: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      signature: signature
    };

    try {
      const response = await fetch(`${baseUrl}/transaction/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          paymentUrl: data.data?.checkout_url || data.data?.pay_url,
          qrCode: data.data?.qr_string || data.data?.qr_url,
          vaNumber: data.data?.pay_code,
          expiredAt: data.data?.expired_time ? new Date(data.data.expired_time * 1000).toISOString() : null,
          reference: data.data?.reference,
          data: data.data
        };
      }
      return { success: false, error: data.message || 'Tripay payment creation failed', data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Check transaction status
  async checkStatus(refId) {
    const { apiKey } = this.getCredentials();
    if (!apiKey) return { success: false, error: 'Not configured' };

    const baseUrl = this.getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/transaction/detail?reference=${refId}`, {
        headers: { 'Authorization': 'Bearer ' + apiKey }
      });
      const data = await response.json();
      const status = data.data?.status;
      return {
        success: true,
        isPaid: status === 'PAID',
        status: status,
        data: data.data
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Get available payment channels
  async getChannels() {
    const { apiKey } = this.getCredentials();
    if (!apiKey) return { success: false, error: 'Not configured' };

    const baseUrl = this.getBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/merchant/payment-channel`, {
        headers: { 'Authorization': 'Bearer ' + apiKey }
      });
      const data = await response.json();
      return { success: data.success, channels: data.data || [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Simulate payment for demo (without real API)
  simulatePayment(refId, paymentMethod, amount) {
    const isQris = paymentMethod.includes('QRIS');
    return {
      success: true,
      paymentUrl: '#',
      qrCode: isQris ? 'SIMULASI_TRIPAY_QRIS_' + refId : null,
      vaNumber: !isQris ? '8900' + Math.random().toString().slice(2, 12) : null,
      expiredAt: new Date(Date.now() + 3600000).toISOString(),
      reference: 'T' + refId,
      data: { merchant_ref: refId, amount, method: paymentMethod, status: 'UNPAID' }
    };
  }
};
