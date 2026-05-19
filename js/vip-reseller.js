// =====================================================
// GAMEFLASH - VIP Reseller Nickname Validation
// POST https://vip-reseller.co.id/api/game-feature
// =====================================================

const VipReseller = {

  BASE_URL: 'https://vip-reseller.co.id/api/game-feature',

  // Map game ID → { code, params }
  // Sesuai dokumentasi VIP Reseller API:
  // - additional_target digunakan untuk zone_id (ML, Genshin, HSR)
  // - Free Fire & Free Fire MAX menggunakan code yang sama: free-fire
  GAME_MAP: {
    // Mobile Legends: Bang Bang
    'ml': { code: 'mobile-legends', params: ['userId', 'zoneId'] },
    'mobile-legends': { code: 'mobile-legends', params: ['userId', 'zoneId'] },

    // Free Fire
    'ff': { code: 'free-fire', params: ['userId'] },
    'free-fire': { code: 'free-fire', params: ['userId'] },

    // Free Fire MAX (code sama dengan Free Fire)
    'ffmax': { code: 'free-fire', params: ['userId'] },
    'free-fire-max': { code: 'free-fire', params: ['userId'] },

    // PUBG Mobile
    'pubg': { code: 'pubgm', params: ['userId'] },
    'pubgm': { code: 'pubgm', params: ['userId'] },

    // Genshin Impact
    'genshin': { code: 'genshin-impact', params: ['userId', 'zone'] },
    'genshin-impact': { code: 'genshin-impact', params: ['userId', 'zone'] },

    // Honkai: Star Rail
    'hsr': { code: 'honkai-star-rail', params: ['userId', 'zone'] },
    'honkai-star-rail': { code: 'honkai-star-rail', params: ['userId', 'zone'] },

    // Point Blank
    'pb': { code: 'pointblank', params: ['userId'] },
    'pointblank': { code: 'pointblank', params: ['userId'] },
  },

  /**
   * Proven MD5 implementation (RFC 1321)
   * Based on Joseph Myers' public domain implementation
   */
  md5(str) {
    const hex_chr = '0123456789abcdef';

    function rhex(num) {
      let s = '';
      for (let j = 0; j < 4; j++) {
        s += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0f) +
          hex_chr.charAt((num >> (j * 8)) & 0x0f);
      }
      return s;
    }

    function add(a, b) {
      const lsw = (a & 0xffff) + (b & 0xffff);
      const msw = (a >> 16) + (b >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }

    function cmn(q, a, b, x, s, t) {
      a = add(add(a, q), add(x, t));
      return add((a << s) | (a >>> (32 - s)), b);
    }

    function f(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function g(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function h(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function i(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

    function md5cycle(x, k) {
      let a = x[0], b = x[1], c = x[2], d = x[3];

      a = f(a, b, c, d, k[0], 7, -680876936); d = f(d, a, b, c, k[1], 12, -389564586);
      c = f(c, d, a, b, k[2], 17, 606105819); b = f(b, c, d, a, k[3], 22, -1044525330);
      a = f(a, b, c, d, k[4], 7, -176418897); d = f(d, a, b, c, k[5], 12, 1200080426);
      c = f(c, d, a, b, k[6], 17, -1473231341); b = f(b, c, d, a, k[7], 22, -45705983);
      a = f(a, b, c, d, k[8], 7, 1770035416); d = f(d, a, b, c, k[9], 12, -1958414417);
      c = f(c, d, a, b, k[10], 17, -42063); b = f(b, c, d, a, k[11], 22, -1990404162);
      a = f(a, b, c, d, k[12], 7, 1804603682); d = f(d, a, b, c, k[13], 12, -40341101);
      c = f(c, d, a, b, k[14], 17, -1502002290); b = f(b, c, d, a, k[15], 22, 1236535329);

      a = g(a, b, c, d, k[1], 5, -165796510); d = g(d, a, b, c, k[6], 9, -1069501632);
      c = g(c, d, a, b, k[11], 14, 643717713); b = g(b, c, d, a, k[0], 20, -373897302);
      a = g(a, b, c, d, k[5], 5, -701558691); d = g(d, a, b, c, k[10], 9, 38016083);
      c = g(c, d, a, b, k[15], 14, -660478335); b = g(b, c, d, a, k[4], 20, -405537848);
      a = g(a, b, c, d, k[9], 5, 568446438); d = g(d, a, b, c, k[14], 9, -1019803690);
      c = g(c, d, a, b, k[3], 14, -187363961); b = g(b, c, d, a, k[8], 20, 1163531501);
      a = g(a, b, c, d, k[13], 5, -1444681467); d = g(d, a, b, c, k[2], 9, -51403784);
      c = g(c, d, a, b, k[7], 14, 1735328473); b = g(b, c, d, a, k[12], 20, -1926607734);

      a = h(a, b, c, d, k[5], 4, -378558); d = h(d, a, b, c, k[8], 11, -2022574463);
      c = h(c, d, a, b, k[11], 16, 1839030562); b = h(b, c, d, a, k[14], 23, -35309556);
      a = h(a, b, c, d, k[1], 4, -1530992060); d = h(d, a, b, c, k[4], 11, 1272893353);
      c = h(c, d, a, b, k[7], 16, -155497632); b = h(b, c, d, a, k[10], 23, -1094730640);
      a = h(a, b, c, d, k[13], 4, 681279174); d = h(d, a, b, c, k[0], 11, -358537222);
      c = h(c, d, a, b, k[3], 16, -722521979); b = h(b, c, d, a, k[6], 23, 76029189);
      a = h(a, b, c, d, k[9], 4, -640364487); d = h(d, a, b, c, k[12], 11, -421815835);
      c = h(c, d, a, b, k[15], 16, 530742520); b = h(b, c, d, a, k[2], 23, -995338651);

      a = i(a, b, c, d, k[0], 6, -198630844); d = i(d, a, b, c, k[7], 10, 1126891415);
      c = i(c, d, a, b, k[14], 15, -1416354905); b = i(b, c, d, a, k[5], 21, -57434055);
      a = i(a, b, c, d, k[12], 6, 1700485571); d = i(d, a, b, c, k[3], 10, -1894986606);
      c = i(c, d, a, b, k[10], 15, -1051523); b = i(b, c, d, a, k[1], 21, -2054922799);
      a = i(a, b, c, d, k[8], 6, 1873313359); d = i(d, a, b, c, k[15], 10, -30611744);
      c = i(c, d, a, b, k[6], 15, -1560198380); b = i(b, c, d, a, k[13], 21, 1309151649);
      a = i(a, b, c, d, k[4], 6, -145523070); d = i(d, a, b, c, k[11], 10, -1120210379);
      c = i(c, d, a, b, k[2], 15, 718787259); b = i(b, c, d, a, k[9], 21, -343485551);

      x[0] = add(a, x[0]);
      x[1] = add(b, x[1]);
      x[2] = add(c, x[2]);
      x[3] = add(d, x[3]);
    }

    // Convert string to UTF-8 byte array
    const utf8 = unescape(encodeURIComponent(str));
    const n = utf8.length;
    const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const state = [1732584193, -271733879, -1732584194, 271733878];
    let idx = 64;

    for (; idx <= n; idx += 64) {
      const blk = [];
      for (let j = 0; j < 64; j += 4) {
        blk[j >> 2] = utf8.charCodeAt(idx - 64 + j) |
          (utf8.charCodeAt(idx - 64 + j + 1) << 8) |
          (utf8.charCodeAt(idx - 64 + j + 2) << 16) |
          (utf8.charCodeAt(idx - 64 + j + 3) << 24);
      }
      md5cycle(state, blk);
    }

    for (let j = idx - 64; j < n; j++) {
      tail[((j) % 64) >> 2] |= utf8.charCodeAt(j) << (((j) % 4) * 8);
    }
    tail[((n) % 64) >> 2] |= 0x80 << (((n) % 4) * 8);

    if ((n % 64) > 55) {
      md5cycle(state, tail);
      for (let j = 0; j < 16; j++) tail[j] = 0;
    }

    // Append bit length
    tail[14] = n * 8;
    md5cycle(state, tail);

    return rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3]);
  },

  getCredentials() {
    const s = GF.get(GF.KEYS.SETTINGS) || {};
    return {
      apiId: s.vipResellerApiId || '',
      apiKey: s.vipResellerApiKey || '',
      active: s.vipResellerActive !== false, // default true jika ada key
    };
  },

  isConfigured() {
    const { apiId, apiKey } = this.getCredentials();
    return !!(apiId && apiKey);
  },

  // Check if this game supports nickname lookup
  supports(gameId) {
    return !!this.GAME_MAP[gameId];
  },

  /**
   * Get nickname
   * @param {string} gameId  - game ID dari storage (ml, ff, pubg, dst)
   * @param {string} userId  - user/target ID
   * @param {string} zoneId  - zone ID (opsional, hanya untuk ML, Genshin, HSR)
   * @returns {Promise<{success:boolean, nickname?:string, error?:string}>}
   */
  async getNickname(gameId, userId, zoneId = '') {
    const { apiId, apiKey } = this.getCredentials();
    if (!apiId || !apiKey) {
      return { success: false, error: 'VIP Reseller belum dikonfigurasi' };
    }

    const gameInfo = this.GAME_MAP[gameId];
    if (!gameInfo) {
      return { success: false, error: `Game "${gameId}" tidak mendukung validasi nickname` };
    }

    const sign = this.md5(apiId + apiKey);

    const needsZone = gameInfo.params.includes('zoneId') || gameInfo.params.includes('zone');

    // Sesuai docs: additional_target wajib dikirim untuk game yang butuh zone
    const body = new URLSearchParams({
      key: apiKey,
      sign: sign,
      type: 'get-nickname',
      code: gameInfo.code,
      target: userId,
      ...(needsZone ? { additional_target: zoneId || '' } : {}),
    });

    try {
      const resp = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();

      // Sesuai docs: response selalu { result: true/false, data: "NicknameName", message: "..." }
      // data adalah string langsung, bukan object
      const isSuccess = data.result === true;

      if (isSuccess && data.data) {
        const nickname = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
        return { success: true, nickname, country: data.country || null };
      } else {
        return { success: false, error: data.message || 'Nickname tidak ditemukan' };
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        return { success: false, error: 'CORS: Jalankan via HTTP server untuk validasi nickname' };
      }
      return { success: false, error: err.message };
    }
  }
};