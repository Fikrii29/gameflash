// =====================================================
// GAMEFLASH - Admin Dashboard JS
// =====================================================

let txChart = null;
let currentTxId = null;
const ADMIN_SESSION = 'gf_admin_session';

// ─── AUTH ────────────────────────────────────────────
function checkAuth() {
  const session = sessionStorage.getItem(ADMIN_SESSION);
  if (session === 'ok') {
    document.getElementById('loginOverlay').style.display = 'none';
    init();
  }
}

function doLogin() {
  const pass = document.getElementById('loginPass').value;
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const correctPass = settings.adminPassword || 'admin123';
  if (pass === correctPass) {
    sessionStorage.setItem(ADMIN_SESSION, 'ok');
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
    init();
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function doLogout() {
  sessionStorage.removeItem(ADMIN_SESSION);
  location.reload();
}

// Resolve image path for admin subfolder
function resolveImg(img) {
  if (!img) return null;
  if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('//')) return img;
  return '../' + img;
}

// ─── INIT ─────────────────────────────────────────────
function init() {
  updateStats();
  buildChart(7);
  renderTopGames();
  renderRecentTransactions();
  updatePendingBadge();
  fetchPublicIP();
  document.getElementById('lastUpdate').textContent = 'Update: ' + new Date().toLocaleTimeString('id-ID');
  // Auto refresh every 30s
  setInterval(() => { updateStats(); renderRecentTransactions(); updatePendingBadge(); }, 30000);
}

// ─── PUBLIC IP ────────────────────────────────────────
let _cachedIP = '';

async function fetchPublicIP() {
  const el = document.getElementById('publicIpDisplay');
  const btn = document.getElementById('btnCopyIP');
  if (!el) return;
  el.textContent = 'Memuat...';
  try {
    // Try multiple providers for reliability
    const providers = [
      'https://api.ipify.org?format=json',
      'https://api64.ipify.org?format=json',
      'https://api.my-ip.io/ip.json',
    ];
    let ip = null;
    for (const url of providers) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
        const d = await r.json();
        ip = d.ip || d.IP || null;
        if (ip) break;
      } catch { continue; }
    }
    if (ip) {
      _cachedIP = ip;
      el.textContent = ip;
      if (btn) { btn.disabled = false; }
    } else {
      el.textContent = 'Tidak tersedia';
      el.style.color = 'var(--text-muted)';
    }
  } catch (e) {
    el.textContent = 'Gagal memuat';
    el.style.color = 'var(--red)';
  }
}

function copyIP() {
  if (!_cachedIP) return;
  navigator.clipboard.writeText(_cachedIP).then(() => {
    const btn = document.getElementById('btnCopyIP');
    const orig = btn.textContent;
    btn.textContent = '✅ Tersalin!';
    btn.style.background = 'rgba(16,185,129,0.15)';
    btn.style.borderColor = 'rgba(16,185,129,0.4)';
    btn.style.color = 'var(--green)';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);
  });
}

function refreshIP() {
  _cachedIP = '';
  const btn = document.getElementById('btnCopyIP');
  if (btn) btn.disabled = true;
  fetchPublicIP();
}

function refreshData() {
  updateStats();
  buildChart(parseInt(document.getElementById('chartPeriod').value));
  renderTopGames();
  renderRecentTransactions();
  updatePendingBadge();
  document.getElementById('lastUpdate').textContent = 'Update: ' + new Date().toLocaleTimeString('id-ID');
  showToast('Data diperbarui', 'success');
}

