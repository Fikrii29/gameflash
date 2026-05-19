// =====================================================
// GAMEFLASH - order.js (Order Page Logic)
// =====================================================

let currentGame = null;
let selectedPackage = null;
let selectedPayment = null;
let appliedVoucher = null;
let currentTransaction = null;
let pollTimer = null;
let flashSaleInterval = null; // track flash sale timer to avoid duplicates
let nicknameVerified = false;    // true once nickname confirmed
let nicknameDebounce = null;     // debounce timer
let verifiedNickname = '';       // last confirmed nickname

// ─── INIT ───────────────────────────────────────────
function init() {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('game');
  const games = GF.get(GF.KEYS.GAMES) || [];
  currentGame = games.find(g => g.id === gameId);

  if (!currentGame || !currentGame.active) {
    document.getElementById('notFoundState').style.display = 'block';
    return;
  }

  document.title = `Top Up ${currentGame.name} - Gameflash`;
  document.getElementById('breadGame').textContent = currentGame.name;

  // Show image or emoji in header
  const emojiEl = document.getElementById('gameEmoji');
  if (currentGame.image) {
    emojiEl.innerHTML = `<img src="${currentGame.image}" style="width:70px;height:70px;object-fit:cover;border-radius:16px;" onerror="this.outerHTML='${currentGame.emoji}'"/>`;
    emojiEl.style.background = 'transparent';
    emojiEl.style.border = '1px solid var(--border)';
    emojiEl.style.overflow = 'hidden';
    emojiEl.style.padding = '0';
  } else {
    emojiEl.textContent = currentGame.emoji;
    emojiEl.style.background = `rgba(${hexToRgb(currentGame.color)},0.15)`;
  }
  document.getElementById('gameName').textContent = currentGame.name;
  document.getElementById('gameDesc').textContent = currentGame.description;

  renderPackages();
  renderInputFields();
  renderPaymentMethods();
  document.getElementById('orderContent').style.display = 'block';
  createParticles();
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── PACKAGES ───────────────────────────────────────
function isFlashActive(pkg) {
  if (!pkg.flashSalePrice || pkg.flashSalePrice >= pkg.price) return false;
  if (pkg.flashSaleEnd && new Date(pkg.flashSaleEnd) <= new Date()) return false;
  if (pkg.flashSaleStock !== undefined && pkg.flashSaleStock <= 0) return false;
  return true;
}

function getEffPrice(pkg) {
  return isFlashActive(pkg) ? pkg.flashSalePrice : pkg.price;
}

// ── HELPERS untuk card ────────────────────────────────

// Hitung total diamond dari berbagai format:
// "11 (10+1)" → 11 | "500+500" → 1000 | "112" → 112 | "Weekly Elite Pack" → null
function parseTotalAmount(raw) {
  if (!raw && raw !== 0) return null;
  const s = String(raw);

  // Format "X (A+B)" → ambil X (angka depan)
  const leadMatch = s.match(/^(\d[\d,.]*)/);
  if (leadMatch) {
    const num = parseFloat(leadMatch[1].replace(/,/g, ''));
    if (!isNaN(num)) return num;
  }

  // Format "A+B" saja → jumlahkan
  const plusMatch = s.match(/^(\d+)\+(\d+)$/);
  if (plusMatch) return parseInt(plusMatch[1]) + parseInt(plusMatch[2]);

  return null;
}

// Label currency yang benar per game
// Ambil dari pkg.currency, bersihkan nilai generik/salah seperti "Mobile"
function getCurrencyLabel(pkg) {
  const gameName = (currentGame?.name || '').toLowerCase();

  // Map game → label currency default
  const gameDefaults = {
    'mobile legends': 'Diamond',
    'free fire': 'Diamond',
    'genshin impact': 'Genesis Crystal',
    'honkai star rail': 'Oneiric Shard',
    'pubg mobile': 'UC',
    'valorant': 'VP',
    'clash of clans': 'Gems',
    'clash royale': 'Gems',
    'call of duty mobile': 'CP',
    'cod mobile': 'CP',
    'point blank': 'Cash',
    'league of legends': 'RP',
    'arena of valor': 'Voucher',
    'ragnarok': 'Zeny',
    'tower of fantasy': 'Tanium',
    'zenless zone zero': 'Monochrome',
  };

  // Ambil raw currency dari pkg
  const raw = (pkg.currency || '').trim();

  // Jika currency kosong, 'Mobile', atau angka saja → pakai default game
  const isGeneric = !raw || raw.toLowerCase() === 'mobile' || /^\d+$/.test(raw);
  if (isGeneric) {
    for (const key in gameDefaults) {
      if (gameName.includes(key)) return gameDefaults[key];
    }
    return 'Diamond'; // fallback umum
  }

  return raw;
}

// ── Game Currency Icon ──
// Prioritas: 1) Icon diupload via icon-manager  2) SVG built-in fallback
function getCurrencyIconSVG(gameName) {
  // Cek apakah ada icon yang diupload via icon-manager.html
  if (window.GF_ICONS && currentGame?.id) {
    const uploaded = window.GF_ICONS.get(currentGame.id);
    if (uploaded) return uploaded;
  }

  const g = (gameName || currentGame?.name || '').toLowerCase();

  // Map game → warna gradien + simbol
  const GAME_ICONS = {
    'mobile legends': { colors: ['#00c2ff', '#0066ff'], symbol: '◆', label: 'ML' },
    'free fire': { colors: ['#ff8c00', '#ff4400'], symbol: '🔥', label: 'FF' },
    'pubg': { colors: ['#f5c518', '#c8860a'], symbol: '⬡', label: 'UC' },
    'genshin': { colors: ['#c8a840', '#8a6010'], symbol: '✦', label: 'GI' },
    'honkai star rail': { colors: ['#a855f7', '#7c3aed'], symbol: '✦', label: 'HSR' },
    'star rail': { colors: ['#a855f7', '#7c3aed'], symbol: '✦', label: 'HSR' },
    'valorant': { colors: ['#ff4655', '#bd3944'], symbol: '◈', label: 'VP' },
    'call of duty': { colors: ['#4ade80', '#16a34a'], symbol: '✦', label: 'CP' },
    'cod mobile': { colors: ['#4ade80', '#16a34a'], symbol: '✦', label: 'CP' },
    'clash of clans': { colors: ['#4ade80', '#059669'], symbol: '◆', label: 'GEM' },
    'clash royale': { colors: ['#a855f7', '#7c3aed'], symbol: '◆', label: 'GEM' },
    'league of legends': { colors: ['#c8a840', '#8a6010'], symbol: '⬡', label: 'RP' },
    'wild rift': { colors: ['#c8a840', '#8a6010'], symbol: '⬡', label: 'RP' },
    'zenless': { colors: ['#f59e0b', '#d97706'], symbol: '◈', label: 'ZZZ' },
    'tower of fantasy': { colors: ['#38bdf8', '#0284c7'], symbol: '✦', label: 'TOF' },
    'ragnarok': { colors: ['#fb923c', '#c2410c'], symbol: '⚔', label: 'RAG' },
    'point blank': { colors: ['#64748b', '#334155'], symbol: '●', label: 'PB' },
    'arena of valor': { colors: ['#f43f5e', '#be123c'], symbol: '◆', label: 'AOV' },
    'roblox': { colors: ['#22d3ee', '#0891b2'], symbol: '◎', label: 'ROB' },
    'minecraft': { colors: ['#84cc16', '#4d7c0f'], symbol: '⬡', label: 'MC' },
    'steam': { colors: ['#64748b', '#1e3a5f'], symbol: '⊕', label: 'STM' },
    'playstation': { colors: ['#3b82f6', '#1d4ed8'], symbol: '❖', label: 'PSN' },
    'xbox': { colors: ['#22c55e', '#15803d'], symbol: '⊛', label: 'XBX' },
  };

  let cfg = { colors: ['#00c2ff', '#0066ff'], symbol: '◆', label: 'GEM' };
  for (const key in GAME_ICONS) {
    if (g.includes(key)) { cfg = GAME_ICONS[key]; break; }
  }

  const [c1, c2] = cfg.colors;
  const id = 'gi' + Math.random().toString(36).slice(2, 7);
  // Return a data URI for an inline SVG so it works as <img src="">
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="40" height="40" rx="8" fill="url(#${id})" opacity="0.9"/>
    <text x="20" y="27" text-anchor="middle" font-size="18" fill="white" font-family="Arial,sans-serif">${cfg.symbol}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function getCurrencyIcon(label, gameName) {
  // Kept for compatibility — now delegates to SVG generator
  return getCurrencyIconSVG(gameName);
}

function buildPackageCard(pkg) {
  const flash = isFlashActive(pkg);
  const effPrice = getEffPrice(pkg);
  const flashClass = flash ? ' flash-sale' : '';

  // Badge: bestseller only (flash sale diatur via admin panel, tidak perlu badge disc)
  let badgeHtml = '';
  if (!flash && pkg.bestseller) {
    badgeHtml = `<div class="pkg-badge pkg-badge-best">Terlaris</div>`;
  }

  // ── Display name ──
  const currLabel = getCurrencyLabel(pkg);
  const displayName = pkg.name || pkg.amount || '';

  // ── Icon: pakai gambar custom admin jika ada, fallback ke SVG built-in ──
  const svgIcon = getCurrencyIconSVG(currentGame?.name);
  const iconSrc = pkg.icon || pkg.image || svgIcon;
  const iconHtml = `<img src="${iconSrc}" alt="${currLabel}" class="pkg-icon-img"
    onerror="this.src='${svgIcon}';this.onerror=null;"/>`;

  // ── Price ──
  let priceHtml = `<div class="pkg-price">${formatRupiah(effPrice)}</div>`;
  if (flash) {
    priceHtml = `
      <div class="pkg-price-original">${formatRupiah(pkg.price)}</div>
      <div class="pkg-price">${formatRupiah(pkg.flashSalePrice)}</div>`;
  }

  return `
  <div class="package-card${flashClass}" id="pkg_${pkg.id}" onclick="selectPackage('${pkg.id}')">
    ${badgeHtml}
    <div class="pkg-name">${displayName}</div>
    <div class="pkg-mid">
      ${iconHtml}
      <div class="pkg-price-col">
        ${priceHtml}
      </div>
    </div>
    <div class="pkg-instan">
      <div class="pkg-instan-icon">✓</div>
      Prosesan INSTAN
    </div>
  </div>`;
}

function renderPackages() {
  const grid = document.getElementById('packageGrid');
  const pkgs = currentGame.packages.filter(p => p.active);

  // Group by category
  const grouped = {};
  const categoryOrder = [];
  pkgs.forEach(pkg => {
    const cat = pkg.category || 'Paket Utama';
    if (!grouped[cat]) {
      grouped[cat] = [];
      categoryOrder.push(cat);
    }
    grouped[cat].push(pkg);
  });

  // Category label icons
  const catIcons = {
    'First Top Up': '🤩',
    'Double Diamond': '🤩',
    'Special': '🔥',
    'Special Items': '🔥',
    'Subscription': '👑',
    'Weekly': '📅',
    'Monthly': '📅',
    'Starlight': '⭐',
  };

  const getCatIcon = (cat) => {
    for (const key in catIcons) {
      if (cat.toLowerCase().includes(key.toLowerCase())) return catIcons[key];
    }
    return '💎';
  };

  // Map keyword → color class
  const getCatClass = (cat) => {
    const c = cat.toLowerCase();
    if (c.includes('special')) return 'cat-special';
    if (c.includes('top up') || c.includes('paket utama') || c.includes('diamond')) return 'cat-diamond';
    if (c.includes('first') || c.includes('double')) return 'cat-first';
    if (c.includes('subscription') || c.includes('starlight') || c.includes('weekly') || c.includes('monthly')) return 'cat-sub';
    return 'cat-default';
  };

  grid.innerHTML = categoryOrder.map(cat => {
    const cards = grouped[cat].map(pkg => buildPackageCard(pkg)).join('');
    return `
      <div class="pkg-category-section">
        <div class="pkg-category-header ${getCatClass(cat)}">
          <span class="pkg-cat-icon">${getCatIcon(cat)}</span>
          <span class="pkg-cat-label">${cat}</span>
        </div>
        <div class="pkg-category-grid">
          ${cards}
        </div>
      </div>`;
  }).join('');

  // Force inline styles so they always apply regardless of CSS specificity/cache
  const colorMap = {
    'cat-diamond': { bg: 'linear-gradient(135deg,rgba(14,165,233,0.3),rgba(56,189,248,0.15))', border: 'rgba(56,189,248,0.6)', color: '#7dd3fc' },
    'cat-special': { bg: 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(251,191,36,0.15))', border: 'rgba(245,158,11,0.6)', color: '#fcd34d' },
    'cat-first': { bg: 'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(167,139,250,0.15))', border: 'rgba(167,139,250,0.6)', color: '#c4b5fd' },
    'cat-sub': { bg: 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(52,211,153,0.15))', border: 'rgba(52,211,153,0.6)', color: '#6ee7b7' },
    'cat-default': { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.18)', color: '#f0f0ff' },
  };
  grid.querySelectorAll('.pkg-category-header').forEach(el => {
    const cls = [...el.classList].find(c => c.startsWith('cat-'));
    const cfg = colorMap[cls] || colorMap['cat-default'];
    el.style.cssText = `display:inline-flex;align-items:center;gap:7px;padding:6px 14px 6px 10px;border-radius:8px;margin-bottom:4px;background:${cfg.bg};border:1px solid ${cfg.border};box-shadow:0 0 14px ${cfg.border.replace('0.6', '0.15')};`;
    const label = el.querySelector('.pkg-cat-label');
    if (label) label.style.cssText = `font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1.05rem;color:${cfg.color};letter-spacing:0.3px;`;
  });

  // Start flash sale countdown on order page
  initOrderFlashTimer();
}

function initOrderFlashTimer() {
  const pkgs = currentGame.packages.filter(p => p.active && isFlashActive(p) && p.flashSaleEnd);

  // Clear previous interval to avoid stacking multiple timers
  if (flashSaleInterval) {
    clearInterval(flashSaleInterval);
    flashSaleInterval = null;
  }

  // Remove any existing banner to prevent duplicates
  const existing = document.getElementById('flashSaleTimer');
  if (existing) existing.remove();

  if (pkgs.length === 0) return;

  // Find nearest end time
  const nearest = pkgs.reduce((min, p) => {
    const end = new Date(p.flashSaleEnd);
    return end < min ? end : min;
  }, new Date(pkgs[0].flashSaleEnd));

  const grid = document.getElementById('packageGrid');
  const banner = document.createElement('div');
  banner.id = 'flashSaleTimer';
  banner.style.cssText = 'background:linear-gradient(135deg,rgba(239,68,68,0.1),rgba(249,115,22,0.1));border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;';
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:1.3rem;">🔥</span>
      <span style="font-family:'Rajdhani',sans-serif;font-weight:700;color:#ef4444;font-size:0.95rem;">FLASH SALE</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;font-family:'Rajdhani',sans-serif;font-weight:700;color:#ef4444;">
      <span>Berakhir</span>
      <span id="fsHours" style="background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:6px;">00</span>:
      <span id="fsMinutes" style="background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:6px;">00</span>:
      <span id="fsSeconds" style="background:rgba(239,68,68,0.15);padding:2px 8px;border-radius:6px;">00</span>
    </div>`;
  grid.insertBefore(banner, grid.firstChild);

  flashSaleInterval = setInterval(() => {
    const diff = Math.max(nearest - new Date(), 0);
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    const hE = document.getElementById('fsHours'), mE = document.getElementById('fsMinutes'), sE = document.getElementById('fsSeconds');
    if (hE) hE.textContent = String(h).padStart(2, '0');
    if (mE) mE.textContent = String(m).padStart(2, '0');
    if (sE) sE.textContent = String(s).padStart(2, '0');
    if (diff <= 0) renderPackages(); // Re-render to remove expired flash sales
  }, 1000);
}

function selectPackage(pkgId) {
  const pkgs = currentGame.packages.filter(p => p.active);
  selectedPackage = pkgs.find(p => p.id === pkgId);
  document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('pkg_' + pkgId).classList.add('selected');
  updateSummary();
  validateForm();
}

// ─── INPUT FIELDS ────────────────────────────────────
function renderInputFields() {
  const container = document.getElementById('inputFields');
  const supportsNick = VipReseller.supports(currentGame.id) && VipReseller.isConfigured();

  container.innerHTML = currentGame.inputFields.map(f => {
    let inputEl = '';
    if (f.type === 'select') {
      inputEl = `<select class="form-control" id="field_${f.name}" onchange="onFieldChange()">
        <option value="">-- Pilih ${f.label} --</option>
        ${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}
      </select>`;
    } else {
      inputEl = `<input type="${f.type}" class="form-control" id="field_${f.name}" placeholder="${f.placeholder}" oninput="onFieldChange()"/>`;
    }

    // Tambahkan tombol Cek di sebelah field userId jika game didukung VIP Reseller
    const isUserIdField = f.name === 'userId';
    const showCheckBtn = isUserIdField && supportsNick;

    if (showCheckBtn) {
      return `<div class="form-group">
        <label class="form-label">${f.label} <span style="color:var(--red)">*</span></label>
        <div style="display:flex;gap:8px;align-items:center;">
          ${inputEl}
          <button type="button" id="btnCheckNick" class="btn-check-nick" onclick="manualCheckNickname()">
            🔍 Cek
          </button>
        </div>
      </div>`;
    }

    return `<div class="form-group"><label class="form-label">${f.label} <span style="color:var(--red)">*</span></label>${inputEl}</div>`;
  }).join('');
}

// Trigger nickname check manual (via tombol Cek)
function manualCheckNickname() {
  const supportsNick = VipReseller.supports(currentGame.id) && VipReseller.isConfigured();
  if (!supportsNick) return;

  const userId = document.getElementById('field_userId')?.value.trim();
  const zoneEl = document.getElementById('field_zoneId');
  const zoneId = zoneEl ? zoneEl.value.trim() : '';
  const needsZone = VipReseller.GAME_MAP[currentGame.id]?.params.includes('zoneId');

  if (!userId) {
    showNicknameError('Isi User ID terlebih dahulu');
    return;
  }
  if (needsZone && !zoneId) {
    showNicknameError('Isi Zone ID terlebih dahulu');
    return;
  }

  // Cancel debounce yang mungkin sedang berjalan
  clearTimeout(nicknameDebounce);

  // Update tombol ke state loading
  const btn = document.getElementById('btnCheckNick');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-sm" style="display:inline-block;vertical-align:middle;margin-right:6px;"></span>Cek...';
  }

  fetchNickname(userId, zoneId).finally(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔍 Cek';
    }
  });
}

// Called whenever any ID field changes
function onFieldChange() {
  // Reset nickname state
  nicknameVerified = false;
  verifiedNickname = '';
  hideNicknameBox();
  updateSummary();
  validateForm();

  const supportsNick = VipReseller.supports(currentGame.id) && VipReseller.isConfigured();
  if (!supportsNick) return;

  const userId = document.getElementById('field_userId')?.value.trim();
  const zoneEl = document.getElementById('field_zoneId');
  const zoneId = zoneEl ? zoneEl.value.trim() : '';

  // For ML/Genshin/HSR: need both userId + zoneId
  const needsZone = VipReseller.GAME_MAP[currentGame.id]?.params.includes('zoneId');
  if (!userId || (needsZone && !zoneId)) return;

  // Debounce 800ms
  clearTimeout(nicknameDebounce);
  nicknameDebounce = setTimeout(() => fetchNickname(userId, zoneId), 800);
}

// ─── NICKNAME LOOKUP ──────────────────────────────
async function fetchNickname(userId, zoneId) {
  showNicknameLoading();
  const result = await VipReseller.getNickname(currentGame.id, userId, zoneId);
  if (result.success) {
    verifiedNickname = result.nickname;
    nicknameVerified = true;
    showNicknameSuccess(result.nickname);
  } else {
    nicknameVerified = false;
    verifiedNickname = '';
    showNicknameError(result.error);
  }
  validateForm();
}

function showNicknameLoading() {
  const box = document.getElementById('nicknameBox');
  box.style.display = 'block';
  box.innerHTML = `<div class="nickname-box loading"><div class="spinner-sm"></div><span>Memeriksa akun...</span></div>`;
}

function showNicknameSuccess(nickname) {
  const box = document.getElementById('nicknameBox');
  const initial = nickname.charAt(0).toUpperCase();
  box.style.display = 'block';
  box.innerHTML = `
    <div class="nickname-box success">
      <div class="nickname-avatar">${initial}</div>
      <div>
        <div class="nickname-name">${nickname}</div>
        <div class="nickname-label">✅ Akun ditemukan & terverifikasi</div>
      </div>
    </div>`;
  // Update summary username
  const usernameEl = document.getElementById('sumUsername');
  if (usernameEl) usernameEl.textContent = nickname;
}

function showNicknameError(msg) {
  const box = document.getElementById('nicknameBox');
  box.style.display = 'block';
  box.innerHTML = `<div class="nickname-box error">❌ ${msg || 'Akun tidak ditemukan. Periksa User ID & Zone ID.'}</div>`;
}

function hideNicknameBox() {
  const box = document.getElementById('nicknameBox');
  if (box) { box.style.display = 'none'; box.innerHTML = ''; }
  // Reset username back to raw userId value
  const usernameEl = document.getElementById('sumUsername');
  if (usernameEl) {
    const userIdField = document.getElementById('field_userId');
    usernameEl.textContent = (userIdField ? userIdField.value.trim() : '') || '-';
  }
}

// ─── PAYMENT METHODS (Multi-Gateway) ─────────────────
let activeGateway = 'auto'; // 'tokopay', 'tripay', or 'auto'

function detectGateways() {
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const hasTokopay = !!(settings.tokopayMerchantId && settings.tokopaySecretKey);
  const hasTripay = !!(settings.tripayApiKey && settings.tripayPrivateKey && settings.tripayMerchantCode);
  return { hasTokopay, hasTripay };
}

function renderPaymentMethods() {
  const { hasTokopay, hasTripay } = detectGateways();
  const container = document.getElementById('paymentGroups');

  // Build gateway tabs if both configured
  let tabsHtml = '';
  if (hasTokopay && hasTripay) {
    tabsHtml = `
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <button class="gateway-tab active" id="gwTokopay" onclick="switchGateway('tokopay',this)" style="flex:1;padding:10px;background:rgba(0,212,255,0.08);border:1px solid var(--cyan);border-radius:8px;color:var(--cyan);font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s;">💳 Tokopay</button>
        <button class="gateway-tab" id="gwTripay" onclick="switchGateway('tripay',this)" style="flex:1;padding:10px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;color:var(--text-muted);font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s;">🔄 Tripay</button>
      </div>`;
    activeGateway = 'tokopay';
  } else if (hasTripay) {
    activeGateway = 'tripay';
  } else {
    activeGateway = 'tokopay';
  }

  container.innerHTML = tabsHtml +
    '<div id="paymentMethodsList"></div>';

  renderGatewayMethods(activeGateway);
}

function switchGateway(gw, btn) {
  activeGateway = gw;
  // Update tab styles
  document.querySelectorAll('.gateway-tab').forEach(t => {
    t.style.background = 'var(--bg-secondary)';
    t.style.borderColor = 'var(--border)';
    t.style.color = 'var(--text-muted)';
    t.classList.remove('active');
  });
  btn.style.background = 'rgba(0,212,255,0.08)';
  btn.style.borderColor = 'var(--cyan)';
  btn.style.color = 'var(--cyan)';
  btn.classList.add('active');

  // Clear selection
  selectedPayment = null;
  validateForm();
  renderGatewayMethods(gw);
}

function renderGatewayMethods(gw) {
  const methods = gw === 'tripay'
    ? Tripay.PAYMENT_METHODS
    : TokoPay.PAYMENT_METHODS;

  const groupMap = [
    { id: 'qris', label: '📱 QRIS', filter: m => m.category === 'qris' },
    { id: 'va', label: '🏦 Virtual Account', filter: m => m.category === 'va' },
    { id: 'ewallet', label: '💳 E-Wallet', filter: m => m.category === 'ewallet' },
    { id: 'retail', label: '🏪 Retail / Minimarket', filter: m => m.category === 'retail' },
  ];

  const list = document.getElementById('paymentMethodsList');
  list.innerHTML = groupMap.map(group => {
    const filtered = methods.filter(group.filter);
    if (filtered.length === 0) return '';
    return `<div>
      <div class="payment-group-title">${group.label}</div>
      <div class="payment-grid">
        ${filtered.map(m => `
          <div class="payment-card" id="pay_${gw}_${m.id}" onclick="selectPaymentGw('${gw}','${m.id}')">
            <div class="payment-icon">${m.img ? `<img src="${m.img}" alt="${m.name}" style="width:38px;height:38px;object-fit:contain;" onerror="this.style.display='none'" />` : m.icon}</div>
            <div class="payment-name">${m.name}</div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }).join('');
}

function selectPaymentGw(gw, id) {
  const methods = gw === 'tripay' ? Tripay.PAYMENT_METHODS : TokoPay.PAYMENT_METHODS;
  selectedPayment = methods.find(m => m.id === id);
  if (selectedPayment) selectedPayment._gateway = gw;

  document.querySelectorAll('.payment-card').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById(`pay_${gw}_${id}`);
  if (el) el.classList.add('selected');
  updateSummary();
  validateForm();
}

// ─── VOUCHER ─────────────────────────────────────────
function applyVoucher() {
  const code = document.getElementById('voucherInput').value.trim().toUpperCase();
  const msgEl = document.getElementById('voucherMsg');
  if (!code) { msgEl.innerHTML = `<div class="voucher-error">Masukkan kode voucher</div>`; return; }

  const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
  const now = new Date();
  const v = vouchers.find(v => v.code === code && v.active && new Date(v.expiry) >= now && v.usedCount < v.usageLimit);

  if (!v) {
    appliedVoucher = null;
    msgEl.innerHTML = `<div class="voucher-error">❌ Kode voucher tidak valid atau sudah kadaluarsa</div>`;
  } else if (selectedPackage && selectedPackage.price < v.minPurchase) {
    appliedVoucher = null;
    msgEl.innerHTML = `<div class="voucher-error">❌ Minimum pembelian ${formatRupiah(v.minPurchase)} untuk voucher ini</div>`;
  } else {
    appliedVoucher = v;
    const disc = calculateDiscount();
    msgEl.innerHTML = `<div class="voucher-success">✅ Voucher berhasil! Hemat ${formatRupiah(disc)}</div>`;
  }
  updateSummary();
}

function calculateDiscount() {
  if (!appliedVoucher || !selectedPackage) return 0;
  const basePrice = getEffPrice(selectedPackage);
  let disc = 0;
  if (appliedVoucher.type === 'percent') {
    disc = Math.floor(basePrice * appliedVoucher.value / 100);
    disc = Math.min(disc, appliedVoucher.maxDiscount);
  } else {
    disc = appliedVoucher.value;
  }
  return Math.min(disc, basePrice);
}

// ─── SUMMARY ─────────────────────────────────────────
function updateSummary() {
  document.getElementById('sumGame').textContent = currentGame ? currentGame.name : '-';

  // Username: pakai nickname terverifikasi, atau nilai field userId jika ada
  const usernameEl = document.getElementById('sumUsername');
  if (usernameEl) {
    const userIdField = document.getElementById('field_userId');
    const displayName = verifiedNickname || (userIdField ? userIdField.value.trim() : '') || '-';
    usernameEl.textContent = displayName;
  }

  if (selectedPackage) {
    const effPrice = getEffPrice(selectedPackage);
    // Tampilkan nama paket bersih: total amount + currency (tanpa format A+B)
    const _totalAmt = parseTotalAmount(selectedPackage.amount ?? selectedPackage.name);
    const _currLbl = getCurrencyLabel(selectedPackage);
    const _pkgLabel = _totalAmt !== null
      ? `${_totalAmt.toLocaleString('id-ID')} ${_currLbl}`
      : (selectedPackage.name || selectedPackage.amount || '-');
    document.getElementById('sumPackage').textContent = _pkgLabel;
    document.getElementById('sumPrice').textContent = formatRupiah(effPrice);
    const disc = calculateDiscount();
    if (disc > 0) {
      document.getElementById('sumDiscountRow').style.display = 'flex';
      document.getElementById('sumDiscount').textContent = '-' + formatRupiah(disc);
    } else {
      document.getElementById('sumDiscountRow').style.display = 'none';
    }
    document.getElementById('sumTotal').textContent = formatRupiah(effPrice - disc);
  } else {
    document.getElementById('sumPackage').textContent = '-';
    document.getElementById('sumPrice').textContent = '-';
    document.getElementById('sumTotal').textContent = '-';
  }
}

// ─── VALIDATION ────────────────────────────────────
function validateForm() {
  const phone = document.getElementById('customerPhone').value.trim();
  const fieldsOk = currentGame.inputFields.every(f => {
    const el = document.getElementById('field_' + f.name);
    return el && el.value.trim();
  });

  // If VIP Reseller configured & game supported, require nickname verification
  const needsNickVerify = VipReseller.supports(currentGame.id) && VipReseller.isConfigured();
  const nickOk = !needsNickVerify || nicknameVerified;

  const ok = selectedPackage && selectedPayment && phone && fieldsOk && nickOk;
  document.getElementById('btnOrder').disabled = !ok;
}

document.getElementById('customerPhone').addEventListener('input', validateForm);

// ─── PROCESS ORDER ───────────────────────────────────
async function processOrder() {
  const btn = document.getElementById('btnOrder');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Memproses...';

  try {
    const phone = document.getElementById('customerPhone').value.trim().replace(/^0/, '62');
    const fieldData = {};
    currentGame.inputFields.forEach(f => {
      fieldData[f.name] = document.getElementById('field_' + f.name).value.trim();
    });

    const disc = calculateDiscount();
    const effPrice = getEffPrice(selectedPackage);
    const finalAmount = effPrice - disc;
    const invoiceId = generateInvoiceId();

    // Deduct flash sale stock if applicable
    if (isFlashActive(selectedPackage) && selectedPackage.flashSaleStock !== undefined) {
      const games = GF.get(GF.KEYS.GAMES) || [];
      const gIdx = games.findIndex(g => g.id === currentGame.id);
      if (gIdx !== -1) {
        const pIdx = games[gIdx].packages.findIndex(p => p.id === selectedPackage.id);
        if (pIdx !== -1 && games[gIdx].packages[pIdx].flashSaleStock > 0) {
          games[gIdx].packages[pIdx].flashSaleStock--;
          GF.set(GF.KEYS.GAMES, games);
        }
      }
    }

    currentTransaction = {
      id: invoiceId,
      invoiceId,
      gameId: currentGame.id,
      gameName: currentGame.name,
      gameEmoji: currentGame.emoji,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packageSku: selectedPackage.sku,
      nickname: verifiedNickname || '',   // simpan nickname terverifikasi
      ...fieldData,
      customerPhone: phone,
      amount: selectedPackage.price,
      discount: disc,
      finalAmount,
      voucherCode: appliedVoucher ? appliedVoucher.code : '',
      paymentMethod: selectedPayment.id,
      paymentMethodName: selectedPayment.name,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create payment via selected gateway
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    const gw = selectedPayment._gateway || 'tokopay';
    let paymentResult;

    if (gw === 'tripay' && Tripay.isConfigured()) {
      // Use Tripay
      paymentResult = await Tripay.createOrder({
        refId: invoiceId, amount: finalAmount, paymentMethod: selectedPayment.id,
        customerName: verifiedNickname || 'Customer', customerPhone: phone
      });
      if (!paymentResult.success) {
        // Fallback to simulation
        paymentResult = Tripay.simulatePayment(invoiceId, selectedPayment.id, finalAmount);
      }
      currentTransaction.paymentGateway = 'tripay';
    } else if (settings.tokopayMerchantId && settings.tokopaySecretKey) {
      // Use Tokopay
      paymentResult = await TokoPay.createOrder({
        refId: invoiceId, amount: finalAmount, paymentMethod: selectedPayment.id,
        customerPhone: phone
      });
      if (!paymentResult.success) {
        paymentResult = TokoPay.simulatePayment(invoiceId, selectedPayment.id, finalAmount);
      }
      currentTransaction.paymentGateway = 'tokopay';
    } else {
      // Demo simulation
      paymentResult = TokoPay.simulatePayment(invoiceId, selectedPayment.id, finalAmount);
      currentTransaction.paymentGateway = 'demo';
    }

    currentTransaction.paymentData = paymentResult.data || {};
    currentTransaction.vaNumber = paymentResult.vaNumber;
    currentTransaction.qrCode = paymentResult.qrCode;
    currentTransaction.qrString = paymentResult.qrString || paymentResult.data?.qr_string || null;
    currentTransaction.paymentUrl = paymentResult.paymentUrl;
    currentTransaction.expiredAt = paymentResult.expiredAt;
    currentTransaction.retryCount = 0;
    currentTransaction.retryLog = [];

    // Save transaction
    const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
    txs.unshift(currentTransaction);
    GF.set(GF.KEYS.TRANSACTIONS, txs);

    // Update voucher usage
    if (appliedVoucher) {
      const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
      const idx = vouchers.findIndex(v => v.id === appliedVoucher.id);
      if (idx !== -1) { vouchers[idx].usedCount++; GF.set(GF.KEYS.VOUCHERS, vouchers); }
    }

    // Notify customer & admin
    await Fonnte.notifyOrderCreated(currentTransaction);
    await Fonnte.notifyAdminNewOrder(currentTransaction);

    // Show payment modal
    showPaymentModal(paymentResult);
    startPaymentPolling();

  } catch (err) {
    console.error(err);
    showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💳 Bayar Sekarang';
    validateForm();
  }
}

// ─── PAYMENT MODAL ───────────────────────────────────
function showPaymentModal(paymentResult) {
  const disc = calculateDiscount();
  const finalAmount = selectedPackage.price - disc;
  const modal = document.getElementById('paymentModal');
  const body = document.getElementById('paymentModalBody');

  let paymentContent = '';
  if (selectedPayment.category === 'qris') {
    // Prioritas: qrString (raw QRIS string) -> generate QR via qrserver.com
    // Fallback: qrCode (image URL langsung dari gateway)
    const rawQrString = paymentResult.qrString || paymentResult.data?.qr_string || null;
    const directImageUrl = paymentResult.qrCode || paymentResult.data?.qr_link || null;

    let qrContent;
    if (rawQrString) {
      // Generate QR image dari raw QRIS string - ini yang bisa di-scan
      const qrGenUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&ecc=M&data=' + encodeURIComponent(rawQrString);
      qrContent = `<img src="${qrGenUrl}" style="width:220px;height:220px;object-fit:contain;border-radius:8px;" onerror="this.outerHTML='<div style=\"text-align:center;padding:16px;font-size:0.75rem;color:#666;\">QR tidak tersedia</div>'" />`;
    } else if (directImageUrl && directImageUrl.startsWith('http')) {
      qrContent = `<img src="${directImageUrl}" style="width:220px;height:220px;object-fit:contain;border-radius:8px;" onerror="this.outerHTML='<div style=\"text-align:center;padding:16px;font-size:0.75rem;color:#666;\">QR tidak tersedia</div>'" />`;
    } else {
      qrContent = `<div style="text-align:center;padding:16px;"><div style="font-size:2rem;">📱</div><div style="font-size:0.75rem;color:#666;margin-top:4px;">${currentTransaction.invoiceId}</div></div>`;
    }
    paymentContent = `
      <div class="qr-box">
        <p style="font-size:0.875rem;color:var(--text-muted);margin-bottom:16px;">Scan QR Code dengan aplikasi apapun</p>
        <div class="qr-img">${qrContent}</div>
        <p style="font-size:0.8rem;color:var(--text-muted);">Bayar dengan GoPay, OVO, DANA, BCA, BNI, dll</p>
        ${paymentResult.paymentUrl ? `<a href="${paymentResult.paymentUrl}" target="_blank" style="display:inline-block;margin-top:8px;font-size:0.8rem;color:var(--cyan);">🔗 Buka halaman pembayaran →</a>` : ''}
      </div>`;
  } else if (selectedPayment.category === 'va') {
    paymentContent = `
      <div class="va-box">
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">${selectedPayment.name}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div class="va-number" id="vaNumberDisplay">${paymentResult.vaNumber || '8800XXXXXXXXXXXX'}</div>
          <button class="copy-btn" onclick="copyVA()">📋 Salin</button>
        </div>
      </div>
      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">Transfer tepat sesuai nominal berikut:</p>`;
  } else {
    paymentContent = `
      <div class="va-box">
        <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Klik tombol di bawah untuk membuka ${selectedPayment.name}</div>
        <a href="${paymentResult.paymentUrl || '#'}" target="_blank" class="btn-order" style="display:block;text-align:center;text-decoration:none;padding:12px;">
          ${selectedPayment.icon} Bayar via ${selectedPayment.name}
        </a>
      </div>`;
  }

  body.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:2rem;margin-bottom:8px;">${selectedPayment.icon}</div>
      <div style="font-size:1.3rem;font-family:'Rajdhani',sans-serif;font-weight:700;color:var(--cyan);">${formatRupiah(finalAmount)}</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">Invoice: ${currentTransaction.invoiceId}</div>
    </div>
    ${paymentContent}
    <div class="invoice-divider"></div>
    <div class="invoice-row"><span class="key">Game</span><span class="val">${currentGame.name} - ${selectedPackage.name}</span></div>
    <div class="invoice-row"><span class="key">User ID</span><span class="val">${currentTransaction.userId}${currentTransaction.zoneId ? ' | ' + currentTransaction.zoneId : ''}</span></div>
    <div class="invoice-row" id="countdownRow">
      <span class="key">Batas Waktu</span>
      <span class="val countdown" id="countdown">60:00</span>
    </div>
    <div style="margin-top:20px;display:flex;flex-direction:column;gap:10px;">
      <button class="btn-order" onclick="checkPaymentStatus()" id="btnCheckStatus">
        🔄 Cek Status Pembayaran
      </button>
      <a href="check-order.html?invoice=${currentTransaction.invoiceId}" 
         style="display:block;text-align:center;font-size:0.875rem;color:var(--cyan);margin-top:4px;">
        Lihat detail pesanan →
      </a>
    </div>
  `;

  modal.classList.add('active');
  startCountdown(3600);
}

function startCountdown(seconds) {
  let remaining = seconds;
  const el = document.getElementById('countdown');
  const timer = setInterval(() => {
    if (!el || remaining <= 0) { clearInterval(timer); return; }
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
    remaining--;
  }, 1000);
}

function startPaymentPolling() {
  let attempts = 0;
  pollTimer = setInterval(async () => {
    attempts++;
    if (attempts > 120) { clearInterval(pollTimer); return; } // 10 mins max

    const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
    const tx = txs.find(t => t.invoiceId === currentTransaction.invoiceId);

    // Check local status first
    if (tx && tx.paymentStatus === 'paid') {
      clearInterval(pollTimer);
      handlePaymentSuccess(tx);
      return;
    }

    // Poll real gateway every 3rd attempt
    if (attempts % 3 === 0) {
      const settings = GF.get(GF.KEYS.SETTINGS) || {};
      const gw = currentTransaction.paymentGateway || 'tokopay';
      let result = null;

      if (gw === 'tripay' && Tripay.isConfigured()) {
        result = await Tripay.checkStatus(currentTransaction.paymentData?.reference || currentTransaction.invoiceId);
      } else if (settings.tokopayMerchantId) {
        result = await TokoPay.checkStatus(currentTransaction.invoiceId);
      }

      if (result && result.isPaid) {
        clearInterval(pollTimer);
        handlePaymentSuccess(currentTransaction);
      }
    }
  }, 5000);
}

async function checkPaymentStatus() {
  const btn = document.getElementById('btnCheckStatus');
  btn.innerHTML = '<div class="spinner"></div> Mengecek...';
  btn.disabled = true;

  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const gw = currentTransaction.paymentGateway || 'tokopay';

  // Check real gateway
  if (gw === 'tripay' && Tripay.isConfigured()) {
    const ref = currentTransaction.paymentData?.reference || currentTransaction.invoiceId;
    const result = await Tripay.checkStatus(ref);
    if (result.isPaid) { handlePaymentSuccess(currentTransaction); return; }
  } else if (settings.tokopayMerchantId) {
    const result = await TokoPay.checkStatus(currentTransaction.invoiceId);
    if (result.isPaid) { handlePaymentSuccess(currentTransaction); return; }
  }

  // Check localStorage (for demo)
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const tx = txs.find(t => t.invoiceId === currentTransaction.invoiceId);
  if (tx && tx.paymentStatus === 'paid') {
    handlePaymentSuccess(tx);
  } else {
    showToast('Pembayaran belum terkonfirmasi. Silakan coba beberapa saat lagi.', 'info');
  }

  setTimeout(() => {
    btn.innerHTML = '🔄 Cek Status Pembayaran';
    btn.disabled = false;
  }, 2000);
}

// ─── AUTO-PROCESS & AUTO-RETRY/REFUND ────────────────
const MAX_RETRY = 3;
const RETRY_DELAY = 30000; // 30 seconds

async function handlePaymentSuccess(tx) {
  clearInterval(pollTimer);
  await Fonnte.notifyPaymentReceived(tx);

  // Update status to processing
  updateTxStatus(tx.invoiceId, { status: 'processing', paymentStatus: 'paid' });

  // Auto-process: Send to Digiflazz
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  if (settings.digiflazzUsername && settings.digiflazzApiKey) {
    await processWithRetry(tx, 0);
  } else {
    // Demo mode: simulate auto-success after 3s
    setTimeout(async () => {
      updateTxStatus(tx.invoiceId, { status: 'success' });
      await Fonnte.notifyOrderSuccess({ ...tx, status: 'success' });
    }, 3000);
  }

  window.location.href = `check-order.html?invoice=${tx.invoiceId}`;
}

async function processWithRetry(tx, attempt) {
  const now = new Date().toISOString();
  console.log(`[AutoProcess] Attempt ${attempt + 1}/${MAX_RETRY} for ${tx.invoiceId}`);

  try {
    const result = await DigiFlazz.createTransaction({
      refId: tx.invoiceId, sku: tx.packageSku, customerNo: tx.userId
    });

    // Log retry attempt
    addRetryLog(tx.invoiceId, {
      attempt: attempt + 1,
      time: now,
      success: result.success,
      response: result.data?.message || result.error || 'OK',
      rc: result.data?.rc || null
    });

    if (result.success) {
      // Success!
      updateTxStatus(tx.invoiceId, { status: 'success' });
      const freshTx = getTxByInvoice(tx.invoiceId);
      await Fonnte.notifyOrderSuccess(freshTx);
      console.log(`[AutoProcess] ✅ Success for ${tx.invoiceId}`);
    } else {
      // Check if should retry
      const isRetryable = isRetryableError(result);
      if (isRetryable && attempt + 1 < MAX_RETRY) {
        console.log(`[AutoProcess] ⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
        updateTxStatus(tx.invoiceId, {
          status: 'retrying',
          retryCount: attempt + 1,
          lastRetryAt: now
        });
        setTimeout(() => processWithRetry(tx, attempt + 1), RETRY_DELAY);
      } else {
        // Permanent failure → auto-refund
        console.log(`[AutoProcess] ❌ Permanent failure for ${tx.invoiceId}`);
        updateTxStatus(tx.invoiceId, {
          status: 'failed',
          retryCount: attempt + 1,
          failReason: result.data?.message || result.error || 'Gagal diproses oleh supplier',
          refundStatus: 'pending'
        });
        const freshTx = getTxByInvoice(tx.invoiceId);
        await Fonnte.notifyOrderFailed(freshTx);
        await Fonnte.notifyAdminRefund(freshTx);
      }
    }
  } catch (err) {
    console.error('[AutoProcess] Error:', err);
    addRetryLog(tx.invoiceId, { attempt: attempt + 1, time: now, success: false, response: err.message });

    if (attempt + 1 < MAX_RETRY) {
      updateTxStatus(tx.invoiceId, { status: 'retrying', retryCount: attempt + 1 });
      setTimeout(() => processWithRetry(tx, attempt + 1), RETRY_DELAY);
    } else {
      updateTxStatus(tx.invoiceId, {
        status: 'failed',
        retryCount: attempt + 1,
        failReason: err.message,
        refundStatus: 'pending'
      });
      const freshTx = getTxByInvoice(tx.invoiceId);
      await Fonnte.notifyOrderFailed(freshTx);
      await Fonnte.notifyAdminRefund(freshTx);
    }
  }
}

