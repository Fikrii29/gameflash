/* =====================================================
   Gameflash - Footer bersama (dipakai di semua halaman)
   CSS ikut di dalam file ini, jadi tidak bergantung pada style.css
   ===================================================== */
(function () {
  var DEFAULTS = { storeName: 'Gameflash', whatsapp: '6281234567890' };
  var remote = {};   // dari site-config.json (publik, terlihat semua pengunjung)

  var WA_ICON = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5.2.6.8 2 .9 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>';

  var CSS = '' +
    '.gf-ft{background:var(--bg-secondary,#0d0d1a);border-top:1px solid var(--border,rgba(255,255,255,.08));color:var(--text-primary,#f5f5f7);padding:40px 20px 24px;position:relative;z-index:1;font-family:inherit}' +
    '.gf-ft *{box-sizing:border-box}' +
    '.gf-ft a{text-decoration:none;color:inherit}' +
    '.gf-ft-in{max-width:1100px;margin:0 auto;display:grid;gap:28px}' +
    '.gf-ft-brand .gf-ft-logo{display:inline-block;font-size:1.5rem;font-weight:800;font-style:italic;color:var(--cyan,#00d4ff);margin-bottom:10px}' +
    '.gf-ft-brand p{margin:0;font-size:.9rem;line-height:1.65;color:var(--text-secondary,#c9c9d0);max-width:460px}' +
    '.gf-ft-cols{display:grid;grid-template-columns:1fr 1fr;gap:28px 20px}' +
    '.gf-ft-col h4{margin:0 0 14px;font-size:.95rem;font-weight:700;color:var(--cyan,#00d4ff);letter-spacing:.3px}' +
    '.gf-ft-col ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px}' +
    '.gf-ft-col li{margin:0;padding:0;list-style:none}' +
    '.gf-ft-col li a{font-size:.88rem;color:var(--text-primary,#f5f5f7);opacity:.88;transition:.2s}' +
    '.gf-ft-col li a:hover{color:var(--cyan,#00d4ff);opacity:1}' +
    '.gf-ft-support{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;background:rgba(255,255,255,.04);border:1px solid var(--border,rgba(255,255,255,.08));border-radius:16px;padding:16px 18px}' +
    '.gf-ft-support h4{margin:0 0 4px}' +
    '.gf-ft-support span{display:block;font-size:.8rem;color:var(--text-secondary,#c9c9d0)}' +
    '.gf-ft-wa{display:inline-flex;align-items:center;gap:10px;background:#25d366;color:#fff!important;font-weight:700;font-size:.9rem;padding:11px 20px;border-radius:999px;transition:.2s}' +
    '.gf-ft-wa:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(37,211,102,.35)}' +
    '.gf-ft-wa svg{width:20px;height:20px}' +
    '.gf-ft-bottom{max-width:1100px;margin:26px auto 0;padding-top:18px;border-top:1px solid var(--border,rgba(255,255,255,.08));text-align:center;font-size:.76rem;color:var(--text-muted,#8e8e98);line-height:1.6}' +
    '@media(min-width:820px){.gf-ft{padding:56px 24px 28px}.gf-ft-in{grid-template-columns:1.2fr 1.8fr;gap:56px}.gf-ft-cols{grid-template-columns:1fr 1fr;gap:28px 32px}}' +
    '@media(max-width:480px){.gf-ft{padding:32px 16px 20px}.gf-ft-support{flex-direction:column;align-items:stretch;text-align:left}.gf-ft-wa{justify-content:center}}';

  function getSettings() {
    try { return (typeof GF !== 'undefined' && GF.get(GF.KEYS.SETTINGS)) || {}; } catch (e) { return {}; }
  }
  function pick(a, b) { return (a && String(a).trim()) ? String(a).trim() : b; }
  function cfg() {
    var s = getSettings();   // dari dashboard admin (browser admin)
    return {
      name: pick(s.storeName, pick(remote.storeName, DEFAULTS.storeName)),
      wa: String(pick(s.footerWhatsapp, pick(remote.footerWhatsapp, pick(s.whatsapp, pick(remote.whatsapp, DEFAULTS.whatsapp))))).replace(/\D/g, '')
    };
  }

  function build() {
    var c = cfg();
    var waLink = 'https://wa.me/' + c.wa;
    return '' +
      '<div class="gf-ft-in">' +
        '<div class="gf-ft-brand">' +
          '<a href="index.html" class="gf-ft-logo">⚡ ' + c.name + '</a>' +
          '<p>Platform top up game terlaris, murah, aman, dan legal. Buka 24 jam dengan saluran pembayaran terlengkap di Indonesia.</p>' +
        '</div>' +
        '<div class="gf-ft-cols">' +
          '<div class="gf-ft-col"><h4>Peta Situs</h4><ul>' +
            '<li><a href="index.html">Beranda</a></li>' +
            '<li><a href="tentang-kami.html">Tentang Kami</a></li>' +
            '<li><a href="syarat-ketentuan.html">Syarat &amp; Ketentuan</a></li>' +
            '<li><a href="kebijakan-privasi.html">Kebijakan Privasi</a></li>' +
          '</ul></div>' +
          '<div class="gf-ft-col"><h4>Layanan Kami</h4><ul>' +
            '<li><a href="index.html#gamesSection">Top Up Game</a></li>' +
            '<li><a href="check-order.html">Cek Pesanan</a></li>' +
            '<li><a href="index.html#caraTopup">Cara Top Up</a></li>' +
            '<li><a href="syarat-ketentuan.html#refund">Kebijakan Refund</a></li>' +
          '</ul></div>' +
          '<div class="gf-ft-col gf-ft-support">' +
            '<div><h4>Dukungan</h4><span>Ada kendala? Chat tim kami kapan saja.</span></div>' +
            '<a class="gf-ft-wa" href="' + waLink + '" target="_blank" rel="noopener">' + WA_ICON + 'WhatsApp</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="gf-ft-bottom">© ' + new Date().getFullYear() + ' ' + c.name + '. Hak cipta dilindungi.</div>';
  }

  function mount() {
    if (!document.getElementById('gfFooterCss')) {
      var st = document.createElement('style');
      st.id = 'gfFooterCss';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var f = document.getElementById('siteFooter');
    if (!f) {
      f = document.createElement('footer');
      f.id = 'siteFooter';
      document.body.appendChild(f);
    }
    f.className = 'gf-ft';
    f.innerHTML = build();
  }

  function start() {
    mount();
    try {
      fetch('site-config.json', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : {}; })
        .then(function (j) { remote = j || {}; mount(); })
        .catch(function () {});
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
