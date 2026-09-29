/* infierno.js
   Modo "Infierno Infinito": una torre de pisos sin final.

   - Cada piso tiene un equipo rival FIJO (hecho de antes), uno o varios
     EFECTOS de piso que alteran el combate y RESTRICCIONES que solo te
     afectan a ti al formar tu equipo.
   - Los pisos que superas quedan guardados y puedes volver a jugarlos
     cuando quieras. Superar el piso N desbloquea el N+1.
   - Más allá de los pisos diseñados a mano, la torre se genera sola de
     forma determinista (el piso 57 siempre es el mismo piso 57), así que
     no tiene techo.

   INSTALACIÓN (un solo archivo, sin tocar game.js ni personajes.js):
     En juego.html, justo después de <script src="game.js" defer></script>:
       <script src="infierno.js" defer></script>
     Imagen de portada:  personajes/infierno.jpg

   El archivo se engancha al motor existente (state, cloneCharacter,
   startBattle, checkKO...) envolviendo unas pocas funciones globales.
   Cuando no estás en el Infierno, esos envoltorios no hacen nada.

   PARA EDITAR:
   - Pisos a mano:       HELL_CURATED (más abajo).
   - Efectos nuevos:     HELL_EFFECTS + (si actúan en combate) applyEffectsAtStart
                         o hellBeforeTurn / los hooks de installHooks().
   - Restricciones:      HELL_RESTRICTIONS + charBlockReason / teamProblems.
   - Dificultad:         scaleFor().
*/
(function () {
  'use strict';

  if (typeof CHARACTERS === 'undefined' || typeof state === 'undefined' ||
      typeof cloneCharacter !== 'function') {
    console.warn('[infierno.js] Debe cargarse DESPUÉS de personajes.js y game.js.');
    return;
  }

  /* =========================================================
     CONFIGURACIÓN
     ========================================================= */
  const HELL_TITLE = 'Infierno Infinito';
  const HELL_COVER = 'personajes/infierno.jpg';
  const SAVE_KEY   = 'batalla-infierno-progress';
  const TEAMS_KEY  = 'batalla-infierno-teams';
  const PAGE_SIZE  = 10;   // pisos por página en la torre
  const BOSS_EVERY = 5;    // cada cuántos pisos hay un guardián

  const byId = id => document.getElementById(id);

  /* =========================================================
     EFECTOS DE PISO
     side: 'all' afecta a los dos bandos · 'enemy' a los demonios · 'you' a ti
     ========================================================= */
  const HELL_EFFECTS = {
    ashes:       { icon: '🔥', side: 'all',   name: 'Suelo de brasas',        desc: 'Al empezar cada turno, todos pierden un 3% de su HP máximo (nunca mata).' },
    frost:       { icon: '❄️', side: 'all',   name: 'Ventisca eterna',        desc: 'Todos los personajes tienen un 25% menos de SPD.' },
    glass:       { icon: '🔮', side: 'all',   name: 'Realidad quebradiza',    desc: 'Todos los personajes tienen un 35% menos de DEF.' },
    rage:        { icon: '😈', side: 'enemy', name: 'Furia demoníaca',        desc: 'Los demonios tienen +30% de ATK.' },
    carapace:    { icon: '🛡️', side: 'enemy', name: 'Caparazón infernal',     desc: 'Los demonios tienen +30% de DEF.' },
    legion:      { icon: '👹', side: 'enemy', name: 'Legión',                 desc: 'Los demonios tienen +40% de HP.' },
    ward:        { icon: '🧿', side: 'enemy', name: 'Barrera maldita',        desc: 'Los demonios empiezan con un escudo del 25% de su HP.' },
    regen:       { icon: '💚', side: 'enemy', name: 'Regeneración impía',     desc: 'El demonio activo recupera un 6% de su HP máximo al empezar su turno.' },
    abyssEye:    { icon: '👁️', side: 'enemy', name: 'Ojo del abismo',         desc: 'Los demonios tienen +25% de probabilidad de golpe crítico.' },
    cursedBlood: { icon: '🩸', side: 'you',   name: 'Sangre maldita',         desc: 'Tus curaciones son un 50% menos efectivas.' },
    thorns:      { icon: '🌵', side: 'you',   name: 'Espinas ardientes',      desc: 'Sufres un 10% del daño que infliges a los demonios.' },
    drain:       { icon: '🕯️', side: 'you',   name: 'Maldición del condenado', desc: 'Tu personaje activo pierde un 5% de su HP máximo al empezar tu turno (nunca mata).' }
  };
  const EFFECT_ORDER = Object.keys(HELL_EFFECTS);

  /* =========================================================
     RESTRICCIONES (solo para ti)
     Se escriben como texto: 'tipo' o 'tipo:argumento'.
     ========================================================= */
  const CLASS_LABELS = (typeof CLASSES !== 'undefined')
    ? Object.fromEntries(CLASSES.map(c => [c.key, c.label]))
    : { atacante: '🗡️ Atacante', defensor: '🛡️ Defensor', sanador: '💊 Sanador', soporte: '⚙️ Soporte', debilitador: '☠️ Debilitador', mago: '🧙‍♀️ Mago', control: '🤖 Control' };

  function describeRestriction(r) {
    const [type, arg] = r.split(':');
    switch (type) {
      case 'noClass':     return { icon: '🚫', name: 'Clase prohibida',      desc: `No puedes usar personajes de clase ${CLASS_LABELS[arg] || arg}.` };
      case 'size1':       return { icon: '☝️', name: 'Lucha en solitario',   desc: 'Solo puedes llevar 1 personaje.' };
      case 'size2':       return { icon: '✌️', name: 'Equipo reducido',      desc: 'Solo puedes llevar 2 personajes.' };
      case 'noSwap':      return { icon: '⛓️', name: 'Encadenados',          desc: 'No puedes cambiar de personaje voluntariamente durante el combate.' };
      case 'hp70':        return { icon: '🤕', name: 'Llegas herido',        desc: 'Tu equipo empieza el combate con solo el 70% de su HP.' };
      case 'cdPlus':      return { icon: '⏳', name: 'Tiempo denso',         desc: 'Tus habilidades con enfriamiento tardan 1 turno más en recargarse.' };
      case 'uniqueClass': return { icon: '🎭', name: 'Sin clones',           desc: 'No puedes llevar dos personajes con la misma clase principal (la primera de su lista).' };
      case 'lightOnly':   return { icon: '🪶', name: 'Solo ligeros',         desc: 'Solo personajes con 125 de HP o menos.' };
      case 'softHit':     return { icon: '🧤', name: 'Sin fuerza bruta',     desc: 'Solo personajes con 30 de ATK o menos.' };
      case 'noFast':      return { icon: '🐢', name: 'Sin velocistas',       desc: 'Solo personajes con 22 de SPD o menos.' };
      default:            return { icon: '❔', name: r, desc: '' };
    }
  }

  function teamSizeFor(restrictions) {
    if (restrictions.includes('size1')) return 1;
    if (restrictions.includes('size2')) return 2;
    return 3;
  }

  function primaryClass(base) { return (base.classes && base.classes[0]) || ''; }

  /* Motivo por el que un personaje NO se puede elegir (o null si sí).
     `selected` = bases ya elegidas, para las reglas que dependen del equipo. */
  function charBlockReason(base, restrictions, selected) {
    for (const r of restrictions) {
      const [type, arg] = r.split(':');
      if (type === 'noClass' && (base.classes || []).includes(arg)) return `Clase prohibida (${CLASS_LABELS[arg] || arg})`;
      if (type === 'lightOnly' && base.hp > 125) return 'Demasiado pesado (HP máx. 125)';
      if (type === 'softHit' && base.atk > 30) return 'Demasiada fuerza (ATK máx. 30)';
      if (type === 'noFast' && base.spd > 22) return 'Demasiado rápido (SPD máx. 22)';
      if (type === 'uniqueClass' && selected) {
        const clash = selected.find(s => s.id !== base.id && primaryClass(s) === primaryClass(base));
        if (clash) return `Ya llevas a ${clash.name} (misma clase principal)`;
      }
    }
    return null;
  }

  function teamProblems(bases, restrictions) {
    const problems = [];
    const size = teamSizeFor(restrictions);
    if (bases.length !== size) problems.push(`Elige ${size} personaje${size > 1 ? 's' : ''} (llevas ${bases.length}).`);
    bases.forEach(b => {
      const why = charBlockReason(b, restrictions, bases);
      if (why) problems.push(`${b.name}: ${why}.`);
    });
    return problems;
  }

  /* ¿Existe al menos una forma razonable de cumplir estas restricciones? */
  function feasible(restrictions) {
    const size = teamSizeFor(restrictions);
    const allowed = CHARACTERS.filter(c => !charBlockReason(c, restrictions, null));
    if (allowed.length < size * 6) return false;
    if (restrictions.includes('uniqueClass')) {
      const distinct = new Set(allowed.map(primaryClass));
      if (distinct.size < size + 1) return false;
    }
    return true;
  }

  /* =========================================================
     DEFINICIÓN DE PISOS
     Los pisos 1-10 están hechos a mano. El resto se genera solo.
     ========================================================= */
  const HELL_CURATED = {
    1:  { name: 'El Limbo',                  enemies: ['wooper', 'shrek', 'nobita'],                          effects: [],                              restrictions: [] },
    2:  { name: 'Círculo de la Lujuria',     enemies: ['kevin', 'hornet', 'ladybug'],                         effects: ['ashes'],                       restrictions: [] },
    3:  { name: 'Círculo de la Gula',        enemies: ['clarence', 'gfamaka', 'Matador'],                     effects: ['frost'],                       restrictions: ['noClass:sanador'] },
    4:  { name: 'Círculo de la Avaricia',    enemies: ['tenshi', 'antonio', 'goku'],                          effects: ['rage'],                        restrictions: ['hp70'] },
    5:  { name: 'Guardián del Círculo de la Ira', enemies: ['abascal', 'presi', 'adam'],                      effects: ['legion', 'ashes'],             restrictions: ['noSwap'] },
    6:  { name: 'Círculo de la Herejía',     enemies: ['isaac', 'hsin_wuthering_waves', 'mint_nte'],          effects: ['glass'],                       restrictions: ['size2'] },
    7:  { name: 'Círculo de la Violencia',   enemies: ['unohana', 'nel', 'spanish_miku'],                     effects: ['regen', 'cursedBlood'],        restrictions: ['cdPlus'] },
    8:  { name: 'Círculo del Fraude',        enemies: ['itachi', 'deidara', 'naruto'],                        effects: ['abyssEye'],                    restrictions: ['uniqueClass'] },
    9:  { name: 'Círculo de la Traición',    enemies: ['mereoleona', 'shalltear', 'power'],                   effects: ['thorns', 'carapace'],          restrictions: ['lightOnly'] },
    10: { name: 'Guardián del Trono Infernal', enemies: ['papudo', 'senor_holograma', 'simon'],               effects: ['rage', 'drain', 'regen'],      restrictions: ['noSwap', 'noClass:sanador'] }
  };

  const CIRCLES = ['Limbo', 'Lujuria', 'Gula', 'Avaricia', 'Ira', 'Herejía', 'Violencia', 'Fraude', 'Traición'];
  const ROMAN = ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];

  function floorName(n, boss) {
    const c = CIRCLES[(n - 1) % CIRCLES.length];
    const tier = Math.floor((n - 1) / CIRCLES.length);
    const suffix = tier < ROMAN.length ? ROMAN[tier] : ` (${tier + 1})`;
    const base = c === 'Limbo' ? `El Limbo${suffix}` : `Círculo de la ${c}${suffix}`.replace('de la Herejía', 'de la Herejía');
    return boss ? `Guardián del ${base.replace(/^El /, '')}` : base;
  }

  /* Generador pseudoaleatorio con semilla (mismo piso => mismo resultado). */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const seedFor = (n, salt) => (Math.imul(n, 2654435761) ^ Math.imul(salt || 1, 0x9E3779B9)) >>> 0;
  const pickOne = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  const isBoss = n => n % BOSS_EVERY === 0;

  /* Efectos + restricciones + nombre del piso. Depende SOLO de n
     (y de la plantilla de restricciones), no de qué personajes existan. */
  const metaCache = {};
  function floorMeta(n) {
    if (metaCache[n]) return metaCache[n];
    const boss = isBoss(n);
    let meta;

    if (HELL_CURATED[n]) {
      const c = HELL_CURATED[n];
      meta = { n, boss, name: c.name, effects: c.effects.slice(), restrictions: c.restrictions.slice() };
    } else {
      const rng = mulberry32(seedFor(n, 7));

      // --- Efectos
      const effCount = Math.min(4, 1 + (boss ? 1 : 0) + (n >= 20 ? 1 : 0) + (n >= 50 ? 1 : 0));
      const effects = [];
      let guard = 0;
      while (effects.length < effCount && guard++ < 40) {
        const e = pickOne(rng, EFFECT_ORDER);
        if (!effects.includes(e)) effects.push(e);
      }

      // --- Restricciones
      const resCount = n < 3 ? 0 : Math.min(4, 1 + (boss ? 1 : 0) + (n >= 25 ? 1 : 0) + (n >= 60 ? 1 : 0));
      const pool = ['noSwap', 'hp70', 'cdPlus', 'uniqueClass', 'lightOnly', 'softHit', 'noFast', 'size2',
        'noClass:sanador', 'noClass:defensor', 'noClass:atacante', 'noClass:mago', 'noClass:control',
        'noClass:soporte', 'noClass:debilitador'];
      if (boss && n >= 15) pool.push('size1');
      const restrictions = [];
      guard = 0;
      while (restrictions.length < resCount && guard++ < 80) {
        const r = pickOne(rng, pool);
        if (restrictions.includes(r)) continue;
        if ((r === 'size1' || r === 'size2') && restrictions.some(x => x === 'size1' || x === 'size2')) continue;
        if (r.startsWith('noClass') && restrictions.filter(x => x.startsWith('noClass')).length >= 2) continue;
        // límites de peso máximo: no mezclar dos filtros de stats a la vez
        const statFilters = ['lightOnly', 'softHit', 'noFast'];
        if (statFilters.includes(r) && restrictions.some(x => statFilters.includes(x))) continue;
        if (!feasible(restrictions.concat(r))) continue;
        restrictions.push(r);
      }

      meta = { n, boss, name: floorName(n, boss), effects, restrictions };
    }
    metaCache[n] = meta;
    return meta;
  }

  /* Multiplicadores de los demonios según el piso. */
  function scaleFor(n) {
    const boss = isBoss(n);
    return {
      hp:  1 + 0.035 * (n - 1) + (boss ? 0.15 : 0),
      atk: 1 + 0.030 * (n - 1) + (boss ? 0.10 : 0),
      def: 1 + 0.020 * (n - 1) + (boss ? 0.05 : 0)
    };
  }

  /* ---- Equipos rivales (dependen del plantel; se guardan al generarse
         para que un piso no cambie si más adelante añades personajes) ---- */
  function baseById(id) {
    if (typeof findBaseById === 'function') return findBaseById(id);
    return CHARACTERS.find(c => c.id === id);
  }

  let powerPool = null;
  function getPowerPool() {
    if (powerPool && powerPool.length === CHARACTERS.length) return powerPool;
    const power = c => c.hp * 0.6 + c.atk * 2.5 + c.def * 2 + c.spd * 1.2;
    powerPool = CHARACTERS.slice().sort((a, b) => power(a) - power(b) || String(a.id).localeCompare(String(b.id)));
    return powerPool;
  }

  function generateEnemies(n) {
    const pool = getPowerPool();
    const N = pool.length;
    const rng = mulberry32(seedFor(n, 13));
    const boss = isBoss(n);
    const center = boss ? 0.88 : Math.min(0.9, 0.10 + n * 0.028);
    const lo = Math.max(0, Math.floor((center - 0.16) * N));
    const hi = Math.min(N, Math.max(lo + 6, Math.ceil((center + 0.12) * N)));
    const ids = [];
    let guard = 0;
    while (ids.length < 3 && guard++ < 200) {
      const c = pool[lo + Math.floor(rng() * (hi - lo))];
      if (c && !ids.includes(c.id)) ids.push(c.id);
    }
    return ids;
  }

  function loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw); } catch (e) { /* sin permiso */ }
    return fallback;
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* se ignora */ }
  }

  function floorEnemyIds(n) {
    const cur = HELL_CURATED[n];
    if (cur && cur.enemies.every(baseById)) return cur.enemies.slice();
    const saved = loadJSON(TEAMS_KEY, {});
    if (Array.isArray(saved[n]) && saved[n].length && saved[n].every(baseById)) return saved[n].slice();
    const ids = generateEnemies(n);
    saved[n] = ids;
    saveJSON(TEAMS_KEY, saved);
    return ids;
  }

  function getFloor(n) {
    const meta = floorMeta(n);
    return Object.assign({}, meta, { enemies: floorEnemyIds(n), scale: scaleFor(n), teamSize: teamSizeFor(meta.restrictions) });
  }

  /* =========================================================
     PROGRESO
     ========================================================= */
  function loadProgress() {
    const p = loadJSON(SAVE_KEY, null);
    if (!p || typeof p !== 'object') return { highest: 0, cleared: {} };
    return { highest: Number(p.highest) || 0, cleared: p.cleared && typeof p.cleared === 'object' ? p.cleared : {} };
  }
  function saveProgress(p) { saveJSON(SAVE_KEY, p); }

  function recordWin(n, turns, teamIds) {
    const p = loadProgress();
    const prev = p.cleared[n];
    const wasNew = !prev;
    p.cleared[n] = {
      clears: (prev ? prev.clears : 0) + 1,
      bestTurns: prev && prev.bestTurns ? Math.min(prev.bestTurns, turns) : turns,
      team: teamIds
    };
    if (n > p.highest) p.highest = n;
    saveProgress(p);
    return { wasNew, progress: p };
  }

  /* =========================================================
     HOOKS DEL MOTOR
     ========================================================= */
  const H = { active: false, floor: null, effects: [], restrictions: [], teamIds: [] };
  const hasEffect = id => H.active && H.effects.includes(id);
  const hasRestriction = id => H.active && H.restrictions.includes(id);
  const inTeam = (p, c) => Array.isArray(state.teams[p]) && state.teams[p].includes(c);

  function safeLog(txt) { if (typeof log === 'function') log(txt); }

  function hellBeforeTurn() {
    const owner = state.turnOwner;

    if (hasEffect('ashes')) {
      ['p1', 'p2'].forEach(p => state.teams[p].forEach(c => {
        if (c.hp > 1) {
          const loss = Math.min(c.hp - 1, Math.max(2, Math.round(c.maxHp * 0.03)));
          c.hp -= loss;
        }
      }));
      safeLog('🔥 El suelo de brasas quema a todos.');
    }

    if (hasEffect('regen') && owner === 'p2') {
      const a = state.teams.p2[state.activeIndex.p2];
      if (a && a.hp > 0 && a.hp < a.maxHp) {
        const heal = Math.min(a.maxHp - a.hp, Math.round(a.maxHp * 0.06));
        a.hp += heal;
        safeLog(`💚 ${a.name} se regenera (+${heal} HP) por la Regeneración impía.`);
      }
    }

    if (hasEffect('drain') && owner === 'p1') {
      const a = state.teams.p1[state.activeIndex.p1];
      if (a && a.hp > 1) {
        const loss = Math.min(a.hp - 1, Math.max(2, Math.round(a.maxHp * 0.05)));
        a.hp -= loss;
        safeLog(`🕯️ ${a.name} pierde ${loss} HP por la Maldición del condenado.`);
      }
    }
  }

  let hooksInstalled = false;
  function installHooks() {
    if (hooksInstalled) return;
    hooksInstalled = true;

    // Efectos que ocurren al empezar cada turno
    const _startTurn = window.startTurnActions;
    if (typeof _startTurn === 'function') {
      window.startTurnActions = function () {
        if (H.active && state.phase === 'battle' && state.turnCount > 0) hellBeforeTurn();
        return _startTurn.apply(this, arguments);
      };
    }

    // Sangre maldita: tus curaciones valen la mitad
    const _heal = window.applyHealing;
    if (typeof _heal === 'function') {
      window.applyHealing = function (actor, target, amount, src) {
        if (hasEffect('cursedBlood') && inTeam('p1', target)) amount = Math.round((Number(amount) || 0) * 0.5);
        return _heal.call(this, actor, target, amount, src);
      };
    }

    // Ojo del abismo: más críticos para los demonios
    const _crit = window.getCritChance;
    if (typeof _crit === 'function') {
      window.getCritChance = function (actor) {
        const base = _crit.apply(this, arguments);
        if (hasEffect('abyssEye') && inTeam('p2', actor)) return Math.min(1, base + 0.25);
        return base;
      };
    }

    // Espinas ardientes: retroceso al dañar a los demonios
    const _dmg = window.applyDamage;
    if (typeof _dmg === 'function') {
      window.applyDamage = function (actor, target) {
        const before = target ? target.hp : 0;
        const res = _dmg.apply(this, arguments);
        if (hasEffect('thorns') && target && inTeam('p1', actor) && inTeam('p2', target) && actor.hp > 0) {
          const dealt = before - target.hp;
          if (dealt > 0) {
            const rec = Math.max(1, Math.round(dealt * 0.10));
            actor.hp = Math.max(0, actor.hp - rec);
            safeLog(`🌵 ${actor.name} sufre ${rec} de retroceso por las Espinas ardientes.`);
          }
        }
        return res;
      };
    }

    // Encadenados: sin cambios voluntarios de personaje
    const _swap = window.performSwap;
    if (typeof _swap === 'function') {
      window.performSwap = function (player) {
        if (hasRestriction('noSwap') && player === 'p1' && state.phase === 'battle') {
          safeLog('⛓️ Estás encadenado: no puedes cambiar de personaje.');
          return;
        }
        return _swap.apply(this, arguments);
      };
    }
    const _moves = window.renderMovesArea;
    if (typeof _moves === 'function') {
      window.renderMovesArea = function () {
        const res = _moves.apply(this, arguments);
        if (hasRestriction('noSwap')) {
          document.querySelectorAll('#moves-area .swap-btn').forEach(b => b.remove());
        }
        return res;
      };
    }

    // Fin de combate: si estamos en el Infierno, lo gestionamos nosotros
    const _end = window.onStoryBattleEnd;
    window.onStoryBattleEnd = function (result) {
      if (H.active) return hellOnBattleEnd(result);
      return typeof _end === 'function' ? _end.apply(this, arguments) : undefined;
    };
  }

  /* Prepara los dos equipos con estadísticas, efectos y restricciones aplicados. */
  function buildTeams(floor, heroBases) {
    const enemies = floor.enemies.map(id => cloneCharacter(baseById(id)));
    const heroes = heroBases.map(b => cloneCharacter(b));
    const s = floor.scale;
    const eff = floor.effects, res = floor.restrictions;

    // Escalado por piso (solo demonios)
    enemies.forEach(c => {
      c.maxHp = Math.round(c.maxHp * s.hp);  c.hp = c.maxHp;
      c.atk = Math.round(c.atk * s.atk);
      c.def = Math.round(c.def * s.def);
    });

    // Efectos de estadísticas
    const all = heroes.concat(enemies);
    if (eff.includes('frost'))    all.forEach(c => { c.spd = Math.max(1, Math.round(c.spd * 0.75)); });
    if (eff.includes('glass'))    all.forEach(c => { c.def = Math.max(1, Math.round(c.def * 0.65)); });
    if (eff.includes('rage'))     enemies.forEach(c => { c.atk = Math.round(c.atk * 1.30); });
    if (eff.includes('carapace')) enemies.forEach(c => { c.def = Math.round(c.def * 1.30); });
    if (eff.includes('legion'))   enemies.forEach(c => { c.maxHp = Math.round(c.maxHp * 1.40); c.hp = c.maxHp; });
    if (eff.includes('ward'))     enemies.forEach(c => { c.shield = Math.round(c.maxHp * 0.25); });

    // Restricciones que tocan el estado inicial
    if (res.includes('hp70'))   heroes.forEach(c => { c.hp = Math.max(1, Math.round(c.maxHp * 0.70)); });
    if (res.includes('cdPlus')) heroes.forEach(c => c.moves.forEach(m => { if (m.baseCooldown > 0) m.baseCooldown += 1; }));

    return { heroes, enemies };
  }

  /* =========================================================
     LANZAR / TERMINAR UN COMBATE
     ========================================================= */
  function startFloor(n, teamIds) {
    const floor = getFloor(n);
    const heroBases = teamIds.map(baseById).filter(Boolean);
    const problems = teamProblems(heroBases, floor.restrictions);
    if (problems.length) { alert(problems.join('\n')); return; }

    const { heroes, enemies } = buildTeams(floor, heroBases);

    H.active = true;
    H.floor = floor;
    H.effects = floor.effects.slice();
    H.restrictions = floor.restrictions.slice();
    H.teamIds = teamIds.slice();

    state.mode = 'pve';
    window.GAME_MODE = 'pve';
    state.bansEnabled = false;
    state.storyMode = true;          // reutiliza el flujo de "combate scriptado"
    state.moveLock = false;
    state.teams.p1 = heroes;
    state.teams.p2 = enemies;
    state.activeIndex.p1 = 0;
    state.activeIndex.p2 = 0;

    byId('hell-screen').style.display = 'none';
    byId('game-root').style.display = 'block';
    byId('p2-title').innerText = 'Demonios del piso ' + n;
    byId('enemy-label').innerText = 'Demonio';
    const banner = byId('banned-banner');
    if (banner) banner.style.display = 'none';
    const logEl = byId('log');
    if (logEl) logEl.innerHTML = '';
    showBattleBanner(floor);

    const surrender = byId('story-surrender-btn');
    if (surrender) surrender.style.display = 'inline-block';
    if (window.playStoryBattleMusic) window.playStoryBattleMusic();

    state.phase = 'battle';
    startBattle();

    safeLog(`🔥 Piso ${n} — ${floor.name}`);
    floor.effects.forEach(e => safeLog(`${HELL_EFFECTS[e].icon} ${HELL_EFFECTS[e].name}: ${HELL_EFFECTS[e].desc}`));
    floor.restrictions.forEach(r => { const d = describeRestriction(r); safeLog(`${d.icon} ${d.name}: ${d.desc}`); });
  }

  function showBattleBanner(floor) {
    let el = byId('hell-banner');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hell-banner';
      el.className = 'hell-banner';
      const root = byId('game-root');
      root.insertBefore(el, root.firstChild);
    }
    const chips = floor.effects.map(e => `<span title="${HELL_EFFECTS[e].name}: ${HELL_EFFECTS[e].desc}">${HELL_EFFECTS[e].icon} ${HELL_EFFECTS[e].name}</span>`)
      .concat(floor.restrictions.map(r => { const d = describeRestriction(r); return `<span class="hell-banner-res" title="${d.name}: ${d.desc}">${d.icon} ${d.name}</span>`; }));
    el.innerHTML = `<strong>🔥 ${HELL_TITLE} — Piso ${floor.n}</strong> · ${floor.name}<div class="hell-banner-chips">${chips.join('')}</div>`;
    el.style.display = 'block';
  }

  function hellOnBattleEnd(result) {
    const floor = H.floor;
    const turns = state.turnCount || 0;
    const teamIds = H.teamIds.slice();

    H.active = false;
    state.storyMode = false;
    state.moveLock = false;
    byId('game-root').style.display = 'none';
    const banner = byId('hell-banner');
    if (banner) banner.style.display = 'none';
    const surrender = byId('story-surrender-btn');
    if (surrender) surrender.style.display = 'none';

    byId('hell-screen').style.display = 'flex';
    if (window.playStoryDialogueMusic) window.playStoryDialogueMusic();

    if (result === 'win') {
      const { wasNew } = recordWin(floor.n, turns, teamIds);
      renderResult(floor, true, { turns, wasNew });
    } else {
      renderResult(floor, false, { turns, teamIds });
    }
  }

  /* =========================================================
     INTERFAZ
     ========================================================= */
  const ui = { view: 'tower', page: 0, floor: 1, selected: [], filter: null, search: '' };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  function injectStyles() {
    if (byId('hell-styles')) return;
    const st = document.createElement('style');
    st.id = 'hell-styles';
    st.textContent = `
    .menu-layout:has(#menu-hell){width:min(1280px,100%)}
    .hell-poster-panel{border-color:rgba(239,68,68,.42)!important;
      background:radial-gradient(circle at 50% 0%,rgba(239,68,68,.16),transparent 48%),linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),#14090d!important;
      box-shadow:0 32px 80px rgba(0,0,0,.55),0 0 56px rgba(239,68,68,.16)!important}
    .hell-poster-panel:hover{box-shadow:0 36px 92px rgba(0,0,0,.6),0 0 70px rgba(239,68,68,.28)!important}
    .hell-poster-panel .story-poster-subtitle{color:#fca5a5!important}
    .hell-poster-panel .story-poster-cta{background:linear-gradient(180deg,rgba(248,113,113,.95),rgba(185,28,28,.92))!important;color:#fff!important;box-shadow:0 10px 22px rgba(185,28,28,.35)!important}
    .hell-poster-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:220px;font-size:76px;background:linear-gradient(180deg,#3b0a0a,#12060a)}

    #hell-screen{position:fixed;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow:auto;z-index:120;
      background:radial-gradient(circle at 15% 0%,rgba(239,68,68,.16),transparent 34%),radial-gradient(circle at 85% 8%,rgba(249,115,22,.12),transparent 36%),linear-gradient(180deg,#0d0507 0%,#12070b 55%,#060306 100%)}
    .hell-card{position:relative;width:min(980px,100%);padding:26px 24px 24px;border:1px solid rgba(239,68,68,.28);border-radius:22px;overflow:hidden;
      background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01)),linear-gradient(180deg,#160a0e,#0c0609);
      box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 60px rgba(239,68,68,.08)}
    .hell-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ef4444,#f97316,#7f1d1d)}
    .hell-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
    .hell-head-title{font-size:clamp(20px,2.4vw,28px);font-weight:800;background:linear-gradient(90deg,#fff,#fca5a5,#fb923c);-webkit-background-clip:text;background-clip:text;color:transparent}
    .hell-sub{color:#d4a5a5;font-size:13px;margin:4px 0 0}
    .hell-badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:700;color:#fecaca;background:rgba(239,68,68,.16);border:1px solid rgba(239,68,68,.35)}
    .hell-badge.boss{color:#fde68a;background:rgba(245,158,11,.16);border-color:rgba(245,158,11,.45)}
    .hell-stats{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0 16px}
    .hell-stat{padding:8px 14px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);font-size:13px;color:#e5c9c9}
    .hell-stat b{color:#fff}
    .hell-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .hell-btn-primary{background:linear-gradient(180deg,rgba(248,113,113,.95),rgba(185,28,28,.92))!important;border-color:rgba(248,113,113,.6)!important;color:#fff!important;font-weight:800}
    .hell-btn-primary:disabled{opacity:.4;filter:grayscale(.5)}
    .hell-danger{background:rgba(239,68,68,.12)!important;border-color:rgba(239,68,68,.4)!important}

    .hell-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:14px 0}
    .hell-floor{position:relative;text-align:left;padding:12px;border-radius:14px;cursor:pointer;border:1px solid rgba(255,255,255,.09);
      background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));transition:transform .12s ease,border-color .12s ease}
    .hell-floor:hover:not(:disabled){transform:translateY(-2px);border-color:rgba(248,113,113,.6)}
    .hell-floor .n{font-size:22px;font-weight:800;color:#fff}
    .hell-floor .fx{margin-top:4px;font-size:15px;min-height:20px;letter-spacing:2px}
    .hell-floor .st{margin-top:6px;font-size:11px;color:#c9a7a7}
    .hell-floor.cleared{border-color:rgba(74,222,128,.4)}
    .hell-floor.cleared .st{color:#86efac}
    .hell-floor.current{border-color:rgba(249,115,22,.85);box-shadow:0 0 22px rgba(249,115,22,.25)}
    .hell-floor.current .st{color:#fdba74;font-weight:700}
    .hell-floor.boss::after{content:"👑";position:absolute;top:8px;right:10px;font-size:15px}
    .hell-floor:disabled{opacity:.38;cursor:not-allowed}
    .hell-pager{display:flex;align-items:center;justify-content:center;gap:14px;font-size:13px;color:#d4a5a5}

    .hell-section{margin-top:16px}
    .hell-section h4{margin:0 0 8px;font-size:14px;color:#fecaca;letter-spacing:.02em}
    .hell-chips{display:flex;gap:10px;flex-wrap:wrap}
    .hell-chip{display:flex;align-items:center;gap:10px;padding:8px 12px 8px 8px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
    .hell-chip img{width:48px;height:48px;object-fit:cover;border-radius:10px;background:#0b0508}
    .hell-chip .nm{font-weight:700;font-size:13px}
    .hell-chip .ss{font-size:11px;color:#b99a9a}
    .hell-list{display:flex;flex-direction:column;gap:8px}
    .hell-item{display:flex;gap:10px;align-items:flex-start;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
    .hell-item .ic{font-size:20px;line-height:1.2}
    .hell-item .tt{font-weight:700;font-size:13px}
    .hell-item .ds{font-size:12px;color:#c9adad;margin-top:2px}
    .hell-item .sd{margin-left:auto;font-size:10px;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.07);color:#d8bcbc;white-space:nowrap}
    .hell-item.res{border-color:rgba(96,165,250,.32)}
    .hell-item.res .tt{color:#bfdbfe}
    .hell-empty{font-size:13px;color:#a98888;padding:6px 2px}

    .hell-slots{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0 12px}
    .hell-slot{width:92px;height:92px;border-radius:14px;border:2px dashed rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;cursor:pointer;background:rgba(255,255,255,.02);font-size:11px;color:#8b6f6f}
    .hell-slot.full{border-style:solid;border-color:rgba(248,113,113,.7)}
    .hell-slot img{width:100%;height:100%;object-fit:cover}
    .hell-slot .x{position:absolute;top:3px;right:5px;font-size:12px;background:rgba(0,0,0,.6);border-radius:99px;padding:0 5px}
    .hell-filters{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
    .hell-filters .class-btn.active{outline:2px solid rgba(248,113,113,.7)}
    .hell-search{width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:inherit;font:inherit}
    .hell-chars{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;max-height:46vh;overflow:auto;padding:4px 2px;margin-top:8px}
    .hell-char{position:relative;padding:6px;border-radius:12px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);cursor:pointer;text-align:center;font-size:12px}
    .hell-char img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:9px;background:#0b0508}
    .hell-char .cn{margin-top:4px;font-weight:700;line-height:1.15;min-height:28px;display:flex;align-items:center;justify-content:center}
    .hell-char .cs{font-size:10px;color:#b99a9a}
    .hell-char:hover:not(.blocked){border-color:rgba(248,113,113,.65)}
    .hell-char.picked{border-color:#f87171;box-shadow:0 0 0 2px rgba(248,113,113,.35)}
    .hell-char.blocked{opacity:.33;cursor:not-allowed}
    .hell-problems{font-size:12px;color:#fca5a5;min-height:18px;margin-top:8px}
    .hell-note{margin-top:10px;padding:10px 12px;border-radius:12px;font-size:13px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);color:#fde68a}

    .hell-banner{margin:0 0 12px;padding:10px 14px;border-radius:14px;font-size:13px;background:linear-gradient(180deg,rgba(239,68,68,.14),rgba(239,68,68,.05));border:1px solid rgba(239,68,68,.4);color:#fecaca}
    .hell-banner-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
    .hell-banner-chips span{padding:2px 9px;border-radius:99px;font-size:11px;background:rgba(255,255,255,.07)}
    .hell-banner-chips .hell-banner-res{background:rgba(96,165,250,.14);color:#bfdbfe}
    @media (max-width:600px){.hell-card{padding:18px 14px}.hell-grid{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(st);
  }

  function injectMarkup() {
    // Pantalla del modo
    if (!byId('hell-screen')) {
      const screen = document.createElement('div');
      screen.id = 'hell-screen';
      screen.style.display = 'none';
      screen.innerHTML = `
        <div class="hell-card">
          <div class="hell-head">
            <div>
              <div class="hell-head-title">🔥 ${HELL_TITLE}</div>
              <p class="hell-sub">Desciende piso a piso. Cada nivel altera el combate… y te ata las manos.</p>
            </div>
            <button id="hell-back" class="class-btn">⬅ Volver al menú</button>
          </div>
          <div id="hell-body"></div>
        </div>`;
      document.body.appendChild(screen);
      byId('hell-back').addEventListener('click', closeHell);
    }

    // Portada en el menú principal
    if (!byId('menu-hell')) {
      const layout = document.querySelector('#main-menu .menu-layout') || byId('main-menu');
      if (!layout) return;
      const btn = document.createElement('button');
      btn.id = 'menu-hell';
      btn.className = 'story-poster-panel hell-poster-panel';
      btn.innerHTML = `
        <div class="story-poster-frame"><img src="${HELL_COVER}" alt="${HELL_TITLE}"></div>
        <span class="story-poster-title">🔥 ${HELL_TITLE}</span>
        <span class="story-poster-subtitle">Torre de pisos sin fin</span>
        <span class="story-poster-cta">▶ Descender</span>`;
      const img = btn.querySelector('img');
      img.addEventListener('error', () => {
        const fb = document.createElement('div');
        fb.className = 'hell-poster-fallback';
        fb.textContent = '🔥';
        img.replaceWith(fb);
      });
      layout.appendChild(btn);
      btn.addEventListener('click', openHell);
    }
  }

  function openHell() {
    byId('main-menu').style.display = 'none';
    byId('hell-screen').style.display = 'flex';
    if (window.playStoryDialogueMusic) window.playStoryDialogueMusic();
    const p = loadProgress();
    ui.page = Math.floor(p.highest / PAGE_SIZE);
    renderTower();
  }

  function closeHell() {
    byId('hell-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
    if (window.stopAllStoryMusic) window.stopAllStoryMusic();
  }

  const body = () => byId('hell-body');

  /* ---------- Vista 1: la torre ---------- */
  function renderTower() {
    ui.view = 'tower';
    const p = loadProgress();
    const current = p.highest + 1;
    const maxPage = Math.floor(p.highest / PAGE_SIZE);
    ui.page = Math.max(0, Math.min(ui.page, maxPage));

    const start = ui.page * PAGE_SIZE + 1;
    let tiles = '';
    for (let n = start; n < start + PAGE_SIZE; n++) {
      const meta = floorMeta(n);
      const cleared = p.cleared[n];
      const locked = n > current;
      const cls = ['hell-floor', meta.boss ? 'boss' : '', cleared ? 'cleared' : '', n === current ? 'current' : ''].join(' ');
      const fx = meta.effects.map(e => HELL_EFFECTS[e].icon).join('');
      const status = cleared ? `✓ Superado${cleared.clears > 1 ? ' ×' + cleared.clears : ''}` : (n === current ? '🔥 Siguiente' : '🔒 Bloqueado');
      tiles += `<button class="${cls}" data-floor="${n}" ${locked ? 'disabled' : ''}>
                  <div class="n">Piso ${n}</div><div class="fx">${fx}</div><div class="st">${status}</div>
                </button>`;
    }

    const totalClears = Object.values(p.cleared).reduce((a, c) => a + (c.clears || 0), 0);

    body().innerHTML = `
      <div class="hell-stats">
        <div class="hell-stat">Piso más alto superado: <b>${p.highest || '—'}</b></div>
        <div class="hell-stat">Victorias totales: <b>${totalClears}</b></div>
        <div class="hell-stat">Próximo piso: <b>${current}</b></div>
      </div>
      <div class="hell-row">
        <button id="hell-go-current" class="class-btn hell-btn-primary">▶ Ir al piso ${current}</button>
        <button id="hell-reset" class="class-btn hell-danger">🗑 Borrar progreso</button>
      </div>
      <div class="hell-grid">${tiles}</div>
      <div class="hell-pager">
        <button id="hell-prev" class="class-btn" ${ui.page <= 0 ? 'disabled' : ''}>◀</button>
        <span>Pisos ${start}–${start + PAGE_SIZE - 1}</span>
        <button id="hell-next" class="class-btn" ${ui.page >= maxPage ? 'disabled' : ''}>▶</button>
      </div>`;

    body().querySelectorAll('.hell-floor:not(:disabled)').forEach(b =>
      b.addEventListener('click', () => renderFloor(parseInt(b.dataset.floor, 10))));
    byId('hell-go-current').addEventListener('click', () => renderFloor(current));
    byId('hell-prev').addEventListener('click', () => { ui.page--; renderTower(); });
    byId('hell-next').addEventListener('click', () => { ui.page++; renderTower(); });
    byId('hell-reset').addEventListener('click', () => {
      if (!confirm('¿Borrar TODO el progreso del Infierno Infinito? Perderás los pisos superados.')) return;
      saveProgress({ highest: 0, cleared: {} });
      ui.page = 0;
      renderTower();
    });
  }

  /* ---------- Vista 2: detalle del piso ---------- */
  function enemyChipsHTML(floor) {
    return floor.enemies.map(id => {
      const b = baseById(id);
      const hp = Math.round(b.hp * floor.scale.hp * (floor.effects.includes('legion') ? 1.4 : 1));
      const atk = Math.round(b.atk * floor.scale.atk * (floor.effects.includes('rage') ? 1.3 : 1));
      const def = Math.round(b.def * floor.scale.def * (floor.effects.includes('carapace') ? 1.3 : 1));
      return `<div class="hell-chip"><img src="${esc(b.img)}" alt="">
                <div><div class="nm">${esc(b.name)}</div><div class="ss">HP ${hp} · ATK ${atk} · DEF ${def}</div></div></div>`;
    }).join('');
  }

  const SIDE_LABEL = { all: 'Ambos bandos', enemy: 'Demonios', you: 'Tú' };

  function effectsHTML(effects) {
    if (!effects.length) return '<div class="hell-empty">Sin efectos en este piso.</div>';
    return `<div class="hell-list">${effects.map(e => {
      const d = HELL_EFFECTS[e];
      return `<div class="hell-item"><div class="ic">${d.icon}</div><div><div class="tt">${d.name}</div><div class="ds">${d.desc}</div></div><span class="sd">${SIDE_LABEL[d.side]}</span></div>`;
    }).join('')}</div>`;
  }

  function restrictionsHTML(restrictions) {
    if (!restrictions.length) return '<div class="hell-empty">Sin restricciones: equipo libre de 3.</div>';
    return `<div class="hell-list">${restrictions.map(r => {
      const d = describeRestriction(r);
      return `<div class="hell-item res"><div class="ic">${d.icon}</div><div><div class="tt">${d.name}</div><div class="ds">${d.desc}</div></div><span class="sd">Solo tú</span></div>`;
    }).join('')}</div>`;
  }

  function renderFloor(n) {
    ui.view = 'floor';
    ui.floor = n;
    const floor = getFloor(n);
    const p = loadProgress();
    const rec = p.cleared[n];
    const lastTeam = rec && Array.isArray(rec.team) ? rec.team.map(baseById).filter(Boolean) : [];
    const canRepeat = lastTeam.length > 0 && teamProblems(lastTeam, floor.restrictions).length === 0;
    const s = floor.scale;

    body().innerHTML = `
      <div class="hell-row" style="justify-content:space-between">
        <div>
          <span class="hell-badge ${floor.boss ? 'boss' : ''}">${floor.boss ? '👑 Guardián · ' : ''}Piso ${n}</span>
          <h3 style="margin:8px 0 2px">${esc(floor.name)}</h3>
        </div>
        ${rec ? `<div class="hell-stat">✓ Superado ${rec.clears} ${rec.clears === 1 ? 'vez' : 'veces'}${rec.bestTurns ? ` · mejor: <b>${rec.bestTurns}</b> turnos` : ''}</div>` : ''}
      </div>

      <div class="hell-section">
        <h4>😈 Equipo rival <span class="hell-empty">(fijo) · Bonus del piso: HP ×${s.hp.toFixed(2)} · ATK ×${s.atk.toFixed(2)} · DEF ×${s.def.toFixed(2)}</span></h4>
        <div class="hell-chips">${enemyChipsHTML(floor)}</div>
      </div>

      <div class="hell-section"><h4>🌋 Efectos del piso</h4>${effectsHTML(floor.effects)}</div>
      <div class="hell-section"><h4>⛓️ Tus restricciones</h4>${restrictionsHTML(floor.restrictions)}</div>

      <div class="hell-row" style="margin-top:20px">
        <button id="hell-pick" class="class-btn hell-btn-primary">⚔ Elegir equipo (${floor.teamSize})</button>
        ${canRepeat ? '<button id="hell-repeat" class="class-btn">↻ Repetir con el último equipo</button>' : ''}
        <button id="hell-floor-back" class="class-btn">◀ Torre</button>
      </div>`;

    byId('hell-pick').addEventListener('click', () => { ui.selected = []; ui.filter = null; ui.search = ''; renderSelect(n); });
    if (canRepeat) byId('hell-repeat').addEventListener('click', () => startFloor(n, lastTeam.map(b => b.id)));
    byId('hell-floor-back').addEventListener('click', () => { ui.page = Math.floor((n - 1) / PAGE_SIZE); renderTower(); });
  }

  /* ---------- Vista 3: elegir equipo ---------- */
  function renderSelect(n) {
    ui.view = 'select';
    const floor = getFloor(n);
    body().innerHTML = `
      <div class="hell-row" style="justify-content:space-between">
        <div><span class="hell-badge ${floor.boss ? 'boss' : ''}">Piso ${n}</span> <b style="margin-left:6px">${esc(floor.name)}</b></div>
        <button id="hell-sel-back" class="class-btn">◀ Detalle del piso</button>
      </div>
      <div class="hell-section"><h4>⛓️ Restricciones activas</h4>${restrictionsHTML(floor.restrictions)}</div>
      <div class="hell-section">
        <h4>Tu equipo (${floor.teamSize})</h4>
        <div id="hell-slots" class="hell-slots"></div>
        <div id="hell-problems" class="hell-problems"></div>
        <div class="hell-row">
          <button id="hell-descend" class="class-btn hell-btn-primary" disabled>🔥 Descender</button>
        </div>
      </div>
      <div class="hell-section">
        <input id="hell-search" class="hell-search" type="text" placeholder="Buscar personaje por nombre…" autocomplete="off" spellcheck="false">
        <div id="hell-filters" class="hell-filters"></div>
        <div id="hell-count" class="hell-empty"></div>
        <div id="hell-chars" class="hell-chars"></div>
      </div>`;

    byId('hell-sel-back').addEventListener('click', () => renderFloor(n));
    byId('hell-descend').addEventListener('click', () => startFloor(n, ui.selected.slice()));
    const input = byId('hell-search');
    input.addEventListener('input', () => { ui.search = input.value; renderCharGridHell(floor); });

    // Filtros por clase
    const fbox = byId('hell-filters');
    const classes = Object.keys(CLASS_LABELS);
    const mk = (key, label) => {
      const b = document.createElement('button');
      b.className = 'class-btn' + (ui.filter === key ? ' active' : '');
      b.textContent = label;
      b.addEventListener('click', () => { ui.filter = key; renderSelect_filters(floor); renderCharGridHell(floor); });
      fbox.appendChild(b);
    };
    mk(null, 'Todos');
    classes.forEach(k => mk(k, CLASS_LABELS[k]));

    renderSlotsHell(floor);
    renderCharGridHell(floor);
  }

  function renderSelect_filters(floor) {
    const fbox = byId('hell-filters');
    if (!fbox) return;
    const keys = [null].concat(Object.keys(CLASS_LABELS));
    Array.from(fbox.children).forEach((b, i) => b.classList.toggle('active', keys[i] === ui.filter));
  }

  function selectedBases() { return ui.selected.map(baseById).filter(Boolean); }

  function renderSlotsHell(floor) {
    const box = byId('hell-slots');
    if (!box) return;
    box.innerHTML = '';
    const bases = selectedBases();
    for (let i = 0; i < floor.teamSize; i++) {
      const slot = document.createElement('div');
      const b = bases[i];
      slot.className = 'hell-slot' + (b ? ' full' : '');
      if (b) {
        slot.title = b.name + ' (clic para quitar)';
        slot.innerHTML = `<img src="${esc(b.img)}" alt=""><span class="x">✕</span>`;
        slot.addEventListener('click', () => { ui.selected.splice(i, 1); renderSlotsHell(floor); renderCharGridHell(floor); });
      } else {
        slot.textContent = 'Vacío';
      }
      box.appendChild(slot);
    }
    const problems = teamProblems(bases, floor.restrictions);
    const ok = problems.length === 0;
    byId('hell-descend').disabled = !ok;
    // Mientras se está eligiendo solo se muestran los problemas "reales", no el de "faltan personajes"
    const shown = bases.length < floor.teamSize ? problems.filter(x => !x.startsWith('Elige')) : problems;
    byId('hell-problems').textContent = shown.join(' ');
  }

  function renderCharGridHell(floor) {
    const grid = byId('hell-chars');
    if (!grid) return;
    const q = norm(ui.search);
    const bases = selectedBases();
    const list = CHARACTERS.filter(c =>
      (!ui.filter || (c.classes || []).includes(ui.filter)) && (!q || norm(c.name).includes(q)));

    byId('hell-count').textContent = `${list.length} personaje${list.length === 1 ? '' : 's'}`;
    grid.innerHTML = '';
    list.forEach(c => {
      const picked = ui.selected.includes(c.id);
      const reason = picked ? null : charBlockReason(c, floor.restrictions, bases);
      const full = !picked && ui.selected.length >= floor.teamSize;
      const blocked = !picked && (reason || full);
      const el = document.createElement('div');
      el.className = 'hell-char' + (picked ? ' picked' : '') + (blocked ? ' blocked' : '');
      el.title = reason || (full ? 'Equipo completo' : c.name);
      el.innerHTML = `<img src="${esc(c.img)}" alt="" loading="lazy">
                      <div class="cn">${esc(c.name)}</div>
                      <div class="cs">HP ${c.hp} · ATK ${c.atk} · DEF ${c.def} · SPD ${c.spd}</div>`;
      el.addEventListener('click', () => {
        if (picked) ui.selected = ui.selected.filter(id => id !== c.id);
        else if (!blocked) ui.selected.push(c.id);
        else return;
        renderSlotsHell(floor);
        renderCharGridHell(floor);
      });
      grid.appendChild(el);
    });
  }

  /* ---------- Vista 4: resultado ---------- */
  function renderResult(floor, won, info) {
    ui.view = 'result';
    const n = floor.n;

    if (won) {
      const nextUnlocked = info.wasNew
        ? `<div class="hell-note">🔓 ¡Piso ${n + 1} desbloqueado!</div>` : '';
      body().innerHTML = `
        <span class="hell-badge">✅ Victoria</span>
        <h3 style="margin:8px 0">Piso ${n} superado — ${esc(floor.name)}</h3>
        <div class="hell-stats">
          <div class="hell-stat">Turnos: <b>${info.turns}</b></div>
          <div class="hell-stat">Equipo: <b>${H.teamIds.length ? '' : ''}${selectedNames(floor)}</b></div>
        </div>
        ${nextUnlocked}
        <div class="hell-row" style="margin-top:18px">
          <button id="hell-next-floor" class="class-btn hell-btn-primary">▶ Siguiente piso (${n + 1})</button>
          <button id="hell-replay" class="class-btn">↻ Volver a jugar este piso</button>
          <button id="hell-tower" class="class-btn">◀ Torre</button>
        </div>`;
      byId('hell-next-floor').addEventListener('click', () => renderFloor(n + 1));
      byId('hell-replay').addEventListener('click', () => renderFloor(n));
      byId('hell-tower').addEventListener('click', () => { ui.page = Math.floor((n - 1) / PAGE_SIZE); renderTower(); });
    } else {
      body().innerHTML = `
        <span class="hell-badge">💀 Derrota</span>
        <h3 style="margin:8px 0">El piso ${n} te ha devorado</h3>
        <p class="hell-sub">Los demonios de «${esc(floor.name)}» siguen ahí abajo. Prueba otro equipo o aprovecha mejor los efectos del piso.</p>
        <div class="hell-row" style="margin-top:18px">
          <button id="hell-retry" class="class-btn hell-btn-primary">↻ Reintentar con el mismo equipo</button>
          <button id="hell-newteam" class="class-btn">👥 Cambiar equipo</button>
          <button id="hell-tower" class="class-btn">◀ Torre</button>
        </div>`;
      byId('hell-retry').addEventListener('click', () => startFloor(n, info.teamIds));
      byId('hell-newteam').addEventListener('click', () => { ui.selected = info.teamIds.slice(); ui.filter = null; ui.search = ''; renderSelect(n); });
      byId('hell-tower').addEventListener('click', () => { ui.page = Math.floor((n - 1) / PAGE_SIZE); renderTower(); });
    }
  }

  function selectedNames() {
    return H.teamIds.map(id => (baseById(id) || { name: id }).name).map(esc).join(', ');
  }

  /* =========================================================
     ARRANQUE
     ========================================================= */
  function init() {
    injectStyles();
    injectMarkup();
    installHooks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // API mínima para depurar desde la consola del navegador
  window.INFIERNO = { getFloor, floorMeta, teamProblems, charBlockReason, loadProgress, scaleFor, open: openHell };
})();
