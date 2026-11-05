/* rejilla.js
   Mejoras de la rejilla de personajes (selección de equipo, baneos y glosario):
     - Tamaño ajustable: Compacto · Normal · Grande (barra "Tamaño" sobre cada rejilla).
       El ajuste es global y se recuerda en localStorage ('rejilla-tamano').
     - Iconos de clase: cada clase pasa de texto plano ("mago, control") a una etiqueta
       con icono y color propio (en modo Compacto solo se ve el icono; el nombre sale
       al pasar el ratón). Además cada ficha lleva una franja superior con el color de
       su primera clase, para reconocerlas de un vistazo.

   No modifica game.js: las rejillas se repintan enteras desde game.js, así que se
   observan los contenedores y se transforman las fichas nuevas (marcadas con data-rj).
   El tamaño es CSS puro sobre <html data-rj-size>. Debe cargarse DESPUÉS de game.js.
*/
(function () {
  'use strict';

  const KEY = 'rejilla-tamano';
  const SIZES = [['s', 'Compacto'], ['m', 'Normal'], ['l', 'Grande']];

  /* icono, nombre, color RGB y color de texto por clase */
  const CLASS_INFO = {
    atacante:     ['🗡️', 'Atacante',     '239,68,68',   '#fca5a5'],
    defensor:     ['🛡️', 'Defensor',     '59,130,246',  '#93c5fd'],
    sanador:      ['💊', 'Sanador',      '34,197,94',   '#86efac'],
    soporte:      ['⚙️', 'Soporte',      '20,184,166',  '#5eead4'],
    debilitador:  ['☠️', 'Debilitador',  '168,85,247',  '#d8b4fe'],
    mago:         ['🧙', 'Mago',         '236,72,153',  '#f9a8d4'],
    control:      ['🤖', 'Control',      '245,158,11',  '#fcd34d'],
    luchador:     ['🥊', 'Luchador',     '249,115,22',  '#fdba74'],
    inmortal:     ['♾️', 'Inmortal',     '148,163,184', '#cbd5e1'],
    tanque:       ['🏰', 'Tanque',       '99,102,241',  '#a5b4fc'],
    asesino:      ['🔪', 'Asesino',      '225,29,72',   '#fda4af'],
    contraataque: ['🔄', 'Contraataque', '234,179,8',   '#fde047'],
    antimagia:    ['🧿', 'Antimagia',    '6,182,212',   '#67e8f9']
  };
  const FALLBACK = ['⭐', null, '148,163,184', '#cbd5e1'];

  const norm = s => String(s).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function info(raw) {
    const key = norm(raw);
    const d = CLASS_INFO[key] || FALLBACK;
    return { icon: d[0], label: d[1] || cap(String(raw).trim()), rgb: d[2], txt: d[3] };
  }

  /* ---------- estilos ---------- */
  function injectCSS() {
    if (document.getElementById('rj-css')) return;
    const st = document.createElement('style');
    st.id = 'rj-css';
    st.textContent = `
      /* barra de tamaño */
      .rj-bar{display:flex; align-items:center; gap:5px; margin:0 0 8px; font-size:11px; color:#91a1b7}
      .rj-bar button{border:1px solid rgba(148,163,184,.22); background:rgba(255,255,255,.03); color:#aab8cc;
        border-radius:999px; padding:3px 10px; font:inherit; font-size:11px; cursor:pointer; white-space:nowrap}
      .rj-bar button:hover{border-color:rgba(167,139,250,.55); color:#fff}
      .rj-bar button[aria-pressed="true"]{background:rgba(139,92,246,.22); border-color:rgba(167,139,250,.7); color:#fff}

      /* etiquetas de clase */
      .char .classes{display:flex; flex-wrap:wrap; justify-content:center; align-content:flex-start; gap:3px; min-height:24px}
      .ci-chip{display:inline-flex; align-items:center; gap:3px; padding:1px 6px; border-radius:999px;
        font-size:10px; line-height:1.5; font-weight:700; white-space:nowrap;
        color:var(--ct); background:rgba(var(--c),.16); border:1px solid rgba(var(--c),.42)}
      .ci-ico{font-size:12px; line-height:1}

      /* franja superior con el color de la primera clase */
      .char[data-rj]::before{content:""; position:absolute; left:0; right:0; top:0; height:3px;
        background:rgb(var(--c1,148,163,184)); opacity:.85}

      /* ---- Compacto ---- */
      html[data-rj-size="s"] .char{width:104px; min-width:0; padding:8px 5px 7px; border-radius:12px}
      html[data-rj-size="s"] .char img{width:58px; height:58px}
      html[data-rj-size="s"] .char strong{font-size:11px; margin-top:5px !important}
      html[data-rj-size="s"] .char .classes{min-height:18px; margin-top:4px}
      html[data-rj-size="s"] .ci-chip{padding:1px 4px}
      html[data-rj-size="s"] .ci-chip .ci-name{display:none}
      html[data-rj-size="s"] .ci-ico{font-size:13px}
      html[data-rj-size="s"] .char-list{gap:7px}
      html[data-rj-size="s"] .char > div.small{font-size:9px !important; padding:1px 4px !important}
      html[data-rj-size="s"] .passive-badge{font-size:11px; top:4px; right:5px}

      /* ---- Grande ---- */
      html[data-rj-size="l"] .char{width:192px; min-width:0; padding:12px 11px 14px}
      html[data-rj-size="l"] .char img{width:130px; height:130px}
      html[data-rj-size="l"] .char strong{font-size:15px}
      html[data-rj-size="l"] .char .classes{gap:4px; min-height:30px}
      html[data-rj-size="l"] .ci-chip{font-size:11px; padding:2px 8px}
      html[data-rj-size="l"] .ci-ico{font-size:14px}

      @media (max-width:760px){
        html[data-rj-size="s"] .char{width:calc(33.333% - 5px)}
        html[data-rj-size="l"] .char{width:100%}
      }
      @media (max-width:460px){
        html[data-rj-size="s"] .char{width:calc(50% - 4px)}
      }
    `;
    document.head.appendChild(st);
  }

  /* ---------- tamaño ---------- */
  function getSize() {
    try { const v = localStorage.getItem(KEY); if (v === 's' || v === 'm' || v === 'l') return v; } catch (e) { /* sin acceso */ }
    return 'm';
  }

  function setSize(v) {
    document.documentElement.dataset.rjSize = v;
    try { localStorage.setItem(KEY, v); } catch (e) { /* modo privado */ }
    document.querySelectorAll('.rj-bar [data-size]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.size === v)));
  }

  function makeBar() {
    const bar = document.createElement('div');
    bar.className = 'rj-bar';
    bar.innerHTML = '<span>Tamaño:</span>' + SIZES.map(([k, l]) =>
      `<button type="button" data-size="${k}" aria-pressed="false">${l}</button>`).join('');
    bar.addEventListener('click', e => {
      const b = e.target.closest('button[data-size]');
      if (b) setSize(b.dataset.size);
    });
    return bar;
  }

  /* ---------- fichas ---------- */
  function decorate(root) {
    root.querySelectorAll('.char .classes:not([data-rj])').forEach(box => {
      const raw = box.textContent.split(/\s*[,·]\s*/).filter(Boolean);
      if (!raw.length) return;
      const infos = raw.map(info);
      box.dataset.rj = '1';
      box.innerHTML = infos.map(i =>
        `<span class="ci-chip" title="${esc(i.label)}" style="--c:${i.rgb};--ct:${i.txt}">` +
        `<span class="ci-ico">${i.icon}</span><span class="ci-name">${esc(i.label)}</span></span>`).join('');
      const card = box.closest('.char');
      if (card) { card.dataset.rj = '1'; card.style.setProperty('--c1', infos[0].rgb); }
    });
  }

  /* ---------- arranque ---------- */
  function init() {
    // Contenedores que game.js repinta (el de selección contiene además un buscador y un contador).
    const roots = ['p1-list', 'p2-list', 'ban-grid', 'glossary-grid']
      .map(id => document.getElementById(id)).filter(Boolean);
    if (!roots.length) { console.warn('[rejilla.js] no se encontraron rejillas'); return; }

    injectCSS();
    roots.forEach(root => {
      root.parentNode.insertBefore(makeBar(), root);       // la barra queda fuera: no la borra ningún repintado
      new MutationObserver(() => decorate(root)).observe(root, { childList: true, subtree: true });
      decorate(root);
    });
    setSize(getSize());
    console.log('[rejilla.js] rejilla con tamaño ajustable e iconos de clase activa');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
