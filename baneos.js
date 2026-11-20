/* baneos.js
   Mejora visual y de accesibilidad de la FASE DE BANEOS.
     - Se ve de un vistazo de quién es el turno (color del jugador en la tarjeta, panel activo,
       barra de progreso 0/8 y el siguiente hueco marcado).
     - Cada baneo muestra el nombre del personaje (antes solo una miniatura con una X).
     - La selección pendiente se distingue por forma (✖ + contorno), no solo por color.
     - La barra de acciones queda fija abajo: ya no hay que bajar hasta el final para confirmar.
     - Teclado: las fichas son botones (Tab entra en la rejilla, flechas Inicio/Fin para moverse,
       Enter o Espacio para marcar), con foco visible. El foco y el scroll de la rejilla ya no se
       pierden al marcar un personaje.
     - Lectores de pantalla: turno, contador, registro y aviso de la IA se anuncian solos.
     - Respeta prefers-reduced-motion.

   No modifica game.js: la fase se repinta entera desde allí, así que se observan los contenedores
   y se decora lo nuevo. Todo el CSS va acotado a #ban-phase. Debe cargarse DESPUÉS de game.js
   y de rejilla.js.
*/
(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  /* ---------- estilos ---------- */
  function injectCSS() {
    if ($('bn-css')) return;
    const st = document.createElement('style');
    st.id = 'bn-css';
    st.textContent = `
      #ban-phase{--bn-p1:56,189,248; --bn-p2:244,114,182; --bn-pad:24px}

      @keyframes bnPulse{0%,100%{opacity:1; transform:scale(1)} 50%{opacity:.45; transform:scale(.8)}}
      @keyframes bnGlow{0%,100%{box-shadow:0 0 0 0 rgba(var(--tc),.45)} 50%{box-shadow:0 0 0 6px rgba(var(--tc),0)}}

      /* ----- tarjeta: el color del borde superior indica de quién es el turno ----- */
      #ban-phase .ban-card{padding:var(--bn-pad); border-color:rgba(248,113,113,.30);
        transition:border-color .3s ease, box-shadow .3s ease}
      #ban-phase[data-turn="p1"] .ban-card{border-color:rgba(var(--bn-p1),.50);
        box-shadow:inset 0 4px 0 rgba(var(--bn-p1),.95), var(--shadow)}
      #ban-phase[data-turn="p2"] .ban-card{border-color:rgba(var(--bn-p2),.50);
        box-shadow:inset 0 4px 0 rgba(var(--bn-p2),.95), var(--shadow)}
      #ban-phase[data-turn="done"] .ban-card{border-color:rgba(74,222,128,.50);
        box-shadow:inset 0 4px 0 rgba(74,222,128,.95), var(--shadow)}

      #ban-phase .ban-head h2{font-size:clamp(22px,2.8vw,32px); margin:0 0 8px}
      #ban-phase .ban-head #ban-turn-sub{font-size:14px; color:#c6d0df; line-height:1.5}
      #ban-phase .ban-p1{color:#7dd3fc}
      #ban-phase .ban-p2{color:#f9a8d4}

      /* aviso "la IA está eligiendo" */
      #ban-phase .ban-wait:not(:empty){display:inline-flex; align-items:center; gap:8px; padding:8px 14px;
        border-radius:999px; font-size:14px; color:#fde68a;
        background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.45)}

      /* ----- progreso ----- */
      .bn-progress{display:flex; gap:6px; margin:16px 0 4px}
      .bn-pip{flex:1; height:8px; border-radius:99px; background:rgba(148,163,184,.22)}
      .bn-pip.done[data-p="p1"]{background:rgb(var(--bn-p1,56,189,248))}
      .bn-pip.done[data-p="p2"]{background:rgb(var(--bn-p2,244,114,182))}
      .bn-pip.now{background:#fff; animation:bnPulse 1.4s ease-in-out infinite}

      /* ----- paneles de equipo ----- */
      #ban-phase .ban-teams{gap:16px; margin:14px 0 18px}
      #ban-phase .ban-teams > .ban-team:first-child{--tc:var(--bn-p1)}
      #ban-phase .ban-teams > .ban-team:last-child{--tc:var(--bn-p2)}
      #ban-phase .ban-team{padding:14px; border:2px solid rgba(255,255,255,.08); border-radius:16px;
        box-shadow:none !important; transition:border-color .25s ease, background .25s ease}
      #ban-phase .ban-team[data-active="true"]{border-color:rgba(var(--tc),.80);
        background:linear-gradient(180deg,rgba(var(--tc),.12),rgba(var(--tc),.02))}
      #ban-phase .ban-team > .small{display:flex; align-items:center; gap:8px; font-size:15px}
      #ban-phase .ban-team[data-active="true"] > .small::before{content:""; flex:none; width:10px; height:10px;
        border-radius:50%; background:rgb(var(--tc)); animation:bnPulse 1.4s ease-in-out infinite}
      .bn-count{margin-left:auto; padding:1px 9px; border-radius:999px; font-size:12px; font-weight:700;
        color:#e5e7eb; background:rgba(255,255,255,.08)}

      /* ----- huecos de baneo ----- */
      #ban-phase .ban-slots{display:grid; grid-template-columns:repeat(4,minmax(0,104px)); gap:10px;
        margin-top:12px; counter-reset:bnslot}
      #ban-phase .ban-slot{counter-increment:bnslot; width:auto; height:auto; aspect-ratio:1/1.12; min-width:0;
        flex-direction:column; justify-content:flex-start; border:2px solid rgba(148,163,184,.22);
        border-radius:14px; background:#071122}
      #ban-phase .ban-slot::before{content:counter(bnslot); position:absolute; left:7px; top:5px; z-index:2;
        font-size:11px; font-weight:700; color:#aab8cc}

      #ban-phase .ban-slot.empty{justify-content:center; border-style:dashed; border-color:rgba(148,163,184,.30)}
      #ban-phase .ban-slot.empty > *{display:none}
      #ban-phase .ban-slot.empty::before{position:static; font-size:26px; font-weight:700; color:#7b8aa3}

      #ban-phase .ban-slot.bn-next{border-style:dashed; border-color:rgb(var(--tc)); animation:bnGlow 1.8s ease-out infinite}
      #ban-phase .ban-slot.bn-next::before{color:rgb(var(--tc))}

      #ban-phase .ban-slot.used{padding-top:18px; border-color:rgba(248,113,113,.60);
        background:linear-gradient(180deg,rgba(248,113,113,.14),#071122)}
      #ban-phase .ban-slot.used img{width:62%; height:auto; aspect-ratio:1; object-fit:contain;
        filter:grayscale(.9) brightness(.65)}
      #ban-phase .ban-slot .ban-cross{inset:0 0 24px 0; font-size:42px; color:rgba(248,113,113,.95)}
      .bn-name{position:absolute; left:4px; right:4px; bottom:5px; font-size:11px; font-weight:700;
        color:#f1f5f9; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}

      #ban-phase .ban-slot.blank{justify-content:center; border-color:rgba(251,191,36,.55);
        background:rgba(251,191,36,.08); color:#fde68a; font-size:12px}
      #ban-phase .ban-slot.blank .small{color:#fde68a; font-size:12px}

      /* ----- buscador y filtros ----- */
      #ban-phase .search-row{min-height:46px; padding:6px 12px}
      #ban-phase .search-row:focus-within{border-color:var(--gold); box-shadow:0 0 0 3px rgba(251,191,36,.22)}
      #ban-phase .search-input{font-size:16px}
      #ban-phase .search-clear{width:32px; height:32px; font-size:13px}
      #ban-phase .search-count{font-size:13px; color:#aab8cc}
      #ban-phase .ban-filters{gap:8px}
      #ban-phase .ban-filters .class-btn{min-height:38px; padding:6px 13px; font-size:13px}
      #ban-phase .ban-filters .class-btn.active{border-color:#c4b5fd; background:rgba(139,92,246,.34);
        color:#fff; font-weight:700}
      #ban-phase .ban-filters .class-btn.active::before{content:"✓ "}

      /* ----- rejilla ----- */
      #ban-phase .ban-grid{min-height:220px; max-height:clamp(260px,46vh,520px); padding:12px; scroll-padding:12px}

      #ban-phase .char.pending-ban{transform:translateY(-3px);
        box-shadow:inset 0 0 0 2px #f87171, 0 0 0 3px rgba(248,113,113,.28), 0 12px 28px rgba(127,29,29,.35)}
      #ban-phase .char.pending-ban::after{content:"✖"; inset:8px auto auto 6px; width:24px; height:24px;
        display:grid; place-items:center; border-radius:50%; background:#ef4444; color:#fff;
        font-size:13px; font-weight:800; line-height:1; opacity:1}

      /* baneado: se atenúa el contenido, pero la etiqueta se mantiene nítida */
      #ban-phase .char.banned{opacity:1; filter:none; cursor:not-allowed;
        background-image:repeating-linear-gradient(135deg,transparent 0 9px,rgba(248,113,113,.10) 9px 18px)}
      #ban-phase .char.banned > :not(.ban-badge){opacity:.42; filter:grayscale(1)}
      #ban-phase .ban-badge{left:6px; top:8px; z-index:3; padding:3px 9px; border-radius:999px;
        font-size:12px; font-weight:800; background:#f87171; color:#1b0505}
      #ban-phase .char.banned:hover, #ban-phase .char.locked:hover{transform:none; box-shadow:none;
        border-color:rgba(148,163,184,.11)}
      #ban-phase .char.locked{opacity:.6}

      /* ----- barra de acciones fija ----- */
      #ban-phase .ban-actions{position:sticky; bottom:0; z-index:5; justify-content:space-between;
        margin:16px calc(var(--bn-pad) * -1) 0; padding:14px var(--bn-pad);
        background:rgba(7,14,28,.94); border-top:1px solid rgba(255,255,255,.10);
        -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px)}
      #ban-phase .ban-actions .class-btn{min-height:46px; padding:10px 18px; font-size:15px; font-weight:600;
        border-radius:12px}
      #ban-phase .ban-confirm{flex:1 1 260px; max-width:440px; margin-left:auto; color:#fff;
        border:1px solid #fca5a5; background:linear-gradient(180deg,#dc2626,#991b1b)}
      #ban-phase .ban-confirm:hover:not(:disabled){background:linear-gradient(180deg,#ef4444,#b91c1c);
        border-color:#fecaca}
      #ban-phase .ban-confirm:disabled{opacity:1; color:#94a3b8; border:1px dashed rgba(148,163,184,.45);
        background:rgba(255,255,255,.03)}
      #ban-phase #ban-blank:disabled{opacity:.5}

      /* ----- registro y ayuda ----- */
      #ban-phase .ban-log:empty{display:none}
      #ban-phase .ban-log{max-height:150px; font-size:13px; line-height:1.5; padding:6px}
      #ban-phase .ban-log-line{padding:6px 8px; border-bottom:1px solid rgba(255,255,255,.05)}
      #ban-phase .ban-log-line:first-child{background:rgba(255,255,255,.06); border-radius:8px; border-bottom-color:transparent}
      #ban-phase .ban-card > .small.muted{font-size:13px; color:#aab8cc}

      /* ----- foco visible ----- */
      #ban-phase .char:focus-visible,
      #ban-phase button:focus-visible{outline:3px solid var(--gold); outline-offset:2px}

      @media (max-width:760px){
        #ban-phase{padding:12px 8px; --bn-pad:14px}
        #ban-phase .ban-slots{grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px}
        #ban-phase .ban-grid{max-height:clamp(240px,42vh,420px)}
        #ban-phase .ban-actions .class-btn{flex:1 1 100%; max-width:none}
        #ban-phase .ban-confirm{order:-1}
      }

      @media (prefers-reduced-motion:reduce){
        #ban-phase *, #ban-phase *::before, #ban-phase *::after{animation:none !important; transition:none !important}
      }
    `;
    document.head.appendChild(st);
  }

  /* ---------- estado de turno, huecos y progreso ---------- */
  let progress = null;

  function ensureProgress(n) {
    if (progress && progress.children.length === n) return progress;
    if (progress) progress.remove();
    progress = document.createElement('div');
    progress.className = 'bn-progress';
    progress.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const pip = document.createElement('span');
      pip.className = 'bn-pip';
      pip.dataset.p = i % 2 === 0 ? 'p1' : 'p2';
      progress.appendChild(pip);
    }
    const head = document.querySelector('#ban-phase .ban-head');
    if (head) head.after(progress);
    return progress;
  }

  function sync() {
    const phase = $('ban-phase');
    const title = $('ban-turn-title');
    if (!phase || !title) return;

    const span = title.querySelector('.ban-p1, .ban-p2');
    const left = ['p1', 'p2'].some(p => {
      const c = $('ban-' + p + '-slots');
      return c && c.querySelector('.empty');
    });
    const turn = span ? (span.classList.contains('ban-p1') ? 'p1' : 'p2') : (left ? 'none' : 'done');
    phase.dataset.turn = turn;

    let total = 0, slotCount = 0;
    ['p1', 'p2'].forEach(p => {
      const cont = $('ban-' + p + '-slots');
      if (!cont) return;
      const slots = Array.from(cont.children);
      let used = 0, nextSet = false;
      slots.forEach(s => {
        const isUsed = s.classList.contains('used');
        const isBlank = s.classList.contains('blank');
        if (isUsed || isBlank) used++;
        if (isUsed && !s.querySelector('.bn-name')) {
          const name = document.createElement('span');
          name.className = 'bn-name';
          const img = s.querySelector('img');
          const label = s.title || (img && img.alt) || '';
          name.textContent = label;
          s.appendChild(name);
          const cross = s.querySelector('.ban-cross');
          if (cross) cross.setAttribute('aria-hidden', 'true');
          s.setAttribute('role', 'img');
          s.setAttribute('aria-label', label);
        }
        const isNext = turn === p && s.classList.contains('empty') && !nextSet;
        if (isNext) nextSet = true;
        s.classList.toggle('bn-next', isNext);
      });
      total += used;
      slotCount += slots.length;

      const team = cont.closest('.ban-team');
      if (team) {
        team.dataset.active = String(turn === p);
        const label = team.querySelector(':scope > .small');
        if (label) {
          let c = label.querySelector('.bn-count');
          if (!c) { c = document.createElement('span'); c.className = 'bn-count'; label.appendChild(c); }
          const txt = used + '/' + slots.length;
          if (c.textContent !== txt) c.textContent = txt;
        }
      }
    });

    if (slotCount) {
      const bar = ensureProgress(slotCount);
      Array.from(bar.children).forEach((pip, i) => {
        pip.classList.toggle('done', i < total);
        pip.classList.toggle('now', i === total && (turn === 'p1' || turn === 'p2'));
      });
    }
  }

  /* ---------- rejilla: teclado, foco y scroll ---------- */
  let pend = null;   // { top, name, until, focused }

  const nameOf = c => {
    const s = c.querySelector('strong');
    return s ? s.textContent.trim() : '';
  };

  function remember(card) {
    const grid = $('ban-grid');
    pend = { top: grid.scrollTop, name: card ? nameOf(card) : null, until: performance.now() + 250, focused: false };
  }

  function decorateGrid() {
    const grid = $('ban-grid');
    const cards = Array.from(grid.querySelectorAll('.char'));
    if (!cards.length) return;
    let rover = null;
    cards.forEach(c => {
      const off = c.classList.contains('banned') || c.classList.contains('locked');
      c.setAttribute('role', 'button');
      if (off) {
        c.setAttribute('aria-disabled', 'true');
        c.removeAttribute('aria-pressed');
      } else {
        c.removeAttribute('aria-disabled');
        c.setAttribute('aria-pressed', String(c.classList.contains('pending-ban')));
      }
      c.querySelectorAll('.ci-ico').forEach(i => i.setAttribute('aria-hidden', 'true'));
      if (!rover && c.classList.contains('pending-ban')) rover = c;
    });
    if (!rover) rover = cards.find(c => !c.hasAttribute('aria-disabled')) || cards[0];
    cards.forEach(c => { c.tabIndex = c === rover ? 0 : -1; });
  }

  function applyPending() {
    if (!pend) return;
    if (performance.now() > pend.until) { pend = null; return; }
    const grid = $('ban-grid');
    grid.scrollTop = pend.top;
    if (pend.name && !pend.focused) {
      const t = Array.from(grid.querySelectorAll('.char')).find(c => nameOf(c) === pend.name);
      if (t) {
        Array.from(grid.querySelectorAll('.char')).forEach(c => { c.tabIndex = c === t ? 0 : -1; });
        t.focus({ preventScroll: true });
        pend.focused = true;
      }
    }
  }

  function vertical(cards, i, dir) {
    const cur = cards[i], top = cur.offsetTop, left = cur.offsetLeft;
    let rowTop = null, best = -1, bestD = Infinity;
    for (let k = i + dir; k >= 0 && k < cards.length; k += dir) {
      const t = cards[k].offsetTop;
      if (Math.abs(t - top) < 4) continue;
      if (rowTop === null) rowTop = t;
      if (Math.abs(t - rowTop) >= 4) break;
      const d = Math.abs(cards[k].offsetLeft - left);
      if (d < bestD) { bestD = d; best = k; }
    }
    return best === -1 ? i : best;
  }

  function wireGrid() {
    const grid = $('ban-grid');
    grid.setAttribute('role', 'group');

    // el clic de ratón (o el Enter) repinta la rejilla entera: guardamos scroll y foco antes
    grid.addEventListener('click', e => {
      const card = e.target.closest('.char');
      if (card) remember(card);
    }, true);

    grid.addEventListener('keydown', e => {
      const card = e.target.closest('.char');
      if (!card) return;
      const cards = Array.from(grid.querySelectorAll('.char'));
      const i = cards.indexOf(card);
      let j = null;
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!card.hasAttribute('aria-disabled')) card.click();
          return;
        case 'ArrowRight': j = i + 1; break;
        case 'ArrowLeft':  j = i - 1; break;
        case 'ArrowDown':  j = vertical(cards, i, 1); break;
        case 'ArrowUp':    j = vertical(cards, i, -1); break;
        case 'Home':       j = 0; break;
        case 'End':        j = cards.length - 1; break;
        default: return;
      }
      e.preventDefault();
      if (j >= 0 && j < cards.length) cards[j].focus();
    });

    grid.addEventListener('focusin', e => {
      const card = e.target.closest('.char');
      if (!card) return;
      grid.querySelectorAll('.char').forEach(c => { c.tabIndex = c === card ? 0 : -1; });
    });

    new MutationObserver(() => { decorateGrid(); applyPending(); })
      .observe(grid, { childList: true, subtree: true });
    decorateGrid();
  }

  /* ---------- filtros, buscador y avisos para lectores de pantalla ---------- */
  function syncFilters() {
    const cont = $('ban-filters');
    if (!cont) return;
    cont.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.classList.contains('active'))));
  }

  function wireA11y() {
    const search = $('ban-search'), clear = $('ban-clear');
    if (search && !search.getAttribute('aria-label')) search.setAttribute('aria-label', search.placeholder || 'Buscar');
    if (clear && !clear.getAttribute('aria-label')) clear.setAttribute('aria-label', clear.title || 'Limpiar');

    const title = $('ban-turn-title');
    if (title && title.parentNode) title.parentNode.setAttribute('aria-live', 'polite');
    const wait = $('ban-wait');
    if (wait) wait.setAttribute('role', 'status');
    const count = $('ban-count');
    if (count) count.setAttribute('role', 'status');
    const log = $('ban-log');
    if (log) log.setAttribute('role', 'log');
    const confirm = $('ban-confirm');
    if (confirm) { confirm.setAttribute('aria-live', 'polite'); confirm.setAttribute('aria-atomic', 'true'); }

    // al confirmar o gastar un baneo en blanco se repinta la rejilla: conservamos el scroll
    ['ban-confirm', 'ban-blank'].forEach(id => {
      const b = $(id);
      if (b) b.addEventListener('click', () => remember(null), true);
    });

    const filters = $('ban-filters');
    if (filters) {
      new MutationObserver(syncFilters).observe(filters, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      syncFilters();
    }
  }

  /* ---------- arranque ---------- */
  function init() {
    const phase = $('ban-phase');
    if (!phase || !$('ban-grid')) { console.warn('[baneos.js] no se encontró la fase de baneos'); return; }

    injectCSS();
    wireA11y();
    wireGrid();

    const obs = new MutationObserver(sync);
    [$('ban-turn-title'), $('ban-p1-slots'), $('ban-p2-slots')].forEach(el => {
      if (el) obs.observe(el, { childList: true, subtree: true });
    });
    sync();
    console.log('[baneos.js] fase de baneos mejorada (estilo + accesibilidad)');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
