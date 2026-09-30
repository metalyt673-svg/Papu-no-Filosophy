/* desafio.js — Modo DESAFÍO
   ---------------------------------------------------------------------------
   Enfréntate a bosses con tu equipo de 3 personajes. Cada boss tiene 3 niveles
   de dificultad (Normal, Difícil, Pesadilla) que se pueden rejugar siempre.

   Se carga en juego.html DESPUÉS de game.js:
       <script src="desafio.js" defer></script>

   No modifica game.js, personajes.js ni historia.js. Solo necesita que existan
   las funciones de game.js (cloneCharacter, startBattle, findBaseById, …).

   CARPETA DE MÚSICA:  desafio/   (junto a juego.html)
       desafio/menu.mp3      → suena mientras eliges boss/equipo (opcional)
       desafio/combate.mp3   → música de combate por defecto (opcional)
       desafio/<id>.mp3      → música propia de cada boss (opcional), por ejemplo:
                               mckraken.mp3, reina_susurros.mp3,
                               coloso_herrumbre.mp3, verdugo_carmesi.mp3,
                               emperador_vacio.mp3
   Si falta el archivo de un boss se usa combate.mp3; si tampoco está, no suena
   nada. Volumen y "música activada" se toman de la Configuración del juego.

   IMÁGENES:
       personajes/desafio.jpg   → portada del panel del menú (opcional)
       personajes/<id>.jpg      → retrato de cada boss (mismo id que arriba)

   DÓNDE AJUSTAR COSAS:
     - Bosses (stats y habilidades):  CHALLENGE_ONLY_CHARACTERS
     - Textos / música / orden:       CHALLENGE_META
     - Dificultad de cada nivel:      LEVELS
   Para añadir un boss: añade su personaje en CHALLENGE_ONLY_CHARACTERS y su
   entrada en CHALLENGE_META (con el mismo id). Nada más.
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  const TITLE        = 'Desafío';
  const COVER        = 'personajes/desafio.jpg';
  const MUSIC_DIR    = 'desafio';
  const MUSIC_MENU   = MUSIC_DIR + '/menu.mp3';
  const MUSIC_DEFAULT_BATTLE = MUSIC_DIR + '/combate.mp3';
  const PROGRESS_KEY = 'batalla-desafio-progress';
  const STORY_MUSIC_CFG = 'batalla-story-music-config';   // volumen / activada (Configuración)
  const TEAM_SIZE    = 3;

  /* ---------------------------------------------------------
     NIVELES: multiplicadores sobre las stats base del boss.
     shield = escudo inicial como fracción de su vida máxima.
     --------------------------------------------------------- */
  const LEVELS = [
    { n: 1, name: 'Normal',    icon: '🥉', hp: 1.00, atk: 1.00, def: 1.00, spd: 1.00, shield: 0    },
    { n: 2, name: 'Difícil',   icon: '🥈', hp: 1.25, atk: 1.10, def: 1.12, spd: 1.05, shield: 0    },
    { n: 3, name: 'Pesadilla', icon: '🥇', hp: 1.50, atk: 1.22, def: 1.25, spd: 1.10, shield: 0.15 }
  ];

  /* ---------------------------------------------------------
     BOSSES = PERSONAJES EXCLUSIVOS DEL DESAFÍO
     Mismo formato que personajes.js. NO están en CHARACTERS, así que no
     salen en la elección, baneos, IA aleatoria ni glosario de otros modos.
     --------------------------------------------------------- */
  const CHALLENGE_ONLY_CHARACTERS = [
    {
      id: 'mckraken',
      name: 'Squiddilius McKraken',
      img: 'personajes/mckraken.jpg',
      classes: ['mago', 'control'],
      hp: 340, atk: 24, def: 20, spd: 14,
      moves: [
        { id: 'mck1', name: 'Mano Succionadora', power: 22, acc: 0.98, baseCooldown: 0, type: 'attack',
          desc: 'Los agujeros de sus manos absorben la energía del rival y McKraken se queda con parte.',
          effects: [{ type: 'lifesteal', value: 3 }] },
        { id: 'mck2', name: 'Absorción de Energía', power: 0, acc: 1, baseCooldown: 3, type: 'support',
          desc: 'Absorbe energía espiritual del ambiente: recupera vida y gana escudo.',
          effects: [{ type: 'selfHealPct', value: 0.05 }, { type: 'shield', value: 10 }] },
        { id: 'mck3', name: 'Manos Endemoniadas', power: 20, acc: 0.95, baseCooldown: 2, type: 'attack',
          desc: 'Sus manos poseen al rival: le debilitan el ataque y pueden ralentizarlo.',
          effects: [{ type: 'debuff', stat: 'atk', value: 8, duration: 2, prob: 1.0 },
                    { type: 'slow', value: 20, duration: 2, prob: 0.6 }] },
        { id: 'mck4', name: 'Descarga del Reino Yo-kai', power: 38, acc: 0.9, baseCooldown: 4, type: 'attack',
          desc: 'Tras acumular energía, la libera de golpe y quiebra la defensa del objetivo.',
          effects: [{ type: 'debuff', stat: 'def', value: 8, duration: 2, prob: 1.0 }] }
      ]
    },
    {
      id: 'reina_susurros',
      name: 'Reina de los Susurros',
      img: 'personajes/reina_susurros.jpg',
      classes: ['mago', 'control'],
      hp: 300, atk: 26, def: 16, spd: 22,
      moves: [
        { id: 'rei1', name: 'Susurro Cortante', power: 23, acc: 0.98, baseCooldown: 0, type: 'attack',
          desc: 'Una voz afilada que hiere desde dentro.', effect: null },
        { id: 'rei2', name: 'Pesadilla Lúcida', power: 18, acc: 0.95, baseCooldown: 3, type: 'attack',
          desc: 'Siembra el terror en el rival y debilita su ataque.',
          effects: [{ type: 'fear', value: 0.45, duration: 2, prob: 0.5 },
                    { type: 'debuff', stat: 'atk', value: 8, duration: 2, prob: 1.0 }] },
        { id: 'rei3', name: 'Canto Adormecedor', power: 14, acc: 0.95, baseCooldown: 2, type: 'attack',
          desc: 'Su melodía entorpece los movimientos del objetivo.',
          effects: [{ type: 'slow', value: 25, duration: 2, prob: 1.0 }] },
        { id: 'rei4', name: 'Beso Marchito', power: 27, acc: 0.95, baseCooldown: 2, type: 'attack',
          desc: 'Drena la vitalidad del rival para curarse.',
          effects: [{ type: 'lifesteal', value: 30 }] }
      ]
    },
    {
      id: 'coloso_herrumbre',
      name: 'Coloso de Herrumbre',
      img: 'personajes/coloso_herrumbre.jpg',
      classes: ['defensor', 'atacante'],
      hp: 400, atk: 23, def: 26, spd: 9,
      moves: [
        { id: 'col1', name: 'Puño de Hierro', power: 24, acc: 0.97, baseCooldown: 0, type: 'attack',
          desc: 'Un puñetazo lento pero demoledor.', effect: null },
        { id: 'col2', name: 'Eco Metálico', power: 0, acc: 1, baseCooldown: 3, type: 'support',
          desc: 'Su armadura devuelve parte del daño recibido.',
          effects: [{ type: 'reflectDamage', value: 25, duration: 2 }] },
        { id: 'col3', name: 'Aplastamiento', power: 36, acc: 0.88, baseCooldown: 3, type: 'attack',
          desc: 'Desploma todo su peso sobre el rival y le quiebra la defensa.',
          effects: [{ type: 'debuff', stat: 'def', value: 8, duration: 2, prob: 1.0 }] },
        { id: 'col4', name: 'Óxido Corrosivo', power: 15, acc: 0.95, baseCooldown: 2, type: 'attack',
          desc: 'Una nube de óxido que hace sangrar y corroe.',
          effects: [{ type: 'damageOverTime', status: 'bleed', value: 6, duration: 3, prob: 0.9 }] }
      ]
    },
    {
      id: 'verdugo_carmesi',
      name: 'Verdugo Carmesí',
      img: 'personajes/verdugo_carmesi.jpg',
      classes: ['atacante'],
      hp: 285, atk: 30, def: 14, spd: 26,
      moves: [
        { id: 'ver1', name: 'Hacha Veloz', power: 22, acc: 0.98, baseCooldown: 0, type: 'attack',
          desc: 'Un hachazo rapidísimo.', effect: null },
        { id: 'ver2', name: 'Sed de Sangre', power: 0, acc: 1, baseCooldown: 3, type: 'support',
          desc: 'Entra en trance: más ataque y más probabilidad de crítico.',
          effects: [{ type: 'tempAtk', value: 10, duration: 3 }, { type: 'critChance', value: 20, duration: 3 }] },
        { id: 'ver3', name: 'Decapitación', power: 34, acc: 0.9, baseCooldown: 2, type: 'attack',
          desc: 'Un tajo letal que deja una hemorragia.',
          effects: [{ type: 'damageOverTime', status: 'bleed', value: 7, duration: 3, prob: 0.85 }] },
        { id: 'ver4', name: 'Frenesí', power: 18, acc: 0.95, baseCooldown: 1, type: 'attack',
          desc: 'Ataca sin control y recupera parte de la vida.',
          effects: [{ type: 'lifesteal', value: 35 }] }
      ]
    },
    {
      id: 'emperador_vacio',
      name: 'Emperador del Vacío',
      img: 'personajes/emperador_vacio.jpg',
      classes: ['mago', 'atacante'],
      hp: 370, atk: 28, def: 20, spd: 18,
      moves: [
        { id: 'emp1', name: 'Rayo del Vacío', power: 26, acc: 0.98, baseCooldown: 0, type: 'attack',
          desc: 'Un haz de energía oscura que atraviesa todo.', effect: null },
        { id: 'emp2', name: 'Eclipse', power: 0, acc: 1, baseCooldown: 4, type: 'support',
          desc: 'Oscurece el campo: gana escudo y ataque.',
          effects: [{ type: 'shield', value: 50 }, { type: 'tempAtk', value: 8, duration: 3 }] },
        { id: 'emp3', name: 'Silencio Eterno', power: 22, acc: 0.93, baseCooldown: 3, type: 'attack',
          desc: 'Puede aturdir al rival y lo ralentiza.',
          effects: [{ type: 'stun', prob: 0.3, duration: 1 }, { type: 'slow', value: 20, duration: 2, prob: 1.0 }] },
        { id: 'emp4', name: 'Colapso Estelar', power: 40, acc: 0.9, baseCooldown: 4, type: 'attack',
          desc: 'Una estrella se derrumba sobre el objetivo y debilita su defensa.',
          effects: [{ type: 'debuff', stat: 'def', value: 10, duration: 2, prob: 1.0 }] }
      ]
    }
  ];

  /* Textos y ajustes de cada boss (mismo id que arriba). El orden de esta
     lista es el orden en que se desbloquean. */
  const CHALLENGE_META = [
    { id: 'mckraken',         emoji: '🦑', title: 'El dictador del Mundo Yo-kai',
      intro: 'Quiere someter a la humanidad y absorbe toda la energía que toca con sus manos. Este es solo su primera forma.' },
    { id: 'reina_susurros',   emoji: '🌙', title: 'La voz que nunca calla',
      intro: 'Sus palabras no se oyen con los oídos. Se meten en la cabeza y no se van.' },
    { id: 'coloso_herrumbre', emoji: '⚙️', title: 'Montaña de metal viejo',
      intro: 'Lento, pesado e inmune a casi todo. Pero cada golpe suyo puede acabar el combate.' },
    { id: 'verdugo_carmesi',  emoji: '🪓', title: 'El que nunca falla',
      intro: 'Frágil como el cristal y rápido como un rayo. El que golpea primero, gana.' },
    { id: 'emperador_vacio',  emoji: '🌌', title: 'Señor del último abismo',
      intro: 'Al final del camino espera él. Si caes aquí, puedes volver a intentarlo cuando quieras.' }
  ];

  /* ---------------------------------------------------------
     Registro de los bosses como personajes (solo para este modo)
     --------------------------------------------------------- */
  window.CHALLENGE_ONLY_CHARACTERS = CHALLENGE_ONLY_CHARACTERS;

  const bossBase = id => CHALLENGE_ONLY_CHARACTERS.find(c => c.id === id);
  const bossMeta = id => CHALLENGE_META.find(m => m.id === id) || {};

  // findBaseById (game.js) solo conoce CHARACTERS y STORY_ONLY_CHARACTERS.
  // Lo ampliamos sin tocar game.js para que también encuentre a los bosses.
  (function patchFindBase() {
    const _find = window.findBaseById;
    if (typeof _find !== 'function' || _find.__desafio) return;
    const patched = function (id) { return _find.apply(this, arguments) || bossBase(id); };
    patched.__desafio = true;
    window.findBaseById = patched;
  })();

  /* =========================================================
     UTILIDADES
     ========================================================= */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const safeLog = m => { try { if (typeof log === 'function') log(m); } catch (e) { /* ignorar */ } };

  function loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado */ }
  }

  /* ---------- Progreso ---------- */
  // cleared[bossId] = nivel más alto superado (0-3) · best[bossId_nivel] = menos turnos
  function loadProgress() {
    const p = loadJSON(PROGRESS_KEY, {});
    return { cleared: p.cleared || {}, best: p.best || {} };
  }
  function saveProgress(p) { saveJSON(PROGRESS_KEY, p); }

  const clearedLevel = (p, id) => Number(p.cleared[id]) || 0;

  function bossUnlocked(p, index) {
    if (index === 0) return true;
    return clearedLevel(p, CHALLENGE_META[index - 1].id) >= 1;
  }
  const levelUnlocked = (p, id, lvl) => lvl <= clearedLevel(p, id) + 1;

  function recordWin(id, lvl, turns) {
    const p = loadProgress();
    const wasNew = lvl > clearedLevel(p, id);
    if (wasNew) p.cleared[id] = lvl;
    const k = id + '_' + lvl;
    const prev = p.best[k];
    const record = !prev || (turns > 0 && turns < prev);
    if (record && turns > 0) p.best[k] = turns;
    saveProgress(p);
    return { wasNew, record: record && turns > 0 };
  }

  /* =========================================================
     MÚSICA (carpeta desafio/)
     ========================================================= */
  const chAudio = new Audio();
  chAudio.loop = true;
  let chSrc = '';
  let chFallback = '';

  function musicSettings() {
    const s = loadJSON(STORY_MUSIC_CFG, {});
    return {
      volume: typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume)) : 0.5,
      enabled: typeof s.enabled === 'boolean' ? s.enabled : true
    };
  }

  function stopChMusic() {
    chAudio.pause();
    try { chAudio.currentTime = 0; } catch (e) { /* ignorar */ }
    chSrc = '';
  }

  /* Reproduce src; si falla y hay fallback, prueba con el fallback. */
  function playChMusic(src, fallback) {
    if (window.stopAllStoryMusic) window.stopAllStoryMusic();
    const cfg = musicSettings();
    if (!cfg.enabled || !src) { stopChMusic(); return; }
    if (chSrc === src && !chAudio.paused) return;
    chSrc = src;
    chFallback = fallback || '';
    chAudio.volume = cfg.volume;
    chAudio.setAttribute('src', src);
    chAudio.load();
    chAudio.play().catch(() => { /* falta el archivo o el navegador lo bloquea */ });
  }

  chAudio.addEventListener('error', () => {
    // El archivo del boss no existe: intentamos con la música de combate por defecto
    if (chFallback && chSrc !== chFallback) {
      const fb = chFallback;
      chFallback = '';
      chSrc = fb;
      chAudio.setAttribute('src', fb);
      chAudio.load();
      chAudio.play().catch(() => { /* sin música */ });
    }
  });

  /* =========================================================
     COMBATE
     ========================================================= */
  const C = { active: false, bossId: null, level: 1, teamIds: [] };

  const baseHero = id => {
    if (typeof findBaseById === 'function') return findBaseById(id);
    return CHARACTERS.find(c => c.id === id);
  };

  function buildBoss(bossId, lvl) {
    const L = LEVELS[lvl - 1];
    const b = cloneCharacter(bossBase(bossId));
    b.maxHp = Math.round(b.maxHp * L.hp);  b.hp = b.maxHp;
    b.atk   = Math.round(b.atk * L.atk);
    b.def   = Math.round(b.def * L.def);
    b.spd   = Math.round(b.spd * L.spd);
    b.shield = L.shield ? Math.round(b.maxHp * L.shield) : 0;
    return b;
  }

  function startChallenge(bossId, lvl, teamIds) {
    if (!bossBase(bossId)) { alert('Boss no encontrado: ' + bossId); return; }
    const heroBases = teamIds.map(baseHero).filter(Boolean);
    if (heroBases.length !== TEAM_SIZE) { alert(`Elige exactamente ${TEAM_SIZE} personajes.`); return; }

    const heroes = heroBases.map(b => cloneCharacter(b));
    const boss = buildBoss(bossId, lvl);
    const meta = bossMeta(bossId);

    C.active = true;
    C.bossId = bossId;
    C.level = lvl;
    C.teamIds = teamIds.slice();

    state.mode = 'pve';
    window.GAME_MODE = 'pve';
    state.bansEnabled = false;
    state.storyMode = true;            // reutiliza el flujo de "combate scriptado"
    state.challengeMode = true;         // muerte súbita a los 100 turnos (en vez de 70) en game.js
    state.moveLock = false;
    state.teams.p1 = heroes;
    state.teams.p2 = [boss];
    state.activeIndex.p1 = 0;
    state.activeIndex.p2 = 0;

    byId('desafio-screen').style.display = 'none';
    byId('game-root').style.display = 'block';
    byId('p2-title').innerText = 'Boss: ' + boss.name;
    byId('enemy-label').innerText = 'Boss';
    const banner = byId('banned-banner');
    if (banner) banner.style.display = 'none';
    const logEl = byId('log');
    if (logEl) logEl.innerHTML = '';
    const hellBanner = byId('hell-banner');       // por si el Infierno dejó su cartel
    if (hellBanner) hellBanner.style.display = 'none';

    const surrender = byId('story-surrender-btn');
    if (surrender) surrender.style.display = 'inline-block';

    const bossTrack = `${MUSIC_DIR}/${bossId}.mp3`;
    playChMusic(bossTrack, MUSIC_DEFAULT_BATTLE);

    state.phase = 'battle';
    startBattle();

    safeLog(`${meta.emoji || '⚔️'} ${TITLE}: ${boss.name} — Nivel ${lvl} (${LEVELS[lvl - 1].name})`);
    if (boss.shield > 0) safeLog(`🛡️ ${boss.name} empieza con ${boss.shield} de escudo.`);
  }

  function challengeOnBattleEnd(result) {
    const bossId = C.bossId, lvl = C.level, teamIds = C.teamIds.slice();
    const turns = state.turnCount || 0;

    C.active = false;
    state.storyMode = false;
    state.challengeMode = false;
    state.moveLock = false;
    byId('game-root').style.display = 'none';
    const surrender = byId('story-surrender-btn');
    if (surrender) surrender.style.display = 'none';

    byId('desafio-screen').style.display = 'flex';
    playChMusic(MUSIC_MENU, '');

    if (result === 'win') {
      const info = recordWin(bossId, lvl, turns);
      renderResult(bossId, lvl, true, { turns, teamIds, ...info });
    } else {
      renderResult(bossId, lvl, false, { turns, teamIds });
    }
  }

  let hooksInstalled = false;
  function installHooks() {
    if (hooksInstalled) return;
    hooksInstalled = true;
    // Encadena con lo que hubiera antes (juego original o el Infierno Infinito)
    const _end = window.onStoryBattleEnd;
    window.onStoryBattleEnd = function (result) {
      if (C.active) return challengeOnBattleEnd(result);
      return typeof _end === 'function' ? _end.apply(this, arguments) : undefined;
    };
  }

  /* =========================================================
     INTERFAZ
     ========================================================= */
  const ui = { view: 'list', bossId: null, level: 1, selected: [], search: '', filter: null };

  function injectStyles() {
    if (byId('desafio-styles')) return;
    const st = document.createElement('style');
    st.id = 'desafio-styles';
    st.textContent = `
    /* Columna del menú: Historia arriba, Desafío debajo */
    .menu-col{display:flex;flex-direction:column;gap:22px;flex:0 1 300px;width:min(300px,100%)}
    .menu-col > .story-poster-panel{flex:0 0 auto;width:100%}
    @media (max-width:900px){.menu-col{flex:0 1 auto;width:min(420px,100%)}}
    .ch-poster-panel{border-color:rgba(168,85,247,.5)!important;
      background:radial-gradient(circle at 50% 0%,rgba(168,85,247,.20),transparent 50%),linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),#100a1c!important;
      box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 44px rgba(168,85,247,.16)!important}
    .ch-poster-panel:hover{box-shadow:0 30px 78px rgba(0,0,0,.58),0 0 60px rgba(168,85,247,.3)!important}
    .ch-poster-panel .story-poster-subtitle{color:#d8b4fe!important}
    .ch-poster-panel .story-poster-cta{background:linear-gradient(180deg,rgba(192,132,252,.96),rgba(126,34,206,.94))!important;color:#fff!important;box-shadow:0 10px 22px rgba(126,34,206,.36)!important}
    .ch-poster-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:150px;font-size:64px;border-radius:18px;background:linear-gradient(180deg,#2e1065,#0f0a1c)}

    #desafio-screen{position:fixed;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow:auto;z-index:121;
      background:radial-gradient(circle at 15% 0%,rgba(168,85,247,.18),transparent 34%),radial-gradient(circle at 85% 8%,rgba(251,191,36,.10),transparent 36%),linear-gradient(180deg,#0b0714 0%,#100a1d 55%,#05030a 100%)}
    .ch-card{position:relative;width:min(1000px,100%);padding:26px 24px 24px;border:1px solid rgba(168,85,247,.3);border-radius:22px;overflow:hidden;
      background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01)),linear-gradient(180deg,#130c22,#0a0614);
      box-shadow:0 18px 48px rgba(0,0,0,.5),0 0 60px rgba(168,85,247,.08)}
    .ch-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#a855f7,#fbbf24,#6d28d9)}
    .ch-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
    .ch-title{font-size:clamp(20px,2.4vw,28px);font-weight:800;background:linear-gradient(90deg,#fff,#d8b4fe,#fcd34d);-webkit-background-clip:text;background-clip:text;color:transparent}
    .ch-sub{color:#c4b5d9;font-size:13px;margin:4px 0 0}
    .ch-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .ch-primary{background:linear-gradient(180deg,rgba(192,132,252,.96),rgba(126,34,206,.94))!important;border-color:rgba(192,132,252,.6)!important;color:#fff!important;font-weight:800}
    .ch-primary:disabled{opacity:.4;filter:grayscale(.5)}
    .ch-bosses{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin:12px 0}
    .ch-boss{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px;border-radius:16px;text-align:center;cursor:pointer;color:inherit;font:inherit;
      background:rgba(255,255,255,.04);border:1px solid rgba(168,85,247,.28);transition:transform .15s,box-shadow .15s}
    .ch-boss:hover:not(.locked){transform:translateY(-3px);box-shadow:0 12px 28px rgba(0,0,0,.45),0 0 26px rgba(168,85,247,.22)}
    .ch-boss.locked{opacity:.45;cursor:not-allowed;filter:grayscale(.6)}
    .ch-boss img,.ch-boss-fb{width:100%;height:150px;object-fit:cover;border-radius:12px;background:#1a1030}
    .ch-boss-fb{display:flex;align-items:center;justify-content:center;font-size:56px}
    .ch-boss-name{font-weight:800;font-size:15px}
    .ch-boss-title{font-size:12px;color:#c4b5d9}
    .ch-medals{font-size:16px;letter-spacing:2px}
    .ch-levels{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
    .ch-level{flex:1 1 150px;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:inherit;font:inherit;cursor:pointer;text-align:left}
    .ch-level.active{border-color:#fbbf24;box-shadow:0 0 0 1px #fbbf24 inset;background:rgba(251,191,36,.08)}
    .ch-level.locked{opacity:.4;cursor:not-allowed}
    .ch-level small{display:block;color:#c4b5d9;margin-top:2px}
    .ch-detail{display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;margin-bottom:8px}
    .ch-detail img,.ch-detail .ch-boss-fb{width:170px;height:170px;object-fit:cover;border-radius:14px;flex:0 0 auto}
    .ch-detail-main{flex:1 1 300px}
    .ch-stats{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
    .ch-stat{padding:6px 12px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);font-size:13px}
    .ch-moves{display:grid;gap:6px;margin-top:8px;font-size:13px}
    .ch-move{padding:7px 10px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}
    .ch-move b{color:#fcd34d}
    .ch-search{width:100%;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;font:inherit;margin:6px 0}
    .ch-team{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0;min-height:34px}
    .ch-chip{padding:5px 12px;border-radius:99px;background:rgba(168,85,247,.2);border:1px solid rgba(168,85,247,.5);font-size:13px;cursor:pointer}
    .ch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;margin:10px 0;max-height:46vh;overflow:auto;padding-right:4px}
    .ch-hero{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);cursor:pointer;color:inherit;font:inherit;font-size:12px;text-align:center}
    .ch-hero img{width:100%;height:84px;object-fit:cover;border-radius:8px;background:#1a1030}
    .ch-hero.sel{border-color:#fbbf24;box-shadow:0 0 0 1px #fbbf24 inset;background:rgba(251,191,36,.1)}
    .ch-result{text-align:center;padding:10px 0}
    .ch-result h3{font-size:24px;margin:6px 0}
    .ch-win{color:#86efac}.ch-lose{color:#fca5a5}
    .ch-note{margin:10px auto;max-width:560px;color:#d8c9ee;font-size:14px}
    @media (max-width:600px){.ch-card{padding:18px 14px}.ch-bosses{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(st);
  }

  function imgOrFallback(src, alt, emoji, cls) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" data-fb="${esc(emoji)}" data-cls="${esc(cls || 'ch-boss-fb')}">`;
  }
  function wireImageFallbacks(root) {
    root.querySelectorAll('img[data-fb]').forEach(img => {
      img.addEventListener('error', () => {
        const fb = document.createElement('div');
        fb.className = img.dataset.cls || 'ch-boss-fb';
        fb.textContent = img.dataset.fb || '⚔️';
        img.replaceWith(fb);
      }, { once: true });
    });
  }

  function injectMarkup() {
    // Pantalla del modo
    if (!byId('desafio-screen')) {
      const screen = document.createElement('div');
      screen.id = 'desafio-screen';
      screen.style.display = 'none';
      screen.innerHTML = `
        <div class="ch-card">
          <div class="ch-head">
            <div>
              <div class="ch-title">⚔️ ${TITLE}</div>
              <p class="ch-sub">Vence a los bosses con tu equipo de ${TEAM_SIZE}. Cada uno tiene 3 niveles y puedes rejugarlos cuando quieras.</p>
            </div>
            <button id="ch-back" class="class-btn">⬅ Volver al menú</button>
          </div>
          <div id="ch-body"></div>
        </div>`;
      document.body.appendChild(screen);
      byId('ch-back').addEventListener('click', closeDesafio);
    }

    // Panel en el menú principal, debajo del Modo Historia
    if (!byId('menu-desafio')) {
      const layout = document.querySelector('#main-menu .menu-layout');
      const story = byId('menu-story');
      if (!layout) return;

      let col = story && story.parentElement && story.parentElement.classList.contains('menu-col') ? story.parentElement : null;
      if (!col && story) {
        col = document.createElement('div');
        col.className = 'menu-col';
        story.parentNode.insertBefore(col, story);
        col.appendChild(story);
      }

      const btn = document.createElement('button');
      btn.id = 'menu-desafio';
      btn.className = 'story-poster-panel ch-poster-panel';
      btn.innerHTML = `
        <div class="story-poster-frame">${imgOrFallback(COVER, TITLE, '⚔️', 'ch-poster-fallback')}</div>
        <span class="story-poster-title">⚔️ ${TITLE}</span>
        <span class="story-poster-subtitle">Vence a los bosses</span>
        <span class="story-poster-cta">▶ Desafiar</span>`;
      wireImageFallbacks(btn);
      (col || layout).appendChild(btn);
      btn.addEventListener('click', openDesafio);
    }
  }

  function openDesafio() {
    byId('main-menu').style.display = 'none';
    byId('desafio-screen').style.display = 'flex';
    playChMusic(MUSIC_MENU, '');
    renderList();
  }

  function closeDesafio() {
    byId('desafio-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
    stopChMusic();
    if (window.stopAllStoryMusic) window.stopAllStoryMusic();
  }

  const body = () => byId('ch-body');
  const medals = (p, id) => LEVELS.map(L => (clearedLevel(p, id) >= L.n ? L.icon : '▫️')).join('');

  /* ---------- Vista 1: lista de bosses ---------- */
  function renderList() {
    ui.view = 'list';
    const p = loadProgress();
    const cards = CHALLENGE_META.map((m, i) => {
      const b = bossBase(m.id);
      if (!b) return '';
      const open = bossUnlocked(p, i);
      return `<button class="ch-boss${open ? '' : ' locked'}" data-boss="${esc(m.id)}" ${open ? '' : 'disabled'}>
        ${open ? imgOrFallback(b.img, b.name, m.emoji || '⚔️') : `<div class="ch-boss-fb">🔒</div>`}
        <span class="ch-boss-name">${open ? esc(b.name) : '???'}</span>
        <span class="ch-boss-title">${open ? esc(m.title || '') : 'Vence al boss anterior'}</span>
        <span class="ch-medals">${open ? medals(p, m.id) : ''}</span>
      </button>`;
    }).join('');
    const total = CHALLENGE_META.length * LEVELS.length;
    const done = CHALLENGE_META.reduce((a, m) => a + clearedLevel(p, m.id), 0);
    body().innerHTML = `
      <div class="ch-stat" style="display:inline-block">🏆 Progreso: <b>${done}/${total}</b> niveles superados</div>
      <div class="ch-bosses">${cards}</div>`;
    wireImageFallbacks(body());
    body().querySelectorAll('.ch-boss:not(.locked)').forEach(el =>
      el.addEventListener('click', () => { ui.bossId = el.dataset.boss; ui.selected = []; ui.search = ''; ui.filter = null;
        ui.level = Math.min(LEVELS.length, clearedLevel(loadProgress(), ui.bossId) + 1); renderSetup(); }));
  }

  /* ---------- Vista 2: boss + nivel + equipo ---------- */
  function renderSetup() {
    ui.view = 'setup';
    const p = loadProgress();
    const b = bossBase(ui.bossId), m = bossMeta(ui.bossId);
    const L = LEVELS[ui.level - 1];

    const levelBtns = LEVELS.map(l => {
      const open = levelUnlocked(p, ui.bossId, l.n);
      const best = p.best[ui.bossId + '_' + l.n];
      return `<button class="ch-level${ui.level === l.n ? ' active' : ''}${open ? '' : ' locked'}" data-lvl="${l.n}" ${open ? '' : 'disabled'}>
        <b>${l.icon} Nivel ${l.n} · ${l.name}</b>
        <small>${open ? (best ? `Récord: ${best} turnos` : 'Sin superar') : '🔒 Supera el nivel anterior'}</small>
      </button>`;
    }).join('');

    const stat = (k, v) => `<span class="ch-stat">${k} <b>${v}</b></span>`;
    const moves = b.moves.map(mv => `<div class="ch-move"><b>${esc(mv.name)}</b> — ${esc(mv.desc)}</div>`).join('');

    body().innerHTML = `
      <div class="ch-row" style="margin-bottom:10px"><button id="ch-tolist" class="class-btn">◀ Bosses</button></div>
      <div class="ch-detail">
        ${imgOrFallback(b.img, b.name, m.emoji || '⚔️')}
        <div class="ch-detail-main">
          <h3 style="margin:0">${m.emoji || ''} ${esc(b.name)}</h3>
          <div class="ch-sub">${esc(m.title || '')}</div>
          <p class="ch-note" style="margin:8px 0;max-width:none">${esc(m.intro || '')}</p>
          <div class="ch-stats" id="ch-stats">
            ${stat('❤️ Vida', Math.round(b.hp * L.hp))}${stat('⚔️ ATK', Math.round(b.atk * L.atk))}
            ${stat('🛡️ DEF', Math.round(b.def * L.def))}${stat('💨 VEL', Math.round(b.spd * L.spd))}
            ${L.shield ? stat('✨ Escudo inicial', Math.round(b.hp * L.hp * L.shield)) : ''}
          </div>
          <div class="ch-moves">${moves}</div>
        </div>
      </div>
      <div class="ch-levels">${levelBtns}</div>
      <h4 style="margin:14px 0 4px">👥 Tu equipo (${TEAM_SIZE})</h4>
      <div id="ch-team" class="ch-team"></div>
      <input id="ch-search" class="ch-search" type="text" placeholder="Buscar personaje por nombre…" autocomplete="off" spellcheck="false" value="${esc(ui.search)}">
      <div id="ch-grid" class="ch-grid"></div>
      <div class="ch-row"><button id="ch-start" class="class-btn ch-primary">⚔️ Empezar combate</button></div>`;

    wireImageFallbacks(body());
    byId('ch-tolist').addEventListener('click', renderList);
    body().querySelectorAll('.ch-level:not(.locked)').forEach(el =>
      el.addEventListener('click', () => { ui.level = Number(el.dataset.lvl); renderSetup(); }));
    byId('ch-search').addEventListener('input', e => { ui.search = e.target.value; renderHeroGrid(); });
    byId('ch-start').addEventListener('click', () => startChallenge(ui.bossId, ui.level, ui.selected));
    renderTeamChips();
    renderHeroGrid();
  }

  function renderTeamChips() {
    const box = byId('ch-team');
    if (!box) return;
    box.innerHTML = ui.selected.length
      ? ui.selected.map(id => `<span class="ch-chip" data-id="${esc(id)}" title="Quitar">${esc((baseHero(id) || { name: id }).name)} ✕</span>`).join('')
      : `<span class="ch-sub">Elige ${TEAM_SIZE} personajes de la lista.</span>`;
    box.querySelectorAll('.ch-chip').forEach(el => el.addEventListener('click', () => toggleHero(el.dataset.id)));
    const start = byId('ch-start');
    if (start) start.disabled = ui.selected.length !== TEAM_SIZE;
  }

  function toggleHero(id) {
    const i = ui.selected.indexOf(id);
    if (i >= 0) ui.selected.splice(i, 1);
    else if (ui.selected.length < TEAM_SIZE) ui.selected.push(id);
    renderTeamChips();
    renderHeroGrid();
  }

  function renderHeroGrid() {
    const grid = byId('ch-grid');
    if (!grid) return;
    const q = norm(ui.search);
    const list = CHARACTERS.filter(c => !q || norm(c.name).includes(q));
    grid.innerHTML = list.length ? list.map(c => `
      <button class="ch-hero${ui.selected.includes(c.id) ? ' sel' : ''}" data-id="${esc(c.id)}">
        ${imgOrFallback(c.img, c.name, '👤', 'ch-boss-fb')}
        <span>${esc(c.name)}</span>
      </button>`).join('') : '<div class="ch-sub">Sin resultados.</div>';
    wireImageFallbacks(grid);
    grid.querySelectorAll('.ch-hero').forEach(el => el.addEventListener('click', () => toggleHero(el.dataset.id)));
  }

  /* ---------- Vista 3: resultado ---------- */
  function renderResult(bossId, lvl, won, info) {
    ui.view = 'result';
    ui.bossId = bossId; ui.level = lvl; ui.selected = info.teamIds.slice();
    const b = bossBase(bossId), m = bossMeta(bossId);
    const p = loadProgress();
    const idx = CHALLENGE_META.findIndex(x => x.id === bossId);
    const nextLevel = lvl < LEVELS.length;
    const nextBoss = idx >= 0 && idx < CHALLENGE_META.length - 1 && bossUnlocked(p, idx + 1) ? CHALLENGE_META[idx + 1].id : null;

    let html;
    if (won) {
      html = `<div class="ch-result">
        <div style="font-size:54px">🏆</div>
        <h3 class="ch-win">¡${esc(b.name)} derrotado!</h3>
        <div class="ch-sub">Nivel ${lvl} · ${LEVELS[lvl - 1].name} — ${info.turns} turnos</div>
        ${info.wasNew ? `<div class="ch-note">🎉 Nivel superado por primera vez.${nextLevel ? ' Se ha desbloqueado el siguiente nivel.' : ' ¡Has completado este boss en su máxima dificultad!'}${nextBoss && lvl === 1 ? ' Además, se ha desbloqueado un nuevo boss.' : ''}</div>` : ''}
        ${info.record ? `<div class="ch-note">⏱️ ¡Nuevo récord de turnos!</div>` : ''}
        <div class="ch-row" style="justify-content:center;margin-top:16px">
          ${nextLevel ? `<button id="ch-next" class="class-btn ch-primary">▶ Nivel ${lvl + 1}</button>` : ''}
          ${nextBoss ? `<button id="ch-nextboss" class="class-btn">➡ Siguiente boss</button>` : ''}
          <button id="ch-again" class="class-btn">↻ Repetir</button>
          <button id="ch-list" class="class-btn">◀ Bosses</button>
        </div></div>`;
    } else {
      html = `<div class="ch-result">
        <div style="font-size:54px">💀</div>
        <h3 class="ch-lose">Has caído ante ${esc(b.name)}</h3>
        <div class="ch-sub">Nivel ${lvl} · ${LEVELS[lvl - 1].name} — ${info.turns} turnos</div>
        <div class="ch-note">Prueba otro equipo o cambia de estrategia: puedes intentarlo las veces que quieras.</div>
        <div class="ch-row" style="justify-content:center;margin-top:16px">
          <button id="ch-again" class="class-btn ch-primary">↻ Reintentar con el mismo equipo</button>
          <button id="ch-newteam" class="class-btn">👥 Cambiar equipo</button>
          <button id="ch-list" class="class-btn">◀ Bosses</button>
        </div></div>`;
    }
    body().innerHTML = html;

    const on = (id, fn) => { const el = byId(id); if (el) el.addEventListener('click', fn); };
    on('ch-again', () => startChallenge(bossId, lvl, info.teamIds));
    on('ch-next', () => startChallenge(bossId, lvl + 1, info.teamIds));
    on('ch-nextboss', () => { ui.bossId = nextBoss; ui.level = 1; renderSetup(); });
    on('ch-newteam', () => { ui.search = ''; renderSetup(); });
    on('ch-list', renderList);
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

  // API mínima para depurar desde la consola
  window.DESAFIO = { open: openDesafio, bosses: CHALLENGE_ONLY_CHARACTERS, levels: LEVELS, loadProgress };
})();
