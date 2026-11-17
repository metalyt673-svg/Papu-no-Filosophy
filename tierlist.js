/* tierlist.js
   Modo «Tier list» con todos los face icons.

   - Una tier list por categoría (carpetas de "face icons") + una GENERAL con todos los iconos.
   - Arrastra los iconos (ratón) o toca un icono y luego una fila (móvil) para clasificarlos.
   - Filas editables: renombrar, cambiar color, subir/bajar, añadir y quitar.
   - Se guarda sola en el navegador (localStorage).
   - Extraer: imagen PNG o JPG, texto copiable y archivo JSON (guardar / cargar).
   - «Cargar carpeta»: lee tu carpeta "face icons" real (útil si faltan iconos o para exportar
     el PNG cuando abres el juego con doble clic, ya que el navegador bloquea exportar imágenes locales).

   Los iconos se buscan en:  face icons/<categoría>/<nombre>.png   (junto a juego.html)
   Si añades iconos nuevos, añade su nombre (sin .png) a la lista de su carpeta en FOLDER_FILES.
   Debe cargarse antes de interfaz.js (para que el panel entre en «Más modos»).
*/
(function () {
  'use strict';

  const BASE = 'face icons';
  const STORE_KEY = 'tierlist-v1';
  const COVER = 'personajes/tierlist.jpg';          // portada del panel (opcional; si no existe sale un 🏆)

  /* ---------- iconos por carpeta (sin .png) ---------- */
  const FOLDER_FILES = {
    atacante: ['chansin', 'cici', 'crazy dave', 'crusader', 'fernando alonso', 'gojo', 'griffith', 'ibuki', 'karin',
      'maka monster ai', 'matador', 'naruto', 'nekomata', 'otori', 'owari', 'papyrus', 'paya', 'soukaku', 'trump', 'yoruichi'],
    control: ['ai hoshino', 'albedo', 'belerick', 'buhu', 'calvencio', 'epstein', 'holograma', 'joan', 'kirara', 'l',
      'maka monster', 'negro', 'nekomata', 'nicktula', 'orochigirl', 'paya', 'renner', 'riruka', 'simons', 'wooper', 'zora'],
    debilitador: ['chel', 'david', 'emily', 'epstein', 'gojo', 'joan', 'kirara', 'nihilux', 'orochigirl', 'pancha peluda',
      'renner', 'ricky edit', 'shiori', 'zora'],
    defensor: ['albedo', 'belerick', 'cantonio', 'castorice', 'crusader', 'johnson', 'noelle', 'owari', 'shrek'],
    mago: ['aqua', 'brazilian miku', 'calvencio', 'emily', 'grey', 'holograma', 'implacable', 'nicktula', 'simons', 'urahara'],
    sanador: ['aqua', 'atlantis', 'charmy', 'estes', 'floryn', 'gorila village', 'hatsune miku', 'hibiscus', 'horror', 'izumi',
      'lopez', 'maka monster', 'mimosa', 'minion', 'negro', 'nelliel', 'padrinos', 'pancha peluda', 'spanish miku',
      'trumpeter', 'unohana', 'vermeil'],
    soporte: ['ai hoshino', 'albedo', 'aqua', 'belerick', 'brazilian miku', 'buhu', 'calvencio', 'cantonio', 'castorice',
      'chansin', 'charmy', 'chel', 'cici', 'clarence', 'crazy dave', 'crusader', 'david', 'emily', 'epstein', 'estes',
      'fernando alonso', 'floryn', 'gojo', 'gorila village', 'grey', 'griffith', 'hatsune miku', 'hibiscus', 'holograma',
      'ibuki', 'implacable', 'joan', 'johnson', 'karin', 'kirara', 'l', 'lady bug', 'lopez', 'maka monster ai',
      'maka monster', 'matador', 'mimosa', 'minion', 'naruto', 'negro', 'nekomata', 'nicktula', 'nihilux', 'nobita',
      'noelle', 'orochigirl', 'otori', 'owari', 'pancha peluda', 'papyrus', 'paya', 'renner', 'ricky edit', 'riruka',
      'shiori', 'shrek', 'simons', 'soukaku', 'spanish miku', 'trump', 'urahara', 'wooper', 'yoruichi', 'zora']
  };

  const CAT_ORDER = ['general', 'atacante', 'control', 'debilitador', 'defensor', 'mago', 'sanador', 'soporte'];
  const CAT_LABEL = {
    general: 'General', atacante: 'Atacante', control: 'Control', debilitador: 'Debilitador',
    defensor: 'Defensor', mago: 'Mago', sanador: 'Sanador', soporte: 'Soporte'
  };

  const DEFAULT_TIERS = [
    ['S', '#ff7f7f'], ['A', '#ffbf7f'], ['B', '#ffdf7f'], ['C', '#ffff7f'], ['D', '#bfff7f'], ['F', '#7fbfff']
  ];

  /* ---------- utilidades ---------- */
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 't' + Math.random().toString(36).slice(2, 9);
  const catLabel = c => CAT_LABEL[c] || (c.charAt(0).toUpperCase() + c.slice(1));
  function lum(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 0;
    const n = parseInt(m[1], 16);
    return 0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255);
  }

  /* ---------- datos de iconos ---------- */
  let FOLDERS = {};            // categoría -> [{ name, src }]
  let objectUrls = [];         // URLs de «Cargar carpeta» (para liberarlas)

  function buildGeneral(folders) {
    const seen = new Map();
    Object.keys(folders).forEach(cat => {
      folders[cat].forEach(it => { if (!seen.has(it.name)) seen.set(it.name, it); });
    });
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  function buildDefaultFolders() {
    const f = {};
    Object.keys(FOLDER_FILES).forEach(cat => {
      f[cat] = FOLDER_FILES[cat].map(name => ({ name, src: encodeURI(BASE + '/' + cat + '/' + name + '.png') }));
    });
    f.general = buildGeneral(f);
    return f;
  }

  function orderedCats() {
    const keys = Object.keys(FOLDERS);
    const known = CAT_ORDER.filter(c => keys.includes(c));
    const extra = keys.filter(c => !CAT_ORDER.includes(c)).sort();
    return known.concat(extra);
  }
  const catItems = cat => FOLDERS[cat] || [];

  /* ---------- estado y guardado ---------- */
  let S = { tab: 'general', size: 64, cats: {} };
  let sel = null;                       // icono seleccionado (modo toque)

  function defaultTiers() {
    return DEFAULT_TIERS.map(([label, color]) => ({ id: uid(), label, color, items: [] }));
  }
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (raw && typeof raw === 'object') {
        S.tab = typeof raw.tab === 'string' ? raw.tab : 'general';
        S.size = Math.min(110, Math.max(40, Number(raw.size) || 64));
        S.cats = raw.cats && typeof raw.cats === 'object' ? raw.cats : {};
      }
    } catch (e) { /* ignorar */ }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* modo privado */ }
  }
  function ensureCat(cat) {
    let c = S.cats[cat];
    if (!c || !Array.isArray(c.tiers) || !c.tiers.length) c = S.cats[cat] = { tiers: defaultTiers() };
    c.tiers.forEach(t => {
      if (!t.id) t.id = uid();
      if (!Array.isArray(t.items)) t.items = [];
      if (typeof t.label !== 'string') t.label = '?';
      if (!/^#[0-9a-f]{6}$/i.test(t.color || '')) t.color = '#a78bfa';
    });
    return c;
  }

  function placedSet(cat) {
    const set = new Set();
    ensureCat(cat).tiers.forEach(t => t.items.forEach(n => set.add(n)));
    return set;
  }

  function moveItem(name, zone, beforeName) {
    const c = ensureCat(S.tab);
    c.tiers.forEach(t => { t.items = t.items.filter(n => n !== name); });
    if (zone === 'pool') return;
    const tier = c.tiers.find(t => t.id === zone);
    if (!tier) return;
    let idx = beforeName ? tier.items.indexOf(beforeName) : -1;
    if (idx < 0) idx = tier.items.length;
    tier.items.splice(idx, 0, name);
  }

  /* ---------- estilos ---------- */
  function injectCSS() {
    if ($('tl-css')) return;
    const st = document.createElement('style');
    st.id = 'tl-css';
    st.textContent = `
      #tl-screen{position:fixed;inset:0;display:none;overflow:auto;z-index:124;color:#e5edf8;
        padding:16px 14px 40px;box-sizing:border-box;
        background:radial-gradient(circle at 12% 0%,rgba(251,191,36,.12),transparent 38%),
                   radial-gradient(circle at 88% 6%,rgba(167,139,250,.16),transparent 38%),
                   linear-gradient(180deg,#040712 0%,#0a1124 100%)}
      #tl-screen *{box-sizing:border-box}
      .tl-card{width:min(1180px,100%);margin:0 auto;display:flex;flex-direction:column;gap:12px}
      .tl-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
      .tl-head h2{margin:0;font-size:24px;flex:1 1 auto}
      .tl-btn{padding:8px 13px;border-radius:11px;cursor:pointer;font:inherit;font-weight:700;font-size:13px;color:#e5edf8;
        border:1px solid rgba(148,163,184,.3);background:rgba(255,255,255,.05);transition:border-color .12s,background .12s}
      .tl-btn:hover{border-color:rgba(251,191,36,.7);background:rgba(251,191,36,.12)}
      .tl-btn.prim{color:#1a1204;border-color:transparent;background:linear-gradient(180deg,rgba(251,191,36,.95),rgba(217,119,6,.9))}
      .tl-tabs,.tl-tools{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
      .tl-tab{padding:7px 13px;border-radius:99px;cursor:pointer;font:inherit;font-weight:700;font-size:13px;color:#cbd5e1;
        border:1px solid rgba(148,163,184,.25);background:rgba(255,255,255,.03)}
      .tl-tab small{opacity:.65;font-weight:600;margin-left:4px}
      .tl-tab.on{color:#1a1204;border-color:transparent;background:linear-gradient(180deg,rgba(251,191,36,.95),rgba(217,119,6,.9))}
      .tl-size{display:flex;align-items:center;gap:6px;font-size:12px;color:#aab8cc;margin-left:auto}
      .tl-size input{width:110px}
      .tl-hint{font-size:12px;color:#91a1b7;line-height:1.45}
      .tl-board{display:flex;flex-direction:column;gap:6px;--tl-s:64px}
      .tl-row{display:flex;border-radius:12px;overflow:hidden;border:1px solid rgba(148,163,184,.18);background:#0d1628}
      .tl-label{flex:0 0 112px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:8px 6px;position:relative}
      .tl-lbl{min-width:30px;max-width:100%;text-align:center;font-weight:900;font-size:22px;line-height:1.15;outline:none;
        word-break:break-word;cursor:text;border-radius:6px;padding:0 4px}
      .tl-lbl:focus{background:rgba(255,255,255,.35)}
      .tl-rc{display:flex;gap:3px;align-items:center}
      .tl-rc button,.tl-rc input{width:22px;height:22px;padding:0;border:0;border-radius:6px;cursor:pointer;font-size:11px;
        font-weight:800;background:rgba(0,0,0,.28);color:#fff}
      .tl-rc input{background:transparent;border:1px solid rgba(0,0,0,.35);padding:1px}
      .tl-rc button:hover{background:rgba(0,0,0,.5)}
      .tl-items,.tl-pool{display:flex;flex-wrap:wrap;gap:6px;padding:8px;align-content:flex-start;min-height:calc(var(--tl-s) + 16px)}
      .tl-items{flex:1 1 auto;min-width:0}
      .tl-pool{border-radius:12px;border:1px dashed rgba(148,163,184,.3);background:rgba(255,255,255,.025)}
      .tl-ic{width:var(--tl-s);height:var(--tl-s);flex:0 0 auto;border-radius:50%;cursor:grab;position:relative;user-select:none;
        -webkit-user-select:none;background:#16213a;display:flex;align-items:center;justify-content:center;overflow:hidden;
        border:2px solid transparent;transition:transform .1s,border-color .1s}
      .tl-ic:hover{transform:scale(1.08);z-index:2}
      .tl-ic img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;-webkit-user-drag:none}
      .tl-ic .tl-fb{font-weight:800;font-size:calc(var(--tl-s) * .36);color:#cbd5e1;pointer-events:none}
      .tl-ic.sel{border-color:#fbbf24;box-shadow:0 0 0 3px rgba(251,191,36,.35)}
      .tl-ic.drag-src{opacity:.28}
      .tl-ic.drop-before{box-shadow:-4px 0 0 0 #a78bfa}
      .tl-over{background:rgba(167,139,250,.14)!important;outline:2px dashed rgba(167,139,250,.7);outline-offset:-3px}
      .tl-ghost{position:fixed;z-index:9999;pointer-events:none;opacity:.92;transform:translate(-50%,-50%) scale(1.1);
        box-shadow:0 10px 26px rgba(0,0,0,.55)}
      .tl-pooltitle{font-weight:800;font-size:14px;margin:4px 0 0}
      .tl-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:10000;padding:10px 16px;border-radius:12px;
        background:rgba(8,14,28,.97);border:1px solid rgba(251,191,36,.5);color:#fde68a;font-size:13px;max-width:min(92vw,520px);
        box-shadow:0 14px 34px rgba(0,0,0,.5);text-align:center}
      .tl-modal{position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px;
        background:rgba(2,6,16,.72)}
      .tl-modal-card{width:min(520px,100%);padding:18px;border-radius:16px;background:#0d1628;color:#e5edf8;
        border:1px solid rgba(251,191,36,.45);box-shadow:0 24px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:10px}
      .tl-modal-card h3{margin:0;font-size:18px}.tl-modal-card p{margin:0;font-size:13px;line-height:1.5;color:#cbd5e1}
      .tl-modal-btns{display:flex;gap:8px;flex-wrap:wrap}
      .co-poster-panel.tl-poster .story-poster-subtitle{color:#fcd34d!important}
      @media (max-width:640px){
        .tl-label{flex-basis:84px}.tl-lbl{font-size:18px}.tl-head h2{font-size:20px}.tl-size{margin-left:0}
      }
    `;
    document.head.appendChild(st);
  }

  /* ---------- pantalla ---------- */
  let root = null, card = null, wired = false;

  function ensureScreen() {
    if (root) return;
    injectCSS();
    root = document.createElement('div');
    root.id = 'tl-screen';
    card = document.createElement('div');
    card.className = 'tl-card';
    root.appendChild(card);
    document.body.appendChild(root);
    wire();
  }

  function iconHTML(it) {
    return `<div class="tl-ic${sel === it.name ? ' sel' : ''}" data-name="${esc(it.name)}" title="${esc(it.name)}">` +
      `<img src="${esc(it.src)}" alt="${esc(it.name)}" draggable="false" loading="lazy"></div>`;
  }

  function render() {
    if (!card) return;
    const top = root.scrollTop;
    const cats = orderedCats();
    if (!cats.includes(S.tab)) S.tab = cats[0] || 'general';
    const cat = S.tab, c = ensureCat(cat);
    const items = catItems(cat);
    const byName = new Map(items.map(i => [i.name, i]));
    const placed = placedSet(cat);
    const pool = items.filter(i => !placed.has(i.name));
    const total = items.length;

    let h = `<div class="tl-head"><h2>🏆 Tier list de face icons</h2>
      <button class="tl-btn" data-act="back">⬅ Volver</button></div>`;

    h += '<div class="tl-tabs">' + cats.map(k =>
      `<button class="tl-tab${k === cat ? ' on' : ''}" data-tab="${esc(k)}">${esc(catLabel(k))}<small>${catItems(k).length}</small></button>`
    ).join('') + '</div>';

    h += `<div class="tl-tools">
      <button class="tl-btn" data-act="addrow">＋ Fila</button>
      <button class="tl-btn" data-act="reset">↺ Reiniciar esta lista</button>
      <button class="tl-btn prim" data-act="png">📤 Imagen PNG</button>
      <button class="tl-btn prim" data-act="jpg">🖼 Imagen JPG</button>
      <button class="tl-btn" data-act="txt">📋 Copiar texto</button>
      <button class="tl-btn" data-act="json">💾 Guardar JSON</button>
      <button class="tl-btn" data-act="loadjson">📂 Cargar JSON</button>
      <button class="tl-btn" data-act="folder">📁 Cargar carpeta</button>
      <label class="tl-size">Tamaño <input type="range" min="40" max="110" value="${S.size}" data-size></label>
    </div>
    <div class="tl-hint">Arrastra los iconos a una fila (en móvil: toca un icono y después la fila). Pulsa el nombre de una fila para renombrarla.
      Lista actual: <b>${esc(catLabel(cat))}</b> · ${placed.size ? [...placed].filter(n => byName.has(n)).length : 0}/${total} clasificados.</div>`;

    h += '<div class="tl-board" id="tl-board">';
    c.tiers.forEach((t, i) => {
      const fg = lum(t.color) > 150 ? '#111827' : '#ffffff';
      h += `<div class="tl-row" data-row="${esc(t.id)}">
        <div class="tl-label" style="background:${esc(t.color)};color:${fg}">
          <span class="tl-lbl" contenteditable="true" spellcheck="false" data-lbl="${esc(t.id)}">${esc(t.label)}</span>
          <div class="tl-rc">
            <input type="color" value="${esc(t.color)}" data-col="${esc(t.id)}" title="Color">
            <button data-act="up" data-id="${esc(t.id)}" title="Subir"${i === 0 ? ' disabled' : ''}>▲</button>
            <button data-act="down" data-id="${esc(t.id)}" title="Bajar"${i === c.tiers.length - 1 ? ' disabled' : ''}>▼</button>
            <button data-act="del" data-id="${esc(t.id)}" title="Quitar fila">✕</button>
          </div>
        </div>
        <div class="tl-items" data-drop="${esc(t.id)}">${t.items.filter(n => byName.has(n)).map(n => iconHTML(byName.get(n))).join('')}</div>
      </div>`;
    });
    h += '</div>';

    h += `<div class="tl-pooltitle">Sin clasificar (${pool.length})</div>
      <div class="tl-pool" data-drop="pool">${pool.map(iconHTML).join('') || '<span class="tl-hint">¡Todos clasificados! 🎉</span>'}</div>`;

    card.innerHTML = h;
    card.querySelector('#tl-board').style.setProperty('--tl-s', S.size + 'px');
    card.querySelector('.tl-pool').style.setProperty('--tl-s', S.size + 'px');
    card.querySelectorAll('.tl-ic img').forEach(img => {
      img.addEventListener('error', () => {
        const ic = img.parentNode;
        const fb = document.createElement('span');
        fb.className = 'tl-fb';
        fb.textContent = (ic.dataset.name || '?').slice(0, 2).toUpperCase();
        img.replaceWith(fb);
      }, { once: true });
    });
    root.scrollTop = top;
  }

  /* ---------- aviso ---------- */
  let toastTimer = null;
  function toast(msg, ms) {
    let t = $('tl-toast');
    if (!t) { t = document.createElement('div'); t.id = 'tl-toast'; t.className = 'tl-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, ms || 4200);
  }

  /* ---------- eventos ---------- */
  let drag = null, justDragged = false;

  function wire() {
    if (wired) return;
    wired = true;

    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    root.addEventListener('change', onChange);
    root.addEventListener('keydown', e => {
      if (e.target.classList && e.target.classList.contains('tl-lbl') && e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
      if (e.key === 'Escape' && !(e.target.classList && e.target.classList.contains('tl-lbl'))) { sel = null; closeScreen(); }
    });
    root.addEventListener('focusout', e => {
      if (e.target.classList && e.target.classList.contains('tl-lbl')) { save(); render(); }
    });
    root.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', cancelDrag);
  }

  function onInput(e) {
    const t = e.target;
    if (t.dataset && t.dataset.lbl) {
      const tier = ensureCat(S.tab).tiers.find(x => x.id === t.dataset.lbl);
      if (tier) { tier.label = t.textContent.slice(0, 24); save(); }
    } else if (t.dataset && t.dataset.col) {
      const tier = ensureCat(S.tab).tiers.find(x => x.id === t.dataset.col);
      if (tier) {
        tier.color = t.value;
        const lab = t.closest('.tl-label');
        if (lab) { lab.style.background = t.value; lab.style.color = lum(t.value) > 150 ? '#111827' : '#ffffff'; }
      }
    } else if (t.hasAttribute && t.hasAttribute('data-size')) {
      S.size = Number(t.value) || 64;
      card.querySelectorAll('#tl-board,.tl-pool').forEach(el => el.style.setProperty('--tl-s', S.size + 'px'));
    }
  }
  function onChange(e) {
    const t = e.target;
    if ((t.dataset && t.dataset.col) || (t.hasAttribute && t.hasAttribute('data-size'))) save();
  }

  function onClick(e) {
    if (justDragged) return;
    const tab = e.target.closest('[data-tab]');
    if (tab) { S.tab = tab.dataset.tab; sel = null; save(); render(); return; }

    const btn = e.target.closest('[data-act]');
    if (btn) { doAction(btn.dataset.act, btn.dataset.id); return; }

    const ic = e.target.closest('.tl-ic');
    if (ic) { sel = (sel === ic.dataset.name) ? null : ic.dataset.name; render(); return; }

    const zone = e.target.closest('[data-drop]');
    if (zone && sel) { moveItem(sel, zone.dataset.drop, null); sel = null; save(); render(); }
  }

  function doAction(act, id) {
    const c = ensureCat(S.tab);
    if (act === 'back') { sel = null; closeScreen(); return; }
    if (act === 'addrow') { c.tiers.push({ id: uid(), label: 'Nueva', color: '#a78bfa', items: [] }); save(); render(); return; }
    if (act === 'up' || act === 'down') {
      const i = c.tiers.findIndex(t => t.id === id), j = act === 'up' ? i - 1 : i + 1;
      if (i >= 0 && j >= 0 && j < c.tiers.length) { const x = c.tiers[i]; c.tiers[i] = c.tiers[j]; c.tiers[j] = x; save(); render(); }
      return;
    }
    if (act === 'del') {
      const t = c.tiers.find(x => x.id === id);
      if (!t) return;
      if (c.tiers.length <= 1) { toast('Tiene que quedar al menos una fila.'); return; }
      if (t.items.length && !confirm('¿Quitar la fila «' + t.label + '»? Sus iconos volverán a «Sin clasificar».')) return;
      c.tiers = c.tiers.filter(x => x.id !== id);
      save(); render(); return;
    }
    if (act === 'reset') {
      if (!confirm('¿Reiniciar la lista «' + catLabel(S.tab) + '»? Se perderá lo clasificado en ella.')) return;
      delete S.cats[S.tab]; sel = null; save(); render(); return;
    }
    if (act === 'png' || act === 'jpg') { exportImage(act); return; }
    if (act === 'txt') { copyText(); return; }
    if (act === 'json') { downloadJSON(); return; }
    if (act === 'loadjson') { pickFile('.json,application/json', false, importJSON); return; }
    if (act === 'folder') { pickFile('', true, importFolder); return; }
  }

  /* ----- arrastrar con ratón / lápiz (en táctil: tocar icono y luego fila) ----- */
  function onPointerDown(e) {
    if (e.button !== 0 || e.pointerType === 'touch') return;
    const ic = e.target.closest('.tl-ic');
    if (!ic) return;
    drag = { name: ic.dataset.name, el: ic, sx: e.clientX, sy: e.clientY, active: false, ghost: null, zone: null, before: null };
  }

  function startDrag() {
    const d = drag;
    d.active = true;
    d.el.classList.add('drag-src');
    const g = d.el.cloneNode(true);
    g.className = 'tl-ic tl-ghost';
    g.style.setProperty('--tl-s', S.size + 'px');
    g.style.width = g.style.height = S.size + 'px';
    document.body.appendChild(g);
    d.ghost = g;
  }

  function clearMarks() {
    root.querySelectorAll('.tl-over').forEach(el => el.classList.remove('tl-over'));
    root.querySelectorAll('.drop-before').forEach(el => el.classList.remove('drop-before'));
  }

  function onPointerMove(e) {
    if (!drag) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
      startDrag();
    }
    e.preventDefault();
    drag.ghost.style.left = e.clientX + 'px';
    drag.ghost.style.top = e.clientY + 'px';
    clearMarks();
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const zone = under && under.closest ? under.closest('[data-drop]') : null;
    drag.zone = zone; drag.before = null;
    if (!zone) return;
    zone.classList.add('tl-over');
    if (zone.dataset.drop === 'pool') return;       // el sobrante se ordena solo
    const kids = zone.querySelectorAll('.tl-ic:not(.drag-src)');
    for (const k of kids) {
      const r = k.getBoundingClientRect();
      if (e.clientY < r.top || (e.clientY <= r.bottom && e.clientX < r.left + r.width / 2)) { drag.before = k; break; }
    }
    if (drag.before) drag.before.classList.add('drop-before');
  }

  function endDrag() {
    if (!drag) return;
    if (drag.ghost) drag.ghost.remove();
    if (drag.el) drag.el.classList.remove('drag-src');
    clearMarks();
  }
  function cancelDrag() { endDrag(); drag = null; }

  function onPointerUp() {
    if (!drag) return;
    const d = drag;
    endDrag();
    drag = null;
    if (!d.active) return;
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 0);
    if (d.zone) {
      moveItem(d.name, d.zone.dataset.drop, d.before ? d.before.dataset.name : null);
      sel = null; save(); render();
    }
  }

  /* ---------- extraer: texto ---------- */
  function listText() {
    const cat = S.tab, c = ensureCat(cat);
    const names = new Set(catItems(cat).map(i => i.name));
    const lines = ['Tier list — ' + catLabel(cat)];
    c.tiers.forEach(t => {
      const its = t.items.filter(n => names.has(n));
      if (its.length) lines.push(t.label + ': ' + its.join(', '));
    });
    return lines.join('\n');
  }
  async function copyText() {
    const txt = listText();
    try {
      await navigator.clipboard.writeText(txt);
      toast('📋 Tier list copiada al portapapeles.');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { /* ignorar */ }
      ta.remove();
      toast(ok ? '📋 Tier list copiada al portapapeles.' : 'No se pudo copiar. Prueba con «Guardar JSON».');
    }
  }

  /* ---------- extraer: imagen PNG ---------- */
  function loadImg(src) {
    // Con límite de tiempo: una imagen que no responde nunca bloquea la exportación.
    const tryLoad = cors => new Promise(res => {
      const im = new Image();
      let done = false;
      const fin = v => { if (!done) { done = true; clearTimeout(tm); res(v); } };
      const tm = setTimeout(() => fin(null), 6000);
      if (cors) im.crossOrigin = 'anonymous';
      im.onload = () => fin(im);
      im.onerror = () => fin(null);
      im.src = src;
    });
    const local = location.protocol === 'file:' && !/^(blob|data):/.test(src);
    return local ? tryLoad(false) : tryLoad(true).then(im => im || tryLoad(false));
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  let exporting = false;

  async function exportImage(fmt, force) {
    if (exporting) return;
    const isJpg = fmt === 'jpg';
    const mime = isJpg ? 'image/jpeg' : 'image/png', ext = isJpg ? 'jpg' : 'png';
    const cat = S.tab, c = ensureCat(cat);
    const byName = new Map(catItems(cat).map(i => [i.name, i]));
    const names = [...new Set(c.tiers.flatMap(t => t.items))].filter(n => byName.has(n));

    // Abierto con doble clic (file://): el navegador no dejará exportar. Se pide la carpeta ANTES de empezar.
    const needsFolder = location.protocol === 'file:' && names.some(n => !/^(blob|data):/.test(byName.get(n).src));
    if (needsFolder && !force) { showFolderPrompt(fmt); return; }

    exporting = true;
    try {
      toast('Generando imagen… (0/' + names.length + ')', 60000);
      const W = 1200, LW = 130, PAD = 10, IC = 72, GAP = 8, TITLE = 62, MINROW = 92;
      const perRow = Math.max(1, Math.floor((W - LW - PAD * 2 + GAP) / (IC + GAP)));

      const loaded = new Map();
      let count = 0;
      await Promise.all(names.map(async n => {
        loaded.set(n, await loadImg(byName.get(n).src));
        count++;
        if (count % 5 === 0 || count === names.length) toast('Generando imagen… (' + count + '/' + names.length + ')', 60000);
      }));

      const rows = c.tiers.map(t => {
        const its = t.items.filter(n => byName.has(n));
        const lines = Math.max(1, Math.ceil(its.length / perRow));
        return { t, its, h: Math.max(MINROW, lines * (IC + GAP) + PAD * 2 - GAP) };
      });
      const H = TITLE + rows.reduce((sum, r) => sum + r.h + 4, 0) + 12;

      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const g = cv.getContext('2d');
      g.fillStyle = '#0b1220'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#f8fafc'; g.font = '800 30px system-ui, Arial, sans-serif'; g.textBaseline = 'middle';
      g.fillText('Tier list — ' + catLabel(cat), 14, TITLE / 2);

      let y = TITLE;
      rows.forEach(r => {
        g.fillStyle = r.t.color; g.fillRect(0, y, LW, r.h);
        g.fillStyle = lum(r.t.color) > 150 ? '#111827' : '#ffffff';
        let fs = 34;
        g.textAlign = 'center';
        g.font = '900 ' + fs + 'px system-ui, Arial, sans-serif';
        while (fs > 12 && g.measureText(r.t.label).width > LW - 16) { fs -= 2; g.font = '900 ' + fs + 'px system-ui, Arial, sans-serif'; }
        g.fillText(r.t.label, LW / 2, y + r.h / 2);
        g.textAlign = 'left';
        g.fillStyle = '#111a2e'; g.fillRect(LW, y, W - LW, r.h);

        r.its.forEach((n, i) => {
          const x = LW + PAD + (i % perRow) * (IC + GAP);
          const yy = y + PAD + Math.floor(i / perRow) * (IC + GAP);
          const im = loaded.get(n);
          g.save();
          g.beginPath(); g.arc(x + IC / 2, yy + IC / 2, IC / 2, 0, Math.PI * 2); g.closePath(); g.clip();
          if (im && im.naturalWidth > 0) {
            const sc = Math.max(IC / im.naturalWidth, IC / im.naturalHeight);
            const dw = im.naturalWidth * sc, dh = im.naturalHeight * sc;
            g.drawImage(im, x + (IC - dw) / 2, yy + (IC - dh) / 2, dw, dh);
          } else {
            g.fillStyle = '#243252'; g.fillRect(x, yy, IC, IC);
            g.fillStyle = '#cbd5e1'; g.font = '800 24px system-ui, Arial, sans-serif'; g.textAlign = 'center';
            g.fillText(n.slice(0, 2).toUpperCase(), x + IC / 2, yy + IC / 2); g.textAlign = 'left';
          }
          g.restore();
        });
        y += r.h + 4;
      });

      // toBlob puede lanzar (lienzo protegido) o no llamar nunca a la función: se cubren ambos casos.
      const blob = await new Promise((res, rej) => {
        const tm = setTimeout(() => rej(new Error('tiempo agotado')), 15000);
        try {
          cv.toBlob(b => { clearTimeout(tm); b ? res(b) : rej(new Error('imagen vacía')); }, mime, 0.92);
        } catch (e) { clearTimeout(tm); rej(e); }
      });
      download(blob, 'tierlist-' + cat + '.' + ext);
      toast('✅ Imagen guardada: tierlist-' + cat + '.' + ext);
    } catch (e) {
      console.error('[tierlist.js] exportar imagen:', e);
      const tainted = e && (e.name === 'SecurityError' || /tainted|protegid|insecure/i.test(String(e.message)));
      if (tainted) { showFolderPrompt(fmt); toast('El navegador bloquea las imágenes locales.'); }
      else toast('No se pudo generar la imagen: ' + ((e && e.message) || e));
    } finally {
      exporting = false;
    }
  }

  /* El navegador marca como «protegido» el lienzo cuando las imágenes vienen de archivos locales
     (juego abierto con doble clic) y no deja exportarlo. Leyendo la carpeta con el selector de
     archivos las imágenes pasan a ser del propio navegador y el problema desaparece. */
  function showFolderPrompt(fmt) {
    const old = $('tl-modal');
    if (old) old.remove();
    const m = document.createElement('div');
    m.id = 'tl-modal';
    m.className = 'tl-modal';
    m.innerHTML = `<div class="tl-modal-card">
      <h3>Hace falta leer las imágenes desde tu carpeta</h3>
      <p>Al abrir el juego con doble clic, el navegador bloquea exportar las imágenes locales por seguridad.
         Selecciona una vez tu carpeta <b>face icons</b> y la imagen se generará al momento.</p>
      <div class="tl-modal-btns">
        <button class="tl-btn prim" data-m="pick">📁 Seleccionar carpeta «face icons»</button>
        <button class="tl-btn" data-m="try">Intentar sin carpeta</button>
        <button class="tl-btn" data-m="close">Cancelar</button>
      </div>
      <p class="tl-hint">Otra opción: abre el juego desde un servidor local (por ejemplo, ejecuta
         «python -m http.server» dentro de la carpeta del juego y entra en http://localhost:8000).</p>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener('click', ev => {
      const b = ev.target.closest('[data-m]');
      if (ev.target === m || (b && b.dataset.m === 'close')) { m.remove(); return; }
      if (!b) return;
      m.remove();
      if (b.dataset.m === 'try') exportImage(fmt, true);
      else if (b.dataset.m === 'pick') pickFile('', true, files => { importFolder(files); exportImage(fmt); });
    });
  }

  /* ---------- extraer: JSON ---------- */
  function downloadJSON() {
    const data = { app: 'tierlist', version: 1, exported: new Date().toISOString(), cats: S.cats };
    download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'tierlist.json');
    toast('💾 Guardado: tierlist.json (incluye todas las listas).');
  }

  function pickFile(accept, folder, handler) {
    const inp = document.createElement('input');
    inp.type = 'file';
    if (accept) inp.accept = accept;
    if (folder) { inp.setAttribute('webkitdirectory', ''); inp.setAttribute('directory', ''); inp.multiple = true; }
    inp.style.display = 'none';
    inp.addEventListener('change', () => { handler(Array.from(inp.files || [])); inp.remove(); });
    document.body.appendChild(inp);
    inp.click();
  }

  function importJSON(files) {
    const f = files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(String(rd.result));
        const cats = data && data.cats;
        if (!cats || typeof cats !== 'object') throw new Error('formato');
        let n = 0;
        Object.keys(cats).forEach(k => {
          const c = cats[k];
          if (c && Array.isArray(c.tiers) && c.tiers.length) { S.cats[k] = { tiers: c.tiers }; ensureCat(k); n++; }
        });
        save(); render();
        toast('📂 Cargadas ' + n + ' listas.');
      } catch (e) { toast('Ese archivo no es una tier list válida.'); }
    };
    rd.readAsText(f);
  }

  function importFolder(files) {
    const imgs = files.filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f.name));
    if (!imgs.length) { toast('No he encontrado imágenes en esa carpeta.'); return; }
    objectUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch (e) { /* ignorar */ } });
    objectUrls = [];
    const f = {};
    imgs.forEach(file => {
      const parts = (file.webkitRelativePath || file.name).split('/');
      let cat = parts.length >= 2 ? parts[parts.length - 2].toLowerCase().trim() : 'general';
      if (cat === 'face icons' || cat === 'face_icons' || cat === 'faceicons') cat = 'general';
      const name = file.name.replace(/\.[^.]+$/, '');
      const url = URL.createObjectURL(file);
      objectUrls.push(url);
      (f[cat] = f[cat] || []).push({ name, src: url });
    });
    Object.keys(f).forEach(k => f[k].sort((a, b) => a.name.localeCompare(b.name, 'es')));
    const gen = f.general || [];
    delete f.general;
    f.general = buildGeneral(Object.assign({}, f, { __g: gen }));
    FOLDERS = f;
    sel = null;
    render();
    toast('📁 ' + f.general.length + ' iconos cargados de ' + (Object.keys(f).length - 1) + ' carpetas.');
  }

  /* ---------- abrir / cerrar ---------- */
  function closeScreen() {
    if (root) root.style.display = 'none';
    const mm = $('main-menu');
    if (mm) mm.style.display = 'flex';
    if (window.INTERFAZ && window.INTERFAZ.isOn && window.INTERFAZ.isOn()) window.INTERFAZ.open();   // vuelve a «Más modos»
  }

  function openScreen() {
    ensureScreen();
    if (window.INTERFAZ && window.INTERFAZ.close) window.INTERFAZ.close();
    const mm = $('main-menu');
    if (mm) mm.style.display = 'none';
    root.style.display = 'block';
    render();
    root.scrollTop = 0;
  }

  /* ---------- panel con portada en el menú (igual que Desafío, Torneo, Cooperativo…) ---------- */
  function injectMenuPanel() {
    if ($('menu-tierlist')) return;
    const layout = document.querySelector('#main-menu .menu-layout');
    if (!layout) return;
    const story = $('menu-story');
    let col = story && story.parentElement && story.parentElement.classList.contains('menu-col') ? story.parentElement : null;
    if (!col && story) {
      col = document.createElement('div');
      col.className = 'menu-col';
      story.parentNode.insertBefore(col, story);
      col.appendChild(story);
    }
    const btn = document.createElement('button');
    btn.id = 'menu-tierlist';
    btn.className = 'story-poster-panel co-poster-panel tl-poster';
    btn.innerHTML = `
      <div class="story-poster-frame"><img src="${esc(COVER)}" alt="Tier list"></div>
      <span class="story-poster-title">🏆 Tier list</span>
      <span class="story-poster-subtitle">Clasifica todos los face icons</span>
      <span class="story-poster-cta">▶ Abrir</span>`;
    const im = btn.querySelector('img');
    im.addEventListener('error', () => {
      const fb = document.createElement('div');
      fb.style.cssText = 'font-size:64px;display:flex;align-items:center;justify-content:center;height:100%';
      fb.textContent = '🏆';
      im.replaceWith(fb);
    }, { once: true });
    (col || layout).appendChild(btn);
    btn.addEventListener('click', openScreen);
  }

  /* ---------- arranque ---------- */
  function init() {
    FOLDERS = buildDefaultFolders();
    load();
    injectCSS();
    injectMenuPanel();
    let tries = 0;
    const t = setInterval(() => { injectMenuPanel(); if ($('menu-tierlist') || ++tries > 20) clearInterval(t); }, 250);
    window.TIERLIST = { open: openScreen, close: closeScreen };
    console.log('[tierlist.js] modo Tier list listo');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
