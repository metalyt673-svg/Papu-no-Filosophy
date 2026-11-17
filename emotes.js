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

   COLECCIÓN (desbloqueo y equipo):
     - Empiezas con STARTERS desbloqueados; el resto se consigue en las cajas
       del Inventario (CHEST_CHANCE = 30% por caja, al abrirla).
     - En 📖 Glosario > pestaña "Emotes" ves todos, y eliges hasta
       MAX_EQUIPPED (10) para llevar a las partidas. El selector en partida
       solo muestra los equipados.
     - La IA (y el jefe del cooperativo) usan TODOS los emotes, sin límite.
     - Se guarda en localStorage ('batalla-emotes-coleccion').

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
    '993008-mhmmm.png',
    '29302-okay.gif',
    '380069-chilled.png',
    '860574-thelarpisreal.png',
    '970307-funny.gif',
    '727036-y-hug-az.gif',
    '282817-panickedno.gif',
    '988425-ohmygod.gif',
    '739545-sleep.png',
    '388298-catgirl.gif',
    '16794-jhu.gif',
    '267549-catgirlcool.png',
	'woody-dissapointeed.webp',
	'komabummer.webp',
	'1150135023765303387.webp',
	'47a99ab59d6d91cf2b419f53357c63ff.jpg',
  ];

  /* Qué emotes usa la IA según su "estado de ánimo". */
  const MOODS = {
    greet: ['4880-gojo.gif', '626614-hatsunemiku.png', '709181-hatsunemiku.png', '126240-merucozy.png', '772968-kawaii.png', '29302-okay.gif', '388298-catgirl.gif', '727036-y-hug-az.gif'],
    taunt: ['233341-smug.png', '594644-merutease.png', '355167-shikamarunarawink.png', '215443-hehe.gif', '706618-hhhahaah.png', '970307-funny.gif', '860574-thelarpisreal.png', '267549-catgirlcool.png', '1150135023765303387.webp'],
    hurt:  ['384704-merushock.png', '940421-meruhmph.png', '953620-bruh.png', '975785-hmmm.png', '282817-panickedno.gif', '988425-ohmygod.gif'],
    kill:  ['233341-smug.png', '215443-hehe.gif', '706618-hhhahaah.png', '608482-osaka.gif', '355167-shikamarunarawink.png', '970307-funny.gif', '267549-catgirlcool.png'],
    lost:  ['384704-merushock.png', '953620-bruh.png', '940421-meruhmph.png', '993008-mhmmm.png', '282817-panickedno.gif', '988425-ohmygod.gif', 'komabummer.webp', 'woody-dissapointeed.webp', '47a99ab59d6d91cf2b419f53357c63ff.jpg'],
    win:   ['233341-smug.png', '706618-hhhahaah.png', '215443-hehe.gif', '4880-gojo.gif', '594644-merutease.png', '388298-catgirl.gif', '267549-catgirlcool.png', '16794-jhu.gif'],
    defeat:['953620-bruh.png', '384704-merushock.png', '940421-meruhmph.png', '126240-merucozy.png', '282817-panickedno.gif', '988425-ohmygod.gif', '727036-y-hug-az.gif', 'komabummer.webp', 'woody-dissapointeed.webp'],
    idle:  ['975785-hmmm.png', '993008-mhmmm.png', '277773-merupopcorn.png', '422176-asa.png', '958845-osaka.gif', '380069-chilled.png', '739545-sleep.png', '1150135023765303387.webp'],
    reply: ['594644-merutease.png', '215443-hehe.gif', '772968-kawaii.png', '958845-osaka.gif', '975785-hmmm.png', '706618-hhhahaah.png', '29302-okay.gif', '970307-funny.gif', '16794-jhu.gif']
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

  /* ---------- Colección: desbloqueados y equipados ---------- */
  const COL_KEY = 'batalla-emotes-coleccion';
  const MAX_EQUIPPED = 10;     // emotes que puedes llevar a la partida
  const CHEST_CHANCE = 0.30;   // probabilidad de que una caja dé un emote nuevo
  const STARTERS = [           // los que tienes desde el principio
    '4880-gojo.gif', '233341-smug.png', '384704-merushock.png',
    '953620-bruh.png', '975785-hmmm.png', '772968-kawaii.png'
  ];
  const col = { owned: {}, equipped: [] };
  function loadCol(){
    let d = null;
    try{ d = JSON.parse(localStorage.getItem(COL_KEY) || 'null'); }catch(e){}
    col.owned = {};
    STARTERS.forEach(f => { if(FILES.includes(f)) col.owned[f] = 1; });
    if(d && d.owned && typeof d.owned === 'object'){
      Object.keys(d.owned).forEach(f => { if(FILES.includes(f)) col.owned[f] = 1; });
    }
    const eq = (d && Array.isArray(d.equipped)) ? d.equipped : STARTERS;
    col.equipped = [];
    eq.forEach(f => {
      if(col.owned[f] && !col.equipped.includes(f) && col.equipped.length < MAX_EQUIPPED) col.equipped.push(f);
    });
  }
  function saveCol(){
    try{ localStorage.setItem(COL_KEY, JSON.stringify(col)); }catch(e){}
  }
  loadCol();

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
    .emo-empty{ grid-column:1/-1; padding:14px 6px; text-align:center;
      font-size:12.5px; line-height:1.5; color:#9db0cc; }

    /* --- Pestañas y colección dentro del Glosario --- */
    .emo-hide{ display:none !important; }
    .emo-tabs{ display:flex; gap:8px; margin:14px 0 10px; flex-wrap:wrap; }
    .emo-tab{ padding:9px 16px; border-radius:12px; cursor:pointer; font:inherit; font-weight:800; font-size:14px;
      color:#cbd5e1; background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.25);
      transition:transform .12s, filter .12s; }
    .emo-tab:hover{ transform:translateY(-1px); filter:brightness(1.15); }
    .emo-tab.on{ color:#fff; border-color:rgba(167,139,250,.8); background:rgba(139,92,246,.25);
      box-shadow:0 0 18px rgba(139,92,246,.25); }
    #emo-col{ display:flex; flex-direction:column; gap:14px; color:#e5edf9; }
    .emc-top{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
    .emc-top b{ font-size:16px; }
    .emc-sub{ font-size:12.5px; color:#9db0cc; line-height:1.5; }
    .emc-slots{ display:grid; grid-template-columns:repeat(auto-fill,minmax(58px,1fr)); gap:8px;
      padding:12px; border-radius:16px; background:rgba(139,92,246,.08); border:1px solid rgba(167,139,250,.3); }
    .emc-slot{ aspect-ratio:1; border-radius:12px; padding:4px; display:flex; align-items:center; justify-content:center;
      border:1px dashed rgba(148,163,184,.35); background:rgba(255,255,255,.02); color:#64748b; font-size:12px; }
    button.emc-slot{ border:1px solid rgba(167,139,250,.7); background:rgba(139,92,246,.16); cursor:pointer; }
    button.emc-slot:hover{ border-color:#f87171; background:rgba(248,113,113,.14); }
    .emc-slot img{ width:100%; height:100%; object-fit:contain; display:block; }
    .emc-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(84px,1fr)); gap:10px; }
    .emc-item{ position:relative; aspect-ratio:1; padding:8px; border-radius:14px; cursor:pointer; font:inherit;
      border:1px solid rgba(148,163,184,.2); background:rgba(255,255,255,.04);
      transition:transform .12s, border-color .12s, background .12s; }
    .emc-item img{ width:100%; height:100%; object-fit:contain; display:block; }
    button.emc-item:hover{ transform:scale(1.06); border-color:rgba(167,139,250,.7); }
    .emc-item.on{ border-color:#a78bfa; background:rgba(139,92,246,.2); box-shadow:0 0 16px rgba(139,92,246,.3); }
    .emc-tick{ position:absolute; top:-6px; right:-6px; width:22px; height:22px; border-radius:50%;
      display:none; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:#fff;
      background:#7c3aed; border:2px solid #0b1427; }
    .emc-item.on .emc-tick{ display:flex; }
    .emc-item.locked{ cursor:default; border-style:dashed; background:rgba(255,255,255,.02); }
    .emc-item.locked img{ filter:brightness(0) opacity(.28); }
    .emc-lock{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:22px; }
    .emc-msg{ min-height:18px; font-size:13px; color:#fcd34d; }
    .emc-clear{ padding:7px 12px; border-radius:10px; cursor:pointer; font:inherit; font-size:12px; font-weight:700;
      color:#fecaca; background:rgba(248,113,113,.1); border:1px solid rgba(248,113,113,.4); }
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

  const missing = new Set();

  /* El selector solo muestra los emotes EQUIPADOS (Glosario > Emotes). */
  function buildPicker(){
    grid.innerHTML = '';
    if(!col.equipped.length){
      const p = document.createElement('div');
      p.className = 'emo-empty';
      p.textContent = 'No llevas ningún emote. Equípalos en 📖 Glosario → Emotes.';
      grid.appendChild(p);
      return;
    }
    col.equipped.forEach(file => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'emo-item';
      item.dataset.file = file;
      const img = document.createElement('img');
      img.alt = file;
      img.src = FOLDER + file;
      img.onerror = () => {               // archivo que no existe: no se muestra
        missing.add(file);
        item.remove();
      };
      item.appendChild(img);
      item.addEventListener('click', () => sendEmote(openSide, file));
      grid.appendChild(item);
    });
  }
  buildPicker();

  function togglePicker(side){
    if(openSide === side){ closePicker(); return; }
    openSide = side;
    picker.className = 'side-' + side;
    const c = ctx();
    picker.querySelector('#emo-title').textContent =
      c.sides.length === 1 ? 'Emotes' : (side === 'p1' ? 'Emotes — Jugador 1' : 'Emotes — Jugador 2');
    buildPicker();
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
    if(!col.equipped.includes(file)) return;      // solo los equipados
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

  /* ---------- Cofres: 30% de emote nuevo por caja ---------- */
  function rollChest(n){
    n = Math.max(0, Math.floor(Number(n)) || 0);
    const got = [];
    for(let i = 0; i < n; i++){
      if(Math.random() >= CHEST_CHANCE) continue;
      const pool = FILES.filter(f => !col.owned[f]);
      if(!pool.length) break;                      // ya los tienes todos
      const f = pool[Math.floor(Math.random() * pool.length)];
      col.owned[f] = 1;
      got.push(f);
      if(col.equipped.length < MAX_EQUIPPED) col.equipped.push(f);   // se equipa solo si hay hueco
    }
    if(got.length){ saveCol(); buildPicker(); renderCollection(); }
    return got;
  }

  /* ---------- Glosario > pestaña Emotes ---------- */
  const colUI = { msg: '', setTab: null };
  const escA = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function renderCollection(){
    const box = document.getElementById('emo-col');
    if(!box) return;
    const owned = FILES.filter(f => col.owned[f]).length;
    let slots = '';
    for(let i = 0; i < MAX_EQUIPPED; i++){
      const f = col.equipped[i];
      slots += f
        ? '<button type="button" class="emc-slot" data-act="unequip" data-file="' + escA(f) + '" title="Quitar"><img src="' + FOLDER + escA(f) + '" alt=""></button>'
        : '<div class="emc-slot">' + (i + 1) + '</div>';
    }
    const items = FILES.map(f => {
      if(!col.owned[f]){
        return '<div class="emc-item locked" title="Bloqueado: consíguelo en las cajas"><img src="' + FOLDER + escA(f) + '" alt="">' +
               '<span class="emc-lock">🔒</span></div>';
      }
      const on = col.equipped.includes(f);
      return '<button type="button" class="emc-item' + (on ? ' on' : '') + '" data-act="toggle" data-file="' + escA(f) + '" ' +
             'title="' + (on ? 'Pulsa para quitar' : 'Pulsa para equipar') + '"><img src="' + FOLDER + escA(f) + '" alt="">' +
             '<span class="emc-tick">✓</span></button>';
    }).join('');
    box.innerHTML =
      '<div class="emc-top"><div><b>😀 Mis emotes</b>' +
        '<div class="emc-sub">Desbloqueados: <b>' + owned + ' / ' + FILES.length + '</b> · Equipados: <b>' + col.equipped.length + ' / ' + MAX_EQUIPPED + '</b></div></div>' +
        '<button type="button" class="emc-clear" data-act="clear">Quitar todos</button></div>' +
      '<div class="emc-sub">Estos son los que llevas a las partidas (máx. ' + MAX_EQUIPPED + '). Pulsa uno equipado para quitarlo. ' +
        'Consigue más emotes abriendo cajas del Inventario (' + Math.round(CHEST_CHANCE * 100) + '% de probabilidad por caja).</div>' +
      '<div class="emc-slots">' + slots + '</div>' +
      '<div class="emc-msg">' + colUI.msg + '</div>' +
      '<div class="emc-grid">' + items + '</div>';
  }

  function onColClick(e){
    const b = e.target.closest('[data-act]');
    if(!b) return;
    const act = b.dataset.act, f = b.dataset.file;
    colUI.msg = '';
    if(act === 'toggle' && col.owned[f]){
      const i = col.equipped.indexOf(f);
      if(i >= 0) col.equipped.splice(i, 1);
      else if(col.equipped.length >= MAX_EQUIPPED) colUI.msg = 'Ya llevas ' + MAX_EQUIPPED + ' emotes: quita uno antes de equipar otro.';
      else col.equipped.push(f);
    } else if(act === 'unequip'){
      const i = col.equipped.indexOf(f);
      if(i >= 0) col.equipped.splice(i, 1);
    } else if(act === 'clear'){
      col.equipped = [];
    }
    saveCol();
    buildPicker();
    renderCollection();
  }

  function setupGlossary(){
    const scr = document.getElementById('glossary-screen');
    if(!scr) return false;
    const card = scr.querySelector('.glossary-card');
    if(!card) return false;
    if(card.querySelector('.emo-tabs')) return true;
    const head = card.querySelector('.glossary-head');
    const tabs = document.createElement('div');
    tabs.className = 'emo-tabs';
    tabs.innerHTML =
      '<button type="button" class="emo-tab on" data-tab="chars">🧑 Personajes</button>' +
      '<button type="button" class="emo-tab" data-tab="emotes">😀 Emotes</button>';
    const panel = document.createElement('div');
    panel.id = 'emo-col';
    panel.style.display = 'none';
    if(head) head.after(tabs); else card.prepend(tabs);
    tabs.after(panel);

    const others = () => ['.search-row', '#glossary-filters', '#glossary-count', '#glossary-grid']
      .map(sel => card.querySelector(sel)).filter(Boolean);
    function setTab(t){
      const em = t === 'emotes';
      tabs.querySelectorAll('.emo-tab').forEach(btn => btn.classList.toggle('on', btn.dataset.tab === t));
      others().forEach(el => el.classList.toggle('emo-hide', em));
      panel.style.display = em ? 'flex' : 'none';
      if(em){ colUI.msg = ''; renderCollection(); }
    }
    colUI.setTab = setTab;
    tabs.addEventListener('click', e => {
      const btn = e.target.closest('.emo-tab');
      if(btn) setTab(btn.dataset.tab);
    });
    panel.addEventListener('click', onColClick);
    // Al cerrar el glosario, la próxima vez vuelve a abrirse en "Personajes".
    if(window.MutationObserver){
      new MutationObserver(() => {
        if(getComputedStyle(scr).display === 'none') setTab('chars');
      }).observe(scr, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    return true;
  }
  setupGlossary();

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
    setupGlossary();
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
    files: FILES.slice(),
    folder: FOLDER,
    rollChest,        // (nCajas) -> [archivos de emotes nuevos]; lo usa inventario.js
    owned: () => FILES.filter(f => col.owned[f]),
    equipped: () => col.equipped.slice(),
    maxEquipped: MAX_EQUIPPED,
    chestChance: CHEST_CHANCE
  };
  window.Emotes = api;
})();
