/* prevision.js
   Previsualización de daño: al pasar el ratón (o enfocar con teclado) una
   habilidad de ataque se muestra:
     - el daño estimado (rango) sobre cada objetivo, con y sin crítico,
     - si mata (seguro / posible con %) teniendo en cuenta escudo y defensa,
     - la precisión, y una sombra sobre la barra de vida del rival activo.

   No modifica game.js: engancha eventos sobre #moves-area (que se repinta
   entero en cada turno) y reutiliza las funciones globales del juego, así que
   funciona igual en Historia, Infierno, Desafío, Torneo y Multijugador.
   Debe cargarse DESPUÉS de game.js. Las cifras replican applyDamage():
     base = round(poder * ATK/DEF) * DAMAGE_MULT  ->  crítico x1.5
     -> el escudo absorbe (salvo ignoreShield)  ->  varianza 0.85–1.15
*/
(function () {
  'use strict';

  const VAR_MIN = 0.85, VAR_MAX = 1.15, CRIT_MULT = 1.5;
  let tip = null;

  /* ---------- estilos (inyectados para no tocar juego.html) ---------- */
  function injectCSS() {
    if (document.getElementById('prevision-css')) return;
    const st = document.createElement('style');
    st.id = 'prevision-css';
    st.textContent = `
      .dmg-tip{
        position:fixed; z-index:9999; width:max-content; max-width:min(300px,92vw);
        padding:10px 12px; border-radius:12px; pointer-events:none;
        background:rgba(8,14,28,.96); color:#e5edf8; font-size:12px; line-height:1.45;
        border:1px solid rgba(167,139,250,.35); box-shadow:0 14px 34px rgba(0,0,0,.45);
        opacity:0; transform:translateY(3px); transition:opacity .12s ease, transform .12s ease;
      }
      .dmg-tip.show{opacity:1; transform:none}
      .dmg-tip .dt-title{font-weight:800; margin-bottom:6px; color:#f8fafc}
      .dmg-tip .dt-row{padding:5px 0; border-top:1px solid rgba(148,163,184,.14)}
      .dmg-tip .dt-row:first-of-type{border-top:0}
      .dmg-tip .dt-name{color:#aab8cc; font-size:11px}
      .dmg-tip .dt-dmg{font-weight:800; font-size:14px; color:#fda4af}
      .dmg-tip .dt-crit{color:#fcd34d; font-size:11px}
      .dmg-tip .dt-note{color:#91a1b7; font-size:11px}
      .dmg-tip .dt-kill{display:inline-block; margin-top:3px; padding:1px 8px; border-radius:999px;
        font-weight:800; font-size:11px}
      .dmg-tip .dt-kill.sure{background:rgba(239,68,68,.22); color:#fca5a5; border:1px solid rgba(239,68,68,.5)}
      .dmg-tip .dt-kill.maybe{background:rgba(245,158,11,.18); color:#fcd34d; border:1px solid rgba(245,158,11,.45)}
      .dmg-tip .dt-kill.no{background:rgba(148,163,184,.12); color:#aab8cc; border:1px solid rgba(148,163,184,.25)}
      .dmg-tip .dt-warn{color:#f9a8d4}
      .dmg-ghost{position:absolute; inset:2px; pointer-events:none; border-radius:999px; overflow:hidden}
      .dmg-ghost b{position:absolute; top:0; bottom:0; display:block}
      .dmg-ghost .g-min{background:rgba(239,68,68,.85); animation:dmgPulse 1s ease-in-out infinite}
      .dmg-ghost .g-rng{background:repeating-linear-gradient(45deg,rgba(239,68,68,.45) 0 4px,rgba(239,68,68,.2) 4px 8px)}
      @keyframes dmgPulse{50%{opacity:.55}}
    `;
    document.head.appendChild(st);
  }

  /* ---------- cálculo ---------- */
  const clamp01 = x => Math.max(0, Math.min(1, x));

  // P(hp_dmg >= hp) cuando hp_dmg = round(x * u), u ~ U(0.85, 1.15)
  function probKill(x, hp) {
    if (x <= 0) return 0;
    const need = (hp - 0.5) / x;                 // u mínimo que mata
    return clamp01((VAR_MAX - need) / (VAR_MAX - VAR_MIN));
  }

  function critChanceFor(actor, effects) {
    const own = getSpecialEffectPercent(actor, 'critChance');
    const fx = effects.find(e => e && e.type === 'critChance');
    // El efecto del propio ataque se aplica antes del golpe (con su prob.).
    const bonus = fx ? Math.max(own, normalizePercentValue(fx.value)) : own;
    return clamp01(BASE_CRIT_CHANCE + bonus / 100);
  }

  function estimateOne(actor, target, move, crit, ignoresShield) {
    const atk = getEffectiveStat(actor, 'atk');
    const def = getEffectiveStat(target, 'def');
    let base = Math.round(Number(move.power) * (atk / def));
    base = Math.max(0, Math.round(base * DAMAGE_MULT));
    const critBase = Math.round(base * CRIT_MULT);

    const shield = ignoresShield ? 0 : (target.shield || 0);
    const afterShield = d => Math.max(0, d - shield);
    const xN = afterShield(base), xC = afterShield(critBase);

    const nMin = Math.round(xN * VAR_MIN), nMax = Math.round(xN * VAR_MAX);
    const cMax = Math.round(xC * VAR_MAX);
    const hp = target.hp;

    const pKill = (1 - crit) * probKill(xN, hp) + crit * probKill(xC, hp);
    return {
      target, hp, shield, ignoresShield,
      min: nMin, max: nMax, critMax: cMax,
      absMax: crit > 0 ? cMax : nMax,
      killSure: nMin >= hp,
      pKill
    };
  }

  function estimate(owner, actor, move) {
    const power = Number(move.power) || 0;
    if (!(power > 0)) return null;               // apoyo / sin daño directo
    const enemyKey = owner === 'p1' ? 'p2' : 'p1';
    const effects = getMoveEffects(move);

    if (isCharmed(actor) && move.type === 'attack') return { charmed: true, move };

    const targets = move.aoe ? getAliveChars(enemyKey)
                             : [getActive(enemyKey)].filter(t => t && t.hp > 0);
    if (!targets.length) return null;

    const crit = critChanceFor(actor, effects);
    const ignores = moveIgnoresShield(move);
    const rows = targets.map(t => estimateOne(actor, t, move, crit, ignores));
    const dots = effects.filter(e => e && e.type === 'damageOverTime' && Number(e.value) > 0);
    return { move, rows, crit, acc: move.acc && move.acc < 1 ? move.acc : 1, dots, enemyKey };
  }

  /* ---------- render ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function killBadge(r) {
    if (r.killSure) return '<span class="dt-kill sure">💀 Mata seguro</span>';
    if (r.pKill > 0.005) {
      const p = r.pKill >= 0.995 ? 99 : Math.max(1, Math.round(r.pKill * 100));
      return `<span class="dt-kill maybe">⚠️ Puede matar (~${p}%)</span>`;
    }
    return '<span class="dt-kill no">No mata</span>';
  }

  function buildHTML(est) {
    if (est.charmed) {
      return `<div class="dt-title">${esc(est.move.name)}</div>
        <div class="dt-warn">💕 Embelesado: este ataque se dirigirá contra un aliado al azar.</div>`;
    }
    let h = `<div class="dt-title">${esc(est.move.name)} · daño estimado</div>`;
    est.rows.forEach(r => {
      const range = r.max <= 0 ? '0' : (r.min === r.max ? `${r.max}` : `${r.min}–${r.max}`);
      h += `<div class="dt-row">
        <div class="dt-name">${esc(r.target.name)} · ${r.hp}/${r.target.maxHp} HP</div>
        <div class="dt-dmg">−${range}</div>`;
      if (est.crit > 0 && r.critMax > r.max)
        h += `<div class="dt-crit">⚡ Crítico (${Math.round(est.crit * 100)}%): hasta −${r.critMax}</div>`;
      if (r.shield > 0)
        h += `<div class="dt-note">${r.ignoresShield ? '🗡️ Ignora su escudo de ' + r.shield
                                                      : '🛡️ Su escudo (' + r.shield + ') absorbe daño'}</div>`;
      h += killBadge(r) + '</div>';
    });
    const notes = [];
    if (est.acc < 1) notes.push(`🎯 Precisión ${Math.round(est.acc * 100)}%: puede fallar`);
    est.dots.forEach(e => notes.push(
      `${getStatusLabel(e.status || 'burn')}: ${Math.round(e.value)}/turno × ${Math.max(1, Number(e.duration) || 1)}`));
    if (notes.length) h += `<div class="dt-row dt-note">${notes.map(esc).join('<br>')}</div>`;
    return h;
  }

  function ensureTip() {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'dmg-tip';
      document.body.appendChild(tip);
    }
    return tip;
  }

  function placeTip(btn) {
    const t = tip, r = btn.getBoundingClientRect();
    const tw = t.offsetWidth, th = t.offsetHeight, gap = 12, pad = 8;
    let left = r.left - tw - gap;                          // preferido: a la izquierda
    if (left < pad) left = r.right + gap;                  // si no cabe: a la derecha
    if (left + tw > innerWidth - pad) {                    // si tampoco: encima/debajo
      left = Math.min(Math.max(pad, r.left), innerWidth - tw - pad);
      let top = r.top - th - gap;
      if (top < pad) top = r.bottom + gap;
      t.style.left = left + 'px'; t.style.top = top + 'px';
      return;
    }
    let top = r.top + r.height / 2 - th / 2;
    top = Math.min(Math.max(pad, top), innerHeight - th - pad);
    t.style.left = left + 'px'; t.style.top = top + 'px';
  }

  /* sombra del daño sobre la barra de vida del rival activo */
  function clearGhost() {
    document.querySelectorAll('.dmg-ghost').forEach(el => el.remove());
  }
  function drawGhost(est) {
    clearGhost();
    if (est.charmed) return;
    const active = getActive(est.enemyKey);
    const row = est.rows.find(r => r.target === active);
    const bar = document.getElementById('hpbar-' + est.enemyKey);
    if (!row || !bar || !active.maxHp) return;
    const pct = v => (Math.max(0, v) / active.maxHp) * 100;
    const minD = Math.min(row.min, row.hp), maxD = Math.min(row.max, row.hp);
    const g = document.createElement('div');
    g.className = 'dmg-ghost';
    g.innerHTML =
      `<b class="g-rng" style="left:${pct(row.hp - maxD)}%;width:${pct(maxD - minD)}%"></b>` +
      `<b class="g-min" style="left:${pct(row.hp - minD)}%;width:${pct(minD)}%"></b>`;
    bar.appendChild(g);
  }

  function hide() {
    if (tip) tip.classList.remove('show');
    clearGhost();
  }

  function show(btn) {
    try {
      if (typeof state === 'undefined' || state.phase !== 'battle') return hide();
      const owner = state.turnOwner;
      if (state.mode === 'pve' && owner === 'p2') return hide();     // turno de la IA
      const actor = getActive(owner);
      const area = document.getElementById('moves-area');
      if (!actor || !area) return hide();
      const idx = Array.prototype.indexOf.call(area.querySelectorAll('.move-btn'), btn);
      const move = idx >= 0 ? actor.moves[idx] : null;
      if (!move) return hide();
      const est = estimate(owner, actor, move);
      if (!est) return hide();

      const t = ensureTip();
      t.innerHTML = buildHTML(est);
      t.classList.add('show');
      placeTip(btn);
      drawGhost(est);
    } catch (err) {
      console.warn('[prevision.js]', err);
      hide();
    }
  }

  /* ---------- enganche de eventos ---------- */
  function init() {
    const area = document.getElementById('moves-area');
    if (!area) return;
    injectCSS();

    area.addEventListener('mouseover', e => {
      const btn = e.target.closest && e.target.closest('.move-btn');
      if (btn && area.contains(btn)) show(btn);
    });
    area.addEventListener('mouseout', e => {
      const btn = e.target.closest && e.target.closest('.move-btn');
      if (btn && !btn.contains(e.relatedTarget)) hide();
    });
    area.addEventListener('focusin', e => {
      const btn = e.target.closest && e.target.closest('.move-btn');
      if (btn) show(btn);
    });
    area.addEventListener('focusout', hide);
    area.addEventListener('click', hide, true);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);

    // El panel se repinta entero cada turno: si cambia, se oculta la previsualización.
    new MutationObserver(hide).observe(area, { childList: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  console.log('[prevision.js] previsualización de daño activa');
})();
