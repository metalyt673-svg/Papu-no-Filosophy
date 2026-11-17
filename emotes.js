/* ============================================================
   EMOTES EN PARTIDA
   Carpeta: emotes/   (junto a juego.html)
   Funciona en todos los modos:
     - Local (PvP / con baneos / Historia / Infierno...): botones de J1 y J2.
     - Contra la IA: solo tu botón, y LA IA TAMBIÉN LANZA EMOTES (reacciona
       a golpes, KOs, victoria/derrota, te responde, etc.).
     - Multijugador online (multijugador.js): cada jugador usa su botón y el
       rival ve el emote en su pantalla.
     - Cooperativo (cooperativo.js): lo mismo; el jefe también lanza emotes.

   No hace falta tocar multijugador.js ni cooperativo.js: este archivo se
   engancha a su conexión (PeerJS) y manda un mensaje extra {t:'emote'}
   que ellos ignoran.

   Para añadir más emotes: copia el archivo a emotes/ y añade su nombre a
   FILES. Si un archivo de la lista no existe, no aparece en el selector.
   Para cambiar las "personalidades" de la IA, edita MOODS más abajo.

   API:
     Emotes.show(side, 'archivo.png')   side: 'p1' | 'p2' | 'boss'
     Emotes.onSend = (side, file) => {}
     Emotes.aiEnabled = false           (para apagar los emotes de la IA)
   ============================================================ */