function isRetryableError(result) {
  // Some errors are permanent (wrong SKU, wrong ID, etc)
  const permanentCodes = ['14', '20', '21', '40'];
  if (result.data?.rc && permanentCodes.includes(result.data.rc)) return false;
  // Network errors, timeout, or supplier busy are retryable
  return true;
}

// ─── TX HELPER FUNCTIONS ─────────────────────────────
function updateTxStatus(invoiceId, updates) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const idx = txs.findIndex(t => t.invoiceId === invoiceId);
  if (idx !== -1) {
    Object.assign(txs[idx], updates, { updatedAt: new Date().toISOString() });
    GF.set(GF.KEYS.TRANSACTIONS, txs);
  }
}

function addRetryLog(invoiceId, log) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const idx = txs.findIndex(t => t.invoiceId === invoiceId);
  if (idx !== -1) {
    if (!txs[idx].retryLog) txs[idx].retryLog = [];
    txs[idx].retryLog.push(log);
    GF.set(GF.KEYS.TRANSACTIONS, txs);
  }
}

function getTxByInvoice(invoiceId) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  return txs.find(t => t.invoiceId === invoiceId);
}

function copyVA() {
  const va = document.getElementById('vaNumberDisplay');
  if (va) { navigator.clipboard.writeText(va.textContent); showToast('Nomor VA disalin!', 'success'); }
}

function createParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  const colors = ['#00d4ff', '#8b5cf6'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}%;background:${colors[i % 2]};animation-duration:${Math.random() * 15 + 10}s;animation-delay:${Math.random() * 10}s;`;
    container.appendChild(p);
  }
}

function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

document.addEventListener('DOMContentLoaded', init);