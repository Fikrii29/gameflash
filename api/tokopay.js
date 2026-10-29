// =====================================================
// GAMEFLASH - Tokopay Proxy (Vercel Serverless Function)
// =====================================================
// Endpoint ini jadi perantara antara browser dan API Tokopay.
// Secret key TIDAK pernah dikirim ke browser — aman!
//
// Environment variables yang wajib diset di Vercel Dashboard:
//   TOKOPAY_MERCHANT_ID  → Merchant ID dari dashboard Tokopay
//   TOKOPAY_SECRET_KEY   → Secret key dari dashboard Tokopay
// =====================================================

const https = require('https');
const crypto = require('crypto');

// Helper: MD5 hash (untuk signature Tokopay)
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// Helper: forward request ke Tokopay API
function fetchTokopay(path, queryParams) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams(queryParams).toString();
    const fullPath = path + (qs ? '?' + qs : '');

    const options = {
      hostname: 'api.tokopay.id',
      path: fullPath,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from Tokopay: ' + data.substring(0, 100))); }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS — izinkan semua origin (karena ini API publik milik kamu sendiri)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Ambil credentials dari environment variable Vercel (AMAN, tidak exposed ke browser)
  const merchantId = process.env.TOKOPAY_MERCHANT_ID;
  const secretKey  = process.env.TOKOPAY_SECRET_KEY;

  if (!merchantId || !secretKey) {
    return res.status(500).json({
      status: 'Error',
      message: 'Server belum dikonfigurasi. Set TOKOPAY_MERCHANT_ID dan TOKOPAY_SECRET_KEY di Vercel Dashboard.'
    });
  }

  // Tentukan action dari query: ?action=order atau ?action=status
  const { action, ref_id, nominal, metode, hp } = req.query;

  try {
    if (action === 'order') {
      // Validasi parameter wajib
      if (!ref_id || !nominal || !metode) {
        return res.status(400).json({ status: 'Error', message: 'ref_id, nominal, dan metode wajib diisi' });
      }

      // Generate signature di server (secret key aman)
      const sign = md5(merchantId + secretKey + ref_id);

      const params = {
        id_merchant: merchantId,
        ref_id,
        nominal,
        metode,
        sign,
      };
      if (hp) params.hp = hp;

      const data = await fetchTokopay('/v1/order', params);
      return res.status(200).json(data);

    } else if (action === 'status') {
      if (!ref_id) {
        return res.status(400).json({ status: 'Error', message: 'ref_id wajib diisi' });
      }

      const sign = md5(merchantId + secretKey + ref_id);
      const data = await fetchTokopay('/v1/order/status', {
        id_merchant: merchantId,
        ref_id,
        sign,
      });
      return res.status(200).json(data);

    } else {
      return res.status(400).json({ status: 'Error', message: 'action tidak valid. Gunakan: order atau status' });
    }

  } catch (err) {
    console.error('[Tokopay Proxy] Error:', err.message);
    return res.status(502).json({ status: 'Error', message: 'Gagal menghubungi Tokopay: ' + err.message });
  }
};
