/* registro.js
   Registro de combate mejorado. Sobre el panel "Registro" añade:
     - Filtro por equipo: Todo · Jugador 1 · Jugador 2 / IA · Sistema.
     - "⭐ Clave": muestra solo críticos, KOs, muerte súbita y el resultado final.
     - Resaltado: ⚡ críticos (dorado), 💀 KOs (rojo, línea nueva "X ha sido derrotado"),
       muerte súbita, victoria y ataques fallados (atenuados).
     - Marca de color por equipo y número de turno (T3, T4…) en cada línea.
     - 📄 Exportar a .txt (cronológico, con equipos y turno) y 📋 Copiar.

   No modifica game.js: observa #log (que game.js reescribe con innerHTML en
   cada log()) y etiqueta las líneas nuevas con atributos data-*; el filtrado es
   puro CSS, así que sobrevive a esas reescrituras. A qué equipo pertenece una
   línea se decide por el primer personaje (o "Jugador 1/2", "IA") que aparece
   en el texto: normalmente, quien actúa. Si el mismo personaje está en los dos
   equipos (espejo) la línea es ambigua y se muestra en ambos filtros.
   Funciona en todos los modos. Debe cargarse DESPUÉS de game.js.
*/
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  let logEl = null, bar = null;
  const dead = new WeakSet();       // personajes cuyo KO ya se anunció (clones nuevos en cada batalla)
  let filter = 'all';               // all | p1 | p2 | sys
  let keyOnly = false;
  let msgTimer = null;

  /* ---------- estilos ---------- */
  function injectCSS() {
    if ($('lg-css')) return;
    const st = document.createElement('style');
    st.id = 'lg-css';
    st.textContent = `
      .lg-bar{margin:0 0 8px; display:flex; flex-direction:column; gap:6px}
      .lg-row{display:flex; flex-wrap:wrap; align-items:center; gap:5px}
      .lg-chip{border:1px solid rgba(148,163,184,.22); background:rgba(255,255,255,.03); color:#aab8cc;
        border-radius:999px; padding:3px 10px; font:inherit; font-size:11px; cursor:pointer; white-space:nowrap}
      .lg-chip:hover{border-color:rgba(167,139,250,.55); color:#fff}
      .lg-chip[aria-pressed="true"]{background:rgba(139,92,246,.22); border-color:rgba(167,139,250,.7); color:#fff}
      .lg-chip.p1[aria-pressed="true"]{background:rgba(56,189,248,.18); border-color:rgba(56,189,248,.7)}
      .lg-chip.p2[aria-pressed="true"]{background:rgba(244,114,182,.18); border-color:rgba(244,114,182,.7)}
      .lg-chip.key[aria-pressed="true"]{background:rgba(245,158,11,.2); border-color:rgba(245,158,11,.7)}
      .lg-sum{font-size:11px; color:#91a1b7; margin-left:auto}
      .lg-msg{font-size:11px; color:#fcd34d}

      /* marca de equipo y turno */
      #log > div[data-team="p1"]{border-left-color:rgba(56,189,248,.75)}
      #log > div[data-team="p2"]{border-left-color:rgba(244,114,182,.75)}
      #log > div[data-turn]::before{content:'T' attr(data-turn); display:inline-block; margin-right:6px;
        padding:0 5px; border-radius:6px; background:rgba(148,163,184,.16); color:#9db0cc;
        font-size:10px; font-weight:700; vertical-align:1px}

      /* resaltados */
      #log > div.lg-crit{background:rgba(245,158,11,.13); border-left:3px solid #f59e0b; color:#fde68a; font-weight:700}
      #log > div.lg-ko{background:rgba(239,68,68,.17); border-left:3px solid #ef4444; color:#fecaca; font-weight:800}
      #log > div.lg-sudden{background:rgba(236,72,153,.13); border-left:3px solid #ec4899; color:#fbcfe8; font-weight:700}
      #log > div.lg-win{background:rgba(34,197,94,.16); border-left:3px solid #22c55e; color:#bbf7d0; font-weight:800}
      #log > div.lg-miss{opacity:.6}

      /* filtros (CSS puro: sobreviven a las reescrituras de innerHTML) */
      #log.lg-f-p1 > div[data-team="p2"], #log.lg-f-p1 > div[data-team="sys"],
      #log.lg-f-p2 > div[data-team="p1"], #log.lg-f-p2 > div[data-team="sys"],
      #log.lg-f-sys > div[data-team="p1"], #log.lg-f-sys > div[data-team="p2"], #log.lg-f-sys > div[data-team="?"]{display:none}
      #log.lg-key > div:not(.lg-crit):not(.lg-ko):not(.lg-sudden):not(.lg-win){display:none}
    `;
    document.head.appendChild(st);
  }

  /* ---------- equipos ---------- */
  const isPve = () => typeof state !== 'undefined' && state.mode === 'pve';
  function p2Label() {
    const el = $('enemy-label');
    const t = el && el.textContent.trim();
    return isPve() ? (t || 'IA') : 'Jugador 2';
  }
  const teamLabel = t => t === 'p1' ? 'Jugador 1' : t === 'p2' ? p2Label() : 'Sistema';
  const teamShort = t => t === 'p1' ? 'J1' : t === 'p2' ? (isPve() ? p2Label() : 'J2') : t === '?' ? '??' : 'SYS';

  function nameMap() {
    const map = new Map();
    ['p1', 'p2'].forEach(p => (state.teams[p] || []).forEach(c => {
      if (!c || !c.name) return;
      if (!map.has(c.name)) map.set(c.name, new Set());
      map.get(c.name).add(p);
    }));
    return map;
  }

  const SYS_RE = /^(⚡ Nueva ronda|Comienza la batalla|Baneos:|IA eligió|--- |⚠️ ¡MUERTE|💀 Muerte súbita)/;

  function teamOf(text, names) {
    if (SYS_RE.test(text)) return 'sys';
    let best = null;
    const consider = (i, len, team) => {
      if (i < 0) return;
      if (!best || i < best.i || (i === best.i && len > best.len)) best = { i, len, team };
    };
    names.forEach((set, name) => consider(text.indexOf(name), name.length, set.size > 1 ? '?' : [...set][0]));
    consider(text.indexOf('Jugador 1'), 9, 'p1');
    consider(text.indexOf('Jugador 2'), 9, 'p2');
    if (isPve()) { const m = /\bIA\b/.exec(text); if (m) consider(m.index, 2, 'p2'); }
    return best ? best.team : 'sys';
  }

  /* ---------- procesado de líneas nuevas ---------- */
  function classify(el, names) {
    const text = el.textContent;
    el.dataset.lg = '1';
    el.dataset.team = teamOf(text, names);
    if (typeof state !== 'undefined' && state.turnCount > 0 && state.phase !== 'select') el.dataset.turn = state.turnCount;
    if (text.includes('CRÍTICO')) el.classList.add('lg-crit');
    else if (/gana la batalla/.test(text)) { el.classList.add('lg-win'); el.dataset.team = 'sys'; }
    else if (/MUERTE SÚBITA/i.test(text)) { el.classList.add('lg-sudden'); el.dataset.team = 'sys'; }
    else if (/¡Falló!/.test(text)) el.classList.add('lg-miss');
  }

  function announceKOs(fresh) {
    if (typeof state === 'undefined' || (state.phase !== 'battle' && state.phase !== 'ended')) return;
    ['p1', 'p2'].forEach(p => (state.teams[p] || []).forEach(c => {
      if (!c) return;
      if (c.hp > 0) { dead.delete(c); return; }
      if (dead.has(c)) return;
      dead.add(c);

      const ko = document.createElement('div');
      ko.className = 'lg-ko';
      ko.dataset.lg = '1';
      ko.dataset.team = p;
      if (state.turnCount > 0) ko.dataset.turn = state.turnCount;
      ko.textContent = `💀 ${c.name} (${teamLabel(p)}) ha sido derrotado.`;

      // Se coloca justo después del golpe que lo mató (la línea más antigua de este lote que lo cita).
      let anchor = null;
      for (let i = fresh.length - 1; i >= 0; i--) {
        const t = fresh[i].textContent;
        if (t.includes(c.name) && /causó|daño por/.test(t)) { anchor = fresh[i]; break; }
      }
      logEl.insertBefore(ko, anchor && anchor.parentNode === logEl ? anchor : logEl.firstChild);
    }));
  }

  function process() {
    if (!logEl) return;
    const fresh = Array.from(logEl.children).filter(el => !el.dataset.lg);
    if (fresh.length) {
      const names = nameMap();
      fresh.forEach(el => classify(el, names));
    }
    try { announceKOs(fresh); } catch (e) { console.warn('[registro.js]', e); }
    updateBar();
  }

  /* ---------- barra ---------- */
  function applyFilter() {
    if (!logEl) return;
    ['all', 'p1', 'p2', 'sys'].forEach(f => logEl.classList.remove('lg-f-' + f));
    if (filter !== 'all') logEl.classList.add('lg-f-' + filter);
    logEl.classList.toggle('lg-key', keyOnly);
    bar.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === filter)));
    bar.querySelector('[data-key]').setAttribute('aria-pressed', String(keyOnly));
  }

  function updateBar() {
    if (!bar) return;
    const c = logEl.querySelectorAll('.lg-crit').length, k = logEl.querySelectorAll('.lg-ko').length;
    bar.querySelector('.lg-sum').textContent = `⚡ ${c} crítico${c === 1 ? '' : 's'} · 💀 ${k} KO${k === 1 ? '' : 's'}`;
    const b2 = bar.querySelector('[data-f="p2"]');
    if (b2) b2.textContent = isPve() ? p2Label() : 'J2';
  }

  function say(text) {
    const el = bar && bar.querySelector('.lg-msg');
    if (!el) return;
    el.textContent = text;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { el.textContent = ''; }, 3000);
  }

  /* ---------- exportar ---------- */
  function buildText() {
    const lines = [];
    const now = new Date();
    lines.push('REGISTRO DE COMBATE');
    lines.push('Fecha: ' + now.toLocaleString());
    if (typeof state !== 'undefined') {
      lines.push('Modo: ' + (state.mode === 'pve' ? 'Contra la IA' : 'Jugador vs Jugador') +
        (state.storyMode ? ' (Historia)' : '') + (state.challengeMode ? ' (Desafío)' : ''));
      ['p1', 'p2'].forEach(p => {
        const team = (state.teams[p] || []).map(c => c.name).join(', ');
        if (team) lines.push(`${teamLabel(p)}: ${team}`);
      });
      lines.push('Turnos jugados: ' + (state.turnCount || 0));
    }
    const c = logEl.querySelectorAll('.lg-crit').length, k = logEl.querySelectorAll('.lg-ko').length;
    lines.push(`Críticos: ${c} · KOs: ${k}`);
    lines.push('='.repeat(60));
    // El log del juego va de más nuevo a más antiguo; se exporta en orden cronológico.
    Array.from(logEl.children).reverse().forEach(el => {
      const tags = [];
      if (el.dataset.turn) tags.push('T' + el.dataset.turn);
      tags.push(teamShort(el.dataset.team));
      let mark = '';
      if (el.classList.contains('lg-crit')) mark = ' [CRÍTICO]';
      else if (el.classList.contains('lg-ko')) mark = ' [KO]';
      lines.push(`[${tags.join('|')}] ${el.textContent.trim()}${mark}`);
    });
    return lines.join('\n');
  }

  function download() {
    if (!logEl.children.length) return say('El registro está vacío');
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const name = `registro-combate-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.txt`;
    const blob = new Blob(['\uFEFF' + buildText()], { type: 'text/plain;charset=utf-8' });   // BOM: acentos y emojis en Windows
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    say('📄 Exportado');
  }

  function copy() {
    if (!logEl.children.length) return say('El registro está vacío');
    const text = buildText();
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* sin permiso */ }
      ta.remove();
      say(ok ? '📋 Copiado' : 'No se pudo copiar');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => say('📋 Copiado'), fallback);
    } else fallback();
  }

  /* ---------- arranque ---------- */
  function build() {
    logEl = $('log');
    if (!logEl) return false;
    bar = document.createElement('div');
    bar.className = 'lg-bar';
    bar.innerHTML = `
      <div class="lg-row">
        <button class="lg-chip" data-f="all" aria-pressed="true">Todo</button>
        <button class="lg-chip p1" data-f="p1" aria-pressed="false">J1</button>
        <button class="lg-chip p2" data-f="p2" aria-pressed="false">J2</button>
        <button class="lg-chip" data-f="sys" aria-pressed="false">Sistema</button>
        <button class="lg-chip key" data-key="1" aria-pressed="false" title="Solo críticos, KOs, muerte súbita y resultado">⭐ Clave</button>
      </div>
      <div class="lg-row">
        <button class="lg-chip" data-act="export" title="Descargar el registro completo como .txt">📄 Exportar</button>
        <button class="lg-chip" data-act="copy" title="Copiar el registro completo">📋 Copiar</button>
        <span class="lg-msg"></span>
        <span class="lg-sum"></span>
      </div>`;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.f) { filter = b.dataset.f; applyFilter(); }
      else if (b.dataset.key) { keyOnly = !keyOnly; applyFilter(); }
      else if (b.dataset.act === 'export') download();
      else if (b.dataset.act === 'copy') copy();
    });
    logEl.parentNode.insertBefore(bar, logEl);
    return true;
  }

  function init() {
    if (typeof state === 'undefined' || typeof getActive !== 'function' || !build()) {
      console.warn('[registro.js] no se encontró el registro; mejoras desactivadas');
      return;
    }
    injectCSS();
    applyFilter();
    new MutationObserver(process).observe(logEl, { childList: true });
    process();
    console.log('[registro.js] registro de combate mejorado activo');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
