/* inventario.js — INVENTARIO DE CAJAS
   ---------------------------------------------------------------------------
   - Al TERMINAR una partida de batalla libre contra la IA (con o sin baneos)
     consigues una 📦 caja (imagen: personajes/caja.jpg).
   - Las cajas se guardan en el INVENTARIO (chip arriba a la derecha del menú).
   - Al abrir una caja desde el inventario te da entre 1 y 50 puntos de gloria
     (al azar) que se suman a tu perfil y te ayudan a subir de rango.
     Puedes abrirlas de una en una o todas de golpe.

   NO dan caja: Historia, Desafío, Infierno, Torneo, PvP local ni Multijugador
   (solo cuenta la batalla libre "Jugador vs IA" y "Jugador vs IA con baneos").

   INSTALACIÓN (juego.html), justo DESPUÉS de perfil.js:
       <script src="inventario.js" defer></script>
   Además perfil.js debe ser la versión que suma la gloria de las cajas
   (función bonusGlory dentro de computePoints; viene incluida).

   Todo se guarda en localStorage ('batalla-inventario').

   DÓNDE AJUSTAR COSAS:
     - Imagen de la caja:           BOX_IMG
     - Mínimo / máximo de gloria:   GLORY_MIN / GLORY_MAX
     - Dar caja solo si ganas:      REQUIRE_WIN = true
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  if (typeof state === 'undefined' || typeof window.checkKO !== 'function') {
    console.warn('[inventario.js] Debe cargarse DESPUÉS de game.js y perfil.js.');
    return;
  }

  const BOX_IMG     = 'personajes/caja.jpg';
  const KEY         = 'batalla-inventario';
  const GLORY_MIN   = 1;
  const GLORY_MAX   = 50;
  const REQUIRE_WIN = false;   // false: una caja por cada partida terminada (gana o pierdas)
  const HISTORY_MAX = 12;

  /* ---------------- utilidades ---------------- */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('es-ES');
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roll = () => GLORY_MIN + Math.floor(Math.random() * (GLORY_MAX - GLORY_MIN + 1));

  function ago(ts) {
    if (!ts) return '';
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return 'hace un momento';
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    return h < 24 ? `hace ${h} h` : `hace ${Math.floor(h / 24)} d`;
  }

  /* ---------------- datos guardados ---------------- */
  function load() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
    const n = v => Math.max(0, Math.min(1e9, Math.floor(Number(v)) || 0));
    return {
      boxes: n(d.boxes),      // cajas sin abrir
      earned: n(d.earned),    // cajas conseguidas en total
      opened: n(d.opened),    // cajas abiertas
      total: n(d.total),      // gloria total ganada con cajas
      best: n(d.best),        // mejor caja
      history: (Array.isArray(d.history) ? d.history : []).slice(0, HISTORY_MAX)
        .map(h => ({ pts: n(h && h.pts), at: Number(h && h.at) || 0 }))
    };
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* modo privado */ } }

  /* Gloria extra que suma perfil.js a los puntos del jugador. */
  const bonusGlory = () => load().total;

  /* ---------------- conseguir cajas (fin de partida vs IA) ---------------- */
  function award(win) {
    if (REQUIRE_WIN && !win) return;
    S = load();
    S.boxes++; S.earned++;
    save();
    refreshChip();
    showToast(win);
  }

  function installHook() {
    const _ko = window.checkKO;
    if (typeof _ko !== 'function' || _ko.__inventario) return;
    const wrapped = function () {
      const before = state.phase;
      const res = _ko.apply(this, arguments);
      try {
        // Solo batalla libre vs IA: Historia, Desafío, Infierno y Torneo activan storyMode;
        // el PvP y el Multijugador usan otro state.mode.
        if (res && before !== 'ended' && state.phase === 'ended' && !state.storyMode && state.mode === 'pve') {
          award(!state.teams.p1.every(c => c.hp <= 0));
        }
      } catch (e) { /* el inventario nunca debe romper el combate */ }
      return res;
    };
    wrapped.__inventario = true;
    window.checkKO = wrapped;
  }

  /* ---------------- estilos ---------------- */
  function injectStyles() {
    if (byId('inventario-styles')) return;
    const st = document.createElement('style');
    st.id = 'inventario-styles';
    st.textContent = `
    /* ---------- Chip del menú ---------- */
    .inv-chip{position:absolute;top:18px;right:18px;z-index:3;display:flex;align-items:center;gap:11px;padding:7px 18px 7px 7px;
      border:1px solid rgba(251,146,60,.5);border-radius:99px;cursor:pointer;color:#fff;font:inherit;text-align:left;
      background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02)),rgba(9,18,38,.86);backdrop-filter:blur(14px);
      box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 26px rgba(251,146,60,.16);transition:transform .15s,box-shadow .15s,filter .15s}
    .inv-chip:hover{transform:translateY(-2px);filter:brightness(1.1);box-shadow:0 16px 36px rgba(0,0,0,.5),0 0 34px rgba(251,146,60,.32)}
    .inv-chip-ic{position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:14px;flex:0 0 auto;font-size:22px;
      background:#1a1208;box-shadow:0 0 0 2px rgba(251,146,60,.85),0 0 14px rgba(251,146,60,.4)}
    .inv-chip-ic img{width:100%;height:100%;object-fit:cover;border-radius:14px}
    .inv-chip-txt{display:flex;flex-direction:column;line-height:1.2}
    .inv-chip-txt b{font-size:14px}
    .inv-chip-txt small{font-size:11px;color:#fdba74;font-weight:700}
    .inv-badge{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;display:flex;align-items:center;justify-content:center;border-radius:99px;
      font-size:12px;font-weight:800;color:#fff;background:linear-gradient(180deg,#f87171,#dc2626);border:2px solid #09122a;box-shadow:0 4px 12px rgba(220,38,38,.5)}
    .inv-chip.has .inv-badge{animation:inv-beat 1.6s ease-in-out infinite}
    .inv-chip:not(.has) .inv-badge{display:none}
    @media (max-width:600px){.inv-chip{top:10px;right:10px;padding:5px}.inv-chip-txt{display:none}}

    /* ---------- Pantalla ---------- */
    #inv-screen{position:fixed;inset:0;display:none;align-items:flex-start;justify-content:center;padding:24px 16px 40px;overflow:auto;z-index:127;color:#fff;
      background:radial-gradient(circle at 12% 0%,rgba(251,146,60,.16),transparent 34%),radial-gradient(circle at 88% 6%,rgba(251,191,36,.12),transparent 36%),
      radial-gradient(circle at 50% 100%,rgba(139,92,246,.14),transparent 40%),linear-gradient(180deg,#0d0a10,#150f14 55%,#05060a)}
    .inv-wrap{width:min(980px,100%);display:flex;flex-direction:column;gap:20px}
    .inv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .inv-title{margin:0;font-size:clamp(22px,2.6vw,32px);font-weight:800;letter-spacing:-.02em;background:linear-gradient(90deg,#fff,#fed7aa,#fde68a);-webkit-background-clip:text;background-clip:text;color:transparent}
    .inv-h{display:flex;align-items:center;gap:10px;margin:2px 0 -6px;font-size:18px;font-weight:800}
    .inv-h::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(251,146,60,.5),transparent)}
    .inv-h small{font-weight:500;color:#a8957f;font-size:12px}
    .inv-panel{padding:18px 20px;border-radius:20px;border:1px solid rgba(255,255,255,.1);
      background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),#0f1020;box-shadow:0 18px 44px rgba(0,0,0,.42)}
    .inv-hero{border-color:rgba(var(--rank-rgb,148,163,184),.45);box-shadow:0 18px 44px rgba(0,0,0,.42),0 0 50px rgba(var(--rank-rgb,148,163,184),.12)}
    .inv-hero .pf-rank-row{margin:0 0 10px}
    .inv-hint{margin-top:10px;color:#a8957f;font-size:12px;line-height:1.5}

    .inv-slot{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
    .inv-box{position:relative;flex:0 0 auto;width:150px;height:150px;border-radius:22px;
      background:radial-gradient(circle at 50% 30%,rgba(251,146,60,.3),rgba(5,10,24,.9));border:1px solid rgba(251,146,60,.55);
      box-shadow:0 18px 40px rgba(0,0,0,.5),0 0 40px rgba(251,146,60,.2);animation:inv-float 3.4s ease-in-out infinite}
    .inv-box img{width:100%;height:100%;object-fit:cover;border-radius:21px;display:block}
    .inv-box-fb{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:72px}
    .inv-count{position:absolute;right:-10px;bottom:-10px;padding:3px 13px;border-radius:99px;font-size:17px;font-weight:800;
      background:linear-gradient(180deg,#fdba74,#ea580c);color:#1a0d04;border:3px solid #0f1020;box-shadow:0 8px 18px rgba(0,0,0,.45)}
    .inv-slot-info{flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:8px}
    .inv-slot-info b{font-size:20px}
    .inv-slot-info span{color:#c9b9a4;font-size:13px;line-height:1.5}
    .inv-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
    .inv-primary{padding:11px 20px;border:0;border-radius:14px;cursor:pointer;font:inherit;font-weight:800;color:#1a0d04;
      background:linear-gradient(180deg,#fdba74,#f97316);box-shadow:0 8px 20px rgba(249,115,22,.35);transition:transform .15s,filter .15s}
    .inv-primary:hover{transform:translateY(-2px);filter:brightness(1.08)}
    .inv-empty{display:flex;align-items:center;gap:16px;padding:6px 2px;color:#a8957f}
    .inv-empty-ic{font-size:44px;opacity:.55}
    .inv-empty b{display:block;color:#e8dccb;margin-bottom:3px}

    .inv-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
    .inv-tile{padding:14px 16px;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012)),#0f1020;border:1px solid rgba(255,255,255,.09)}
    .inv-tile b{display:block;font-size:26px;letter-spacing:-.02em;color:#fdba74}
    .inv-tile span{font-size:12px;color:#a8957f}
    .inv-hist{display:flex;flex-wrap:wrap;gap:8px}
    .inv-hist-item{display:flex;flex-direction:column;align-items:center;min-width:84px;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
    .inv-hist-item b{font-size:16px;color:#86efac}
    .inv-hist-item.top b{color:#fde047}
    .inv-hist-item small{font-size:10.5px;color:#a8957f}

    /* ---------- Ventana de apertura ---------- */
    .inv-modal{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(1,5,15,.82);backdrop-filter:blur(10px);animation:inv-fade .18s}
    .inv-reveal{position:relative;width:min(520px,100%);max-height:92vh;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:14px;padding:26px 24px;text-align:center;border-radius:26px;
      border:1px solid rgba(251,146,60,.5);background:radial-gradient(circle at 50% 0%,rgba(251,146,60,.2),transparent 55%),#0d0f1f;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 60px rgba(251,146,60,.16);animation:inv-pop .22s}
    .inv-stage{position:relative;display:flex;align-items:center;justify-content:center;min-height:190px;width:100%}
    .inv-boxbtn{padding:0;border:0;background:none;cursor:pointer;width:170px;height:170px;border-radius:26px;overflow:hidden;
      box-shadow:0 0 0 2px rgba(251,146,60,.7),0 0 50px rgba(251,146,60,.4)}
    .inv-boxbtn img{width:100%;height:100%;object-fit:cover;display:block}
    .inv-boxbtn .inv-box-fb{background:#1a1208}
    .inv-boxbtn.shake{animation:inv-shake .5s ease-in-out infinite}
    .inv-prize{display:flex;flex-direction:column;align-items:center;gap:4px;animation:inv-burst .55s cubic-bezier(.2,1.4,.4,1) both}
    .inv-plus{font-size:64px;font-weight:900;line-height:1;letter-spacing:-.03em;color:#fde047;text-shadow:0 0 34px rgba(251,191,36,.8)}
    .inv-prize small{font-size:14px;color:#fed7aa}
    .inv-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-height:96px;overflow:auto;margin-top:6px}
    .inv-chips i{font-style:normal;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:800;color:#86efac;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.4)}
    .inv-chips i.top{color:#fde047;background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.55)}
    .inv-msg{font-size:14px;color:#c9b9a4;min-height:20px}
    .inv-after{width:100%;max-width:400px;display:flex;flex-direction:column;gap:6px;animation:inv-fade .4s}
    .inv-after .pf-xp{max-width:none}
    .inv-up{font-weight:800;color:#fde047;font-size:15px;animation:inv-beat 1.2s ease-in-out 3}
    .inv-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
    [hidden]{display:none!important}

    .inv-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:170;max-width:min(440px,92vw);display:flex;align-items:center;gap:14px;padding:12px 18px 12px 12px;cursor:pointer;
      border-radius:20px;background:rgba(9,18,38,.96);border:1px solid rgba(251,146,60,.6);box-shadow:0 14px 40px rgba(0,0,0,.55),0 0 30px rgba(251,146,60,.25);animation:inv-toast .4s cubic-bezier(.2,1.2,.4,1)}
    .inv-toast .inv-toast-box{width:54px;height:54px;border-radius:14px;overflow:hidden;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:28px;background:#1a1208}
    .inv-toast img{width:100%;height:100%;object-fit:cover}
    .inv-toast b{display:block;font-size:14px}
    .inv-toast small{display:block;margin-top:2px;font-size:12px;color:#c9b9a4;line-height:1.4}

    @keyframes inv-fade{from{opacity:0}to{opacity:1}}
    @keyframes inv-pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
    @keyframes inv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes inv-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
    @keyframes inv-shake{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-7deg) scale(1.04)}40%{transform:rotate(7deg) scale(1.07)}60%{transform:rotate(-5deg) scale(1.08)}80%{transform:rotate(5deg) scale(1.05)}}
    @keyframes inv-burst{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:scale(1)}}
    @keyframes inv-toast{from{opacity:0;transform:translate(-50%,24px)}to{opacity:1;transform:translate(-50%,0)}}
    @media (prefers-reduced-motion:reduce){.inv-box,.inv-chip.has .inv-badge,.inv-boxbtn.shake,.inv-up,.inv-prize,.inv-reveal,.inv-modal,.inv-toast{animation:none!important}}
    @media (max-width:560px){.inv-slot{justify-content:center;text-align:center}.inv-btns{justify-content:center}}
    `;
    document.head.appendChild(st);
  }

  /* ---------------- piezas ---------------- */
  function boxImg(cls) {
    return `<img src="${esc(BOX_IMG)}" alt="Caja" data-fb="📦" data-cls="inv-box-fb" class="${cls || ''}" decoding="async">`;
  }

  function wireFallbacks(root) {
    if (root.__invFb) return;
    root.__invFb = true;
    root.addEventListener('error', e => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.dataset.fb) return;
      const fb = document.createElement('div');
      fb.className = img.dataset.cls || '';
      fb.textContent = img.dataset.fb;
      img.replaceWith(fb);
    }, true);
  }

  function snap() {
    try { return window.PERFIL && typeof window.PERFIL.snapshot === 'function' ? window.PERFIL.snapshot() : null; }
    catch (e) { return null; }
  }

  /* ---------------- chip del menú ---------------- */
  function renderChip() {
    const menu = byId('main-menu');
    if (!menu) return;
    let chip = byId('inv-chip');
    if (!chip) {
      chip = document.createElement('button');
      chip.id = 'inv-chip';
      chip.className = 'inv-chip';
      chip.title = 'Abrir mi inventario';
      menu.appendChild(chip);
      chip.addEventListener('click', openInv);
      wireFallbacks(chip);
    }
    S = load();
    chip.classList.toggle('has', S.boxes > 0);
    chip.innerHTML = `
      <span class="inv-chip-ic">${boxImg()}<span class="inv-badge">${S.boxes > 99 ? '99+' : S.boxes}</span></span>
      <span class="inv-chip-txt"><b>Inventario</b><small>${S.boxes ? `${S.boxes} ${S.boxes === 1 ? 'caja' : 'cajas'} sin abrir` : 'Sin cajas'}</small></span>`;
  }
  function refreshChip() { try { renderChip(); } catch (e) { /* el menú aún no existe */ } }

  /* ---------------- aviso al conseguir una caja ---------------- */
  let toastT = null;
  function showToast(win) {
    const old = byId('inv-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'inv-toast';
    t.className = 'inv-toast';
    t.innerHTML = `<span class="inv-toast-box">${boxImg()}</span>
      <div><b>🎁 ¡Has conseguido una caja!</b>
        <small>${win ? 'Premio por tu victoria.' : 'Premio por terminar la partida.'} Ábrela en «Inventario» (menú principal) para ganar gloria.</small></div>`;
    document.body.appendChild(t);
    wireFallbacks(t);
    t.addEventListener('click', () => t.remove());
    clearTimeout(toastT);
    toastT = setTimeout(() => { const x = byId('inv-toast'); if (x) x.remove(); }, 9000);
  }

  /* ---------------- pantalla del inventario ---------------- */
  const ui = { open: false };

  function injectMarkup() {
    if (byId('inv-screen')) return;
    const sc = document.createElement('div');
    sc.id = 'inv-screen';
    sc.innerHTML = '<div class="inv-wrap" id="inv-wrap"></div>';
    document.body.appendChild(sc);
    wireFallbacks(sc);
    sc.addEventListener('click', onClick);
  }

  function rankHTML(sp) {
    if (!sp) return '';
    const rk = sp.rank;
    return `<section class="inv-panel inv-hero" style="--rank-rgb:${esc(rk.rgb)}">
      <div class="pf-rank-row"><span class="pf-rank-badge">${esc(rk.icon)} ${esc(rk.name)}</span>
        <span class="pf-points"><b>${fmt(sp.points)}</b> puntos de gloria</span></div>
      <div class="pf-xp"><i style="width:${rk.pct}%"></i></div>
      <div class="pf-xp-label">${rk.nextMin ? `${fmt(sp.points)} / ${fmt(rk.nextMin)} para ser ${esc(rk.nextIcon)} ${esc(rk.nextName)}` : '¡Rango máximo!'}</div>
      <div class="inv-hint">Cada caja da entre ${GLORY_MIN} y ${GLORY_MAX} puntos de gloria al abrirla. Las ganas al terminar una partida contra la IA (con o sin baneos).</div>
    </section>`;
  }

  function renderScreen() {
    const wrap = byId('inv-wrap');
    if (!wrap) return;
    S = load();
    const sp = snap();
    const boxesHTML = S.boxes
      ? `<div class="inv-slot">
          <div class="inv-box">${boxImg()}<span class="inv-count">×${S.boxes}</span></div>
          <div class="inv-slot-info">
            <b>Caja de gloria</b>
            <span>Contiene entre ${GLORY_MIN} y ${GLORY_MAX} puntos de gloria al azar. Te tienes que quedar con lo que salga 😉</span>
            <div class="inv-btns">
              <button class="inv-primary" data-act="open1">🎁 Abrir caja</button>
              ${S.boxes > 1 ? `<button class="class-btn" data-act="openAll">Abrir las ${S.boxes} cajas</button>` : ''}
            </div>
          </div>
        </div>`
      : `<div class="inv-empty"><span class="inv-empty-ic">📭</span>
          <div><b>No tienes cajas sin abrir</b>Consigue una al terminar una partida contra la IA, con o sin baneos.</div></div>`;

    const hist = S.history.length
      ? `<div class="inv-h">🕘 Últimas cajas abiertas</div>
         <div class="inv-hist">${S.history.map(h =>
           `<div class="inv-hist-item${h.pts >= 45 ? ' top' : ''}"><b>+${h.pts}</b><small>${esc(ago(h.at))}</small></div>`).join('')}</div>`
      : '';

    wrap.innerHTML = `
      <div class="inv-top">
        <h2 class="inv-title">🎒 Inventario</h2>
        <button class="class-btn" data-act="back">⬅ Volver al menú</button>
      </div>
      ${rankHTML(sp)}
      <div class="inv-h">📦 Cajas <small>${S.boxes} sin abrir</small></div>
      <section class="inv-panel">${boxesHTML}</section>
      <div class="inv-tiles">
        <div class="inv-tile"><b>${fmt(S.opened)}</b><span>Cajas abiertas</span></div>
        <div class="inv-tile"><b>+${fmt(S.total)}</b><span>Gloria ganada con cajas</span></div>
        <div class="inv-tile"><b>${S.best ? '+' + S.best : '—'}</b><span>Mejor caja</span></div>
        <div class="inv-tile"><b>${fmt(S.earned)}</b><span>Cajas conseguidas en total</span></div>
      </div>
      ${hist}`;
  }

  function onClick(ev) {
    const b = ev.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'back') closeInv();
    else if (act === 'open1') openBoxes(1);
    else if (act === 'openAll') openBoxes(Infinity);
    else if (act === 'close') closeReveal();
    else if (act === 'reveal') doReveal();
  }

  function openInv() {
    byId('main-menu').style.display = 'none';
    ui.open = true;
    const sc = byId('inv-screen');
    sc.style.display = 'flex';
    sc.scrollTop = 0;
    renderScreen();
  }

  function closeInv() {
    closeReveal();
    ui.open = false;
    byId('inv-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';   // perfil.js refresca su chip al ver este cambio
    renderChip();
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !ui.open) return;
    if (byId('inv-modal')) closeReveal(); else closeInv();
  });

  /* ---------------- abrir cajas ---------------- */
  let revealT = null, revealData = null;

  function openBoxes(want) {
    if (byId('inv-modal')) return;
    S = load();
    const n = Math.min(S.boxes, want === Infinity ? S.boxes : want);
    if (n < 1) { renderScreen(); return; }

    const before = snap();
    const results = [];
    for (let i = 0; i < n; i++) {
      const pts = roll();
      results.push(pts);
      S.boxes--; S.opened++; S.total += pts;
      if (pts > S.best) S.best = pts;
      S.history.unshift({ pts, at: Date.now() });
    }
    S.history = S.history.slice(0, HISTORY_MAX);
    save();                      // se guarda ya: cerrar la ventana a medias no pierde nada
    const after = snap();
    showReveal({ results, before, after, left: S.boxes });
  }

  function showReveal(d) {
    closeReveal();
    revealData = d;
    const many = d.results.length > 1;
    const rk = (d.after || d.before || {}).rank;
    const m = document.createElement('div');
    m.id = 'inv-modal';
    m.className = 'inv-modal';
    m.innerHTML = `
      <div class="inv-reveal" role="dialog" aria-modal="true" style="--rank-rgb:${rk ? esc(rk.rgb) : '251,146,60'}">
        <div class="inv-stage" id="inv-stage">
          <button class="inv-boxbtn shake" id="inv-boxbtn" data-act="reveal" title="Pulsa para abrir">${boxImg()}</button>
        </div>
        <div class="inv-msg" id="inv-msg">${many ? `Abriendo ${d.results.length} cajas…` : 'Abriendo la caja…'}</div>
        <div class="inv-after" id="inv-after" hidden></div>
        <div class="inv-actions" id="inv-actions" hidden></div>
      </div>`;
    byId('inv-screen').appendChild(m);
    wireFallbacks(m);
    m.addEventListener('click', ev => { if (ev.target === m && byId('inv-actions') && !byId('inv-actions').hidden) closeReveal(); });
    revealT = setTimeout(doReveal, reduceMotion() ? 0 : 1300);
  }

  function countUp(el, to) {
    if (reduceMotion() || to <= 0) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 700;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1 && el.isConnected) requestAnimationFrame(tick); else el.textContent = to;
    };
    el.textContent = 0;
    requestAnimationFrame(tick);
  }

  function doReveal() {
    const d = revealData, stage = byId('inv-stage');
    if (!d || !stage || stage.dataset.done) return;
    stage.dataset.done = '1';
    clearTimeout(revealT);
    const total = d.results.reduce((a, b) => a + b, 0);
    const many = d.results.length > 1;
    const max = Math.max.apply(null, d.results);

    stage.innerHTML = `<div class="inv-prize">
      <div class="inv-plus">+<span id="inv-num">0</span></div>
      <small>puntos de gloria${many ? ` · ${d.results.length} cajas` : ''}</small>
      ${many ? `<div class="inv-chips">${d.results.map(p => `<i${p === max && p >= 45 ? ' class="top"' : ''}>+${p}</i>`).join('')}</div>` : ''}
    </div>`;
    countUp(byId('inv-num'), total);
    byId('inv-msg').textContent = !many && total >= 45 ? '¡Caja de oro! 🌟' : (!many && total <= 5 ? 'Mala suerte… la próxima será mejor.' : '');

    // Barra de rango antes → después
    const after = byId('inv-after');
    const b = d.before, a = d.after;
    if (a) {
      const up = b && b.rank.name !== a.rank.name;
      after.innerHTML = `
        <div class="pf-xp"><i id="inv-xp" style="width:${b ? b.rank.pct : a.rank.pct}%"></i></div>
        <div class="pf-xp-label">${a.rank.nextMin ? `${fmt(a.points)} / ${fmt(a.rank.nextMin)} para ser ${esc(a.rank.nextIcon)} ${esc(a.rank.nextName)}` : '¡Rango máximo!'}</div>
        ${up ? `<div class="inv-up">🎉 ¡Subes a ${esc(a.rank.icon)} ${esc(a.rank.name)}!</div>` : ''}`;
      after.hidden = false;
      const fill = byId('inv-xp');
      if (fill) requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = a.rank.pct + '%'; }));
    }

    const act = byId('inv-actions');
    act.innerHTML = `${d.left > 0 ? `<button class="inv-primary" data-act="open1">🎁 Abrir otra (${d.left})</button>` : ''}
      <button class="class-btn" data-act="close">Cerrar</button>`;
    act.hidden = false;
    renderScreen();   // el fondo ya muestra las cajas y la gloria actualizadas
  }

  function closeReveal() {
    clearTimeout(revealT);
    revealData = null;
    const m = byId('inv-modal');
    if (m) m.remove();
    if (ui.open) renderScreen();
  }

  /* ---------------- arranque ---------------- */
  function init() {
    injectStyles();
    injectMarkup();
    installHook();
    renderChip();

    // El chip se refresca cada vez que se vuelve al menú
    const menu = byId('main-menu');
    if (menu && window.MutationObserver) {
      new MutationObserver(() => { if (menu.style.display !== 'none') refreshChip(); })
        .observe(menu, { attributes: true, attributeFilter: ['style'] });
    }
    if (!window.PERFIL || typeof window.PERFIL.snapshot !== 'function') {
      console.warn('[inventario.js] No se encontró perfil.js: las cajas se abrirán pero la gloria no se sumará al perfil.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Lo usa perfil.js (bonusGlory) y sirve para depurar desde la consola: INVENTARIO.add(3)
  window.INVENTARIO = {
    open: openInv,
    bonusGlory,
    add(n) { S = load(); S.boxes += Math.max(0, Math.floor(Number(n)) || 0); S.earned += Math.max(0, Math.floor(Number(n)) || 0); save(); refreshChip(); if (ui.open) renderScreen(); },
    load
  };
})();
