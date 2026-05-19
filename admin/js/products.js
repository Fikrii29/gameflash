// =====================================================
// GAMEFLASH - Admin Products JS (with Image Upload Per Package)
// =====================================================

const ADMIN_SESSION = 'gf_admin_session';
let deleteTargetId = null;

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
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginPass').value = '';
  }
}

function doLogout() { sessionStorage.removeItem(ADMIN_SESSION); location.reload(); }
function init() { renderGamesAdmin(); }

// Resolve image path: admin pages are in /admin/, images are in /img/
function resolveImg(img) {
  if (!img) return null;
  if (img.startsWith('data:') || img.startsWith('http') || img.startsWith('//')) return img;
  return '../' + img;
}

// ─── GAME IMAGE PREVIEW HELPERS ───────────────────────
function setPreviewImage(src) {
  const img = document.getElementById('imgPreviewImg');
  const emoji = document.getElementById('imgPreviewEmoji');
  const box = document.getElementById('imgPreviewBox');
  if (src) {
    img.src = src;
    img.style.display = 'block';
    emoji.style.display = 'none';
    box.style.border = '2px solid rgba(0,212,255,0.4)';
    box.style.background = 'transparent';
  } else {
    img.src = '';
    img.style.display = 'none';
    emoji.style.display = 'block';
    box.style.border = '2px dashed rgba(0,212,255,0.3)';
    box.style.background = 'rgba(0,212,255,0.08)';
  }
}

function updateEmojiPreview(val) {
  const currentImg = document.getElementById('gImageData').value || document.getElementById('gImageUrl').value;
  if (!currentImg) {
    document.getElementById('imgPreviewEmoji').textContent = val || '🎮';
  }
}

function previewFromUrl(url) {
  document.getElementById('gImageData').value = '';
  document.getElementById('gImageFile').value = '';
  if (url && url.startsWith('http')) {
    setPreviewImage(url);
  } else {
    const emoji = document.getElementById('gEmoji').value || '🎮';
    document.getElementById('imgPreviewEmoji').textContent = emoji;
    setPreviewImage('');
  }
}

function previewFromFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2.5 * 1024 * 1024) {
    showToast('File terlalu besar! Maksimal ~2MB', 'error');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    document.getElementById('gImageData').value = base64;
    document.getElementById('gImageUrl').value = '';
    setPreviewImage(base64);
    showToast('Gambar game berhasil dipilih ✅', 'success');
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  document.getElementById('gImageData').value = '';
  document.getElementById('gImageUrl').value = '';
  document.getElementById('gImageFile').value = '';
  const emoji = document.getElementById('gEmoji').value || '🎮';
  document.getElementById('imgPreviewEmoji').textContent = emoji;
  setPreviewImage('');
  showToast('Gambar dihapus', 'info');
}

function getFinalImageSrc() {
  return document.getElementById('gImageData').value ||
    document.getElementById('gImageUrl').value.trim() ||
    null;
}

// ─── PACKAGE IMAGE HELPERS ────────────────────────────
// Unique ID counter per session for pkg image inputs
let _pkgImgCounter = 0;

function getPkgImgId(rowId) {
  return 'pkgImg_' + rowId;
}

function previewPkgImageFromFile(input, rowId) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 1.5 * 1024 * 1024) {
    showToast('Gambar paket terlalu besar! Maks ~1.5MB', 'error');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    const dataInput = document.getElementById('pkgImgData_' + rowId);
    const urlInput = document.getElementById('pkgImgUrl_' + rowId);
    const preview = document.getElementById('pkgImgPreview_' + rowId);
    const placeholder = document.getElementById('pkgImgPlaceholder_' + rowId);
    if (dataInput) dataInput.value = base64;
    if (urlInput) urlInput.value = '';
    if (preview) { preview.src = base64; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    showToast('Gambar paket berhasil dipilih ✅', 'success');
  };
  reader.readAsDataURL(file);
}

