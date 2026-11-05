/* colores-habilidades.js
   Colorea el fondo de cada habilidad según su tipo, para distinguirlas de un vistazo:
     - 🔴 Ataque  : hace daño directo (power > 0).
     - 🟣 Debuff  : sin daño y con control o penalizaciones (reducir stats, aturdir,
                    congelar, miedo, veneno/quemadura, quitar buffos…).
     - 🟢 Curación: sin daño y con curación, revivir o limpiar estados.
     - 🔵 Mejora  : sin daño y con buffos, escudo, invulnerabilidad, reflejo, etc.
   Si una habilidad mezcla efectos, manda: ataque > debuff > curación > mejora.

   No modifica game.js: renderMovesArea() repinta #moves-area entero en cada turno,
   así que se observa ese contenedor y se etiqueta cada .move-btn con data-mtype
   (el color en sí es CSS puro). Debe cargarse DESPUÉS de game.js.
*/
(function () {
  'use strict';

  const HEAL = new Set(['heal', 'healPct', 'selfHealPct', 'revive', 'cleanse', 'turnRegen']);
  const DEBUFF = new Set(['debuff', 'accuracyDown', 'slow', 'stun', 'freeze', 'fear', 'charm',
    'healReduction', 'mark', 'purgeBuffs', 'removeBuffs', 'bleed', 'damageOverTime', 'conditionalControl']);

  const LABEL = { attack: 'Ataque', debuff: 'Debuff', heal: 'Curación', buff: 'Mejora' };

  function classify(move) {
    if (Number(move.power) > 0 || (move.type === 'attack' && !hasEffects(move))) return 'attack';
    const types = effectsOf(move).map(e => e && e.type);
    if (move.type === 'debuff' || types.some(t => DEBUFF.has(t))) return 'debuff';
    if (types.some(t => HEAL.has(t))) return 'heal';
    return move.type === 'attack' ? 'attack' : 'buff';
  }

  const effectsOf = m => (typeof getMoveEffects === 'function') ? getMoveEffects(m)
    : Array.isArray(m.effects) ? m.effects : (m.effect ? [m.effect] : []);
  const hasEffects = m => effectsOf(m).length > 0;

  function injectCSS() {
    if (document.getElementById('mc-css')) return;
    const defs = {
      attack: ['239,68,68',  '#fca5a5'],
      debuff: ['168,85,247', '#d8b4fe'],
      heal:   ['34,197,94',  '#86efac'],
      buff:   ['59,130,246', '#93c5fd']
    };
    let css = '';
    Object.keys(defs).forEach(k => {
      const [rgb, txt] = defs[k];
      css += `
      .move-btn[data-mtype="${k}"]{
        border-color:rgba(${rgb},.38);
        background:linear-gradient(180deg,rgba(${rgb},.17),rgba(${rgb},.06)),rgba(6,13,26,.66);
      }
      .move-btn[data-mtype="${k}"]::before{background:rgb(${rgb}); opacity:.9}
      .move-btn[data-mtype="${k}"] .move-name{color:${txt}}
      .move-btn[data-mtype="${k}"]:hover:not([disabled]){
        border-color:rgba(${rgb},.75);
        background:linear-gradient(180deg,rgba(${rgb},.28),rgba(${rgb},.1)),rgba(6,13,26,.74);
        box-shadow:0 12px 24px rgba(0,0,0,.24),0 0 0 1px rgba(${rgb},.25);
      }
      .move-btn[data-mtype="${k}"] .mc-tag{background:rgba(${rgb},.2); color:${txt}; border:1px solid rgba(${rgb},.45)}`;
    });
    css += `
      .mc-tag{display:inline-block; margin-left:8px; padding:0 7px; border-radius:999px;
        font-size:10px; font-weight:700; vertical-align:1px; letter-spacing:.02em}`;
    const st = document.createElement('style');
    st.id = 'mc-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function paint() {
    try {
      if (typeof state === 'undefined' || state.phase !== 'battle') return;
      const area = document.getElementById('moves-area');
      const actor = getActive(state.turnOwner);
      if (!area || !actor) return;
      area.querySelectorAll('.move-btn').forEach((btn, i) => {
        const move = actor.moves[i];
        if (!move) return;
        const kind = classify(move);
        btn.dataset.mtype = kind;
        if (!btn.querySelector('.mc-tag')) {
          const name = btn.querySelector('.move-name');
          if (name) {
            const tag = document.createElement('span');
            tag.className = 'mc-tag';
            tag.textContent = LABEL[kind];
            name.after(tag);
          }
        }
      });
    } catch (err) {
      console.warn('[colores-habilidades.js]', err);
    }
  }

  function init() {
    const area = document.getElementById('moves-area');
    if (!area) return;
    injectCSS();
    new MutationObserver(paint).observe(area, { childList: true });
    paint();
    console.log('[colores-habilidades.js] colores por tipo de habilidad activos');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
