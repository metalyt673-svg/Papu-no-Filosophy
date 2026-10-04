/* multijugador.js — Modo Multijugador online (1 contra 1)
   ---------------------------------------------------------------------------
   Partida por internet entre dos jugadores, cada uno desde su dispositivo.
   Usa PeerJS (WebRTC): NO necesita servidor propio. Funciona en cualquier
   hosting estático. Los dos jugadores se conectan con un código de sala.

   INSTALACIÓN (juego.html), DESPUÉS de perfil.js:
       <script src="multijugador.js" defer></script>
   Además game.js debe ser la versión que trae  gameRandom()  (viene incluida).

   CÓMO FUNCIONA
     - Los dos navegadores ejecutan el MISMO motor de combate (game.js) con la
       misma semilla aleatoria. Solo se envían las ACCIONES (baneo, equipo,
       habilidad, cambio, rendición), no el estado completo.
     - El anfitrión es Jugador 1 y el invitado es Jugador 2.
     - Tras cada acción ambos comparan una huella (hash) del estado. Si no
       coinciden, el anfitrión envía una copia del estado y se resincroniza.
     - Las estadísticas del perfil NO cuentan estas partidas.

   NOTAS
     - Necesita conexión a internet para cargar PeerJS y para que los dos
       jugadores se encuentren (servidor de señalización público de PeerJS).
     - Con algunas redes (CGNAT, firewalls estrictos) WebRTC puede no conectar.
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  const VERSION = 1;
  const PEER_SOURCES = [
    'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
    'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'
  ];
  const ID_PREFIX = 'batallamejorada-';
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const NICK_KEY = 'batalla-mp-nick';
  const PING_MS = 4000;
  const PEER_TIMEOUT_MS = 45000;

  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cleanNick = s => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
  const safeLog = m => { try { if (typeof log === 'function') log(m); } catch (e) { /* ignorar */ } };

  /* ---------------- Estado del multijugador ---------------- */
  const MP = {
    active: false, role: null, isHost: false,
    peer: null, conn: null, code: '',
    bans: false, seed: 0,
    nick: { me: 'Jugador', opp: 'Rival' },
    ready: { me: false, opp: false },
    started: false, oppTeamIds: null,
    queue: [], draining: false,
    applied: 0, hashes: { me: {}, opp: {} },
    applyingRemote: false, presetTarget: null, busy: false, frozen: false,
    rematch: { me: false, opp: false },
    lastSeen: 0, leaving: false, ended: false, installed: false, pingTimer: null,
    desyncs: 0,
    avatar: { me: null, opp: null },
    timer: { key: null, deadline: 0, firedKey: null, int: null }
  };
  const oppRole = () => (MP.role === 'p1' ? 'p2' : 'p1');
  const nickOf = p => (p === MP.role ? MP.nick.me : MP.nick.opp);
  const avatarOf = p => (p === MP.role ? MP.avatar.me : MP.avatar.opp);

  /* ---------------- Perfil (icono y nombre) ---------------- */
  function myProfile() {
    try { return (window.PERFIL && window.PERFIL.load && window.PERFIL.load()) || {}; }
    catch (e) { return {}; }
  }
  function avatarImg(id) {
    if (!id || typeof id !== 'string') return null;
    try { const b = typeof findBaseById === 'function' ? findBaseById(id) : null; return b ? b.img : null; }
    catch (e) { return null; }
  }

  /* ---------------- Límite de tiempo por turno ---------------- */
  const TURN_MS = 3 * 60 * 1000;   // 3 minutos

  function ensureTimerEl() {
    let el = byId('mp-timer');
    if (!el) {
      const anchor = byId('turnInfo');
      if (!anchor || !anchor.parentNode) return null;
      el = document.createElement('span');
      el.id = 'mp-timer';
      el.className = 'mp-timer';
      el.style.display = 'none';
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    }
    return el;
  }

  function fmtTime(ms) {
    const s = Math.ceil(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function tickTurnTimer() {
    const el = ensureTimerEl();
    if (!el) return;
    if (!MP.active || state.phase !== 'battle' || MP.ended) {
      el.style.display = 'none';
      MP.timer.key = null;
      return;
    }
    const key = state.turnCount + '|' + state.turnOwner;
    if (key !== MP.timer.key) { MP.timer.key = key; MP.timer.deadline = Date.now() + TURN_MS; }
    const left = Math.max(0, MP.timer.deadline - Date.now());
    const mine = state.turnOwner === MP.role;
    el.style.display = 'inline-flex';
    el.className = 'mp-timer' + (mine ? ' mine' : '') + (left <= 30000 ? ' low' : '');
    el.textContent = `⏱ ${fmtTime(left)}${mine ? '' : ' · ' + MP.nick.opp}`;
    if (left <= 0 && mine) handleTurnTimeout(key);
  }

  /* Solo el jugador al que le toca decide el salto de turno; el rival lo recibe como acción. */
  function handleTurnTimeout(key) {
    if (MP.timer.firedKey === key || MP.ended || MP.frozen) return;
    if (MP.busy || state.moveLock || MP.draining) {
      // Hay una acción a medias: si es el selector de objetivo, se cancela (se aplica a sí mismo).
      if (MP.busy && !state.moveLock) {
        const m = byId('modal');
        if (m && m.style.display !== 'none') {
          const btns = m.querySelectorAll('.class-btn');
          if (btns.length) btns[btns.length - 1].click();
        }
      }
      MP.timer.deadline = Date.now() + 1500;
      return;
    }
    MP.timer.firedKey = key;
    try { if (typeof closeModal === 'function') closeModal(); } catch (e) { /* ignorar */ }
    safeLog(`⏱ ${esc(MP.nick.me)} se quedó sin tiempo y pierde el turno.`);
    send({ t: 'skip' });
    window.endTurn(getActive(MP.role));
    afterAction();
  }

  function startTurnTimerLoop() {
    if (MP.timer.int) return;
    MP.timer.int = setInterval(tickTurnTimer, 500);
  }

  /* ---------------- Cartel de emparejamiento (icono + nombre) ---------------- */
  function renderVsBanner() {
    const root = byId('game-root');
    if (!root) return;
    let el = byId('mp-vs');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mp-vs';
      el.className = 'mp-vs';
      root.insertBefore(el, root.firstChild);
    }
    const side = p => {
      const img = avatarImg(avatarOf(p));
      const av = img
        ? `<img src="${esc(img)}" alt="" onerror="this.replaceWith(document.createTextNode('🎮'))">`
        : '🎮';
      const me = p === MP.role ? ' <small>(tú)</small>' : '';
      return `<div class="mp-vs-side ${p}"><span class="mp-vs-av">${av}</span>
        <span class="mp-vs-name">${esc(nickOf(p))}${me}</span></div>`;
    }
    el.innerHTML = `${side('p1')}<span class="mp-vs-vs">VS</span>${side('p2')}`;
    el.style.display = 'flex';
  }

  /* ---------------- Aleatoriedad compartida (mulberry32) ----------------
     game.js llama a gameRandom(), que usa window.__mpRng si existe. */
  let rngS = 0;
  function seedRng(seed) {
    rngS = seed >>> 0;
    window.__mpRng = function () {
      rngS = (rngS + 0x6D2B79F5) >>> 0;
      let t = rngS;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randomSeed() {
    try {
      const a = new Uint32Array(1);
      (window.crypto || crypto).getRandomValues(a);
      return a[0] >>> 0;
    } catch (e) { return (Math.random() * 4294967296) >>> 0; }
  }

  /* ---------------- Utilidades ---------------- */
  function waitFor(cond, ms) {
    return new Promise(res => {
      const t0 = Date.now();
      (function tick() {
        if (cond()) return res(true);
        if (Date.now() - t0 > ms) return res(false);
        setTimeout(tick, 40);
      })();
    });
  }

  function hashState() {
    const parts = [state.turnOwner, state.turnCount, state.phase, state.activeIndex.p1, state.activeIndex.p2,
      state.suddenDeath ? 1 : 0, JSON.stringify(state.roundActed || {}), rngS];
    ['p1', 'p2'].forEach(p => state.teams[p].forEach(c => {
      parts.push(c.id, c.hp, c.shield, c.stunned, c.tempAtk, c.tempDef, c.tempSpd,
        c.moves.map(m => m.cd).join(','),
        (c.statusEffects || []).length, (c.controlEffects || []).length,
        (c.debuffEffects || []).length, (c.tempEffects || []).length, (c.specialEffects || []).length);
    }));
    const s = parts.join('|');
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  function send(msg) {
    try { if (MP.conn && MP.conn.open) MP.conn.send(msg); } catch (e) { /* conexión cerrada */ }
  }

  /* ---------------- PeerJS ---------------- */
  function loadPeerLib() {
    if (window.Peer) return Promise.resolve();
    return new Promise((res, rej) => {
      let i = 0;
      const next = () => {
        if (i >= PEER_SOURCES.length) return rej(new Error('No se pudo cargar PeerJS. Comprueba tu conexión.'));
        const s = document.createElement('script');
        s.src = PEER_SOURCES[i++];
        s.onload = () => (window.Peer ? res() : next());
        s.onerror = next;
        document.head.appendChild(s);
      };
      next();
    });
  }

  const randomCode = () => {
    let c = '';
    for (let i = 0; i < 5; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    return c;
  };

  function setStatus(msg, isError) {
    const el = byId('mp-status');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? '#fca5a5' : '';
  }

  function resetNetwork() {
    MP.leaving = true;
    if (MP.pingTimer) { clearInterval(MP.pingTimer); MP.pingTimer = null; }
    try { if (MP.conn) MP.conn.close(); } catch (e) { /* ignorar */ }
    try { if (MP.peer) MP.peer.destroy(); } catch (e) { /* ignorar */ }
    MP.conn = null; MP.peer = null; MP.code = '';
    MP.leaving = false;
  }

  function showChoose() {
    byId('mp-step-choose').style.display = '';
    byId('mp-step-wait').style.display = 'none';
  }

  function failLobby(msg) {
    resetNetwork();
    showChoose();
    setStatus(msg, true);
  }

  async function createRoom() {
    const nick = cleanNick(byId('mp-nick').value) || 'Jugador';
    saveNick(nick);
    MP.nick.me = nick;
    MP.bans = !!byId('mp-bans').checked;
    MP.isHost = true; MP.role = 'p1';
    setStatus('Conectando con el servidor de salas…');
    try { await loadPeerLib(); } catch (e) { return failLobby(e.message); }

    const tryCreate = attempt => {
      const code = randomCode();
      let peer;
      try { peer = new window.Peer(ID_PREFIX + code, { debug: 0 }); }
      catch (e) { return failLobby('No se pudo crear la sala: ' + e.message); }
      MP.peer = peer;
      peer.on('open', () => {
        MP.code = code;
        byId('mp-step-choose').style.display = 'none';
        byId('mp-step-wait').style.display = '';
        byId('mp-code-show').textContent = code;
        byId('mp-wait-msg').textContent = 'Comparte este código con tu rival y espera a que se conecte…';
        setStatus('');
      });
      peer.on('connection', conn => {
        if (MP.conn) { try { conn.close(); } catch (e) { /* ignorar */ } return; }
        MP.conn = conn;
        attachConn(conn);
      });
      peer.on('error', err => {
        if (err && err.type === 'unavailable-id' && attempt < 5) {
          try { peer.destroy(); } catch (e) { /* ignorar */ }
          return tryCreate(attempt + 1);
        }
        if (MP.active) return;   // errores tardíos durante la partida los gestiona onClose
        failLobby('Error de conexión: ' + ((err && (err.type || err.message)) || 'desconocido'));
      });
    };
    tryCreate(0);
  }

  async function joinRoom() {
    const nick = cleanNick(byId('mp-nick').value) || 'Jugador';
    saveNick(nick);
    MP.nick.me = nick;
    const code = String(byId('mp-code').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 5) return setStatus('Escribe el código de 5 caracteres de la sala.', true);
    MP.isHost = false; MP.role = 'p2';
    setStatus('Conectando…');
    try { await loadPeerLib(); } catch (e) { return failLobby(e.message); }

    let peer;
    try { peer = new window.Peer({ debug: 0 }); }
    catch (e) { return failLobby('No se pudo iniciar la conexión: ' + e.message); }
    MP.peer = peer;
    let connected = false;
    const timer = setTimeout(() => { if (!connected) failLobby('No se pudo conectar con la sala (tiempo agotado).'); }, 15000);
    peer.on('open', () => {
      const conn = peer.connect(ID_PREFIX + code, { reliable: true, serialization: 'json' });
      MP.conn = conn;
      attachConn(conn, () => { connected = true; clearTimeout(timer); });
    });
    peer.on('error', err => {
      clearTimeout(timer);
      if (MP.active) return;
      const t = err && err.type;
      failLobby(t === 'peer-unavailable' ? 'No existe ninguna sala con ese código.' : 'Error de conexión: ' + (t || (err && err.message) || 'desconocido'));
    });
  }

  function attachConn(conn, onOpen) {
    const opened = () => {
      MP.lastSeen = Date.now();
      if (onOpen) onOpen();
      MP.avatar.me = myProfile().avatar || null;
      send({ t: 'hello', v: VERSION, nick: MP.nick.me, avatar: MP.avatar.me });
      if (!MP.pingTimer) {
        MP.pingTimer = setInterval(() => {
          send({ t: 'p' });
          if (MP.active && Date.now() - MP.lastSeen > PEER_TIMEOUT_MS) onClose('timeout');
        }, PING_MS);
      }
    };
    conn.on('open', opened);
    if (conn.open) opened();
    conn.on('data', onMessage);
    conn.on('close', () => onClose('close'));
    conn.on('error', () => onClose('error'));
  }

  /* ---------------- Mensajes ---------------- */
  function onMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    MP.lastSeen = Date.now();
    switch (msg.t) {
      case 'p': return;
      case 'hello':
        if (msg.v !== VERSION) return failLobby('Versiones distintas del juego. Actualiza la página en los dos dispositivos.');
        MP.nick.opp = cleanNick(msg.nick) || 'Rival';
        MP.avatar.opp = typeof msg.avatar === 'string' ? msg.avatar.slice(0, 80) : null;
        if (MP.isHost && !MP.active) {
          MP.seed = randomSeed();
          send({ t: 'config', bans: MP.bans, seed: MP.seed });
          beginSetup();
        }
        return;
      case 'config':
        if (MP.isHost) return;
        MP.bans = !!msg.bans;
        MP.seed = msg.seed >>> 0;
        beginSetup();
        return;
      case 'team':
        if (!Array.isArray(msg.ids)) return;
        MP.oppTeamIds = msg.ids.slice(0, 3).map(String);
        MP.ready.opp = true;
        if (MP.active && state.phase === 'select') { updateTurnInfo(); tryStartBattle(); }
        return;
      case 'ban': case 'move': case 'swap': case 'surrender': case 'skip':
        MP.queue.push(msg);
        drain();
        return;
      case 'h':
        MP.hashes.opp[msg.n] = msg.h;
        compareHash(msg.n);
        return;
      case 'resync_req':
        if (MP.isHost) sendSnapshot();
        return;
      case 'snap':
        if (!MP.isHost) applySnapshot(msg.data);
        return;
      case 'rematch':
        MP.rematch.opp = true;
        refreshEndButtons();
        maybeRematch();
        return;
      case 'bye':
        return onClose('bye');
    }
  }

  function onClose(why) {
    if (MP.leaving || MP.ended) return;
    if (!MP.active) {
      if (byId('mp-screen') && byId('mp-screen').style.display !== 'none') failLobby('Se perdió la conexión con el rival.');
      return;
    }
    MP.ended = true;
    if (MP.pingTimer) { clearInterval(MP.pingTimer); MP.pingTimer = null; }
    if (state.phase === 'battle') {
      state.phase = 'ended';
      safeLog(`🔌 ${esc(MP.nick.opp)} se ha desconectado.`);
      finishMatch(MP.role, 'disconnect');
    } else if (state.phase !== 'ended') {
      showInfoBanner(`🔌 ${esc(MP.nick.opp)} se ha desconectado.`);
      state.phase = 'ended';
      finishMatch(null, 'disconnect');
    } else {
      refreshEndButtons();
    }
  }

  /* ---------------- Inicio de partida ---------------- */
  function beginSetup() {
    MP.active = true;
    installPatches();
    MP.ready = { me: false, opp: false };
    MP.started = false; MP.oppTeamIds = null;
    MP.queue = []; MP.draining = false;
    MP.applied = 0; MP.hashes = { me: {}, opp: {} };
    MP.applyingRemote = false; MP.presetTarget = null; MP.busy = false; MP.frozen = false;
    MP.rematch = { me: false, opp: false };
    MP.ended = false;
    MP.recorded = false;
    seedRng(MP.seed);

    byId('mp-screen').style.display = 'none';
    const logEl = byId('log'); if (logEl) logEl.innerHTML = '';
    hideEndUi();
    state.moveLock = false;
    window.GAME_MODE = 'pvp';
    window.startMode('pvp', MP.bans);
    renderVsBanner();
    startTurnTimerLoop();
    MP.timer.key = null; MP.timer.firedKey = null;
    safeLog(`🌐 Partida online: ${esc(nickOf('p1'))} (J1) contra ${esc(nickOf('p2'))} (J2).`);
  }

  function applySelectionUI() {
    if (!MP.active || state.phase !== 'select') return;
    const own = MP.role, opp = oppRole();
    const ownList = byId(own + '-list'), oppList = byId(opp + '-list');
    if (ownList && ownList.parentElement) ownList.parentElement.style.display = '';
    if (oppList && oppList.parentElement) oppList.parentElement.style.display = 'none';
    const ownTitle = own === 'p1'
      ? (ownList && ownList.parentElement && ownList.parentElement.querySelector && ownList.parentElement.querySelector('h3'))
      : byId('p2-title');
    if (ownTitle) ownTitle.textContent = `${MP.nick.me} — elige tu equipo`;
    const startBtn = byId('startBtn');
    if (startBtn) startBtn.style.display = '';
    const sb = byId('story-surrender-btn'); if (sb) sb.style.display = 'none';
    const mine = byId('mp-surrender-btn'); if (mine) mine.style.display = 'none';
    window.updateStartBtn();
    updateTurnInfo();
  }

  function tryStartBattle() {
    if (MP.started || !MP.ready.me || !MP.ready.opp || !MP.oppTeamIds) return;
    const ids = MP.oppTeamIds;
    const valid = ids.length === 3 && new Set(ids).size === 3 &&
      ids.every(id => findBaseById(id) && (!MP.bans || !isBanned(id)));
    if (!valid) { showInfoBanner('⚠️ El rival envió un equipo no válido. Se cancela la partida.'); return leaveMatch(); }
    state.teams[oppRole()] = ids.map(id => cloneCharacter(findBaseById(id)));
    MP.started = true;
    MP.origStartBattle();
    applyBattleUI();
    reportHash();   // huella del estado inicial (n = 0)
  }

  function applyBattleUI() {
    const arena = document.querySelectorAll ? document.querySelectorAll('.battle-arena .team-panel') : [];
    const panels = Array.prototype.slice.call(arena);
    ['p1', 'p2'].forEach((p, i) => {
      const lbl = p === 'p2' ? byId('enemy-label') : (panels[i] && panels[i].querySelector('.small'));
      if (lbl) lbl.textContent = `${nickOf(p)}${p === MP.role ? ' (tú)' : ''}`;
    });
    const sb = byId('story-surrender-btn'); if (sb) sb.style.display = 'none';
    const mine = byId('mp-surrender-btn'); if (mine) mine.style.display = 'inline-block';
    updateTurnInfo();
    window.renderMovesArea();
  }

  /* ---------------- Acciones locales y remotas ---------------- */
  function afterAction() {
    MP.applied++;
    reportHash();
  }

  function reportHash() {
    const n = MP.applied, h = hashState();
    MP.hashes.me[n] = h;
    send({ t: 'h', n, h });
    compareHash(n);
  }

  function compareHash(n) {
    const a = MP.hashes.me[n], b = MP.hashes.opp[n];
    if (a === undefined || b === undefined) return;
    delete MP.hashes.me[n]; delete MP.hashes.opp[n];
    if (a !== b) desync(n);
  }

  function desync(n) {
    MP.desyncs++;
    console.warn('[multijugador] desincronización en la acción', n);
    safeLog('⚠️ Se detectó una desincronización. Resincronizando…');
    MP.frozen = true;
    MP.hashes = { me: {}, opp: {} };
    if (MP.isHost) sendSnapshot();
    else send({ t: 'resync_req' });
  }

  async function sendSnapshot() {
    MP.frozen = true;
    await waitFor(() => !state.moveLock && !MP.busy && !MP.draining, 8000);
    MP.queue = [];
    const data = JSON.parse(JSON.stringify({
      teams: state.teams, activeIndex: state.activeIndex, turnOwner: state.turnOwner,
      turnCount: state.turnCount, suddenDeath: state.suddenDeath, roundActed: state.roundActed,
      phase: state.phase, rng: rngS, applied: MP.applied
    }));
    send({ t: 'snap', data });
    MP.frozen = false;
    if (state.phase === 'battle') window.renderMovesArea();
  }

  function applySnapshot(d) {
    if (!d || !d.teams) return;
    MP.queue = [];
    state.teams.p1 = d.teams.p1; state.teams.p2 = d.teams.p2;
    state.activeIndex = d.activeIndex; state.turnOwner = d.turnOwner;
    state.turnCount = d.turnCount; state.suddenDeath = d.suddenDeath;
    state.roundActed = d.roundActed; state.phase = d.phase;
    rngS = d.rng >>> 0; MP.applied = d.applied;
    state.moveLock = false; MP.busy = false; MP.frozen = false;
    MP.hashes = { me: {}, opp: {} };
    updateArena(); updateTurnInfo();
    safeLog('✅ Partida resincronizada con el anfitrión.');
  }

  async function drain() {
    if (MP.draining) return;
    MP.draining = true;
    try {
      while (MP.queue.length) {
        const ok = await waitFor(() => !state.moveLock && !MP.busy, 8000);
        if (!ok) { MP.queue = []; desync(MP.applied); break; }
        const msg = MP.queue.shift();
        await applyRemote(msg);
      }
    } finally { MP.draining = false; }
  }

  async function applyRemote(msg) {
    const opp = oppRole();
    if (msg.t === 'ban') {
      if (typeof banTurnPlayer !== 'function' || banTurnPlayer() !== opp || bansFinished()) return;
      if (msg.id !== null && (typeof msg.id !== 'string' || !findBaseById(msg.id) || isBanned(msg.id))) return;
      MP.applyingRemote = true;
      try { window.commitBan(msg.id); } finally { MP.applyingRemote = false; }
      return;
    }
    if (msg.t === 'surrender') { return endBySurrender(opp); }
    if (state.phase !== 'battle') return;

    if (msg.t === 'skip') {
      if (state.turnOwner !== opp) return desync(MP.applied);
      safeLog(`⏱ ${esc(nickOf(opp))} se quedó sin tiempo y pierde el turno.`);
      window.endTurn(getActive(opp));
      afterAction();
      return;
    }

    if (msg.t === 'swap') {
      const team = state.teams[opp];
      const idx = Number(msg.idx);
      if (state.turnOwner !== opp || !team[idx] || team[idx].hp <= 0 || idx === state.activeIndex[opp]) { return desync(MP.applied); }
      MP.applyingRemote = true;
      try { MP.origPerformSwap(opp, idx, false); } finally { MP.applyingRemote = false; }
      afterAction();
      return;
    }

    if (msg.t === 'move') {
      const actor = getActive(opp);
      const move = actor && actor.moves.find(m => m.id === msg.moveId);
      if (state.turnOwner !== opp || !actor || !move || move.cd > 0) { return desync(MP.applied); }
      MP.applyingRemote = true;
      MP.presetTarget = { value: (msg.target === undefined ? null : msg.target) };
      try { await MP.origOnUseMove(opp, msg.moveId); }
      finally { MP.applyingRemote = false; MP.presetTarget = null; }
      afterAction();
    }
  }

  /* ---------------- Fin de partida ---------------- */
  function endBySurrender(loser) {
    if (state.phase !== 'battle') return;
    state.phase = 'ended';
    MP.ended = true;
    safeLog(`🏳️ ${esc(nickOf(loser))} se ha rendido.`);
    const area = byId('moves-area'); if (area) area.innerHTML = '<div class="small">Batalla finalizada.</div>';
    updateTurnInfo();
    const winner = loser === 'p1' ? 'p2' : 'p1';
    setTimeout(() => finishMatch(winner, 'surrender'), 500);
  }

  function onBattleEnd(result) {
    // result es relativo a p1: 'win' = ha ganado p1.
    MP.ended = true;
    finishMatch(result === 'win' ? 'p1' : 'p2', 'ko');
  }

  function finishMatch(winner, reason) {
    MP.ended = true;
    if (winner && !MP.recorded) {
      MP.recorded = true;
      try { if (window.PERFIL && window.PERFIL.recordMultiplayer) window.PERFIL.recordMultiplayer(winner === MP.role); }
      catch (e) { /* el perfil nunca debe romper la partida */ }
    }
    const mine = byId('mp-surrender-btn'); if (mine) mine.style.display = 'none';
    let title;
    if (winner === null) title = 'Partida terminada';
    else title = winner === MP.role ? '🏆 ¡Has ganado!' : '💀 Has perdido';
    let sub = '';
    if (reason === 'surrender') sub = winner === MP.role ? `${MP.nick.opp} se ha rendido.` : 'Te has rendido.';
    if (reason === 'disconnect') sub = `${MP.nick.opp} se ha desconectado.`;
    MP.result = { title, sub };
    const t = byId('turnInfo'); if (t) t.innerText = title;
    showEndUi();
  }

  function showInfoBanner(html) {
    const area = byId('moves-area');
    if (area) area.innerHTML = `<div class="small">${html}</div>`;
  }

  function endButtonsHTML() {
    const connected = !!(MP.conn && MP.conn.open) && !MP.leavingMatch;
    const rematchLabel = MP.rematch.me ? '⏳ Esperando al rival…' : (MP.rematch.opp ? '🔁 Aceptar revancha' : '🔁 Revancha');
    return `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
      <button id="mp-rematch" class="class-btn" ${connected && !MP.rematch.me ? '' : 'disabled'}>${rematchLabel}</button>
      <button id="mp-exit" class="class-btn">🚪 Salir al menú</button></div>`;
  }

  function showEndUi() {
    const r = MP.result || { title: '', sub: '' };
    const area = byId('moves-area');
    if (area) {
      area.innerHTML = `<div><strong>${esc(r.title)}</strong></div><div class="small">${esc(r.sub)}</div>${endButtonsHTML()}`;
      bindEndButtons(area);
    }
    let ov = byId('mp-result');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'mp-result';
      document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    ov.innerHTML = `<div class="mp-result-card"><h2>${esc(r.title)}</h2><p class="small">${esc(r.sub)}</p>${endButtonsHTML()}
      <button id="mp-result-close" class="class-btn" style="margin-top:8px">Ver el combate</button></div>`;
    bindEndButtons(ov);
    const close = byId('mp-result-close');
    if (close) close.onclick = () => { ov.style.display = 'none'; };
  }

  function bindEndButtons(root) {
    const rb = root.querySelector ? root.querySelector('#mp-rematch') : null;
    const eb = root.querySelector ? root.querySelector('#mp-exit') : null;
    if (rb) rb.onclick = () => { if (MP.rematch.me) return; MP.rematch.me = true; send({ t: 'rematch' }); refreshEndButtons(); maybeRematch(); };
    if (eb) eb.onclick = () => leaveMatch();
  }

  function refreshEndButtons() {
    if (state.phase !== 'ended' || !MP.result) return;
    showEndUi();
  }

  function hideEndUi() {
    const ov = byId('mp-result'); if (ov) ov.style.display = 'none';
  }

  function maybeRematch() {
    if (!MP.isHost || !MP.rematch.me || !MP.rematch.opp) return;
    MP.seed = randomSeed();
    send({ t: 'config', bans: MP.bans, seed: MP.seed });
    beginSetup();
  }

  function leaveMatch() {
    send({ t: 'bye' });
    MP.leavingMatch = true;
    setTimeout(() => { try { location.reload(); } catch (e) { /* ignorar */ } }, 120);
  }

  /* ---------------- Parches sobre game.js (solo actúan si MP.active) ---------------- */
  function installPatches() {
    if (MP.installed) return;
    MP.installed = true;
    const W = window;
    const orig = {};
    ['isAiBanner', 'maybeAiBan', 'renderBanPhase', 'commitBan', 'playerLabel', 'toggleSelectChar',
      'updateStartBtn', 'startBattle', 'initAll', 'renderMovesArea', 'onUseMove', 'performSwap',
      'openTargetModal', 'updateTurnInfo', 'checkKO', 'onStoryBattleEnd'].forEach(n => { orig[n] = W[n]; });
    MP.origStartBattle = orig.startBattle;
    MP.origPerformSwap = orig.performSwap;
    MP.origOnUseMove = orig.onUseMove;

    W.isAiBanner = function (player) {
      return MP.active ? player !== MP.role : orig.isAiBanner.apply(this, arguments);
    };
    W.maybeAiBan = function () {
      if (!MP.active) return orig.maybeAiBan.apply(this, arguments);
      W.renderBanPhase();
    };
    W.renderBanPhase = function () {
      const r = orig.renderBanPhase.apply(this, arguments);
      if (MP.active) {
        const wait = byId('ban-wait');
        if (wait) wait.innerText = (!bansFinished() && banTurnPlayer() !== MP.role) ? `⏳ Esperando el baneo de ${MP.nick.opp}…` : '';
      }
      return r;
    };
    W.commitBan = function (id) {
      if (!MP.active || MP.applyingRemote) return orig.commitBan.apply(this, arguments);
      if (banTurnPlayer() !== MP.role || bansFinished() || MP.frozen) return;
      if (id !== null && isBanned(id)) return;
      send({ t: 'ban', id });
      return orig.commitBan.apply(this, arguments);
    };
    W.playerLabel = function (player) {
      if (!MP.active) return orig.playerLabel.apply(this, arguments);
      return esc(nickOf(player)) + (player === MP.role ? ' (tú)' : '');
    };
    W.toggleSelectChar = function (player, id) {
      if (MP.active && (player !== MP.role || MP.ready.me)) return;
      return orig.toggleSelectChar.apply(this, arguments);
    };
    W.updateStartBtn = function () {
      if (!MP.active) return orig.updateStartBtn.apply(this, arguments);
      const b = byId('startBtn');
      if (!b) return;
      b.disabled = !(state.teams[MP.role].length === 3) || MP.ready.me || state.phase !== 'select';
      b.innerText = MP.ready.me ? 'Esperando al rival…' : 'Estoy listo ✔';
    };
    W.startBattle = function () {
      if (!MP.active) return orig.startBattle.apply(this, arguments);
      if (MP.started || state.phase !== 'select') return;
      const mine = state.teams[MP.role];
      if (mine.length !== 3 || MP.ready.me) return;
      MP.ready.me = true;
      send({ t: 'team', ids: mine.map(c => c.id) });
      W.updateStartBtn();
      updateTurnInfo();
      tryStartBattle();
    };
    W.initAll = function () {
      const r = orig.initAll.apply(this, arguments);
      if (MP.active) applySelectionUI();
      return r;
    };
    W.renderMovesArea = function () {
      if (!MP.active || state.phase !== 'battle') return orig.renderMovesArea.apply(this, arguments);
      if (state.turnOwner !== MP.role || MP.frozen) {
        const area = byId('moves-area');
        const a = getActive(state.turnOwner);
        area.innerHTML = `<div class="small">⏳ Turno de ${esc(nickOf(state.turnOwner))}${a ? ' — ' + esc(a.name) + ' (activo)' : ''}…</div>`;
        return;
      }
      return orig.renderMovesArea.apply(this, arguments);
    };
    W.onUseMove = async function (playerKey, moveId) {
      if (!MP.active || MP.applyingRemote) return orig.onUseMove.apply(this, arguments);
      if (playerKey !== MP.role || state.turnOwner !== MP.role || state.phase !== 'battle' ||
          state.moveLock || MP.busy || MP.frozen) return;
      const actor = getActive(playerKey);
      const move = actor && actor.moves.find(m => m.id === moveId);
      if (!move || move.cd > 0 || actor.hp <= 0 || actor.stunned > 0) return;
      MP.busy = true;
      try {
        let target = null;
        if (isSupportMove(move)) {
          const chosen = await orig.openTargetModal(playerKey, getAliveTeam(playerKey));
          target = chosen == null ? null : chosen;
        }
        if (state.phase !== 'battle' || state.turnOwner !== MP.role) return;
        send({ t: 'move', moveId, target });
        MP.presetTarget = { value: target };
        lockButtons();
        await orig.onUseMove(playerKey, moveId);
      } finally {
        MP.presetTarget = null;
        MP.busy = false;
      }
      afterAction();
    };
    W.performSwap = function (player, newIndex, consumeTurn) {
      if (!MP.active || MP.applyingRemote) return orig.performSwap.apply(this, arguments);
      if (player !== MP.role || state.turnOwner !== MP.role || state.phase !== 'battle' ||
          state.moveLock || MP.busy || MP.frozen) return;
      const t = state.teams[player][newIndex];
      if (!t || t.hp <= 0 || newIndex === state.activeIndex[player]) return;
      send({ t: 'swap', idx: newIndex });
      const r = orig.performSwap.apply(this, arguments);
      afterAction();
      return r;
    };
    W.openTargetModal = function (player, targets) {
      if (MP.active && MP.presetTarget) {
        const v = MP.presetTarget.value;
        MP.presetTarget = null;
        return Promise.resolve(v);
      }
      return orig.openTargetModal.apply(this, arguments);
    };
    W.updateTurnInfo = function () {
      const r = orig.updateTurnInfo.apply(this, arguments);
      if (!MP.active) return r;
      const el = byId('turnInfo');
      if (!el) return r;
      if (state.phase === 'select') {
        el.innerText = MP.ready.me
          ? `Esperando a ${MP.nick.opp}…${MP.ready.opp ? ' (ya está listo)' : ''}`
          : `Elige 3 personajes y pulsa «Estoy listo»${MP.ready.opp ? ` — ${MP.nick.opp} ya está listo` : ''}`;
      } else if (state.phase === 'battle') {
        el.innerText = `Turno ${state.turnCount}: ${nickOf(state.turnOwner)}${state.turnOwner === MP.role ? ' (tú)' : ''}${state.suddenDeath ? ' ⚠️ MUERTE SÚBITA' : ''}`;
      }
      return r;
    };
    // Estos dos se envuelven aquí (no al cargar) para quedar por fuera del hook de perfil.js:
    // durante la comprobación de KO se marca storyMode para que el perfil no cuente la partida
    // y para que el fin de combate llegue a onStoryBattleEnd, que aquí lo recoge.
    W.checkKO = function () {
      if (!MP.active) return orig.checkKO.apply(this, arguments);
      const prev = state.storyMode;
      state.storyMode = true;
      try { return orig.checkKO.apply(this, arguments); }
      finally { state.storyMode = prev; }
    };
    W.onStoryBattleEnd = function (result) {
      if (MP.active) return onBattleEnd(result);
      return orig.onStoryBattleEnd.apply(this, arguments);
    };
  }

  function lockButtons() {
    const area = byId('moves-area');
    if (area && area.querySelectorAll) area.querySelectorAll('button').forEach(b => { b.disabled = true; });
  }

  /* ---------------- Interfaz: menú y sala ---------------- */
  function loadNick() { try { return cleanNick(localStorage.getItem(NICK_KEY)) || ''; } catch (e) { return ''; } }
  function saveNick(n) { try { localStorage.setItem(NICK_KEY, n); } catch (e) { /* ignorar */ } }

  function injectStyles() {
    if (byId('mp-styles')) return;
    const st = document.createElement('style');
    st.id = 'mp-styles';
    st.textContent = `
    #mp-screen{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:20px;overflow:auto;z-index:123;
      background:radial-gradient(circle at 20% 0%,rgba(34,197,94,.14),transparent 36%),radial-gradient(circle at 85% 10%,rgba(56,189,248,.16),transparent 38%),linear-gradient(180deg,#040712 0%,#071124 60%,#050a16 100%)}
    #mp-screen .mp-card{width:min(440px,100%);display:flex;flex-direction:column;gap:10px}
    #mp-screen input[type=text]{padding:10px 12px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:rgba(255,255,255,.04);color:inherit;font-size:15px;width:100%;box-sizing:border-box}
    #mp-screen .mp-row{display:flex;gap:8px;align-items:center}
    #mp-screen .mp-code{font-size:38px;font-weight:900;letter-spacing:.18em;text-align:center;padding:10px;border-radius:12px;background:rgba(255,255,255,.05);border:1px dashed rgba(125,211,252,.5)}
    .mp-timer{display:inline-flex;align-items:center;margin-left:8px;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:800;
      color:#cbd5e1;background:rgba(148,163,184,.10);border:1px solid rgba(148,163,184,.25)}
    .mp-timer.mine{color:#bae6fd;background:rgba(56,189,248,.12);border-color:rgba(56,189,248,.45)}
    .mp-timer.low{color:#fecaca;background:rgba(248,113,113,.16);border-color:rgba(248,113,113,.55)}
    .mp-vs{display:flex;align-items:center;justify-content:center;gap:18px;margin:0 0 12px;padding:12px 16px;border-radius:18px;
      border:1px solid rgba(167,139,250,.28);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01)),#0b1427}
    .mp-vs-side{display:flex;align-items:center;gap:12px;flex:1;min-width:0}
    .mp-vs-side.p2{flex-direction:row-reverse;text-align:right}
    .mp-vs-av{display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;overflow:hidden;flex:0 0 auto;font-size:26px;background:#0d1730}
    .mp-vs-side.p1 .mp-vs-av{box-shadow:0 0 0 3px rgba(56,189,248,.85),0 0 16px rgba(56,189,248,.35)}
    .mp-vs-side.p2 .mp-vs-av{box-shadow:0 0 0 3px rgba(244,114,182,.85),0 0 16px rgba(244,114,182,.35)}
    .mp-vs-av img{width:100%;height:100%;object-fit:cover;object-position:center 18%}
    .mp-vs-name{font-weight:800;font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .mp-vs-name small{font-weight:600;color:#94a3b8}
    .mp-vs-vs{font-weight:900;letter-spacing:.12em;color:#d8ccff;padding:6px 12px;border-radius:99px;background:rgba(139,92,246,.14);border:1px solid rgba(167,139,250,.35)}
    #mp-result{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.72);z-index:124}
    #mp-result .mp-result-card{padding:22px 26px;border-radius:16px;background:#0b1530;border:1px solid rgba(148,163,184,.25);text-align:center;min-width:260px;max-width:90vw}`;
    document.head.appendChild(st);
  }

  function injectMarkup() {
    if (!byId('mp-screen')) {
      const s = document.createElement('div');
      s.id = 'mp-screen';
      s.innerHTML = `
        <div class="menu-card mp-card">
          <h2>🌐 Multijugador online</h2>
          <p class="small">Partida 1 contra 1 por internet. Uno crea la sala y el otro entra con el código.</p>
          <label class="small" for="mp-nick">Tu nombre</label>
          <input id="mp-nick" type="text" maxlength="16" placeholder="Jugador" autocomplete="off">
          <div id="mp-step-choose">
            <label class="small" style="display:flex;gap:8px;align-items:center;margin:6px 0">
              <input id="mp-bans" type="checkbox"> Con fase de baneos (4 por jugador)
            </label>
            <button id="mp-create" class="menu-btn">➕ Crear sala</button>
            <div class="mp-row" style="margin-top:8px">
              <input id="mp-code" type="text" maxlength="5" placeholder="CÓDIGO" autocomplete="off" style="text-transform:uppercase;text-align:center;letter-spacing:.2em">
              <button id="mp-join" class="menu-btn" style="margin:0;white-space:nowrap">🔗 Unirse</button>
            </div>
          </div>
          <div id="mp-step-wait" style="display:none">
            <div class="small">Código de sala</div>
            <div id="mp-code-show" class="mp-code"></div>
            <div class="mp-row" style="margin-top:8px">
              <button id="mp-copy" class="class-btn">📋 Copiar código</button>
            </div>
            <div id="mp-wait-msg" class="small" style="margin-top:8px"></div>
          </div>
          <div id="mp-status" class="small" style="min-height:18px"></div>
          <button id="mp-back" class="class-btn">⬅ Volver al menú</button>
        </div>`;
      document.body.appendChild(s);
      byId('mp-create').addEventListener('click', createRoom);
      byId('mp-join').addEventListener('click', joinRoom);
      byId('mp-back').addEventListener('click', closeLobby);
      byId('mp-copy').addEventListener('click', () => {
        const code = MP.code;
        try { navigator.clipboard.writeText(code); setStatus('Código copiado.'); }
        catch (e) { setStatus('Código: ' + code); }
      });
      byId('mp-code').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });
    }

    if (!byId('menu-multijugador')) {
      const anchor = byId('menu-pve-ban') || byId('menu-pvp-ban');
      const btn = document.createElement('button');
      btn.id = 'menu-multijugador';
      btn.className = 'menu-btn';
      btn.textContent = '🌐 Multijugador online (1v1)';
      btn.addEventListener('click', openLobby);
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(btn, anchor.nextSibling);
      else { const card = document.querySelector('#main-menu .main-menu-card'); if (card) card.appendChild(btn); }
    }

    if (!byId('mp-surrender-btn')) {
      const restart = byId('restartBtn');
      if (restart && restart.parentNode) {
        const b = document.createElement('button');
        b.id = 'mp-surrender-btn';
        b.className = 'class-btn';
        b.style.cssText = 'display:none;background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4)';
        b.textContent = '🏳️ Rendirse';
        b.addEventListener('click', () => {
          if (!MP.active || state.phase !== 'battle') return;
          if (!confirm('¿Seguro que quieres rendirte?')) return;
          send({ t: 'surrender' });
          endBySurrender(MP.role);
        });
        restart.parentNode.insertBefore(b, restart);
      }
    }
  }

  function openLobby() {
    byId('main-menu').style.display = 'none';
    byId('mp-screen').style.display = 'flex';
    byId('mp-nick').value = cleanNick(myProfile().name) || loadNick() || MP.nick.me || '';
    showChoose();
    setStatus('');
  }

  function closeLobby() {
    resetNetwork();
    byId('mp-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
  }

  function init() {
    injectStyles();
    injectMarkup();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Para depurar desde la consola del navegador.
  window.MULTIJUGADOR = { MP, open: openLobby, createRoom, joinRoom, hashState };
})();
