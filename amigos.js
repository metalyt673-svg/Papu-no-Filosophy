/* amigos.js — AMIGOS (sin servidor propio)
   ---------------------------------------------------------------------------
   - Añade amigos escribiendo su nombre de jugador (el del perfil).
   - Ves su perfil completo: icono, rango, favoritos y récords.
   - Los perfiles se actualizan EN DIRECTO mientras tu amigo está conectado.
     Si no lo está, ves su último perfil guardado y cuándo lo viste por última vez.

   CÓMO FUNCIONA
     Usa PeerJS (WebRTC), igual que multijugador.js: no hace falta servidor.
     Cada jugador con nombre aparece "en línea" con el ID  batallamejorada-amigo-<nombre>
     y, cuando abres la lista, te conectas directamente con cada amigo. Ambos os
     enviáis vuestro perfil público y, mientras la conexión siga abierta, cada
     cambio (una victoria, un favorito nuevo...) se reenvía solo.

   INSTALACIÓN (juego.html), DESPUÉS de perfil.js:
       <script src="amigos.js" defer></script>
   (perfil.js debe ser la versión que trae  PERFIL.snapshot ; viene incluida.)

   LÍMITES (por no usar servidor)
     - Solo puedes ver datos nuevos de un amigo cuando está conectado.
     - Los nombres no son únicos: si alguien usa el mismo nombre que tu amigo
       cuando él no está, verás un aviso ⚠️ (cada jugador tiene un código interno
       que se comprueba), pero no se mezclarán sus datos.
     - Solo se comparte el perfil público (nombre, icono, favoritos, rango y récords).
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  if (!window.PERFIL || typeof window.PERFIL.snapshot !== 'function') {
    console.warn('[amigos.js] Debe cargarse DESPUÉS de perfil.js (versión con PERFIL.snapshot).');
    return;
  }
  const PERFIL = window.PERFIL;

  const KEY = 'batalla-amigos';
  const ID_PREFIX = 'batallamejorada-amigo-';
  const PEER_SOURCES = [
    'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
    'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'
  ];
  const TICK_MS = 4000;          // revisa cambios de tu perfil y de tu nombre
  const RETRY_EVERY = 5;         // cada 5 ticks (~20 s) reintenta con los amigos desconectados
  const CONNECT_TIMEOUT = 8000;

  /* ---------------- utilidades ---------------- */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const keyOf = name => norm(name).replace(/[^a-z0-9]/g, '').slice(0, 16);
  const cleanName = s => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function randomUid() {
    try {
      const a = new Uint8Array(12);
      crypto.getRandomValues(a);
      return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { return Date.now().toString(16) + Math.random().toString(16).slice(2, 12); }
  }

  function ago(ts) {
    if (!ts) return 'nunca';
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return 'hace un momento';
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.floor(h / 24)} d`;
  }

  /* ---------------- datos guardados ---------------- */
  function loadData() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
    const out = { uid: typeof d.uid === 'string' && d.uid ? d.uid : randomUid(), online: d.online !== false, friends: [] };
    (Array.isArray(d.friends) ? d.friends : []).forEach(f => {
      if (!f || typeof f.key !== 'string' || !f.key) return;
      out.friends.push({
        key: f.key, name: cleanName(f.name) || f.key, uid: typeof f.uid === 'string' ? f.uid : '',
        snap: cleanSnap(f.snap), seen: Number(f.seen) || 0, warn: !!f.warn
      });
    });
    return out;
  }
  const A = loadData();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(A)); } catch (e) { /* modo privado */ } }
  save();

  /* ---------------- perfil público: enviar y recibir ---------------- */
  function mySnap() { return Object.assign(PERFIL.snapshot(), { uid: A.uid }); }

  /* Todo lo que llega de otra persona se reconstruye campo a campo (nunca se usa tal cual). */
  function cleanSnap(r) {
    if (!r || typeof r !== 'object') return null;
    const n = v => Math.max(0, Math.min(1e9, Math.floor(Number(v)) || 0));
    const s = (v, len) => String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, '').slice(0, len || 16);
    const id = v => (typeof v === 'string' ? v.slice(0, 80) : null);
    const name = cleanName(r.name);
    if (!name) return null;
    const rk = r.rank || {};
    const rgb = /^\d{1,3},\d{1,3},\d{1,3}$/.test(rk.rgb) ? rk.rgb : '148,163,184';
    const rec = o => { o = o || {}; return { played: n(o.played), w: n(o.w), l: n(o.l), streak: n(o.streak), best: n(o.best) }; };
    return {
      uid: /^[a-z0-9]{8,40}$/.test(r.uid) ? r.uid : '',
      name, avatar: id(r.avatar),
      favs: [0, 1, 2].map(i => id(Array.isArray(r.favs) ? r.favs[i] : null)),
      points: n(r.points),
      rank: { name: s(rk.name, 20), icon: s(rk.icon, 6), rgb, pct: Math.min(100, n(rk.pct)),
        nextName: s(rk.nextName, 20), nextIcon: s(rk.nextIcon, 6), nextMin: n(rk.nextMin) },
      freeWins: n(r.freeWins), freePlayed: n(r.freePlayed),
      free: (Array.isArray(r.free) ? r.free.slice(0, 6) : []).map(m => Object.assign({ icon: s(m && m.icon, 6), name: s(m && m.name, 40) }, rec(m))),
      mp: rec(r.mp),
      story: { reached: n(r.story && r.story.reached), total: n(r.story && r.story.total) },
      medals: { n: n(r.medals && r.medals.n), max: n(r.medals && r.medals.max) },
      hell: { highest: n(r.hell && r.hell.highest), floors: n(r.hell && r.hell.floors), bestTurns: n(r.hell && r.hell.bestTurns) }
    };
  }

  /* ---------------- conexión (PeerJS) ---------------- */
  let peer = null, peerKey = '', status = 'off', retryTimer = null, tickN = 0, lastPushed = '';
  let loading = false, failKey = '';   // evita crear conexiones en bucle si falla o el nombre está ocupado
  const conns = {};      // conexiones salientes: key → conn
  const inc = {};        // conexiones entrantes: key → conn
  const subs = new Set(); // quien nos ha saludado y debe recibir nuestros cambios
  const live = {};       // key → { snap, at } último perfil recibido (también de no amigos)
  const attempts = {};   // key → función que resuelve un intento de conexión en curso
  const lastTry = {};    // key → momento del último intento

  function loadPeerLib() {
    if (window.Peer) return Promise.resolve();
    return new Promise((res, rej) => {
      let i = 0;
      const next = () => {
        if (i >= PEER_SOURCES.length) return rej(new Error('No se pudo cargar PeerJS.'));
        const sc = document.createElement('script');
        sc.src = PEER_SOURCES[i++];
        sc.onload = () => (window.Peer ? res() : next());
        sc.onerror = next;
        document.head.appendChild(sc);
      };
      next();
    });
  }

  function setStatus(s) { if (status !== s) { status = s; refresh(); } }
  function isOnline(key) {
    return !!((conns[key] && conns[key].open) || (inc[key] && inc[key].open));
  }
  function onlineCount() { return A.friends.filter(f => isOnline(f.key)).length; }

  function scheduleRetry() {
    if (retryTimer) return;
    retryTimer = setTimeout(() => { retryTimer = null; startPeer(); }, 15000);
  }

  function stopPeer() {
    Object.keys(conns).forEach(k => { try { conns[k].close(); } catch (e) { /* ignorar */ } delete conns[k]; });
    Object.keys(inc).forEach(k => { try { inc[k].close(); } catch (e) { /* ignorar */ } delete inc[k]; });
    subs.clear();
    if (peer) { const p = peer; peer = null; peerKey = ''; try { p.destroy(); } catch (e) { /* ignorar */ } }
  }

  function startPeer() {
    if (!A.online) { stopPeer(); return setStatus('off'); }
    const myKey = keyOf(PERFIL.load().name);
    if (!myKey) { stopPeer(); return setStatus('noname'); }
    if (peer && peerKey === myKey && !peer.destroyed) return;
    if (loading) return;
    if ((status === 'taken' || status === 'error') && retryTimer && myKey === failKey) return;   // espera al reintento
    stopPeer();
    setStatus('connecting');
    loading = true;
    loadPeerLib().then(() => {
      loading = false;
      if (!A.online || keyOf(PERFIL.load().name) !== myKey || peer) return;   // cambió mientras cargaba
      let p;
      try { p = new window.Peer(ID_PREFIX + myKey, { debug: 0 }); }
      catch (e) { failKey = myKey; setStatus('error'); return scheduleRetry(); }
      peer = p; peerKey = myKey;
      p.on('open', () => {
        if (peer !== p) return;
        setStatus('ready');
        lastPushed = '';
        A.friends.forEach(f => connectFriend(f));
      });
      p.on('connection', onIncoming);
      p.on('disconnected', () => { if (peer === p && !p.destroyed) { try { p.reconnect(); } catch (e) { /* ignorar */ } } });
      p.on('close', () => { if (peer === p) { peer = null; peerKey = ''; failKey = myKey; setStatus('error'); scheduleRetry(); } });
      p.on('error', err => onPeerError(p, err));
    }).catch(() => { loading = false; failKey = myKey; setStatus('error'); scheduleRetry(); });
  }

  function onPeerError(p, err) {
    if (peer !== p) return;
    const type = err && err.type;
    if (type === 'peer-unavailable') {
      const m = /batallamejorada-amigo-([a-z0-9]+)/.exec(String(err.message || ''));
      if (m && attempts[m[1]]) attempts[m[1]](false);
      return;
    }
    if (type === 'unavailable-id') {          // otra persona ya está conectada con tu nombre
      failKey = peerKey; stopPeer(); setStatus('taken'); return scheduleRetry();
    }
    if (type === 'network' || type === 'server-error' || type === 'socket-error' || type === 'socket-closed') {
      failKey = peerKey; setStatus('error'); scheduleRetry();
    }
  }

  /* Alguien se conecta a nosotros: le saludamos con nuestro perfil y le avisaremos de cambios. */
  function onIncoming(conn) {
    conn.on('data', m => {
      if (!m || typeof m !== 'object') return;
      if (m.t === 'hi') {
        const s = cleanSnap(m.snap);
        if (s) { conn.__k = keyOf(s.name); inc[conn.__k] = conn; gotSnap(conn.__k, m.snap); }
        subs.add(conn);
        try { conn.send({ t: 'snap', snap: mySnap() }); } catch (e) { /* ignorar */ }
      } else if (m.t === 'snap' && conn.__k) {
        gotSnap(conn.__k, m.snap);
      }
    });
    const gone = () => {
      subs.delete(conn);
      const k = conn.__k;
      if (k && inc[k] === conn) { delete inc[k]; markSeen(k); }
      refresh();
    };
    conn.on('close', gone);
    conn.on('error', gone);
  }

  function markSeen(key) {
    const f = A.friends.find(x => x.key === key);
    if (f && !f.warn) { f.seen = Date.now(); save(); }
  }

  /* Nos conectamos a un amigo (o a un nombre que queremos añadir). cb(true/false) al resolverse. */
  function connectFriend(f, cb) {
    const key = f.key;
    if (!peer || !peer.open) { if (cb) cb(false); return; }
    if (isOnline(key)) { if (cb) cb(true); return; }
    if (Date.now() - (lastTry[key] || 0) < 6000 && !cb) return;
    lastTry[key] = Date.now();
    let conn;
    try { conn = peer.connect(ID_PREFIX + key, { reliable: true, serialization: 'json' }); }
    catch (e) { if (cb) cb(false); return; }
    conns[key] = conn;
    let done = false, timer = null;
    const fin = ok => {
      if (done) return;
      done = true; clearTimeout(timer);
      if (attempts[key] === fin) delete attempts[key];
      if (!ok) {
        if (conns[key] === conn) delete conns[key];
        try { conn.close(); } catch (e) { /* ignorar */ }
      }
      if (cb) cb(ok);
    };
    attempts[key] = fin;
    timer = setTimeout(() => { if (!conn.open || !live[key]) fin(false); }, CONNECT_TIMEOUT);
    conn.on('open', () => { try { conn.send({ t: 'hi', snap: mySnap() }); } catch (e) { /* ignorar */ } });
    conn.on('data', m => {
      if (m && m.t === 'snap') { gotSnap(key, m.snap); fin(true); }
    });
    const closed = () => {
      if (conns[key] === conn) { delete conns[key]; markSeen(key); }
      fin(false);
      refresh();
    };
    conn.on('close', closed);
    conn.on('error', closed);
  }

  /* Llega el perfil de alguien (por saludo o por actualización en directo). */
  function gotSnap(key, raw) {
    const s = cleanSnap(raw);
    if (!s || keyOf(s.name) !== key) return;     // el nombre debe corresponder a su conexión
    live[key] = { snap: s, at: Date.now() };
    const f = A.friends.find(x => x.key === key);
    if (f) {
      if (f.uid && s.uid && f.uid !== s.uid) {
        f.warn = true;                           // otra persona con el mismo nombre: no se mezclan los datos
      } else {
        f.snap = s; f.name = s.name; f.warn = false; f.seen = Date.now();
        if (!f.uid) f.uid = s.uid;
      }
      save();
    }
    refresh();
  }

  /* Reenvía tu perfil a quien esté conectado cuando cambia (victorias, favoritos, icono...). */
  function pushIfChanged() {
    let str;
    try { str = JSON.stringify(mySnap()); } catch (e) { return; }
    if (str === lastPushed) return;
    lastPushed = str;
    const msg = { t: 'snap', snap: JSON.parse(str) };
    const targets = new Set(subs);
    Object.keys(conns).forEach(k => { if (conns[k] && conns[k].open) targets.add(conns[k]); });
    targets.forEach(c => { try { if (c.open) c.send(msg); } catch (e) { /* ignorar */ } });
  }

  function tick() {
    startPeer();                                  // también reacciona a cambios de nombre
    if (status === 'ready') {
      pushIfChanged();
      if (++tickN % RETRY_EVERY === 0) A.friends.forEach(f => { if (!isOnline(f.key)) connectFriend(f); });
    }
  }

  /* ---------------- añadir / quitar amigos ---------------- */
  function addFriend(raw) {
    const name = cleanName(raw), key = keyOf(name);
    if (!key) return setMsg('Escribe un nombre de jugador válido.', 'err');
    if (key === keyOf(PERFIL.load().name)) return setMsg('Ese eres tú 😄', 'err');
    if (A.friends.some(f => f.key === key)) return setMsg('Ya es tu amigo.', 'err');
    if (status !== 'ready') return setMsg('Tu conexión de amigos aún no está lista (mira el estado de arriba).', 'err');
    setMsg(`Buscando a «${esc(name)}»…`, 'info');
    byId('am-add-btn').disabled = true;
    connectFriend({ key }, ok => {
      const btn = byId('am-add-btn'); if (btn) btn.disabled = false;
      if (A.friends.some(f => f.key === key)) return;
      if (ok && live[key]) {
        const s = live[key].snap;
        A.friends.push({ key, name: s.name, uid: s.uid, snap: s, seen: Date.now(), warn: false });
        save();
        const inp = byId('am-input'); if (inp) inp.value = '';
        setMsg(`✅ ${esc(s.name)} añadido a tus amigos.`, 'ok');
      } else if (confirm(`«${name}» no está conectado ahora mismo, así que no puedo comprobar que exista.\n\n¿Añadirlo igualmente? Verás su perfil en cuanto se conecte.`)) {
        A.friends.push({ key, name, uid: '', snap: null, seen: 0, warn: false });
        save();
        const inp = byId('am-input'); if (inp) inp.value = '';
        setMsg(`Añadido «${esc(name)}». Aparecerá cuando se conecte.`, 'info');
      } else setMsg('', '');
      refresh();
    });
  }

  function removeFriend(key) {
    const f = A.friends.find(x => x.key === key);
    if (!f || !confirm(`¿Quitar a ${f.name} de tus amigos?`)) return;
    A.friends = A.friends.filter(x => x.key !== key);
    if (conns[key]) { try { conns[key].close(); } catch (e) { /* ignorar */ } delete conns[key]; }
    if (ui.view === key) ui.view = null;
    save(); refresh();
  }

  /* ---------------- interfaz ---------------- */
  const ui = { open: false, view: null, msg: '', msgCls: '' };

  function injectStyles() {
    if (byId('amigos-styles')) return;
    const st = document.createElement('style');
    st.id = 'amigos-styles';
    st.textContent = `
    #amigos-screen{position:fixed;inset:0;display:none;align-items:flex-start;justify-content:center;padding:24px 16px 40px;overflow:auto;z-index:126;color:#fff;
      background:radial-gradient(circle at 12% 0%,rgba(74,222,128,.13),transparent 34%),radial-gradient(circle at 88% 6%,rgba(56,189,248,.15),transparent 36%),
      radial-gradient(circle at 50% 100%,rgba(139,92,246,.14),transparent 40%),linear-gradient(180deg,#050a18,#0a1226 55%,#04070f)}
    .am-wrap{width:min(1040px,100%);display:flex;flex-direction:column;gap:20px}
    .am-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .am-title{margin:0;font-size:clamp(22px,2.6vw,32px);font-weight:800;letter-spacing:-.02em;background:linear-gradient(90deg,#fff,#bbf7d0,#bae6fd);-webkit-background-clip:text;background-clip:text;color:transparent}
    .am-panel{display:flex;flex-direction:column;gap:14px;padding:18px 20px;border-radius:20px;border:1px solid rgba(255,255,255,.1);
      background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),#09122a;box-shadow:0 18px 44px rgba(0,0,0,.42)}
    .am-status{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:14px;font-weight:600}
    .am-toggle{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:#a9b8d0;cursor:pointer;user-select:none}
    .am-add{display:flex;gap:10px;flex-wrap:wrap}
    .am-add input{flex:1 1 220px;min-width:0;padding:12px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:rgba(5,10,24,.8);color:#fff;font:inherit;font-size:15px;outline:none}
    .am-add input:focus{border-color:#4ade80;box-shadow:0 0 0 3px rgba(74,222,128,.18)}
    .am-add button,.am-link{padding:12px 20px;border:0;border-radius:14px;cursor:pointer;font:inherit;font-weight:700;color:#04210f;background:linear-gradient(180deg,#4ade80,#22c55e);box-shadow:0 8px 20px rgba(34,197,94,.3)}
    .am-add button:disabled{opacity:.55;cursor:wait}
    .am-link{padding:8px 14px;font-size:13px}
    .am-msg{min-height:18px;font-size:13px}
    .am-msg.ok{color:#4ade80}.am-msg.err{color:#fb7185}.am-msg.info{color:#93c5fd}
    .am-h{display:flex;align-items:center;gap:10px;margin:2px 0 -4px;font-size:18px;font-weight:800}
    .am-h::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(74,222,128,.5),transparent)}
    .am-h small{font-weight:500;color:#8fa0bb;font-size:12px}
    .am-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
    .am-card{position:relative;display:flex;align-items:center;gap:14px;padding:14px;border-radius:18px;cursor:pointer;text-align:left;color:inherit;font:inherit;
      border:1px solid rgba(var(--rank-rgb,148,163,184),.4);background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.015)),#09122a;
      box-shadow:0 10px 26px rgba(0,0,0,.4);transition:transform .15s,box-shadow .15s}
    .am-card:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(0,0,0,.5),0 0 28px rgba(var(--rank-rgb,148,163,184),.25)}
    .am-card.off{opacity:.78}
    .am-av{position:relative;flex:0 0 auto;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;background:#0d1730;
      box-shadow:0 0 0 3px rgba(var(--rank-rgb,148,163,184),.9),0 0 16px rgba(var(--rank-rgb,148,163,184),.4)}
    .am-av img{width:100%;height:100%;object-fit:cover;object-position:center 18%;border-radius:50%}
    .am-dot{position:absolute;right:-1px;bottom:-1px;width:16px;height:16px;border-radius:50%;border:3px solid #09122a;background:#64748b}
    .am-dot.on{background:#4ade80;box-shadow:0 0 10px #4ade80}
    .am-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
    .am-info b{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .am-info small{font-size:12px;color:#9fb0c9}
    .am-info .am-rk{color:rgb(var(--rank-rgb,148,163,184));font-weight:700}
    .am-x{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(5,10,24,.8);color:#fff;cursor:pointer;opacity:0;transition:opacity .15s}
    .am-card:hover .am-x,.am-x:focus-visible{opacity:1}
    .am-x:hover{background:rgba(239,68,68,.6)}
    @media (hover:none){.am-x{opacity:.85}}
    .am-empty{padding:30px;text-align:center;color:#8fa0bb;border:1px dashed rgba(255,255,255,.18);border-radius:18px}
    .am-warn{margin-top:4px;font-size:11px;color:#fbbf24;font-weight:700}
    .am-live{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;background:rgba(5,10,24,.7);border:1px solid rgba(255,255,255,.15)}
    .am-live.on{color:#4ade80;border-color:rgba(74,222,128,.5)}
    .am-live.off{color:#cbd5e1}
    .am-hero{position:relative;display:flex;align-items:center;gap:26px;flex-wrap:wrap;padding:28px;border-radius:26px;overflow:hidden;
      border:1px solid rgba(var(--rank-rgb),.45);background:#09122a;box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 70px rgba(var(--rank-rgb),.14)}
    .am-hero-bg{position:absolute;inset:-40px;background-size:cover;background-position:center 20%;filter:blur(38px) saturate(1.35);opacity:.3;transform:scale(1.15)}
    .am-hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(9,18,42,.2),rgba(9,18,42,.82))}
    .am-hero>*{position:relative;z-index:1}
    .am-bigav{width:140px;height:140px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:56px;overflow:hidden;background:#0d1730;
      border:5px solid #09122a;box-shadow:0 0 0 4px rgba(var(--rank-rgb),.9),0 0 30px rgba(var(--rank-rgb),.5)}
    .am-bigav img{width:100%;height:100%;object-fit:cover;object-position:center 18%}
    .am-hid{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:8px}
    .am-name{margin:0;font-size:clamp(26px,3.4vw,38px);font-weight:800;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis}
    .am-recs{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
    .am-rec{padding:16px 18px;border-radius:18px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01)),#09122a}
    .am-rec h4{margin:0 0 10px;font-size:14px}
    .am-rec p{display:flex;justify-content:space-between;gap:10px;margin:5px 0;font-size:13px;color:#b4c2d9}
    .am-rec p b{color:#fff}
    #amigos-screen .pf-fav-btn{cursor:default}
    .am-col{display:flex;flex-direction:column;gap:22px;flex:0 1 300px;width:min(300px,100%)}
    .am-col > .story-poster-panel{flex:0 0 auto;width:100%}
    @media (max-width:900px){.am-col{flex:0 1 auto;width:min(420px,100%)}}
    .am-poster-panel .story-poster-frame img{max-height:200px}
    .am-poster-panel{border-color:rgba(74,222,128,.5)!important;
      background:radial-gradient(circle at 50% 0%,rgba(74,222,128,.18),transparent 50%),linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),#07140f!important;
      box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 44px rgba(74,222,128,.14)!important}
    .am-poster-panel:hover{box-shadow:0 30px 78px rgba(0,0,0,.58),0 0 60px rgba(74,222,128,.3)!important}
    .am-poster-panel .story-poster-subtitle{color:#86efac!important}
    .am-poster-panel .story-poster-cta{background:linear-gradient(180deg,rgba(74,222,128,.96),rgba(22,163,74,.94))!important;color:#04210f!important;box-shadow:0 10px 22px rgba(22,163,74,.36)!important}
    .am-poster-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:150px;font-size:64px;border-radius:18px;background:linear-gradient(180deg,#14532d,#07140f)}
    `;
    document.head.appendChild(st);
  }

  /* personajes: usa el catálogo local de perfil.js (si el amigo tiene uno que no existe aquí, se muestra un emoji) */
  const charById = id => { try { return id ? PERFIL.charById(id) : null; } catch (e) { return null; } };
  function imgTag(src, alt, fb, cls) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" data-fb="${esc(fb)}" data-cls="${esc(cls || '')}" loading="lazy" decoding="async">`;
  }
  function avatarHTML(snap, fb) {
    const c = snap && charById(snap.avatar);
    return c ? imgTag(c.img, c.name, fb || '🎮') : (fb || '🎮');
  }

  function statusHTML() {
    const me = esc(cleanName(PERFIL.load().name));
    const map = {
      off: '⚪ Estás desconectado de amigos (no apareces en línea).',
      noname: '⚠️ Ponle un nombre a tu perfil para usar amigos. <button class="am-link" id="am-goprofile">Ir a mi perfil</button>',
      connecting: '🟡 Conectando…',
      ready: `🟢 En línea como «${me}». Tus amigos conectados ven tu perfil al instante.`,
      taken: `🔴 Ya hay otra persona conectada con el nombre «${me}». Cambia tu nombre o espera a que se desconecte.`,
      error: '🔴 No hay conexión con el servicio de amigos. Reintentando…'
    };
    return map[status] || '';
  }

  function cardHTML(f) {
    const on = isOnline(f.key), s = f.snap;
    const rgb = s ? s.rank.rgb : '148,163,184';
    const sub = s
      ? `<span class="am-rk">${esc(s.rank.icon)} ${esc(s.rank.name)}</span><small>${s.points} puntos de gloria</small>`
      : '<small>Sin datos todavía</small>';
    return `<div class="am-card${on ? '' : ' off'}" data-open="${esc(f.key)}" style="--rank-rgb:${rgb}" role="button" tabindex="0">
      <div class="am-av">${avatarHTML(s)}<span class="am-dot${on ? ' on' : ''}"></span></div>
      <div class="am-info"><b>${esc(f.name)}</b>${sub}
        <small>${on ? '🟢 En línea' : '⚫ Visto ' + ago(f.seen)}</small>
        ${f.warn ? '<span class="am-warn">⚠️ Otra persona usa este nombre</span>' : ''}</div>
      <button class="am-x" data-del="${esc(f.key)}" title="Quitar amigo">✕</button>
    </div>`;
  }

  function listHTML() {
    const friends = A.friends.slice().sort((a, b) => (isOnline(b.key) - isOnline(a.key)) || a.name.localeCompare(b.name, 'es'));
    return `
      <div class="am-top">
        <h2 class="am-title">👥 Amigos</h2>
        <button id="am-back" class="class-btn">⬅ Volver al menú</button>
      </div>
      <section class="am-panel">
        <div class="am-status"><span>${statusHTML()}</span>
          <label class="am-toggle"><input type="checkbox" id="am-online" ${A.online ? 'checked' : ''}> Aparecer en línea</label></div>
        <div class="am-add">
          <input id="am-input" type="text" maxlength="16" placeholder="Nombre del jugador a añadir" autocomplete="off" spellcheck="false">
          <button id="am-add-btn">➕ Añadir amigo</button>
        </div>
        <div class="am-msg ${esc(ui.msgCls)}" id="am-msg">${ui.msg}</div>
      </section>
      <div class="am-h">🧑‍🤝‍🧑 Tus amigos <small>${onlineCount()} en línea · ${friends.length} en total</small></div>
      ${friends.length ? `<div class="am-grid">${friends.map(cardHTML).join('')}</div>`
        : '<div class="am-empty">Aún no tienes amigos. Escribe arriba el nombre de un jugador que esté conectado.</div>'}`;
  }

  function favCardHTML(id, slot) {
    const pod = [
      { medal: '🥇', label: 'Número 1', rgb: '251,191,36' },
      { medal: '🥈', label: 'Número 2', rgb: '203,213,225' },
      { medal: '🥉', label: 'Número 3', rgb: '217,119,6' }
    ][slot];
    const first = slot === 0 ? ' pf-fav--first' : '';
    const c = charById(id);
    if (!c) {
      return `<div class="pf-fav${first}" style="--c:${pod.rgb}"><div class="pf-fav-empty" style="cursor:default"><b>${pod.medal} ${id ? 'Personaje no disponible' : 'Sin elegir'}</b></div></div>`;
    }
    const chips = (c.classes || []).map(k => `<span class="pf-chip-cls" style="--k:#fbbf24">${esc(k)}</span>`).join('');
    return `<div class="pf-fav${first}" style="--c:${pod.rgb}"><div class="pf-fav-btn">
      <div class="pf-fav-art">${imgTag(c.img, c.name, '👤', 'pf-fav-fb')}<div class="pf-fav-medal"><span>${pod.medal}</span>${pod.label}</div></div>
      <div class="pf-fav-info"><div class="pf-fav-name">${esc(c.name)}</div><div class="pf-chips">${chips}</div></div>
    </div></div>`;
  }

  function profileHTML(f) {
    const on = isOnline(f.key), s = f.snap;
    const head = `<div class="am-top"><h2 class="am-title">👥 Perfil de ${esc(f.name)}</h2>
      <button id="am-back" class="class-btn">⬅ Volver a amigos</button></div>`;
    if (!s) {
      return head + `<div class="am-empty">Todavía no he podido ver el perfil de ${esc(f.name)}.<br>Aparecerá en cuanto se conecte.</div>`;
    }
    const rk = s.rank;
    const tile = (rgb, ic, num, lbl) => `<div class="pf-tile" style="--t:${rgb}"><span class="pf-tile-ic">${ic}</span>
      <div><div class="pf-tile-num">${num}</div><div class="pf-tile-lbl">${lbl}</div></div></div>`;
    const of = (a, b) => b ? `${a}<small> / ${b}</small>` : '—';
    const rec = (title, rows) => `<div class="am-rec"><h4>${title}</h4>${rows.map(r => `<p><span>${r[0]}</span><b>${r[1]}</b></p>`).join('')}</div>`;
    const freeCards = s.free.map(m => rec(`${esc(m.icon)} ${esc(m.name)}`, [
      ['Partidas', m.played], ['Victorias / derrotas', `${m.w} / ${m.l}`], ['Racha actual', m.streak], ['Mejor racha', m.best]]));
    return head + `
      <section class="am-hero" style="--rank-rgb:${rk.rgb}">
        <div class="am-hero-bg" id="am-hero-bg"></div>
        <div class="am-bigav">${avatarHTML(s)}</div>
        <div class="am-hid">
          <h3 class="am-name">${esc(s.name)}</h3>
          <div><span class="am-live ${on ? 'on' : 'off'}">${on ? '🟢 En directo: se actualiza solo' : '⚫ Datos de ' + ago(f.seen) + ' (sin conexión)'}</span></div>
          <div class="pf-rank-row"><span class="pf-rank-badge">${esc(rk.icon)} ${esc(rk.name)}</span>
            <span class="pf-points"><b>${s.points}</b> puntos de gloria</span></div>
          <div class="pf-xp"><i style="width:${rk.pct}%"></i></div>
          <div class="pf-xp-label">${rk.nextMin ? `${s.points} / ${rk.nextMin} para ser ${esc(rk.nextIcon)} ${esc(rk.nextName)}` : '¡Rango máximo!'}</div>
          ${f.warn ? '<div class="am-warn">⚠️ Ahora mismo otra persona se conecta con este nombre; estos son los datos del amigo original.</div>' : ''}
        </div>
      </section>
      <div class="pf-tiles">
        ${tile('56,189,248', '⚔️', s.freeWins, 'Victorias en batalla libre')}
        ${tile('251,191,36', '📖', of(s.story.reached, s.story.total), 'Capítulos de Historia')}
        ${tile('168,85,247', '🎖️', of(s.medals.n, s.medals.max), 'Medallas del Desafío')}
        ${tile('251,113,133', '🔥', s.hell.highest, 'Piso más alto del Infierno')}
      </div>
      <div class="am-h">⭐ Personajes favoritos</div>
      <div class="pf-podium">${[1, 0, 2].map(i => favCardHTML(s.favs[i], i)).join('')}</div>
      <div class="am-h">🏆 Récords</div>
      <div class="am-recs">
        ${freeCards.join('')}
        ${rec('🌐 Multijugador online', [['Partidas', s.mp.played], ['Victorias / derrotas', `${s.mp.w} / ${s.mp.l}`], ['Racha actual', s.mp.streak], ['Mejor racha', s.mp.best]])}
        ${rec('🔥 Infierno Infinito', [['Piso más alto', s.hell.highest], ['Pisos superados', s.hell.floors], ['Mejor marca', s.hell.bestTurns ? s.hell.bestTurns + ' turnos' : '—']])}
      </div>`;
  }

  function setMsg(text, cls) {
    ui.msg = text; ui.msgCls = cls || '';
    const el = byId('am-msg');
    if (el) { el.className = 'am-msg ' + (cls || ''); el.innerHTML = text; }
  }

  let refreshT = null;
  function refresh() {
    updateMenuBtn();
    if (!ui.open) return;
    clearTimeout(refreshT);
    refreshT = setTimeout(render, 80);
  }

  function render() {
    const wrap = byId('am-wrap');
    if (!wrap || !ui.open) return;
    // no destruimos el campo de texto mientras se escribe
    const typing = document.activeElement && document.activeElement.id === 'am-input';
    const typed = typing ? document.activeElement.value : null;
    const f = ui.view && A.friends.find(x => x.key === ui.view);
    if (ui.view && !f) ui.view = null;
    wrap.innerHTML = f ? profileHTML(f) : listHTML();
    if (f && f.snap) {
      const c = charById(f.snap.avatar), bg = byId('am-hero-bg');
      if (bg && c) bg.style.backgroundImage = `url("${c.img}")`;
    }
    if (typed !== null) { const inp = byId('am-input'); if (inp) { inp.value = typed; inp.focus(); } }
    wire();
  }

  function wire() {
    const on = (id, ev, fn) => { const el = byId(id); if (el) el.addEventListener(ev, fn); };
    on('am-back', 'click', () => { if (ui.view) { ui.view = null; render(); } else closeAmigos(); });
    on('am-online', 'change', e => { A.online = e.target.checked; save(); startPeer(); refresh(); });
    on('am-goprofile', 'click', () => { closeAmigos(); PERFIL.open(); });
    on('am-add-btn', 'click', () => addFriend(byId('am-input').value));
    on('am-input', 'keydown', e => { if (e.key === 'Enter') addFriend(e.target.value); });
    byId('am-wrap').querySelectorAll('[data-open]').forEach(card => {
      const open = () => { ui.view = card.dataset.open; render(); byId('amigos-screen').scrollTop = 0; };
      card.addEventListener('click', e => { if (!e.target.closest('[data-del]')) open(); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    });
    byId('am-wrap').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); removeFriend(b.dataset.del); }));
  }

  function openAmigos() {
    byId('main-menu').style.display = 'none';
    ui.open = true; ui.view = null;
    byId('amigos-screen').style.display = 'flex';
    byId('amigos-screen').scrollTop = 0;
    startPeer();
    A.friends.forEach(f => { if (!isOnline(f.key)) connectFriend(f); });   // al abrir, busca a todos ya
    render();
  }

  function closeAmigos() {
    ui.open = false; ui.view = null;
    byId('amigos-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !ui.open) return;
    if (ui.view) { ui.view = null; render(); } else closeAmigos();
  });

  function updateMenuBtn() {
    const sub = byId('menu-amigos') && byId('menu-amigos').querySelector('.story-poster-subtitle');
    if (!sub) return;
    const n = onlineCount();
    sub.textContent = n ? `${n} ${n === 1 ? 'amigo' : 'amigos'} en línea` : 'Mira los perfiles de tus amigos';
  }

  /* Panel de póster del menú principal. En el menú, el Infierno Infinito (#menu-hell, de infierno.js)
     es una columna propia: aquí se mete en una columna con Amigos justo DEBAJO.
     Si el Infierno no existe (no está infierno.js), Amigos va al final de la columna de Historia/Desafío. */
  const COVER = 'personajes/amigos.jpg';

  function placePanel() {
    const panel = byId('menu-amigos');
    const layout = document.querySelector('#main-menu .menu-layout');
    if (!panel || !layout) return;
    const hell = byId('menu-hell');

    if (hell && hell.parentElement) {
      let col = hell.parentElement;
      if (!col.classList.contains('am-col')) {
        col = document.createElement('div');
        col.className = 'am-col';
        hell.parentNode.insertBefore(col, hell);
        col.appendChild(hell);
      }
      if (hell.nextElementSibling !== panel) col.insertBefore(panel, hell.nextSibling);
      return;
    }

    // Sin Infierno: al final de la columna de Historia (la crea desafio.js) o del menú
    const story = byId('menu-story');
    const col = (story && story.parentElement && story.parentElement.classList.contains('menu-col')) ? story.parentElement : layout;
    if (panel.parentElement !== col || panel.nextElementSibling) col.appendChild(panel);
  }

  function injectMarkup() {
    if (!byId('amigos-screen')) {
      const sc = document.createElement('div');
      sc.id = 'amigos-screen';
      sc.innerHTML = '<div class="am-wrap" id="am-wrap"></div>';
      document.body.appendChild(sc);
      // si una imagen no carga, se sustituye por su emoji (igual que en el perfil)
      sc.addEventListener('error', e => {
        const img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.dataset.fb) return;
        const fb = document.createElement('div');
        fb.className = img.dataset.cls || '';
        fb.textContent = img.dataset.fb;
        img.replaceWith(fb);
      }, true);
    }
    if (!byId('menu-amigos')) {
      const btn = document.createElement('button');
      btn.id = 'menu-amigos';
      btn.className = 'story-poster-panel am-poster-panel';
      btn.innerHTML = `
        <div class="story-poster-frame">${imgTag(COVER, 'Amigos', '👥', 'am-poster-fallback')}</div>
        <span class="story-poster-title">👥 Amigos</span>
        <span class="story-poster-subtitle">Mira los perfiles de tus amigos</span>
        <span class="story-poster-cta">▶ Ver amigos</span>`;
      btn.addEventListener('error', e => {
        const img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.dataset.fb) return;
        const fb = document.createElement('div');
        fb.className = img.dataset.cls || '';
        fb.textContent = img.dataset.fb;
        img.replaceWith(fb);
      }, true);
      btn.addEventListener('click', openAmigos);
      const layout = document.querySelector('#main-menu .menu-layout');
      if (layout) layout.appendChild(btn);
    }
    placePanel();
    updateMenuBtn();
    // Otros modos (Infierno, Desafío) pueden añadir su panel más tarde: se recoloca debajo del Infierno.
    const layout = document.querySelector('#main-menu .menu-layout');
    if (layout && window.MutationObserver) {
      new MutationObserver(() => placePanel()).observe(layout, { childList: true, subtree: true });
    }
  }

  function init() {
    injectStyles();
    injectMarkup();
    startPeer();
    setInterval(tick, TICK_MS);
    window.addEventListener('beforeunload', () => { try { stopPeer(); } catch (e) { /* ignorar */ } });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.AMIGOS = { open: openAmigos };
})();
