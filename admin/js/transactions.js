// =====================================================
// GAMEFLASH - Admin Transactions JS
// =====================================================

const ADMIN_SESSION = 'gf_admin_session';
let allTxs = [], filteredTxs = [], currentPage = 1;
const PAGE_SIZE = 15;
let currentDetailId = null;

function checkAuth() {
  if (sessionStorage.getItem(ADMIN_SESSION) === 'ok') {
    document.getElementById('loginOverlay').style.display = 'none';
    init();
  }
}
function doLogin() {
  const pass = document.getElementById('loginPass').value;
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  if (pass === (settings.adminPassword || 'admin123')) {
    sessionStorage.setItem(ADMIN_SESSION, 'ok');
    document.getElementById('loginOverlay').style.display = 'none';
    init();
  } else { document.getElementById('loginError').style.display = 'block'; document.getElementById('loginPass').value = ''; }
}
function doLogout() { sessionStorage.removeItem(ADMIN_SESSION); location.reload(); }

function resolveImg(img) {
  if (!img) return null;
  if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('//')) return img;
  return '../' + img;
}

function init() {
  loadTransactions();
  buildGameFilter();
  updateSummary();
}

function loadTransactions() {
  allTxs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  applyFilters();
}

function buildGameFilter() {
  const games = [...new Set(allTxs.map(t => t.gameName))];
  const sel = document.getElementById('gameFilter');
  sel.innerHTML = '<option value="">Semua Game</option>' + games.map(g => `<option value="${g}">${g}</option>`).join('');
}

function updateSummary() {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const success = txs.filter(t => t.status === 'success');
  document.getElementById('totalDeposit').textContent = formatRupiah(success.reduce((s,t) => s + t.finalAmount, 0));
  document.getElementById('txSuccess').textContent = success.length;
  document.getElementById('txPending').textContent = txs.filter(t => t.status === 'pending').length;
  document.getElementById('txFailed').textContent = txs.filter(t => t.status === 'failed').length;
}

function applyFilters() {
  const search = (document.getElementById('searchInput').value || '').toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const game = document.getElementById('gameFilter').value;
  const dateF = document.getElementById('dateFilter').value;
  const now = new Date();

  filteredTxs = allTxs.filter(t => {
    const matchSearch = !search || t.invoiceId.toLowerCase().includes(search) || t.gameName.toLowerCase().includes(search) || (t.userId||'').toLowerCase().includes(search) || t.customerPhone.includes(search);
    const matchStatus = !status || t.status === status;
    const matchGame = !game || t.gameName === game;
    let matchDate = true;
    if (dateF === 'today') matchDate = new Date(t.createdAt).toDateString() === now.toDateString();
    else if (dateF === 'week') matchDate = (now - new Date(t.createdAt)) < 7*86400000;
    else if (dateF === 'month') matchDate = (now - new Date(t.createdAt)) < 30*86400000;
    return matchSearch && matchStatus && matchGame && matchDate;
  });

  currentPage = 1;
  document.getElementById('txCount').textContent = filteredTxs.length;
  renderTable();
}

