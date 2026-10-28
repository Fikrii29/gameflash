/* =====================================================
   Gameflash - Footer bersama (dipakai di semua halaman)
   ===================================================== */
(function () {
  function getSettings() {
    try { return (typeof GF !== 'undefined' && GF.get(GF.KEYS.SETTINGS)) || {}; } catch (e) { return {}; }
  }
  var DEFAULTS = {
    storeName: 'Gameflash',
    whatsapp: '6281234567890',
    email: 'cs@gameflash.id',
    instagram: 'gameflash_id',
    telegram: 'gameflash_id'
  };
  var remote = {};   // dari site-config.json (publik, bisa dilihat semua pengunjung)

  function pick(a, b) { return (a && String(a).trim()) ? String(a).trim() : b; }
  function cfg() {
    var s = getSettings();   // dari dashboard admin (localStorage, browser admin)
    return {
      name:  pick(s.storeName, pick(remote.storeName, DEFAULTS.storeName)),
      wa:    String(pick(s.footerWhatsapp, pick(remote.footerWhatsapp, pick(s.whatsapp, pick(remote.whatsapp, DEFAULTS.whatsapp))))).replace(/\D/g, ''),
      email: pick(s.footerEmail, pick(remote.footerEmail, DEFAULTS.email)),
      ig:    pick(s.footerInstagram, pick(remote.footerInstagram, DEFAULTS.instagram)),
      tg:    pick(s.footerTelegram, pick(remote.footerTelegram, DEFAULTS.telegram))
    };
  }
  function link(v, base) {
    v = String(v).replace(/^@/, '');
    return /^https?:\/\//i.test(v) ? v : base + v;
  }

  var icons = {
    wa: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5.2.6.8 2 .9 2.1.1.2.1.3 0 .5-.1.2-.2.3-.3.5l-.4.5c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 5h18a1 1 0 0 1 1 1v.5l-10 6.5L2 6.5V6a1 1 0 0 1 1-1zm-1 4l10 6.5L22 9v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M21.5 3.5L2.8 10.7c-.8.3-.8 1.4 0 1.7l4.6 1.6 1.8 5.6c.2.6.9.8 1.4.4l2.6-2.2 4.6 3.4c.5.4 1.2.1 1.4-.5l3.2-15.4c.2-.8-.6-1.5-1.4-1.2zM9.5 14.2l8.3-5.2-6.6 6.4-.3 3-1.4-4.2z"/></svg>'
  };

  function build() {
  var c = cfg();
  var wa = c.wa, name = c.name, email = c.email;
  var ig = link(c.ig, 'https://instagram.com/'), tg = link(c.tg, 'https://t.me/');
  return '<div class="sf-inner">' +
      '<div class="sf-brand">' +
        '<a href="index.html" class="sf-logo">⚡ ' + name + '</a>' +
        '<p>No #1 platform top up game terlaris, murah, aman, legal 100% dan buka 24 jam dengan saluran pembayaran terlengkap Indonesia.</p>' +
        '<div class="sf-social">' +
          '<a href="https://wa.me/' + wa + '" target="_blank" rel="noopener" aria-label="WhatsApp" style="background:#25d366">' + icons.wa + '</a>' +
          '<a href="mailto:' + email + '" aria-label="Email" style="background:#ea4335">' + icons.mail + '</a>' +
          '<a href="' + ig + '" target="_blank" rel="noopener" aria-label="Instagram" style="background:linear-gradient(45deg,#f9a825,#e1306c,#833ab4)">' + icons.ig + '</a>' +
          '<a href="' + tg + '" target="_blank" rel="noopener" aria-label="Telegram" style="background:#229ed9">' + icons.tg + '</a>' +
        '</div>' +
      '</div>' +
      '<div class="sf-cols">' +
        '<div class="sf-col"><h4>Peta Situs</h4><ul>' +
          '<li><a href="index.html">Beranda</a></li>' +
          '<li><a href="tentang-kami.html">Tentang Kami</a></li>' +
          '<li><a href="syarat-ketentuan.html">Syarat &amp; Ketentuan</a></li>' +
          '<li><a href="kebijakan-privasi.html">Kebijakan Privasi</a></li>' +
        '</ul></div>' +
        '<div class="sf-col"><h4>Layanan Kami</h4><ul>' +
          '<li><a href="index.html#gamesSection">Top Up Game</a></li>' +
          '<li><a href="check-order.html">Cek Pesanan</a></li>' +
          '<li><a href="index.html#caraTopup">Cara Top Up</a></li>' +
          '<li><a href="syarat-ketentuan.html#refund">Kebijakan Refund</a></li>' +
        '</ul></div>' +
        '<div class="sf-col"><h4>Dukungan</h4><ul>' +
          '<li><a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">WhatsApp</a></li>' +
          '<li><a href="mailto:' + email + '">Email</a></li>' +
          '<li><a href="' + tg + '" target="_blank" rel="noopener">Telegram</a></li>' +
          '<li><a href="tentang-kami.html#kontak">Hubungi Kami</a></li>' +
        '</ul></div>' +
      '</div>' +
    '</div>' +
    '<div class="sf-bottom">© ' + new Date().getFullYear() + ' ' + name + '. Hak cipta dilindungi. | Platform Top Up Game Terpercaya</div>';
  }

  function mount() {
    var f = document.getElementById('siteFooter');
    if (!f) {
      f = document.createElement('footer');
      f.id = 'siteFooter';
      document.body.appendChild(f);
    }
    f.className = 'site-footer';
    f.innerHTML = build();
  }

  function start() {
    mount();
    // muat site-config.json (opsional) lalu render ulang bila ada
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