// ─── STATS ────────────────────────────────────────────
function updateStats() {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const today = new Date().toDateString();
  const todayTxs = txs.filter(t => new Date(t.createdAt).toDateString() === today);
  const successTxs = txs.filter(t => t.status === 'success');
  const pendingTxs = txs.filter(t => t.status === 'pending');
  const totalRevenue = successTxs.reduce((s, t) => s + t.finalAmount, 0);
  const todayRevenue = todayTxs.filter(t => t.status === 'success').reduce((s, t) => s + t.finalAmount, 0);
  const rate = txs.length ? Math.round(successTxs.length / txs.length * 100) : 0;

  document.getElementById('statRevenue').textContent = formatRupiah(totalRevenue);
  document.getElementById('statRevenueChange').textContent = `+${formatRupiah(todayRevenue)} hari ini`;
  document.getElementById('statTotal').textContent = txs.length.toLocaleString('id-ID');
  document.getElementById('statTotalChange').textContent = `${todayTxs.length} hari ini`;
  document.getElementById('statSuccess').textContent = successTxs.length.toLocaleString('id-ID');
  document.getElementById('statSuccessRate').textContent = `${rate}% sukses rate`;
  document.getElementById('statPending').textContent = pendingTxs.length;
}

function updatePendingBadge() {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const pending = txs.filter(t => t.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  if (badge) { badge.textContent = pending; badge.style.display = pending > 0 ? 'inline' : 'none'; }
}

// ─── CHART ────────────────────────────────────────────
function buildChart(days) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const labels = [], dataSuccess = [], dataPending = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('id-ID', { day:'2-digit', month:'short' });
    labels.push(dateStr);
    const dayTxs = txs.filter(t => new Date(t.createdAt).toDateString() === d.toDateString());
    dataSuccess.push(dayTxs.filter(t => t.status === 'success').length);
    dataPending.push(dayTxs.filter(t => t.status !== 'success').length);
  }

  const ctx = document.getElementById('txChart');
  if (!ctx) return;
  if (txChart) txChart.destroy();
  txChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Berhasil', data: dataSuccess, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 },
        { label: 'Lainnya', data: dataPending, backgroundColor: 'rgba(139,92,246,0.5)', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#a0a0c0', boxRadius: 4 } } },
      scales: {
        x: { stacked: true, ticks: { color: '#5a5a7a' }, grid: { color: 'rgba(255,255,255,0.03)' } },
        y: { stacked: true, ticks: { color: '#5a5a7a', precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
      }
    }
  });
}

function updateChart(days) { buildChart(parseInt(days)); }

