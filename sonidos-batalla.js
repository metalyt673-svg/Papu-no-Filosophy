/* sonidos-batalla.js — SONIDOS DE COMBATE
   Se carga desde juego.html DESPUÉS de efectos-sonido.js:
     <script src="sonidos-batalla.js" defer></script>
   No modifica game.js: envuelve las funciones globales del motor.

   Qué suena y cuándo:
     attack      SOLO ataques básicos (uno al azar de attack…attack7). También el contraataque.
     tecnique    SOLO habilidades de daño que no son básicas ni ulti (una al azar de tecnique…9).
     ULTI        suena UN solo sonido, al azar: o un attack o un tecnique.
     dash        al empezar una nueva ronda.
     critical_hit  solo golpes críticos.
     heal        solo cuando se usa una habilidad de curar (no robo de vida ni regeneración).
     buff_on     solo cuando una habilidad de apoyo da una mejora (protección, escudo, subida de stats…).
     debuff_on   solo cuando una habilidad sin daño debilita al rival (aturdir, ralentizar, bajar stats…).
     buff_off / debuff_off   un bufo / debufo termina o es purgado.
     continuos_damage  solo daño continuo de veneno, quemadura y sangrado.
     swap        al cambiar de personaje.
     passive_on  cuando se activa O termina una pasiva.

   Las habilidades sin daño (curar, bufo, debufo) NO hacen sonido de attack/tecnique: solo el suyo. */
