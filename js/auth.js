// =====================================================
// GAMEFLASH - Auth & User System
// =====================================================

const Auth = {
  // ─── MEMBER ROLE TIERS ───────────────────────────────
  ROLES: {
    bronze: { name: 'Bronze', emoji: '🥉', min: 0, discount: 0, color: '#cd7f32', gradient: 'linear-gradient(135deg, #cd7f32, #a0522d)' },
    silver: { name: 'Silver', emoji: '🥈', min: 500000, discount: 3, color: '#c0c0c0', gradient: 'linear-gradient(135deg, #c0c0c0, #808080)' },
    gold:   { name: 'Gold',   emoji: '🥇', min: 2000000, discount: 5, color: '#ffd700', gradient: 'linear-gradient(135deg, #ffd700, #ff8c00)' },
  },

  // ─── SESSION ────────────────────────────────────────
  getUser() {
    return GF.get(GF.KEYS.CURRENT_USER);
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  logout() {
    GF.remove(GF.KEYS.CURRENT_USER);
    window.location.href = 'index.html';
  },

  // ─── OTP ────────────────────────────────────────────
  generateOTP() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  async sendOTP(phone) {
    const otp = this.generateOTP();
    // Store OTP temporarily
    sessionStorage.setItem('gf_otp', JSON.stringify({
      phone, otp, expires: Date.now() + 300000 // 5 minutes
    }));

    // Send via Fonnte
    const msg = `🔐 *GAMEFLASH* - Kode OTP\n\n` +
      `Kode verifikasi Anda: *${otp}*\n\n` +
      `⏰ Berlaku 5 menit.\n` +
      `⚠️ Jangan berikan kode ini kepada siapapun.\n\n` +
      `_Gameflash - Top Up Tercepat & Terpercaya_ ⚡`;

    if (typeof Fonnte !== 'undefined' && Fonnte.isActive()) {
      await Fonnte.send(phone, msg);
    } else {
      console.log('[Auth] OTP for', phone, ':', otp);
    }

    return { success: true, otp }; // return otp for demo display
  },

  verifyOTP(inputOtp) {
    const data = JSON.parse(sessionStorage.getItem('gf_otp') || '{}');
    if (!data.otp) return { success: false, error: 'Tidak ada OTP yang dikirim' };
    if (Date.now() > data.expires) return { success: false, error: 'OTP sudah kadaluarsa' };
    if (inputOtp !== data.otp) return { success: false, error: 'Kode OTP salah' };
    sessionStorage.removeItem('gf_otp');
    return { success: true, phone: data.phone };
  },

  // ─── REGISTER / LOGIN ──────────────────────────────
  findUser(phone) {
    const users = GF.get(GF.KEYS.USERS) || [];
    return users.find(u => u.phone === phone);
  },

  register(phone, name) {
    const users = GF.get(GF.KEYS.USERS) || [];
    if (users.find(u => u.phone === phone)) {
      return { success: false, error: 'Nomor sudah terdaftar' };
    }

    const user = {
      id: 'usr_' + Date.now(),
      phone,
      name: name || 'Gamer',
      avatar: name ? name.charAt(0).toUpperCase() : 'G',
      role: 'bronze',
      balance: 0,
      totalSpent: 0,
      totalTransactions: 0,
      joinedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users.push(user);
    GF.set(GF.KEYS.USERS, users);
    GF.set(GF.KEYS.CURRENT_USER, user);

    return { success: true, user };
  },

  login(phone) {
    const user = this.findUser(phone);
    if (!user) return { success: false, error: 'Nomor belum terdaftar' };

    // Update last login
    const users = GF.get(GF.KEYS.USERS) || [];
    const idx = users.findIndex(u => u.phone === phone);
    if (idx !== -1) {
      users[idx].lastLogin = new Date().toISOString();
      GF.set(GF.KEYS.USERS, users);
    }

    GF.set(GF.KEYS.CURRENT_USER, user);
    return { success: true, user };
  },

  // ─── ROLE CALCULATION ─────────────────────────────
  calculateRole(totalSpent) {
    if (totalSpent >= this.ROLES.gold.min) return 'gold';
    if (totalSpent >= this.ROLES.silver.min) return 'silver';
    return 'bronze';
  },

  getRoleInfo(role) {
    return this.ROLES[role] || this.ROLES.bronze;
  },

  getMemberDiscount(role) {
    return (this.ROLES[role] || this.ROLES.bronze).discount;
  },

  // Recalculate user stats from transactions
  refreshUserStats(phone) {
    const users = GF.get(GF.KEYS.USERS) || [];
    const idx = users.findIndex(u => u.phone === phone);
    if (idx === -1) return null;

    const txs = GF.get(GF.KEYS.TRANSACTIONS) || [];
    const userTxs = txs.filter(t =>
      t.customerPhone === phone || t.customerPhone === phone.replace(/^0/, '62')
    );
    const successTxs = userTxs.filter(t => t.status === 'success');
    const totalSpent = successTxs.reduce((s, t) => s + (t.finalAmount || 0), 0);

    users[idx].totalSpent = totalSpent;
    users[idx].totalTransactions = successTxs.length;
    users[idx].role = this.calculateRole(totalSpent);
    GF.set(GF.KEYS.USERS, users);

    // Update current session too
    const cur = GF.get(GF.KEYS.CURRENT_USER);
    if (cur && cur.phone === phone) {
      Object.assign(cur, users[idx]);
      GF.set(GF.KEYS.CURRENT_USER, cur);
    }

    return users[idx];
  },

  // ─── BALANCE / DEPOSIT ────────────────────────────
  getBalance(phone) {
    const user = this.findUser(phone);
    return user ? user.balance : 0;
  },

  addBalance(phone, amount, note) {
    const users = GF.get(GF.KEYS.USERS) || [];
    const idx = users.findIndex(u => u.phone === phone);
    if (idx === -1) return false;

    users[idx].balance += amount;
    GF.set(GF.KEYS.USERS, users);

    // Log deposit
    const deposits = GF.get(GF.KEYS.DEPOSITS) || [];
    deposits.unshift({
      id: 'dep_' + Date.now(),
      phone, amount, type: 'credit',
      note: note || 'Deposit',
      balanceAfter: users[idx].balance,
      createdAt: new Date().toISOString()
    });
    GF.set(GF.KEYS.DEPOSITS, deposits);

    // Update session
    const cur = GF.get(GF.KEYS.CURRENT_USER);
    if (cur && cur.phone === phone) {
      cur.balance = users[idx].balance;
      GF.set(GF.KEYS.CURRENT_USER, cur);
    }
    return true;
  },

  deductBalance(phone, amount, note) {
    const users = GF.get(GF.KEYS.USERS) || [];
    const idx = users.findIndex(u => u.phone === phone);
    if (idx === -1 || users[idx].balance < amount) return false;

    users[idx].balance -= amount;
    GF.set(GF.KEYS.USERS, users);

    const deposits = GF.get(GF.KEYS.DEPOSITS) || [];
    deposits.unshift({
      id: 'dep_' + Date.now(),
      phone, amount: -amount, type: 'debit',
      note: note || 'Pembelian',
      balanceAfter: users[idx].balance,
      createdAt: new Date().toISOString()
    });
    GF.set(GF.KEYS.DEPOSITS, deposits);

    const cur = GF.get(GF.KEYS.CURRENT_USER);
    if (cur && cur.phone === phone) {
      cur.balance = users[idx].balance;
      GF.set(GF.KEYS.CURRENT_USER, cur);
    }
    return true;
  },

  // ─── NAVBAR HELPER ────────────────────────────────
  renderNavAuth(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const user = this.getUser();
    if (user) {
      const role = this.getRoleInfo(user.role);
      el.innerHTML = `
        <a href="dashboard.html" class="nav-user-btn" id="navUserBtn">
          <div class="nav-user-avatar" style="background:${role.gradient}">${user.avatar || 'G'}</div>
          <span class="nav-user-name">${user.name}</span>
          <span class="nav-role-badge" style="color:${role.color}">${role.emoji}</span>
        </a>`;
    } else {
      el.innerHTML = `<a href="login.html" class="nav-cta" id="navLoginBtn">👤 Masuk</a>`;
    }
  }
};
