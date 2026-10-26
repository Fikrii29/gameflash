// Ubah data bisnis di sini. Semua halaman (Tentang, Syarat, Privasi) ikut berubah.
const SITE={name:'Gameflash',email:'cs@domainanda.com',wa:'6281234567890',telegram:'',instagram:'',hours:'24 jam setiap hari',refundDays:3,updated:'26 Oktober 2026'};
document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('[data-site]').forEach(e=>{const k=e.dataset.site,v=SITE[k];
if(k==='wa'){e.textContent='+'+v;e.href='https://wa.me/'+v}else if(k==='email'){e.textContent=v;e.href='mailto:'+v}else e.textContent=v}));
