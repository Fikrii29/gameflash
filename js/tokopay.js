// =====================================================
// GAMEFLASH - Tokopay Payment Gateway Integration
// =====================================================

const TokoPay = {
  BASE_URL: 'https://api.tokopay.id/v1',

  PAYMENT_METHODS: [
    { id: 'QRIS', name: 'QRIS', category: 'qris', icon: '📱', desc: 'Bayar dengan semua e-wallet & m-banking', fee: 0 },
    // Virtual Account
    { id: 'BCA', name: 'BCA Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke Virtual Account BCA', fee: 0 },
    { id: 'BNI', name: 'BNI Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke Virtual Account BNI', fee: 0 },
    { id: 'BRI', name: 'BRI Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke Virtual Account BRI', fee: 0 },
    { id: 'MANDIRI', name: 'Mandiri Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke Virtual Account Mandiri', fee: 0 },
    { id: 'BSI', name: 'BSI Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke Virtual Account BSI', fee: 0 },
    { id: 'PERMATA', name: 'Permata Virtual Account', category: 'va', icon: '🏦', desc: 'Transfer ke Virtual Account Permata', fee: 0 },
    // E-Wallet
    { id: 'DANA', name: 'DANA', category: 'ewallet', icon: '💙', desc: 'Bayar dengan DANA', fee: 0 },
    { id: 'OVO', name: 'OVO', category: 'ewallet', icon: '💜', desc: 'Bayar dengan OVO', fee: 0 },
    { id: 'GOPAY', name: 'GoPay', category: 'ewallet', icon: '💚', desc: 'Bayar dengan GoPay', fee: 0 },
    { id: 'SHOPEEPAY', name: 'ShopeePay', category: 'ewallet', icon: '🧡', desc: 'Bayar dengan ShopeePay', fee: 0 },
    { id: 'LINKAJA', name: 'LinkAja', category: 'ewallet', icon: '❤️', desc: 'Bayar dengan LinkAja', fee: 0 },
  ],

  getCredentials() {
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    return {
      merchantId: settings.tokopayMerchantId || '',
      secretKey: settings.tokopaySecretKey || '',
      production: settings.tokopayProduction || false
    };
  },

  generateSignature(merchantId, secretKey, refId, amount) {
    // Tokopay signature: MD5(secret_key + refId + amount)
    const str = secretKey + refId + amount;
    return DigiFlazz.simpleMD5(str);
  },

  // Create payment order
  async createOrder({ refId, amount, paymentMethod, customerName, customerPhone, items, returnUrl, callbackUrl }) {
    const { merchantId, secretKey } = this.getCredentials();
    if (!merchantId || !secretKey) {
      return { success: false, error: 'Tokopay credentials not configured' };
    }

    const sign = this.generateSignature(merchantId, secretKey, refId, amount);
    const payload = {
      merchant_id: merchantId,
      ref_id: refId,
      nominal: amount,
      metode: paymentMethod,
      sign,
    };

    try {
      const response = await fetch(`${this.BASE_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === 'Success') {
        return {
          success: true,
          paymentUrl: data.data?.pay_url || data.data?.qr_url,
          qrCode: data.data?.qr_string,
          vaNumber: data.data?.nomor_va,
          expiredAt: data.data?.expired,
          data: data.data
        };
      }
      return { success: false, error: data.msg || 'Payment creation failed', data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Check payment status
  async checkStatus(refId) {
    const { merchantId, secretKey } = this.getCredentials();
    if (!merchantId || !secretKey) {
      return { success: false, error: 'Not configured' };
    }
    const sign = this.generateSignature(merchantId, secretKey, refId, '');
    try {
      const response = await fetch(`${this.BASE_URL}/status?merchant_id=${merchantId}&ref_id=${refId}&sign=${sign}`);
      const data = await response.json();
      return {
        success: true,
        isPaid: data.status === 'Success' || data.data?.status === 'Paid',
        status: data.data?.status,
        data
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Simulate payment for demo (without real API)
  simulatePayment(refId, paymentMethod, amount) {
    return {
      success: true,
      paymentUrl: '#',
      qrCode: 'SIMULASI_QRIS_' + refId,
      vaNumber: paymentMethod !== 'QRIS' ? '8800' + Math.random().toString().slice(2, 12) : null,
      expiredAt: new Date(Date.now() + 3600000).toISOString(),
      data: { ref_id: refId, nominal: amount, metode: paymentMethod, status: 'Pending' }
    };
  }
};
