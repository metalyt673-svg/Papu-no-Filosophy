/* misiones.js — MISIONES ALEATORIAS (parte del INVENTARIO)
   ---------------------------------------------------------------------------
   - Siempre hay 5 misiones disponibles, elegidas al azar entre varias plantillas
     («gana 3 combates», «gana sin perder ningún personaje», «gana 2 seguidos»…).
   - Tienes que ELEGIR 3 de ellas para hacerlas (suena misiones.mp3). Solo las
     elegidas acumulan progreso.
   - Cuentan los combates de CUALQUIER modo (vs IA, PvP, con baneos, Historia,
     Desafío, Infierno, Torneo…) en cuanto terminan.
   - Al completar una misión la reclamas desde el 🎒 Inventario (sección «Misiones»)
     y ganas monedas 🪙, cajas 📦 o ambas (suena enhorabuena.mp3). Al reclamarla
     aparece una misión nueva sin elegir y puedes escoger otra.
   - Si una misión sin elegir no te gusta puedes cambiarla (REROLLS_PER_DAY veces al día).
   - Si te rindes en el Modo Historia no cuenta como combate terminado.

   INSTALACIÓN (juego.html), justo DESPUÉS de inventario.js:
       <script src="misiones.js" defer></script>

   Todo se guarda en localStorage ('batalla-misiones').

   DÓNDE AJUSTAR COSAS:
     - Nº de misiones disponibles:   SLOTS
     - Nº de misiones a elegir:      MAX_ACTIVE
     - Cambios gratis al día:        REROLLS_PER_DAY
     - Plantillas y objetivos:       TPLS  (goals = objetivos posibles, val = dificultad)
     - Cantidad de las recompensas:  makeReward()
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  if (typeof state === 'undefined' || typeof window.checkKO !== 'function') {
    console.warn('[misiones.js] Debe cargarse DESPUÉS de game.js.');
    return;
  }

  const KEY             = 'batalla-misiones';
  const SLOTS           = 5;   // misiones disponibles
  const MAX_ACTIVE      = 3;   // cuántas puedes tener elegidas a la vez
  const REROLLS_PER_DAY = 2;

  /* ---------------- utilidades ---------------- */
  const byId = id => document.getElementById(id);
  const esc  = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt  = n => Number(n || 0).toLocaleString('es-ES');
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const coinHTML = () => { try { return window.SKINS && typeof window.SKINS.coinImg === 'function' ? window.SKINS.coinImg() : '🪙'; } catch (e) { return '🪙'; } };

  /* ---------------- plantillas de misión ----------------
     e = { win, mode:'pve'|'pvp', story, bans, turns, flawless }
     inc(e, m) devuelve cuánto suma al progreso (0 si el combate no cuenta).
     streak:true -> el progreso son victorias SEGUIDAS (se pone a 0 al perder). */
  const plural = (n, uno, varios) => n === 1 ? uno : varios.replace('{n}', n);
  const TPLS = [
    { id: 'play',     icon: '⚔️', val: 1, gen: () => ({ goal: pick([3, 4, 5, 6]) }),
      text: m => `Termina ${m.goal} combates (cualquier modo)`,
      inc: () => 1 },
    { id: 'win',      icon: '🏆', val: 2, gen: () => ({ goal: pick([2, 3, 4]) }),
      text: m => `Gana ${m.goal} combates`,
      inc: e => e.win ? 1 : 0 },
    { id: 'winPve',   icon: '🤖', val: 2, gen: () => ({ goal: pick([2, 3]) }),
      text: m => `Gana ${m.goal} combates contra la IA`,
      inc: e => e.win && e.mode === 'pve' && !e.story ? 1 : 0 },
    { id: 'playPvp',  icon: '🧍', val: 1, gen: () => ({ goal: pick([2, 3]) }),
      text: m => `Juega ${m.goal} combates Jugador vs Jugador`,
      inc: e => e.mode === 'pvp' && !e.story ? 1 : 0 },
    { id: 'winBans',  icon: '🚫', val: 3, gen: () => ({ goal: pick([1, 2]) }),
      text: m => `Gana ${plural(m.goal, 'un combate', '{n} combates')} en un modo con baneos`,
      inc: e => e.win && e.bans ? 1 : 0 },
    { id: 'special',  icon: '📖', val: 3, gen: () => ({ goal: pick([1, 2]) }),
      text: m => `Termina ${plural(m.goal, 'un combate', '{n} combates')} de Historia, Desafío, Infierno o Torneo`,
      inc: e => e.story ? 1 : 0 },
    { id: 'fast',     icon: '⚡', val: 3, gen: () => ({ goal: 1, arg: pick([30, 40]) }),
      text: m => `Gana un combate en ${m.arg} turnos o menos`,
      inc: (e, m) => e.win && e.turns > 0 && e.turns <= m.arg ? 1 : 0 },
    { id: 'flawless', icon: '🛡️', val: 3, gen: () => ({ goal: pick([1, 2]) }),
      text: m => `Gana ${plural(m.goal, 'un combate', '{n} combates')} sin perder ningún personaje`,
      inc: e => e.win && e.flawless ? 1 : 0 },
    { id: 'streak',   icon: '🔥', val: 3, streak: true, gen: () => ({ goal: pick([2, 3]) }),
      text: m => `Gana ${m.goal} combates seguidos`,
      inc: e => e.win ? 1 : 0 }
  ];
  const tplById = id => TPLS.find(t => t.id === id);

  /* ---------------- recompensas ---------------- */
  function makeReward(tpl, goal) {
    const pts = tpl.val * goal;
    const coins = k => Math.max(5, Math.round(pts * k / 5) * 5);
    if (pts < 4) return { coins: coins(3.5), boxes: 0 };
    const r = Math.random();
    if (r < 0.5) return { coins: coins(3.5), boxes: 0 };
    if (r < 0.8) return { coins: 0, boxes: pts >= 8 ? 2 : 1 };
    return { coins: coins(1.5), boxes: 1 };
  }

  function newMission(excludeTpls) {
    const free = TPLS.filter(t => !(excludeTpls || []).includes(t.id));
    const tpl = pick(free.length ? free : TPLS);
    const g = tpl.gen();
    return { uid: uid(), tpl: tpl.id, goal: g.goal, arg: g.arg || 0, p: 0, on: false, reward: makeReward(tpl, g.goal) };
  }

  /* ---------------- datos guardados ---------------- */
  function load() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
    const n = v => Math.max(0, Math.min(1e9, Math.floor(Number(v)) || 0));
    const slots = [];
    let onCount = 0;
    (Array.isArray(d.slots) ? d.slots : []).forEach(m => {
      if (!m || !tplById(m.tpl) || slots.length >= SLOTS) return;
      const goal = Math.max(1, n(m.goal));
      // Partidas guardadas antiguas (sin campo «on») tenían sus misiones ya activas.
      const want = m.on === undefined ? true : !!m.on;
      const on = want && onCount < MAX_ACTIVE;
      if (on) onCount++;
      slots.push({
        uid: String(m.uid || uid()), tpl: m.tpl, goal, arg: n(m.arg), p: Math.min(goal, n(m.p)), on,
        reward: { coins: n(m.reward && m.reward.coins), boxes: n(m.reward && m.reward.boxes) }
      });
    });
    let changed = false;
    while (slots.length < SLOTS) { slots.push(newMission(slots.map(m => m.tpl))); changed = true; }
    const day = today();
    const fresh = d.day !== day;
    const out = {
      slots,
      day,
      rerolls: fresh ? REROLLS_PER_DAY : Math.min(REROLLS_PER_DAY, n(d.rerolls)),
      completed: n(d.completed)
    };
    if (changed || fresh) { try { localStorage.setItem(KEY, JSON.stringify(out)); } catch (e) { /* modo privado */ } }
    return out;
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* modo privado */ } }

  const isDone = m => m.p >= m.goal;
  const activeCount = () => S.slots.filter(m => m.on).length;
  const claimable = () => S.slots.filter(m => m.on && isDone(m)).length;

  /* ---------------- contar combates ---------------- */
  function onBattleEnd() {
    const p1 = (state.teams && state.teams.p1) || [];
    const e = {
      win: p1.length > 0 && !p1.every(c => c.hp <= 0),
      mode: state.mode === 'pve' ? 'pve' : 'pvp',
      story: !!state.storyMode,
      bans: !!state.bansEnabled,
      turns: Number(state.turnCount) || 0,
      flawless: p1.length > 0 && p1.every(c => c.hp > 0)
    };
    S = load();
    const nuevas = [];
    S.slots.forEach(m => {
      if (!m.on || isDone(m)) return;   // solo cuentan las misiones elegidas
      const tpl = tplById(m.tpl);
      if (tpl.streak) {
        m.p = e.win ? Math.min(m.goal, m.p + 1) : 0;
      } else {
        m.p = Math.min(m.goal, m.p + (tpl.inc(e, m) || 0));
      }
      if (isDone(m)) nuevas.push(m);
    });
    save();
    refreshAll();
    if (nuevas.length) showToast(nuevas);
  }

  function installHook() {
    const _ko = window.checkKO;
    if (typeof _ko !== 'function' || _ko.__misiones) return;
    const wrapped = function () {
      const before = state.phase;
      const res = _ko.apply(this, arguments);
      try {
        if (res && before !== 'ended' && state.phase === 'ended') onBattleEnd();
      } catch (err) { /* las misiones nunca deben romper el combate */ }
      return res;
    };
    wrapped.__misiones = true;
    window.checkKO = wrapped;
  }

  /* ---------------- acciones ---------------- */
  function rewardText(r) {
    const parts = [];
    if (r.coins) parts.push(`${coinHTML()} +${fmt(r.coins)}`);
    if (r.boxes) parts.push(`📦 ×${r.boxes}`);
    return parts.join(' · ');
  }

  function claim(id) {
    S = load();
    const i = S.slots.findIndex(m => m.uid === id);
    if (i < 0 || !isDone(S.slots[i])) return '';
    const m = S.slots[i];
    if (!m.on) return '';
    if (m.reward.coins && !(window.SKINS && typeof window.SKINS.addCoins === 'function')) return 'La tienda no está disponible ahora mismo para darte las monedas.';
    if (m.reward.boxes && !(window.INVENTARIO && typeof window.INVENTARIO.add === 'function')) return 'El inventario no está disponible ahora mismo para darte las cajas.';
    if (m.reward.coins) window.SKINS.addCoins(m.reward.coins);
    if (m.reward.boxes) window.INVENTARIO.add(m.reward.boxes);
    S.completed++;
    S.slots[i] = newMission(S.slots.filter((_, k) => k !== i).map(x => x.tpl));
    save();
    refreshAll();
    if (window.SFX) SFX.play('enhorabuena');
    return '🎉 Recompensa reclamada.';
  }

  function choose(id) {
    S = load();
    const m = S.slots.find(x => x.uid === id);
    if (!m || m.on || isDone(m)) return '';
    if (activeCount() >= MAX_ACTIVE) return `Ya has elegido ${MAX_ACTIVE} misiones. Completa y reclama una para poder elegir otra.`;
    m.on = true;
    save();
    refreshAll();
    if (window.SFX) SFX.play('mision');
    return '';
  }

  function reroll(id) {
    S = load();
    const i = S.slots.findIndex(m => m.uid === id);
    if (i < 0 || S.slots[i].on || isDone(S.slots[i])) return '';
    if (S.rerolls < 1) return 'Hoy ya no te quedan cambios de misión.';
    S.rerolls--;
    S.slots[i] = newMission(S.slots.map(x => x.tpl));
    save();
    refreshAll();
    return '';
  }

  /* ---------------- estilos ---------------- */
  function injectStyles() {
    if (byId('misiones-styles')) return;
    const st = document.createElement('style');
    st.id = 'misiones-styles';
    st.textContent = `
    #mis-section{display:contents}
    .mis-list{display:flex;flex-direction:column;gap:12px}
    .mis-card{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:12px 14px;border-radius:16px;
      background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012)),#0f1020;border:1px solid rgba(255,255,255,.09)}
    .mis-card.on{border-color:rgba(251,146,60,.55)}
    .mis-card.locked{opacity:.55}
    .mis-card.done{border-color:rgba(74,222,128,.55);box-shadow:0 0 24px rgba(74,222,128,.14)}
    .mis-ic{flex:0 0 auto;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:22px;border-radius:14px;background:#1a1208;box-shadow:0 0 0 2px rgba(251,146,60,.6)}
    .mis-card.done .mis-ic{box-shadow:0 0 0 2px rgba(74,222,128,.8)}
    .mis-body{flex:1 1 220px;min-width:0;display:flex;flex-direction:column;gap:6px}
    .mis-body b{font-size:14.5px;line-height:1.35}
    .mis-bar{height:8px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}
    .mis-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#fdba74,#f97316);transition:width .4s}
    .mis-card.done .mis-bar i{background:linear-gradient(90deg,#86efac,#22c55e)}
    .mis-body small{font-size:11.5px;color:#a8957f}
    .mis-reward{flex:0 0 auto;display:flex;align-items:center;gap:4px;padding:5px 12px;border-radius:99px;font-size:13px;font-weight:800;color:#fde047;
      background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.4);white-space:nowrap}
    .mis-reward img{width:18px;height:18px;vertical-align:middle}
    .mis-act{flex:0 0 auto;display:flex;gap:8px}
    .mis-msg{min-height:18px;font-size:13px;color:#fcd34d;margin-top:8px}
    .mis-dot{position:absolute;top:-8px;left:-6px;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:800;color:#052e16;
      background:linear-gradient(180deg,#86efac,#22c55e);border:2px solid #09122a;box-shadow:0 4px 12px rgba(34,197,94,.45)}
    .mis-toast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:175;max-width:min(440px,92vw);display:flex;align-items:center;gap:12px;
      padding:12px 18px;cursor:pointer;border-radius:18px;background:rgba(9,18,38,.96);border:1px solid rgba(74,222,128,.6);
      box-shadow:0 14px 40px rgba(0,0,0,.55),0 0 30px rgba(74,222,128,.22);animation:mis-in .4s cubic-bezier(.2,1.2,.4,1)}
    .mis-toast .mis-toast-ic{font-size:26px}
    .mis-toast b{display:block;font-size:14px}
    .mis-toast small{display:block;margin-top:2px;font-size:12px;color:#c9b9a4;line-height:1.4}
    @keyframes mis-in{from{opacity:0;transform:translate(-50%,-20px)}to{opacity:1;transform:translate(-50%,0)}}
    @media (prefers-reduced-motion:reduce){.mis-toast{animation:none!important}.mis-bar i{transition:none}}
    `;
    document.head.appendChild(st);
  }

  /* ---------------- pantalla del inventario ---------------- */
  let msg = '';

  function sectionHTML() {
    const act = activeCount();
    const full = act >= MAX_ACTIVE;
    const cards = S.slots.map(m => {
      const tpl = tplById(m.tpl), done = isDone(m);
      const pct = Math.round(100 * m.p / m.goal);
      const cls = (m.on ? ' on' : (full ? ' locked' : '')) + (done ? ' done' : '');
      let estado, accion;
      if (done) {
        estado = '¡Completada!';
        accion = `<button class="inv-primary" data-sfx="none" data-mis="claim" data-uid="${esc(m.uid)}">🎁 Reclamar</button>`;
      } else if (m.on) {
        estado = `En curso · ${m.p} / ${m.goal}`;
        accion = '';
      } else {
        estado = 'Sin elegir';
        accion = `<button class="inv-primary" data-sfx="none" data-mis="choose" data-uid="${esc(m.uid)}"${full ? ' disabled' : ''} title="${full ? `Ya tienes ${MAX_ACTIVE} misiones elegidas` : 'Hacer esta misión'}">✅ Elegir</button>`
               + `<button class="class-btn" data-mis="reroll" data-uid="${esc(m.uid)}" title="Cambiar esta misión por otra"${S.rerolls < 1 ? ' disabled' : ''}>🔄 Cambiar</button>`;
      }
      return `<div class="mis-card${cls}">
        <div class="mis-ic">${tpl.icon}</div>
        <div class="mis-body">
          <b>${esc(tpl.text(m))}</b>
          <div class="mis-bar"><i style="width:${m.on ? pct : 0}%"></i></div>
          <small>${estado}</small>
        </div>
        <div class="mis-reward">${rewardText(m.reward)}</div>
        <div class="mis-act">${accion}</div>
      </div>`;
    }).join('');
    return `
      <div class="inv-h">🎯 Misiones <small>Elegidas ${act} / ${MAX_ACTIVE} · ${S.rerolls} ${S.rerolls === 1 ? 'cambio' : 'cambios'} disponibles hoy</small></div>
      <section class="inv-panel">
        <div class="mis-list">${cards}</div>
        <div class="mis-msg">${esc(msg)}</div>
        <div class="inv-hint">Elige ${MAX_ACTIVE} de las ${SLOTS} misiones: solo las elegidas acumulan progreso con los combates terminados en cualquier modo. Al reclamar una aparece otra nueva. Misiones completadas: ${fmt(S.completed)}.</div>
      </section>`;
  }

  function onSectionClick(ev) {
    const b = ev.target.closest('[data-mis]');
    if (!b) return;
    if (b.dataset.mis === 'claim') msg = claim(b.dataset.uid);
    else if (b.dataset.mis === 'choose') msg = choose(b.dataset.uid);
    else if (b.dataset.mis === 'reroll') msg = reroll(b.dataset.uid);
    renderSection();
  }

  function renderSection() {
    const wrap = byId('inv-wrap');
    if (!wrap) return;
    S = load();
    let sec = byId('mis-section');
    if (!sec) {
      const hero = wrap.querySelector('.inv-hero');
      if (!hero) return;                       // inventario aún no ha pintado su pantalla
      sec = document.createElement('div');
      sec.id = 'mis-section';
      sec.addEventListener('click', onSectionClick);
      hero.insertAdjacentElement('afterend', sec);
    }
    sec.innerHTML = sectionHTML();
  }

  /* ---------------- punto verde en el chip del menú ---------------- */
  function updateDot() {
    const chip = byId('inv-chip');
    if (!chip) return;
    const n = claimable();
    const old = chip.querySelector('.mis-dot');
    if (!n) { if (old) old.remove(); return; }
    if (old && old.dataset.n === String(n)) return;
    if (old) old.remove();
    const dot = document.createElement('span');
    dot.className = 'mis-dot';
    dot.dataset.n = String(n);
    dot.textContent = `🎯 ${n}`;
    dot.title = n === 1 ? 'Tienes una misión lista para reclamar' : `Tienes ${n} misiones listas para reclamar`;
    chip.appendChild(dot);
  }

  function refreshAll() {
    S = load();
    updateDot();
    const screen = byId('inv-screen');
    if (screen && screen.style.display !== 'none') renderSection();
  }

  /* ---------------- aviso al completar ---------------- */
  let toastT = null;
  function showToast(done) {
    const old = byId('mis-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'mis-toast';
    t.className = 'mis-toast';
    t.innerHTML = `<span class="mis-toast-ic">🎯</span>
      <div><b>${done.length > 1 ? `¡${done.length} misiones completadas!` : '¡Misión completada!'}</b>
        <small>${done.map(m => esc(tplById(m.tpl).text(m))).join('<br>')}<br>Reclama tu recompensa en «Inventario».</small></div>`;
    document.body.appendChild(t);
    t.addEventListener('click', () => t.remove());
    clearTimeout(toastT);
    toastT = setTimeout(() => { const x = byId('mis-toast'); if (x) x.remove(); }, 8000);
  }

  /* ---------------- arranque ---------------- */
  function init() {
    injectStyles();
    installHook();

    // Cada vez que el inventario repinta su pantalla, vuelve a colocarse la sección de misiones.
    let tries = 0;
    (function attach() {
      const wrap = byId('inv-wrap');
      if (!wrap) { if (++tries < 20) setTimeout(attach, 300); return; }
      if (window.MutationObserver) {
        new MutationObserver(() => { if (!byId('mis-section')) renderSection(); }).observe(wrap, { childList: true });
      }
      renderSection();
    })();

    // El punto del chip se repone si el inventario repinta el chip
    const menu = byId('main-menu');
    if (menu && window.MutationObserver) {
      new MutationObserver(updateDot).observe(menu, { childList: true, subtree: true });
    }
    updateDot();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Depuración desde la consola: MISIONES.complete()  /  MISIONES.reset()
  window.MISIONES = {
    load: () => load(),
    complete() { S = load(); if (!activeCount()) S.slots.slice(0, MAX_ACTIVE).forEach(m => { m.on = true; }); S.slots.forEach(m => { if (m.on) m.p = m.goal; }); save(); refreshAll(); },
    reset() { try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ } S = load(); refreshAll(); },
    refresh: refreshAll
  };
})();