function renderTable() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageTxs = filteredTxs.slice(start, start + PAGE_SIZE);
  const tbody = document.getElementById('txTableBody');
  const totalPages = Math.ceil(filteredTxs.length / PAGE_SIZE);
  const games = GF.get(GF.KEYS.GAMES) || [];
  const gameMap = {};
  games.forEach(g => { gameMap[g.id] = g; });

  const badges = { pending:'badge-warning',processing:'badge-info',retrying:'badge-warning',success:'badge-success',failed:'badge-danger' };
  const statusLabel = { pending:'⏳ Pending',processing:'⚙️ Proses',retrying:'🔄 Retry',success:'✅ Sukses',failed:'❌ Gagal' };

  if (!pageTxs.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:48px;color:var(--text-muted);">Tidak ada transaksi yang cocok</td></tr>';
  } else {
    tbody.innerHTML = pageTxs.map(tx => {
      const g = gameMap[tx.gameId];
      const imgSrc = g?.image ? resolveImg(g.image) : null;
      const iconHtml = imgSrc
        ? `<img src="${imgSrc}" style="width:32px;height:32px;object-fit:cover;border-radius:8px;flex-shrink:0;" onerror="this.outerHTML='<span class=\'emoji\'>${tx.gameEmoji||'🎮'}</span>'"/>`
        : `<span class="emoji">${tx.gameEmoji||'🎮'}</span>`;
      return `
      <tr>
        <td class="td-invoice">${tx.invoiceId}</td>
        <td><div class="td-game">${iconHtml}<div><div style="font-weight:500;font-size:0.85rem">${tx.gameName}</div><div style="font-size:0.72rem;color:var(--text-muted)">${tx.packageName}</div></div></div></td>
        <td style="font-size:0.8rem">${tx.userId}${tx.zoneId?' / '+tx.zoneId:''}</td>
        <td style="font-size:0.8rem">${tx.customerPhone}</td>
        <td style="font-size:0.8rem">${tx.paymentMethod}</td>
        <td style="color:var(--cyan);font-weight:600;font-size:0.875rem">${formatRupiah(tx.finalAmount)}</td>
        <td style="font-size:0.75rem;color:var(--text-muted)">${tx.voucherCode||'-'}</td>
        <td><span class="badge ${badges[tx.status]||'badge-secondary'}">${statusLabel[tx.status]||tx.status}</span>${tx.retryCount?'<span style="font-size:0.65rem;color:var(--text-muted);margin-left:4px;">R'+tx.retryCount+'</span>':''}${tx.refundStatus==='pending'?'<span style="font-size:0.65rem;color:var(--yellow);margin-left:4px;">💰</span>':''}</td>
        <td style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap">${formatDate(tx.createdAt)}</td>
        <td><div style="display:flex;gap:4px;">
          <button class="btn-icon" onclick="showDetail('${tx.invoiceId}')" title="Detail">👁️</button>
          ${tx.status==='pending'?`<button class="btn-icon" onclick="markSuccess('${tx.invoiceId}')" title="Tandai Sukses" style="color:var(--green)">✅</button>`:''}
          ${tx.status==='pending'?`<button class="btn-icon" onclick="markFailed('${tx.invoiceId}')" title="Tandai Gagal" style="color:var(--red)">❌</button>`:''}
        </div></td>
      </tr>`;
    }).join('');
  }

  document.getElementById('pageInfo').textContent = `Halaman ${currentPage} dari ${totalPages||1} (${filteredTxs.length} transaksi)`;
  document.getElementById('btnPrev').disabled = currentPage <= 1;
  document.getElementById('btnNext').disabled = currentPage >= totalPages;
}

function prevPage() { if (currentPage > 1) { currentPage--; renderTable(); } }
function nextPage() { const total = Math.ceil(filteredTxs.length/PAGE_SIZE); if (currentPage < total) { currentPage++; renderTable(); } }

function markSuccess(inv) { updateStatus(inv, 'success'); }
function markFailed(inv) { updateStatus(inv, 'failed'); }

function updateStatus(inv, status) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const idx = txs.findIndex(t => t.invoiceId === inv);
  if (idx !== -1) {
    txs[idx].status = status;
    txs[idx].updatedAt = new Date().toISOString();
    if (status === 'success') txs[idx].paymentStatus = 'paid';
    GF.set(GF.KEYS.TRANSACTIONS, txs);
    allTxs = txs;
    applyFilters();
    updateSummary();
    showToast(`Status diubah ke: ${status}`, 'success');
  }
}