(function(){
  'use strict';

  const FOLDER = 'emotes/';
  const FILES = [
    '4880-gojo.gif',
    '126240-merucozy.png',
    '215443-hehe.gif',
    '233341-smug.png',
    '277773-merupopcorn.png',
    '355167-shikamarunarawink.png',
    '384704-merushock.png',
    '422176-asa.png',
    '594644-merutease.png',
    '608482-osaka.gif',
    '626614-hatsunemiku.png',
    '706618-hhhahaah.png',
    '709181-hatsunemiku.png',
    '772968-kawaii.png',
    '940421-meruhmph.png',
    '953620-bruh.png',
    '958845-osaka.gif',
    '975785-hmmm.png',
    '993008-mhmmm.png'
  ];

  /* Qué emotes usa la IA según su "estado de ánimo". */
  const MOODS = {
    greet: ['4880-gojo.gif', '626614-hatsunemiku.png', '709181-hatsunemiku.png', '126240-merucozy.png', '772968-kawaii.png'],
    taunt: ['233341-smug.png', '594644-merutease.png', '355167-shikamarunarawink.png', '215443-hehe.gif', '706618-hhhahaah.png'],
    hurt:  ['384704-merushock.png', '940421-meruhmph.png', '953620-bruh.png', '975785-hmmm.png'],
    kill:  ['233341-smug.png', '215443-hehe.gif', '706618-hhhahaah.png', '608482-osaka.gif', '355167-shikamarunarawink.png'],
    lost:  ['384704-merushock.png', '953620-bruh.png', '940421-meruhmph.png', '993008-mhmmm.png'],
    win:   ['233341-smug.png', '706618-hhhahaah.png', '215443-hehe.gif', '4880-gojo.gif', '594644-merutease.png'],
    defeat:['953620-bruh.png', '384704-merushock.png', '940421-meruhmph.png', '126240-merucozy.png'],
    idle:  ['975785-hmmm.png', '993008-mhmmm.png', '277773-merupopcorn.png', '422176-asa.png', '958845-osaka.gif'],
    reply: ['594644-merutease.png', '215443-hehe.gif', '772968-kawaii.png', '958845-osaka.gif', '975785-hmmm.png', '706618-hhhahaah.png']
  };

  const SHOW_MS = 2600;        // cuánto dura el emote en pantalla
  const COOLDOWN_MS = 1800;    // espera mínima entre emotes del mismo jugador
  const AI_COOLDOWN_MS = 5500; // espera mínima entre emotes de la IA
  const LS_KEY = 'batalla-emotes-config';

  const cfg = { muted: false };
  try{
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if(saved && typeof saved.muted === 'boolean') cfg.muted = saved.muted;
  }catch(e){}
  function saveCfg(){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(cfg)); }catch(e){}
  }

  /* ---------- Estilos ---------- */
  const style = document.createElement('style');
  style.textContent = `
    .emo-fab{
      position:fixed; bottom:16px; z-index:130; display:none;
      padding:9px 14px; border-radius:999px; cursor:pointer;
      font:inherit; font-size:13px; font-weight:800; color:#eef4ff;
      background:rgba(11,20,39,.88); backdrop-filter:blur(8px);
      box-shadow:0 8px 20px rgba(0,0,0,.35);
      transition:transform .15s ease, filter .15s ease;
    }
    .emo-fab:hover{ transform:translateY(-2px); filter:brightness(1.15); }
    #emo-fab-p1{ left:16px;  border:1px solid rgba(56,189,248,.65); }
    #emo-fab-p2{ right:16px; border:1px solid rgba(244,114,182,.65); }

    #emo-picker{
      position:fixed; bottom:62px; z-index:135; display:none;
      width:min(380px, calc(100vw - 24px)); padding:12px;
      border:1px solid rgba(167,139,250,.30); border-radius:16px;
      background:rgba(11,20,39,.96); backdrop-filter:blur(14px);
      box-shadow:0 20px 50px rgba(0,0,0,.55);
    }
    #emo-picker.side-p1{ left:12px; }
    #emo-picker.side-p2{ right:12px; }
    .emo-title{ font-size:12px; font-weight:800; letter-spacing:.05em;
      text-transform:uppercase; color:#9db0cc; margin-bottom:8px; }
    .emo-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(56px,1fr));
      gap:8px; max-height:236px; overflow:auto; padding-right:2px; }
    .emo-item{
      aspect-ratio:1; padding:4px; cursor:pointer;
      border:1px solid rgba(148,163,184,.14); border-radius:12px;
      background:rgba(255,255,255,.03);
      transition:transform .12s ease, border-color .12s ease, background .12s ease;
    }
    .emo-item:hover{ transform:scale(1.08); border-color:rgba(167,139,250,.6);
      background:rgba(139,92,246,.14); }
    .emo-item img{ width:100%; height:100%; object-fit:contain; display:block; }
    .emo-item.cool{ opacity:.45; pointer-events:none; }
    .emo-foot{ display:flex; align-items:center; gap:8px; margin-top:10px;
      font-size:12px; color:#9db0cc; cursor:pointer; }
    .emo-foot input{ accent-color:#8b5cf6; cursor:pointer; }

    .emo-bubble{
      position:fixed; z-index:140; pointer-events:none;
      transform:translateX(-50%);
      padding:8px; border-radius:18px;
      border:1px solid rgba(255,255,255,.18);
      background:rgba(11,20,39,.88); backdrop-filter:blur(6px);
      box-shadow:0 12px 30px rgba(0,0,0,.45);
      animation:emoPop ${SHOW_MS}ms ease both;
    }
    .emo-bubble.p1{ border-color:rgba(56,189,248,.7); }
    .emo-bubble.p2, .emo-bubble.boss{ border-color:rgba(244,114,182,.7); }
    .emo-bubble img{ display:block; width:96px; height:96px; object-fit:contain; }
    @keyframes emoPop{
      0%  { opacity:0; transform:translateX(-50%) translateY(14px) scale(.5); }
      12% { opacity:1; transform:translateX(-50%) translateY(0) scale(1.12); }
      20% { transform:translateX(-50%) translateY(0) scale(1); }
      82% { opacity:1; transform:translateX(-50%) translateY(-4px) scale(1); }
      100%{ opacity:0; transform:translateX(-50%) translateY(-18px) scale(.9); }
    }
    @media (max-width:760px){
      .emo-bubble img{ width:72px; height:72px; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- Contexto: ¿local, online, cooperativo? ---------- */
  function isPvE(){
    try{
      const st = window._state;
      if(st && (st.mode === 'pve' || st.vsAI === true || st.vsIA === true)) return true;
    }catch(e){}
    const lbl = document.getElementById('enemy-label');
    return !!(lbl && /\b(IA|AI|CPU|bot)\b/i.test(lbl.textContent || ''));
  }

  function opposite(s){ return s === 'p1' ? 'p2' : 'p1'; }

  function ctx(){
    try{
      const mp = window.MULTIJUGADOR && window.MULTIJUGADOR.MP;
      if(mp && mp.active){
        return { kind:'mp', net:true, conn:mp.conn, my:mp.role, opp:opposite(mp.role),
                 sides:[mp.role], aiSide:null };
      }
      const co = window.COOP && window.COOP.CO;
      if(co && co.active){
        if(co.local) return { kind:'coop', net:false, conn:null, my:null, opp:null,
                              sides:['p1','p2'], aiSide:'boss' };
        const my = co.seat === 0 ? 'p1' : 'p2';
        return { kind:'coop', net:true, conn:co.conn, my, opp:opposite(my),
                 sides:[my], aiSide:'boss' };
      }
    }catch(e){}
    const pve = isPvE();
    return { kind:'local', net:false, conn:null, my:null, opp:null,
             sides: pve ? ['p1'] : ['p1','p2'], aiSide: pve ? 'p2' : null };
  }

  /* ---------- Botones y selector ---------- */
  function mkFab(side){
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'emo-fab-' + side;
    b.className = 'emo-fab';
    b.textContent = '😀 Emotes';
    b.addEventListener('click', (e) => { e.stopPropagation(); togglePicker(side); });
    document.body.appendChild(b);
    return b;
  }
  const fabP1 = mkFab('p1');
  const fabP2 = mkFab('p2');

  const picker = document.createElement('div');
  picker.id = 'emo-picker';
  picker.innerHTML =
    '<div class="emo-title" id="emo-title">Emotes</div>' +
    '<div class="emo-grid" id="emo-grid"></div>' +
    '<label class="emo-foot"><input type="checkbox" id="emo-mute"><span>🔕 Ocultar emotes</span></label>';
  document.body.appendChild(picker);
  picker.addEventListener('click', (e) => e.stopPropagation());

  const grid = picker.querySelector('#emo-grid');
  const muteBox = picker.querySelector('#emo-mute');
  muteBox.checked = cfg.muted;
  muteBox.addEventListener('change', () => {
    cfg.muted = muteBox.checked;
    saveCfg();
    if(cfg.muted) clearBubbles();
  });

  const lastSent = { p1: 0, p2: 0 };
  let openSide = null;

  FILES.forEach(file => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'emo-item';
    item.dataset.file = file;
    const img = document.createElement('img');
    img.alt = file;
    img.loading = 'lazy';
    img.src = FOLDER + file;
    img.onerror = () => {                 // archivo que no existe: no se muestra
      missing.add(file);
      item.remove();
    };
    item.appendChild(img);
    item.addEventListener('click', () => sendEmote(openSide, file));
    grid.appendChild(item);
  });
  const missing = new Set();

  function togglePicker(side){
    if(openSide === side){ closePicker(); return; }
    openSide = side;
    picker.className = 'side-' + side;
    const c = ctx();
    picker.querySelector('#emo-title').textContent =
      c.sides.length === 1 ? 'Emotes' : (side === 'p1' ? 'Emotes — Jugador 1' : 'Emotes — Jugador 2');
    picker.style.display = 'block';
  }
  function closePicker(){
    openSide = null;
    picker.style.display = 'none';
  }
  document.addEventListener('click', closePicker);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closePicker(); });

  /* ---------- Envío ---------- */
  function sendEmote(side, file){
    if(!side) return;
    const now = Date.now();
    if(now - lastSent[side] < COOLDOWN_MS) return;
    lastSent[side] = now;
    flashCooldown();

    const c = ctx();
    if(c.net){
      try{ if(c.conn && c.conn.open) c.conn.send({ t:'emote', file }); }catch(e){}
      side = c.my || side;
    }
    showEmote(side, file);
    if(typeof api.onSend === 'function'){
      try{ api.onSend(side, file); }catch(e){ console.error(e); }
    }
    if(c.aiSide) maybeAiReply();
    closePicker();
  }

  function flashCooldown(){
    grid.querySelectorAll('.emo-item').forEach(el => el.classList.add('cool'));
    setTimeout(() => grid.querySelectorAll('.emo-item').forEach(el => el.classList.remove('cool')), COOLDOWN_MS);
  }

  /* ---------- Recepción (online / cooperativo) ---------- */
  function onNetData(msg){
    if(!msg || msg.t !== 'emote' || typeof msg.file !== 'string') return;
    const c = ctx();
    if(c.opp) showEmote(c.opp, msg.file);
  }
  function bindNet(c){
    if(!c.net || !c.conn || c.conn.__emoBound) return;
    try{
      c.conn.__emoBound = true;
      c.conn.on('data', onNetData);
    }catch(e){}
  }

  /* ---------- Visualización ---------- */
  const bubbles = { p1: null, p2: null, boss: null };
  function clearBubbles(){
    Object.keys(bubbles).forEach(s => {
      if(bubbles[s]){ bubbles[s].remove(); bubbles[s] = null; }
    });
  }

  /* Devuelve el elemento sobre el que sale el emote de cada lado. */
  function anchorFor(side){
    const byId = id => document.getElementById(id);
    const coopArena = byId('co-arena');
    const coopOn = coopArena && getComputedStyle(coopArena).display !== 'none';
    if(coopOn){
      const img = side === 'boss' ? byId('co-img-b') : byId(side === 'p1' ? 'co-img-0' : 'co-img-1');
      return img ? (img.parentElement || img) : null;
    }
    if(side === 'boss') return null;
    return byId('fighter-box-' + side);
  }

  function showEmote(side, file){
    if(cfg.muted) return;
    if(side !== 'p1' && side !== 'p2' && side !== 'boss') return;
    if(!FILES.includes(file) || missing.has(file)) return;
    const box = anchorFor(side);
    if(!box) return;
    const r = box.getBoundingClientRect();
    if(!r.width) return;

    if(bubbles[side]) bubbles[side].remove();
    const bubble = document.createElement('div');
    bubble.className = 'emo-bubble ' + side;
    const img = document.createElement('img');
    img.src = FOLDER + file;
    img.alt = '';
    bubble.appendChild(img);
    bubble.style.left = (r.left + r.width / 2) + 'px';
    bubble.style.top  = Math.max(8, r.top + 6) + 'px';
    document.body.appendChild(bubble);
    bubbles[side] = bubble;
    setTimeout(() => {
      if(bubbles[side] === bubble){ bubble.remove(); bubbles[side] = null; }
    }, SHOW_MS + 50);
  }

  /* ---------- Cuándo mostrar los botones ---------- */
  function isVisible(el){
    return !!el && getComputedStyle(el).display !== 'none';
  }
  function inGameNow(){
    return isVisible(document.getElementById('game-root'))
        && !isVisible(document.getElementById('ban-phase'));
  }

  function refresh(){
    const inGame = inGameNow();
    const c = ctx();
    if(inGame) bindNet(c);
    fabP1.style.display = (inGame && c.sides.includes('p1')) ? 'block' : 'none';
    fabP2.style.display = (inGame && c.sides.includes('p2') && !api.hideP2) ? 'block' : 'none';
    const two = c.sides.length > 1;
    fabP1.textContent = two ? '😀 Emotes J1' : '😀 Emotes';
    fabP2.textContent = two ? '😀 Emotes J2' : '😀 Emotes';
    if(!inGame){
      closePicker();
      clearBubbles();
    }
  }
  setInterval(refresh, 400);
  refresh();

  /* =====================================================================
     EMOTES DE LA IA
     Observa la partida (vida, KOs, fin de combate) y reacciona.
     Usa Math.random() a propósito: nunca toca la aleatoriedad compartida
     del online/cooperativo, así que no puede desincronizar partidas.
     ===================================================================== */
  let aiLastAt = 0;
  let aiLastFile = null;
  let prev = null;

  const pick = arr => {
    const pool = arr.filter(f => FILES.includes(f) && !missing.has(f));
    if(!pool.length) return null;
    const options = pool.length > 1 ? pool.filter(f => f !== aiLastFile) : pool;
    return options[Math.floor(Math.random() * options.length)];
  };

  function aiEmote(mood, opts){
    opts = opts || {};
    if(!api.aiEnabled) return;
    const c = ctx();
    if(!c.aiSide || !inGameNow()) return;
    const now = Date.now();
    if(!opts.force && now - aiLastAt < AI_COOLDOWN_MS) return;
    const file = pick(MOODS[mood] || MOODS.idle);
    if(!file) return;
    aiLastAt = now;
    aiLastFile = file;
    showEmote(c.aiSide, file);
  }

  function later(fn, min, max){
    setTimeout(fn, min + Math.random() * (max - min));
  }

  function maybeAiReply(){
    if(Math.random() < 0.4) later(() => aiEmote('reply'), 900, 1900);
  }

  function snapshot(){
    const st = window._state;
    if(!st || !st.teams) return null;
    const t1 = st.teams.p1 || [], t2 = st.teams.p2 || [];
    if(!t1.length || !t2.length) return null;
    const sum = (a, k) => a.reduce((s, ch) => s + (ch ? Math.max(0, ch[k] || 0) : 0), 0);
    return {
      phase: st.phase,
      aiHp: sum(t2, 'hp'), aiMax: sum(t2, 'maxHp'),
      plHp: sum(t1, 'hp'), plMax: sum(t1, 'maxHp'),
      aiKO: t2.filter(ch => ch && ch.hp <= 0).length,
      plKO: t1.filter(ch => ch && ch.hp <= 0).length,
      aiAlive: t2.some(ch => ch && ch.hp > 0)
    };
  }

  function aiWatch(){
    const c = ctx();
    if(!c.aiSide || !api.aiEnabled || !inGameNow()){ prev = null; return; }
    const s = snapshot();
    if(!s || s.phase === 'select'){ prev = null; return; }

    // Empieza un combate nuevo.
    if(s.phase === 'battle' && (!prev || prev.phase !== 'battle' || prev.aiMax !== s.aiMax || prev.plMax !== s.plMax)){
      prev = s;
      if(Math.random() < 0.6) later(() => aiEmote('greet', { force: true }), 1000, 2200);
      return;
    }

    if(prev && prev.phase === 'battle'){
      if(s.phase === 'ended'){
        // Fin del combate: la IA reacciona una sola vez.
        later(() => aiEmote(s.aiAlive ? 'win' : 'defeat', { force: true }), 700, 1400);
      } else if(s.phase === 'battle'){
        const hurtAi = (prev.aiHp - s.aiHp) / Math.max(1, s.aiMax);
        const hurtPl = (prev.plHp - s.plHp) / Math.max(1, s.plMax);
        if(s.plKO > prev.plKO){
          if(Math.random() < 0.7) later(() => aiEmote('kill'), 500, 1200);
        } else if(s.aiKO > prev.aiKO){
          if(Math.random() < 0.75) later(() => aiEmote('lost'), 500, 1200);
        } else if(hurtPl >= 0.12){
          if(Math.random() < 0.4) later(() => aiEmote('taunt'), 500, 1300);
        } else if(hurtAi >= 0.12){
          if(Math.random() < 0.4) later(() => aiEmote('hurt'), 500, 1300);
        } else if(Math.random() < 0.004){
          aiEmote('idle');      // de vez en cuando suelta uno sin motivo
        }
      }
    }
    prev = s;
  }
  setInterval(aiWatch, 450);

  const api = {
    show: showEmote,
    onSend: null,     // función (side, file) opcional
    hideP2: false,    // true para ocultar siempre el botón de J2
    aiEnabled: true,  // false para que la IA no lance emotes
    files: FILES.slice()
  };
  window.Emotes = api;
})();