function previewPkgImageFromUrl(rowId) {
  const urlInput = document.getElementById('pkgImgUrl_' + rowId);
  const dataInput = document.getElementById('pkgImgData_' + rowId);
  const preview = document.getElementById('pkgImgPreview_' + rowId);
  const placeholder = document.getElementById('pkgImgPlaceholder_' + rowId);
  const url = urlInput ? urlInput.value.trim() : '';
  if (url && (url.startsWith('http') || url.startsWith('//'))) {
    if (dataInput) dataInput.value = '';
    if (preview) { preview.src = url; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
  } else {
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    if (placeholder) placeholder.style.display = 'flex';
  }
}

function clearPkgImage(rowId) {
  const dataInput = document.getElementById('pkgImgData_' + rowId);
  const urlInput = document.getElementById('pkgImgUrl_' + rowId);
  const fileInput = document.getElementById('pkgImgFile_' + rowId);
  const preview = document.getElementById('pkgImgPreview_' + rowId);
  const placeholder = document.getElementById('pkgImgPlaceholder_' + rowId);
  if (dataInput) dataInput.value = '';
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'flex';
}

function getFinalPkgImageSrc(rowId) {
  const dataInput = document.getElementById('pkgImgData_' + rowId);
  const urlInput = document.getElementById('pkgImgUrl_' + rowId);
  return (dataInput && dataInput.value) ||
    (urlInput && urlInput.value.trim()) ||
    null;
}

function togglePkgImagePanel(rowId) {
  const panel = document.getElementById('pkgImgPanel_' + rowId);
  const btn = document.getElementById('pkgImgToggleBtn_' + rowId);
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (btn) btn.textContent = isOpen ? '🖼️ Tambah Gambar' : '🖼️ Sembunyikan';
}

// ─── RENDER GAMES ADMIN GRID ──────────────────────────
function renderGamesAdmin() {
  const games = GF.get(GF.KEYS.GAMES) || [];
  const grid = document.getElementById('gamesAdminGrid');

  if (!games.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;">
      <div style="font-size:3rem;margin-bottom:16px;">🎮</div>
      <p style="color:var(--text-muted)">Belum ada game. Klik "Tambah Game" untuk mulai.</p>
    </div>`;
    return;
  }

  grid.innerHTML = games.map(game => {
    const activePkgs = game.packages ? game.packages.filter(p => p.active).length : 0;
    const iconHtml = game.image
      ? `<img src="${resolveImg(game.image)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span style="font-size:2rem;display:none;">${game.emoji}</span>`
      : `<span style="font-size:2rem;">${game.emoji}</span>`;

    return `
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.borderColor='var(--border-glow)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="padding:20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;">
        <div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:${game.image ? 'transparent' : 'rgba(0,212,255,0.08)'};overflow:hidden;flex-shrink:0;border:1px solid var(--border);">
          ${iconHtml}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:1.1rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${game.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${game.category} • ${activePkgs} paket aktif${game.image ? ' • 🖼️ game img' : ''}${_countPkgsWithImg(game)} </div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${game.active ? 'checked' : ''} onchange="toggleGame('${game.id}', this.checked)"/>
          <div class="toggle-slider"></div>
        </label>
      </div>
      <div style="padding:16px;">
        <div class="pkg-list">
          ${(game.packages || []).slice(0, 4).map(pkg => {
      const hasFlash = pkg.flashSalePrice && pkg.flashSalePrice < pkg.price && (!pkg.flashSaleEnd || new Date(pkg.flashSaleEnd) > new Date());
      const flashTag = hasFlash ? `<span style="font-size:0.65rem;color:#ef4444;margin-left:4px;">🔥 ${formatRupiah(pkg.flashSalePrice)}</span>` : '';
      const imgTag = pkg.image ? `<span style="font-size:0.65rem;color:var(--cyan);margin-left:4px;">🖼️</span>` : '';
      return `
            <div class="pkg-item">
              <div class="pkg-item-info">
                <div class="pkg-item-name">${pkg.image ? `<img src="${resolveImg(pkg.image)}" style="width:20px;height:20px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:5px;" onerror="this.style.display='none'"/>` : ''}${pkg.name}${flashTag}</div>
                <div class="pkg-item-sku">SKU: ${pkg.sku}</div>
              </div>
              <div class="pkg-item-price">${formatRupiah(pkg.price)}</div>
              <label class="toggle-switch" style="transform:scale(0.85)">
                <input type="checkbox" ${pkg.active ? 'checked' : ''} onchange="togglePackage('${game.id}','${pkg.id}',this.checked)"/>
                <div class="toggle-slider"></div>
              </label>
            </div>`;
    }).join('')}
          ${(game.packages || []).length > 4 ? `<div style="text-align:center;padding:8px;font-size:0.78rem;color:var(--text-muted);">+${game.packages.length - 4} paket lainnya</div>` : ''}
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn btn-secondary btn-sm" style="flex:1" onclick="showEditGameModal('${game.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="showDeleteModal('${game.id}')">🗑️ Hapus</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function _countPkgsWithImg(game) {
  const count = (game.packages || []).filter(p => p.image).length;
  return count > 0 ? ` • 🖼️ ${count} paket` : '';
}

// ─── TOGGLE ───────────────────────────────────────────
function toggleGame(gameId, active) {
  const games = GF.get(GF.KEYS.GAMES) || [];
  const idx = games.findIndex(g => g.id === gameId);
  if (idx !== -1) { games[idx].active = active; GF.set(GF.KEYS.GAMES, games); showToast(`Game ${active ? 'diaktifkan' : 'dinonaktifkan'}`, 'success'); }
}

function togglePackage(gameId, pkgId, active) {
  const games = GF.get(GF.KEYS.GAMES) || [];
  const gIdx = games.findIndex(g => g.id === gameId);
  if (gIdx !== -1) {
    const pIdx = games[gIdx].packages.findIndex(p => p.id === pkgId);
    if (pIdx !== -1) { games[gIdx].packages[pIdx].active = active; GF.set(GF.KEYS.GAMES, games); showToast('Paket diperbarui', 'success'); }
  }
}

// ─── MODAL ────────────────────────────────────────────
function resetImageForm(emoji = '🎮') {
  document.getElementById('gImageData').value = '';
  document.getElementById('gImageUrl').value = '';
  document.getElementById('gImageFile').value = '';
  document.getElementById('imgPreviewEmoji').textContent = emoji;
  setPreviewImage('');
}

function showAddGameModal() {
  document.getElementById('gameModalTitle').textContent = '➕ Tambah Game';
  document.getElementById('editGameId').value = '';
  document.getElementById('gName').value = '';
  document.getElementById('gEmoji').value = '';
  document.getElementById('gDesc').value = '';
  document.getElementById('gColor').value = '#00d4ff';
  document.getElementById('gActive').checked = true;
  document.getElementById('needsZoneId').checked = false;
  document.getElementById('needsServer').checked = false;
  document.getElementById('packageRows').innerHTML = '';
  resetImageForm();
  addPackageRow();
  document.getElementById('gameModal').classList.add('active');
}

function showEditGameModal(gameId) {
  const games = GF.get(GF.KEYS.GAMES) || [];
  const game = games.find(g => g.id === gameId);
  if (!game) return;

  document.getElementById('gameModalTitle').textContent = '✏️ Edit Game';
  document.getElementById('editGameId').value = game.id;
  document.getElementById('gName').value = game.name;
  document.getElementById('gEmoji').value = game.emoji;
  document.getElementById('gDesc').value = game.description || '';
  document.getElementById('gColor').value = game.color || '#00d4ff';
  document.getElementById('gCategory').value = game.category;
  document.getElementById('gActive').checked = game.active;
  document.getElementById('needsZoneId').checked = game.inputFields.some(f => f.name === 'zoneId');
  document.getElementById('needsServer').checked = game.inputFields.some(f => f.name === 'server' && f.type === 'select');

  // Load existing game image
  document.getElementById('gImageData').value = '';
  document.getElementById('gImageFile').value = '';
  if (game.image) {
    const resolved = resolveImg(game.image);
    document.getElementById('gImageUrl').value = game.image.startsWith('data:') ? '' : (game.image.startsWith('http') ? game.image : '');
    document.getElementById('gImageData').value = game.image.startsWith('data:') ? game.image : '';
    setPreviewImage(resolved);
  } else {
    resetImageForm(game.emoji);
  }

  const pkgRows = document.getElementById('packageRows');
  pkgRows.innerHTML = '';
  (game.packages || []).forEach(pkg => addPackageRow(pkg));

  document.getElementById('gameModal').classList.add('active');
}

// ─── ADD PACKAGE ROW (with image upload) ──────────────
function addPackageRow(pkg = null) {
  const container = document.getElementById('packageRows');
  const id = 'pkgrow_' + Date.now() + '_' + (++_pkgImgCounter);

  const div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'background:var(--bg-secondary);border-radius:10px;padding:12px;margin-bottom:2px;';

  const hasFlash = pkg?.flashSalePrice ? true : false;
  const flashEndVal = pkg?.flashSaleEnd ? new Date(pkg.flashSaleEnd).toISOString().slice(0, 16) : '';

  // Determine existing pkg image
  const existingImg = pkg?.image || null;
  const existingImgResolved = existingImg ? resolveImg(existingImg) : null;
  const imgPanelDisplay = existingImg ? 'block' : 'none';
  const imgPreviewDisplay = existingImg ? 'block' : 'none';
  const placeholderDisplay = existingImg ? 'none' : 'flex';
  const imgToggleBtnText = existingImg ? '🖼️ Sembunyikan' : '🖼️ Tambah Gambar';

  div.innerHTML = `
    <!-- Row utama: nama, jumlah, harga, SKU, hapus -->
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;align-items:center;">
      <input type="text" placeholder="Nama (contoh: 112 Diamond)" class="form-control pkg-name" value="${pkg?.name || ''}" style="padding:7px 10px;font-size:0.8rem"/>
      <input type="number" placeholder="Jumlah" class="form-control pkg-amount" value="${pkg?.amount || ''}" style="padding:7px 10px;font-size:0.8rem"/>
      <input type="number" placeholder="Harga (Rp)" class="form-control pkg-price" value="${pkg?.price || ''}" style="padding:7px 10px;font-size:0.8rem"/>
      <input type="text" placeholder="SKU Digiflazz" class="form-control pkg-sku" value="${pkg?.sku || ''}" style="padding:7px 10px;font-size:0.8rem"/>
      <button onclick="document.getElementById('${id}').remove()" style="padding:7px 10px;background:rgba(239,68,68,0.1);border:none;border-radius:6px;color:var(--red);cursor:pointer;font-size:0.85rem;">🗑️</button>
    </div>

    <!-- Tombol aksi bawah -->
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;align-items:center;">
      <!-- Toggle gambar paket -->
      <button type="button" id="pkgImgToggleBtn_${id}" onclick="togglePkgImagePanel('${id}')"
        style="background:none;border:1px dashed ${existingImg ? 'rgba(0,212,255,0.5)' : 'var(--border)'};color:${existingImg ? 'var(--cyan)' : 'var(--text-muted)'};font-size:0.72rem;padding:4px 10px;border-radius:6px;cursor:pointer;transition:all 0.2s;">
        ${imgToggleBtnText}
      </button>
      <!-- Toggle flash sale -->
      <button type="button" class="flash-toggle-btn" onclick="toggleFlashFields(this)"
        style="background:none;border:1px dashed ${hasFlash ? 'rgba(239,68,68,0.5)' : 'var(--border)'};color:${hasFlash ? '#ef4444' : 'var(--text-muted)'};font-size:0.72rem;padding:4px 10px;border-radius:6px;cursor:pointer;transition:all 0.2s;">
        🔥 ${hasFlash ? 'Flash Sale Aktif' : 'Tambah Flash Sale'}
      </button>
    </div>

    <!-- Panel Gambar Paket -->
    <div id="pkgImgPanel_${id}" style="display:${imgPanelDisplay};margin-top:8px;">
      <input type="hidden" id="pkgImgData_${id}" value="${existingImg && existingImg.startsWith('data:') ? existingImg : ''}"/>
      <div style="background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.15);border-radius:8px;padding:10px;">
        <div style="font-size:0.7rem;color:var(--cyan);font-weight:600;margin-bottom:8px;">🖼️ Gambar Paket</div>
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <!-- Preview thumbnail -->
          <div style="width:60px;height:60px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px dashed var(--border);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;cursor:pointer;"
            onclick="document.getElementById('pkgImgFile_${id}').click()" title="Klik upload gambar">
            <div id="pkgImgPlaceholder_${id}" style="display:${placeholderDisplay};flex-direction:column;align-items:center;gap:2px;">
              <span style="font-size:1.2rem;">📷</span>
              <span style="font-size:0.55rem;color:var(--text-muted);">Upload</span>
            </div>
            <img id="pkgImgPreview_${id}"
              src="${existingImgResolved || ''}"
              style="display:${imgPreviewDisplay};width:100%;height:100%;object-fit:cover;"
              onerror="this.style.display='none';document.getElementById('pkgImgPlaceholder_${id}').style.display='flex'"/>
          </div>
          <!-- Controls -->
          <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
            <input type="text" class="form-control" id="pkgImgUrl_${id}"
              value="${existingImg && !existingImg.startsWith('data:') ? existingImg : ''}"
              placeholder="https://... (URL gambar) atau upload file"
              oninput="previewPkgImageFromUrl('${id}')"
              style="font-size:0.78rem;padding:6px 10px;"/>
            <div style="display:flex;gap:6px;">
              <label style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:5px 10px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:6px;cursor:pointer;font-size:0.72rem;color:var(--purple);">
                📁 Upload
                <input type="file" id="pkgImgFile_${id}" accept="image/*" style="display:none"
                  onchange="previewPkgImageFromFile(this,'${id}')"/>
              </label>
              <button type="button" onclick="clearPkgImage('${id}')"
                style="padding:5px 10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:6px;color:var(--red);cursor:pointer;font-size:0.72rem;">
                🗑️ Hapus
              </button>
            </div>
            <div style="font-size:0.65rem;color:var(--text-muted);">JPG, PNG, WebP • Maks ~1.5MB • Tampil di kartu paket</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flash Sale Fields -->
    <div class="flash-fields" style="display:${hasFlash ? 'grid' : 'none'};grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;padding:8px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:8px;">
      <div>
        <label style="font-size:0.65rem;color:var(--text-muted);display:block;margin-bottom:2px;">Harga Flash (Rp)</label>
        <input type="number" placeholder="Harga sale" class="form-control pkg-flash-price" value="${pkg?.flashSalePrice || ''}" style="padding:5px 8px;font-size:0.78rem;"/>
      </div>
      <div>
        <label style="font-size:0.65rem;color:var(--text-muted);display:block;margin-bottom:2px;">Stok Terbatas</label>
        <input type="number" placeholder="Contoh: 50" class="form-control pkg-flash-stock" value="${pkg?.flashSaleStock ?? ''}" style="padding:5px 8px;font-size:0.78rem;"/>
      </div>
      <div>
        <label style="font-size:0.65rem;color:var(--text-muted);display:block;margin-bottom:2px;">Berakhir</label>
        <input type="datetime-local" class="form-control pkg-flash-end" value="${flashEndVal}" style="padding:5px 8px;font-size:0.78rem;"/>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function toggleFlashFields(btn) {
  const fields = btn.closest('div').parentElement.querySelector('.flash-fields');
  const isVisible = fields.style.display !== 'none';
  fields.style.display = isVisible ? 'none' : 'grid';
  btn.style.borderColor = isVisible ? 'var(--border)' : 'rgba(239,68,68,0.5)';
  btn.style.color = isVisible ? 'var(--text-muted)' : '#ef4444';
  btn.textContent = isVisible ? '🔥 Tambah Flash Sale' : '🔥 Flash Sale Aktif';
  if (isVisible) {
    fields.querySelector('.pkg-flash-price').value = '';
    fields.querySelector('.pkg-flash-stock').value = '';
    fields.querySelector('.pkg-flash-end').value = '';
  }
}

function saveGame() {
  const editId = document.getElementById('editGameId').value;
  const name = document.getElementById('gName').value.trim();
  const emoji = document.getElementById('gEmoji').value.trim() || '🎮';
  const color = document.getElementById('gColor').value;
  const category = document.getElementById('gCategory').value;
  const desc = document.getElementById('gDesc').value.trim();
  const active = document.getElementById('gActive').checked;
  const needsZone = document.getElementById('needsZoneId').checked;
  const needsServer = document.getElementById('needsServer').checked;
  const image = getFinalImageSrc();

  if (!name) { showToast('Nama game wajib diisi', 'error'); return; }

  const inputFields = [{ name: 'userId', label: 'User ID', placeholder: 'Masukkan User ID', type: 'text' }];
  if (needsZone) inputFields.push({ name: 'zoneId', label: 'Zone ID', placeholder: 'Masukkan Zone ID', type: 'text' });
  if (needsServer) inputFields.push({ name: 'server', label: 'Server', placeholder: 'Pilih Server', type: 'select', options: ['Asia', 'America', 'Europe'] });

  // Build packages - now includes per-package image
  const packages = [];
  document.querySelectorAll('#packageRows > div').forEach(row => {
    const rowId = row.id;
    const nameEl = row.querySelector('.pkg-name');
    const amountEl = row.querySelector('.pkg-amount');
    const priceEl = row.querySelector('.pkg-price');
    const skuEl = row.querySelector('.pkg-sku');
    const flashPriceEl = row.querySelector('.pkg-flash-price');
    const flashStockEl = row.querySelector('.pkg-flash-stock');
    const flashEndEl = row.querySelector('.pkg-flash-end');

    if (nameEl && nameEl.value.trim()) {
      const pkgData = {
        id: 'pkg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
        name: nameEl.value.trim(),
        currency: name.split(' ')[0],
        amount: parseInt(amountEl?.value) || 0,
        price: parseInt(priceEl?.value) || 0,
        sku: skuEl?.value.trim() || '',
        active: true,
        image: getFinalPkgImageSrc(rowId) // 🆕 per-package image
      };

      const fp = parseInt(flashPriceEl?.value);
      if (fp && fp > 0 && fp < pkgData.price) {
        pkgData.flashSalePrice = fp;
        const fs = parseInt(flashStockEl?.value);
        if (fs && fs > 0) { pkgData.flashSaleStock = fs; pkgData.flashSaleMaxStock = fs; }
        if (flashEndEl?.value) pkgData.flashSaleEnd = new Date(flashEndEl.value).toISOString();
      }

      packages.push(pkgData);
    }
  });

  const games = GF.get(GF.KEYS.GAMES) || [];
  const gradient = `linear-gradient(135deg, ${color}, ${color}99)`;
  const gameData = { name, emoji, image, color, gradient, category, description: desc, active, inputFields, packages };

  if (editId) {
    const idx = games.findIndex(g => g.id === editId);
    if (idx !== -1) {
      // Preserve existing pkg IDs saat edit
      const existingPkgs = games[idx].packages || [];
      gameData.packages = packages.map((pkg, i) => ({
        ...pkg,
        id: existingPkgs[i]?.id || pkg.id
      }));
      Object.assign(games[idx], gameData);
    }
    showToast('Game berhasil diperbarui! ✅', 'success');
  } else {
    const newId = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    games.unshift({ id: newId, ...gameData });
    showToast('Game baru ditambahkan! ✅', 'success');
  }

  GF.set(GF.KEYS.GAMES, games);
  closeModal('gameModal');
  renderGamesAdmin();
}

// ─── DELETE ───────────────────────────────────────────
function showDeleteModal(gameId) { deleteTargetId = gameId; document.getElementById('deleteModal').classList.add('active'); }

function confirmDelete() {
  if (!deleteTargetId) return;
  const games = (GF.get(GF.KEYS.GAMES) || []).filter(g => g.id !== deleteTargetId);
  GF.set(GF.KEYS.GAMES, games);
  showToast('Game dihapus', 'success');
  closeModal('deleteModal');
  renderGamesAdmin();
  deleteTargetId = null;
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div'); t.className = `toast ${type}`;
  t.innerHTML = `<span>${{ success: '✅', error: '❌', info: 'ℹ️' }[type] || 'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t); setTimeout(() => t.remove(), 3200);
}

function formatRupiah(n) {
  if (!n && n !== 0) return '-';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}

// ─── AUTO SYNC FROM DIGIFLAZZ ────────────────────────
async function syncFromDigiflazz() {
  const btn = document.getElementById('btnSyncDigiflazz');
  const log = document.getElementById('syncLog');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Mengambil data...'; }
  log.innerHTML = '<div style="color:var(--cyan)">⏳ Menghubungi Digiflazz API...</div>';

  let priceList;
  try {
    const result = await DigiFlazz.getPriceList();
    if (!result.success || !result.data) throw new Error(result.error || 'Gagal mengambil price list');
    priceList = result.data;
  } catch (e) {
    log.innerHTML = `<div style="color:var(--red)">❌ ${e.message}</div>`;
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Sync Digiflazz'; }
    return;
  }

  const skuMap = {};
  priceList.forEach(item => { skuMap[item.buyer_sku_code] = item; });

  const games = GF.get(GF.KEYS.GAMES) || [];
  let updatedPkgs = 0, matchedPkgs = 0, skippedPkgs = 0;
  const margin = parseInt(document.getElementById('syncMargin')?.value) || 0;

  games.forEach(game => {
    (game.packages || []).forEach(pkg => {
      if (!pkg.sku) return;
      const dfItem = skuMap[pkg.sku];
      if (!dfItem) { skippedPkgs++; return; }
      matchedPkgs++;
      const basePrice = parseInt(dfItem.price) || pkg.price;
      const newPrice = basePrice + Math.round(basePrice * margin / 100);
      if (newPrice !== pkg.price) { pkg.price = newPrice; updatedPkgs++; }
      if (!pkg.name || pkg.name === '') pkg.name = dfItem.product_name;
    });
  });

  GF.set(GF.KEYS.GAMES, games);

  log.innerHTML = `
    <div style="color:var(--green)">✅ Sync selesai!</div>
    <div style="color:var(--text-muted);font-size:0.8rem;margin-top:4px;">
      🔗 SKU cocok: <b style="color:#fff">${matchedPkgs}</b> &nbsp;|&nbsp;
      💰 Harga diperbarui: <b style="color:var(--cyan)">${updatedPkgs}</b> &nbsp;|&nbsp;
      ⚠️ SKU tidak ditemukan: <b style="color:var(--yellow)">${skippedPkgs}</b>
    </div>`;

  if (btn) { btn.disabled = false; btn.textContent = '🔄 Sync Digiflazz'; }
  renderGamesAdmin();
  if (document.getElementById('bulkModal')?.classList.contains('active')) renderBulkTable();
  showToast(`Sync selesai! ${updatedPkgs} harga diperbarui`, 'success');
}

// ─── BULK EDIT ────────────────────────────────────────
let bulkData = [];

function openSyncModal() {
  document.getElementById('syncLog').style.display = 'none';
  document.getElementById('syncLog').innerHTML = '';
  document.getElementById('syncMargin').value = '10';
  const btn = document.getElementById('btnSyncDigiflazz');
  if (btn) { btn.disabled = false; btn.textContent = '🔄 Mulai Sync'; }
  document.getElementById('syncModal').classList.add('active');
}

function openBulkEdit() {
  bulkData = [];
  const games = GF.get(GF.KEYS.GAMES) || [];
  games.forEach(game => {
    (game.packages || []).forEach(pkg => {
      bulkData.push({ gameId: game.id, gameName: game.name, pkg: JSON.parse(JSON.stringify(pkg)) });
    });
  });
  renderBulkTable();
  document.getElementById('bulkModal').classList.add('active');
}

function renderBulkTable(filter = '') {
  const tbody = document.getElementById('bulkTableBody');
  const filterLower = filter.toLowerCase();
  const rows = bulkData.filter(r =>
    !filter ||
    r.gameName.toLowerCase().includes(filterLower) ||
    r.pkg.name.toLowerCase().includes(filterLower) ||
    (r.pkg.sku || '').toLowerCase().includes(filterLower)
  );

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted);">Tidak ada paket ditemukan</td></tr>';
    return;
  }

  const counter = document.getElementById('bulkCountInfo');
  if (counter) counter.textContent = `Total: ${bulkData.length} paket dari ${[...new Set(bulkData.map(r => r.gameId))].length} game  |  Ditampilkan: ${rows.length}`;

  tbody.innerHTML = rows.map((r, i) => {
    const idx = bulkData.indexOf(r);
    const marginVal = r.pkg._basePrice ? Math.round((r.pkg.price - r.pkg._basePrice) / r.pkg._basePrice * 100) : '';
    const pkgImgSrc = r.pkg.image ? resolveImg(r.pkg.image) : null;
    return `
    <tr id="bulk_row_${idx}">
      <td style="font-size:0.78rem;color:var(--text-muted);padding:8px 12px;white-space:nowrap;">${r.gameName}</td>
      <td style="padding:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          ${pkgImgSrc
        ? `<img src="${pkgImgSrc}" style="width:28px;height:28px;object-fit:cover;border-radius:4px;flex-shrink:0;" onerror="this.style.display='none'"/>`
        : `<div style="width:28px;height:28px;border-radius:4px;background:rgba(255,255,255,0.04);border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:var(--text-muted);flex-shrink:0;">📷</div>`
      }
          <input type="text" class="form-control" value="${r.pkg.name}"
            onchange="updateBulkField(${idx},'name',this.value)"
            style="font-size:0.8rem;padding:5px 8px;min-width:140px;"/>
        </div>
      </td>
      <td style="padding:8px;">
        <input type="text" class="form-control" value="${r.pkg.sku || ''}"
          onchange="updateBulkField(${idx},'sku',this.value)"
          style="font-size:0.8rem;padding:5px 8px;width:110px;font-family:monospace;"/>
      </td>
      <td style="padding:8px;">
        <input type="number" class="form-control" value="${r.pkg.price}"
          oninput="updateBulkField(${idx},'price',+this.value);updateBulkMarginDisplay(${idx})"
          style="font-size:0.8rem;padding:5px 8px;width:110px;"
          id="bulk_price_${idx}"/>
      </td>
      <td style="padding:8px;">
        <div style="display:flex;align-items:center;gap:4px;">
          <input type="number" placeholder="%" class="form-control" value="${marginVal}"
            oninput="applyMarginToRow(${idx},+this.value)"
            style="font-size:0.8rem;padding:5px 8px;width:70px;"
            id="bulk_margin_${idx}"/>
          <span style="font-size:0.75rem;color:var(--text-muted);">%</span>
        </div>
      </td>
      <td style="padding:8px;text-align:center;">
        <label class="toggle-switch" style="transform:scale(0.85)">
          <input type="checkbox" ${r.pkg.active !== false ? 'checked' : ''}
            onchange="updateBulkField(${idx},'active',this.checked)"/>
          <div class="toggle-slider"></div>
        </label>
      </td>
      <td style="padding:8px;text-align:center;">
        <span style="font-size:0.72rem;color:var(--text-muted);">${r.pkg.currency || ''}</span>
      </td>
      <td style="padding:8px;text-align:center;">
        ${pkgImgSrc
        ? `<span style="font-size:0.7rem;color:var(--cyan);">🖼️ Ada</span>`
        : `<span style="font-size:0.7rem;color:var(--text-muted);">-</span>`
      }
      </td>
    </tr>`;
  }).join('');
}

function updateBulkField(idx, field, value) {
  if (!bulkData[idx]) return;
  bulkData[idx].pkg[field] = value;
}

function applyMarginToRow(idx, margin) {
  if (!bulkData[idx]) return;
  const base = bulkData[idx].pkg._basePrice || bulkData[idx].pkg.price;
  if (!base) return;
  const newPrice = Math.round(base * (1 + margin / 100));
  bulkData[idx].pkg.price = newPrice;
  bulkData[idx].pkg._basePrice = base;
  const priceInput = document.getElementById('bulk_price_' + idx);
  if (priceInput) priceInput.value = newPrice;
}

function updateBulkMarginDisplay(idx) {
  const marginInput = document.getElementById('bulk_margin_' + idx);
  if (marginInput) marginInput.value = '';
  if (bulkData[idx]) delete bulkData[idx].pkg._basePrice;
}

function applyBulkMarginAll() {
  const margin = parseFloat(document.getElementById('bulkMarginAll').value);
  if (isNaN(margin)) { showToast('Masukkan nilai margin yang valid', 'error'); return; }
  bulkData.forEach((r, idx) => {
    const base = r.pkg._basePrice || r.pkg.price;
    r.pkg._basePrice = base;
    r.pkg.price = Math.round(base * (1 + margin / 100));
  });
  renderBulkTable(document.getElementById('bulkSearch').value);
  showToast(`Margin ${margin}% diterapkan ke semua paket`, 'success');
}

function applyBulkPriceAdjust() {
  const type = document.getElementById('bulkAdjustType').value;
  const val = parseFloat(document.getElementById('bulkAdjustVal').value);
  if (isNaN(val)) { showToast('Masukkan nilai yang valid', 'error'); return; }
  const selected = [...document.querySelectorAll('.bulk-row-check:checked')].map(el => parseInt(el.dataset.idx));
  const targets = selected.length ? selected : bulkData.map((_, i) => i);
  targets.forEach(idx => {
    if (!bulkData[idx]) return;
    const p = bulkData[idx].pkg.price;
    if (type === 'add') bulkData[idx].pkg.price = p + val;
    else if (type === 'subtract') bulkData[idx].pkg.price = Math.max(0, p - val);
    else if (type === 'multiply') bulkData[idx].pkg.price = Math.round(p * val);
    else if (type === 'set') bulkData[idx].pkg.price = val;
  });
  renderBulkTable(document.getElementById('bulkSearch').value);
  showToast(`Harga diperbarui untuk ${targets.length} paket`, 'success');
}

function saveBulkEdit() {
  const games = GF.get(GF.KEYS.GAMES) || [];
  bulkData.forEach(({ gameId, pkg }) => {
    const gIdx = games.findIndex(g => g.id === gameId);
    if (gIdx === -1) return;
    const pIdx = games[gIdx].packages.findIndex(p => p.id === pkg.id);
    if (pIdx === -1) return;
    const { _basePrice, ...cleanPkg } = pkg;
    games[gIdx].packages[pIdx] = cleanPkg;
  });
  GF.set(GF.KEYS.GAMES, games);
  closeModal('bulkModal');
  renderGamesAdmin();
  showToast('✅ Semua perubahan berhasil disimpan!', 'success');
}

function closeBulkModal() {
  if (confirm('Batalkan semua perubahan bulk edit?')) closeModal('bulkModal');
}

document.addEventListener('DOMContentLoaded', checkAuth);