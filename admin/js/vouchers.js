// =====================================================
// GAMEFLASH - Admin Vouchers JS
// =====================================================

const ADMIN_SESSION = 'gf_admin_session';

function checkAuth() {
  if (sessionStorage.getItem(ADMIN_SESSION) === 'ok') {
    document.getElementById('loginOverlay').style.display = 'none'; init();
  }
}
function doLogin() {
  const pass = document.getElementById('loginPass').value;
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  if (pass === (settings.adminPassword || 'admin123')) {
    sessionStorage.setItem(ADMIN_SESSION, 'ok');
    document.getElementById('loginOverlay').style.display = 'none'; init();
  } else { document.getElementById('loginError').style.display = 'block'; document.getElementById('loginPass').value = ''; }
}
function doLogout() { sessionStorage.removeItem(ADMIN_SESSION); location.reload(); }

function init() {
  // Set default expiry to 1 year from now
  const next = new Date(); next.setFullYear(next.getFullYear() + 1);
  document.getElementById('vExpiry').value = next.toISOString().slice(0, 10);
  renderVouchers();
  updateStats();
}

function updateStats() {
  const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
  const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
  const active = vouchers.filter(v => v.active);
  const totalUsed = vouchers.reduce((s, v) => s + v.usedCount, 0);
  const totalDiscount = txs.filter(t => t.voucherCode && t.discount).reduce((s, t) => s + t.discount, 0);
  document.getElementById('statTotal').textContent = vouchers.length;
  document.getElementById('statActive').textContent = active.length;
  document.getElementById('statUsed').textContent = totalUsed + ' kali';
  document.getElementById('statDiscount').textContent = formatRupiah(totalDiscount);
}

