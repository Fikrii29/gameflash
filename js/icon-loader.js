// =====================================================
// GAMEFLASH - icon-loader.js
// Load currency icons that were uploaded via icon-manager.html
// Include this BEFORE order.js in order.html
// =====================================================

(function () {
    const ICON_KEY = 'gf_currency_icons';

    function loadUploadedIcons() {
        try { return JSON.parse(localStorage.getItem(ICON_KEY) || '{}'); } catch { return {}; }
    }

    // Expose helper so order.js can call it
    window.GF_ICONS = {
        get(gameId) {
            return loadUploadedIcons()[gameId] || null;
        }
    };
})();