// =====================================================
// GAMEFLASH - Admin Promos Management
// =====================================================

let promos = [];
let deleteTargetId = null;
let selectedBadgeColor = '#ef4444';

// ── Auth ──
function doLogin() {
  const pass = document.getElementById('loginPass').value;
  const settings = GF.get(GF.KEYS.SETTINGS) || {};
  const adminPass = settings.adminPassword || 'admin123';
  if (pass === adminPass) {
    document.getElementById('loginOverlay').style.display = 'none';
    sessionStorage.setItem('gf_authed', '1');
    loadPromos();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function doLogout() {
  sessionStorage.removeItem('gf_authed');
  location.reload();
}

function checkAuth() {
  if (sessionStorage.getItem('gf_authed') === '1') {
    document.getElementById('loginOverlay').style.display = 'none';
    loadPromos();
  }
}

// ── Load & Render ──
function loadPromos() {
  promos = GF.get(GF.KEYS.PROMOS) || [];
  updateStats();
  renderPromos();
}

function updateStats() {
  const now = new Date();
  const active = promos.filter(p => p.active);
  const live = promos.filter(p => {
    if (!p.active) return false;
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end;
  });
  const expired = promos.filter(p => {
    const end = new Date(p.endDate);
    return end < now;
  });

  document.getElementById('statTotal').textContent = promos.length;
  document.getElementById('statActive').textContent = active.length;
  document.getElementById('statLive').textContent = live.length;
  document.getElementById('statExpired').textContent = expired.length;
}

function renderPromos() {
  const grid = document.getElementById('promoGrid');
  if (promos.length === 0) {
    grid.innerHTML = `
      <div class="promo-empty" style="grid-column:1/-1;">
        <div class="promo-empty-icon">🎟️</div>
        <p>Belum ada promo banner</p>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="openAddPromo()">➕ Tambah Promo Pertama</button>
      </div>`;
    return;
  }

  const now = new Date();
  const sorted = [...promos].sort((a, b) => (a.order || 0) - (b.order || 0));

  grid.innerHTML = sorted.map(promo => {
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    const isLive = promo.active && now >= start && now <= end;
    const isExpired = end < now;

    let statusBadge = '';
    if (isLive) {
      statusBadge = '<span class="badge badge-success">🟢 Live</span>';
    } else if (isExpired) {
      statusBadge = '<span class="badge badge-danger">⏰ Expired</span>';
    } else if (!promo.active) {
      statusBadge = '<span class="badge badge-secondary">⏸ Nonaktif</span>';
    } else {
      statusBadge = '<span class="badge badge-warning">📅 Terjadwal</span>';
    }

    const imgHtml = promo.image
      ? `<img class="promo-card-img" src="${promo.image}" alt="${promo.title}" onerror="this.parentElement.innerHTML='<div class=\\'promo-card-img-fallback\\'>🎟️</div>'">`
      : `<div class="promo-card-img-fallback">🎟️</div>`;

    const linkLabel = {
      game: '🎮 Game: ' + promo.linkValue,
      voucher: '🎟️ Voucher: ' + promo.linkValue,
      url: '🔗 URL',
      none: '❌ Tanpa link'
    }[promo.linkType] || '';

    const formatDateShort = (d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return `
    <div class="promo-card" data-id="${promo.id}">
      <div class="promo-card-img-wrapper">
        ${imgHtml}
        <div class="promo-card-badge-overlay">
          <span class="promo-card-badge" style="background:${promo.badgeColor || '#ef4444'}">${promo.badge || 'PROMO'}</span>
        </div>
        <div class="promo-card-status">${statusBadge}</div>
      </div>
      <div class="promo-card-body">
        <div class="promo-card-title">${promo.title}</div>
        <div class="promo-card-subtitle">${promo.subtitle}</div>
        <div class="promo-card-meta">
          <span class="promo-meta-tag">📅 ${formatDateShort(promo.startDate)} — ${formatDateShort(promo.endDate)}</span>
          <span class="promo-meta-tag">${linkLabel}</span>
          <span class="promo-meta-tag">📊 Urutan: ${promo.order || '-'}</span>
        </div>
        <div class="promo-card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editPromo('${promo.id}')">✏️ Edit</button>
          <button class="btn ${promo.active ? 'btn-danger' : 'btn-success'} btn-sm" onclick="togglePromoActive('${promo.id}')">
            ${promo.active ? '⏸ Nonaktifkan' : '▶️ Aktifkan'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deletePromo('${promo.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Modal Helpers ──
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ── Add Promo ──
function openAddPromo() {
  document.getElementById('promoModalTitle').textContent = '➕ Tambah Promo Baru';
  document.getElementById('promoEditId').value = '';
  document.getElementById('promoTitle').value = '';
  document.getElementById('promoSubtitle').value = '';
  document.getElementById('promoBadge').value = '';
  document.getElementById('promoImageUrl').value = '';
  document.getElementById('promoLinkType').value = 'game';
  document.getElementById('promoLinkValue').value = '';
  document.getElementById('promoOrder').value = promos.length + 1;
  document.getElementById('promoActive').checked = true;

  // Default dates
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 1);
  document.getElementById('promoStartDate').value = toLocalDatetimeStr(now);
  document.getElementById('promoEndDate').value = toLocalDatetimeStr(end);

  // Reset image preview
  resetImagePreview();
  
  // Reset color
  selectColorByValue('#ef4444');
  
  updateLinkValuePlaceholder();
  openModal('promoModal');
}

// ── Edit Promo ──
function editPromo(id) {
  const promo = promos.find(p => p.id === id);
  if (!promo) return;

  document.getElementById('promoModalTitle').textContent = '✏️ Edit Promo';
  document.getElementById('promoEditId').value = promo.id;
  document.getElementById('promoTitle').value = promo.title;
  document.getElementById('promoSubtitle').value = promo.subtitle;
  document.getElementById('promoBadge').value = promo.badge || '';
  document.getElementById('promoLinkType').value = promo.linkType || 'game';
  document.getElementById('promoLinkValue').value = promo.linkValue || '';
  document.getElementById('promoOrder').value = promo.order || 1;
  document.getElementById('promoActive').checked = promo.active;
  document.getElementById('promoStartDate').value = toLocalDatetimeStr(new Date(promo.startDate));
  document.getElementById('promoEndDate').value = toLocalDatetimeStr(new Date(promo.endDate));

  // Image
  if (promo.image) {
    document.getElementById('promoImageUrl').value = promo.image;
    showImagePreview(promo.image);
  } else {
    resetImagePreview();
  }

  // Color
  selectColorByValue(promo.badgeColor || '#ef4444');

  updateLinkValuePlaceholder();
  openModal('promoModal');
}

// ── Save Promo ──
function savePromo() {
  const editId = document.getElementById('promoEditId').value;
  const title = document.getElementById('promoTitle').value.trim();
  const subtitle = document.getElementById('promoSubtitle').value.trim();
  const badge = document.getElementById('promoBadge').value.trim();
  const linkType = document.getElementById('promoLinkType').value;
  const linkValue = document.getElementById('promoLinkValue').value.trim();
  const order = parseInt(document.getElementById('promoOrder').value) || 1;
  const active = document.getElementById('promoActive').checked;
  const startDate = document.getElementById('promoStartDate').value;
  const endDate = document.getElementById('promoEndDate').value;
  const image = document.getElementById('promoImageUrl').value.trim();

  if (!title) return showToast('Judul promo wajib diisi', 'error');
  if (!startDate || !endDate) return showToast('Tanggal mulai & berakhir wajib diisi', 'error');

  if (editId) {
    // Update existing
    const idx = promos.findIndex(p => p.id === editId);
    if (idx === -1) return;
    promos[idx] = {
      ...promos[idx],
      title, subtitle, badge, image,
      linkType, linkValue,
      badgeColor: selectedBadgeColor,
      startDate, endDate,
      order, active
    };
    showToast('Promo berhasil diupdate!', 'success');
  } else {
    // Add new
    const newPromo = {
      id: 'promo_' + Date.now(),
      title, subtitle, badge, image,
      linkType, linkValue,
      badgeColor: selectedBadgeColor,
      startDate, endDate,
      order, active
    };
    promos.push(newPromo);
    showToast('Promo baru berhasil ditambahkan!', 'success');
  }

  GF.set(GF.KEYS.PROMOS, promos);
  closeModal('promoModal');
  loadPromos();
}

// ── Toggle Active ──
function togglePromoActive(id) {
  const idx = promos.findIndex(p => p.id === id);
  if (idx === -1) return;
  promos[idx].active = !promos[idx].active;
  GF.set(GF.KEYS.PROMOS, promos);
  showToast(promos[idx].active ? 'Promo diaktifkan' : 'Promo dinonaktifkan', 'success');
  loadPromos();
}

// ── Delete ──
function deletePromo(id) {
  const promo = promos.find(p => p.id === id);
  if (!promo) return;
  deleteTargetId = id;
  document.getElementById('deletePromoName').textContent = promo.title;
  openModal('deleteModal');
}

function confirmDeletePromo() {
  if (!deleteTargetId) return;
  promos = promos.filter(p => p.id !== deleteTargetId);
  GF.set(GF.KEYS.PROMOS, promos);
  deleteTargetId = null;
  closeModal('deleteModal');
  showToast('Promo berhasil dihapus', 'success');
  loadPromos();
}

// ── Image Handling ──
function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('promoImageUrl').value = e.target.result;
    showImagePreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

function handleImageDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-active');
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('promoImageUrl').value = e.target.result;
    showImagePreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

function previewImageUrl() {
  const url = document.getElementById('promoImageUrl').value.trim();
  if (url) {
    showImagePreview(url);
  } else {
    resetImagePreview();
  }
}

function showImagePreview(src) {
  const box = document.getElementById('imgPreviewBox');
  box.innerHTML = `<img src="${src}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'img-preview-placeholder\\'>❌ Gagal memuat gambar</div>'"/>`;
}

function resetImagePreview() {
  const box = document.getElementById('imgPreviewBox');
  box.innerHTML = `<div class="img-preview-placeholder" id="imgPlaceholder">📷 Klik atau drop gambar disini<br><span style="font-size:0.72rem;color:var(--text-muted)">Recommended: 1200×400px</span></div>`;
  document.getElementById('promoImageUrl').value = '';
}

// ── Color Picker ──
function selectColor(el) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedBadgeColor = el.dataset.color;
}

function selectColorByValue(color) {
  selectedBadgeColor = color;
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === color);
  });
}

// ── Link Type Placeholder ──
function updateLinkValuePlaceholder() {
  const type = document.getElementById('promoLinkType').value;
  const group = document.getElementById('linkValueGroup');
  const label = document.getElementById('linkValueLabel');
  const input = document.getElementById('promoLinkValue');

  if (type === 'none') {
    group.style.display = 'none';
    return;
  }
  group.style.display = '';

  const config = {
    game: { label: 'Game ID', placeholder: 'Contoh: ml, ff, pubg' },
    voucher: { label: 'Kode Voucher', placeholder: 'Contoh: GAMEFLASH10' },
    url: { label: 'URL Tujuan', placeholder: 'https://...' },
  };

  const c = config[type] || config.game;
  label.textContent = c.label;
  input.placeholder = c.placeholder;
}

// ── Helpers ──
function toLocalDatetimeStr(date) {
  const d = new Date(date);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

// ── Init ──
document.addEventListener('DOMContentLoaded', checkAuth);
