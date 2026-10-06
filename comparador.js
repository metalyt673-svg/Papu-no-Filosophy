/* comparador.js
   Comparador del Glosario: elige dos personajes y míralos lado a lado
   (stats con barras, resumen de habilidades y las 4 habilidades alineadas).

   Cómo se usa:
     - En el Glosario pulsa "⚖️ Comparar personajes", haz clic en dos personajes
       y pulsa "Comparar". También hay un botón "Comparar con otro personaje"
       dentro de la ficha de cada personaje.

   No modifica game.js: envuelve openGlossary / renderGlossaryGrid /
   openCharacterDetail y reutiliza findBaseById, getGlossaryCandidates y
   glossaryMoveTypeLabel. Debe cargarse DESPUÉS de game.js.
*/
(function () {
  'use strict';

  const STATS = [['hp', 'HP'], ['atk', 'ATK'], ['def', 'DEF'], ['spd', 'SPD']];
  let on = false;          // modo comparar activo
  let sel = [];            // ids elegidos (máx. 2)
  let maxCache = null;

  const $ = id => document.getElementById(id);

  /* ---------- estilos ---------- */
  function injectCSS() {
    if ($('cmp-css')) return;
    const st = document.createElement('style');
    st.id = 'cmp-css';
    st.textContent = `
      .cmp-head-actions{display:flex; gap:8px; flex-wrap:wrap}
      #cmp-toggle.active{border-color:rgba(167,139,250,.7); background:rgba(139,92,246,.2)}
      .cmp-tray{display:none; align-items:center; gap:10px; flex-wrap:wrap; margin:10px 0 12px;
        padding:10px 12px; border:1px dashed rgba(167,139,250,.4); border-radius:14px;
        background:rgba(139,92,246,.06)}
      .cmp-tray.show{display:flex}
      .cmp-hint{flex-basis:100%; font-size:11px; color:#91a1b7}
      .cmp-slot{display:flex; align-items:center; gap:8px; min-width:150px; padding:6px 10px;
        border:1px solid rgba(148,163,184,.18); border-radius:12px; background:rgba(255,255,255,.03);
        font-size:12px; color:#91a1b7}
      .cmp-slot.filled{color:#f1f5f9; border-color:rgba(167,139,250,.5)}
      .cmp-slot img{width:34px; height:34px; object-fit:contain}
      .cmp-slot .cmp-x{margin-left:auto; border:0; background:transparent; color:#aab8cc; cursor:pointer; font-size:13px}
      .cmp-vs{font-weight:800; color:#a78bfa}
      #glossary-grid .char.cmp-selected{border-color:rgba(167,139,250,.85);
        box-shadow:0 0 0 2px rgba(139,92,246,.35),0 10px 26px rgba(76,29,149,.3)}
      #glossary-grid .char.cmp-selected::before{content:attr(data-cmp); position:absolute; top:6px; left:8px;
        width:22px; height:22px; line-height:22px; border-radius:50%; background:#8b5cf6; color:#fff;
        font-weight:800; font-size:12px; z-index:2}
      .cmp-card{position:relative; width:min(1000px,100%); max-height:min(90vh,860px)}
      .cmp-top{display:grid; grid-template-columns:1fr 54px 1fr; align-items:center; margin-bottom:14px}
      .cmp-who{text-align:center}
      .cmp-who img{width:110px; height:110px; object-fit:contain; border-radius:16px;
        background:radial-gradient(circle at 50% 0%,rgba(139,92,246,.18),transparent 60%),rgba(255,255,255,.03);
        filter:drop-shadow(0 12px 18px rgba(0,0,0,.35))}
      .cmp-who h3{margin:6px 0 2px; font-size:20px}
      .cmp-who .cmp-cls{color:#8998ae; font-size:12px}
      .cmp-actions{display:flex; gap:8px; justify-content:center; margin-bottom:12px; flex-wrap:wrap}
      .cmp-sec{margin:16px 0 8px; font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:#9db0cc}
      .cmp-row{display:grid; grid-template-columns:1fr 84px 1fr; align-items:stretch; margin-bottom:5px}
      .cmp-lab{display:flex; align-items:center; justify-content:center; text-align:center; font-size:10px;
        letter-spacing:.05em; text-transform:uppercase; color:#7d8ca4; padding:0 4px}
      .cmp-val{position:relative; padding:7px 10px 10px; border:1px solid rgba(148,163,184,.12);
        background:rgba(255,255,255,.025); font-size:15px; font-weight:700; overflow:hidden}
      .cmp-val.left{text-align:right; border-radius:12px 0 0 12px}
      .cmp-val.right{text-align:left; border-radius:0 12px 12px 0}
      .cmp-val .cmp-diff{font-size:11px; font-weight:700; color:#86efac; margin:0 6px}
      .cmp-val.win{background:rgba(34,197,94,.10); border-color:rgba(34,197,94,.38)}
      .cmp-val.lose{opacity:.78}
      .cmp-val .cmp-bar{position:absolute; bottom:0; height:4px; background:linear-gradient(90deg,#38bdf8,#8b5cf6)}
      .cmp-val.left .cmp-bar{right:0; border-radius:4px 0 0 0}
      .cmp-val.right .cmp-bar{left:0; border-radius:0 4px 0 0}
      .cmp-val.win .cmp-bar{background:linear-gradient(90deg,#22c55e,#4ade80)}
      .cmp-moves{display:grid; grid-template-columns:1fr 1fr; gap:8px}
      .cmp-moves .glossary-move{margin-bottom:0}
      .cmp-moves .cmp-empty{border:1px dashed rgba(148,163,184,.15); border-radius:13px}
      @media (max-width:640px){
        .cmp-top{grid-template-columns:1fr 34px 1fr}
        .cmp-who img{width:76px; height:76px}
        .cmp-who h3{font-size:15px}
        .cmp-row{grid-template-columns:1fr 54px 1fr}
        .cmp-val{font-size:13px; padding:6px 6px 9px}
        .cmp-val .cmp-diff{display:block; margin:0}
        .cmp-moves .glossary-move{padding:8px}
        .cmp-moves .glossary-move-desc{font-size:11px}
      }
    `;
    document.head.appendChild(st);
  }

  /* ---------- cálculo ---------- */
  function statMax() {
    if (maxCache) return maxCache;
    const m = { hp: 1, atk: 1, def: 1, spd: 1, total: 1 };
    (CHARACTERS || []).forEach(c => {
      let t = 0;
      STATS.forEach(([k]) => { const v = Number(c[k]) || 0; t += v; if (v > m[k]) m[k] = v; });
      if (t > m.total) m.total = t;
    });
    return (maxCache = m);
  }

  function summarize(ch) {
    const mv = ch.moves || [];
    const n = mv.length || 1;
    const powers = mv.map(m => Number(m.power) || 0);
    return {
      total: STATS.reduce((s, [k]) => s + (Number(ch[k]) || 0), 0),
      maxPower: Math.max(0, ...powers),
      sumPower: powers.reduce((a, b) => a + b, 0),
      attacks: mv.filter(m => glossaryMoveTypeLabel(m).text === 'Ataque').length,
      supports: mv.filter(m => glossaryMoveTypeLabel(m).text === 'Apoyo').length,
      aoe: mv.filter(m => m.aoe).length,
      acc: Math.round(mv.reduce((s, m) => s + (m.acc ?? 1), 0) / n * 100),
      cd: Math.round(mv.reduce((s, m) => s + (Number(m.baseCooldown) || 0), 0) / n * 10) / 10
    };
  }

  /* dir: 1 = mayor es mejor, -1 = menor es mejor, 0 = neutro (solo informativo) */
  function row(label, a, b, dir, maxV, suffix) {
    const A = Number(a) || 0, B = Number(b) || 0;
    const sfx = suffix || '';
    let ca = '', cb = '', da = '', db = '';
    if (dir !== 0 && A !== B) {
      const aWins = dir > 0 ? A > B : A < B;
      const d = Math.round(Math.abs(A - B) * 10) / 10;
      const tag = `<span class="cmp-diff">${dir > 0 ? '+' : '−'}${d}${sfx}</span>`;
      ca = aWins ? ' win' : ' lose'; cb = aWins ? ' lose' : ' win';
      if (aWins) da = tag; else db = tag;
    }
    const bar = v => maxV ? `<i class="cmp-bar" style="width:${Math.min(100, v / maxV * 100)}%"></i>` : '';
    return `<div class="cmp-row">
      <div class="cmp-val left${ca}">${da}${A}${sfx}${bar(A)}</div>
      <div class="cmp-lab">${label}</div>
      <div class="cmp-val right${cb}">${bar(B)}${B}${sfx}${db}</div>
    </div>`;
  }

  function moveCard(m) {
    if (!m) return '<div class="glossary-move cmp-empty"></div>';
    const t = glossaryMoveTypeLabel(m);
    const cd = m.baseCooldown > 0 ? `CD: ${m.baseCooldown}` : 'Sin cooldown';
    const pw = m.power > 0 ? `Poder: ${m.power}` : 'Sin daño directo';
    const ac = `Precisión: ${Math.round((m.acc ?? 1) * 100)}%`;
    return `<div class="glossary-move">
      <div class="glossary-move-top"><span class="move-name ${t.cls}">${m.name}</span><span class="small">${t.text}${m.aoe ? ' · Área' : ''}</span></div>
      <div class="glossary-move-meta">${pw} · ${ac} · ${cd}</div>
      <div class="glossary-move-desc">${m.desc || ''}</div>
    </div>`;
  }

  function buildCompareHTML(a, b) {
    const mx = statMax();
    const sa = summarize(a), sb = summarize(b);
    const who = c => `<div class="cmp-who"><img src="${c.img}" alt=""><h3>${c.name}</h3>
      <div class="cmp-cls">${(c.classes || []).join(' · ')}</div></div>`;

    let h = `<div class="cmp-top">${who(a)}<div class="cmp-vs" style="text-align:center">VS</div>${who(b)}</div>
      <div class="cmp-actions">
        <button class="class-btn" id="cmp-swap">🔄 Intercambiar lados</button>
        <button class="class-btn" id="cmp-back">✏️ Cambiar elección</button>
      </div>
      <div class="cmp-sec">Estadísticas</div>`;
    STATS.forEach(([k, lab]) => { h += row(lab, a[k], b[k], 1, mx[k]); });
    h += row('Total', sa.total, sb.total, 1, mx.total);

    h += '<div class="cmp-sec">Resumen de habilidades</div>';
    h += row('Poder máx.', sa.maxPower, sb.maxPower, 1);
    h += row('Poder total', sa.sumPower, sb.sumPower, 1);
    h += row('Precisión media', sa.acc, sb.acc, 1, 0, '%');
    h += row('Cooldown medio', sa.cd, sb.cd, -1);
    h += row('Ataques', sa.attacks, sb.attacks, 0);
    h += row('Apoyo', sa.supports, sb.supports, 0);
    h += row('De área', sa.aoe, sb.aoe, 0);

    h += '<div class="cmp-sec">Habilidades</div><div class="cmp-moves">';
    const n = Math.max((a.moves || []).length, (b.moves || []).length);
    for (let i = 0; i < n; i++) h += moveCard((a.moves || [])[i]) + moveCard((b.moves || [])[i]);
    h += '</div>';
    return h;
  }

  /* ---------- interfaz ---------- */
  function renderTray() {
    const tray = $('cmp-tray'), tog = $('cmp-toggle');
    if (!tray || !tog) return;
    tog.classList.toggle('active', on);
    tog.textContent = on ? '✖ Salir de comparación' : '⚖️ Comparar personajes';
    tray.classList.toggle('show', on);
    if (!on) return;

    const slot = i => {
      const c = sel[i] ? findBaseById(sel[i]) : null;
      return c
        ? `<div class="cmp-slot filled"><img src="${c.img}" alt=""><strong>${c.name}</strong>
             <button class="cmp-x" data-i="${i}" title="Quitar">✕</button></div>`
        : `<div class="cmp-slot">Elige el personaje ${i + 1}</div>`;
    };
    tray.innerHTML = `${slot(0)}<span class="cmp-vs">VS</span>${slot(1)}
      <button class="class-btn" id="cmp-go" ${sel.length === 2 ? '' : 'disabled'}>⚖️ Comparar</button>
      <button class="class-btn" id="cmp-clear" ${sel.length ? '' : 'disabled'}>Limpiar</button>
      <div class="cmp-hint">Haz clic en dos personajes de la lista para compararlos.</div>`;
  }

  function markCards() {
    const grid = $('glossary-grid');
    if (!grid) return;
    const chars = getGlossaryCandidates();
    const cards = grid.querySelectorAll('.char');
    if (cards.length !== chars.length) return;      // lista vacía / "sin resultados"
    cards.forEach((el, i) => {
      const k = sel.indexOf(chars[i].id);
      el.classList.toggle('cmp-selected', on && k >= 0);
      if (on && k >= 0) el.setAttribute('data-cmp', String(k + 1)); else el.removeAttribute('data-cmp');
    });
  }

  function refresh() { renderTray(); markCards(); }

  function setMode(v) {
    on = !!v;
    if (!on) sel = [];
    refresh();
  }

  function pick(id) {
    const i = sel.indexOf(id);
    if (i >= 0) sel.splice(i, 1);
    else { sel.push(id); if (sel.length > 2) sel.shift(); }     // el más antiguo sale
    refresh();
  }

  function openCompare() {
    if (sel.length !== 2) return;
    const a = findBaseById(sel[0]), b = findBaseById(sel[1]);
    if (!a || !b) return;
    $('cmp-body').innerHTML = buildCompareHTML(a, b);
    $('cmp-modal').style.display = 'flex';
    $('cmp-swap').onclick = () => { sel.reverse(); refresh(); openCompare(); };
    $('cmp-back').onclick = closeCompare;
  }

  function closeCompare() { $('cmp-modal').style.display = 'none'; }

  function build() {
    const head = document.querySelector('#glossary-screen .glossary-head');
    const back = $('glossary-back');
    const grid = $('glossary-grid');
    if (!head || !back || !grid) return false;

    // Botón de modo comparar junto a "Volver al menú"
    const wrap = document.createElement('div');
    wrap.className = 'cmp-head-actions';
    back.parentNode.insertBefore(wrap, back);
    const tog = document.createElement('button');
    tog.id = 'cmp-toggle'; tog.className = 'class-btn'; tog.textContent = '⚖️ Comparar personajes';
    tog.onclick = () => setMode(!on);
    wrap.appendChild(tog);
    wrap.appendChild(back);

    // Bandeja con los dos huecos
    const tray = document.createElement('div');
    tray.id = 'cmp-tray'; tray.className = 'cmp-tray';
    grid.parentNode.insertBefore(tray, grid);
    tray.addEventListener('click', e => {
      const x = e.target.closest('.cmp-x');
      if (x) { sel.splice(Number(x.dataset.i), 1); refresh(); return; }
      if (e.target.id === 'cmp-go') openCompare();
      if (e.target.id === 'cmp-clear') { sel = []; refresh(); }
    });

    // Ventana de comparación
    const modal = document.createElement('div');
    modal.id = 'cmp-modal'; modal.className = 'modal'; modal.style.display = 'none';
    modal.innerHTML = `<div class="modal-card cmp-card">
      <button id="cmp-close" class="glossary-detail-close" title="Cerrar">✕</button>
      <div id="cmp-body"></div></div>`;
    document.body.appendChild(modal);
    $('cmp-close').onclick = closeCompare;
    modal.addEventListener('click', e => { if (e.target === modal) closeCompare(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeCompare();
    });
    return true;
  }

  /* ---------- enganche con el glosario existente ---------- */
  function hook() {
    const _open = window.openGlossary;
    window.openGlossary = function () {
      const r = _open.apply(this, arguments);
      setMode(false);                                  // siempre empieza en modo normal
      return r;
    };

    const _grid = window.renderGlossaryGrid;
    window.renderGlossaryGrid = function () {
      const r = _grid.apply(this, arguments);
      markCards();
      return r;
    };

    const _detail = window.openCharacterDetail;
    window.openCharacterDetail = function (id) {
      if (on) { pick(id); return; }                    // en modo comparar, el clic elige
      const r = _detail.apply(this, arguments);
      const body = $('glossary-detail-body');
      if (body) {
        const btn = document.createElement('button');
        btn.className = 'class-btn';
        btn.style.marginTop = '10px';
        btn.textContent = '⚖️ Comparar con otro personaje';
        btn.onclick = () => {
          closeCharacterDetail();
          on = true; sel = [id];
          refresh();
        };
        body.appendChild(btn);
      }
      return r;
    };
  }

  function init() {
    if (typeof openGlossary !== 'function' || typeof renderGlossaryGrid !== 'function' ||
        typeof openCharacterDetail !== 'function' || !$('glossary-grid')) {
      console.warn('[comparador.js] no se encontró el glosario; comparador desactivado');
      return;
    }
    injectCSS();
    if (!build()) return;
    hook();
    renderTray();
    console.log('[comparador.js] comparador de personajes activo');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
