// =====================================================
// GAMEFLASH - main.js (Homepage Logic)
// =====================================================

let allGames = [];
let currentCategory = 'all';
let searchQuery = '';

function init() {
  allGames = GF.get(GF.KEYS.GAMES) || [];
  updateHeroStats();
  renderBestsellers();
  buildCategoryFilter();
  renderGames();
  createParticles();
  updateFooter();
  animateCounters();
  initPromoSlider();
  initFloatingWA();
}

function updateHeroStats() {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const el = document.getElementById('statTx');
  if (el) el.textContent = (txs.length * 7 + 1234) + '+';
}

function animateCounters() {
  const el = document.getElementById('statTx');
  if (!el) return;
  const target = parseInt(el.textContent.replace('+','').replace(',',''));
  let current = 0;
  const step = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString('id-ID') + '+';
    if (current >= target) clearInterval(timer);
  }, 20);
}

// =====================================================
// BESTSELLER / TRENDING SECTION
// =====================================================
function renderBestsellers() {
  const section = document.getElementById('bestsellerSection');
  const scroll = document.getElementById('bestsellerScroll');
  if (!section || !scroll) return;

  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const activeGames = allGames.filter(g => g.active);

  // Count orders per game
  const orderCount = {};
  txs.forEach(tx => {
    if (tx.status === 'success' || tx.status === 'processing' || tx.status === 'pending') {
      orderCount[tx.gameId] = (orderCount[tx.gameId] || 0) + 1;
    }
  });

  // Combine with base popularity (to show games even with no transactions)
  const basePopularity = { ml: 50, ff: 35, pubg: 28, genshin: 22, hsr: 18, valorant: 15, codm: 12, roblox: 20, coc: 10, cr: 8, lol: 14, wuwa: 16 };
  
  const ranked = activeGames.map(g => ({
    ...g,
    totalOrders: (orderCount[g.id] || 0) + (basePopularity[g.id] || 5)
  }))
  .sort((a, b) => b.totalOrders - a.totalOrders)
  .slice(0, 8); // Top 8

  if (ranked.length === 0) {
    section.style.display = 'none';
    return;
  }

  scroll.innerHTML = ranked.map((game, idx) => {
    const imgHtml = game.image
      ? `<img src="${game.image}" alt="${game.name}" onerror="this.outerHTML='<div class=\\'emoji-fallback\\'>${game.emoji}</div>'">`
      : `<div class="emoji-fallback">${game.emoji}</div>`;

    // Check if any package has flash sale
    const hasFlashSale = hasActiveFlashSale(game);
    const flashBadge = hasFlashSale ? `<div class="flash-sale-badge"><span class="bestseller-fire">🔥</span> FLASH SALE</div>` : '';

    return `
    <div class="bestseller-card" onclick="goToOrder('${game.id}')">
      <div class="bestseller-rank">#${idx + 1}</div>
      ${flashBadge}
      <div class="bestseller-img">${imgHtml}</div>
      <div class="bestseller-info">
        <div class="bestseller-name">${game.name}</div>
        <div class="bestseller-meta">
          <span class="bestseller-cat">${game.category}</span>
          <span class="bestseller-orders">${game.totalOrders}+ order</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// =====================================================
// FLASH SALE HELPERS
// =====================================================
function hasActiveFlashSale(game) {
  if (!game.packages) return false;
  const now = new Date();
  return game.packages.some(pkg => {
    if (!pkg.active || !pkg.flashSalePrice) return false;
    if (!pkg.flashSaleEnd) return true;
    return new Date(pkg.flashSaleEnd) > now;
  });
}

function getEffectivePrice(pkg) {
  if (!pkg.flashSalePrice) return pkg.price;
  if (pkg.flashSaleEnd && new Date(pkg.flashSaleEnd) <= new Date()) return pkg.price;
  if (pkg.flashSaleStock !== undefined && pkg.flashSaleStock <= 0) return pkg.price;
  return pkg.flashSalePrice;
}

function isFlashSaleActive(pkg) {
  if (!pkg.flashSalePrice || pkg.flashSalePrice >= pkg.price) return false;
  if (pkg.flashSaleEnd && new Date(pkg.flashSaleEnd) <= new Date()) return false;
  if (pkg.flashSaleStock !== undefined && pkg.flashSaleStock <= 0) return false;
  return true;
}

// =====================================================
// GAMES SECTION
// =====================================================
function buildCategoryFilter() {
  const categories = ['Semua', ...new Set(allGames.map(g => g.category))];
  const container = document.getElementById('categoryFilter');
  container.innerHTML = categories.map((cat, i) => {
    const val = i === 0 ? 'all' : cat;
    return `<button class="cat-btn${i===0?' active':''}" onclick="filterByCategory('${val}', this)">${cat}</button>`;
  }).join('');
}

function filterByCategory(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGames();
}

function filterGames() {
  searchQuery = document.getElementById('searchInput').value.toLowerCase();
  renderGames();
}

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  const filtered = allGames.filter(g => {
    if (!g.active) return false;
    const matchCat = currentCategory === 'all' || g.category === currentCategory;
    const matchSearch = g.name.toLowerCase().includes(searchQuery) || g.category.toLowerCase().includes(searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
      <div style="font-size:3rem;margin-bottom:12px;">🎮</div>
      <p>Tidak ada game yang ditemukan</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(game => {
    const activePkgs = game.packages ? game.packages.filter(p => p.active) : [];
    const flashSaleActive = hasActiveFlashSale(game);
    
    // Get lowest price (considering flash sale)
    let minPrice = 0;
    let minOriginal = 0;
    if (activePkgs.length > 0) {
      const prices = activePkgs.map(p => getEffectivePrice(p));
      minPrice = Math.min(...prices);
      minOriginal = Math.min(...activePkgs.map(p => p.price));
    }

    const iconHtml = game.image
      ? `<img src="${game.image}" style="width:80px;height:80px;object-fit:cover;border-radius:14px;" onerror="this.outerHTML='<div class=\\'game-emoji\\'>${game.emoji}</div>'"/>`
      : `<div class="game-emoji">${game.emoji}</div>`;

    // Flash sale badge on card
    const flashBadge = flashSaleActive ? `<div class="flash-sale-badge"><span class="bestseller-fire">🔥</span> FLASH</div>` : '';

    // Price display
    let priceHtml = '';
    if (flashSaleActive && minPrice < minOriginal) {
      const discPct = Math.round((1 - minPrice / minOriginal) * 100);
      priceHtml = `
        <div class="flash-price-wrapper">
          <div><span class="flash-original-price">${formatRupiah(minOriginal)}</span><span class="flash-discount-pct">-${discPct}%</span></div>
          <div class="game-card-price">Mulai <span class="flash-sale-price">${formatRupiah(minPrice)}</span></div>
        </div>`;
    } else {
      priceHtml = `<div class="game-card-price">Mulai <span>${formatRupiah(minPrice)}</span></div>`;
    }

    return `
    <div class="game-card" style="--card-gradient:${game.gradient}" onclick="goToOrder('${game.id}')">
      ${flashBadge}
      <div class="game-card-top">
        ${iconHtml}
        <div class="game-card-name">${game.name}</div>
        <div class="game-card-cat">${game.category}</div>
      </div>
      <div class="game-card-bottom">
        ${priceHtml}
        <div class="game-card-arrow">→</div>
      </div>
    </div>`;
  }).join('');
}

function goToOrder(gameId) {
  window.location.href = `order.html?game=${gameId}`;
}

// =====================================================
// FLOATING WHATSAPP CS
// =====================================================
function initFloatingWA() {
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const wa = settings.whatsapp || '6281234567890';
  const btn = document.getElementById('waBtn');
  if (btn) btn.setAttribute('data-wa', wa);

  // Hide unread badge after 5 seconds
  setTimeout(() => {
    const badge = document.getElementById('waUnread');
    if (badge) badge.style.display = 'none';
  }, 8000);
}

function openWhatsAppCS() {
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const wa = settings.whatsapp || '6281234567890';
  const msg = encodeURIComponent('Halo Gameflash! Saya butuh bantuan tentang top up game.');
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');

  // Hide unread badge
  const badge = document.getElementById('waUnread');
  if (badge) badge.style.display = 'none';
}

// =====================================================
// PARTICLES & FOOTER
// =====================================================
function createParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  const colors = ['#00d4ff','#8b5cf6','#ec4899'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${Math.random()*15+10}s;
      animation-delay:${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
}

function updateFooter() {
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const wa = settings.whatsapp || '6281234567890';
  const contact = document.getElementById('footerContact');
  if (contact) {
    contact.innerHTML = `
      <li><a href="https://wa.me/${wa}" target="_blank">💬 WhatsApp CS</a></li>
      <li><a href="#">📧 cs@gameflash.id</a></li>
      <li><a href="#">📸 @gameflash_id</a></li>`;
  }
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// =====================================================
// PROMO BANNER / FLASH SALE SLIDER
// =====================================================
let promoSlideIndex = 0;
let promoAutoTimer = null;
let promoTouchStartX = 0;
let activePromos = [];

function initPromoSlider() {
  const promos = GF.get(GF.KEYS.PROMOS) || [];
  const now = new Date();

  activePromos = promos
    .filter(p => {
      if (!p.active) return false;
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      return now >= start && now <= end;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const section = document.getElementById('promoSection');
  if (!section) return;

  if (activePromos.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  renderPromoSlides();
  renderPromoDots();
  updatePromoSlide(0);
  startPromoAutoSlide();
  initPromoCountdown();
  initPromoTouch();
}

function renderPromoSlides() {
  const track = document.getElementById('promoTrack');
  if (!track) return;

  track.innerHTML = activePromos.map(promo => {
    const ctaText = promo.linkType === 'game' ? '🎮 Top Up Sekarang' : '🎟️ Ambil Voucher';
    return `
    <div class="promo-slide" onclick="handlePromoClick('${promo.linkType}', '${promo.linkValue}')">
      <img class="promo-slide-img" src="${promo.image}" alt="${promo.title}" 
           onerror="this.style.background='var(--gradient-brand)';this.style.height='320px'"/>
      <div class="promo-slide-overlay">
        <div class="promo-badge" style="background:${promo.badgeColor || 'var(--red)'}">${promo.badge || 'PROMO'}</div>
        <div class="promo-slide-title">${promo.title}</div>
        <div class="promo-slide-subtitle">${promo.subtitle}</div>
        <button class="promo-slide-cta">${ctaText}</button>
      </div>
    </div>`;
  }).join('');
}

function renderPromoDots() {
  const dots = document.getElementById('promoDots');
  if (!dots) return;
  dots.innerHTML = activePromos.map((_, i) =>
    `<button class="promo-dot${i === 0 ? ' active' : ''}" onclick="goToPromoSlide(${i})" aria-label="Slide ${i + 1}"></button>`
  ).join('');
}

function updatePromoSlide(index) {
  const track = document.getElementById('promoTrack');
  const dots = document.querySelectorAll('.promo-dot');
  if (!track || activePromos.length === 0) return;
  promoSlideIndex = ((index % activePromos.length) + activePromos.length) % activePromos.length;
  track.style.transform = `translateX(-${promoSlideIndex * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === promoSlideIndex));
}

function promoSlide(dir) { updatePromoSlide(promoSlideIndex + dir); resetPromoAutoSlide(); }
function goToPromoSlide(index) { updatePromoSlide(index); resetPromoAutoSlide(); }
function startPromoAutoSlide() { promoAutoTimer = setInterval(() => updatePromoSlide(promoSlideIndex + 1), 5000); }
function resetPromoAutoSlide() { clearInterval(promoAutoTimer); startPromoAutoSlide(); }

function handlePromoClick(linkType, linkValue) {
  if (linkType === 'game') window.location.href = `order.html?game=${linkValue}`;
  else if (linkType === 'voucher') {
    navigator.clipboard.writeText(linkValue).then(() => {
      showToast(`Kode voucher "${linkValue}" disalin! Gunakan saat checkout.`, 'success');
    }).catch(() => showToast(`Kode voucher: ${linkValue}`, 'info'));
  } else if (linkType === 'url' && linkValue) window.open(linkValue, '_blank');
}

function initPromoCountdown() {
  const countdownEl = document.getElementById('promoCountdown');
  if (!countdownEl) return;
  const now = new Date();
  let targetEnd = null;
  for (const p of activePromos) { const end = new Date(p.endDate); if (end > now && (!targetEnd || end < targetEnd)) targetEnd = end; }
  if (!targetEnd) { targetEnd = new Date(); targetEnd.setHours(23, 59, 59, 999); }

  function tick() {
    const now = new Date();
    let diff = Math.max(targetEnd - now, 0);
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    const hEl = document.getElementById('cdHours'), mEl = document.getElementById('cdMinutes'), sEl = document.getElementById('cdSeconds');
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(s).padStart(2, '0');
  }
  tick(); setInterval(tick, 1000);
}

function initPromoTouch() {
  const slider = document.getElementById('promoSlider');
  if (!slider) return;
  slider.addEventListener('touchstart', e => { promoTouchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = promoTouchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) promoSlide(diff > 0 ? 1 : -1);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', init);