function renderVouchers() {
  const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const filtered = vouchers.filter(v => !search || v.code.toLowerCase().includes(search) || (v.description||'').toLowerCase().includes(search));
  const now = new Date();
  const tbody = document.getElementById('voucherTable');
  
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:48px;color:var(--text-muted);">Belum ada voucher</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(v => {
    const isExpired = new Date(v.expiry) < now;
    const usagePct = Math.min(100, Math.round(v.usedCount / v.usageLimit * 100));
    const status = !v.active ? 'Nonaktif' : isExpired ? 'Kadaluarsa' : v.usedCount >= v.usageLimit ? 'Habis' : 'Aktif';
    const statusBadge = { 'Aktif':'badge-success', 'Nonaktif':'badge-secondary', 'Kadaluarsa':'badge-danger', 'Habis':'badge-warning' }[status];
    
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <code style="background:rgba(139,92,246,0.1);color:var(--purple);padding:4px 10px;border-radius:6px;font-size:0.875rem;font-weight:700;letter-spacing:1px">${v.code}</code>
        </div>
      </td>
      <td style="font-size:0.875rem">
        ${v.type === 'percent' ? `<span style="color:var(--cyan)">💹 ${v.value}%</span>` : `<span style="color:var(--green)">💰 ${formatRupiah(v.value)}</span>`}
      </td>
      <td style="font-size:0.85rem">${formatRupiah(v.minPurchase)}</td>
      <td style="font-size:0.85rem">${formatRupiah(v.maxDiscount)}</td>
      <td>
        <div style="font-size:0.8rem;margin-bottom:4px">${v.usedCount} / ${v.usageLimit}</div>
        <div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;width:80px;">
          <div style="height:100%;width:${usagePct}%;background:${usagePct>80?'var(--red)':usagePct>50?'var(--yellow)':'var(--green)'};border-radius:2px;"></div>
        </div>
      </td>
      <td style="font-size:0.8rem;color:${isExpired?'var(--red)':'var(--text-muted)'}">${new Date(v.expiry).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</td>
      <td style="font-size:0.78rem;color:var(--text-muted);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v.description||'-'}</td>
      <td><span class="badge ${statusBadge}">${status}</span></td>
      <td>
        <div style="display:flex;gap:4px;">
          <button class="btn-icon" onclick="showEditModal('${v.id}')" title="Edit">✏️</button>
          <button class="btn-icon" onclick="toggleVoucher('${v.id}',${!v.active})" title="${v.active?'Nonaktifkan':'Aktifkan'}" style="color:${v.active?'var(--yellow)':'var(--green)'}">
            ${v.active ? '⏸️' : '▶️'}
          </button>
          <button class="btn-icon" onclick="deleteVoucher('${v.id}')" title="Hapus" style="color:var(--red)">🗑️</button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ─── MODAL HELPERS ────────────────────────────────────
function toggleDiscType() {
  const isPercent = document.querySelector('input[name="discType"]:checked').value === 'percent';
  document.getElementById('discValueLabel').textContent = isPercent ? 'Nilai Diskon (%) *' : 'Nilai Diskon (Rp) *';
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GF';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('vCode').value = code;
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = '➕ Buat Voucher';
  document.getElementById('editVoucherId').value = '';
  document.getElementById('vCode').value = '';
  document.getElementById('vValue').value = '';
  document.getElementById('vMaxDisc').value = '50000';
  document.getElementById('vMinPurchase').value = '10000';
  document.getElementById('vUsageLimit').value = '100';
  document.getElementById('vDesc').value = '';
  document.getElementById('vActive').checked = true;
  document.querySelector('input[name="discType"][value="percent"]').checked = true;
  toggleDiscType();
  const next = new Date(); next.setFullYear(next.getFullYear() + 1);
  document.getElementById('vExpiry').value = next.toISOString().slice(0, 10);
  document.getElementById('voucherModal').classList.add('active');
}

function showEditModal(id) {
  const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
  const v = vouchers.find(v => v.id === id);
  if (!v) return;
  document.getElementById('modalTitle').textContent = '✏️ Edit Voucher';
  document.getElementById('editVoucherId').value = v.id;
  document.getElementById('vCode').value = v.code;
  document.getElementById('vValue').value = v.value;
  document.getElementById('vMaxDisc').value = v.maxDiscount;
  document.getElementById('vMinPurchase').value = v.minPurchase;
  document.getElementById('vUsageLimit').value = v.usageLimit;
  document.getElementById('vDesc').value = v.description || '';
  document.getElementById('vActive').checked = v.active;
  document.getElementById('vExpiry').value = v.expiry;
  document.querySelector(`input[name="discType"][value="${v.type}"]`).checked = true;
  toggleDiscType();
  document.getElementById('voucherModal').classList.add('active');
}

function saveVoucher() {
  const editId = document.getElementById('editVoucherId').value;
  const code = document.getElementById('vCode').value.trim().toUpperCase();
  const type = document.querySelector('input[name="discType"]:checked').value;
  const value = parseInt(document.getElementById('vValue').value);
  const maxDiscount = parseInt(document.getElementById('vMaxDisc').value) || 999999;
  const minPurchase = parseInt(document.getElementById('vMinPurchase').value) || 0;
  const usageLimit = parseInt(document.getElementById('vUsageLimit').value) || 100;
  const expiry = document.getElementById('vExpiry').value;
  const description = document.getElementById('vDesc').value.trim();
  const active = document.getElementById('vActive').checked;
  
  if (!code || !value || !expiry) { showToast('Kode, nilai diskon, dan kadaluarsa wajib diisi', 'error'); return; }
  
  const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
  
  if (editId) {
    const idx = vouchers.findIndex(v => v.id === editId);
    if (idx !== -1) { Object.assign(vouchers[idx], { code, type, value, maxDiscount, minPurchase, usageLimit, expiry, description, active }); }
    showToast('Voucher diperbarui! ✅', 'success');
  } else {
    // Check duplicate code
    if (vouchers.find(v => v.code === code)) { showToast('Kode voucher sudah digunakan', 'error'); return; }
    vouchers.unshift({ id: 'v_' + Date.now(), code, type, value, maxDiscount, minPurchase, usageLimit, usedCount: 0, expiry, description, active });
    showToast('Voucher baru dibuat! ✅', 'success');
  }
  
  GF.set(GF.KEYS.VOUCHERS, vouchers);
  closeModal('voucherModal');
  renderVouchers();
  updateStats();
}

function toggleVoucher(id, active) {
  const vouchers = GF.get(GF.KEYS.VOUCHERS) || [];
  const idx = vouchers.findIndex(v => v.id === id);
  if (idx !== -1) { vouchers[idx].active = active; GF.set(GF.KEYS.VOUCHERS, vouchers); renderVouchers(); updateStats(); showToast(`Voucher ${active?'diaktifkan':'dinonaktifkan'}`, 'success'); }
}

function deleteVoucher(id) {
  if (!confirm('Hapus voucher ini?')) return;
  const vouchers = (GF.get(GF.KEYS.VOUCHERS) || []).filter(v => v.id !== id);
  GF.set(GF.KEYS.VOUCHERS, vouchers);
  renderVouchers();
  updateStats();
  showToast('Voucher dihapus', 'success');
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div'); t.className = `toast ${type}`;
  t.innerHTML = `<span>${{success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t); setTimeout(() => t.remove(), 3200);
}

document.addEventListener('DOMContentLoaded', checkAuth);