// ─── TOP GAMES ────────────────────────────────────────
function renderTopGames() {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const games = GF.get(GF.KEYS.GAMES) || [];
  const gameMap = {};
  games.forEach(g => { gameMap[g.id] = g; });

  const gameCount = {};
  txs.forEach(t => {
    if (!gameCount[t.gameId]) {
      const g = gameMap[t.gameId];
      gameCount[t.gameId] = {
        name: t.gameName,
        emoji: t.gameEmoji || '🎮',
        image: g ? g.image : null,
        count: 0, revenue: 0
      };
    }
    gameCount[t.gameId].count++;
    gameCount[t.gameId].revenue += t.finalAmount;
  });
  const sorted = Object.values(gameCount).sort((a, b) => b.count - a.count).slice(0, 6);
  const max = sorted[0]?.count || 1;
  const container = document.getElementById('topGames');
  if (!container) return;
  if (!sorted.length) { container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">Belum ada transaksi</p>'; return; }
  container.innerHTML = sorted.map((g) => {
    const imgSrc = g.image ? resolveImg(g.image) : null;
    const iconHtml = imgSrc
      ? `<img src="${imgSrc}" style="width:32px;height:32px;object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.outerHTML='<span style=\'font-size:1.4rem;\'>${g.emoji}</span>'"/>`
      : `<span style="font-size:1.4rem;width:32px;text-align:center;flex-shrink:0;">${g.emoji}</span>`;
    return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      ${iconHtml}
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:500;margin-bottom:4px;">
          <span>${g.name}</span><span style="color:var(--cyan)">${g.count}x</span>
        </div>
        <div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;">
          <div style="height:100%;width:${g.count/max*100}%;background:var(--gradient-brand);border-radius:2px;"></div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ─── RECENT TRANSACTIONS ─────────────────────────────
function renderRecentTransactions() {
  const txs = (GF.get(GF.KEYS.TRANSACTIONS) || []).slice(0, 10);
  const games = GF.get(GF.KEYS.GAMES) || [];
  const gameMap = {};
  games.forEach(g => { gameMap[g.id] = g; });
  const tbody = document.getElementById('recentTxTable');
  if (!tbody) return;
  if (!txs.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">Belum ada transaksi</td></tr>'; return; }
  
  const statusBadge = {
    pending: '<span class="badge badge-warning">⏳ Pending</span>',
    processing: '<span class="badge badge-info">⚙️ Proses</span>',
    success: '<span class="badge badge-success">✅ Sukses</span>',
    failed: '<span class="badge badge-danger">❌ Gagal</span>',
  };

  tbody.innerHTML = txs.map(tx => {
    const g = gameMap[tx.gameId];
    const imgSrc = g?.image ? resolveImg(g.image) : null;
    const iconHtml = imgSrc
      ? `<img src="${imgSrc}" style="width:32px;height:32px;object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.outerHTML='<span class=\'emoji\'>${tx.gameEmoji||'🎮'}</span>'"/>`
      : `<span class="emoji">${tx.gameEmoji||'🎮'}</span>`;
    return `
    <tr>
      <td class="td-invoice">${tx.invoiceId}</td>
      <td><div class="td-game">${iconHtml}<div><div style="font-weight:500">${tx.gameName}</div><div style="font-size:0.75rem;color:var(--text-muted)">${tx.packageName}</div></div></div></td>
      <td style="font-size:0.8rem">${tx.userId}${tx.zoneId?' / '+tx.zoneId:''}</td>
      <td style="font-size:0.8rem">${tx.paymentMethod}</td>
      <td style="color:var(--cyan);font-weight:600">${formatRupiah(tx.finalAmount)}</td>
      <td>${statusBadge[tx.status] || tx.status}</td>
      <td style="font-size:0.75rem;color:var(--text-muted)">${formatDate(tx.createdAt)}</td>
      <td>
        <button class="btn-icon" onclick="showDetail('${tx.invoiceId}')" title="Detail">👁️</button>
      </td>
    </tr>`;
  }).join('');
}

function showDetail(invoiceId) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const tx = txs.find(t => t.invoiceId === invoiceId);
  if (!tx) return;
  currentTxId = invoiceId;
  const body = document.getElementById('detailModalBody');
  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.875rem;">
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Invoice</div><div style="font-weight:600;color:var(--cyan)">${tx.invoiceId}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Status</div><div>${tx.status}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Game</div><div>${tx.gameEmoji||''} ${tx.gameName}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Paket</div><div>${tx.packageName}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">User ID</div><div>${tx.userId}${tx.zoneId?' / '+tx.zoneId:''}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">WA Customer</div><div>${tx.customerPhone}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Metode</div><div>${tx.paymentMethod}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Voucher</div><div>${tx.voucherCode || '-'}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Total</div><div style="color:var(--cyan);font-weight:700">${formatRupiah(tx.finalAmount)}</div></div>
      <div><div style="color:var(--text-muted);font-size:0.72rem;margin-bottom:4px">Dibuat</div><div>${formatDate(tx.createdAt)}</div></div>
    </div>`;
  document.getElementById('detailModal').classList.add('active');
}

function updateTxStatus(status) {
  if (!currentTxId) return;
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const idx = txs.findIndex(t => t.invoiceId === currentTxId);
  if (idx !== -1) {
    txs[idx].status = status;
    txs[idx].updatedAt = new Date().toISOString();
    GF.set(GF.KEYS.TRANSACTIONS, txs);
    showToast(`Status diubah ke: ${status}`, 'success');
    closeModal('detailModal');
    renderRecentTransactions();
    updateStats();
    updatePendingBadge();
  }
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div'); t.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t); setTimeout(() => t.remove(), 3200);
}

document.addEventListener('DOMContentLoaded', checkAuth);
