/* perfil.js — PERFIL DE JUGADOR
   ---------------------------------------------------------------------------
   - Nombre de jugador (máx. 16 caracteres).
   - Icono: la imagen de CUALQUIER personaje del juego (los de batalla libre,
     los exclusivos de Historia y los bosses del Desafío).
   - 3 personajes favoritos (podio 🥇🥈🥉) con imagen, clases y estadísticas.
   - Récords de cada modo:
       · Batalla libre (IA, PvP, con y sin baneos): victorias, derrotas, racha.
       · Modo Historia: capítulo más lejano alcanzado.
       · Desafío: medallas y mejor marca (turnos) de cada boss y nivel.
       · Infierno Infinito: piso más alto, pisos superados, mejor marca.
   - Rango según los "puntos de gloria" que acumulas en todos los modos
     (incluida la gloria de las cajas del Inventario, ver inventario.js).

   INSTALACIÓN (un solo archivo, no hay que tocar game.js ni los demás):
     En juego.html, DESPUÉS de desafio.js:
         <script src="perfil.js" defer></script>

   Aparece como un chip (icono + nombre + rango) arriba a la izquierda del
   menú principal. Todo se guarda en localStorage ('batalla-perfil').
   Los récords de Historia, Desafío e Infierno se LEEN de lo que ya guardan
   esos modos; solo la batalla libre necesita registrarse aquí (se engancha a
   checkKO de game.js y solo cuenta combates que no sean de otros modos).

   DÓNDE AJUSTAR COSAS:
     - Rangos y puntos de gloria:  RANKS y computePoints()
     - Modos de batalla libre:     FREE_MODES
     - Colores de clase:           CLASS_COLORS
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  if (typeof CHARACTERS === 'undefined' || typeof state === 'undefined') {
    console.warn('[perfil.js] Debe cargarse DESPUÉS de personajes.js y game.js.');
    return;
  }

  const KEY = 'batalla-perfil';
  const NAME_MAX = 16;

  const FREE_MODES = [
    { id: 'pve',     icon: '🤖',   name: 'Jugador vs IA',               vsIA: true  },
    { id: 'pve-ban', icon: '🚫🤖', name: 'Jugador vs IA · baneos',      vsIA: true  },
    { id: 'pvp',     icon: '🧍',   name: 'Jugador vs Jugador',          vsIA: false },
    { id: 'pvp-ban', icon: '🚫',   name: 'Jugador vs Jugador · baneos', vsIA: false }
  ];

  /* rgb separado para poder usar rgba(var(--rank-rgb), .x) en el CSS */
  const RANKS = [
    { min: 0,   name: 'Recluta',  icon: '🌱', rgb: '148,163,184' },
    { min: 15,  name: 'Aprendiz', icon: '🗡️', rgb: '56,189,248'  },
    { min: 40,  name: 'Guerrero', icon: '⚔️', rgb: '74,222,128'  },
    { min: 90,  name: 'Veterano', icon: '🛡️', rgb: '251,191,36'  },
    { min: 170, name: 'Élite',    icon: '💎', rgb: '167,139,250' },
    { min: 300, name: 'Maestro',  icon: '👑', rgb: '244,114,182' },
    { min: 500, name: 'Leyenda',  icon: '🔥', rgb: '251,146,60'  }
  ];

  const CLASS_COLORS = {
    atacante: '#fb7185', soporte: '#60a5fa', control: '#2dd4bf', debilitador: '#c084fc',
    mago: '#a78bfa', defensor: '#38bdf8', sanador: '#4ade80', tanque: '#38bdf8',
    luchador: '#fb923c', contraataque: '#fbbf24', asesino: '#f87171', antimagia: '#e879f9'
  };

  const PODIUM = [
    { medal: '🥇', label: 'Número 1', rgb: '251,191,36'  },
    { medal: '🥈', label: 'Número 2', rgb: '203,213,225' },
    { medal: '🥉', label: 'Número 3', rgb: '217,119,6'   }
  ];

  /* =========================================================
     UTILIDADES
     ========================================================= */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* modo privado */ }
  }

  /* Todos los personajes con imagen: batalla libre + Historia + bosses */
  let _all = null;
  function allChars() {
    if (_all) return _all;
    const out = [], seen = new Set();
    const add = list => (Array.isArray(list) ? list : []).forEach(c => {
      if (c && c.id && c.img && !seen.has(c.id)) { seen.add(c.id); out.push(c); }
    });
    add(CHARACTERS);
    add(typeof STORY_ONLY_CHARACTERS !== 'undefined' ? STORY_ONLY_CHARACTERS : []);
    add(window.CHALLENGE_ONLY_CHARACTERS);
    out.sort((a, b) => String(a.name).localeCompare(String(b.name), 'es'));
    _all = out;
    return out;
  }
  const charById = id => allChars().find(c => c.id === id) || null;

  let _maxStats = null;
  function maxStats() {
    if (_maxStats) return _maxStats;
    const m = { hp: 1, atk: 1, def: 1, spd: 1 };
    allChars().forEach(c => Object.keys(m).forEach(k => { if (Number(c[k]) > m[k]) m[k] = Number(c[k]); }));
    _maxStats = m;
    return m;
  }

  /* =========================================================
     DATOS DEL PERFIL
     ========================================================= */
  function defaults() {
    const free = {};
    FREE_MODES.forEach(m => { free[m.id] = { played: 0, w: 0, l: 0, streak: 0, best: 0 }; });
    return { name: '', avatar: null, favs: [null, null, null], free, storyBest: 0,
      mp: { played: 0, w: 0, l: 0, streak: 0, best: 0 } };
  }

  function loadProfile() {
    const d = defaults();
    const p = loadJSON(KEY, {});
    if (p && typeof p === 'object') {
      if (typeof p.name === 'string') d.name = p.name.slice(0, NAME_MAX);
      if (typeof p.avatar === 'string') d.avatar = p.avatar;
      if (Array.isArray(p.favs)) d.favs = [0, 1, 2].map(i => (typeof p.favs[i] === 'string' ? p.favs[i] : null));
      FREE_MODES.forEach(m => {
        const s = p.free && p.free[m.id];
        if (s) Object.keys(d.free[m.id]).forEach(k => { d.free[m.id][k] = Number(s[k]) || 0; });
      });
      d.storyBest = Number(p.storyBest) || 0;
      if (p.mp && typeof p.mp === 'object') Object.keys(d.mp).forEach(k => { d.mp[k] = Number(p.mp[k]) || 0; });
    }
    return d;
  }

  let P = loadProfile();
  const saveProfile = () => saveJSON(KEY, P);

  /* ---------- Registro de la batalla libre ---------- */
  function recordFree() {
    const base = state.mode === 'pvp' ? 'pvp' : 'pve';
    const id = state.bansEnabled ? base + '-ban' : base;
    const p1Lost = state.teams.p1.every(c => c.hp <= 0);   // mismo criterio que checkKO
    P = loadProfile();
    const t = P.free[id];
    if (!t) return;
    t.played++;
    if (!p1Lost) { t.w++; t.streak++; t.best = Math.max(t.best, t.streak); }
    else { t.l++; t.streak = 0; }
    saveProfile();
  }

  /* Multijugador online: lo llama multijugador.js al terminar una partida. */
  function recordMultiplayer(won) {
    P = loadProfile();
    const t = P.mp;
    t.played++;
    if (won) { t.w++; t.streak++; t.best = Math.max(t.best, t.streak); }
    else { t.l++; t.streak = 0; }
    saveProfile();
  }

  /* Envuelve checkKO: cuando un combate LIBRE termina (y no es de Historia,
     Desafío ni Infierno, que activan storyMode) se anota el resultado. */
  function installHooks() {
    const _ko = window.checkKO;
    if (typeof _ko !== 'function' || _ko.__perfil) return;
    const wrapped = function () {
      const before = state.phase;
      const res = _ko.apply(this, arguments);
      try {
        if (res && before !== 'ended' && state.phase === 'ended' && !state.storyMode) recordFree();
      } catch (e) { /* el perfil nunca debe romper el combate */ }
      return res;
    };
    wrapped.__perfil = true;
    window.checkKO = wrapped;
  }

  /* =========================================================
     LECTURA DE RÉCORDS DE LOS DEMÁS MODOS
     ========================================================= */
  function gather() {
    const g = {};

    // Historia
    const total = typeof STORY_CHAPTERS !== 'undefined' ? STORY_CHAPTERS.length : 0;
    let cur = 0;
    try { cur = typeof loadStoryProgress === 'function' ? loadStoryProgress() : 0; } catch (e) { /* ignorar */ }
    if (cur > P.storyBest) { P.storyBest = cur; saveProfile(); }   // si reinicias la historia no se pierde tu mejor avance
    g.story = { total, reached: Math.min(P.storyBest, total) };

    // Desafío
    g.desafio = { bosses: [], levels: [], medals: 0, maxMedals: 0 };
    const D = window.DESAFIO;
    if (D && typeof D.loadProgress === 'function') {
      const prog = D.loadProgress();
      const levels = D.levels || [];
      const metaList = D.meta || [];
      const teamSize = D.teamSize || 3;
      const bosses = (D.bosses || []).filter(b => !b.music);        // las fases 2 no cuentan como boss
      bosses.forEach(b => {
        const cleared = Number(prog.cleared[b.id]) || 0;
        const bests = levels.map(L => Number(prog.best[b.id + '_' + L.n]) || 0);
        // Equipo temático (4º modo, opcional por boss): solo cuenta si ese
        // boss tiene un roster configurado en desafio.js (ver CHALLENGE_META).
        const meta = metaList.find(m => m.id === b.id) || {};
        const themeAvailable = Array.isArray(meta.themeTeam) && meta.themeTeam.length >= teamSize;
        const themeDone = themeAvailable && !!(prog.themeCleared || {})[b.id];
        const themeBest = themeAvailable ? Number(prog.best[b.id + '_tema']) || 0 : 0;
        g.desafio.bosses.push({ base: b, cleared, bests, themeAvailable, themeDone, themeBest });
        g.desafio.medals += cleared + (themeDone ? 1 : 0);   // la estrella del Equipo temático cuenta como 1 medalla más
        if (themeAvailable) g.desafio.maxMedals += 1;
      });
      g.desafio.levels = levels;
      g.desafio.maxMedals += bosses.length * levels.length;
    }

    // Infierno
    g.hell = { highest: 0, floors: 0, clears: 0, bestTurns: 0 };
    const I = window.INFIERNO;
    if (I && typeof I.loadProgress === 'function') {
      const p = I.loadProgress();
      g.hell.highest = Number(p.highest) || 0;
      Object.keys(p.cleared || {}).forEach(k => {
        const c = p.cleared[k] || {};
        g.hell.floors++;
        g.hell.clears += Number(c.clears) || 0;
        if (c.bestTurns) g.hell.bestTurns = g.hell.bestTurns ? Math.min(g.hell.bestTurns, c.bestTurns) : c.bestTurns;
      });
    }

    // Batalla libre
    g.freeWins = FREE_MODES.reduce((s, m) => s + P.free[m.id].w, 0);
    g.freePlayed = FREE_MODES.reduce((s, m) => s + P.free[m.id].played, 0);

    g.points = computePoints(g);
    g.rank = rankFor(g.points);
    return g;
  }

  /* Gloria ganada abriendo cajas del Inventario (inventario.js). Si ese archivo no está, 0. */
  function bonusGlory() {
    try { return window.INVENTARIO && typeof window.INVENTARIO.bonusGlory === 'function' ? (Number(window.INVENTARIO.bonusGlory()) || 0) : 0; }
    catch (e) { return 0; }
  }

  /* 1 por victoria libre · 3 por capítulo · 6 por medalla del Desafío · 4 por piso del Infierno · 1-50 por caja abierta */
  function computePoints(g) {
    return g.freeWins + g.story.reached * 3 + g.desafio.medals * 6 + g.hell.floors * 4 + bonusGlory();
  }

  function rankFor(points) {
    let idx = 0;
    RANKS.forEach((r, i) => { if (points >= r.min) idx = i; });
    const cur = RANKS[idx], next = RANKS[idx + 1] || null;
    const pct = next ? Math.round(((points - cur.min) / (next.min - cur.min)) * 100) : 100;
    return { cur, next, pct };
  }

  /* =========================================================
     ESTILOS
     ========================================================= */
  function injectStyles() {
    if (byId('perfil-styles')) return;
    const st = document.createElement('style');
    st.id = 'perfil-styles';
    st.textContent = `
    /* ---------- Chip del menú ---------- */
    .pf-chip{position:absolute;top:18px;left:18px;z-index:3;display:flex;align-items:center;gap:11px;padding:7px 18px 7px 7px;
      border:1px solid rgba(var(--rank-rgb,167,139,250),.45);border-radius:99px;cursor:pointer;color:#fff;font:inherit;text-align:left;
      background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.02)),rgba(9,18,38,.86);backdrop-filter:blur(14px);
      box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 26px rgba(var(--rank-rgb,167,139,250),.16);transition:transform .15s,box-shadow .15s,filter .15s}
    .pf-chip:hover{transform:translateY(-2px);filter:brightness(1.1);box-shadow:0 16px 36px rgba(0,0,0,.5),0 0 34px rgba(var(--rank-rgb,167,139,250),.3)}
    .pf-chip-av{position:relative;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;overflow:hidden;flex:0 0 auto;font-size:22px;
      background:#0d1730;box-shadow:0 0 0 2px rgba(var(--rank-rgb,167,139,250),.9),0 0 14px rgba(var(--rank-rgb,167,139,250),.45)}
    .pf-chip-av img{width:100%;height:100%;object-fit:cover}
    .pf-chip-txt{display:flex;flex-direction:column;line-height:1.2;min-width:0}
    .pf-chip-txt b{font-size:14px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pf-chip-txt small{font-size:11px;color:rgb(var(--rank-rgb,167,139,250));font-weight:700}
    @media (max-width:600px){.pf-chip{top:10px;left:10px;padding:5px 12px 5px 5px}.pf-chip-txt b{max-width:96px}}

    /* ---------- Pantalla ---------- */
    #perfil-screen{position:fixed;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px 40px;overflow:auto;z-index:125;
      background:radial-gradient(circle at 12% 0%,rgba(56,189,248,.16),transparent 34%),radial-gradient(circle at 88% 6%,rgba(244,114,182,.14),transparent 36%),
      radial-gradient(circle at 50% 100%,rgba(139,92,246,.14),transparent 40%),linear-gradient(180deg,#050a18,#0a1226 55%,#04070f)}
    .pf-wrap{width:min(1040px,100%);display:flex;flex-direction:column;gap:22px}
    .pf-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .pf-title{margin:0;font-size:clamp(22px,2.6vw,32px);font-weight:800;letter-spacing:-.02em;background:linear-gradient(90deg,#fff,#bae6fd,#f5d0fe);-webkit-background-clip:text;background-clip:text;color:transparent}
    .pf-h{display:flex;align-items:center;gap:10px;margin:6px 0 -6px;font-size:18px;font-weight:800;letter-spacing:.01em}
    .pf-h::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(167,139,250,.5),transparent)}
    .pf-h small{font-weight:500;color:#8fa0bb;font-size:12px}

    /* ---------- Hero ---------- */
    .pf-hero{position:relative;display:flex;align-items:center;gap:28px;flex-wrap:wrap;padding:30px;border-radius:26px;overflow:hidden;
      border:1px solid rgba(var(--rank-rgb),.45);background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),#09122a;
      box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 70px rgba(var(--rank-rgb),.14)}
    .pf-hero-bg{position:absolute;inset:-40px;background-size:cover;background-position:center 20%;filter:blur(38px) saturate(1.35);opacity:.3;transform:scale(1.15);pointer-events:none}
    .pf-hero::after{content:"";position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(90deg,rgba(9,18,42,.2),rgba(9,18,42,.82)),radial-gradient(circle at 0% 0%,rgba(var(--rank-rgb),.18),transparent 45%)}
    .pf-hero > *{position:relative;z-index:1}
    .pf-avatar{position:relative;width:156px;height:156px;padding:0;border:0;background:none;cursor:pointer;flex:0 0 auto;color:inherit}
    .pf-ring{position:absolute;inset:-7px;border-radius:50%;animation:pf-spin 7s linear infinite;
      background:conic-gradient(rgb(var(--rank-rgb)),#38bdf8,#f472b6,#a78bfa,rgb(var(--rank-rgb)));filter:drop-shadow(0 0 18px rgba(var(--rank-rgb),.6))}
    .pf-avatar-img{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;border:5px solid #09122a;background:#0d1730;font-size:60px}
    .pf-avatar-img img{width:100%;height:100%;object-fit:cover;object-position:center 18%;transition:transform .35s}
    .pf-avatar:hover .pf-avatar-img img{transform:scale(1.08)}
    .pf-avatar-edit{position:absolute;right:0;bottom:4px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:15px;
      background:linear-gradient(180deg,#8b5cf6,#6d28d9);border:3px solid #09122a;box-shadow:0 6px 14px rgba(0,0,0,.45);transition:transform .15s}
    .pf-avatar:hover .pf-avatar-edit{transform:scale(1.14) rotate(-10deg)}
    .pf-id{flex:1 1 320px;min-width:0}
    .pf-name-wrap{position:relative;display:block;max-width:440px}
    .pf-name{width:100%;padding:4px 36px 6px 0;border:0;border-bottom:2px dashed rgba(255,255,255,.2);background:transparent;color:#fff;font:inherit;
      font-size:clamp(28px,4.4vw,44px);font-weight:800;letter-spacing:-.025em;outline:none;transition:border-color .2s;text-shadow:0 4px 24px rgba(0,0,0,.5)}
    .pf-name::placeholder{color:rgba(255,255,255,.35)}
    .pf-name:focus{border-bottom-color:rgb(var(--rank-rgb));border-bottom-style:solid}
    .pf-name-wrap::after{content:"✎";position:absolute;right:2px;top:50%;transform:translateY(-55%);font-size:18px;opacity:.5;pointer-events:none}
    .pf-rank-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:14px 0 10px}
    .pf-rank-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 15px;border-radius:99px;font-weight:800;font-size:14px;letter-spacing:.02em;
      color:rgb(var(--rank-rgb));background:rgba(var(--rank-rgb),.14);border:1px solid rgba(var(--rank-rgb),.55);box-shadow:0 0 20px rgba(var(--rank-rgb),.2)}
    .pf-points{color:#c7d3e6;font-size:14px}
    .pf-points b{color:#fff;font-size:16px}
    .pf-xp{position:relative;height:12px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.09);max-width:440px;box-shadow:inset 0 1px 3px rgba(0,0,0,.5)}
    .pf-xp i{position:absolute;inset:0 auto 0 0;border-radius:99px;background:linear-gradient(90deg,rgb(var(--rank-rgb)),#38bdf8);box-shadow:0 0 14px rgba(var(--rank-rgb),.7);transition:width .9s cubic-bezier(.2,.8,.2,1)}
    .pf-xp i::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);background-size:220% 100%;animation:pf-shine 2.6s linear infinite}
    .pf-xp-label{margin-top:7px;color:#9fb0c9;font-size:12px}
    .pf-hint{margin-top:10px;color:#7f8fa8;font-size:11.5px;max-width:440px;line-height:1.5}

    /* ---------- Resumen ---------- */
    .pf-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
    .pf-tile{position:relative;display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.09);
      background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.012)),#0b1428;transition:transform .15s,border-color .15s}
    .pf-tile:hover{transform:translateY(-3px);border-color:rgba(var(--t),.55)}
    .pf-tile::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 0% 0%,rgba(var(--t),.2),transparent 60%);pointer-events:none}
    .pf-tile-ic{position:relative;display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:14px;font-size:23px;flex:0 0 auto;
      background:rgba(var(--t),.15);border:1px solid rgba(var(--t),.4)}
    .pf-tile-num{position:relative;font-size:26px;font-weight:800;line-height:1.05;letter-spacing:-.02em}
    .pf-tile-num small{font-size:15px;color:#8fa0bb;font-weight:600}
    .pf-tile-lbl{position:relative;font-size:12px;color:#9fb0c9;margin-top:2px}

    /* ---------- Podio de favoritos ---------- */
    .pf-podium{display:grid;grid-template-columns:1fr 1.18fr 1fr;gap:16px;align-items:end}
    .pf-fav{position:relative}
    .pf-fav-btn{position:relative;display:flex;flex-direction:column;width:100%;padding:0;border-radius:22px;overflow:hidden;cursor:pointer;color:inherit;font:inherit;text-align:left;
      border:1px solid rgba(var(--c),.55);background:linear-gradient(180deg,rgba(var(--c),.12),rgba(9,18,40,.96) 62%),#0a1226;
      box-shadow:0 18px 44px rgba(0,0,0,.45),0 0 34px rgba(var(--c),.16);transition:transform .2s,box-shadow .2s}
    .pf-fav-btn:hover{transform:translateY(-6px);box-shadow:0 26px 56px rgba(0,0,0,.55),0 0 52px rgba(var(--c),.34)}
    .pf-fav-art{position:relative;height:210px;overflow:hidden;background:radial-gradient(circle at 50% 30%,rgba(var(--c),.25),rgba(5,10,24,.9))}
    .pf-fav--first .pf-fav-art{height:264px}
    .pf-fav-art img{width:100%;height:100%;object-fit:cover;object-position:center 15%;transition:transform .5s}
    .pf-fav-btn:hover .pf-fav-art img{transform:scale(1.07)}
    .pf-fav-art::after{content:"";position:absolute;inset:auto 0 0;height:60%;background:linear-gradient(180deg,transparent,rgba(9,18,40,.97));pointer-events:none}
    .pf-fav-fb{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:64px}
    .pf-fav-medal{position:absolute;top:10px;left:10px;z-index:2;display:flex;align-items:center;gap:6px;padding:4px 11px 4px 8px;border-radius:99px;font-size:12px;font-weight:800;
      color:rgb(var(--c));background:rgba(5,10,24,.72);border:1px solid rgba(var(--c),.55);backdrop-filter:blur(8px)}
    .pf-fav-medal span{font-size:17px}
    .pf-fav-info{position:relative;z-index:1;margin-top:-34px;padding:0 16px 16px}
    .pf-fav-name{font-size:19px;font-weight:800;letter-spacing:-.01em;text-shadow:0 2px 12px rgba(0,0,0,.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pf-fav--first .pf-fav-name{font-size:22px}
    .pf-chips{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0 11px}
    .pf-chip-cls{padding:2px 9px;border-radius:99px;font-size:10.5px;font-weight:700;text-transform:capitalize;color:var(--k);background:rgba(255,255,255,.06);border:1px solid var(--k)}
    .pf-stats{display:grid;gap:6px}
    .pf-stat{display:grid;grid-template-columns:32px 1fr 30px;align-items:center;gap:8px;font-size:10.5px;color:#9fb0c9;font-weight:700}
    .pf-stat-bar{height:6px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden}
    .pf-stat-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,rgba(var(--c),.7),rgb(var(--c)))}
    .pf-stat b{color:#fff;text-align:right}
    .pf-fav-clear{position:absolute;top:10px;right:10px;z-index:3;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.2);
      background:rgba(5,10,24,.75);color:#fff;font-size:13px;cursor:pointer;opacity:0;transform:scale(.8);transition:opacity .15s,transform .15s,background .15s}
    .pf-fav:hover .pf-fav-clear,.pf-fav-clear:focus-visible{opacity:1;transform:scale(1)}
    .pf-fav-clear:hover{background:rgba(239,68,68,.55)}
    @media (hover:none){.pf-fav-clear{opacity:.9;transform:scale(1)}}
    .pf-fav-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;height:230px;border-radius:22px;cursor:pointer;color:#a9b8d0;font:inherit;
      border:2px dashed rgba(var(--c),.5);background:linear-gradient(180deg,rgba(var(--c),.07),transparent);transition:transform .2s,background .2s,border-color .2s}
    .pf-fav--first .pf-fav-empty{height:292px}
    .pf-fav-empty:hover{transform:translateY(-5px);background:linear-gradient(180deg,rgba(var(--c),.16),transparent);border-color:rgb(var(--c))}
    .pf-fav-empty .pf-plus{display:flex;align-items:center;justify-content:center;width:58px;height:58px;border-radius:50%;font-size:30px;color:rgb(var(--c));border:2px solid rgba(var(--c),.6);background:rgba(var(--c),.1)}
    .pf-fav-empty b{color:rgb(var(--c));font-size:13px}
    @media (max-width:700px){
      .pf-podium{grid-template-columns:1fr;gap:14px}
      .pf-fav--first{order:-1}
      .pf-fav-art,.pf-fav--first .pf-fav-art{height:200px}
      .pf-fav-empty,.pf-fav--first .pf-fav-empty{height:150px}
    }

    /* ---------- Récords ---------- */
    .pf-records{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:16px}
    .pf-rec{position:relative;padding:20px 20px 18px;border-radius:20px;overflow:hidden;border:1px solid rgba(var(--r),.35);
      background:linear-gradient(180deg,rgba(var(--r),.09),rgba(255,255,255,.01) 55%),#0a1226;box-shadow:0 16px 40px rgba(0,0,0,.35)}
    .pf-rec::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,rgb(var(--r)),transparent)}
    .pf-rec-wide{grid-column:1 / -1}
    .pf-rec h4{margin:0 0 14px;display:flex;align-items:center;gap:9px;font-size:16px;letter-spacing:.01em}
    .pf-rec h4 em{font-style:normal;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:11px;font-size:18px;background:rgba(var(--r),.16);border:1px solid rgba(var(--r),.4)}
    .pf-big{font-size:46px;font-weight:800;line-height:1;letter-spacing:-.03em;color:rgb(var(--r));text-shadow:0 0 30px rgba(var(--r),.5)}
    .pf-big small{font-size:18px;color:#8fa0bb;font-weight:600;text-shadow:none}
    .pf-sub{margin-top:5px;color:#9fb0c9;font-size:13px}
    .pf-bar{position:relative;height:10px;margin:14px 0 6px;border-radius:99px;overflow:hidden;background:rgba(255,255,255,.09)}
    .pf-bar i{position:absolute;inset:0 auto 0 0;border-radius:99px;background:linear-gradient(90deg,rgba(var(--r),.65),rgb(var(--r)));box-shadow:0 0 12px rgba(var(--r),.6)}
    .pf-minis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
    .pf-mini{padding:10px 8px;border-radius:12px;text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
    .pf-mini b{display:block;font-size:20px;line-height:1.1}
    .pf-mini span{font-size:10.5px;color:#8fa0bb}
    .pf-boss{display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:12px;padding:9px 10px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}
    .pf-boss + .pf-boss{margin-top:8px}
    .pf-boss.done{border-color:rgba(var(--r),.4);background:rgba(var(--r),.07)}
    .pf-boss-img{width:44px;height:44px;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#150d28;font-size:20px}
    .pf-boss-img img{width:100%;height:100%;object-fit:cover}
    .pf-boss-name{font-size:13.5px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pf-boss-best{font-size:11px;color:#9fb0c9;margin-top:2px}
    .pf-boss-medals{font-size:17px;letter-spacing:2px;white-space:nowrap}
    .pf-free{display:grid;gap:10px}
    .pf-fr{padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
    .pf-fr-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:800;font-size:13.5px}
    .pf-fr-top span{color:#9fb0c9;font-weight:600;font-size:12px}
    .pf-wl{display:flex;gap:14px;margin-top:8px;font-size:12.5px;color:#b9c6da;flex-wrap:wrap}
    .pf-wl b{font-size:15px}
    .pf-w{color:#86efac}.pf-l{color:#fca5a5}
    .pf-fr .pf-bar{height:7px;margin:9px 0 0}
    .pf-fr .pf-bar i{background:linear-gradient(90deg,#16a34a,#4ade80);box-shadow:none}
    .pf-fr .pf-bar.is-empty i{width:0!important}

    /* ---------- Selector de personajes ---------- */
    .pf-modal{position:fixed;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(1,5,15,.78);backdrop-filter:blur(10px);animation:pf-fade .18s}
    .pf-pk{width:min(880px,100%);max-height:min(86vh,720px);display:flex;flex-direction:column;padding:20px;border-radius:22px;
      border:1px solid rgba(167,139,250,.35);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01)),#0b1427;box-shadow:0 30px 80px rgba(0,0,0,.6);animation:pf-pop .22s}
    .pf-pk-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
    .pf-pk-head h3{margin:0;font-size:20px}
    .pf-pk-head p{margin:4px 0 0;color:#9fb0c9;font-size:12.5px}
    .pf-x{flex:0 0 auto;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:14px;cursor:pointer}
    .pf-x:hover{background:rgba(239,68,68,.4)}
    .pf-pk .search-row{margin-bottom:6px}
    .pf-pk-count{font-size:12px;color:#8fa0bb;margin:2px 2px 8px}
    .pf-pk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:10px;overflow:auto;padding:4px 6px 6px 2px;scrollbar-width:thin;scrollbar-color:rgba(139,92,246,.65) transparent}
    .pf-pick{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 6px 8px;border-radius:14px;cursor:pointer;color:inherit;font:inherit;text-align:center;
      background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);transition:transform .15s,border-color .15s,box-shadow .15s}
    .pf-pick:hover{transform:translateY(-3px);border-color:rgba(167,139,250,.7);box-shadow:0 10px 24px rgba(0,0,0,.4),0 0 20px rgba(139,92,246,.2)}
    .pf-pick.sel{border-color:#fbbf24;box-shadow:0 0 0 1px #fbbf24 inset,0 0 20px rgba(251,191,36,.25);background:rgba(251,191,36,.09)}
    .pf-pick img,.pf-pick .pf-pick-fb{width:100%;aspect-ratio:1;object-fit:cover;object-position:center 15%;border-radius:10px;background:#0d1730;display:flex;align-items:center;justify-content:center;font-size:30px}
    .pf-pick span{font-size:11.5px;font-weight:700;line-height:1.2;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pf-pick em{position:absolute;top:9px;right:9px;font-style:normal;font-size:11px;font-weight:800;padding:1px 7px;border-radius:99px;background:rgba(5,10,24,.85);border:1px solid rgba(251,191,36,.6);color:#fcd34d}
    .pf-pk-foot{display:flex;justify-content:flex-end;gap:10px;margin-top:12px}
    .pf-empty{grid-column:1 / -1;padding:30px;text-align:center;color:#8fa0bb}

    @keyframes pf-spin{to{transform:rotate(360deg)}}
    @keyframes pf-shine{from{background-position:220% 0}to{background-position:-120% 0}}
    @keyframes pf-fade{from{opacity:0}to{opacity:1}}
    @keyframes pf-pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
    @keyframes pf-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    .pf-wrap > *{animation:pf-rise .5s both}
    .pf-wrap > *:nth-child(2){animation-delay:.05s}.pf-wrap > *:nth-child(3){animation-delay:.1s}.pf-wrap > *:nth-child(4){animation-delay:.15s}
    .pf-wrap > *:nth-child(5){animation-delay:.2s}.pf-wrap > *:nth-child(6){animation-delay:.25s}.pf-wrap > *:nth-child(7){animation-delay:.3s}
    @media (prefers-reduced-motion:reduce){
      .pf-ring,.pf-xp i::after,.pf-wrap > *,.pf-modal,.pf-pk{animation:none!important}
      .pf-xp i{transition:none}
    }
    @media (max-width:600px){.pf-hero{padding:22px 18px;gap:20px;justify-content:center;text-align:center}.pf-name-wrap,.pf-xp,.pf-hint{margin-left:auto;margin-right:auto}.pf-rank-row{justify-content:center}.pf-name{text-align:center;padding-right:0}.pf-name-wrap::after{display:none}}
    `;
    document.head.appendChild(st);
  }

  /* =========================================================
     MARCADO (pantalla y chip)
     ========================================================= */
  function imgTag(src, alt, fbEmoji, cls) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" data-fb="${esc(fbEmoji)}" data-cls="${esc(cls || '')}" loading="lazy" decoding="async">`;
  }

  function wireFallbacks(root) {
    if (root.__pfFb) return;
    root.__pfFb = true;
    root.addEventListener('error', e => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.dataset.fb) return;
      const fb = document.createElement('div');
      fb.className = img.dataset.cls || '';
      fb.textContent = img.dataset.fb;
      img.replaceWith(fb);
    }, true);
  }

  function injectMarkup() {
    if (!byId('perfil-screen')) {
      const screen = document.createElement('div');
      screen.id = 'perfil-screen';
      screen.style.display = 'none';
      screen.innerHTML = '<div class="pf-wrap" id="pf-wrap"></div>';
      document.body.appendChild(screen);
      wireFallbacks(screen);
    }
  }

  function renderChip() {
    const menu = byId('main-menu');
    if (!menu) return;
    let chip = byId('pf-chip');
    if (!chip) {
      chip = document.createElement('button');
      chip.id = 'pf-chip';
      chip.className = 'pf-chip';
      chip.title = 'Abrir mi perfil';
      menu.appendChild(chip);
      chip.addEventListener('click', openPerfil);
      wireFallbacks(chip);
    }
    P = loadProfile();
    const g = gather();
    const av = P.avatar && charById(P.avatar);
    chip.style.setProperty('--rank-rgb', g.rank.cur.rgb);
    chip.innerHTML = `
      <span class="pf-chip-av">${av ? imgTag(av.img, av.name, '🎮') : '🎮'}</span>
      <span class="pf-chip-txt"><b>${esc(P.name || 'Jugador')}</b><small>${g.rank.cur.icon} ${esc(g.rank.cur.name)} · Mi perfil</small></span>`;
  }

  /* ---------- Piezas de la pantalla ---------- */
  function heroHTML(g) {
    const av = P.avatar && charById(P.avatar);
    const { cur, next, pct } = g.rank;
    return `
    <section class="pf-hero" id="pf-hero" style="--rank-rgb:${cur.rgb}">
      <div class="pf-hero-bg" id="pf-hero-bg"></div>
      <button class="pf-avatar" id="pf-avatar-btn" title="Cambiar icono">
        <span class="pf-ring"></span>
        <span class="pf-avatar-img">${av ? imgTag(av.img, av.name, '🎮') : '🎮'}</span>
        <span class="pf-avatar-edit">🖼️</span>
      </button>
      <div class="pf-id">
        <label class="pf-name-wrap">
          <input id="pf-name" class="pf-name" type="text" maxlength="${NAME_MAX}" placeholder="Tu nombre de jugador" value="${esc(P.name)}" autocomplete="off" spellcheck="false">
        </label>
        <div class="pf-rank-row">
          <span class="pf-rank-badge">${cur.icon} ${esc(cur.name)}</span>
          <span class="pf-points"><b data-count="${g.points}">${g.points}</b> puntos de gloria</span>
        </div>
        <div class="pf-xp"><i id="pf-xp-fill" style="width:${reduceMotion() ? pct : 0}%" data-pct="${pct}"></i></div>
        <div class="pf-xp-label">${next ? `${g.points} / ${next.min} para ser ${next.icon} ${esc(next.name)}` : '¡Has alcanzado el rango máximo!'}</div>
        <div class="pf-hint">Ganas gloria con victorias en batalla libre (1), capítulos de Historia (3), medallas del Desafío (6), pisos del Infierno (4) y cajas del Inventario (1-50 cada una).</div>
      </div>
    </section>`;
  }

  function tilesHTML(g) {
    const t = (rgb, ic, num, lbl) => `
      <div class="pf-tile" style="--t:${rgb}"><span class="pf-tile-ic">${ic}</span>
        <div><div class="pf-tile-num">${num}</div><div class="pf-tile-lbl">${lbl}</div></div></div>`;
    const story = g.story.total
      ? `<span data-count="${g.story.reached}">${g.story.reached}</span><small> / ${g.story.total}</small>` : '—';
    const med = g.desafio.maxMedals
      ? `<span data-count="${g.desafio.medals}">${g.desafio.medals}</span><small> / ${g.desafio.maxMedals}</small>` : '—';
    return `<div class="pf-tiles">
      ${t('56,189,248', '⚔️', `<span data-count="${g.freeWins}">${g.freeWins}</span>`, 'Victorias en batalla libre')}
      ${t('251,191,36', '📖', story, 'Capítulos de Historia')}
      ${t('168,85,247', '🎖️', med, 'Medallas del Desafío')}
      ${t('251,113,133', '🔥', `<span data-count="${g.hell.highest}">${g.hell.highest}</span>`, 'Piso más alto del Infierno')}
    </div>`;
  }

  function favHTML(slot) {
    const pod = PODIUM[slot];
    const c = P.favs[slot] && charById(P.favs[slot]);
    const first = slot === 0 ? ' pf-fav--first' : '';
    if (!c) {
      return `<div class="pf-fav${first}" style="--c:${pod.rgb}">
        <button class="pf-fav-empty" data-pick-fav="${slot}"><span class="pf-plus">+</span><b>${pod.medal} Elegir favorito ${slot + 1}</b></button>
      </div>`;
    }
    const mx = maxStats();
    const stat = (lbl, k) => {
      const v = Number(c[k]) || 0;
      return `<div class="pf-stat"><span>${lbl}</span><div class="pf-stat-bar"><i style="width:${Math.min(100, Math.round(v / mx[k] * 100))}%"></i></div><b>${v}</b></div>`;
    };
    const chips = (c.classes || []).map(k => `<span class="pf-chip-cls" style="--k:${CLASS_COLORS[k] || '#fbbf24'}">${esc(k)}</span>`).join('');
    return `<div class="pf-fav${first}" style="--c:${pod.rgb}">
      <button class="pf-fav-btn" data-pick-fav="${slot}" title="Cambiar favorito">
        <div class="pf-fav-art">
          ${imgTag(c.img, c.name, '👤', 'pf-fav-fb')}
          <div class="pf-fav-medal"><span>${pod.medal}</span>${pod.label}</div>
        </div>
        <div class="pf-fav-info">
          <div class="pf-fav-name">${esc(c.name)}</div>
          <div class="pf-chips">${chips}</div>
          <div class="pf-stats">${stat('HP', 'hp')}${stat('ATK', 'atk')}${stat('DEF', 'def')}${stat('SPD', 'spd')}</div>
        </div>
      </button>
      <button class="pf-fav-clear" data-clear-fav="${slot}" title="Quitar de favoritos">✕</button>
    </div>`;
  }

  function podiumHTML() {
    return `<div class="pf-podium">${[1, 0, 2].map(favHTML).join('')}</div>`;
  }

  function storyCardHTML(g) {
    const { total, reached } = g.story;
    if (!total) return '';
    const done = reached >= total;
    const pct = Math.round(reached / total * 100);
    return `<div class="pf-rec" style="--r:251,191,36">
      <h4><em>📖</em>Modo Historia</h4>
      <div class="pf-big">${done ? '¡Completada!' : `<span data-count="${reached}">${reached}</span><small> / ${total}</small>`}</div>
      <div class="pf-sub">${done ? 'Has llegado hasta el final de la historia.' : 'Capítulos superados · ahora en el capítulo ' + (reached + 1)}</div>
      <div class="pf-bar"><i style="width:${pct}%"></i></div>
      <div class="pf-sub">${pct}% completado</div>
    </div>`;
  }

  function desafioCardHTML(g) {
    const d = g.desafio;
    if (!d.bosses.length) return '';
    const rows = d.bosses.map(b => {
      const meds = d.levels.map(L => (b.cleared >= L.n ? L.icon : '▫️')).join('')
        + (b.themeAvailable ? (b.themeDone ? ' ⭐' : ' ☆') : '');
      const bests = d.levels.map((L, i) => (b.bests[i] ? `${L.icon} ${b.bests[i]}t` : null)).filter(Boolean);
      if (b.themeAvailable && b.themeBest) bests.push(`⭐ ${b.themeBest}t`);
      return `<div class="pf-boss${b.cleared ? ' done' : ''}">
        <div class="pf-boss-img">${imgTag(b.base.img, b.base.name, '👹')}</div>
        <div style="min-width:0"><div class="pf-boss-name">${b.cleared ? esc(b.base.name) : '???'}</div>
          <div class="pf-boss-best">${bests.length ? 'Mejor: ' + bests.join(' · ') : (b.cleared ? '' : 'Sin vencer')}</div></div>
        <div class="pf-boss-medals">${meds}</div>
      </div>`;
    }).join('');
    return `<div class="pf-rec pf-rec-wide" style="--r:168,85,247">
      <h4><em>⚔️</em>Desafío de bosses <span style="margin-left:auto;font-size:13px;color:#d8b4fe">🎖️ ${d.medals} / ${d.maxMedals}</span></h4>
      ${rows}
    </div>`;
  }

  function hellCardHTML(g) {
    const h = g.hell;
    if (!window.INFIERNO) return '';
    return `<div class="pf-rec" style="--r:248,113,113">
      <h4><em>🔥</em>Infierno Infinito</h4>
      <div class="pf-big"><span data-count="${h.highest}">${h.highest}</span><small> piso más alto</small></div>
      <div class="pf-sub">${h.highest ? 'Hasta dónde has descendido en la torre.' : 'Todavía no has superado ningún piso.'}</div>
      <div class="pf-minis">
        <div class="pf-mini"><b>${h.floors}</b><span>Pisos superados</span></div>
        <div class="pf-mini"><b>${h.clears}</b><span>Victorias</span></div>
        <div class="pf-mini"><b>${h.bestTurns ? h.bestTurns + 't' : '—'}</b><span>Mejor marca</span></div>
      </div>
    </div>`;
  }

  function mpCardHTML() {
    const s = P.mp;
    const pct = s.played ? Math.round(s.w / s.played * 100) : 0;
    return `<div class="pf-rec pf-rec-wide" style="--r:74,222,128">
      <h4><em>🌐</em>Multijugador online</h4>
      <div class="pf-fr">
        <div class="pf-fr-top">1 contra 1 por internet<span>${s.played} partidas</span></div>
        <div class="pf-wl"><span><b class="pf-w">${s.w}</b> victorias</span><span><b class="pf-l">${s.l}</b> derrotas</span>
          <span><b>${pct}%</b> winrate</span><span>🔥 racha <b>${s.streak}</b> · mejor <b>${s.best}</b></span></div>
        <div class="pf-bar${s.played ? '' : ' is-empty'}"><i style="width:${pct}%"></i></div>
      </div>
    </div>`;
  }

  function freeCardHTML() {
    const rows = FREE_MODES.map(m => {
      const s = P.free[m.id];
      if (m.vsIA) {
        const pct = s.played ? Math.round(s.w / s.played * 100) : 0;
        return `<div class="pf-fr">
          <div class="pf-fr-top">${m.icon} ${esc(m.name)}<span>${s.played} partidas</span></div>
          <div class="pf-wl"><span><b class="pf-w">${s.w}</b> victorias</span><span><b class="pf-l">${s.l}</b> derrotas</span>
            <span><b>${pct}%</b> ganadas</span><span>🔥 racha <b>${s.streak}</b> · mejor <b>${s.best}</b></span></div>
          <div class="pf-bar${s.played ? '' : ' is-empty'}"><i style="width:${pct}%"></i></div>
        </div>`;
      }
      return `<div class="pf-fr">
        <div class="pf-fr-top">${m.icon} ${esc(m.name)}<span>${s.played} partidas</span></div>
        <div class="pf-wl"><span>Jugador 1 <b class="pf-w">${s.w}</b></span><span>Jugador 2 <b class="pf-l">${s.l}</b></span></div>
      </div>`;
    }).join('');
    return `<div class="pf-rec pf-rec-wide" style="--r:56,189,248">
      <h4><em>🎮</em>Batalla libre</h4>
      <div class="pf-free" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">${rows}</div>
    </div>`;
  }

  /* =========================================================
     PANTALLA
     ========================================================= */
  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach(el => {
      const to = Number(el.dataset.count) || 0;
      if (to <= 0 || reduceMotion()) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 800;
      const tick = t => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      el.textContent = 0;
      requestAnimationFrame(tick);
    });
  }

  function renderPerfil() {
    P = loadProfile();
    const g = gather();
    const wrap = byId('pf-wrap');
    wrap.innerHTML = `
      <div class="pf-top">
        <h2 class="pf-title">🪪 Perfil de jugador</h2>
        <button id="pf-back" class="class-btn">⬅ Volver al menú</button>
      </div>
      ${heroHTML(g)}
      ${tilesHTML(g)}
      <div class="pf-h">⭐ Personajes favoritos <small>pulsa para elegir · ✕ para quitar</small></div>
      ${podiumHTML()}
      <div class="pf-h">🏆 Récords</div>
      <div class="pf-records">
        ${freeCardHTML()}
        ${mpCardHTML()}
        ${storyCardHTML(g)}
        ${hellCardHTML(g)}
        ${desafioCardHTML(g)}
      </div>`;

    // Fondo difuminado con el icono
    const av = P.avatar && charById(P.avatar);
    const bg = byId('pf-hero-bg');
    if (bg && av) bg.style.backgroundImage = `url("${av.img}")`;

    // Barra de rango animada
    const fill = byId('pf-xp-fill');
    if (fill) requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = fill.dataset.pct + '%'; }));
    countUp(wrap);

    // Eventos
    byId('pf-back').addEventListener('click', closePerfil);
    byId('pf-avatar-btn').addEventListener('click', () => openPicker('avatar'));
    byId('pf-name').addEventListener('input', e => {
      P.name = e.target.value.slice(0, NAME_MAX);
      saveProfile();
      renderChip();
    });
    byId('pf-name').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
    wrap.querySelectorAll('[data-pick-fav]').forEach(b => b.addEventListener('click', () => openPicker('fav', Number(b.dataset.pickFav))));
    wrap.querySelectorAll('[data-clear-fav]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      P.favs[Number(b.dataset.clearFav)] = null;
      saveProfile();
      renderPerfil();
    }));
  }

  /* =========================================================
     SELECTOR DE PERSONAJES (icono y favoritos)
     ========================================================= */
  const pk = { mode: 'avatar', slot: 0, search: '' };

  function openPicker(mode, slot) {
    pk.mode = mode; pk.slot = slot || 0; pk.search = '';
    closePicker();
    const isAv = mode === 'avatar';
    const modal = document.createElement('div');
    modal.id = 'pf-picker';
    modal.className = 'pf-modal';
    modal.innerHTML = `
      <div class="pf-pk" role="dialog" aria-modal="true">
        <div class="pf-pk-head">
          <div>
            <h3>${isAv ? '🖼️ Elige tu icono' : `${PODIUM[pk.slot].medal} Elige tu favorito ${pk.slot + 1}`}</h3>
            <p>${isAv ? 'Puedes usar la imagen de cualquier personaje del juego.' : 'Si eliges uno que ya tienes en otro puesto, se intercambian.'}</p>
          </div>
          <button class="pf-x" id="pf-pk-x" title="Cerrar">✕</button>
        </div>
        <div class="search-row">
          <span class="search-icon">🔎</span>
          <input id="pf-pk-search" class="search-input" type="text" placeholder="Buscar personaje por nombre…" autocomplete="off" spellcheck="false">
        </div>
        <div id="pf-pk-count" class="pf-pk-count"></div>
        <div id="pf-pk-grid" class="pf-pk-grid"></div>
        <div class="pf-pk-foot">
          ${!isAv && P.favs[pk.slot] ? '<button class="class-btn" id="pf-pk-remove">🗑️ Quitar</button>' : ''}
          <button class="class-btn" id="pf-pk-close">Cerrar</button>
        </div>
      </div>`;
    byId('perfil-screen').appendChild(modal);
    wireFallbacks(modal);

    modal.addEventListener('mousedown', e => { if (e.target === modal) closePicker(); });
    byId('pf-pk-x').addEventListener('click', closePicker);
    byId('pf-pk-close').addEventListener('click', closePicker);
    const rm = byId('pf-pk-remove');
    if (rm) rm.addEventListener('click', () => { P.favs[pk.slot] = null; saveProfile(); closePicker(); renderPerfil(); });
    const input = byId('pf-pk-search');
    input.addEventListener('input', () => { pk.search = input.value; renderPickerGrid(); });
    renderPickerGrid();
    setTimeout(() => input.focus(), 30);
  }

  function renderPickerGrid() {
    const grid = byId('pf-pk-grid');
    if (!grid) return;
    const q = norm(pk.search);
    const list = allChars().filter(c => !q || norm(c.name).includes(q));
    const selected = pk.mode === 'avatar' ? P.avatar : P.favs[pk.slot];
    byId('pf-pk-count').textContent = `${list.length} personaje${list.length === 1 ? '' : 's'}`;
    if (!list.length) { grid.innerHTML = '<div class="pf-empty">No hay personajes con ese nombre.</div>'; return; }
    grid.innerHTML = list.map(c => {
      const at = pk.mode === 'fav' ? P.favs.indexOf(c.id) : -1;
      const badge = at >= 0 && at !== pk.slot ? `<em>${PODIUM[at].medal}</em>` : '';
      return `<button class="pf-pick${c.id === selected ? ' sel' : ''}" data-id="${esc(c.id)}" title="${esc(c.name)}">
        ${badge}${imgTag(c.img, c.name, '👤', 'pf-pick-fb')}<span>${esc(c.name)}</span></button>`;
    }).join('');
    grid.querySelectorAll('.pf-pick').forEach(b => b.addEventListener('click', () => choose(b.dataset.id)));
  }

  function choose(id) {
    if (pk.mode === 'avatar') {
      P.avatar = id;
    } else {
      const other = P.favs.indexOf(id);
      if (other >= 0 && other !== pk.slot) P.favs[other] = P.favs[pk.slot];   // intercambio
      P.favs[pk.slot] = id;
    }
    saveProfile();
    closePicker();
    renderPerfil();
    renderChip();
  }

  function closePicker() {
    const m = byId('pf-picker');
    if (m) m.remove();
  }

  /* =========================================================
     ABRIR / CERRAR
     ========================================================= */
  function openPerfil() {
    byId('main-menu').style.display = 'none';
    byId('perfil-screen').style.display = 'flex';
    byId('perfil-screen').scrollTop = 0;
    renderPerfil();
  }

  function closePerfil() {
    closePicker();
    byId('perfil-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
    renderChip();
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const screen = byId('perfil-screen');
    if (!screen || screen.style.display === 'none') return;
    if (byId('pf-picker')) closePicker(); else closePerfil();
  });

  /* =========================================================
     ARRANQUE
     ========================================================= */
  function init() {
    injectStyles();
    injectMarkup();
    installHooks();
    renderChip();

    // El chip se refresca cada vez que se vuelve al menú (p. ej. tras un combate)
    const menu = byId('main-menu');
    if (menu && window.MutationObserver) {
      new MutationObserver(() => { if (menu.style.display !== 'none') renderChip(); })
        .observe(menu, { attributes: true, attributeFilter: ['style'] });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Versión PÚBLICA del perfil (la usa amigos.js para compartirla con tus amigos).
     Solo datos de juego: nada de claves ni de almacenamiento interno. */
  function snapshot() {
    const g = gather();
    return {
      name: P.name, avatar: P.avatar, favs: P.favs.slice(),
      points: g.points,
      rank: { name: g.rank.cur.name, icon: g.rank.cur.icon, rgb: g.rank.cur.rgb, pct: g.rank.pct,
        nextName: g.rank.next ? g.rank.next.name : '', nextIcon: g.rank.next ? g.rank.next.icon : '', nextMin: g.rank.next ? g.rank.next.min : 0 },
      freeWins: g.freeWins, freePlayed: g.freePlayed,
      free: FREE_MODES.map(m => Object.assign({ icon: m.icon, name: m.name }, P.free[m.id])),
      mp: Object.assign({}, P.mp),
      story: { reached: g.story.reached, total: g.story.total },
      medals: { n: g.desafio.medals, max: g.desafio.maxMedals },
      hell: { highest: g.hell.highest, floors: g.hell.floors, bestTurns: g.hell.bestTurns }
    };
  }

  window.PERFIL = { open: openPerfil, load: loadProfile, recordMultiplayer, snapshot, charById };
})();
