/* interfaz.js
   Pantalla "Más modos": el menú principal vuelve a verse como siempre, pero los
   paneles con portada (Historia 2, Desafío, Torneo, Infierno, Amigos, Salón de
   la Fama…) dejan de ocupar sitio en él. En su lugar aparece un botón
   "🎮 Más modos" que abre otra pantalla donde están todos, con sus imágenes.

   Cómo funciona (sin tocar game.js ni los demás módulos):
     - Los paneles ORIGINALES siguen existiendo, solo se ocultan en el menú con CSS.
       Así los módulos que los recolocan o actualizan (p. ej. Amigos: "2 amigos en
       línea") siguen funcionando igual.
     - La pantalla nueva lee esos paneles cada vez que se abre y pinta una tarjeta
       por cada uno (portada, título, subtítulo). Al pulsar una tarjeta se cierra la
       pantalla y se "pulsa" el panel original, que abre su modo como siempre.

   Qué se queda en el menú: lo indicado en KEEP_IN_MENU (por defecto, el Modo Historia).
   Si quieres que también vaya a "Más modos", quita 'menu-story' de esa lista;
   si quieres dejar otro en el menú, añade su id (menu-desafio, menu-torneo, menu-hell,
   menu-amigos, menu-fama, menu-historia2…).

   DISEÑO: con «Más modos» activo, el menú es simétrico: cuadro de modos (botones en
   2 columnas) y Modo Historia, cada uno en su mitad y con la misma altura.
   Ajustes en el bloque CSS «Menú simétrico» (ancho total: width:min(1060px,100%)).

   INTERRUPTOR: ⚙️ Configuración → "Agrupar modos extra en «Más modos»"
   (se recuerda en localStorage 'batalla-ui-modos'). Por consola:
   INTERFAZ.set(false) para ver todos los paneles en el menú como antes.

   INSTALACIÓN (juego.html), después de tutorial.js:
       <script src="interfaz.js" defer></script>
   Para quitarlo: borra esa línea (el menú vuelve a ser el original).
*/
(function () {
  'use strict';

  const KEY = 'batalla-ui-modos';
  const KEEP_IN_MENU = ['menu-story'];          // paneles que se quedan en el menú
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------------
     CSS
     ------------------------------------------------------------------ */
  function buildCSS() {
    const keep = KEEP_IN_MENU.map(id => ':not(#' + id + ')').join('');
    return `
    /* En el menú: solo se ocultan los paneles que pasan a "Más modos" */
    body.ui-hub #main-menu .story-poster-panel${keep}{display:none !important}
    body:not(.ui-hub) #menu-modos{display:none !important}

    /* ===== Menú simétrico: cuadro de modos (izq.) + Modo Historia (der.), misma altura ===== */
    body.ui-hub #main-menu{padding-top:84px}
    body.ui-hub #main-menu .menu-layout{
      display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:22px;
      width:min(1060px,100%); align-items:stretch;
    }
    /* cuadro de modos: botones en 2 columnas para que no sea tan alto */
    body.ui-hub #main-menu .menu-layout > .menu-card{
      width:auto; max-width:none; flex:none; padding:24px 22px;
      display:grid; grid-template-columns:1fr 1fr; gap:10px; align-content:start;
    }
    body.ui-hub #main-menu .main-menu-card > *{grid-column:1 / -1; margin-top:0; margin-bottom:0}
    body.ui-hub #main-menu .main-menu-card::before{width:44px; height:44px; font-size:21px; margin:0 auto 2px; border-radius:14px}
    body.ui-hub #main-menu .main-menu-card h2{font-size:30px}
    body.ui-hub #main-menu .main-menu-card > p{margin:0 0 6px}
    body.ui-hub #main-menu .main-menu-card > .menu-btn{
      grid-column:auto; display:flex; flex-direction:column; align-items:center; justify-content:center;
      min-height:50px; padding:9px 8px; font-size:13px; line-height:1.25;
    }
    body.ui-hub #main-menu .main-menu-card > #menu-tutorial{grid-column:1 / -1}
    body.ui-hub #main-menu .main-menu-card > div:last-child{margin-top:4px; font-size:11px}

    /* Modo Historia: ocupa su mitad y se estira a la altura del cuadro de modos */
    body.ui-hub #main-menu .menu-layout > #menu-story,
    body.ui-hub #main-menu .menu-layout > .menu-col{width:auto; max-width:none; min-width:0; flex:none}
    body.ui-hub #main-menu .menu-col{display:flex; flex-direction:column}
    body.ui-hub #main-menu .menu-col > #menu-story{flex:1 1 auto; width:100%}
    body.ui-hub #main-menu #menu-story{padding:16px; gap:12px; justify-content:center}
    body.ui-hub #main-menu #menu-story .story-poster-frame{
      position:relative; flex:1 1 auto; min-height:300px; background:rgba(2,8,20,.7);
    }
    /* fondo: la misma portada desenfocada (la pone el JS en --poster), para que no queden bandas vacías */
    body.ui-hub #main-menu #menu-story .story-poster-frame::before{
      content:''; position:absolute; inset:-24px; background:var(--poster, none) center/cover no-repeat;
      filter:blur(20px) brightness(.5) saturate(1.2);
    }
    body.ui-hub #main-menu #menu-story .story-poster-frame img{
      position:absolute; inset:0; width:100%; height:100%; max-height:none; object-fit:contain;
    }
    body.ui-hub #main-menu #menu-story .story-poster-title{font-size:22px}
    body.ui-hub #main-menu #menu-story .story-poster-subtitle{font-size:13px}
    body.ui-hub #main-menu #menu-story .story-poster-cta{padding:9px 24px; font-size:14px}

    /* chips de perfil / inventario más cerca del conjunto (en pantallas anchas) */
    body.ui-hub #main-menu .pf-chip{left:max(18px, calc(50% - 530px))}
    body.ui-hub #main-menu .inv-chip{right:max(18px, calc(50% - 530px))}

    @media (max-width:900px){
      body.ui-hub #main-menu .menu-layout{grid-template-columns:minmax(0,1fr); width:min(560px,100%)}
      body.ui-hub #main-menu #menu-story .story-poster-frame{flex:0 0 auto; min-height:0; height:300px}
    }
    @media (max-width:420px){
      body.ui-hub #main-menu .menu-layout > .menu-card{grid-template-columns:1fr}
    }

    /* Botón del menú */
    #menu-modos{
      background:linear-gradient(180deg,rgba(14,165,233,.88),rgba(3,105,161,.86));
      box-shadow:0 10px 24px rgba(3,105,161,.28);
    }
    #menu-modos small{display:block; margin-top:2px; font-weight:600; font-size:11px; opacity:.85}

    /* Pantalla "Más modos" */
    #hub-screen{
      position:fixed; inset:0; z-index:92; display:none; overflow-y:auto; color:#eef4ff;
      padding:28px 18px 44px;
      background:
        radial-gradient(circle at 50% 18%,rgba(139,92,246,.14),transparent 30%),
        radial-gradient(circle at 18% 8%,rgba(56,189,248,.09),transparent 28%),
        linear-gradient(180deg,rgba(2,6,23,.97),rgba(2,6,23,.995));
    }
    #hub-screen.open{display:block}
    #hub-screen *{box-sizing:border-box}
    .hub-wrap{max-width:1120px; margin:0 auto}
    .hub-top{display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap}
    .hub-title{
      margin:0; font-size:clamp(26px,4vw,40px); letter-spacing:-.035em;
      background:linear-gradient(90deg,#fff,#c4b5fd,#bae6fd); -webkit-background-clip:text; background-clip:text; color:transparent;
    }
    .hub-sub{margin:6px 0 22px; color:#9fb0c9; font-size:14px}
    .hub-back{
      padding:9px 16px; border-radius:12px; cursor:pointer; font:inherit; font-weight:700; color:#e5edf8;
      border:1px solid rgba(148,163,184,.3); background:rgba(255,255,255,.05);
    }
    .hub-back:hover{border-color:rgba(167,139,250,.7); background:rgba(139,92,246,.18)}
    .hub-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:20px}

    /* tarjetas: mismo aspecto que los paneles de portada originales */
    .hub-card{
      position:relative; display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center;
      padding:16px; border:1px solid rgba(251,191,36,.32); border-radius:26px; cursor:pointer; color:inherit; font:inherit;
      background:
        radial-gradient(circle at 50% 0%,rgba(251,191,36,.10),transparent 46%),
        linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),
        #091226;
      box-shadow:0 24px 60px rgba(0,0,0,.45),0 0 40px rgba(251,191,36,.08);
      transition:transform .15s ease,box-shadow .15s ease,filter .15s ease;
    }
    .hub-card:hover,.hub-card:focus-visible{
      transform:translateY(-3px); filter:brightness(1.07); outline:none;
      box-shadow:0 30px 70px rgba(0,0,0,.52),0 0 52px rgba(251,191,36,.16);
    }
    .hub-frame{
      width:100%; height:220px; border-radius:16px; overflow:hidden; display:flex; align-items:center; justify-content:center;
      border:1px solid rgba(255,255,255,.08); background:rgba(2,8,20,.45);
    }
    .hub-frame img{display:block; width:100%; height:100%; object-fit:contain}
    .hub-fb{font-size:64px}
    .hub-card-title{font-size:17px; font-weight:800; color:#fff; letter-spacing:.01em}
    .hub-card-sub{font-size:12px; color:#fcd34d; min-height:16px}
    .hub-cta{
      display:inline-block; padding:8px 18px; border-radius:99px; font-weight:800; font-size:13px; color:#1a1204;
      background:linear-gradient(180deg,rgba(251,191,36,.92),rgba(217,119,6,.88)); box-shadow:0 10px 22px rgba(217,119,6,.28);
    }
    .hub-empty{padding:40px 10px; text-align:center; color:#9fb0c9}

    @media (max-width:560px){
      #hub-screen{padding:18px 12px 36px}
      .hub-grid{grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px}
      .hub-card{padding:10px; border-radius:20px; gap:8px}
      .hub-frame{height:130px}
      .hub-card-title{font-size:14px} .hub-cta{padding:6px 12px; font-size:12px}
    }
    @media (max-width:360px){ .hub-grid{grid-template-columns:minmax(0,1fr)} }
    @media (prefers-reduced-motion:reduce){ .hub-card{transition:none} .hub-card:hover{transform:none} }
    `;
  }

  function injectCSS() {
    let st = $('ui-hub-css');
    if (!st) { st = document.createElement('style'); st.id = 'ui-hub-css'; st.textContent = buildCSS(); }
    document.head.appendChild(st);              // (re)colocar al final
  }

  /* ------------------------------------------------------------------
     Estado (interruptor)
     ------------------------------------------------------------------ */
  function read() {
    try { return localStorage.getItem(KEY) !== 'off'; } catch (e) { return true; }
  }
  function set(on) {
    document.body.classList.toggle('ui-hub', !!on);
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) { /* modo privado */ }
    const cb = $('ui-hub-toggle');
    if (cb) cb.checked = !!on;
    if (!on) closeHub();
  }

  /* ------------------------------------------------------------------
     Leer los paneles originales
     ------------------------------------------------------------------ */
  const EMOJI_RE = /^[\p{Extended_Pictographic}\uFE0F\u200D]+/u;

  function collectModes() {
    const panels = Array.from(document.querySelectorAll('#main-menu .story-poster-panel'))
      .filter(p => !KEEP_IN_MENU.includes(p.id));
    return panels.map(p => {
      const txt = sel => { const e = p.querySelector(sel); return e ? String(e.textContent || '').trim() : ''; };
      const title = txt('.story-poster-title') || String(p.textContent || '').trim().slice(0, 40) || 'Modo';
      const img = p.querySelector('img');
      const fbEl = p.querySelector('.story-poster-frame > *:not(img)');
      const lead = (title.match(EMOJI_RE) || [''])[0];
      return {
        panel: p,
        title,
        sub: txt('.story-poster-subtitle'),
        cta: txt('.story-poster-cta') || '▶ Jugar',
        img: img ? (img.currentSrc || img.getAttribute('src') || '') : '',
        fallback: (fbEl && String(fbEl.textContent || '').trim()) || lead || '🎮'
      };
    });
  }

  /* ------------------------------------------------------------------
     Pantalla "Más modos"
     ------------------------------------------------------------------ */
  let screen = null, keyHandler = null;

  function ensureScreen() {
    if (screen) return screen;
    screen = document.createElement('div');
    screen.id = 'hub-screen';
    screen.setAttribute('role', 'dialog');
    screen.setAttribute('aria-label', 'Más modos de juego');
    screen.addEventListener('click', e => {
      const back = e.target.closest && e.target.closest('[data-hub="back"]');
      if (back) { closeHub(); return; }
      const card = e.target.closest && e.target.closest('[data-hub-i]');
      if (!card) return;
      const m = current[Number(card.dataset.hubI)];
      if (!m) return;
      closeHub();
      setTimeout(() => m.panel.click(), 40);     // el panel original abre su modo como siempre
    });
    document.body.appendChild(screen);
    return screen;
  }

  let current = [];

  function renderHub() {
    current = collectModes();
    const cards = current.map((m, i) => `
      <button class="hub-card" data-hub-i="${i}" title="${esc(m.title)}">
        <div class="hub-frame">${m.img
          ? `<img src="${esc(m.img)}" alt="${esc(m.title)}" data-fb="${esc(m.fallback)}">`
          : `<div class="hub-fb">${esc(m.fallback)}</div>`}</div>
        <span class="hub-card-title">${esc(m.title)}</span>
        <span class="hub-card-sub">${esc(m.sub)}</span>
        <span class="hub-cta">${esc(m.cta)}</span>
      </button>`).join('');
    screen.innerHTML = `
      <div class="hub-wrap">
        <div class="hub-top">
          <h2 class="hub-title">🎮 Más modos</h2>
          <button class="hub-back" data-hub="back">⬅ Volver al menú</button>
        </div>
        <p class="hub-sub">${current.length ? 'Elige un modo de juego.' : ''}</p>
        ${current.length ? `<div class="hub-grid">${cards}</div>` : '<div class="hub-empty">No hay más modos disponibles.</div>'}
      </div>`;
    // Si una portada no carga, se sustituye por su emoji.
    screen.querySelectorAll('img[data-fb]').forEach(img => {
      img.addEventListener('error', () => {
        const d = document.createElement('div');
        d.className = 'hub-fb';
        d.textContent = img.dataset.fb || '🎮';
        img.replaceWith(d);
      }, { once: true });
    });
  }

  function openHub() {
    ensureScreen();
    renderHub();
    screen.classList.add('open');
    screen.scrollTop = 0;
    keyHandler = e => { if (e.key === 'Escape') closeHub(); };
    document.addEventListener('keydown', keyHandler);
    const first = screen.querySelector('.hub-card');
    if (first && first.focus) first.focus();
  }

  function closeHub() {
    if (screen) screen.classList.remove('open');
    if (keyHandler) { document.removeEventListener('keydown', keyHandler); keyHandler = null; }
  }

  /* ------------------------------------------------------------------
     Botón en el menú y opción en Configuración
     ------------------------------------------------------------------ */
  function addMenuButton() {
    if ($('menu-modos')) return true;
    const card = document.querySelector('.main-menu-card');
    if (!card) return false;
    const btn = document.createElement('button');
    btn.id = 'menu-modos';
    btn.className = 'menu-btn';
    btn.innerHTML = '🎮 Más modos<small>Desafío, Torneo, Infierno, Amigos…</small>';
    btn.addEventListener('click', openHub);
    const anchor = $('menu-glossary');
    if (anchor) card.insertBefore(btn, anchor); else card.appendChild(btn);
    return true;
  }

  function addSettingsSwitch() {
    if ($('ui-hub-toggle')) return;
    const card = document.querySelector('#settings-modal .settings-card');
    if (!card) return;
    const sec = document.createElement('div');
    sec.className = 'settings-section';
    sec.innerHTML = '<h4>🎮 Menú principal</h4>' +
      '<label class="switch-row"><input id="ui-hub-toggle" type="checkbox">' +
      '<span>Agrupar los modos extra en «Más modos»</span></label>';
    const actions = card.querySelector('.settings-actions');
    if (actions) card.insertBefore(sec, actions); else card.appendChild(sec);
    const cb = $('ui-hub-toggle');
    cb.checked = document.body.classList.contains('ui-hub');
    cb.addEventListener('change', () => set(cb.checked));
  }

  /* La portada de Historia se copia como fondo desenfocado de su marco (CSS var --poster). */
  function setPoster() {
    const img = document.querySelector('#menu-story img');
    const fr = document.querySelector('#menu-story .story-poster-frame');
    if (img && fr && img.src) fr.style.setProperty('--poster', 'url("' + img.src.replace(/"/g, '%22') + '")');
  }

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  function init() {
    injectCSS();
    setPoster();
    set(read());
    if (!addMenuButton()) {
      let tries = 0;
      const t = setInterval(() => { if (addMenuButton() || ++tries > 20) clearInterval(t); }, 250);
    }
    addSettingsSwitch();
    window.addEventListener('load', () => { injectCSS(); setPoster(); addMenuButton(); addSettingsSwitch(); });
    console.log('[interfaz.js] "Más modos" ' + (read() ? 'activado' : 'desactivado (menú completo)'));
  }

  window.INTERFAZ = { open: openHub, close: closeHub, set, isOn: () => document.body.classList.contains('ui-hub') };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
