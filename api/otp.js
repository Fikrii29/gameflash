// =====================================================
// GAMEFLASH - OTP WhatsApp via Fonnte (Vercel Serverless Function)
// =====================================================
// Token Fonnte TIDAK pernah dikirim ke browser.
//
// Environment variables (Vercel → Settings → Environment Variables):
//   FONNTE_TOKEN  → token device dari fonnte.com   (WAJIB)
//   OTP_SECRET    → string acak untuk tanda tangan OTP (opsional,
//                   bila kosong dipakai FONNTE_TOKEN)
//
// Tanpa database: OTP diverifikasi lewat tiket bertanda tangan (HMAC).
// =====================================================

const crypto = require('crypto');

const OTP_TTL_MS = 5 * 60 * 1000;      // OTP berlaku 5 menit
const RESEND_MS = 60 * 1000;           // jeda kirim ulang 60 detik
const MAX_ATTEMPTS = 5;                // maks salah input per nomor
const PROOF_TTL_MS = 30 * 24 * 3600 * 1000;

// Penahan sederhana (per instance serverless)
const lastSend = new Map();
const attempts = new Map();

function secret() {
  return process.env.OTP_SECRET || process.env.FONNTE_TOKEN || '';
}
function sign(data) {
  return crypto.createHmac('sha256', secret()).update(data).digest('hex');
}
function safeEq(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function normalizePhone(raw) {
  let p = String(raw || '').replace(/\D/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  else if (p.startsWith('8')) p = '62' + p;
  return /^628\d{7,12}$/.test(p) ? p : null;
}
function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function sendWhatsApp(phone, message) {
  const r = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: {
      Authorization: process.env.FONNTE_TOKEN,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({ target: phone, message }).toString()
  });
  let data = {};
  try { data = await r.json(); } catch (e) {}
  return { ok: r.ok && data.status !== false, data };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method tidak diizinkan' });
  if (!process.env.FONNTE_TOKEN) {
    return json(res, 500, { ok: false, error: 'Layanan WhatsApp belum dikonfigurasi (FONNTE_TOKEN belum diisi di Vercel).' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  const action = body.action;
  const phone = normalizePhone(body.phone);
  if (!phone) return json(res, 400, { ok: false, error: 'Nomor WhatsApp tidak valid. Contoh: 08123456789' });
  const purpose = body.purpose === 'register' ? 'register' : 'login';

  // ───────────── KIRIM OTP ─────────────
  if (action === 'send') {
    const now = Date.now();
    const last = lastSend.get(phone) || 0;
    if (now - last < RESEND_MS) {
      const wait = Math.ceil((RESEND_MS - (now - last)) / 1000);
      return json(res, 429, { ok: false, error: `Tunggu ${wait} detik sebelum minta kode lagi.` });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const exp = now + OTP_TTL_MS;
    const sig = sign(`${phone}.${otp}.${exp}.${purpose}`);

    const title = purpose === 'register' ? 'Verifikasi Pendaftaran' : 'Kode Masuk';
    const message =
      `🔐 *GAMEFLASH* - ${title}\n\n` +
      `Kode OTP kamu: *${otp}*\n\n` +
      `⏰ Berlaku 5 menit.\n` +
      `⚠️ Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengaku admin.`;

    try {
      const r = await sendWhatsApp(phone, message);
      if (!r.ok) {
        const reason = (r.data && (r.data.reason || r.data.detail)) || 'Gagal mengirim pesan WhatsApp.';
        return json(res, 502, { ok: false, error: reason });
      }
    } catch (e) {
      return json(res, 502, { ok: false, error: 'Tidak bisa terhubung ke Fonnte. Coba lagi.' });
    }

    lastSend.set(phone, now);
    attempts.set(phone, 0);
    return json(res, 200, { ok: true, ticket: `${exp}.${sig}`, expires: exp });
  }

  // ───────────── VERIFIKASI OTP ─────────────
  if (action === 'verify') {
    const otp = String(body.otp || '').replace(/\D/g, '');
    const [expStr, sig] = String(body.ticket || '').split('.');
    const exp = Number(expStr);
    if (!otp || !exp || !sig) return json(res, 400, { ok: false, error: 'Data verifikasi tidak lengkap.' });
    if (Date.now() > exp) return json(res, 400, { ok: false, error: 'Kode OTP sudah kedaluwarsa. Minta kode baru.' });

    const tries = (attempts.get(phone) || 0) + 1;
    attempts.set(phone, tries);
    if (tries > MAX_ATTEMPTS) {
      return json(res, 429, { ok: false, error: 'Terlalu banyak percobaan. Minta kode baru.' });
    }

    const expected = sign(`${phone}.${otp}.${exp}.${purpose}`);
    if (!safeEq(expected, sig)) return json(res, 400, { ok: false, error: 'Kode OTP salah.' });

    attempts.delete(phone);
    const proofExp = Date.now() + PROOF_TTL_MS;
    const proof = `${proofExp}.${sign(`proof.${phone}.${proofExp}`)}`;
    return json(res, 200, { ok: true, phone, proof });
  }

  return json(res, 400, { ok: false, error: 'Aksi tidak dikenal.' });
};