(function () {
  'use strict';
  if (window.__sonidosBatalla) return;
  window.__sonidosBatalla = true;
  const W = window;

  const LISTAS = {
    basico:   ['attack', 'attack1', 'attack2', 'attack3', 'attack4', 'attack5', 'attack6', 'attack7'],
    tecnica:  ['tecnique', 'tecnique1', 'tecnique2', 'tecnique3', 'tecnique4', 'tecnique5', 'tecnique6', 'tecnique7', 'tecnique8', 'tecnique9'],
    buffOn:   ['buff_on', 'buff_on1'],
    buffOff:  ['buff_off'],
    debuffOn: ['debuff_on', 'debuff_on1'],
    debuffOff: ['debuff_off', 'debuff_off1'],
    heal:     ['heal', 'heal1'],
    dot:      ['continuos_damage'],
    crit:     ['critical_hit'],
    dash:     ['dash'],
    swap:     ['swap'],
    pasiva:   ['passive_on']
  };

  const RE_ULTI = /^\s*(?:ULT(?:I|RA|IMATE)?\b|T[ÉE]CNICA DEFIN)|\(ULT\)/i;
  // Crítico: solo el golpe, no stats como «prob. crítico» o «daño crítico».
  const RE_CRIT = /¡\s*cr[ií]tico\s*!|golpe cr[ií]tico|ataque cr[ií]tico|critical hit/i;
  const RE_CRIT_NO = /probabilidad|prob\.|chance|rate|aumenta|sube|reduce|baja|increase|decrease/i;
  // Pasiva: se activa o termina.
  const RE_PASIVA = /activa su pasiva|(?:triggers|activates) (?:its|his|her|their) passive|pasiva.*(?:termina|finaliza|expira|se desactiva|se agota)|passive.*(?:ends|expires|wears off|fades)/i;
  // Daño continuo: solo veneno, quemadura, sangrado.
  const RE_DOT = /poison|veneno|burn|quem|bleed|sangr/i;
  // Efectos que son curación (no cuentan como bufo).
  const RE_CURA = /heal|regen|lifesteal|life_steal|drain|cura|vida|robo/i;
  // Nueva ronda (respaldo por el registro de combate).
  const RE_RONDA = /(?:^|[^a-záéíóúñ])(?:ronda|round)\s*\d+/i;

  /* ---------- utilidades ---------- */
  const ultimoIdx = new Map();
  function elegir(lista) {
    if (lista.length === 1) return 'btl_' + lista[0];
    let i, prev = ultimoIdx.has(lista) ? ultimoIdx.get(lista) : -1;
    do { i = Math.floor(Math.random() * lista.length); } while (i === prev);
    ultimoIdx.set(lista, i);
    return 'btl_' + lista[i];
  }
  function sonar(nombre) {
    try { if (W.SFX && typeof W.SFX.play === 'function') W.SFX.play(nombre); } catch (e) { /* sin sonido */ }
  }
  function enCombate() {
    try { return typeof state !== 'undefined' && state.phase === 'battle'; } catch (e) { return false; }
  }

  const ultimaVez = {};
  function libre(cat, ms) {
    const t = performance.now();
    if (ultimaVez[cat] != null && t - ultimaVez[cat] < ms) return false;
    ultimaVez[cat] = t;
    return true;
  }

  let carril = 0;
  function encolar(cat, lista, ms) {
    if (!libre(cat, ms || 350)) return;
    const nombre = elegir(lista);
    const ahora = performance.now();
    const cuando = Math.max(ahora, carril);
    carril = cuando + 160;
    const espera = cuando - ahora;
    if (espera > 8) setTimeout(() => sonar(nombre), espera); else sonar(nombre);
  }

  /* ---------- tipo de habilidad ---------- */
  // basico | tecnica (daño, no básica ni ulti) | ulti | apoyo (sin daño: curar, bufo, debufo)
  function tipoDe(actor, move) {
    const lista = (actor && actor.moves) || [];
    const i = lista.indexOf(move);
    if ((i >= 0 && i === lista.length - 1 && lista.length >= 3) || RE_ULTI.test(move.name || '')) return 'ulti';
    if (Number(move.power) > 0) {
      return ((Number(move.baseCooldown) || 0) === 0 || i === 0) ? 'basico' : 'tecnica';
    }
    return 'apoyo';
  }

  let cur = null;
  function contexto(actor, move) {
    if (!actor || !move) return null;
    return { actor, tipo: tipoDe(actor, move), disparada: false, cura: false, buff: false, debuff: false };
  }

  // Sonido del golpe: solo para habilidades de daño, una vez por habilidad.
  function disparar(actor) {
    const c = cur;
    if (!c || c.disparada || actor !== c.actor) return;
    c.disparada = true;
    if (c.tipo === 'basico') sonar(elegir(LISTAS.basico));
    else if (c.tipo === 'tecnica') sonar(elegir(LISTAS.tecnica));
    else if (c.tipo === 'ulti') sonar(elegir(Math.random() < 0.5 ? LISTAS.basico : LISTAS.tecnica)); // UNO solo
    else return;   // apoyo: no hace sonido de golpe
    carril = Math.max(carril, performance.now() + 260);
  }

  // Al terminar una habilidad de APOYO suena lo que hizo: curar, o mejora y/o debilitar.
  function finalizar(c) {
    if (!c || c.tipo !== 'apoyo') return;
    if (c.cura) { encolar('heal', LISTAS.heal, 400); return; }
    if (c.buff) encolar('buffOn', LISTAS.buffOn, 350);
    if (c.debuff) encolar('debuffOn', LISTAS.debuffOn, 350);
  }

  /* ---------- bufos y debufos: se detectan por cambios reales ---------- */
  const nBuffs = c => { try { return W.countBuffs(c); } catch (e) { return 0; } };
  const nDebuffs = c => { try { return W.countDebuffs(c); } catch (e) { return 0; } };

  function snap(c) {
    const s = { b: {}, d: {}, sh: 0, st: 0, nb: 0, nd: 0 };
    try {
      s.sh = Number(c.shield) || 0;
      s.st = Number(c.stunned) || 0;
      W.listBuffs(c).forEach(b => {
        const r = b.ref || {};
        s.b[[b.kind, r.type, r.stat].join(':')] = [Math.abs(Number(r.value) || 0), Number(r.remaining) || 0];
      });
      W.listDebuffs(c).forEach(d => {
        const r = d.ref || {};
        s.d[[d.kind, r.type, r.status, r.stat].join(':')] = [Math.abs(Number(r.value) || 0), Number(r.remaining) || 0];
      });
      s.nb = nBuffs(c); s.nd = nDebuffs(c);
    } catch (e) { /* sin datos */ }
    return s;
  }
  // ¿hay algo nuevo, o más fuerte, o que dura más que antes?
  function ganancia(antes, ahora, excluir) {
    return Object.keys(ahora).some(k => {
      if (excluir && excluir.test(k)) return false;
      const p = antes[k], n = ahora[k];
      return !p || n[0] > p[0] || n[1] > p[1];
    });
  }

  /* ---------- envoltorios de las funciones del motor ---------- */
  function envolver(nombre, fabrica) {
    const orig = W[nombre];
    if (typeof orig !== 'function') { console.warn('[sonidos-batalla.js] no existe', nombre); return; }
    W[nombre] = fabrica(orig);
  }

  function instalar() {
    // 1) Qué habilidad se usa
    envolver('resolveMove', orig => async function (playerKey, moveId) {
      const prev = cur;
      let mine = null;
      try {
        const actor = W.getActive(playerKey);
        mine = cur = contexto(actor, actor && actor.moves.find(m => m.id === moveId));
      } catch (e) { cur = null; }
      try { return await orig.apply(this, arguments); }
      finally { try { finalizar(mine); } catch (e) { /* sin sonido */ } cur = prev; }
    });
    envolver('aiExecuteAction', orig => async function (action) {
      const prev = cur;
      let mine = null;
      try {
        const actor = W.getActive('p2');
        mine = cur = contexto(actor, actor && action && actor.moves.find(m => m.id === action.moveId));
      } catch (e) { cur = null; }
      try { return await orig.apply(this, arguments); }
      finally { try { finalizar(mine); } catch (e) { /* sin sonido */ } cur = prev; }
    });

    // 2) Golpes (solo habilidades de daño) y contraataques
    envolver('applyDamage', orig => function (actor, target, move) {
      if (enCombate()) {
        disparar(actor);
        if (move && move._isCounter) encolar('contra', LISTAS.basico, 300);
      }
      return orig.apply(this, arguments);
    });

    // 3) Curación: solo cuenta si la hace una habilidad de apoyo (curar)
    envolver('applyHealing', orig => function () {
      const r = orig.apply(this, arguments);
      if (r > 0 && enCombate() && cur && cur.tipo === 'apoyo') cur.cura = true;
      return r;
    });

    // 4) Aplicar bufos / debufos / estados
    let prof = 0;
    ['applyEffect', 'applyDebuff', 'applyStatusEffect', 'applySpecialEffect'].forEach(nombre => {
      envolver(nombre, orig => function (actor, target) {
        if (!enCombate()) return orig.apply(this, arguments);
        disparar(actor);
        if (prof > 0) return orig.apply(this, arguments);
        const c = cur;
        const sujetos = [];
        [actor, target].forEach(x => { if (x && sujetos.indexOf(x) < 0) sujetos.push(x); });
        let antes = null;
        try { antes = sujetos.map(x => ({ x, s: snap(x) })); } catch (e) { /* sin medición */ }
        prof++;
        let r;
        try { r = orig.apply(this, arguments); } finally { prof--; }
        try {
          if (antes) antes.forEach(a => {
            const n = snap(a.x);
            // Fin / purga de bufos y debufos
            if (n.nb < a.s.nb) encolar('buffOff', LISTAS.buffOff, 350);
            if (n.nd < a.s.nd) encolar('debuffOff', LISTAS.debuffOff, 350);
            // Mejoras / debilitaciones: solo cuentan dentro de una habilidad de apoyo
            if (c && c.tipo === 'apoyo' && actor === c.actor) {
              if (n.sh > a.s.sh || ganancia(a.s.b, n.b, RE_CURA)) {
                // la mejora debe recaer en el propio lanzador (o aliado), no en el rival
                if (a.x === actor || a.x !== target || target === actor) c.buff = true;
              }
              if (a.x !== actor || target === actor) {
                if (n.st > a.s.st || ganancia(a.s.d, n.d)) c.debuff = true;
              }
            }
          });
        } catch (e) { console.warn('[sonidos-batalla.js]', e); }
        return r;
      });
    });

    // 5) Fin de bufos y debufos al terminar el turno
    ['processEndOfTurnEffects', 'processDamageOverTime'].forEach(nombre => {
      envolver(nombre, orig => function (target) {
        if (!enCombate()) return orig.apply(this, arguments);
        let antes = null;
        try { antes = snap(target); } catch (e) { /* sin medición */ }
        const r = orig.apply(this, arguments);
        try {
          if (antes) {
            const n = snap(target);
            if (n.nb < antes.nb) encolar('buffOff', LISTAS.buffOff, 350);
            if (n.nd < antes.nd) encolar('debuffOff', LISTAS.debuffOff, 350);
          }
        } catch (e) { console.warn('[sonidos-batalla.js]', e); }
        return r;
      });
    });

    // 6) Daño continuo: SOLO veneno, quemadura o sangrado
    envolver('applyStatusDamage', orig => function (target) {
      const antes = target ? target.hp : 0;
      let esDot = false;
      try {
        esDot = W.listDebuffs(target).some(d => {
          const r = d.ref || {};
          return RE_DOT.test([d.kind, r.type, r.status].join(' '));
        });
      } catch (e) { /* sin datos */ }
      const r = orig.apply(this, arguments);
      if (esDot && enCombate() && target && target.hp < antes) encolar('dot', LISTAS.dot, 300);
      return r;
    });

    // 7) Cambio de personaje y nueva ronda (se detectan al repintar la arena)
    let activos = null, ronda = null;
    const leerRonda = () => {
      const s = state;
      const v = s.round != null ? s.round : (s.roundNumber != null ? s.roundNumber : (s.turnNumber != null ? s.turnNumber : s.turn));
      return typeof v === 'number' ? v : null;
    };
    envolver('updateArena', orig => function () {
      const r = orig.apply(this, arguments);
      try {
        if (!enCombate()) { activos = null; ronda = null; }
        else {
          const a = { p1: state.activeIndex.p1, p2: state.activeIndex.p2 };
          if (activos && (a.p1 !== activos.p1 || a.p2 !== activos.p2)) encolar('swap', LISTAS.swap, 400);
          activos = a;
          const rr = leerRonda();
          if (rr != null) {
            if (ronda != null && rr > ronda && libre('dash', 1200)) sonar(elegir(LISTAS.dash));
            ronda = rr;
          }
        }
      } catch (e) { /* sin sonido */ }
      return r;
    });
  }

  /* ---------- crítico, pasivas y nueva ronda: se leen del registro (#log) ---------- */
  function vigilarRegistro() {
    const log = document.getElementById('log');
    if (!log) return;
    new MutationObserver(() => {
      const nuevas = [];
      for (const el of log.children) {
        if (el.dataset && el.dataset.btl) break;
        nuevas.push(el);
        if (nuevas.length > 8) break;
      }
      nuevas.forEach(el => { if (el.dataset) el.dataset.btl = '1'; });
      if (!enCombate() || nuevas.length > 8) return;
      nuevas.reverse().forEach(el => {
        const txt = el.textContent || '';
        if (RE_CRIT.test(txt) && !RE_CRIT_NO.test(txt) && libre('crit', 250)) sonar(elegir(LISTAS.crit));
        if (RE_PASIVA.test(txt)) encolar('pasiva', LISTAS.pasiva, 500);
        if (RE_RONDA.test(txt) && libre('dash', 1200)) sonar(elegir(LISTAS.dash));
      });
    }).observe(log, { childList: true });
  }

  function init() {
    try { instalar(); vigilarRegistro(); console.log('[sonidos-batalla.js] sonidos de combate activos'); }
    catch (e) { console.warn('[sonidos-batalla.js]', e); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
