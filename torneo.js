/* torneo.js — Modo TORNEO VS IA
   ---------------------------------------------------------------------------
   Un torneo de 3 rondas (Cuartos, Semifinal y Final) contra rivales de IA cada
   vez más duros. Cada ronda empieza con la fase de BANEOS normal del juego
   (4 baneos por jugador) y luego eliges tu equipo de 3. Si pierdes un combate
   quedas eliminado; si ganas, eliges una MEJORA para el resto del torneo.

   Se carga en juego.html DESPUÉS de game.js y desafio.js:
       <script src="torneo.js" defer></script>

   No modifica game.js ni personajes.js: se engancha envolviendo algunas de sus
   funciones globales (igual que hace desafio.js con findBaseById).
   IMPORTANTE: debe cargarse ANTES que perfil.js (que envuelve checkKO después
   que este archivo y así no cuenta los combates de torneo como partidas libres).

   IMAGEN (opcional, igual que los demás modos):
       personajes/torneo.png           → portada del panel del menú
       personajes/torneo_nova.jpg      → retrato del rival de los Cuartos
       personajes/torneo_bastion.jpg   → retrato del rival de la Semifinal
       personajes/torneo_eclipse.jpg   → retrato del rival de la Final
   Si falta alguna imagen se muestra un emoji en su lugar.

   QUÉ HACE LA IA DEL TORNEO (todo se puede ajustar abajo, en ROUNDS):
     🧠 Te estudia      Banea primero a los personajes que más has usado (y con
                        los que más has ganado) en las rondas anteriores.
     🎯 Counter-pick    Elige su equipo DESPUÉS de ver el tuyo: puntúa a cada
                        personaje según cómo le va contra el tuyo (velocidad,
                        daño, control, aguante) y evita repetir clase.
     ⚔️ Juego táctico   Remata si puede matar a tu personaje, no te regala
                        bajas (cambia de personaje cuando el activo va a caer)
                        y prioriza aturdir/congelar a tu activo.
     🔥 Aguante         Cada rival sobrevive a un número de golpes mortales
                        (ROUNDS[i].endure) quedándose con muy poca vida, para
                        llevarte al límite combate tras combate.
     📈 Mejores stats   Cada ronda sube vida/ATK/DEF/SPD del rival (multiplicadores
                        en ROUNDS[i].mult) y puede darle escudo inicial.

   Entre rondas eliges 1 de 3 MEJORAS al azar (PERKS) que se acumulan.
   El progreso del torneo se guarda en el navegador (puedes salir y continuar);
   recargar la página en mitad de un combate cuenta como abandono.
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  const TITLE      = 'Torneo vs IA';
  const COVER      = 'personajes/torneo.png';
  const RUN_KEY    = 'batalla-torneo-run';
  const STATS_KEY  = 'batalla-torneo-stats';

  /* ---------------------------------------------------------
     RONDAS / RIVALES
     mult   = multiplicadores sobre las stats base de su equipo.
     shield = escudo inicial como fracción de la vida máxima de cada uno.
     endure = golpes mortales que sobrevive el equipo rival (queda al 5 % de vida).
     --------------------------------------------------------- */
  const ROUNDS = [
    { id: 'cuartos', name: 'Cuartos de final', rival: 'Nova',    title: 'La Aspirante',  emoji: '🥊',
      img: 'personajes/torneo_nova.jpg',
      blurb: 'Joven y agresiva. Te estudia desde el primer baneo y no regala nada.',
      mult: { hp: 1.00, atk: 1.00, def: 1.00, spd: 1.00 }, shield: 0,    endure: 1 },
    { id: 'semis',   name: 'Semifinal',        rival: 'Bastión', title: 'El Muro',       emoji: '🛡️',
      img: 'personajes/torneo_bastion.jpg',
      blurb: 'Paciente y resistente. Aguanta cada golpe y te desgasta turno a turno.',
      mult: { hp: 1.08, atk: 1.04, def: 1.06, spd: 1.03 }, shield: 0.03, endure: 1 },
    { id: 'final',   name: 'Gran Final',       rival: 'Eclipse', title: 'La Campeona',   emoji: '👑',
      img: 'personajes/torneo_eclipse.jpg',
      blurb: 'La campeona invicta. Counter-pick perfecto y una voluntad que no se rompe.',
      mult: { hp: 1.15, atk: 1.08, def: 1.08, spd: 1.05 }, shield: 0.06, endure: 2 }
  ];

  /* ---------------------------------------------------------
     MEJORAS entre rondas (se acumulan; se aplican a tu equipo al empezar
     cada combate). Para añadir una nueva: nuevo objeto con apply(personaje, nº).
     --------------------------------------------------------- */
  const PERKS = [
    { id: 'fuerza',   icon: '💪', name: 'Fuerza',          desc: '+3 ATK a todo tu equipo.',
      apply: (c, n) => { c.atk += 3 * n; } },
    { id: 'guardia',  icon: '🛡️', name: 'Guardia',         desc: '+3 DEF a todo tu equipo.',
      apply: (c, n) => { c.def += 3 * n; } },
    { id: 'agilidad', icon: '⚡', name: 'Agilidad',        desc: '+3 SPD a todo tu equipo.',
      apply: (c, n) => { c.spd += 3 * n; } },
    { id: 'vitalidad',icon: '❤️', name: 'Vitalidad',       desc: '+12 de vida máxima a todo tu equipo.',
      apply: (c, n) => { c.maxHp += 12 * n; c.hp += 12 * n; } },
    { id: 'escudo',   icon: '🔰', name: 'Escudo inicial',  desc: 'Tu equipo empieza con +10 de escudo.',
      apply: (c, n) => { c.shield = (c.shield || 0) + 10 * n; } },
    { id: 'critico',  icon: '🎯', name: 'Puntería',        desc: '+8 % de probabilidad de crítico.',
      apply: (c, n) => {
        if (!Array.isArray(c.specialEffects)) c.specialEffects = [];
        c.specialEffects.push({ type: 'critChance', value: 8 * n, remaining: 99999 });
      } }
  ];
  const perkById = id => PERKS.find(p => p.id === id);

  /* =========================================================
     UTILIDADES
     ========================================================= */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function loadJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sin almacenamiento */ }
  }
  function removeKey(key) { try { localStorage.removeItem(key); } catch (e) { /* ignorar */ } }

  const baseName = id => { try { return (findBaseById(id) || {}).name || id; } catch (e) { return id; } };

  /* =========================================================
     ESTADO DEL TORNEO
     ========================================================= */
  // run: progreso guardado entre combates (o null si no hay torneo en curso)
  let run = loadJSON(RUN_KEY, null);
  let stats = Object.assign(
    { runs: 0, champions: 0, roundsWon: 0, eliminations: 0, bestRounds: 0, fastestTurns: null },
    loadJSON(STATS_KEY, {})
  );
  // T: estado del combate de torneo en curso (no se guarda)
  const T = { battle: false, ending: false, round: null, endureLeft: 0, notice: '' };

  const saveRun   = () => run ? saveJSON(RUN_KEY, run) : removeKey(RUN_KEY);
  const saveStats = () => saveJSON(STATS_KEY, stats);

  function newRun() {
    return { round: 0, perks: {}, used: {}, wonWith: {}, turns: 0, rounds: [], inBattle: false, pendingPerks: null, startedAt: Date.now() };
  }

  // Recargar la página en mitad de un combate cuenta como abandono (evita
  // "reiniciar" gratis un combate perdido).
  if (run && run.inBattle) {
    stats.eliminations++;
    stats.bestRounds = Math.max(stats.bestRounds, run.round || 0);
    T.notice = 'Abandonaste un combate (cerraste o recargaste la página) y quedaste eliminado del torneo anterior.';
    run = null;
    saveRun();
    saveStats();
  }

  /* =========================================================
     EVALUACIÓN DE PERSONAJES (IA del torneo)
     ========================================================= */
  const CONTROL_TYPES = ['stun', 'freeze', 'charm', 'fear', 'slow'];

  function effectsOf(move) {
    try { return getMoveEffects(move).filter(e => e && typeof e.type === 'string'); }
    catch (e) { return []; }
  }
  const hasControl = c => (c.moves || []).some(m => effectsOf(m).some(e => CONTROL_TYPES.includes(e.type)));
  const hasSustain = c => (c.moves || []).some(m => effectsOf(m).some(e => ['heal', 'shield', 'lifesteal', 'selfHealPct'].includes(e.type)));

  // Valoración general de un personaje (stats + habilidades).
  function rate(c) {
    let r = (c.atk || 0) * 1.2 + (c.def || 0) + (c.spd || 0) * 0.9 + (c.hp || 0) / 8;
    (c.moves || []).forEach(m => {
      r += (m.power || 0) * 0.35;
      effectsOf(m).forEach(e => {
        if (e.type === 'heal' || e.type === 'shield') r += (Number(e.value) || 0) * 0.15;
        else if (CONTROL_TYPES.includes(e.type)) r += 6;
        else if (e.type === 'debuff' || e.type === 'damageOverTime') r += 2.5;
        else if (e.type === 'lifesteal') r += 3;
      });
    });
    return r;
  }

  const avgOf = (team, k) => team.reduce((s, x) => s + (x[k] || 0), 0) / Math.max(1, team.length);

  // Cómo le va a un personaje contra el equipo del jugador.
  function matchup(c, playerTeam) {
    let s = rate(c);
    s += ((c.spd || 0) - avgOf(playerTeam, 'spd')) * 0.8;                       // mover primero
    s += ((c.atk || 0) / Math.max(1, avgOf(playerTeam, 'def'))) * 7;            // le hago daño
    s -= (avgOf(playerTeam, 'atk') / Math.max(1, c.def || 1)) * 4;              // me hacen daño
    if (hasControl(c) && avgOf(playerTeam, 'atk') >= 20) s += 7;                // neutralizar a sus atacantes
    if (hasSustain(c)) s += 4;
    return s + (Math.random() * 8 - 4);                                         // pizca de imprevisibilidad
  }

  /* =========================================================
     BANEOS: la IA te estudia
     ========================================================= */
  function historyWeight(id) {
    if (!run) return 0;
    return (run.used[id] || 0) * 45 + (run.wonWith[id] || 0) * 15;
  }

  function topStudied(n) {
    if (!run) return [];
    return Object.keys(run.used)
      .sort((a, b) => historyWeight(b) - historyWeight(a))
      .slice(0, n)
      .map(baseName);
  }

  function installBanPatch() {
    const _maybeAiBan = window.maybeAiBan;
    window.maybeAiBan = function () {
      if (!T.battle) return _maybeAiBan.apply(this, arguments);
      if (bansFinished()) return;
      const player = banTurnPlayer();
      if (!isAiBanner(player)) return;
      renderBanPhase();
      setTimeout(() => {
        if (bansFinished() || banTurnPlayer() !== player) return;
        const pool = CHARACTERS.filter(c => !isBanned(c.id));
        if (!pool.length) { commitBan(null); return; }
        const scored = pool
          .map(c => ({ c, score: rate(c) + historyWeight(c.id) + Math.random() * 10 }))
          .sort((a, b) => b.score - a.score);
        const pick = (scored.length > 1 && Math.random() < 0.2) ? scored[1].c : scored[0].c;
        commitBan(pick.id);
      }, 1000);
    };
  }

  /* =========================================================
     EQUIPO DEL RIVAL (counter-pick) + stats de ronda + mejoras
     ========================================================= */
  function buildRivalTeam(R) {
    const playerTeam = state.teams.p1;
    const taken = new Set(playerTeam.map(c => c.id));
    const pool = CHARACTERS.filter(c => !isBanned(c.id) && !taken.has(c.id));
    if (pool.length < 3) return null;

    const scored = pool.map(c => ({ c, s: matchup(c, playerTeam) })).sort((a, b) => b.s - a.s);
    const chosen = [];
    while (chosen.length < 3 && scored.length) {
      // penaliza repetir la clase principal para que el equipo sea variado
      scored.forEach(x => {
        const cls = (x.c.classes || [])[0];
        x.adj = x.s - (chosen.some(y => (y.classes || [])[0] === cls) ? 14 : 0);
      });
      scored.sort((a, b) => b.adj - a.adj);
      chosen.push(scored.shift().c);
    }
    // Siempre que se pueda, al menos un personaje con curación/escudo/robo de vida.
    if (!chosen.some(hasSustain)) {
      const sust = scored.slice(0, 12).find(x => hasSustain(x.c));
      if (sust) chosen[2] = sust.c;
    }
    // El primero en salir: el que mejor le gana al activo del jugador.
    const pLead = playerTeam[0];
    chosen.sort((a, b) => leadScore(b, pLead) - leadScore(a, pLead));

    return chosen.map(base => {
      const c = cloneCharacter(base);
      c.maxHp = Math.round(c.maxHp * R.mult.hp); c.hp = c.maxHp;
      c.atk = Math.round(c.atk * R.mult.atk);
      c.def = Math.round(c.def * R.mult.def);
      c.spd = Math.round(c.spd * R.mult.spd);
      c.shield = R.shield ? Math.round(c.maxHp * R.shield) : 0;
      return c;
    });
  }

  function leadScore(c, enemyLead) {
    if (!enemyLead) return rate(c);
    return ((c.spd || 0) - (enemyLead.spd || 0)) * 1.2 + ((c.atk || 0) / Math.max(1, enemyLead.def || 1)) * 8 + rate(c) * 0.05;
  }

  function applyPerks(heroes) {
    if (!run) return;
    Object.keys(run.perks).forEach(id => {
      const perk = perkById(id), n = run.perks[id];
      if (perk && n > 0) heroes.forEach(h => perk.apply(h, n));
    });
  }

  function installBattlePatches() {
    // --- Inicio del combate: equipo rival inteligente + mejoras del jugador ---
    const _startBattle = window.startBattle;
    window.startBattle = function () {
      if (T.battle && state.phase === 'select' && state.teams.p1.length === 3 && state.teams.p2.length < 3) {
        const R = T.round;
        const team = buildRivalTeam(R);
        if (team) {
          state.teams.p2 = team;
          applyPerks(state.teams.p1);
          try { renderPanel('p2'); renderSlots('p2'); } catch (e) { /* UI opcional */ }
          log(`🏆 ${R.emoji} ${R.rival} te ha estudiado y elige: ${team.map(c => c.name).join(', ')}.`);
          const perkTxt = describePerks();
          if (perkTxt) log(`✨ Tus mejoras: ${perkTxt}`);
          T.endureLeft = R.endure;
          if (R.endure > 0) log(`🔥 ${R.rival} tiene Aguante: sobrevivirá a ${R.endure} golpe${R.endure > 1 ? 's' : ''} mortal${R.endure > 1 ? 'es' : ''}.`);
        }
      }
      return _startBattle.apply(this, arguments);
    };

    // --- Tras los baneos: restablecer los rótulos del rival ---
    const _finishBan = window.finishBanPhase;
    window.finishBanPhase = function () {
      const r = _finishBan.apply(this, arguments);
      if (T.battle) setRivalLabels();
      return r;
    };

    // --- Aguante: el rival sobrevive a golpes mortales ---
    // Se comprueba justo tras cada golpe directo y, como red de seguridad,
    // antes de cada comprobación de KO (cubre veneno, quemadura, reflejo...).
    const _applyDamage = window.applyDamage;
    window.applyDamage = function (actor, target) {
      const r = _applyDamage.apply(this, arguments);
      try { tryEndure(target); } catch (e) { console.warn('torneo.js (aguante):', e); }
      return r;
    };

    // --- Fin del combate ---
    const _checkKO = window.checkKO;
    window.checkKO = function () {
      try { if (T.battle) state.teams.p2.forEach(tryEndure); } catch (e) { console.warn('torneo.js (aguante):', e); }
      const r = _checkKO.apply(this, arguments);
      if (r && T.battle && !T.ending) {
        T.ending = true;
        const playerDead = state.teams.p1.every(c => c.hp <= 0);
        const rivalDead  = state.teams.p2.every(c => c.hp <= 0);
        const win = rivalDead && !playerDead;      // un doble KO cuenta como derrota
        // Marca el combate como "no libre" para que perfil.js (que envuelve
        // checkKO después que nosotros) no lo anote en las estadísticas de
        // partidas libres. Se restablece en cleanupBattleUI().
        state.storyMode = true;
        setTimeout(() => finishRound(win), 1400);
      }
      return r;
    };

    // --- Decisiones tácticas de la IA ---
    const _aiChooseAction = window.aiChooseAction;
    window.aiChooseAction = function (options) {
      const base = _aiChooseAction.apply(this, arguments);
      if (!T.battle) return base;
      try { return tournamentAction(base, options || {}) || base; }
      catch (e) { console.warn('torneo.js (IA táctica):', e); return base; }
    };
  }

  function tryEndure(target) {
    if (!T.battle || T.endureLeft <= 0 || !target || target.hp > 0 || target._endured) return false;
    if (getKeyOfTarget(target) !== 'p2') return false;
    target._endured = true;
    T.endureLeft--;
    target.hp = Math.max(1, Math.round(target.maxHp * 0.05));
    log(`🔥 ¡${target.name} aguanta el golpe y se queda en pie con ${target.hp} de vida!`);
    if (typeof updateArena === 'function') updateArena();
    return true;
  }

  function setRivalLabels() {
    const R = T.round; if (!R) return;
    const t = byId('p2-title'); if (t) t.innerText = `${R.emoji} ${R.rival} — ${R.title}`;
    const l = byId('enemy-label'); if (l) l.innerText = R.rival;
    const i = byId('p2-info'); if (i) i.innerText = `${R.rival} elegirá su equipo viendo el tuyo`;
  }

  /* IA: remate, no regalar bajas, control prioritario. Devuelve una acción o null
     (null = usar la decisión normal de game.js). */
  function tournamentAction(base, options) {
    const actor = getActive('p2'), enemy = getActive('p1'), team = state.teams.p2;
    if (!actor || !enemy || actor.hp <= 0 || enemy.hp <= 0) return null;

    const ready = actor.moves.filter(m => m.cd === 0);
    const moveIgnores = m => typeof moveIgnoresShield === 'function' && moveIgnoresShield(m);
    const holdOf = m => moveIgnores(m) ? enemy.hp : enemy.hp + (enemy.shield || 0);

    // 1) REMATE: si una habilidad fiable puede matar al activo, se usa.
    let lethal = null;
    for (const m of ready) {
      if (!(m.power > 0) || (m.acc || 1) < 0.8) continue;
      if (aiEstimateDamage(actor, enemy, m) * 0.97 >= holdOf(m)) {
        if (!lethal || (m.acc || 1) > (lethal.acc || 1)) lethal = m;
      }
    }
    if (lethal) return { type: 'use', moveId: lethal.id, targetIdx: state.activeIndex.p2 };

    // 2) NO REGALAR BAJAS: si el activo puede morir en el siguiente golpe del
    //    rival, intenta poner a salvo a un compañero que aguante mejor.
    if (options.allowSwap !== false && base.type !== 'swap') {
      const since = state.turnCount - (state.aiLastSwapTurn || -999);
      const threat = bestHit(enemy, actor);
      if (since >= 2 && threat >= actor.hp + (actor.shield || 0)) {
        const cand = team
          .map((c, idx) => ({ c, idx }))
          .filter(x => x.c.hp > 0 && x.idx !== state.activeIndex.p2
                    && bestHit(enemy, x.c) < x.c.hp + (x.c.shield || 0))
          .sort((a, b) => (b.c.hp / b.c.maxHp) - (a.c.hp / a.c.maxHp))[0];
        if (cand) return { type: 'swap', idx: cand.idx };
      }
    }

    // 3) CONTROL: aturdir/congelar al activo cuando está sano y no está ya controlado.
    if (base.type === 'use') {
      const baseMove = actor.moves.find(m => m.id === base.moveId);
      const enemyFree = !(enemy.stunned > 0) && !hasControlEffect(enemy, 'freeze');
      const baseIsControl = baseMove && effectsOf(baseMove).some(e => e.type === 'stun' || e.type === 'freeze');
      if (enemyFree && !baseIsControl && enemy.hp / enemy.maxHp > 0.4) {
        const ctrl = ready.find(m => effectsOf(m).some(e =>
          (e.type === 'stun' || e.type === 'freeze') && (e.prob == null || e.prob >= 0.5)));
        if (ctrl && (ctrl.acc || 1) >= 0.85) {
          return { type: 'use', moveId: ctrl.id, targetIdx: state.activeIndex.p2 };
        }
      }
    }
    return null;
  }

  // Mayor daño estimado que `attacker` puede hacer a `target` con sus habilidades listas.
  function bestHit(attacker, target) {
    let best = 0;
    for (const m of attacker.moves) {
      if (m.cd > 0 || !(m.power > 0)) continue;
      best = Math.max(best, aiEstimateDamage(attacker, target, m));
    }
    return best;
  }

  /* =========================================================
     FLUJO DE RONDAS
     ========================================================= */
  function describePerks() {
    if (!run) return '';
    return Object.keys(run.perks).filter(id => run.perks[id] > 0 && perkById(id))
      .map(id => `${perkById(id).icon} ${perkById(id).name}${run.perks[id] > 1 ? ' ×' + run.perks[id] : ''}`).join(' · ');
  }

  function bannerHTML(extra) {
    const R = T.round;
    const n = run ? run.round + 1 : 1;
    return `<span>🏆 <b>${TITLE}</b> · Ronda ${n}/${ROUNDS.length}: ${esc(R.name)} — contra ${R.emoji} <b>${esc(R.rival)}</b> «${esc(R.title)}»` +
      `${extra || ''}</span><button type="button" class="class-btn tn-quit">🏳️ Abandonar torneo</button>`;
  }

  function mountBanners() {
    removeBanners();
    const studied = topStudied(3);
    const extra = studied.length ? `<br><small>🧠 ${esc(T.round.rival)} ha estudiado tus favoritos: ${esc(studied.join(', '))}.</small>` : '';

    const banBox = document.querySelector('#ban-phase .ban-card');
    if (banBox) {
      const el = document.createElement('div');
      el.className = 'tn-banner'; el.id = 'tn-ban-banner';
      el.innerHTML = bannerHTML(extra);
      banBox.insertBefore(el, banBox.firstChild);
      el.querySelector('.tn-quit').addEventListener('click', quitTournament);
    }
    const bb = byId('banned-banner');
    if (bb && bb.parentNode) {
      const el = document.createElement('div');
      el.className = 'tn-banner'; el.id = 'tn-battle-banner';
      el.innerHTML = bannerHTML('');
      bb.parentNode.insertBefore(el, bb);
      el.querySelector('.tn-quit').addEventListener('click', quitTournament);
    }
    const restart = byId('restartBtn');
    if (restart) restart.style.display = 'none';
  }

  function removeBanners() {
    ['tn-ban-banner', 'tn-battle-banner'].forEach(id => { const el = byId(id); if (el) el.remove(); });
    const restart = byId('restartBtn');
    if (restart) restart.style.display = '';
  }

  function startRound() {
    if (!run) run = newRun();
    const R = ROUNDS[run.round];
    if (!R) return;
    if (run.round === 0 && !run.counted) { run.counted = true; stats.runs++; saveStats(); }

    run.inBattle = true;
    saveRun();

    T.battle = true;
    T.ending = false;
    T.round = R;
    T.endureLeft = R.endure;

    byId('torneo-screen').style.display = 'none';
    startMode('pve', true);               // baneos + selección de equipo del juego
    setRivalLabels();
    const logEl = byId('log'); if (logEl) logEl.innerHTML = '';
    mountBanners();
  }

  function stopBattleAudio() {
    try { if (typeof stopBattleMusic === 'function') stopBattleMusic(); } catch (e) { /* ignorar */ }
    try { battleStarted = false; } catch (e) { /* ignorar */ }
  }

  function cleanupBattleUI() {
    removeBanners();
    byId('game-root').style.display = 'none';
    const ban = byId('ban-phase'); if (ban) ban.style.display = 'none';
    const sel = document.querySelector('.selector-row'); if (sel) sel.style.display = '';
    const sb = byId('startBtn'); if (sb) sb.style.display = '';
    const banner = byId('banned-banner'); if (banner) banner.style.display = 'none';
    stopBattleAudio();
    state.phase = 'select';
    state.storyMode = false;
    state.moveLock = false;
    T.battle = false;
    T.ending = false;
  }

  function quitTournament() {
    if (!T.battle) return;
    if (!confirm('¿Abandonar el torneo? Quedarás eliminado.')) return;
    state.phase = 'ended';                 // frena cualquier turno pendiente de la IA
    finishRound(false);
  }

  function finishRound(win) {
    if (!T.battle || !run) { cleanupBattleUI(); return; }
    const R = T.round;
    const turns = state.turnCount || 0;
    const teamIds = (state.teams.p1 || []).map(c => c.id);
    cleanupBattleUI();

    teamIds.forEach(id => {
      run.used[id] = (run.used[id] || 0) + 1;
      if (win) run.wonWith[id] = (run.wonWith[id] || 0) + 1;
    });
    run.inBattle = false;

    if (win) {
      run.rounds.push({ round: run.round, turns, team: teamIds });
      run.turns += turns;
      run.round++;
      stats.roundsWon++;
      stats.bestRounds = Math.max(stats.bestRounds, run.round);
      if (run.round >= ROUNDS.length) {
        stats.champions++;
        if (stats.fastestTurns == null || run.turns < stats.fastestTurns) stats.fastestTurns = run.turns;
        const summary = { turns: run.turns, perks: describePerks(), rounds: run.rounds.slice() };
        run = null; saveRun(); saveStats();
        openScreen();
        return renderChampion(summary);
      }
      run.pendingPerks = pickPerkOffer();
      saveRun(); saveStats();
      openScreen();
      return renderPerks(R, turns);
    }

    stats.eliminations++;
    stats.bestRounds = Math.max(stats.bestRounds, run.round);
    const summary = { round: run.round, rival: R, turns, perks: describePerks() };
    run = null; saveRun(); saveStats();
    openScreen();
    renderEliminated(summary);
  }

  function pickPerkOffer() {
    const ids = PERKS.map(p => p.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids.slice(0, 3);
  }

  /* =========================================================
     INTERFAZ
     ========================================================= */
  function injectStyles() {
    if (byId('torneo-styles')) return;
    const st = document.createElement('style');
    st.id = 'torneo-styles';
    st.textContent = `
    .menu-col{display:flex;flex-direction:column;gap:22px;flex:0 1 300px;width:min(300px,100%)}
    .menu-col > .story-poster-panel{flex:0 0 auto;width:100%}
    @media (max-width:900px){.menu-col{flex:0 1 auto;width:min(420px,100%)}}
    .tn-poster-panel{border-color:rgba(244,63,94,.5)!important;
      background:radial-gradient(circle at 50% 0%,rgba(244,63,94,.20),transparent 50%),linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),#190a10!important;
      box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 44px rgba(244,63,94,.16)!important}
    .tn-poster-panel:hover{box-shadow:0 30px 78px rgba(0,0,0,.58),0 0 60px rgba(244,63,94,.3)!important}
    .tn-poster-panel .story-poster-subtitle{color:#fda4af!important}
    .tn-poster-panel .story-poster-cta{background:linear-gradient(180deg,rgba(251,191,36,.96),rgba(217,119,6,.94))!important;color:#1a1204!important;box-shadow:0 10px 22px rgba(217,119,6,.36)!important}
    .tn-poster-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:150px;font-size:64px;border-radius:18px;background:linear-gradient(180deg,#4c0519,#150a0e)}

    #torneo-screen{position:fixed;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow:auto;z-index:122;
      background:radial-gradient(circle at 15% 0%,rgba(244,63,94,.16),transparent 34%),radial-gradient(circle at 85% 8%,rgba(251,191,36,.12),transparent 36%),linear-gradient(180deg,#12070b 0%,#1a0b11 55%,#070305 100%)}
    .tn-card{position:relative;width:min(960px,100%);padding:26px 24px 24px;border:1px solid rgba(244,63,94,.3);border-radius:22px;overflow:hidden;
      background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01)),linear-gradient(180deg,#1c0d14,#0d0609);
      box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 60px rgba(244,63,94,.08)}
    .tn-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#f43f5e,#fbbf24,#be123c)}
    .tn-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
    .tn-title{font-size:clamp(20px,2.4vw,28px);font-weight:800;background:linear-gradient(90deg,#fff,#fda4af,#fcd34d);-webkit-background-clip:text;background-clip:text;color:transparent}
    .tn-sub{color:#d9b8c0;font-size:13px;margin:4px 0 0}
    .tn-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .tn-primary{background:linear-gradient(180deg,rgba(251,191,36,.96),rgba(217,119,6,.94))!important;border-color:rgba(251,191,36,.6)!important;color:#1a1204!important;font-weight:800}
    .tn-danger{background:rgba(239,68,68,.15)!important;border-color:rgba(239,68,68,.4)!important}
    .tn-bracket{display:flex;align-items:stretch;gap:10px;flex-wrap:wrap;margin:14px 0}
    .tn-node{flex:1 1 200px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px;border-radius:16px;text-align:center;
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)}
    .tn-node.current{border-color:#fbbf24;box-shadow:0 0 0 1px #fbbf24 inset,0 0 26px rgba(251,191,36,.18);background:rgba(251,191,36,.07)}
    .tn-node.done{border-color:rgba(134,239,172,.5);background:rgba(134,239,172,.06)}
    .tn-node.locked{opacity:.5}
    .tn-node img,.tn-node .tn-fb{width:96px;height:96px;object-fit:cover;border-radius:14px;background:#2a1018}
    .tn-fb{display:flex;align-items:center;justify-content:center;font-size:44px}
    .tn-node-round{font-size:12px;color:#d9b8c0;text-transform:uppercase;letter-spacing:.04em;font-weight:700}
    .tn-node-name{font-weight:800}
    .tn-node-state{font-size:12px}
    .tn-panel{padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);margin:10px 0;font-size:14px}
    .tn-panel h4{margin:0 0 8px;font-size:15px;color:#fcd34d}
    .tn-list{margin:0;padding-left:18px;display:grid;gap:4px}
    .tn-stats{display:flex;gap:8px;flex-wrap:wrap}
    .tn-stat{padding:6px 12px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);font-size:13px}
    .tn-notice{padding:10px 14px;border-radius:12px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);margin:10px 0;font-size:14px}
    .tn-perks{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:14px 0}
    .tn-perk{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px;border-radius:16px;text-align:center;cursor:pointer;color:inherit;font:inherit;
      background:rgba(255,255,255,.04);border:1px solid rgba(251,191,36,.35);transition:transform .15s,box-shadow .15s}
    .tn-perk:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(0,0,0,.45),0 0 26px rgba(251,191,36,.25)}
    .tn-perk-icon{font-size:40px}.tn-perk b{font-size:16px}.tn-perk small{color:#d9b8c0}
    .tn-result{text-align:center;padding:10px 0}
    .tn-result h3{font-size:26px;margin:6px 0}
    .tn-win{color:#86efac}.tn-lose{color:#fca5a5}.tn-gold{color:#fcd34d}
    .tn-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:8px 14px;margin:0 0 10px;border-radius:12px;
      background:linear-gradient(90deg,rgba(244,63,94,.18),rgba(251,191,36,.12));border:1px solid rgba(244,63,94,.4);font-size:13px}
    .tn-banner .tn-quit{background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4)}
    @media (max-width:600px){.tn-card{padding:18px 14px}}
    `;
    document.head.appendChild(st);
  }

  function imgOrFallback(src, alt, emoji, cls) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" data-fb="${esc(emoji)}" data-cls="${esc(cls || 'tn-fb')}">`;
  }
  function wireImageFallbacks(root) {
    root.querySelectorAll('img[data-fb]').forEach(img => {
      img.addEventListener('error', () => {
        const fb = document.createElement('div');
        fb.className = img.dataset.cls || 'tn-fb';
        fb.textContent = img.dataset.fb || '🏆';
        img.replaceWith(fb);
      }, { once: true });
    });
  }

  function injectMarkup() {
    if (!byId('torneo-screen')) {
      const screen = document.createElement('div');
      screen.id = 'torneo-screen';
      screen.style.display = 'none';
      screen.innerHTML = `
        <div class="tn-card">
          <div class="tn-head">
            <div>
              <div class="tn-title">🏆 ${TITLE}</div>
              <p class="tn-sub">Gana ${ROUNDS.length} rondas con baneos contra una IA que te estudia y no se rinde. Si caes, quedas eliminado.</p>
            </div>
            <button id="tn-back" class="class-btn">⬅ Volver al menú</button>
          </div>
          <div id="tn-body"></div>
        </div>`;
      document.body.appendChild(screen);
      byId('tn-back').addEventListener('click', closeTorneo);
    }

    if (!byId('menu-torneo')) {
      const layout = document.querySelector('#main-menu .menu-layout');
      if (!layout) return;
      const story = byId('menu-story');
      let col = story && story.parentElement && story.parentElement.classList.contains('menu-col') ? story.parentElement : null;
      if (!col && story) {
        col = document.createElement('div');
        col.className = 'menu-col';
        story.parentNode.insertBefore(col, story);
        col.appendChild(story);
      }
      const btn = document.createElement('button');
      btn.id = 'menu-torneo';
      btn.className = 'story-poster-panel tn-poster-panel';
      btn.innerHTML = `
        <div class="story-poster-frame">${imgOrFallback(COVER, TITLE, '🏆', 'tn-poster-fallback')}</div>
        <span class="story-poster-title">🏆 ${TITLE}</span>
        <span class="story-poster-subtitle">Baneos · 3 rondas · IA implacable</span>
        <span class="story-poster-cta">▶ Competir</span>`;
      wireImageFallbacks(btn);
      (col || layout).appendChild(btn);
      btn.addEventListener('click', openTorneo);
    }
  }

  const body = () => byId('tn-body');

  function openScreen() {
    byId('main-menu').style.display = 'none';
    byId('torneo-screen').style.display = 'flex';
  }
  function openTorneo() {
    openScreen();
    if (run && run.pendingPerks) renderPerks(); else renderHome();
  }
  function closeTorneo() {
    byId('torneo-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
  }

  const pct = m => Math.round((m - 1) * 100);

  function rivalTraits(R) {
    const t = [
      '🧠 <b>Te estudia:</b> banea a los personajes que más usas y con los que más ganas.',
      '🎯 <b>Counter-pick:</b> elige su equipo viendo el tuyo.',
      '⚔️ <b>Juego táctico:</b> remata, no regala bajas y prioriza aturdir.'
    ];
    if (R.endure > 0) t.push(`🔥 <b>Aguante:</b> sobrevive a ${R.endure} golpe${R.endure > 1 ? 's' : ''} mortal${R.endure > 1 ? 'es' : ''} (queda al 5 % de vida).`);
    const up = ['hp', 'atk', 'def', 'spd'].filter(k => R.mult[k] > 1).map(k => `+${pct(R.mult[k])} % ${{ hp: 'vida', atk: 'ATK', def: 'DEF', spd: 'SPD' }[k]}`);
    if (up.length) t.push(`📈 <b>Stats:</b> ${up.join(', ')}.`);
    if (R.shield > 0) t.push(`🛡️ <b>Escudo inicial:</b> ${Math.round(R.shield * 100)} % de su vida máxima.`);
    return t;
  }

  /* ---------- Vista: inicio / bracket ---------- */
  function renderHome() {
    const cur = run ? run.round : 0;
    const R = ROUNDS[cur];

    const nodes = ROUNDS.map((r, i) => {
      const state_ = i < cur ? 'done' : (i === cur ? 'current' : 'locked');
      const label = state_ === 'done' ? '✅ Superada' : (state_ === 'current' ? '⚔️ Próxima' : '🔒 Pendiente');
      return `<div class="tn-node ${state_}">
        <div class="tn-node-round">${esc(r.name)}</div>
        ${imgOrFallback(r.img, r.rival, r.emoji, 'tn-fb')}
        <div class="tn-node-name">${r.emoji} ${esc(r.rival)}</div>
        <div class="tn-sub">${esc(r.title)}</div>
        <div class="tn-node-state">${label}</div>
      </div>`;
    }).join('');

    const perks = describePerks();
    const lastFast = stats.fastestTurns != null ? `${stats.fastestTurns} turnos` : '—';

    body().innerHTML = `
      ${T.notice ? `<div class="tn-notice">⚠️ ${esc(T.notice)}</div>` : ''}
      <div class="tn-bracket">${nodes}</div>

      <div class="tn-panel">
        <h4>${R.emoji} Próximo rival: ${esc(R.rival)} «${esc(R.title)}» — ${esc(R.name)}</h4>
        <p style="margin:0 0 8px">${esc(R.blurb)}</p>
        <ul class="tn-list">${rivalTraits(R).map(x => `<li>${x}</li>`).join('')}</ul>
      </div>

      ${perks ? `<div class="tn-panel"><h4>✨ Tus mejoras activas</h4>${perks}</div>` : ''}

      <div class="tn-row" style="margin:12px 0">
        <button id="tn-start" class="class-btn tn-primary">${run ? '▶ Continuar torneo' : '▶ Empezar torneo'}</button>
        ${run ? '<button id="tn-reset" class="class-btn tn-danger">🗑️ Descartar torneo</button>' : ''}
      </div>

      <div class="tn-panel">
        <h4>📊 Tus récords</h4>
        <div class="tn-stats">
          <span class="tn-stat">🏆 Torneos ganados: <b>${stats.champions}</b></span>
          <span class="tn-stat">🎮 Torneos jugados: <b>${stats.runs}</b></span>
          <span class="tn-stat">⚔️ Rondas ganadas: <b>${stats.roundsWon}</b></span>
          <span class="tn-stat">🥇 Mejor ronda: <b>${stats.bestRounds}/${ROUNDS.length}</b></span>
          <span class="tn-stat">⏱️ Campeón más rápido: <b>${lastFast}</b></span>
        </div>
      </div>

      <div class="tn-panel">
        <h4>📜 Cómo funciona</h4>
        <ul class="tn-list">
          <li>Cada ronda empieza con la <b>fase de baneos</b> (4 por jugador) y luego eliges tu equipo de 3.</li>
          <li>Pierdes un combate = <b>eliminado</b>. Si ganas, eliges <b>1 de 3 mejoras</b> que se acumulan.</li>
          <li>Tu progreso se guarda, pero <b>recargar la página en pleno combate cuenta como abandono</b>.</li>
        </ul>
      </div>`;

    T.notice = '';
    byId('tn-start').addEventListener('click', startRound);
    const reset = byId('tn-reset');
    if (reset) reset.addEventListener('click', () => {
      if (!confirm('¿Descartar el torneo en curso? Perderás el progreso y las mejoras.')) return;
      run = null; saveRun(); renderHome();
    });
  }

  /* ---------- Vista: elegir mejora (tras ganar una ronda) ---------- */
  function renderPerks(wonRound, turns) {
    if (!run || !run.pendingPerks) return renderHome();
    const next = ROUNDS[run.round];
    const offer = run.pendingPerks.map(perkById).filter(Boolean);
    const winMsg = wonRound
      ? `<h3 class="tn-win">✅ ¡Ronda superada!</h3><p class="tn-sub">Has vencido a ${wonRound.emoji} ${esc(wonRound.rival)} en ${turns} turnos.</p>`
      : `<h3 class="tn-gold">✨ Elige tu mejora</h3>`;

    body().innerHTML = `
      <div class="tn-result">
        ${winMsg}
        <p class="tn-sub">Elige una mejora para el resto del torneo. Siguiente rival: ${next.emoji} <b>${esc(next.rival)}</b> (${esc(next.name)}).</p>
      </div>
      <div class="tn-perks">
        ${offer.map(p => `
          <button class="tn-perk" data-perk="${p.id}">
            <span class="tn-perk-icon">${p.icon}</span>
            <b>${esc(p.name)}</b>
            <small>${esc(p.desc)}</small>
            ${run.perks[p.id] ? `<small>Ya tienes ×${run.perks[p.id]}</small>` : ''}
          </button>`).join('')}
      </div>`;

    body().querySelectorAll('.tn-perk').forEach(el => el.addEventListener('click', () => {
      const id = el.dataset.perk;
      run.perks[id] = (run.perks[id] || 0) + 1;
      run.pendingPerks = null;
      saveRun();
      renderHome();
    }));
  }

  /* ---------- Vista: eliminado ---------- */
  function renderEliminated(s) {
    const n = s.round;
    body().innerHTML = `
      <div class="tn-result">
        <h3 class="tn-lose">💀 Eliminado en ${esc(s.rival.name)}</h3>
        <p class="tn-note">${s.rival.emoji} <b>${esc(s.rival.rival)}</b> «${esc(s.rival.title)}» te ha frenado.
          Superaste ${n} de ${ROUNDS.length} ronda${n === 1 ? '' : 's'}.</p>
        ${s.perks ? `<p class="tn-sub">Mejoras que llevabas: ${s.perks}</p>` : ''}
        <div class="tn-row" style="justify-content:center;margin-top:14px">
          <button id="tn-again" class="class-btn tn-primary">🔁 Nuevo torneo</button>
          <button id="tn-menu" class="class-btn">⬅ Menú</button>
        </div>
      </div>`;
    byId('tn-again').addEventListener('click', renderHome);
    byId('tn-menu').addEventListener('click', closeTorneo);
  }

  /* ---------- Vista: campeón ---------- */
  function renderChampion(s) {
    body().innerHTML = `
      <div class="tn-result">
        <div style="font-size:64px">🏆</div>
        <h3 class="tn-gold">¡CAMPEÓN DEL TORNEO!</h3>
        <p class="tn-note">Has derrotado a los ${ROUNDS.length} rivales en ${s.turns} turnos en total.</p>
        ${s.perks ? `<p class="tn-sub">Mejoras con las que ganaste: ${s.perks}</p>` : ''}
        <div class="tn-row" style="justify-content:center;margin-top:14px">
          <button id="tn-again" class="class-btn tn-primary">🔁 Nuevo torneo</button>
          <button id="tn-menu" class="class-btn">⬅ Menú</button>
        </div>
      </div>`;
    byId('tn-again').addEventListener('click', renderHome);
    byId('tn-menu').addEventListener('click', closeTorneo);
  }

  /* =========================================================
     ARRANQUE
     ========================================================= */
  let installed = false;
  function init() {
    if (installed) return;
    installed = true;
    injectStyles();
    injectMarkup();
    if (typeof window.startBattle === 'function' && typeof window.checkKO === 'function') {
      installBanPatch();
      installBattlePatches();
    } else {
      console.warn('torneo.js: game.js no está cargado; el modo Torneo no se activará.');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.TORNEO = { open: openTorneo, ROUNDS, PERKS, getRun: () => run, getStats: () => stats };
})();
