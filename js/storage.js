// =====================================================
// GAMEFLASH - Storage Manager & Default Data
// =====================================================

const GF = {
  KEYS: {
    GAMES: 'gf_games',
    TRANSACTIONS: 'gf_transactions',
    VOUCHERS: 'gf_vouchers',
    PROMOS: 'gf_promos',
    SETTINGS: 'gf_settings',
    ADMIN_PASS: 'gf_admin_pass',
    USERS: 'gf_users',
    DEPOSITS: 'gf_deposits',
    CURRENT_USER: 'gf_current_user',
  },

  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

// =====================================================
// DEFAULT GAMES DATA
// =====================================================
const DEFAULT_GAMES = [
  {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    category: 'MOBA',
    icon: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/2694.svg',
    emoji: '⚔️',
    image: 'img/ml.png',
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    description: 'Top Up Diamond Mobile Legends Bang Bang',
    inputFields: [
      { name: 'userId', label: 'User ID', placeholder: 'Contoh: 123456789', type: 'text' },
      { name: 'zoneId', label: 'Zone ID', placeholder: 'Contoh: 1234', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'ml_1', name: '11 Diamond', currency: 'Diamond', amount: 11, price: 3000, sku: 'MLBB11', active: true },
      { id: 'ml_2', name: '22 Diamond', currency: 'Diamond', amount: 22, price: 6000, sku: 'MLBB22', active: true },
      { id: 'ml_3', name: '56 Diamond', currency: 'Diamond', amount: 56, price: 14000, sku: 'MLBB56', active: true, flashSalePrice: 9900, flashSaleStock: 30, flashSaleMaxStock: 50, flashSaleEnd: new Date(Date.now() + 7 * 86400000).toISOString() },
      { id: 'ml_4', name: '112 Diamond', currency: 'Diamond', amount: 112, price: 27000, sku: 'MLBB112', active: true, flashSalePrice: 19900, flashSaleStock: 20, flashSaleMaxStock: 40, flashSaleEnd: new Date(Date.now() + 7 * 86400000).toISOString() },
      { id: 'ml_5', name: '168 Diamond', currency: 'Diamond', amount: 168, price: 40000, sku: 'MLBB168', active: true },
      { id: 'ml_6', name: '250 Diamond', currency: 'Diamond', amount: 250, price: 59000, sku: 'MLBB250', active: true },
      { id: 'ml_7', name: '336 Diamond', currency: 'Diamond', amount: 336, price: 79000, sku: 'MLBB336', active: true },
      { id: 'ml_8', name: '570 Diamond', currency: 'Diamond', amount: 570, price: 134000, sku: 'MLBB570', active: true },
      { id: 'ml_9', name: '875 Diamond', currency: 'Diamond', amount: 875, price: 199000, sku: 'MLBB875', active: true },
      { id: 'ml_10', name: '1788 Diamond', currency: 'Diamond', amount: 1788, price: 399000, sku: 'MLBB1788', active: true },
    ]
  },
  {
    id: 'free-fire',
    name: 'Free Fire',
    category: 'Battle Royale',
    emoji: '🔥',
    image: 'img/ff.png',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #dc2626)',
    description: 'Top Up Diamond Free Fire & Free Fire MAX',
    inputFields: [
      { name: 'userId', label: 'Player ID', placeholder: 'Masukkan Player ID Free Fire', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'ff_1', name: '5 Diamond', currency: 'Diamond', amount: 5, price: 1500, sku: 'FF5', active: true },
      { id: 'ff_2', name: '12 Diamond', currency: 'Diamond', amount: 12, price: 3500, sku: 'FF12', active: true },
      { id: 'ff_3', name: '50 Diamond', currency: 'Diamond', amount: 50, price: 14000, sku: 'FF50', active: true },
      { id: 'ff_4', name: '100 Diamond', currency: 'Diamond', amount: 100, price: 27000, sku: 'FF100', active: true, flashSalePrice: 21000, flashSaleStock: 15, flashSaleMaxStock: 30, flashSaleEnd: new Date(Date.now() + 7 * 86400000).toISOString() },
      { id: 'ff_5', name: '210 Diamond', currency: 'Diamond', amount: 210, price: 54000, sku: 'FF210', active: true },
      { id: 'ff_6', name: '520 Diamond', currency: 'Diamond', amount: 520, price: 130000, sku: 'FF520', active: true },
      { id: 'ff_7', name: '1080 Diamond', currency: 'Diamond', amount: 1080, price: 259000, sku: 'FF1080', active: true },
      { id: 'ff_8', name: '2200 Diamond', currency: 'Diamond', amount: 2200, price: 519000, sku: 'FF2200', active: true },
    ]
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    category: 'Battle Royale',
    emoji: '🪖',
    image: 'img/pubg.png',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
    description: 'Top Up UC PUBG Mobile',
    inputFields: [
      { name: 'userId', label: 'Player ID', placeholder: 'Masukkan Player ID PUBG', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'pubg_1', name: '60 UC', currency: 'UC', amount: 60, price: 16000, sku: 'PUBG60', active: true },
      { id: 'pubg_2', name: '180 UC', currency: 'UC', amount: 180, price: 47000, sku: 'PUBG180', active: true },
      { id: 'pubg_3', name: '300 UC', currency: 'UC', amount: 300, price: 77000, sku: 'PUBG300', active: true },
      { id: 'pubg_4', name: '600 UC', currency: 'UC', amount: 600, price: 153000, sku: 'PUBG600', active: true },
      { id: 'pubg_5', name: '1500 UC', currency: 'UC', amount: 1500, price: 382000, sku: 'PUBG1500', active: true },
      { id: 'pubg_6', name: '3000 UC', currency: 'UC', amount: 3000, price: 764000, sku: 'PUBG3000', active: true },
    ]
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    category: 'RPG',
    emoji: '🌟',
    image: 'img/genshin.png',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    description: 'Top Up Genesis Crystals Genshin Impact',
    inputFields: [
      { name: 'userId', label: 'UID', placeholder: 'Masukkan UID Genshin Impact', type: 'text' },
      { name: 'server', label: 'Server', placeholder: 'Asia / America / Europe / TW-HK-MO', type: 'select', options: ['Asia', 'America', 'Europe', 'TW, HK, MO'] }
    ],
    active: true,
    packages: [
      { id: 'gi_1', name: '60 Genesis Crystals', currency: 'Genesis Crystals', amount: 60, price: 14000, sku: 'GI60', active: true },
      { id: 'gi_2', name: '300+30 Genesis Crystals', currency: 'Genesis Crystals', amount: 330, price: 68000, sku: 'GI330', active: true },
      { id: 'gi_3', name: '980+110 Genesis Crystals', currency: 'Genesis Crystals', amount: 1090, price: 219000, sku: 'GI1090', active: true },
      { id: 'gi_4', name: '1980+260 Genesis Crystals', currency: 'Genesis Crystals', amount: 2240, price: 439000, sku: 'GI2240', active: true },
      { id: 'gi_5', name: '3280+600 Genesis Crystals', currency: 'Genesis Crystals', amount: 3880, price: 719000, sku: 'GI3880', active: true },
      { id: 'gi_6', name: '6480+1600 Genesis Crystals', currency: 'Genesis Crystals', amount: 8080, price: 1439000, sku: 'GI8080', active: true },
    ]
  },
  {
    id: 'honkai-star-rail',
    name: 'Honkai Star Rail',
    category: 'RPG',
    emoji: '🚂',
    image: 'img/hsr.png',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    description: 'Top Up Oneiric Shard Honkai Star Rail',
    inputFields: [
      { name: 'userId', label: 'UID', placeholder: 'Masukkan UID Honkai Star Rail', type: 'text' },
      { name: 'server', label: 'Server', placeholder: 'Asia / America / Europe', type: 'select', options: ['Asia', 'America', 'Europe'] }
    ],
    active: true,
    packages: [
      { id: 'hsr_1', name: '60 Oneiric Shard', currency: 'Oneiric Shard', amount: 60, price: 14000, sku: 'HSR60', active: true },
      { id: 'hsr_2', name: '300+30 Oneiric Shard', currency: 'Oneiric Shard', amount: 330, price: 68000, sku: 'HSR330', active: true },
      { id: 'hsr_3', name: '980+110 Oneiric Shard', currency: 'Oneiric Shard', amount: 1090, price: 219000, sku: 'HSR1090', active: true },
      { id: 'hsr_4', name: '1980+260 Oneiric Shard', currency: 'Oneiric Shard', amount: 2240, price: 439000, sku: 'HSR2240', active: true },
    ]
  },
  {
    id: 'valorant',
    name: 'Valorant',
    category: 'FPS',
    emoji: '🎯',
    image: 'img/valorant.png',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #be123c)',
    description: 'Top Up Valorant Points (VP)',
    inputFields: [
      { name: 'userId', label: 'Riot ID', placeholder: 'Contoh: Username#TAG', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'valo_1', name: '475 VP', currency: 'VP', amount: 475, price: 49000, sku: 'VP475', active: true },
      { id: 'valo_2', name: '1000 VP', currency: 'VP', amount: 1000, price: 99000, sku: 'VP1000', active: true },
      { id: 'valo_3', name: '2050 VP', currency: 'VP', amount: 2050, price: 199000, sku: 'VP2050', active: true },
      { id: 'valo_4', name: '3650 VP', currency: 'VP', amount: 3650, price: 349000, sku: 'VP3650', active: true },
      { id: 'valo_5', name: '5350 VP', currency: 'VP', amount: 5350, price: 499000, sku: 'VP5350', active: true },
    ]
  },
  {
    id: 'codm',
    name: 'Call of Duty Mobile',
    category: 'FPS',
    emoji: '🔫',
    image: 'img/codm.png',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
    description: 'Top Up CP Call of Duty Mobile',
    inputFields: [
      { name: 'userId', label: 'Player ID', placeholder: 'Masukkan Player ID COD Mobile', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'codm_1', name: '80 CP', currency: 'CP', amount: 80, price: 15000, sku: 'CODM80', active: true },
      { id: 'codm_2', name: '400 CP', currency: 'CP', amount: 400, price: 69000, sku: 'CODM400', active: true },
      { id: 'codm_3', name: '800 CP', currency: 'CP', amount: 800, price: 139000, sku: 'CODM800', active: true },
      { id: 'codm_4', name: '2000 CP', currency: 'CP', amount: 2000, price: 349000, sku: 'CODM2000', active: true },
    ]
  },
  {
    id: 'roblox',
    name: 'Roblox',
    category: 'Metaverse',
    emoji: '🧱',
    image: 'img/roblox.png',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #991b1b)',
    description: 'Top Up Robux Roblox',
    inputFields: [
      { name: 'userId', label: 'Username / User ID', placeholder: 'Masukkan Username Roblox', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'rbx_1', name: '80 Robux', currency: 'Robux', amount: 80, price: 14000, sku: 'RBX80', active: true },
      { id: 'rbx_2', name: '400 Robux', currency: 'Robux', amount: 400, price: 67000, sku: 'RBX400', active: true },
      { id: 'rbx_3', name: '800 Robux', currency: 'Robux', amount: 800, price: 134000, sku: 'RBX800', active: true },
      { id: 'rbx_4', name: '1700 Robux', currency: 'Robux', amount: 1700, price: 268000, sku: 'RBX1700', active: true },
      { id: 'rbx_5', name: '4500 Robux', currency: 'Robux', amount: 4500, price: 674000, sku: 'RBX4500', active: true },
    ]
  },
  {
    id: 'coc',
    name: 'Clash of Clans',
    category: 'Strategy',
    emoji: '🏰',
    image: 'img/coc.png',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'Top Up Gems Clash of Clans',
    inputFields: [
      { name: 'userId', label: 'Player Tag', placeholder: 'Contoh: #ABCD1234', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'coc_1', name: '80 Gems', currency: 'Gems', amount: 80, price: 15000, sku: 'COC80', active: true },
      { id: 'coc_2', name: '500 Gems', currency: 'Gems', amount: 500, price: 79000, sku: 'COC500', active: true },
      { id: 'coc_3', name: '1200 Gems', currency: 'Gems', amount: 1200, price: 189000, sku: 'COC1200', active: true },
      { id: 'coc_4', name: '2500 Gems', currency: 'Gems', amount: 2500, price: 379000, sku: 'COC2500', active: true },
    ]
  },
  {
    id: 'cr',
    name: 'Clash Royale',
    category: 'Strategy',
    emoji: '👑',
    image: 'img/cr.png',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    description: 'Top Up Gems Clash Royale',
    inputFields: [
      { name: 'userId', label: 'Player Tag', placeholder: 'Contoh: #ABCD1234', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'cr_1', name: '80 Gems', currency: 'Gems', amount: 80, price: 13000, sku: 'CR80', active: true },
      { id: 'cr_2', name: '500 Gems', currency: 'Gems', amount: 500, price: 74000, sku: 'CR500', active: true },
      { id: 'cr_3', name: '1200 Gems', currency: 'Gems', amount: 1200, price: 174000, sku: 'CR1200', active: true },
    ]
  },
  {
    id: 'lol',
    name: 'League of Legends',
    category: 'MOBA',
    emoji: '🛡️',
    image: 'img/lol.png',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    description: 'Top Up Riot Points (RP) League of Legends',
    inputFields: [
      { name: 'userId', label: 'Summoner Name', placeholder: 'Masukkan Summoner Name', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'lol_1', name: '575 RP', currency: 'RP', amount: 575, price: 49000, sku: 'LOL575', active: true },
      { id: 'lol_2', name: '1380 RP', currency: 'RP', amount: 1380, price: 109000, sku: 'LOL1380', active: true },
      { id: 'lol_3', name: '2800 RP', currency: 'RP', amount: 2800, price: 219000, sku: 'LOL2800', active: true },
      { id: 'lol_4', name: '5000 RP', currency: 'RP', amount: 5000, price: 389000, sku: 'LOL5000', active: true },
    ]
  },
  {
    id: 'wuwa',
    name: 'Wuthering Waves',
    category: 'RPG',
    emoji: '🌊',
    image: 'img/wuwa.png',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    description: 'Top Up Lunite Wuthering Waves',
    inputFields: [
      { name: 'userId', label: 'UID', placeholder: 'Masukkan UID Wuthering Waves', type: 'text' },
      { name: 'server', label: 'Server', placeholder: 'Pilih Server', type: 'select', options: ['Asia', 'America', 'Europe'] }
    ],
    active: true,
    packages: [
      { id: 'ww_1', name: '60 Lunite', currency: 'Lunite', amount: 60, price: 14000, sku: 'WW60', active: true },
      { id: 'ww_2', name: '330 Lunite', currency: 'Lunite', amount: 330, price: 68000, sku: 'WW330', active: true },
      { id: 'ww_3', name: '1090 Lunite', currency: 'Lunite', amount: 1090, price: 219000, sku: 'WW1090', active: true },
      { id: 'ww_4', name: '3280 Lunite', currency: 'Lunite', amount: 3280, price: 649000, sku: 'WW3280', active: true },
    ]
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    category: 'Battle Royale',
    emoji: '⛏️',
    image: 'img/fortnite.png',
    color: '#1d9bf0',
    gradient: 'linear-gradient(135deg, #1d9bf0, #1570b8)',
    description: 'Top Up V-Bucks Fortnite',
    inputFields: [
      { name: 'userId', label: 'Epic Games ID', placeholder: 'Masukkan Epic Games ID', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'fn_1', name: '1.000 V-Bucks', currency: 'V-Bucks', amount: 1000, price: 130000, sku: 'FN1000', active: true },
      { id: 'fn_2', name: '2.800 V-Bucks', currency: 'V-Bucks', amount: 2800, price: 325000, sku: 'FN2800', active: true },
      { id: 'fn_3', name: '5.000 V-Bucks', currency: 'V-Bucks', amount: 5000, price: 579000, sku: 'FN5000', active: true },
      { id: 'fn_4', name: '13.500 V-Bucks', currency: 'V-Bucks', amount: 13500, price: 1429000, sku: 'FN13500', active: true },
    ]
  },
  {
    id: 'brawlstars',
    name: 'Brawl Stars',
    category: 'Strategy',
    emoji: '🌟',
    image: 'img/brawlstars.png',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    description: 'Top Up Gems Brawl Stars',
    inputFields: [
      { name: 'userId', label: 'Player Tag', placeholder: 'Contoh: #ABCD1234', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'bs_1', name: '30 Gems', currency: 'Gems', amount: 30, price: 14000, sku: 'BS30', active: true },
      { id: 'bs_2', name: '80 Gems', currency: 'Gems', amount: 80, price: 37000, sku: 'BS80', active: true },
      { id: 'bs_3', name: '170 Gems', currency: 'Gems', amount: 170, price: 74000, sku: 'BS170', active: true },
      { id: 'bs_4', name: '360 Gems', currency: 'Gems', amount: 360, price: 148000, sku: 'BS360', active: true },
      { id: 'bs_5', name: '950 Gems', currency: 'Gems', amount: 950, price: 370000, sku: 'BS950', active: true },
      { id: 'bs_6', name: '2000 Gems', currency: 'Gems', amount: 2000, price: 740000, sku: 'BS2000', active: true },
    ]
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    category: 'Sandbox',
    emoji: '⛏️',
    image: 'img/minecraft.png',
    color: '#84cc16',
    gradient: 'linear-gradient(135deg, #84cc16, #4d7c0f)',
    description: 'Top Up Minecoins Minecraft',
    inputFields: [
      { name: 'userId', label: 'Xbox Gamertag / Microsoft Account', placeholder: 'Masukkan Gamertag atau Email', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'mc_1', name: '320 Minecoins', currency: 'Minecoins', amount: 320, price: 39000, sku: 'MC320', active: true },
      { id: 'mc_2', name: '660 Minecoins', currency: 'Minecoins', amount: 660, price: 79000, sku: 'MC660', active: true },
      { id: 'mc_3', name: '1720 Minecoins', currency: 'Minecoins', amount: 1720, price: 189000, sku: 'MC1720', active: true },
      { id: 'mc_4', name: '3500 Minecoins', currency: 'Minecoins', amount: 3500, price: 379000, sku: 'MC3500', active: true },
    ]
  },
  {
    id: 'honor-of-kings',
    name: 'Honor of Kings',
    category: 'MOBA',
    emoji: '👑',
    image: 'img/hok.png',
    color: '#d97706',
    gradient: 'linear-gradient(135deg, #d97706, #92400e)',
    description: 'Top Up Token Honor of Kings',
    inputFields: [
      { name: 'userId', label: 'Player ID', placeholder: 'Masukkan Player ID HoK', type: 'text' },
      { name: 'server', label: 'Server', placeholder: 'Pilih Server', type: 'select', options: ['Asia', 'SEA'] }
    ],
    active: true,
    packages: [
      { id: 'hok_1', name: '60 Token', currency: 'Token', amount: 60, price: 15000, sku: 'HOK60', active: true },
      { id: 'hok_2', name: '300 Token', currency: 'Token', amount: 300, price: 75000, sku: 'HOK300', active: true },
      { id: 'hok_3', name: '980 Token', currency: 'Token', amount: 980, price: 245000, sku: 'HOK980', active: true },
      { id: 'hok_4', name: '1980 Token', currency: 'Token', amount: 1980, price: 495000, sku: 'HOK1980', active: true },
      { id: 'hok_5', name: '3280 Token', currency: 'Token', amount: 3280, price: 820000, sku: 'HOK3280', active: true },
    ]
  },
  {
    id: 'zenless-zone-zero',
    name: 'Zenless Zone Zero',
    category: 'RPG',
    emoji: '⚡',
    image: 'img/zzz.png',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #c2410c)',
    description: 'Top Up Monochrome Zenless Zone Zero',
    inputFields: [
      { name: 'userId', label: 'UID', placeholder: 'Masukkan UID ZZZ', type: 'text' },
      { name: 'server', label: 'Server', placeholder: 'Pilih Server', type: 'select', options: ['Asia', 'America', 'Europe', 'TW, HK, MO'] }
    ],
    active: true,
    packages: [
      { id: 'zzz_1', name: '60 Monochrome', currency: 'Monochrome', amount: 60, price: 14000, sku: 'ZZZ60', active: true },
      { id: 'zzz_2', name: '300+30 Monochrome', currency: 'Monochrome', amount: 330, price: 68000, sku: 'ZZZ330', active: true },
      { id: 'zzz_3', name: '980+110 Monochrome', currency: 'Monochrome', amount: 1090, price: 219000, sku: 'ZZZ1090', active: true },
      { id: 'zzz_4', name: '1980+260 Monochrome', currency: 'Monochrome', amount: 2240, price: 439000, sku: 'ZZZ2240', active: true },
      { id: 'zzz_5', name: '3280+600 Monochrome', currency: 'Monochrome', amount: 3880, price: 719000, sku: 'ZZZ3880', active: true },
      { id: 'zzz_6', name: '6480+1600 Monochrome', currency: 'Monochrome', amount: 8080, price: 1439000, sku: 'ZZZ8080', active: true },
    ]
  },
  {
    id: 'arena-of-valor',
    name: 'Arena of Valor',
    category: 'MOBA',
    emoji: '⚔️',
    image: 'img/aov.png',
    color: '#b45309',
    gradient: 'linear-gradient(135deg, #b45309, #78350f)',
    description: 'Top Up Voucher Arena of Valor',
    inputFields: [
      { name: 'userId', label: 'Player ID', placeholder: 'Masukkan Player ID AoV', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'aov_1', name: '50 Voucher', currency: 'Voucher', amount: 50, price: 7000, sku: 'AOV50', active: true },
      { id: 'aov_2', name: '100 Voucher', currency: 'Voucher', amount: 100, price: 14000, sku: 'AOV100', active: true },
      { id: 'aov_3', name: '500 Voucher', currency: 'Voucher', amount: 500, price: 68000, sku: 'AOV500', active: true },
      { id: 'aov_4', name: '1000 Voucher', currency: 'Voucher', amount: 1000, price: 134000, sku: 'AOV1000', active: true },
      { id: 'aov_5', name: '2000 Voucher', currency: 'Voucher', amount: 2000, price: 264000, sku: 'AOV2000', active: true },
    ]
  },
  {
    id: 'pokemon-go',
    name: 'Pokémon GO',
    category: 'AR Game',
    emoji: '⚡',
    image: 'img/pokemongo.png',
    color: '#facc15',
    gradient: 'linear-gradient(135deg, #facc15, #ca8a04)',
    description: 'Top Up PokéCoins Pokémon GO',
    inputFields: [
      { name: 'userId', label: 'Trainer Code', placeholder: 'Masukkan Trainer Code', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'pg_1', name: '100 PokéCoins', currency: 'PokéCoins', amount: 100, price: 14000, sku: 'PG100', active: true },
      { id: 'pg_2', name: '550 PokéCoins', currency: 'PokéCoins', amount: 550, price: 75000, sku: 'PG550', active: true },
      { id: 'pg_3', name: '1200 PokéCoins', currency: 'PokéCoins', amount: 1200, price: 149000, sku: 'PG1200', active: true },
      { id: 'pg_4', name: '2500 PokéCoins', currency: 'PokéCoins', amount: 2500, price: 299000, sku: 'PG2500', active: true },
      { id: 'pg_5', name: '5200 PokéCoins', currency: 'PokéCoins', amount: 5200, price: 599000, sku: 'PG5200', active: true },
      { id: 'pg_6', name: '14500 PokéCoins', currency: 'PokéCoins', amount: 14500, price: 1499000, sku: 'PG14500', active: true },
    ]
  },
  {
    id: 'steam-wallet',
    name: 'Steam Wallet',
    category: 'Platform',
    emoji: '🎮',
    image: 'img/steam.png',
    color: '#1b2838',
    gradient: 'linear-gradient(135deg, #1b2838, #2a475e)',
    description: 'Top Up Steam Wallet Code (IDR)',
    inputFields: [
      { name: 'userId', label: 'Email Steam / Steam ID', placeholder: 'Masukkan Email atau Steam ID', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'sw_1', name: 'Steam Wallet Rp20.000', currency: 'IDR', amount: 20000, price: 23000, sku: 'SW20K', active: true },
      { id: 'sw_2', name: 'Steam Wallet Rp50.000', currency: 'IDR', amount: 50000, price: 54000, sku: 'SW50K', active: true },
      { id: 'sw_3', name: 'Steam Wallet Rp100.000', currency: 'IDR', amount: 100000, price: 107000, sku: 'SW100K', active: true },
      { id: 'sw_4', name: 'Steam Wallet Rp200.000', currency: 'IDR', amount: 200000, price: 210000, sku: 'SW200K', active: true },
      { id: 'sw_5', name: 'Steam Wallet Rp500.000', currency: 'IDR', amount: 500000, price: 519000, sku: 'SW500K', active: true },
    ]
  },
  {
    id: 'google-play',
    name: 'Google Play',
    category: 'Platform',
    emoji: '▶️',
    image: 'img/googleplay.png',
    color: '#34a853',
    gradient: 'linear-gradient(135deg, #34a853, #1a7431)',
    description: 'Top Up Google Play Gift Card (IDR)',
    inputFields: [
      { name: 'userId', label: 'Email Google', placeholder: 'Masukkan Email Google Play', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'gp_1', name: 'Google Play Rp20.000', currency: 'IDR', amount: 20000, price: 22000, sku: 'GP20K', active: true },
      { id: 'gp_2', name: 'Google Play Rp50.000', currency: 'IDR', amount: 50000, price: 53000, sku: 'GP50K', active: true },
      { id: 'gp_3', name: 'Google Play Rp100.000', currency: 'IDR', amount: 100000, price: 105000, sku: 'GP100K', active: true },
      { id: 'gp_4', name: 'Google Play Rp200.000', currency: 'IDR', amount: 200000, price: 208000, sku: 'GP200K', active: true },
      { id: 'gp_5', name: 'Google Play Rp500.000', currency: 'IDR', amount: 500000, price: 515000, sku: 'GP500K', active: true },
    ]
  },
  {
    id: 'point-blank',
    name: 'Point Blank',
    category: 'FPS',
    emoji: '🔫',
    image: 'img/pointblank.png',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #334155)',
    description: 'Top Up ZEN Point Blank',
    inputFields: [
      { name: 'userId', label: 'Username Point Blank', placeholder: 'Masukkan Username PB', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'pb_1', name: '50 ZEN', currency: 'ZEN', amount: 50, price: 7500, sku: 'PB50', active: true },
      { id: 'pb_2', name: '100 ZEN', currency: 'ZEN', amount: 100, price: 15000, sku: 'PB100', active: true },
      { id: 'pb_3', name: '250 ZEN', currency: 'ZEN', amount: 250, price: 37000, sku: 'PB250', active: true },
      { id: 'pb_4', name: '500 ZEN', currency: 'ZEN', amount: 500, price: 74000, sku: 'PB500', active: true },
      { id: 'pb_5', name: '1000 ZEN', currency: 'ZEN', amount: 1000, price: 147000, sku: 'PB1000', active: true },
      { id: 'pb_6', name: '2000 ZEN', currency: 'ZEN', amount: 2000, price: 293000, sku: 'PB2000', active: true },
    ]
  },
  {
    id: 'ragnarok-m',
    name: 'Ragnarok M',
    category: 'MMORPG',
    emoji: '🗡️',
    image: 'img/ragnarokm.png',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    description: 'Top Up Big Cat Coin (BCC) Ragnarok M',
    inputFields: [
      { name: 'userId', label: 'Account ID / Email', placeholder: 'Masukkan Account ID atau Email', type: 'text' },
      { name: 'server', label: 'Server', placeholder: 'Pilih Server', type: 'select', options: ['SEA', 'Global'] }
    ],
    active: true,
    packages: [
      { id: 'rom_1', name: '30 BCC', currency: 'BCC', amount: 30, price: 45000, sku: 'ROM30', active: true },
      { id: 'rom_2', name: '60 BCC', currency: 'BCC', amount: 60, price: 89000, sku: 'ROM60', active: true },
      { id: 'rom_3', name: '188 BCC', currency: 'BCC', amount: 188, price: 278000, sku: 'ROM188', active: true },
      { id: 'rom_4', name: '300 BCC', currency: 'BCC', amount: 300, price: 443000, sku: 'ROM300', active: true },
      { id: 'rom_5', name: '600 BCC', currency: 'BCC', amount: 600, price: 885000, sku: 'ROM600', active: true },
    ]
  },
  {
    id: 'apex-legends',
    name: 'Apex Legends',
    category: 'Battle Royale',
    emoji: '🎯',
    image: 'img/apex.png',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #991b1b)',
    description: 'Top Up Apex Coins Apex Legends',
    inputFields: [
      { name: 'userId', label: 'EA Account / Origin ID', placeholder: 'Masukkan EA Account atau Origin ID', type: 'text' }
    ],
    active: true,
    packages: [
      { id: 'apex_1', name: '1.000 Apex Coins', currency: 'Apex Coins', amount: 1000, price: 149000, sku: 'APEX1000', active: true },
      { id: 'apex_2', name: '2.150 Apex Coins', currency: 'Apex Coins', amount: 2150, price: 299000, sku: 'APEX2150', active: true },
      { id: 'apex_3', name: '4.350 Apex Coins', currency: 'Apex Coins', amount: 4350, price: 569000, sku: 'APEX4350', active: true },
      { id: 'apex_4', name: '6.700 Apex Coins', currency: 'Apex Coins', amount: 6700, price: 869000, sku: 'APEX6700', active: true },
      { id: 'apex_5', name: '11.500 Apex Coins', currency: 'Apex Coins', amount: 11500, price: 1399000, sku: 'APEX11500', active: true },
    ]
  }
];

// =====================================================
// DEFAULT VOUCHERS
// =====================================================
const DEFAULT_VOUCHERS = [
  {
    id: 'v_1',
    code: 'GAMEFLASH10',
    type: 'percent',
    value: 10,
    minPurchase: 10000,
    maxDiscount: 50000,
    usageLimit: 100,
    usedCount: 12,
    expiry: '2025-12-31',
    active: true,
    description: 'Diskon 10% untuk semua transaksi'
  },
  {
    id: 'v_2',
    code: 'NEWUSER',
    type: 'fixed',
    value: 5000,
    minPurchase: 20000,
    maxDiscount: 5000,
    usageLimit: 50,
    usedCount: 3,
    expiry: '2025-12-31',
    active: true,
    description: 'Diskon Rp5.000 untuk pengguna baru'
  }
];

// =====================================================
// DEFAULT PROMOS (Banner Flash Sale)
// =====================================================
const DEFAULT_PROMOS = [
  {
    id: 'promo_1',
    title: '⚡ FLASH SALE',
    subtitle: 'Diskon hingga 50% untuk semua top up! Hanya hari ini.',
    image: 'img/promo_flash_sale.png',
    linkType: 'voucher',
    linkValue: 'GAMEFLASH10',
    badge: '50% OFF',
    badgeColor: '#ef4444',
    startDate: '2025-01-01T00:00',
    endDate: '2026-12-31T23:59',
    active: true,
    order: 1
  },
  {
    id: 'promo_2',
    title: '🎮 WEEKEND SPECIAL',
    subtitle: 'Top up Mobile Legends & Free Fire harga spesial setiap weekend!',
    image: 'img/promo_weekend.png',
    linkType: 'game',
    linkValue: 'ml',
    badge: 'WEEKEND',
    badgeColor: '#8b5cf6',
    startDate: '2025-01-01T00:00',
    endDate: '2026-12-31T23:59',
    active: true,
    order: 2
  },
  {
    id: 'promo_3',
    title: '🎁 BONUS NEW USER',
    subtitle: 'Pengguna baru dapat voucher Rp5.000 untuk top up pertama!',
    image: 'img/promo_newuser.png',
    linkType: 'voucher',
    linkValue: 'NEWUSER',
    badge: 'NEW USER',
    badgeColor: '#10b981',
    startDate: '2025-01-01T00:00',
    endDate: '2026-12-31T23:59',
    active: true,
    order: 3
  }
];

// =====================================================
// DEFAULT SETTINGS
// =====================================================
const DEFAULT_SETTINGS = {
  storeName: 'Gameflash',
  storeTagline: 'Top Up Game Tercepat & Terpercaya',
  adminPassword: 'admin123',
  whatsapp: '6281234567890',
  // Digiflazz
  digiflazzUsername: '',
  digiflazzApiKey: '',
  digiflazzProduction: false,
  // Tokopay
  tokopayMerchantId: '',
  tokopaySecretKey: '',
  tokopayProduction: false,
  // Fonnte
  fonnteToken: '',
  fonnteActive: false,
};

// =====================================================
// INIT: Seed default data if not exists
// =====================================================
function initStorage() {
  if (!GF.get(GF.KEYS.GAMES)) {
    GF.set(GF.KEYS.GAMES, DEFAULT_GAMES);
  }
  if (!GF.get(GF.KEYS.VOUCHERS)) {
    GF.set(GF.KEYS.VOUCHERS, DEFAULT_VOUCHERS);
  }
  if (!GF.get(GF.KEYS.PROMOS)) {
    GF.set(GF.KEYS.PROMOS, DEFAULT_PROMOS);
  }
  if (!GF.get(GF.KEYS.TRANSACTIONS)) {
    // Seed some demo transactions
    const demoTx = [
      {
        id: 'GF' + Date.now() + '1',
        invoiceId: 'GF' + (Date.now() - 900000) + '1',
        gameId: 'ml', gameName: 'Mobile Legends',
        packageName: '112 Diamond', packageSku: 'MLBB112',
        userId: '123456789', zoneId: '1234',
        customerPhone: '6281234567890',
        amount: 27000, discount: 0, finalAmount: 27000,
        voucherCode: '',
        paymentMethod: 'QRIS', paymentStatus: 'paid',
        status: 'success',
        createdAt: new Date(Date.now() - 900000).toISOString(),
        updatedAt: new Date(Date.now() - 800000).toISOString(),
      },
      {
        id: 'GF' + Date.now() + '2',
        invoiceId: 'GF' + (Date.now() - 1800000) + '2',
        gameId: 'ff', gameName: 'Free Fire',
        packageName: '100 Diamond', packageSku: 'FF100',
        userId: '987654321',
        customerPhone: '6289876543210',
        amount: 27000, discount: 2700, finalAmount: 24300,
        voucherCode: 'GAMEFLASH10',
        paymentMethod: 'BCA', paymentStatus: 'paid',
        status: 'success',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1700000).toISOString(),
      },
      {
        id: 'GF' + Date.now() + '3',
        invoiceId: 'GF' + (Date.now() - 600000) + '3',
        gameId: 'pubg', gameName: 'PUBG Mobile',
        packageName: '300 UC', packageSku: 'PUBG300',
        userId: '555666777',
        customerPhone: '6285559998877',
        amount: 77000, discount: 0, finalAmount: 77000,
        voucherCode: '',
        paymentMethod: 'DANA', paymentStatus: 'pending',
        status: 'pending',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        updatedAt: new Date(Date.now() - 600000).toISOString(),
      }
    ];
    GF.set(GF.KEYS.TRANSACTIONS, demoTx);
  }
  if (!GF.get(GF.KEYS.SETTINGS)) {
    GF.set(GF.KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
}

// =====================================================
// HELPERS
// =====================================================
function generateInvoiceId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GF${ts}${rand}`;
}

function formatRupiah(amount) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getStatusBadge(status) {
  const map = {
    pending: { label: 'Menunggu Bayar', class: 'badge-warning' },
    processing: { label: 'Diproses', class: 'badge-info' },
    success: { label: 'Berhasil', class: 'badge-success' },
    failed: { label: 'Gagal', class: 'badge-danger' },
    refunded: { label: 'Refund', class: 'badge-secondary' }
  };
  return map[status] || { label: status, class: 'badge-secondary' };
}

// Run init
initStorage();

// =====================================================
// MIGRATE: Patch existing localStorage games with images
// =====================================================
function migrateGameImages() {
  const imageMap = {
    'ml': 'img/ml.png',
    'ff': 'img/ff.png',
    'pubg': 'img/pubg.png',
    'genshin': 'img/genshin.png',
    'hsr': 'img/hsr.png',
    'valorant': 'img/valorant.png',
    'codm': 'img/codm.png',
    'roblox': 'img/roblox.png',
    'coc': 'img/coc.png',
    'cr': 'img/cr.png',
    'lol': 'img/lol.png',
    'wuwa': 'img/wuwa.png',
    'fortnite': 'img/fortnite.png',
    'brawlstars': 'img/brawlstars.png',
    'minecraft': 'img/minecraft.png',
    'honor-of-kings': 'img/hok.png',
    'zenless-zone-zero': 'img/zzz.png',
    'arena-of-valor': 'img/aov.png',
    'pokemon-go': 'img/pokemongo.png',
    'steam-wallet': 'img/steam.png',
    'google-play': 'img/googleplay.png',
    'point-blank': 'img/pointblank.png',
    'ragnarok-m': 'img/ragnarokm.png',
    'apex-legends': 'img/apex.png',
  };
  const games = GF.get(GF.KEYS.GAMES) || [];
  let changed = false;
  games.forEach(g => {
    // Only patch if no image set or image is still the old default (emoji/empty)
    if (imageMap[g.id] && (!g.image || g.image === '')) {
      g.image = imageMap[g.id];
      changed = true;
    }
  });
  if (changed) GF.set(GF.KEYS.GAMES, games);
}
migrateGameImages();