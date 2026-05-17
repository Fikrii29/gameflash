// =====================================================
// GAMEFLASH - Fonnte WhatsApp Notification Integration
// =====================================================

const Fonnte = {
  API_URL: 'https://api.fonnte.com/send',

  getToken() {
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    return settings.fonnteToken || '';
  },

  isActive() {
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    return settings.fonnteActive && settings.fonnteToken;
  },

  async send(phone, message) {
    if (!this.isActive()) {
      console.log('[Fonnte] Not active or no token. Message not sent:', message);
      return { success: false, error: 'Fonnte not configured' };
    }

    const token = this.getToken();
    const formData = new FormData();
    formData.append('target', phone);
    formData.append('message', message);
    formData.append('countryCode', '62');

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });
      const data = await response.json();
      console.log('[Fonnte] Send result:', data);
      return { success: data.status, data };
    } catch (err) {
      console.error('[Fonnte] Error:', err);
      return { success: false, error: err.message };
    }
  },

  // ─── Message Templates ───────────────────────────

  async notifyOrderCreated(transaction) {
    const phone = transaction.customerPhone;
    const msg = `🎮 *GAMEFLASH* - Order Dibuat!\n\n` +
      `📋 Invoice: *${transaction.invoiceId}*\n` +
      `🎯 Game: ${transaction.gameName}\n` +
      `📦 Paket: ${transaction.packageName}\n` +
      `👤 User ID: ${transaction.userId}${transaction.zoneId ? ' | Server: ' + transaction.zoneId : ''}\n` +
      `💰 Total: *${formatRupiah(transaction.finalAmount)}*\n` +
      `💳 Metode: ${transaction.paymentMethod}\n\n` +
      `⏳ Silakan lakukan pembayaran sebelum pesanan dibatalkan.\n\n` +
      `🔍 Cek status: ${window.location.origin}/check-order.html?invoice=${transaction.invoiceId}\n\n` +
      `_Terima kasih telah berbelanja di Gameflash!_ ⚡`;
    return this.send(phone, msg);
  },

  async notifyPaymentReceived(transaction) {
    const phone = transaction.customerPhone;
    const msg = `✅ *GAMEFLASH* - Pembayaran Diterima!\n\n` +
      `📋 Invoice: *${transaction.invoiceId}*\n` +
      `🎯 Game: ${transaction.gameName}\n` +
      `📦 Paket: ${transaction.packageName}\n` +
      `💰 Dibayar: *${formatRupiah(transaction.finalAmount)}*\n\n` +
      `⚙️ Pesanan Anda sedang diproses...\n` +
      `Estimasi: 1-5 menit\n\n` +
      `_Gameflash - Top Up Tercepat & Terpercaya_ ⚡`;
    return this.send(phone, msg);
  },

  async notifyOrderSuccess(transaction) {
    const phone = transaction.customerPhone;
    const msg = `🎉 *GAMEFLASH* - Top Up Berhasil!\n\n` +
      `📋 Invoice: *${transaction.invoiceId}*\n` +
      `🎯 Game: ${transaction.gameName}\n` +
      `📦 Paket: *${transaction.packageName}*\n` +
      `👤 User ID: ${transaction.userId}\n` +
      `💰 Total: *${formatRupiah(transaction.finalAmount)}*\n\n` +
      `✨ Diamond/item telah masuk ke akun Anda!\n\n` +
      `🙏 Terima kasih sudah Top Up di *Gameflash*!\n` +
      `⭐ Jangan lupa rekomendasikan ke teman-teman ya!\n\n` +
      `_Gameflash - Top Up Tercepat & Terpercaya_ ⚡`;
    return this.send(phone, msg);
  },

  async notifyOrderFailed(transaction) {
    const phone = transaction.customerPhone;
    const msg = `❌ *GAMEFLASH* - Transaksi Gagal\n\n` +
      `📋 Invoice: *${transaction.invoiceId}*\n` +
      `🎯 Game: ${transaction.gameName}\n` +
      `📦 Paket: ${transaction.packageName}\n\n` +
      `😞 Mohon maaf, transaksi Anda gagal diproses.\n` +
      `💰 Dana akan dikembalikan dalam 1x24 jam.\n\n` +
      `📞 Hubungi CS: wa.me/${(GF.get(GF.KEYS.SETTINGS) || {}).whatsapp || '6281234567890'}\n\n` +
      `_Gameflash - Top Up Tercepat & Terpercaya_ ⚡`;
    return this.send(phone, msg);
  },

  async notifyAdminNewOrder(transaction) {
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    const adminPhone = settings.whatsapp;
    if (!adminPhone) return;
    const msg = `🔔 *[ADMIN] Order Baru!*\n\n` +
      `📋 Invoice: ${transaction.invoiceId}\n` +
      `👤 WA: ${transaction.customerPhone}\n` +
      `🎯 ${transaction.gameName} - ${transaction.packageName}\n` +
      `💰 ${formatRupiah(transaction.finalAmount)}\n` +
      `💳 ${transaction.paymentMethod}\n` +
      `🕐 ${formatDate(transaction.createdAt)}`;
    return this.send(adminPhone, msg);
  },

  async notifyAdminRefund(transaction) {
    const settings = GF.get(GF.KEYS.SETTINGS) || {};
    const adminPhone = settings.whatsapp;
    if (!adminPhone) return;
    const retries = transaction.retryCount || 0;
    const reason = transaction.failReason || 'Unknown error';
    const msg = `🚨 *[ADMIN] REFUND DIPERLUKAN!*\n\n` +
      `📋 Invoice: *${transaction.invoiceId}*\n` +
      `👤 WA: ${transaction.customerPhone}\n` +
      `🎯 ${transaction.gameName} - ${transaction.packageName}\n` +
      `💰 Total: *${formatRupiah(transaction.finalAmount)}*\n` +
      `🔄 Retry: ${retries}/${3} kali gagal\n` +
      `❌ Alasan: ${reason}\n\n` +
      `⚠️ Silakan proses refund manual ke pelanggan.\n` +
      `💳 Gateway: ${transaction.paymentGateway || 'N/A'}`;
    return this.send(adminPhone, msg);
  }
};
