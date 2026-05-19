// =====================================================
// GAMEFLASH - Tokopay Payment Gateway
// =====================================================

const TokoPay = (() => {

  // Default payment methods — bisa di-override via admin settings
  const DEFAULT_PAYMENT_METHODS = [
    { id: 'QRIS', name: 'QRIS', category: 'qris', icon: '📱', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/QRIS_logo.svg/512px-QRIS_logo.svg.png' },
    { id: 'VA_BCA', name: 'BCA Virtual Account', category: 'va', icon: '🏦', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/512px-Bank_Central_Asia.svg.png' },
    { id: 'VA_BNI', name: 'BNI Virtual Account', category: 'va', icon: '🏦', img: 'https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/512px-BNI_logo.svg.png' },
    { id: 'VA_BRI', name: 'BRI Virtual Account', category: 'va', icon: '🏦', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/512px-BANK_BRI_logo.svg.png' },
    { id: 'VA_MANDIRI', name: 'Mandiri Virtual Account', category: 'va', icon: '🏦', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/512px-Bank_Mandiri_logo_2016.svg.png' },
    { id: 'VA_BSI', name: 'BSI Virtual Account', category: 'va', icon: '🏦', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bank_Syariah_Indonesia.svg/512px-Bank_Syariah_Indonesia.svg.png' },
    { id: 'VA_PERMATA', name: 'Permata Virtual Account', category: 'va', icon: '🏦', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/PermataBank_logo.svg/512px-PermataBank_logo.svg.png' },
    { id: 'DANA', name: 'DANA', category: 'ewallet', icon: '💳', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/512px-Logo_dana_blue.svg.png' },
    { id: 'OVO', name: 'OVO', category: 'ewallet', icon: '💳', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/512px-Logo_ovo_purple.svg.png' },
    { id: 'GOPAY', name: 'GoPay', category: 'ewallet', icon: '💳', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/512px-Gopay_logo.svg.png' },
    { id: 'SHOPEEPAY', name: 'ShopeePay', category: 'ewallet', icon: '💳', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/ShopeePay_Logo.svg/512px-ShopeePay_Logo.svg.png' },
    { id: 'LINKAJA', name: 'LinkAja', category: 'ewallet', icon: '💳', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/LinkAja.svg/512px-LinkAja.svg.png' },
  ];

  // ── Get methods from settings (with admin overrides) ──────
  function getPaymentMethods() {
    try {
      const s = (typeof GF !== 'undefined' && GF.get(GF.KEYS.SETTINGS)) || {};
      const saved = s.tokopayMethods;
      if (Array.isArray(saved) && saved.length > 0) {
        // Only return active methods (active !== false)
        return saved.filter(m => m.active !== false);
      }
    } catch (e) { }
    return DEFAULT_PAYMENT_METHODS.filter(m => m.active !== false);
  }

  // ── Credentials ──────────────────────────────────────────
  function getCredentials() {
    try {
      const s = (typeof GF !== 'undefined' && GF.get(GF.KEYS.SETTINGS)) || {};
      return {
        merchantId: s.tokopayMerchantId || '',
        secretKey: s.tokopaySecretKey || '',
        production: s.tokopayProduction || false,
      };
    } catch (e) {
      return { merchantId: '', secretKey: '', production: false };
    }
  }

  function isConfigured() {
    const { merchantId, secretKey } = getCredentials();
    return !!(merchantId && secretKey);
  }

  function getBaseUrl() {
    // Gunakan proxy lokal untuk hindari CORS block di browser
    return window.location.origin + '/api/tokopay';
  }

  // ── Create Order ─────────────────────────────────────────
  // TokoPay API pakai GET dengan query params (bukan POST)
  async function createOrder({ refId, amount, paymentMethod, customerPhone }) {
    const { merchantId, secretKey } = getCredentials();
    if (!merchantId || !secretKey) {
      return simulatePayment(refId, paymentMethod, amount);
    }

    try {
      const sign = await md5(merchantId + secretKey + refId);
      const params = new URLSearchParams({
        id_merchant: merchantId,
        ref_id: refId,
        nominal: amount,
        metode: paymentMethod,
        sign: sign,
      });
      if (customerPhone) params.append('hp', customerPhone);

      const resp = await fetch(`${getBaseUrl()}/v1/order?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch (e) {
        console.warn('[TokoPay] JSON parse error:', text);
        return simulatePayment(refId, paymentMethod, amount);
      }

      if (data.status === 'Success' && data.data) {
        const d = data.data;
        return {
          success: true,
          paymentUrl: d.pay_url || d.checkout_url || null,
          vaNumber: d.nomor_va || null,
          qrCode: d.qr_link || d.qr_url || d.qr_image || null,
          qrString: d.qr_string || null,
          expiredTime: d.expired_time || null,
          invoiceId: refId,
          data: d,
        };
      } else {
        console.warn('[TokoPay] Order failed:', data);
        return simulatePayment(refId, paymentMethod, amount);
      }
    } catch (e) {
      console.error('[TokoPay] createOrder error:', e);
      return simulatePayment(refId, paymentMethod, amount);
    }
  }

  // ── MD5 hash untuk signature ──────────────────────────────
  async function md5(str) {
    // Pakai SubtleCrypto jika tersedia, fallback ke simple hash
    try {
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest('MD5', enc.encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback MD5 implementation
      return md5Fallback(str);
    }
  }

  function md5Fallback(s) {
    function safeAdd(x, y) { var lsw = (x & 0xffff) + (y & 0xffff), msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xffff) }
    function bitRotateLeft(n, c) { return (n << c) | (n >>> (32 - c)) }
    function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b) }
    function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | ((~b) & d), a, b, x, s, t) }
    function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & (~d)), a, b, x, s, t) }
    function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
    function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | (~d)), a, b, x, s, t) }
    var i, x = Array(Math.ceil(s.length / 4) + 2); for (i = 0; i < x.length; i++)x[i] = 0; for (i = 0; i < s.length; i++)x[i >> 2] |= s.charCodeAt(i) << ((i % 4) * 8); x[i >> 2] |= 0x80 << ((i % 4) * 8); x[x.length - 2] = s.length * 8;
    var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (i = 0; i < x.length - 1; i += 16) { var oA = a, oB = b, oC = c, oD = d; a = md5ff(a, b, c, d, x[i], 7, -680876936); d = md5ff(d, a, b, c, x[i + 1], 12, -389564586); c = md5ff(c, d, a, b, x[i + 2], 17, 606105819); b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330); a = md5ff(a, b, c, d, x[i + 4], 7, -176418897); d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426); c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341); b = md5ff(b, c, d, a, x[i + 7], 22, -45705983); a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416); d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417); c = md5ff(c, d, a, b, x[i + 10], 17, -42063); b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162); a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682); d = md5ff(d, a, b, c, x[i + 13], 12, -40341101); c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290); b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329); a = md5gg(a, b, c, d, x[i + 1], 5, -165796510); d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632); c = md5gg(c, d, a, b, x[i + 11], 14, 643717713); b = md5gg(b, c, d, a, x[i], 20, -373897302); a = md5gg(a, b, c, d, x[i + 5], 5, -701558691); d = md5gg(d, a, b, c, x[i + 10], 9, 38016083); c = md5gg(c, d, a, b, x[i + 15], 14, -660478335); b = md5gg(b, c, d, a, x[i + 4], 20, -405537848); a = md5gg(a, b, c, d, x[i + 9], 5, 568446438); d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690); c = md5gg(c, d, a, b, x[i + 3], 14, -187363961); b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501); a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467); d = md5gg(d, a, b, c, x[i + 2], 9, -51403784); c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473); b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734); a = md5hh(a, b, c, d, x[i + 5], 4, -378558); d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463); c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562); b = md5hh(b, c, d, a, x[i + 14], 23, -35309556); a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060); d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353); c = md5hh(c, d, a, b, x[i + 7], 16, -155497632); b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640); a = md5hh(a, b, c, d, x[i + 13], 4, 681279174); d = md5hh(d, a, b, c, x[i], 11, -358537222); c = md5hh(c, d, a, b, x[i + 3], 16, -722521979); b = md5hh(b, c, d, a, x[i + 6], 23, 76029189); a = md5hh(a, b, c, d, x[i + 9], 4, -640364487); d = md5hh(d, a, b, c, x[i + 12], 11, -421815835); c = md5hh(c, d, a, b, x[i + 15], 16, 530742520); b = md5hh(b, c, d, a, x[i + 2], 23, -995338651); a = md5ii(a, b, c, d, x[i], 6, -198630844); d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415); c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905); b = md5ii(b, c, d, a, x[i + 5], 21, -57434055); a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571); d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606); c = md5ii(c, d, a, b, x[i + 10], 15, -1051523); b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799); a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359); d = md5ii(d, a, b, c, x[i + 15], 10, -30611744); c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380); b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649); a = md5ii(a, b, c, d, x[i + 4], 6, -145523070); d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379); c = md5ii(c, d, a, b, x[i + 2], 15, 718787259); b = md5ii(b, c, d, a, x[i + 9], 21, -343485551); a = safeAdd(a, oA); b = safeAdd(b, oB); c = safeAdd(c, oC); d = safeAdd(d, oD) }
    function i2h(i) { return ('0' + ((i >>> 28) & 0xf).toString(16)).slice(-1) + ('0' + ((i >>> 24) & 0xf).toString(16)).slice(-1) + ('0' + ((i >>> 20) & 0xf).toString(16)).slice(-1) + ('0' + ((i >>> 16) & 0xf).toString(16)).slice(-1) + ('0' + ((i >>> 12) & 0xf).toString(16)).slice(-1) + ('0' + ((i >>> 8) & 0xf).toString(16)).slice(-1) + ('0' + ((i >>> 4) & 0xf).toString(16)).slice(-1) + ('0' + (i & 0xf).toString(16)).slice(-1) }
    return i2h(a) + i2h(b) + i2h(c) + i2h(d);
  }

  // ── Check Status ─────────────────────────────────────────
  async function checkStatus(refId) {
    const { merchantId, secretKey } = getCredentials();
    if (!merchantId || !secretKey) {
      const txs = (typeof GF !== 'undefined' && GF.get(GF.KEYS.TRANSACTIONS)) || [];
      const tx = txs.find(t => t.invoiceId === refId);
      return { isPaid: tx?.paymentStatus === 'paid', raw: tx };
    }

    try {
      const sign = await md5(merchantId + secretKey + refId);
      const params = new URLSearchParams({ id_merchant: merchantId, ref_id: refId, sign });
      const resp = await fetch(`${getBaseUrl()}/v1/order/status?${params.toString()}`);
      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { return { isPaid: false }; }
      const isPaid = data.data?.status === 'Sukses' || data.data?.status === 'PAID' || data.data?.payment_status === 'paid';
      return { isPaid, raw: data };
    } catch (e) {
      return { isPaid: false, error: e.message };
    }
  }

  // ── Simulate payment (demo/fallback) ─────────────────────
  function simulatePayment(refId, method, amount) {
    const methods = getPaymentMethods();
    const m = methods.find(x => x.id === method) || { id: method, name: method, category: 'va' };

    // Generate fake VA number
    const fakeVA = '8277' + Math.floor(Math.random() * 9000000000 + 1000000000);
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    let paymentData = { vaNumber: fakeVA, expiredAt };

    if (m.category === 'qris') {
      const qrString = 'SIMULASI_QRIS_' + refId + '_' + amount;
      const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrString);
      paymentData = { qrCode: qrImageUrl, qrString, expiredAt };
    } else if (m.category === 'ewallet') {
      paymentData = { paymentUrl: '#', deeplink: '#', expiredAt };
    }

    return {
      success: true,
      simulated: true,
      invoiceId: refId,
      method: m,
      amount,
      ...paymentData,
    };
  }

  // ── Public API ────────────────────────────────────────────
  return {
    get PAYMENT_METHODS() { return getPaymentMethods(); },
    DEFAULT_PAYMENT_METHODS,
    isConfigured,
    getCredentials,
    createOrder,
    checkStatus,
    simulatePayment,
  };

})();