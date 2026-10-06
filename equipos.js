/* equipos.js
   Equipos guardados: 5 huecos con presets de 3 personajes que se cargan de un clic.

   Cómo se usa (en la pantalla de selección, bajo "Jugador 1 — Selección"):
     - Elige 3 personajes y pulsa "＋ Guardar equipo" en un hueco libre.
     - Pulsa sobre un equipo guardado para cargarlo al instante.
     - ✏️ renombra, 💾 sobrescribe con tu equipo actual, 🗑 borra.
   Los equipos se guardan en localStorage ('batalla-equipos') y los comparten
   Jugador 1 y Jugador 2 (en el modo local 1 vs 1). En los modos contra la IA
   solo aparece en el panel del Jugador 1.

   No modifica game.js: usa toggleSelectChar() para cargar el equipo, así que
   respeta los parches de otros modos (Multijugador, etc.) y envuelve
   renderSlots() para refrescar la barra. Si algún personaje del equipo está
   baneado o ya no existe, se carga el resto y se avisa.
   Debe cargarse DESPUÉS de game.js.
*/
(function () {
  'use strict';

  const KEY = 'batalla-equipos';
  const SLOTS = 5;
  const SIZE = 3;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- almacenamiento ---------- */
  function load() {
    const out = Array(SLOTS).fill(null);
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(raw)) {
        for (let i = 0; i < SLOTS; i++) {
          const t = raw[i];
          if (t && Array.isArray(t.ids) && t.ids.length === SIZE) {
            out[i] = { name: String(t.name || '').slice(0, 18) || 'Equipo ' + (i + 1), ids: t.ids.slice() };
          }
        }
      }
    } catch (e) { /* datos corruptos: se ignoran */ }
    return out;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(teams)); } catch (e) { /* modo privado */ }
  }
  let teams = load();
  const msgTimers = {};

  /* ---------- estilos ---------- */
  function injectCSS() {
    if ($('eq-css')) return;
    const st = document.createElement('style');
    st.id = 'eq-css';
    st.textContent = `
      .eq-bar{margin:0 0 10px; padding:8px 10px 10px; border:1px solid rgba(148,163,184,.16);
        border-radius:14px; background:rgba(255,255,255,.025)}
      .eq-title{display:flex; align-items:center; gap:8px; margin-bottom:7px; font-size:11px;
        letter-spacing:.06em; text-transform:uppercase; color:#9db0cc}
      .eq-msg{margin-left:auto; text-transform:none; letter-spacing:0; color:#fcd34d; font-size:11px}
      .eq-list{display:flex; gap:7px; overflow-x:auto; padding-bottom:2px}
      .eq-slot{position:relative; flex:1 0 118px; min-width:118px; display:flex; flex-direction:column;
        border:1px solid rgba(148,163,184,.18); border-radius:12px; background:rgba(255,255,255,.03);
        transition:border-color .12s ease, background .12s ease}
      .eq-slot.filled:hover{border-color:rgba(167,139,250,.55); background:rgba(139,92,246,.08)}
      .eq-slot.active{border-color:rgba(74,222,128,.65); background:rgba(34,197,94,.08)}
      .eq-main{flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; padding:8px 6px 4px;
        border:0; background:transparent; color:#e5edf8; cursor:pointer; font:inherit; text-align:center}
      .eq-main:disabled{cursor:not-allowed; opacity:.45}
      .eq-name{font-size:12px; font-weight:800; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
      .eq-faces{display:flex; gap:2px}
      .eq-faces img,.eq-faces i{width:30px; height:30px; object-fit:contain; border-radius:8px;
        background:rgba(255,255,255,.05); font-style:normal; line-height:30px; color:#7d8ca4; font-size:13px}
      .eq-add{justify-content:center; min-height:62px; color:#aab8cc; font-size:12px}
      .eq-add small{display:block; color:#7d8ca4; font-size:10px; margin-top:2px}
      .eq-tools{display:flex; justify-content:center; gap:2px; padding:0 4px 5px}
      .eq-tools button{border:0; background:transparent; color:#aab8cc; cursor:pointer; font-size:13px;
        padding:2px 6px; border-radius:8px}
      .eq-tools button:hover:not(:disabled){background:rgba(148,163,184,.18); color:#fff}
      .eq-tools button:disabled{opacity:.35; cursor:not-allowed}
      .eq-slot.active::after{content:'✔'; position:absolute; top:4px; right:7px; font-size:11px; color:#86efac}
    `;
    document.head.appendChild(st);
  }

  /* ---------- lógica ---------- */
  const canUse = p => !(typeof state !== 'undefined' && state.mode === 'pve' && p === 'p2');
  const currentIds = p => (state.teams[p] || []).map(c => c.id);
  const sameTeam = (a, b) => a.length === b.length && a.every(id => b.includes(id));

  function say(player, text) {
    const el = document.querySelector('#eq-bar-' + player + ' .eq-msg');
    if (!el) return;
    el.textContent = text;
    clearTimeout(msgTimers[player]);
    msgTimers[player] = setTimeout(() => { el.textContent = ''; }, 3500);
  }

  function saveSlot(player, i) {
    const ids = currentIds(player);
    if (ids.length !== SIZE) return say(player, 'Elige 3 personajes primero');
    if (teams[i] && !confirm('¿Sobrescribir "' + teams[i].name + '" con tu equipo actual?')) return;
    teams[i] = { name: teams[i] ? teams[i].name : 'Equipo ' + (i + 1), ids };
    persist();
    render(player);
    say(player, '💾 Guardado en el hueco ' + (i + 1));
    if (player === 'p1' && canUse('p2')) render('p2'); else if (player === 'p2') render('p1');
  }

  function loadSlot(player, i) {
    if (state.phase !== 'select' || !teams[i]) return;
    const usable = teams[i].ids.filter(id => findBaseById(id) && !(state.bansEnabled && isBanned(id)));
    const skipped = SIZE - usable.length;

    // Vacía el equipo actual (copia de ids: toggleSelectChar modifica el array) y añade el preset.
    currentIds(player).forEach(id => toggleSelectChar(player, id));
    usable.forEach(id => toggleSelectChar(player, id));

    if (skipped > 0) say(player, '⚠️ ' + skipped + ' personaje(s) no disponible(s) (baneado o inexistente)');
    else if (!sameTeam(currentIds(player), teams[i].ids)) say(player, 'No se pudo cargar el equipo ahora');
    else say(player, '✔ Equipo "' + teams[i].name + '" cargado');
    refreshAll();
  }

  function renameSlot(player, i) {
    if (!teams[i]) return;
    const n = prompt('Nombre del equipo (máx. 18 caracteres):', teams[i].name);
    if (n === null) return;
    teams[i].name = n.trim().slice(0, 18) || 'Equipo ' + (i + 1);
    persist();
    refreshAll();
  }

  function deleteSlot(player, i) {
    if (!teams[i] || !confirm('¿Borrar "' + teams[i].name + '"?')) return;
    teams[i] = null;
    persist();
    refreshAll();
  }

  /* ---------- render ---------- */
  function render(player) {
    const bar = $('eq-bar-' + player);
    if (!bar || typeof state === 'undefined') return;
    const visible = state.phase === 'select' && canUse(player);
    bar.style.display = visible ? '' : 'none';
    if (!visible) return;

    const cur = currentIds(player);
    const full = cur.length === SIZE;
    const prevMsg = (bar.querySelector('.eq-msg') || {}).textContent || '';

    let h = '<div class="eq-title">⭐ Equipos guardados<span class="eq-msg">' + esc(prevMsg) + '</span></div><div class="eq-list">';
    teams.forEach((t, i) => {
      if (!t) {
        h += `<div class="eq-slot"><button class="eq-main eq-add" data-act="save" data-i="${i}" ${full ? '' : 'disabled'}
              title="${full ? 'Guardar tu equipo actual aquí' : 'Elige 3 personajes para guardar'}">＋ Guardar equipo<small>Hueco ${i + 1}</small></button></div>`;
        return;
      }
      const faces = t.ids.map(id => {
        const c = findBaseById(id);
        return c ? `<img src="${esc(c.img)}" alt="" title="${esc(c.name)}">` : '<i>?</i>';
      }).join('');
      const names = t.ids.map(id => (findBaseById(id) || { name: '?' }).name).join(', ');
      const active = sameTeam(cur, t.ids);
      h += `<div class="eq-slot filled${active ? ' active' : ''}">
        <button class="eq-main" data-act="load" data-i="${i}" title="${esc(names)}">
          <span class="eq-name">${esc(t.name)}</span><span class="eq-faces">${faces}</span>
        </button>
        <span class="eq-tools">
          <button data-act="ren" data-i="${i}" title="Renombrar">✏️</button>
          <button data-act="save" data-i="${i}" title="Sobrescribir con tu equipo actual" ${full ? '' : 'disabled'}>💾</button>
          <button data-act="del" data-i="${i}" title="Borrar">🗑</button>
        </span></div>`;
    });
    bar.innerHTML = h + '</div>';
  }

  function refreshAll() { ['p1', 'p2'].forEach(render); }

  function build(player) {
    const list = $(player + '-list');
    if (!list || $('eq-bar-' + player)) return !!list;
    const bar = document.createElement('div');
    bar.id = 'eq-bar-' + player;
    bar.className = 'eq-bar';
    bar.addEventListener('click', e => {
      const b = e.target.closest('button[data-act]');
      if (!b || b.disabled) return;
      const i = Number(b.dataset.i);
      if (b.dataset.act === 'load') loadSlot(player, i);
      else if (b.dataset.act === 'save') saveSlot(player, i);
      else if (b.dataset.act === 'ren') renameSlot(player, i);
      else if (b.dataset.act === 'del') deleteSlot(player, i);
    });
    list.parentNode.insertBefore(bar, list);       // justo encima de la lista de personajes
    return true;
  }

  function init() {
    if (typeof renderSlots !== 'function' || typeof toggleSelectChar !== 'function' ||
        typeof findBaseById !== 'function' || !build('p1') || !build('p2')) {
      console.warn('[equipos.js] no se encontró la pantalla de selección; equipos guardados desactivado');
      return;
    }
    injectCSS();

    // renderSlots() se llama cada vez que cambia un equipo o empieza una partida.
    const _slots = window.renderSlots;
    window.renderSlots = function () {
      const r = _slots.apply(this, arguments);
      try { refreshAll(); } catch (e) { console.warn('[equipos.js]', e); }
      return r;
    };

    refreshAll();
    console.log('[equipos.js] equipos guardados activos');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
