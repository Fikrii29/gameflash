// Footer bersama untuk semua halaman. Data kontak diambil dari js/site-config.js
(function(){
const S=typeof SITE!=='undefined'?SITE:{name:'Gameflash'};
const li=(h,t,e='')=>`<li><a href="${h}"${e}>${t}</a></li>`,ex=' target="_blank" rel="noopener"';
const wa=S.wa?'https://wa.me/'+S.wa:'';
const ic=(h,t,i)=>h?`<a href="${h}"${h[0]=='m'?'':ex} aria-label="${t}">${i}</a>`:'';
const html=`<footer class="gf-ft"><div class="gf-in">
<div class="gf-brand"><div class="gf-logo">⚡ ${S.name}</div><p>Top up game cepat, aman, dan transparan. Pesanan diproses otomatis dan bisa dicek kapan saja dengan nomor invoice.</p>
<div class="gf-soc">${ic(wa,'WhatsApp','💬')}${ic(S.email?'mailto:'+S.email:'','Email','✉️')}${ic(S.telegram,'Telegram','✈️')}${ic(S.instagram,'Instagram','📸')}</div></div>
<div><h4>Peta Situs</h4><ul>${li('index.html','Beranda')}${li('check-order.html','Cek Pesanan')}${li('tentang.html','Tentang Kami')}${wa?li(wa,'Hubungi Kami',ex):''}${li('syarat-ketentuan.html','Syarat &amp; Ketentuan')}${li('kebijakan-privasi.html','Kebijakan Privasi')}${li('syarat-ketentuan.html#refund','Kebijakan Refund')}</ul></div>
<div><h4>Dukungan</h4><ul>${wa?li(wa,'WhatsApp',ex):''}${S.telegram?li(S.telegram,'Telegram',ex):''}${S.email?li('mailto:'+S.email,'Email'):''}${S.instagram?li(S.instagram,'Instagram',ex):''}</ul>${S.hours?`<p class="gf-h">Layanan aktif ${S.hours}</p>`:''}</div>
</div><div class="gf-bot">© ${new Date().getFullYear()} ${S.name}. Semua hak dilindungi.</div></footer>`;
const css=`.gf-ft{background:var(--bg-secondary,#0d0d1a);border-top:1px solid var(--border,#222);padding:44px 22px 24px;margin-top:40px}
.gf-in{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:36px}
.gf-logo{font:700 1.7rem 'Rajdhani',sans-serif;background:var(--gradient-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px;display:inline-block}
.gf-brand p{color:var(--text-muted);font-size:.95rem;line-height:1.7;margin:0 0 16px}
.gf-soc{display:flex;gap:12px}.gf-soc a{width:42px;height:42px;border-radius:50%;background:var(--bg-card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.2rem;text-decoration:none}
.gf-ft h4{color:var(--cyan,#00d4ff);font-size:1.1rem;font-weight:700;margin:0 0 12px}.gf-ft ul{list-style:none;margin:0;padding:0}
.gf-ft li a{display:block;padding:9px 0;color:var(--text-secondary,#b8bdd8);font-size:1rem;text-decoration:none}.gf-ft li a:hover{color:var(--cyan,#00d4ff)}
.gf-h{color:var(--text-muted);font-size:.85rem;margin:10px 0 0}
.gf-bot{max-width:1200px;margin:32px auto 0;padding-top:20px;border-top:1px solid var(--border,#222);text-align:center;color:var(--text-muted);font-size:.8rem}
@media(max-width:768px){.gf-in{grid-template-columns:1fr 1fr;gap:28px 20px}.gf-brand{grid-column:1/-1}}`;
function mount(){document.querySelectorAll('footer').forEach(f=>f.remove());
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
document.body.insertAdjacentHTML('beforeend',html);}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount):mount();
})();