function showDetail(invoiceId) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const tx = txs.find(t => t.invoiceId === invoiceId);
  if (!tx) return;
  currentDetailId = invoiceId;
  const body = document.getElementById('detailModalBody');
  const foot = document.getElementById('detailModalFooter');
  
  const fields = [
    ['Invoice', tx.invoiceId], ['Status', tx.status.toUpperCase()], ['Payment', tx.paymentStatus || 'N/A'],
    ['Game', (tx.gameEmoji||'') + ' ' + tx.gameName], ['Paket', tx.packageName],
    ['User ID', tx.userId + (tx.zoneId ? ' / ' + tx.zoneId : '')],
    ['WA Customer', tx.customerPhone],
    ['Metode Bayar', tx.paymentMethod + (tx.paymentGateway ? ' (' + tx.paymentGateway + ')' : '')],
    ['Harga Normal', formatRupiah(tx.amount)],
    ['Diskon', tx.discount ? '-' + formatRupiah(tx.discount) + (tx.voucherCode ? ' (' + tx.voucherCode + ')' : '') : '-'],
    ['Total Bayar', formatRupiah(tx.finalAmount)],
    ['Dibuat', formatDate(tx.createdAt)], ['Update', formatDate(tx.updatedAt)],
  ];

  // Add retry/refund info if exists
  if (tx.retryCount) fields.push(['🔄 Retry Count', tx.retryCount + 'x']);
  if (tx.failReason) fields.push(['❌ Alasan Gagal', tx.failReason]);
  if (tx.refundStatus) fields.push(['💰 Refund', tx.refundStatus === 'pending' ? '⏳ Menunggu refund manual' : tx.refundStatus === 'done' ? '✅ Sudah direfund' : tx.refundStatus]);
  
  // Build retry log section
  let retryLogHtml = '';
  if (tx.retryLog && tx.retryLog.length > 0) {
    retryLogHtml = `<div style="margin-top:16px;">
      <div style="font-size:0.75rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px;">🔄 Retry Log</div>
      ${tx.retryLog.map(log => `
        <div style="background:var(--bg-secondary);border-radius:8px;padding:8px 12px;margin-bottom:4px;font-size:0.78rem;display:flex;align-items:center;gap:8px;">
          <span>${log.success ? '✅' : '❌'}</span>
          <span style="color:var(--text-muted);">Attempt ${log.attempt}</span>
          <span style="flex:1;">${log.response || 'No response'}</span>
          <span style="font-size:0.68rem;color:var(--text-muted);">${log.time ? formatDate(log.time) : ''}</span>
        </div>
      `).join('')}
    </div>`;
  }

  body.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
    ${fields.map(([k,v]) => `<div style="background:var(--bg-secondary);border-radius:8px;padding:10px;">
      <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:3px;">${k}</div>
      <div style="font-size:0.875rem;font-weight:500;">${v}</div>
    </div>`).join('')}
  </div>${retryLogHtml}`;
  
  // Status buttons + refund button
  const statusBtns = tx.status !== 'success' && tx.status !== 'failed' ? `
    <button class="btn btn-success btn-sm" onclick="updateStatus('${tx.invoiceId}','success');closeModal('detailModal')">✅ Sukses</button>
    <button class="btn btn-danger btn-sm" onclick="updateStatus('${tx.invoiceId}','failed');closeModal('detailModal')">❌ Gagal</button>
  ` : '';
  const refundBtn = tx.status === 'failed' && tx.refundStatus === 'pending'
    ? `<button class="btn btn-sm" style="background:rgba(245,158,11,0.15);color:var(--yellow);border:1px solid rgba(245,158,11,0.3);" onclick="markRefunded('${tx.invoiceId}')">💰 Tandai Sudah Refund</button>`
    : '';
  foot.innerHTML = statusBtns + refundBtn + `<button class="btn btn-secondary btn-sm" onclick="closeModal('detailModal')">Tutup</button>`;
  
  document.getElementById('detailModal').classList.add('active');
}

function exportCSV() {
  const txs = filteredTxs.length ? filteredTxs : allTxs;
  const headers = ['Invoice','Game','Paket','User ID','Zone ID','WA','Metode','Harga','Diskon','Total','Voucher','Status','Tanggal'];
  const rows = txs.map(t => [
    t.invoiceId, t.gameName, t.packageName, t.userId, t.zoneId||'', t.customerPhone,
    t.paymentMethod, t.amount, t.discount, t.finalAmount, t.voucherCode||'', t.status, t.createdAt
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `gameflash_transactions_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast('Export berhasil!', 'success');
}

function markRefunded(inv) {
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const idx = txs.findIndex(t => t.invoiceId === inv);
  if (idx !== -1) {
    txs[idx].refundStatus = 'done';
    txs[idx].refundedAt = new Date().toISOString();
    txs[idx].updatedAt = new Date().toISOString();
    GF.set(GF.KEYS.TRANSACTIONS, txs);
    allTxs = txs;
    applyFilters();
    closeModal('detailModal');
    showToast('💰 Transaksi ditandai sudah direfund', 'success');
  }
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div'); t.className = `toast ${type}`;
  t.innerHTML = `<span>${{success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t); setTimeout(() => t.remove(), 3200);
}

document.addEventListener('DOMContentLoaded', checkAuth);
