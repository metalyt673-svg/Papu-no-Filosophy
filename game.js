/* game.js
   Versión mejorada con:
   - Sistema de buffs corregido (múltiples buffs sin duplicación)
   - Buffs y debuffs temporales con duración real
   - Modo muerte súbita tras 70 turnos
   - Sistema de estados: stun, congelar, embelesar, miedo y ralentizar
   - Daño continuo: quemadura, veneno y sangrado
   - Nuevos efectos: robo de vida, reflejo de daño, crítico y reducción de curación
   - IA táctica con decisiones por vida, daño, estados, buffs, debuffs y cambios gratuitos
*/

console.log('[game.js] habilidades de area corregidas (v3)');

/* Aleatoriedad del combate. En el modo Multijugador (multijugador.js) los dos
   navegadores comparten una semilla (window.__mpRng) para que todas las tiradas
   (precisión, críticos, estados...) salgan iguales en ambos. Fuera de ese modo
   usa Math.random() como siempre. */
function gameRandom(){
  return (typeof window !== 'undefined' && typeof window.__mpRng === 'function') ? window.__mpRng() : Math.random();
}
const DAMAGE_MULT = 0.7;
const BASE_CRIT_CHANCE = 0.08;
const SUDDEN_DEATH_TURN = 70;
const SUDDEN_DEATH_TURN_CHALLENGE = 100; // Modo Desafío (desafio.js): muerte súbita más tardía

const CLASSES = [
  { key: 'atacante', label: '🗡️ Atacante' },
  { key: 'defensor', label: '🛡️ Defensor' },
  { key: 'sanador',  label: '💊 Sanador' },
  { key: 'soporte',  label: '⚙️ Soporte' },
  { key: 'debilitador', label: '☠️ Debilitador' },
  { key: 'mago', label: '🧙‍♀️ Mago' },
  { key: 'control', label: '🤖 Control' }
];

/* CHARACTERS ahora vive en personajes/personajes.js (variable global CHARACTERS,
   cargado antes que este archivo en juego.html). */

const state = {
  teams: { p1: [], p2: [] },
  activeIndex: { p1: 0, p2: 0 },
  phase: 'select',
  turnOwner: null,
  filter: { p1: null, p2: null },
  search: { p1: '', p2: '' },   // texto del buscador por nombre
  mode: null,  // 'pvp' o 'pve'
  bansEnabled: false,          // modos con fase de baneos
  bans: { p1: [], p2: [] },    // id del personaje baneado o null = baneo en blanco
  banPending: null,            // personaje marcado antes de confirmar el baneo
  banSearch: '',
  banFilter: null,
  turnCount: 0,
  suddenDeath: false,
  aiLastSwapTurn: -999,
  roundActed: { p1: false, p2: false },  // qué jugadores ya actuaron en la ronda actual
  storyMode: false,   // true durante una batalla scriptada del Modo Historia
  challengeMode: false, // true durante un combate del Modo Desafío (lo activa desafio.js)
  storyIndex: 0,       // capítulo actual del Modo Historia
  moveLock: false      // true mientras se resuelve una habilidad (evita clics repetidos)
};

/* DOM helpers */
const $ = id => document.getElementById(id);
const log = txt => { const el = $('log'); el.innerHTML = `<div>${txt}</div>` + el.innerHTML; };

function cloneCharacter(base){
  const c = JSON.parse(JSON.stringify(base));
  c.maxHp = c.hp;
  c.shield = 0;
  c.tempAtk = 0;
  c.tempDef = 0;
  c.tempSpd = 0;
  c.moves = c.moves.map(m => ({ ...m, cd: 0 }));

  // Buffs/debuffs y estados persistentes de combate.
  c.tempEffects = [];
  c.debuffEffects = [];
  c.statusEffects = [];  // burn, poison, bleed, etc.
  c.controlEffects = [];  // freeze, charm, fear, slow, etc.
  c.specialEffects = [];  // lifesteal, reflectDamage, critChance, healReduction

  // Compatibilidad con habilidades existentes que usan stun.
  c.stunned = 0;

  return c;
}
/* Busca un personaje por id. Además de CHARACTERS (batalla libre) también mira
   en STORY_ONLY_CHARACTERS (personajes exclusivos del Modo Historia), para que
   historia.js pueda usarlos aunque no aparezcan en los demás modos. */
function findBaseById(id){
  return CHARACTERS.find(c=>c.id===id)
      || (typeof STORY_ONLY_CHARACTERS !== 'undefined' ? STORY_ONLY_CHARACTERS.find(c=>c.id===id) : undefined);
}

function isCharInTeam(player, id){ 
  return state.teams[player].some(c=>c.id===id); 
}

/* =========================================================
   FASE DE BANEOS (modos "con baneos")
   4 baneos por jugador (8 en total), por turnos alternos.
   Se puede gastar un turno sin banear a nadie: "baneo en blanco".
   ========================================================= */
const BANS_PER_PLAYER = 4;

function totalBans(){ return state.bans.p1.length + state.bans.p2.length; }
function banTurnPlayer(){ return totalBans() % 2 === 0 ? 'p1' : 'p2'; }
function bansFinished(){ return totalBans() >= BANS_PER_PLAYER * 2; }
function isBanned(id){ return state.bans.p1.includes(id) || state.bans.p2.includes(id); }
function isAiBanner(player){ return state.mode === 'pve' && player === 'p2'; }
function bannedIds(){ return state.bans.p1.concat(state.bans.p2).filter(Boolean); }
function playerLabel(player){
  return player === 'p1' ? 'Jugador 1' : (state.mode === 'pve' ? 'IA' : 'Jugador 2');
}

/* Personajes mostrados en la rejilla de baneos (filtro de clase + búsqueda). */
function getBanCandidates(){
  let chars = CHARACTERS;
  if(state.banFilter) chars = chars.filter(c => c.classes.includes(state.banFilter));
  const q = normalizeText(state.banSearch);
  if(q){
    chars = chars.filter(c => {
      const name = normalizeText(c.name);
      const classes = normalizeText((c.classes || []).join(' '));
      return name.includes(q) || classes.includes(q);
    });
  }
  return chars;
}

function startBanPhase(){
  state.bans = { p1: [], p2: [] };
  state.banPending = null;
  state.banSearch = '';
  state.banFilter = null;
  const searchInput = $('ban-search');
  if(searchInput) searchInput.value = '';
  $('ban-log').innerHTML = '';
  $('ban-phase').style.display = 'flex';
  renderBanFilters();
  renderBanPhase();
  maybeAiBan();
}

function renderBanFilters(){
  const cont = $('ban-filters');
  if(!cont) return;
  cont.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'class-btn' + (state.banFilter === null ? ' active' : '');
  all.textContent = 'Ver todos';
  all.onclick = () => { state.banFilter = null; renderBanFilters(); renderBanGrid(); };
  cont.appendChild(all);
  CLASSES.forEach(c => {
    const b = document.createElement('button');
    b.className = 'class-btn' + (state.banFilter === c.key ? ' active' : '');
    b.textContent = c.label;
    b.onclick = () => { state.banFilter = c.key; renderBanFilters(); renderBanGrid(); };
    cont.appendChild(b);
  });
}

function renderBanPhase(){
  const player = banTurnPlayer();
  const done = bansFinished();
  const turnNumber = state.bans[player].length + 1;

  $('ban-turn-title').innerHTML = done
    ? '✅ Baneos completados'
    : `🚫 Turno de <span class="${player==='p1'?'ban-p1':'ban-p2'}">${playerLabel(player)}</span>`;

  const restantes = CHARACTERS.length - bannedIds().length;
  $('ban-turn-sub').innerText = done
    ? 'Pasando a la selección de personajes…'
    : `Baneo ${turnNumber} de ${BANS_PER_PLAYER} · ${totalBans()}/${BANS_PER_PLAYER*2} baneos usados · ${restantes} personajes disponibles`;

  renderBanSlots('p1');
  renderBanSlots('p2');
  renderBanGrid();

  const waitingAi = !done && isAiBanner(player);
  const confirmBtn = $('ban-confirm');
  const blankBtn = $('ban-blank');
  confirmBtn.disabled = done || waitingAi || !state.banPending;
  blankBtn.disabled = done || waitingAi;
  confirmBtn.innerText = state.banPending
    ? `Confirmar baneo: ${findBaseById(state.banPending).name}`
    : 'Confirmar baneo';
  $('ban-wait').innerText = waitingAi ? '🤖 La IA está eligiendo su baneo…' : '';
}

function renderBanSlots(player){
  const cont = $(`ban-${player}-slots`);
  if(!cont) return;
  cont.innerHTML = '';
  for(let i = 0; i < BANS_PER_PLAYER; i++){
    const slot = document.createElement('div');
    slot.className = 'ban-slot';
    const entry = state.bans[player][i];
    if(entry === undefined){
      slot.classList.add('empty');
      slot.innerHTML = '<div class="small muted">—</div>';
    } else if(entry === null){
      slot.classList.add('blank');
      slot.innerHTML = '<div class="small">⬜<br>En blanco</div>';
      slot.title = 'Baneo en blanco (no se baneó a nadie)';
    } else {
      const base = findBaseById(entry);
      slot.classList.add('used');
      slot.innerHTML = `<img src="${base.img}" alt=""><span class="ban-cross">✖</span>`;
      slot.title = base.name;
    }
    cont.appendChild(slot);
  }
}

function renderBanGrid(){
  const wrap = $('ban-grid');
  if(!wrap) return;
  wrap.innerHTML = '';
  const chars = getBanCandidates();
  const done = bansFinished();
  const waitingAi = isAiBanner(banTurnPlayer());

  const counter = $('ban-count');
  if(counter){
    counter.innerText = (state.banSearch || state.banFilter)
      ? `Mostrando ${chars.length} de ${CHARACTERS.length} personajes`
      : `${CHARACTERS.length} personajes en total`;
  }

  if(chars.length === 0){
    const empty = document.createElement('div');
    empty.className = 'no-results small';
    empty.innerHTML = 'Sin resultados. Prueba con otro nombre o pulsa “Ver todos”.';
    wrap.appendChild(empty);
    return;
  }

  chars.forEach(ch => {
    const el = document.createElement('div');
    el.className = 'char';
    el.innerHTML = `<img src="${ch.img}" alt=""><strong style="display:block;margin-top:6px">${ch.name}</strong>
                    <div class="classes">${ch.classes.join(', ')}</div>`;
    if(isBanned(ch.id)){
      el.classList.add('banned');
      const badge = document.createElement('div');
      badge.className = 'ban-badge';
      badge.innerText = '🚫 Baneado';
      el.appendChild(badge);
    } else if(!done && !waitingAi){
      if(state.banPending === ch.id) el.classList.add('pending-ban');
      el.onclick = () => {
        state.banPending = (state.banPending === ch.id) ? null : ch.id;
        renderBanPhase();
      };
    } else {
      el.classList.add('locked');
    }
    wrap.appendChild(el);
  });
}

/* Registra un baneo. id = null -> baneo en blanco (gasta el turno sin banear). */
function commitBan(id){
  if(bansFinished()) return;
  const player = banTurnPlayer();
  if(id !== null && isBanned(id)) return;
  state.bans[player].push(id);
  state.banPending = null;

  const name = id === null ? 'baneo en blanco (no baneó a nadie)' : findBaseById(id).name;
  const line = document.createElement('div');
  line.className = 'ban-log-line';
  line.innerHTML = `<strong class="${player==='p1'?'ban-p1':'ban-p2'}">${playerLabel(player)}</strong> → ${id === null ? '⬜ ' : '🚫 '}${name}`;
  $('ban-log').prepend(line);

  renderBanPhase();

  if(bansFinished()){
    setTimeout(finishBanPhase, 900);
  } else {
    maybeAiBan();
  }
}

/* Si le toca a la IA, elige su baneo sola. */
function maybeAiBan(){
  if(bansFinished()) return;
  const player = banTurnPlayer();
  if(!isAiBanner(player)) return;
  renderBanPhase();
  setTimeout(() => {
    const pool = CHARACTERS.filter(c => !isBanned(c.id));
    if(pool.length === 0){ commitBan(null); return; }
    // La IA prioriza personajes con estadísticas altas, con algo de azar.
    const scored = pool.map(c => ({
      c,
      score: (c.atk||0) + (c.def||0) + (c.spd||0) + (c.hp||0)/10 + Math.random()*25
    })).sort((a,b) => b.score - a.score);
    const pick = scored[Math.floor(Math.random() * Math.min(6, scored.length))].c;
    commitBan(pick.id);
  }, 1000);
}

function finishBanPhase(){
  $('ban-phase').style.display = 'none';
  $('game-root').style.display = 'block';
  renderBannedBanner();
  initAll();
  log(`Baneos: ${bannedIds().map(id => findBaseById(id).name).join(', ') || 'ninguno'}.`);
}

/* Franja informativa con los personajes baneados durante la partida. */
function renderBannedBanner(){
  const banner = $('banned-banner');
  if(!banner) return;
  if(!state.bansEnabled){ banner.style.display = 'none'; return; }
  const ids = bannedIds();
  const blanks = state.bans.p1.filter(b => b === null).length + state.bans.p2.filter(b => b === null).length;
  banner.style.display = 'block';
  banner.innerHTML = `<strong>🚫 Baneados (${ids.length}):</strong> ` +
    (ids.length ? ids.map(id => findBaseById(id).name).join(' · ') : 'ninguno') +
    (blanks ? ` <span class="muted">· ${blanks} baneo(s) en blanco</span>` : '');
}

/* =========================================================
   GLOSARIO DE PERSONAJES
   Pantalla de consulta: buscador + filtro por clase + ficha
   grande con stats y las 4 habilidades de cada personaje.
   No modifica state.teams ni nada relacionado con partidas.
   ========================================================= */
state.glossarySearch = '';
state.glossaryFilter = null;

function getGlossaryCandidates(){
  let chars = CHARACTERS;
  if(state.glossaryFilter) chars = chars.filter(c => c.classes.includes(state.glossaryFilter));
  const q = normalizeText(state.glossarySearch);
  if(q){
    chars = chars.filter(c => {
      const name = normalizeText(c.name);
      const classes = normalizeText((c.classes || []).join(' '));
      return name.includes(q) || classes.includes(q);
    });
  }
  return chars;
}

function openGlossary(){
  $('main-menu').style.display = 'none';
  $('glossary-screen').style.display = 'flex';
  state.glossarySearch = '';
  state.glossaryFilter = null;
  const input = $('glossary-search');
  if(input) input.value = '';
  renderGlossaryFilters();
  renderGlossaryGrid();
}

function closeGlossary(){
  $('glossary-screen').style.display = 'none';
  $('main-menu').style.display = 'flex';
}

function renderGlossaryFilters(){
  const cont = $('glossary-filters');
  if(!cont) return;
  cont.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'class-btn' + (state.glossaryFilter === null ? ' active' : '');
  all.textContent = 'Ver todos';
  all.onclick = () => { state.glossaryFilter = null; renderGlossaryFilters(); renderGlossaryGrid(); };
  cont.appendChild(all);
  CLASSES.forEach(c => {
    const b = document.createElement('button');
    b.className = 'class-btn' + (state.glossaryFilter === c.key ? ' active' : '');
    b.textContent = c.label;
    b.onclick = () => { state.glossaryFilter = c.key; renderGlossaryFilters(); renderGlossaryGrid(); };
    cont.appendChild(b);
  });
}

function renderGlossaryGrid(){
  const wrap = $('glossary-grid');
  if(!wrap) return;
  wrap.innerHTML = '';
  const chars = getGlossaryCandidates();

  const counter = $('glossary-count');
  if(counter){
    counter.innerText = (state.glossarySearch || state.glossaryFilter)
      ? `Mostrando ${chars.length} de ${CHARACTERS.length} personajes`
      : `${CHARACTERS.length} personajes disponibles`;
  }

  if(chars.length === 0){
    const empty = document.createElement('div');
    empty.className = 'no-results small';
    empty.innerHTML = 'Sin resultados. Prueba con otro nombre o pulsa “Ver todos”.';
    wrap.appendChild(empty);
    return;
  }

  chars.forEach(ch => {
    const el = document.createElement('div');
    el.className = 'char';
    el.innerHTML = `<img src="${ch.img}" alt=""><strong style="display:block;margin-top:6px">${ch.name}</strong>
                    <div class="classes">${ch.classes.join(', ')}</div>`;
    el.onclick = () => openCharacterDetail(ch.id);
    wrap.appendChild(el);
  });
}

/* Traduce el "type" de una habilidad en una etiqueta legible y su clase de color. */
function glossaryMoveTypeLabel(move){
  const isSupportLike = move.type === 'support' ||
    (move.effect && (move.effect.type === 'heal' || move.effect.type === 'shield' || String(move.effect.type).startsWith('temp')));
  return isSupportLike ? { text: 'Apoyo', cls: 'support' } : { text: 'Ataque', cls: 'attack' };
}

function openCharacterDetail(id){
  const ch = findBaseById(id);
  if(!ch) return;

  const body = $('glossary-detail-body');

  const statsHtml = ['hp','atk','def','spd'].map(stat => `
    <div class="glossary-stat">
      <span class="stat-label">${stat.toUpperCase()}</span>
      <span class="stat-value">${ch[stat]}</span>
    </div>`).join('');

  const movesHtml = (ch.moves || []).map(m => {
    const typeInfo = glossaryMoveTypeLabel(m);
    const cdText = m.baseCooldown > 0 ? `CD: ${m.baseCooldown}` : 'Sin cooldown';
    const powerText = m.power > 0 ? `Poder: ${m.power}` : 'Sin daño directo';
    const accText = `Precisión: ${Math.round((m.acc ?? 1) * 100)}%`;
    return `
      <div class="glossary-move">
        <div class="glossary-move-top">
          <span class="move-name ${typeInfo.cls}">${m.name}</span>
          <span class="small">${typeInfo.text}</span>
        </div>
        <div class="glossary-move-meta">${powerText} · ${accText} · ${cdText}</div>
        <div class="glossary-move-desc">${m.desc || ''}</div>
      </div>`;
  }).join('');

  body.innerHTML = `
    <div class="glossary-detail-header">
      <img src="${ch.img}" alt="">
      <div>
        <h3>${ch.name}</h3>
        <div class="glossary-detail-classes">${ch.classes.join(' · ')}</div>
      </div>
    </div>
    <div class="glossary-stats">${statsHtml}</div>
    <div class="glossary-moves">
      <h4>Habilidades</h4>
      ${movesHtml}
    </div>`;

  $('glossary-detail').style.display = 'flex';
}

function closeCharacterDetail(){
  $('glossary-detail').style.display = 'none';
}

/* =========================================================
   MODO HISTORIA — "Papu no Filosophy"
   Encadena capítulos narrativos y batallas scriptadas (equipos
   fijos definidos en historia.js) reutilizando el motor de combate
   ya existente. El progreso (capítulo más lejano alcanzado) se
   guarda en localStorage, igual que la configuración de música.
   ========================================================= */
const STORY_PROGRESS_KEY = 'batalla-story-progress';

function loadStoryProgress(){
  try{
    const raw = localStorage.getItem(STORY_PROGRESS_KEY);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }catch(e){ return 0; }
}

function saveStoryProgress(index){
  try{ localStorage.setItem(STORY_PROGRESS_KEY, String(index)); }catch(e){ /* sin permiso: se ignora */ }
}

/* --- Utilidades visuales del Modo Historia --- */

/* Detecta líneas con formato "Personaje: texto" (como las de Nicktula,
   Papudo, etc.) y las separa en nombre + texto para darles aspecto de
   guion de diálogo. El resto de líneas se tratan como narración normal. */
function formatStoryLines(lines){
  return (lines || []).map(line => {
    const match = /^([A-ZÀ-Ý0-9][\wÀ-ÿ'’.-]*(?:\s[A-ZÀ-Ý0-9][\wÀ-ÿ'’.-]*){0,3}):\s+(.+)$/.exec(line);
    if(match){
      const speaker = match[1];
      const text = match[2];
      return `<div class="story-line story-line--speech">
                <span class="story-line-speaker">${speaker}</span>
                <p class="story-line-text">${text}</p>
              </div>`;
    }
    return `<p class="story-line story-line--narration">${line}</p>`;
  }).join('');
}

/* Insignia + barra de progreso visual del capítulo actual. */
function storyProgressHTML(index, badge){
  const total = STORY_CHAPTERS.length;
  const pct = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;
  return `
    <div class="story-progress">
      <div class="story-progress-top">
        ${badge ? `<span class="story-type-badge">${badge}</span>` : '<span></span>'}
        <span class="story-progress-label">Capítulo ${index + 1} / ${total}</span>
      </div>
      <div class="story-progress-bar"><i style="width:${pct}%"></i></div>
    </div>`;
}

/* Fichas con retrato de un equipo, para la vista previa de combate. */
function storyTeamChipsHTML(ids){
  return (ids || []).map(id => {
    const base = findBaseById(id) || { name: id, img: '' };
    return `<div class="story-chip">
              ${base.img ? `<img src="${base.img}" alt="">` : ''}
              <span>${base.name}</span>
            </div>`;
  }).join('');
}

function openStoryMode(){
  if(typeof STORY_CHAPTERS === 'undefined'){
    alert('No se encontró historia.js. Comprueba que el archivo esté junto a game.js y personajes.js.');
    return;
  }
  $('main-menu').style.display = 'none';
  $('story-screen').style.display = 'flex';
  if(window.playStoryDialogueMusic) window.playStoryDialogueMusic();

  const furthest = loadStoryProgress();
  if(furthest > 0 && furthest < STORY_CHAPTERS.length){
    renderStoryChoice(furthest);
  } else {
    state.storyIndex = 0;
    renderStoryStage();
  }
}

/* Pantalla intermedia: continuar desde donde lo dejó, o empezar de nuevo. */
function renderStoryChoice(furthest){
  const body = $('story-body');
  body.innerHTML = `
    <div class="story-narrative story-fade">
      <span class="story-type-badge">📖 Progreso guardado</span>
      <h3>${STORY_TITLE}</h3>
      <p class="story-line story-line--narration">Tienes progreso guardado en el capítulo ${furthest + 1} de ${STORY_CHAPTERS.length}.</p>
      <div class="story-actions">
        <button id="story-continue" class="class-btn story-btn-primary">▶ Continuar</button>
        <button id="story-restart" class="class-btn">⟲ Empezar de nuevo</button>
      </div>
    </div>`;
  $('story-continue').addEventListener('click', () => { state.storyIndex = furthest; renderStoryStage(); });
  $('story-restart').addEventListener('click', () => { state.storyIndex = 0; saveStoryProgress(0); renderStoryStage(); });
}

function closeStoryMode(){
  $('story-screen').style.display = 'none';
  $('main-menu').style.display = 'flex';
  if(window.stopAllStoryMusic) window.stopAllStoryMusic();
}

function renderStoryStage(){
  const chapter = STORY_CHAPTERS[state.storyIndex];
  const body = $('story-body');
  if(!chapter){
    body.innerHTML = `
      <div class="story-narrative story-fade">
        <span class="story-type-badge">📖 Fin de la historia</span>
        <h3>${STORY_TITLE}</h3>
        <p class="story-line story-line--narration">¡Historia completada! Gracias por jugar.</p>
        <div class="story-actions">
          <button id="story-restart-end" class="class-btn story-btn-primary">⟲ Volver a jugar</button>
        </div>
      </div>`;
    $('story-restart-end').addEventListener('click', () => { state.storyIndex = 0; saveStoryProgress(0); renderStoryStage(); });
    return;
  }

  saveStoryProgress(state.storyIndex);

  if(chapter.type === 'narrative'){
    body.innerHTML = `
      <div class="story-narrative story-fade">
        ${storyProgressHTML(state.storyIndex, '📖 Narración')}
        <h3>${chapter.title}</h3>
        ${chapter.speaker ? `<div class="story-speaker">${chapter.speaker}</div>` : ''}
        ${formatStoryLines(chapter.lines)}
        <div class="story-actions">
          <button id="story-next" class="class-btn story-btn-primary">Continuar ▶</button>
        </div>
      </div>`;
    $('story-next').addEventListener('click', () => {
      state.storyIndex += 1;
      renderStoryStage();
    });
    return;
  }

  if(chapter.type === 'battle'){
    body.innerHTML = `
      <div class="story-narrative story-fade">
        ${storyProgressHTML(state.storyIndex, '⚔ Combate')}
        <h3>${chapter.title}</h3>
        ${formatStoryLines(chapter.intro)}
        <div class="story-vs">
          <div class="story-vs-side">
            <div class="story-vs-label">Tu equipo</div>
            <div class="story-vs-chips">${storyTeamChipsHTML(chapter.heroIds)}</div>
          </div>
          <div class="story-vs-versus">VS</div>
          <div class="story-vs-side">
            <div class="story-vs-label">Rivales</div>
            <div class="story-vs-chips">${storyTeamChipsHTML(chapter.villainIds)}</div>
          </div>
        </div>
        <div class="story-actions">
          <button id="story-fight" class="class-btn story-btn-primary">Empezar combate ⚔</button>
        </div>
      </div>`;
    $('story-fight').addEventListener('click', () => startStoryBattle(chapter));
    return;
  }
}

/* Prepara y lanza una batalla scriptada del Modo Historia. */
function startStoryBattle(chapter){
  const heroes = chapter.heroIds.map(id => {
    const base = findBaseById(id);
    if(!base) console.warn('Personaje de historia no encontrado:', id);
    return base ? cloneCharacter(base) : null;
  }).filter(Boolean);

  const villains = chapter.villainIds.map(id => {
    const base = findBaseById(id);
    if(!base) console.warn('Personaje de historia no encontrado:', id);
    return base ? cloneCharacter(base) : null;
  }).filter(Boolean);

  if(heroes.length === 0 || villains.length === 0){
    alert('No se pudo preparar este combate: revisa los ids en historia.js.');
    return;
  }

  state.mode = 'pve';
  window.GAME_MODE = 'pve';
  state.bansEnabled = false;
  state.storyMode = true;
  state.teams.p1 = heroes;
  state.teams.p2 = villains;
  state.activeIndex.p1 = 0;
  state.activeIndex.p2 = 0;

  $('story-screen').style.display = 'none';
  $('game-root').style.display = 'block';
  $('p2-title').innerText = chapter.villainIds.length > 1 ? 'Rivales de la historia' : 'Rival de la historia';
  $('enemy-label').innerText = 'Rival';
  const banner = $('banned-banner');
  if(banner) banner.style.display = 'none';

  const surrenderBtn = $('story-surrender-btn');
  if(surrenderBtn) surrenderBtn.style.display = 'inline-block';

  if(window.playStoryBattleMusic) window.playStoryBattleMusic();

  state.phase = 'battle';
  startBattle();
}

/* Permite rendirse durante una batalla del Modo Historia.
   Cuenta como una derrota: en los capítulos marcados con
   loseToProgress:true esto también hace avanzar la historia,
   ya que esas peleas están pensadas para perderse a propósito. */
function surrenderStoryBattle(){
  if(!state.storyMode || state.phase !== 'battle') return;
  if(!confirm('¿Seguro que quieres rendirte en este combate?')) return;

  state.phase = 'ended';
  $('moves-area').innerHTML = '<div class="small">🏳️ Te has rendido.</div>';
  updateTurnInfo();
  setTimeout(() => onStoryBattleEnd('lose'), 500);
}

/* Se llama cuando una batalla scriptada termina. result: 'win' | 'lose'
   (una rendición cuenta como 'lose').

   Algunos capítulos (marcados con loseToProgress:true en historia.js)
   están pensados para perderse a propósito: en esos, SOLO perder o
   rendirse hace avanzar la historia; ganar cuenta como fallo y obliga
   a reintentar. En el resto de capítulos es al revés: solo ganar
   avanza la historia, y perder (o rendirse) obliga a reintentar. */
function onStoryBattleEnd(result){
  state.storyMode = false;
  $('game-root').style.display = 'none';
  $('story-screen').style.display = 'flex';

  const surrenderBtn = $('story-surrender-btn');
  if(surrenderBtn) surrenderBtn.style.display = 'none';

  if(window.playStoryDialogueMusic) window.playStoryDialogueMusic();

  const chapter = STORY_CHAPTERS[state.storyIndex];
  const isLoseToProgress = !!chapter.loseToProgress;
  const success = isLoseToProgress ? (result === 'lose') : (result === 'win');
  const wonWhenShouldLose = isLoseToProgress && result === 'win';

  let heading, text, extraNote = '';

  if(wonWhenShouldLose){
    heading = '⚠️ Este combate hay que perderlo';
    text = [];
    extraNote = '<div class="story-note">Esta pelea está pensada para perderse a propósito. Vuelve a intentarlo y piérdela (o usa el botón 🏳️ Rendirse durante el combate) para que la historia continúe.</div>';
  } else if(success){
    heading = result === 'win' ? '✅ Victoria' : '📜 Derrota (tal y como debía pasar)';
    text = (result === 'win' ? chapter.victory : chapter.defeat) || [];
  } else {
    heading = '💀 Derrota';
    text = chapter.defeat || [];
  }

  const badge = wonWhenShouldLose ? '⚠️ Fallo' : (success ? '✅ Progreso' : '💀 Derrota');

  const body = $('story-body');
  body.innerHTML = `
    <div class="story-narrative story-fade">
      ${storyProgressHTML(state.storyIndex, badge)}
      <h3>${heading}</h3>
      ${formatStoryLines(text)}
      ${extraNote}
      <div class="story-actions">
        ${success
          ? '<button id="story-next" class="class-btn story-btn-primary">Continuar ▶</button>'
          : '<button id="story-retry" class="class-btn story-btn-primary">Reintentar combate ⚔</button>'}
      </div>
    </div>`;

  if(success){
    $('story-next').addEventListener('click', () => {
      state.storyIndex += 1;
      renderStoryStage();
    });
  } else {
    $('story-retry').addEventListener('click', () => startStoryBattle(chapter));
  }
}

/* Punto de entrada desde el menú principal. */
function startMode(mode, withBans){
  state.mode = mode;
  window.GAME_MODE = mode;
  state.bansEnabled = !!withBans;
  state.bans = { p1: [], p2: [] };
  state.banPending = null;
  state.storyMode = false;
  state.teams.p1 = [];
  state.teams.p2 = [];
  state.phase = 'select';

  // Por si una batalla anterior (p.ej. del Modo Historia) ocultó la rejilla
  // de selección de personajes, se vuelve a mostrar al empezar una partida nueva.
  const selectorRow = document.querySelector('.selector-row');
  if(selectorRow) selectorRow.style.display = '';
  const startBtnEl = $('startBtn');
  if(startBtnEl) startBtnEl.style.display = '';

  $('main-menu').style.display = 'none';
  $('p2-title').innerText = mode === 'pve' ? 'IA (se elegirá automáticamente)' : 'Jugador 2 — Selección';
  $('enemy-label').innerText = mode === 'pve' ? 'IA' : 'Jugador 2';

  if(state.bansEnabled){
    startBanPhase();
  } else {
    $('game-root').style.display = 'block';
    renderBannedBanner();
    initAll();
  }
}

/* ---- Selection with class filter ---- */
function initSelection(){
  state.mode = window.GAME_MODE || 'pvp';
  if(state.mode === 'pve'){
    $('p2-title').innerText = 'IA (se elegirá automáticamente)';
    $('p2-info').innerText = 'IA elegirá 3 personajes';
  }
  renderPanel('p1'); renderPanel('p2'); renderSlots('p1'); renderSlots('p2');
  updateStartBtn(); updateInfoText();
}

/* Normaliza texto para buscar sin importar mayúsculas ni acentos (á = a). */
function normalizeText(txt){
  return String(txt || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/* Devuelve los personajes visibles según filtro de clase + buscador por nombre.
   En los modos con baneos, los personajes baneados quedan fuera del pool. */
function getVisibleCharacters(player){
  let chars = CHARACTERS;
  if(state.bansEnabled) chars = chars.filter(c => !isBanned(c.id));
  if(state.filter[player]) chars = chars.filter(c => c.classes.includes(state.filter[player]));
  const q = normalizeText(state.search[player]);
  if(q){
    chars = chars.filter(c => {
      const name = normalizeText(c.name);
      const classes = normalizeText((c.classes || []).join(' '));
      return name.includes(q) || classes.includes(q);
    });
  }
  return chars;
}

function renderPanel(player){
  const list = $(`${player}-list`);
  const prevInput = $(`${player}-search`);
  const hadFocus = !!prevInput && document.activeElement === prevInput;
  list.innerHTML = '';
  const ctrl = document.createElement('div');
  ctrl.style.marginBottom = '8px';
  const disableP2 = (state.mode === 'pve' && player === 'p2');
  ctrl.innerHTML = `<button class="class-btn" onclick="setFilter('${player}', null)" ${disableP2?'disabled':''}>Ver todos</button>
                    <button class="class-btn" onclick="showClassMenu('${player}')" ${disableP2?'disabled':''}>Elegir por clase</button>`;
  list.appendChild(ctrl);

  /* ---- Buscador por nombre ---- */
  const searchRow = document.createElement('div');
  searchRow.className = 'search-row';

  const icon = document.createElement('span');
  icon.className = 'search-icon';
  icon.textContent = '🔎';
  searchRow.appendChild(icon);

  const input = document.createElement('input');
  input.type = 'text';
  input.id = `${player}-search`;
  input.className = 'search-input';
  input.placeholder = 'Buscar personaje por nombre…';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.value = state.search[player] || '';
  input.disabled = disableP2;
  input.addEventListener('input', () => {
    state.search[player] = input.value;
    renderCharGrid(player);
  });
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      state.search[player] = '';
      input.value = '';
      renderCharGrid(player);
    }
  });
  searchRow.appendChild(input);

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'search-clear';
  clearBtn.title = 'Limpiar búsqueda';
  clearBtn.textContent = '✕';
  clearBtn.disabled = disableP2;
  clearBtn.onclick = () => {
    state.search[player] = '';
    input.value = '';
    renderCharGrid(player);
    input.focus();
  };
  searchRow.appendChild(clearBtn);

  list.appendChild(searchRow);

  const counter = document.createElement('div');
  counter.className = 'search-count small';
  counter.id = `${player}-search-count`;
  list.appendChild(counter);

  const wrap = document.createElement('div');
  wrap.className = 'char-list';
  wrap.id = `${player}-grid`;
  list.appendChild(wrap);

  renderCharGrid(player);
  renderSlots(player);

  if(hadFocus && !disableP2){
    input.focus();
    const end = input.value.length;
    try { input.setSelectionRange(end, end); } catch(e){}
  }
}

/* Dibuja solo la rejilla de personajes (se usa al escribir en el buscador
   para no perder el foco del input). */
function renderCharGrid(player){
  const wrap = $(`${player}-grid`);
  if(!wrap) return;
  wrap.innerHTML = '';
  const disableP2 = (state.mode === 'pve' && player === 'p2');
  const chars = getVisibleCharacters(player);

  const counter = $(`${player}-search-count`);
  if(counter){
    const total = state.bansEnabled
      ? CHARACTERS.filter(c => !isBanned(c.id)).length
      : CHARACTERS.length;
    counter.innerText = (state.search[player] || state.filter[player])
      ? `Mostrando ${chars.length} de ${total} personajes`
      : `${total} personajes disponibles`;
  }

  if(chars.length === 0){
    const empty = document.createElement('div');
    empty.className = 'no-results small';
    empty.innerHTML = `Sin resultados para “${(state.search[player]||'').replace(/</g,'&lt;')}”.<br>Prueba con otro nombre o pulsa “Ver todos”.`;
    wrap.appendChild(empty);
    return;
  }

  chars.forEach(ch => {
    const el = document.createElement('div'); el.className='char';
    el.innerHTML = `<img src="${ch.img}" alt=""><strong style="display:block;margin-top:6px">${ch.name}</strong>
                    <div class="classes">${ch.classes.join(', ')}</div>`;
    
    const inCurrentTeam = isCharInTeam(player, ch.id);
    
    if(disableP2) {
      el.style.opacity = '0.4';
      const badge = document.createElement('div'); 
      badge.style.position='absolute'; 
      badge.style.left='6px'; 
      badge.style.top='6px'; 
      badge.style.fontSize='12px'; 
      badge.className='small'; 
      badge.innerText='No disponible'; 
      el.appendChild(badge);
    } else if(inCurrentTeam) {
      const badge = document.createElement('div'); 
      badge.style.position='absolute'; 
      badge.style.left='6px'; 
      badge.style.top='6px'; 
      badge.style.fontSize='12px'; 
      badge.className='small';
      badge.style.background='rgba(124,58,237,0.8)';
      badge.style.padding='2px 6px';
      badge.style.borderRadius='4px';
      badge.innerText='En tu equipo'; 
      el.appendChild(badge);
      el.classList.add('selected');
      el.onclick = () => toggleSelectChar(player, ch.id);
    } else {
      el.onclick = () => toggleSelectChar(player, ch.id);
    }
    wrap.appendChild(el);
  });
}

function showClassMenu(player){
  const list = $(`${player}-list`); list.innerHTML='';
  CLASSES.forEach(c=>{
    const b = document.createElement('button'); b.className='class-btn'; b.textContent = c.label;
    b.onclick = () => { state.filter[player] = c.key; renderPanel(player); };
    list.appendChild(b);
  });
  const back = document.createElement('button'); back.className='back-btn'; back.innerText='← Volver'; back.onclick = ()=>{ setFilter(player, null); };
  list.appendChild(back);
}
function setFilter(player, cls){
  state.filter[player] = cls;
  if(cls === null) state.search[player] = '';   // "Ver todos" limpia también el buscador
  renderPanel(player);
}

function toggleSelectChar(player, id){
  // La rejilla de selección de personajes solo debe poder usarse durante la
  // fase de selección. Antes seguía siendo clicable durante la batalla (y en
  // el Modo Historia), permitiendo modificar el equipo a mitad de combate.
  if(state.phase !== 'select') return;
  const team = state.teams[player];
  const idx = team.findIndex(c => c.id === id);
  const maxTeam = 3;
  
  if(idx !== -1){ 
    team.splice(idx,1); 
  } else {
    if(team.length >= maxTeam) return;
    team.push(cloneCharacter(findBaseById(id)));
  }
  renderPanel('p1'); renderPanel('p2'); renderSlots('p1'); renderSlots('p2'); updateStartBtn(); updateInfoText();
}

function renderSlots(player){
  const container = $(`${player}-slots`); container.innerHTML = '';
  const team = state.teams[player];
  const maxSlots = 3;
  
  for(let i=0;i<maxSlots;i++){
    const slot = document.createElement('div'); slot.className='slot';
    if(team[i]){
      const img = document.createElement('img'); img.src = team[i].img; slot.appendChild(img);
      if(i === state.activeIndex[player]) slot.classList.add('active');
      if(team[i].hp <= 0) slot.classList.add('kod');
      slot.onclick = () => {
        if(state.phase === 'select'){
          if(team[i]) state.activeIndex[player] = i; renderSlots(player); updateArena();
        } else if(state.phase === 'battle'){
          // Solo se puede cambiar el personaje activo del propio equipo, y
          // únicamente durante el turno de ese jugador. Antes se podía pulsar
          // el banquillo de CUALQUIER equipo (incluido el rival o la IA) en
          // cualquier momento, cambiando su personaje activo sin permiso.
          if(state.turnOwner !== player) return;
          if(state.mode === 'pve' && player === 'p2') return; // la IA controla su propio equipo
          if(team[i] && i !== state.activeIndex[player] && team[i].hp > 0){ performSwap(player, i, false); }
        }
      };
    } else {
      slot.classList.add('empty'); slot.innerHTML = '<div class="small muted">Vacío</div>';
    }
    container.appendChild(slot);
  }
}

function updateStartBtn(){ 
  const maxTeam = 3;
  const ok = state.teams.p1.length === maxTeam && (state.mode==='pvp' ? state.teams.p2.length===maxTeam : true); 
  $('startBtn').disabled = !ok; 
}

function updateInfoText(){ 
  const maxTeam = 3;
  $('p1-info').innerText = `Seleccionados: ${state.teams.p1.length}/${maxTeam}`; 
  if(state.mode === 'pve'){
    $('p2-info').innerText = 'IA elegirá 3 personajes';
  } else {
    $('p2-info').innerText = `Seleccionados: ${state.teams.p2.length}/${maxTeam}`;
  }
}

/* arena update */
function updateArena(){
  ['p1','p2'].forEach(p=>{
    const team = state.teams[p]; const idx = state.activeIndex[p]; const active = team[idx];
    const imgEl = $(`fighter-img-${p}`); const hpBar = $(`hpbar-${p}`).querySelector('i');
    if(!active){ imgEl.src=''; hpBar.style.width='0%'; $(`stats-${p}`).innerHTML = '<small>Sin personaje</small>'; return; }
    imgEl.src = active.img; const percent = Math.max(0, Math.round((active.hp / active.maxHp) * 100)); hpBar.style.width = percent + '%';
    
    let stunIndicator = active.stunned > 0 ? ` 😵 STUN(${active.stunned})` : '';

    let statusIndicator = Array.isArray(active.statusEffects) && active.statusEffects.length
      ? ` · ${active.statusEffects.map(s => {
          const icon =
            s.status === 'burn' ? '🔥' :
            s.status === 'poison' ? '☠️' :
            s.status === 'bleed' ? '🩸' : '☠️';

          return `${icon} ${s.status}(${s.remaining})`;
        }).join(' ')}`
      : '';

    let controlIndicator = Array.isArray(active.controlEffects) && active.controlEffects.length
      ? ` · ${active.controlEffects.map(e => {
          const icon =
            e.type === 'freeze' ? '❄️' :
            e.type === 'charm' ? '💕' :
            e.type === 'fear' ? '😨' :
            e.type === 'slow' ? '🐌' : '⚠️';

          const value = e.type === 'slow' ? `-${Math.round(e.value)}% ` : '';
          return `${icon} ${value}${e.type}(${e.remaining})`;
        }).join(' ')}`
      : '';

    let debuffIndicator = Array.isArray(active.debuffEffects) && active.debuffEffects.length
      ? ` · ${active.debuffEffects.map(d => `⬇️${d.stat.toUpperCase()}-${d.value}(${d.remaining})`).join(' ')}`
      : '';

    $(`stats-${p}`).innerHTML =
      `<small>HP: ${active.hp}/${active.maxHp} · Escudo: ${active.shield} · ATK:${getEffectiveStat(active,'atk')} DEF:${getEffectiveStat(active,'def')} SPD:${getEffectiveStat(active,'spd')}${stunIndicator}${statusIndicator}${controlIndicator}${debuffIndicator}</small>`;
  });
  renderSlots('p1'); renderSlots('p2'); renderMovesArea();
}

/* start battle */
/* Compara la SPD efectiva (con buffs/debuffs/ralentizar) de los activos
   de cada equipo y decide quién abre la ronda. En empate, 50/50. */
function decideRoundInitiative(){
  const c1 = getActive('p1');
  const c2 = getActive('p2');
  const s1 = c1 ? getEffectiveStat(c1, 'spd') : 0;
  const s2 = c2 ? getEffectiveStat(c2, 'spd') : 0;
  return { owner: s1 > s2 ? 'p1' : (s2 > s1 ? 'p2' : (gameRandom() < 0.5 ? 'p1' : 'p2')), s1, s2 };
}

function startBattle(){
  state.mode = window.GAME_MODE || state.mode || 'pvp';
  const maxTeam = 3;

  if(state.mode === 'pve' && !state.storyMode && state.teams.p2.length < 3){
    const pool = CHARACTERS.filter(c => !state.bansEnabled || !isBanned(c.id));
    shuffleArray(pool);
    state.teams.p2 = [ cloneCharacter(pool[0]), cloneCharacter(pool[1]), cloneCharacter(pool[2]) ];
    log('IA eligió: ' + state.teams.p2.map(c=>c.name).join(', '));
    renderPanel('p2'); renderSlots('p2');
  }

  if(state.storyMode){
    if(state.teams.p1.length === 0 || state.teams.p2.length === 0){
      return alert('Error al preparar el combate de la historia.');
    }
  } else if(state.teams.p1.length !== maxTeam || state.teams.p2.length !== maxTeam) {
    return alert(`Ambos jugadores deben tener ${maxTeam} personajes.`);
  }
  
  state.phase = 'battle'; 
  state.activeIndex.p1 = 0; 
  state.activeIndex.p2 = 0;
  state.turnCount = 0;
  state.suddenDeath = false;

  // Una vez empieza la batalla, la rejilla de selección de personajes (y el
  // botón "Comenzar batalla") ya no deben estar visibles ni operativos:
  // de lo contrario se podía seguir añadiendo/quitando personajes del
  // equipo a mitad de combate y luego "reiniciar" la batalla desde cero
  // pulsando de nuevo el botón, con esos cambios aplicados.
  const selectorRow = document.querySelector('.selector-row');
  if(selectorRow) selectorRow.style.display = 'none';
  const startBtnEl = $('startBtn');
  if(startBtnEl) startBtnEl.style.display = 'none';

  state.roundActed = { p1: false, p2: false };
  const initiative = decideRoundInitiative();
  state.turnOwner = initiative.owner;
  log(`Comienza la batalla. Empieza ${(state.turnOwner==='p1'?'Jugador 1': (state.mode==='pve'?'IA':'Jugador 2'))} (SPD ${initiative.s1} vs ${initiative.s2}).`);
  
  startTurnActions(); 
  updateTurnInfo(); 
  updateArena();
  
  if(state.mode === 'pve' && state.turnOwner === 'p2') setTimeout(()=> aiTakeTurn(), 900);
}

/* start turn actions */
function startTurnActions(){
  state.turnCount++;

  // Verificar muerte súbita (el Modo Desafío la retrasa hasta el turno 100)
  const suddenDeathTurn = state.challengeMode ? SUDDEN_DEATH_TURN_CHALLENGE : SUDDEN_DEATH_TURN;
  if(state.turnCount >= suddenDeathTurn && !state.suddenDeath){
    state.suddenDeath = true;
    log('⚠️ ¡MUERTE SÚBITA ACTIVADA! Todos los personajes reciben 10 de daño por turno.');
  }

  // Aplicar daño de muerte súbita
  if(state.suddenDeath){
    ['p1','p2'].forEach(p => {
      state.teams[p].forEach(char => {
        if(char.hp > 0){
          const suddenDeathDmg = 10;

          if(char.shield > 0){
            const absorbed = Math.min(char.shield, suddenDeathDmg);
            char.shield -= absorbed;
            const remaining = suddenDeathDmg - absorbed;
            if(remaining > 0) char.hp = Math.max(0, char.hp - remaining);
          }else{
            char.hp = Math.max(0, char.hp - suddenDeathDmg);
          }
        }
      });
    });

    log(`💀 Muerte súbita: Todos reciben 10 de daño.`);
  }


  const p = state.turnOwner;
  const team = state.teams[p];

  // Si un DoT mata al personaje activo al comienzo de su turno,
  // se trae inmediatamente a otro personaje y el reemplazo conserva
  // el turno para poder actuar.
  while(true){
    const actor = getActive(p);
    if(!actor) return;

    processDamageOverTime(actor);

    if(actor.hp <= 0){
      processEndOfTurnEffects(actor);

      const aliveIdx = team.findIndex(c => c.hp > 0);
      if(aliveIdx !== -1){
        state.activeIndex[p] = aliveIdx;
        log(`${p==='p1'?'Jugador 1':(state.mode==='pve'?'IA':'Jugador 2')} trae a ${team[aliveIdx].name} al combate (reemplazo inmediato).`);
        updateArena();
        continue;
      }

      checkKO();
      return;
    }

    // Los cooldowns bajan al comenzar el turno del personaje que realmente actúa.
    actor.moves.forEach(m => {
      if(m.cd > 0) m.cd = Math.max(0, m.cd - 1);
    });

    // STUN
    if(actor.stunned > 0){
      log(`${actor.name} está aturdido y pierde su turno.`);
      endTurn(actor);
      return;
    }

    // CONGELAR
    if(hasControlEffect(actor, 'freeze')){
      log(`❄️ ${actor.name} está congelado y pierde su turno.`);
      endTurn(actor);
      return;
    }

    // MIEDO
    const fear = getControlEffect(actor, 'fear');
    if(fear){
      const failChance = Math.max(0, Math.min(1, Number(fear.failChance) || 0.5));

      if(gameRandom() < failChance){
        log(`😨 ${actor.name} está aterrorizado y no puede actuar este turno.`);
        endTurn(actor);
        return;
      }

      log(`😨 ${actor.name} supera el miedo y consigue actuar.`);
    }

    return;
  }
}
/* render moves */
function renderMovesArea(){
  const area = $('moves-area'); area.innerHTML='';
  if(state.phase !== 'battle'){ area.innerHTML = '<div class="small">Selecciona equipos para comenzar.</div>'; return; }
  
  const owner = state.turnOwner; const actor = getActive(owner); if(!actor) return;
  const title = document.createElement('div'); 
  title.innerHTML = `<strong>${owner==='p1'?'Jugador 1':(state.mode==='pve'?'IA':'Jugador 2')} — ${actor.name} (activo)</strong>`; 
  area.appendChild(title);
  
  actor.moves.forEach(m=>{
    const btn = document.createElement('button'); btn.className='move-btn';
    const nameClass = (m.type==='support' || (m.effect && (m.effect.type==='heal' || m.effect.type==='shield' || m.effect.type.startsWith('temp')))) ? 'support' : 'attack';
    btn.innerHTML = `<div><span class="move-name ${nameClass}">${m.name}</span><span style="float:right" class="cooldown-badge">${m.cd>0?('CD:'+m.cd):'Listo'}</span></div><div class="move-desc">${m.desc}</div>`;
    if(m.cd>0 || actor.hp<=0 || actor.stunned > 0 || (state.mode==='pve' && owner==='p2')) btn.disabled = true;
    btn.onclick = () => onUseMove(owner, m.id);
    area.appendChild(btn);
  });
  
  const swapBtn = document.createElement('button'); 
  swapBtn.className='swap-btn'; 
  swapBtn.innerText = '🔁 Cambiar personaje (no consume turno)'; 
  swapBtn.onclick = () => openSwapModal(owner); 
  area.appendChild(swapBtn);
}

function isCharmed(target){
  return hasControlEffect(target, 'charm');
}

function chooseRandomAlive(list){
  const alive = list.filter(c => c && c.hp > 0);
  if(alive.length === 0) return null;
  return alive[Math.floor(gameRandom() * alive.length)];
}

function getNormalMoveTargets(playerKey, actor, move){
  const enemyKey = playerKey === 'p1' ? 'p2' : 'p1';

  // Embelesado: los ataques se redirigen a un aliado aleatorio.
  if(isCharmed(actor) && move.type === 'attack'){
    const allies = getAliveChars(playerKey).filter(c => c !== actor);
    const target = chooseRandomAlive(allies) || actor;

    log(`💕 ${actor.name} está embelesado y ${move.name} se dirige contra ${target.name}.`);
    return [target];
  }

  if(move.aoe){
    // Personajes REALES vivos del equipo enemigo (no copias), para que el daño y los estados se apliquen de verdad.
    return getAliveChars(enemyKey);
  }

  const target = getActive(enemyKey);
  return target && target.hp > 0 ? [target] : [];
}

/* use move
   Envoltorio anti doble clic: onUseMove es asíncrono (espera la animación y,
   en habilidades de apoyo, el selector de objetivo), y durante esa espera el
   turno y el cooldown todavía no han cambiado. Sin este bloqueo, cada clic
   extra volvía a lanzar la habilidad completa. Solo se admite UNA acción a la
   vez; los clics repetidos se ignoran hasta que termina y el turno avanza. */
function lockMoveButtons(){
  const area = $('moves-area');
  if(area) area.querySelectorAll('button').forEach(b => { b.disabled = true; });
}

async function onUseMove(playerKey, moveId){
  if(state.moveLock) return;      // ya hay una acción en curso: ignorar clic
  state.moveLock = true;
  lockMoveButtons();              // feedback visual inmediato
  try{
    await resolveMove(playerKey, moveId);
  } finally {
    state.moveLock = false;
    // Repinta los botones con el estado real (si hubo una salida temprana o
    // un error, no se quedan bloqueados; si el turno pasó, ya estaban bien).
    if(state.phase === 'battle') renderMovesArea();
  }
}

async function resolveMove(playerKey, moveId){
  if(state.phase!=='battle') return;
  if(state.turnOwner !== playerKey) { alert('No es tu turno'); return; }

  const actor = getActive(playerKey);
  if(!actor) return;

  // Estos controles ya se resuelven normalmente al iniciar el turno,
  // pero se conserva la comprobación por seguridad.
  if(actor.stunned > 0){
    alert('Tu personaje está aturdido y no puede actuar.');
    return;
  }

  if(hasControlEffect(actor, 'freeze')){
    alert('Tu personaje está congelado y no puede actuar.');
    return;
  }

  const enemyKey = playerKey==='p1' ? 'p2' : 'p1';
  const move = actor.moves.find(m=>m.id===moveId);
  if(!move) return;

  if(move.cd>0) { alert('Habilidad en cooldown'); return; }

  await animateAttack(playerKey);
  if(state.phase !== 'battle') return;   // la batalla terminó/se abandonó durante la animación

  if(move.acc && gameRandom() > move.acc){
    log(`${actor.name} intentó ${move.name}... ¡Falló!`);
    if(move.baseCooldown) move.cd = move.baseCooldown;
    endTurn(actor);
    return;
  }

  // El cooldown se aplica antes de resolver los efectos: así, pase lo que pase
  // al aplicarlos, la habilidad nunca queda disponible para usarse sin límite.
  if(move.baseCooldown && move.baseCooldown > 0){
    move.cd = move.baseCooldown;
  }

  const effects = getMoveEffects(move);

  // Una habilidad de ataque nunca se convierte en buff solo porque tenga
  // un efecto secundario como robo de vida, crítico o reflejo.
  const isSupport = isSupportMove(move);

  if(isSupport){
    const targets = getAliveTeam(playerKey);
    const chosen = await openTargetModal(playerKey, targets);
    const targetChar = chosen == null ? actor : state.teams[playerKey][chosen];

    effects.forEach(e =>
      applyEffect(actor, targetChar, { ...move, effect: e })
    );
  }else{
    // Efectos ofensivos que pertenecen al propio ataque se aplican antes
    // del golpe. Así el mismo ataque puede robar vida, aumentar crítico
    // o activar reflejo sin abrir un selector de aliados.
    effects.forEach(e => {
      if(e.type === 'lifesteal' || e.type === 'critChance' || e.type === 'reflectDamage'){
        applySpecialEffect(actor, actor, e);
      }
    });

    const targets = getNormalMoveTargets(playerKey, actor, move);

    targets.forEach(target => {
      if(move.power && move.power > 0){
        applyDamage(actor, target, move);
      }

      effects.forEach(e => {
        if(
          e.type === 'lifesteal' ||
          e.type === 'critChance' ||
          e.type === 'reflectDamage'
        ){
          return;
        }

        if(e.type === 'debuff'){
          applyDebuff(actor, target, e);
        }else if(
          e.type === 'stun' ||
          e.type === 'freeze' ||
          e.type === 'charm' ||
          e.type === 'fear' ||
          e.type === 'slow' ||
          e.type === 'healReduction' ||
          e.type === 'damageOverTime'
        ){
          applyStatusEffect(actor, target, e);
        }
      });
    });
  }

  if(move.baseCooldown && move.baseCooldown>0){
    move.cd = move.baseCooldown;
  }

  updateArena();
  if(checkKO()) return;

  endTurn(actor);
}

/* apply effects - CORREGIDO PARA EVITAR DUPLICACIÓN */
function applyEffect(actor, target, move) {
  if (!move.effect && !move.effects) return;

  // Los llamadores pasan { ...move, effect: e } para aplicar UN solo efecto.
  // Como el spread conserva también move.effects (el array completo), antes
  // se aplicaban TODOS los efectos de la habilidad una vez por cada efecto:
  // curas, escudos y buffs salían duplicados en habilidades con 2+ efectos.
  // Por eso, si viene un 'effect' suelto, manda sobre 'effects'.
  const effects = move.effect ? [move.effect] : (move.effects || []);

  for (const e of effects) {
    if (e.type === 'heal') {
      applyHealing(actor, target, e.value, move.name);
    }

    else if (e.type === 'shield') {
      target.shield += e.value;
      log(`${actor.name} otorgó ${e.value} de escudo a ${target.name}.`);
    }

    else if (e.type === 'tempDef') {
      // CORREGIDO: Verificar si ya existe un efecto tempDef activo
      const existingEffect = target.tempEffects.find(eff => eff.type === 'tempDef');
      if(existingEffect){
        // Refrescar duración sin duplicar el valor
        existingEffect.remaining = e.duration;
        log(`${actor.name} refrescó el buff de DEF de ${target.name} (${e.value}) por ${e.duration} turnos.`);
      } else {
        // Aplicar nuevo buff
        target.tempDef = (target.tempDef||0) + e.value;
        target.tempEffects.push({ type:'tempDef', value: e.value, remaining: e.duration });
        log(`${actor.name} aumentó DEF de ${target.name} en ${e.value} por ${e.duration} turnos.`);
      }
    }

    else if (e.type === 'tempSpd') {
      const existingEffect = target.tempEffects.find(eff => eff.type === 'tempSpd');
      if(existingEffect){
        existingEffect.remaining = e.duration;
        log(`${actor.name} refrescó el buff de SPD de ${target.name} (${e.value}) por ${e.duration} turnos.`);
      } else {
        target.tempSpd = (target.tempSpd||0) + e.value;
        target.tempEffects.push({ type:'tempSpd', value: e.value, remaining: e.duration });
        log(`${actor.name} aumentó SPD de ${target.name} en ${e.value} por ${e.duration} turnos.`);
      }
    }

    else if (e.type === 'tempAtk') {
      const existingEffect = target.tempEffects.find(eff => eff.type === 'tempAtk');
      if(existingEffect){
        existingEffect.remaining = e.duration;
        log(`${actor.name} refrescó el buff de ATK de ${target.name} (${e.value}) por ${e.duration} turnos.`);
      } else {
        target.tempAtk = (target.tempAtk||0) + e.value;
        target.tempEffects.push({ type:'tempAtk', value: e.value, remaining: e.duration });
        log(`${actor.name} aumentó ATK de ${target.name} en ${e.value} por ${e.duration} turnos.`);
      }
    }

    else if (e.type === 'selfHealPct') {
      const amount = Math.round(actor.maxHp * (e.value||0));
      applyHealing(actor, actor, amount, move.name);
    }

    else if (
      e.type === 'lifesteal' ||
      e.type === 'reflectDamage' ||
      e.type === 'critChance' ||
      e.type === 'healReduction'
    ) {
      applySpecialEffect(actor, target, e);
    }
  }
}

function getMoveEffects(move){
  if(!move) return [];
  if(Array.isArray(move.effects)) return move.effects;
  if(move.effect) return [move.effect];
  return [];
}

function isSupportMove(move){
  if(!move) return false;

  // El tipo de la habilidad manda. Una habilidad de ataque puede llevar
  // efectos como robo de vida, crítico o reflejo y seguir atacando.
  return move.type === 'support' && !(Number(move.power) > 0);
}

function moveHasTargetableEffect(move){
  const effects = getMoveEffects(move);
  return isSupportMove(move) && effects.some(e => e && (
    e.type === 'heal' ||
    e.type === 'shield' ||
    (typeof e.type === 'string' && e.type.startsWith('temp')) ||
    e.type === 'selfHealPct' ||
    e.type === 'lifesteal' ||
    e.type === 'reflectDamage' ||
    e.type === 'critChance'
  ));
}


function getDebuffTotal(target, stat){
  if(!target || !Array.isArray(target.debuffEffects)) return 0;
  return target.debuffEffects
    .filter(e => e.stat === stat)
    .reduce((sum, e) => sum + Math.max(0, Number(e.value) || 0), 0);
}

function getEffectiveStat(target, stat){
  if(!target) return 0;

  const base = Number(target[stat]) || 0;
  const buff =
    stat === 'atk' ? (target.tempAtk || 0) :
    stat === 'def' ? (target.tempDef || 0) :
    stat === 'spd' ? (target.tempSpd || 0) : 0;

  const debuff = getDebuffTotal(target, stat);
  let value = Math.max(1, base + buff - debuff);

  // Ralentizar reduce la SPD final en porcentaje.
  if(stat === 'spd'){
    const slowPercent = getSlowPercent(target);
    if(slowPercent > 0){
      value = Math.max(1, Math.round(value * (1 - slowPercent / 100)));
    }
  }

  return value;
}

function normalizePercentValue(value){
  let n = Number(value);
  if(!Number.isFinite(n)) return 0;
  if(n > 0 && n <= 1) n *= 100;
  return Math.max(0, Math.min(100, n));
}

function getSpecialEffect(target, type){
  if(!target || !Array.isArray(target.specialEffects)) return null;
  return target.specialEffects.find(e => e.type === type) || null;
}

function getSpecialEffectPercent(target, type){
  const effect = getSpecialEffect(target, type);
  return effect ? normalizePercentValue(effect.value) : 0;
}

function getLifestealPercent(target){
  return getSpecialEffectPercent(target, 'lifesteal');
}

function getReflectDamagePercent(target){
  return getSpecialEffectPercent(target, 'reflectDamage');
}

function getCritChance(target){
  const bonus = getSpecialEffectPercent(target, 'critChance');
  return Math.max(0, Math.min(1, BASE_CRIT_CHANCE + bonus / 100));
}

function getHealReductionPercent(target){
  return getSpecialEffectPercent(target, 'healReduction');
}

function upsertSpecialEffect(actor, target, effect){
  if(!target || !effect) return;
  if(!Array.isArray(target.specialEffects)) target.specialEffects = [];

  const duration = Math.max(1, Number(effect.duration) || 1);
  const value = normalizePercentValue(effect.value);
  if(value <= 0) return;

  const existing = target.specialEffects.find(e => e.type === effect.type);
  if(existing){
    existing.value = Math.max(normalizePercentValue(existing.value), value);
    existing.remaining = Math.max(existing.remaining, duration);
  }else{
    target.specialEffects.push({
      type: effect.type,
      value,
      remaining: duration
    });
  }

  const label =
    effect.type === 'lifesteal' ? `🩸 Robo de vida +${value}%` :
    effect.type === 'reflectDamage' ? `↩️ Reflejo de daño ${value}%` :
    effect.type === 'critChance' ? `🎯 Prob. crítico +${value}%` :
    effect.type === 'healReduction' ? `🚫 Curación recibida -${value}%` :
    effect.type;

  log(`${actor.name} aplicó ${label} a ${target.name} durante ${duration} turno(s).`);
}

function applySpecialEffect(actor, target, effect){
  if(!target || target.hp <= 0 || !effect) return;

  const prob = effect.prob == null
    ? 1
    : Math.max(0, Math.min(1, Number(effect.prob) || 0));

  if(gameRandom() > prob){
    log(`${actor.name} intentó aplicar ${effect.type}, pero no surtió efecto sobre ${target.name}.`);
    return;
  }

  upsertSpecialEffect(actor, target, effect);
}

function applyHealing(actor, target, amount, sourceName='curación'){
  if(!target || target.hp <= 0) return 0;

  const requested = Math.max(0, Math.round(Number(amount) || 0));
  if(requested <= 0) return 0;

  const reduction = getHealReductionPercent(target);
  const afterReduction = Math.max(0, Math.round(requested * (1 - reduction / 100)));
  const healed = Math.min(target.maxHp - target.hp, afterReduction);
  target.hp += healed;

  if(reduction > 0){
    log(`${actor.name} usó ${sourceName} sobre ${target.name}: ${healed} HP recuperados (curación reducida ${reduction}%).`);
  }else{
    log(`${actor.name} usó ${sourceName} sobre ${target.name} y curó ${healed} HP.`);
  }

  return healed;
}

function processSpecialEffects(target){
  if(!target || !Array.isArray(target.specialEffects)) return;

  target.specialEffects = target.specialEffects.filter(effect => {
    effect.remaining -= 1;
    if(effect.remaining <= 0){
      const label =
        effect.type === 'lifesteal' ? 'Robo de vida' :
        effect.type === 'reflectDamage' ? 'Reflejo de daño' :
        effect.type === 'critChance' ? 'Probabilidad de crítico' :
        effect.type === 'healReduction' ? 'Reducción de curación' :
        effect.type;
      log(`${label} terminó en ${target.name}.`);
      return false;
    }
    return true;
  });
}

function applyReflectedDamage(source, target, amount){
  if(!source || !target || target.hp <= 0 || amount <= 0) return;

  // El reflejo no vuelve a reflejarse y tampoco activa robo de vida.
  let reflected = Math.max(0, Math.round(amount));

  if(target.shield > 0){
    const absorbed = Math.min(target.shield, reflected);
    target.shield -= absorbed;
    reflected -= absorbed;
  }

  if(reflected > 0){
    target.hp = Math.max(0, target.hp - reflected);
  }
}

function applyDebuff(actor, target, effect){
  if(!actor || !target || target.hp <= 0 || !effect) return;

  const stat = effect.stat;
  if(!['atk', 'def', 'spd'].includes(stat)) return;

  const prob = effect.prob == null ? 1 : effect.prob;
  if(gameRandom() > prob){
    log(`${actor.name} intentó reducir ${stat.toUpperCase()} de ${target.name}, pero no surtió efecto.`);
    return;
  }

  const value = Math.max(0, Number(effect.value) || 0);
  const duration = Math.max(1, Number(effect.duration) || 1);
  if(value <= 0) return;

  if(!Array.isArray(target.debuffEffects)) target.debuffEffects = [];

  const existing = target.debuffEffects.find(e => e.stat === stat);

  if(existing){
    // El mismo debuff no se acumula indefinidamente: conserva el valor más alto
    // y refresca hasta la duración más larga.
    existing.value = Math.max(existing.value, value);
    existing.remaining = Math.max(existing.remaining, duration);
    log(`${actor.name} refrescó ${stat.toUpperCase()} -${existing.value} en ${target.name} por ${existing.remaining} turno(s).`);
  }else{
    target.debuffEffects.push({
      type: 'debuff',
      stat,
      value,
      remaining: duration
    });
    log(`${actor.name} redujo ${stat.toUpperCase()} de ${target.name} en ${value} durante ${duration} turno(s).`);
  }
}

function getStatusLabel(status){
  const labels = {
    burn: '🔥 quemadura',
    poison: '☠️ veneno',
    bleed: '🩸 sangrado',
    freeze: '❄️ congelado',
    charm: '💕 embelesado',
    fear: '😨 miedo',
    slow: '🐌 ralentizado',
    stun: '😵 aturdido'
  };
  return labels[status] || `☠️ ${status}`;
}

function getControlEffect(target, type){
  if(!target || !Array.isArray(target.controlEffects)) return null;
  return target.controlEffects.find(e => e.type === type) || null;
}

function hasControlEffect(target, type){
  return !!getControlEffect(target, type);
}

function getSlowPercent(target){
  const effects = Array.isArray(target?.controlEffects)
    ? target.controlEffects.filter(e => e.type === 'slow')
    : [];

  if(effects.length === 0) return 0;

  return Math.max(...effects.map(e => {
    const value = Number(e.value) || 0;
    // Acepta 30 para 30% y también 0.30 para 30%.
    return Math.max(0, Math.min(90, value <= 1 ? value * 100 : value));
  }));
}

function upsertControlEffect(actor, target, effect){
  if(!target || target.hp <= 0 || !effect) return false;

  if(!Array.isArray(target.controlEffects)) target.controlEffects = [];

  const type = effect.type;
  const duration = Math.max(1, Number(effect.duration) || 1);

  if(!['freeze', 'charm', 'fear', 'slow'].includes(type)) return false;

  const existing = target.controlEffects.find(e => e.type === type);

  if(type === 'slow'){
    const rawValue = Number(effect.value);
    const value = Math.max(
      0,
      Math.min(90, Number.isFinite(rawValue) ? (rawValue <= 1 ? rawValue * 100 : rawValue) : 0)
    );

    if(value <= 0) return false;

    if(existing){
      existing.value = Math.max(Number(existing.value) || 0, value);
      existing.remaining = Math.max(existing.remaining, duration);
      log(`${actor.name} refrescó Ralentizar en ${target.name}: -${existing.value}% SPD durante ${existing.remaining} turno(s).`);
    }else{
      target.controlEffects.push({
        type: 'slow',
        value,
        remaining: duration
      });
      log(`${actor.name} ralentizó a ${target.name}: -${value}% SPD durante ${duration} turno(s).`);
    }

    return true;
  }

  if(type === 'fear'){
    const rawChance = effect.failChance ?? effect.value ?? 0.5;
    const failChance = Math.max(
      0,
      Math.min(1, Number(rawChance) > 1 ? Number(rawChance) / 100 : Number(rawChance))
    );

    if(existing){
      existing.failChance = Math.max(existing.failChance ?? 0.5, failChance);
      existing.remaining = Math.max(existing.remaining, duration);
      log(`${actor.name} refrescó Miedo en ${target.name} durante ${existing.remaining} turno(s).`);
    }else{
      target.controlEffects.push({
        type: 'fear',
        failChance,
        remaining: duration
      });
      log(`${actor.name} provocó Miedo en ${target.name} durante ${duration} turno(s).`);
    }

    return true;
  }

  if(existing){
    existing.remaining = Math.max(existing.remaining, duration);
    log(`${actor.name} refrescó ${getStatusLabel(type)} en ${target.name} por ${existing.remaining} turno(s).`);
  }else{
    target.controlEffects.push({
      type,
      remaining: duration
    });
    log(`${actor.name} aplicó ${getStatusLabel(type)} a ${target.name} por ${duration} turno(s).`);
  }

  return true;
}

function applyControlEffect(actor, target, effect){
  if(!target || target.hp <= 0 || !effect) return;

  const prob = effect.prob == null ? 1 : Math.max(0, Math.min(1, Number(effect.prob) || 0));
  if(gameRandom() > prob){
    log(`${actor.name} intentó aplicar ${getStatusLabel(effect.type)} a ${target.name}, pero no surtió efecto.`);
    return;
  }

  upsertControlEffect(actor, target, effect);
}

function applyStatusEffect(actor, target, effect){
  if(!target || target.hp <= 0 || !effect) return;
  if(!getKeyOfTarget(target)) return;

  if(effect.type === 'healReduction'){
    applySpecialEffect(actor, target, effect);
    return;
  }

  const prob = effect.prob == null ? 1 : Math.max(0, Math.min(1, Number(effect.prob) || 0));

  if(effect.type === 'stun'){
    if(gameRandom() > prob){
      log(`${actor.name} intentó aturdir a ${target.name}, pero no surtió efecto.`);
      return;
    }

    const duration = Math.max(1, Number(effect.duration) || 1);

    // El stun no se acumula infinitamente: conserva la duración mayor.
    target.stunned = Math.max(target.stunned || 0, duration);

    log(`${actor.name} aturdió a ${target.name} por ${duration} turno(s)!`);
    return;
  }

  if(['freeze', 'charm', 'fear', 'slow'].includes(effect.type)){
    applyControlEffect(actor, target, effect);
    return;
  }

  if(effect.type === 'damageOverTime'){
    const status = effect.status || 'burn';
    const value = Math.max(0, Number(effect.value) || 0);
    const duration = Math.max(1, Number(effect.duration) || 1);

    if(value <= 0) return;

    if(!Array.isArray(target.statusEffects)) target.statusEffects = [];

    const existing = target.statusEffects.find(
      s => s.type === 'damageOverTime' && s.status === status
    );

    if(existing){
      // Refrescar sin permitir acumulaciones infinitas del mismo DoT.
      existing.value = Math.max(existing.value, value);
      existing.remaining = Math.max(existing.remaining, duration);
      log(`${actor.name} refrescó ${getStatusLabel(status)} en ${target.name}: ${existing.value} daño durante ${existing.remaining} turno(s).`);
    }else{
      target.statusEffects.push({
        type: 'damageOverTime',
        status,
        value,
        remaining: duration
      });
      log(`${actor.name} aplicó ${getStatusLabel(status)} a ${target.name}: ${value} daño durante ${duration} turno(s).`);
    }
  }
}

function applyStatusDamage(target, amount, status){
  if(!target || target.hp <= 0) return;

  let damage = Math.max(0, Math.round(amount));
  if(damage <= 0) return;

  // El escudo también protege contra daño continuo.
  if(target.shield > 0){
    const absorbed = Math.min(target.shield, damage);
    target.shield -= absorbed;
    damage -= absorbed;
    if(absorbed > 0){
      log(`${target.name} absorbió ${absorbed} de ${getStatusLabel(status)} con su escudo.`);
    }
  }

  if(damage > 0){
    target.hp = Math.max(0, target.hp - damage);
    log(`${target.name} recibió ${damage} de daño por ${getStatusLabel(status)}.`);
  }
}

function processDamageOverTime(target){
  if(!target || target.hp <= 0 || !Array.isArray(target.statusEffects)) return;

  target.statusEffects = target.statusEffects.filter(status => {
    if(status.type !== 'damageOverTime') return true;

    const damage = Math.max(0, Number(status.value) || 0);
    applyStatusDamage(target, damage, status.status);

    status.remaining -= 1;

    if(status.remaining <= 0){
      log(`${getStatusLabel(status.status)} terminó en ${target.name}.`);
      return false;
    }

    return target.hp > 0;
  });
}

function processDebuffs(target){
  if(!target || !Array.isArray(target.debuffEffects)) return;

  target.debuffEffects = target.debuffEffects.filter(effect => {
    effect.remaining -= 1;

    if(effect.remaining <= 0){
      log(`Debuff de ${effect.stat.toUpperCase()} terminó en ${target.name}.`);
      return false;
    }

    return true;
  });
}

function processControlEffects(target){
  if(!target || !Array.isArray(target.controlEffects)) return;

  target.controlEffects = target.controlEffects.filter(effect => {
    effect.remaining -= 1;

    if(effect.remaining <= 0){
      log(`${getStatusLabel(effect.type)} terminó en ${target.name}.`);
      return false;
    }

    return true;
  });
}

function processTempEffects(target){
  if(!target || !Array.isArray(target.tempEffects)) return;

  target.tempEffects = target.tempEffects.filter(e => {
    e.remaining -= 1;

    if(e.remaining <= 0){
      if(e.type === 'tempDef') target.tempDef = Math.max(0, (target.tempDef || 0) - e.value);
      if(e.type === 'tempSpd') target.tempSpd = Math.max(0, (target.tempSpd || 0) - e.value);
      if(e.type === 'tempAtk') target.tempAtk = Math.max(0, (target.tempAtk || 0) - e.value);
      return false;
    }

    return true;
  });
}

function processEndOfTurnEffects(target){
  if(!target || target.hp <= 0) return;

  // Los efectos se reducen al terminar el turno del afectado.
  // Así duration: 1 significa un turno completo de efecto.
  if(target.stunned > 0){
    target.stunned = Math.max(0, target.stunned - 1);
  }

  processDebuffs(target);
  processControlEffects(target);
  processTempEffects(target);
  processSpecialEffects(target);
}

/* apply damage */
function applyDamage(actor, target, move){
  if(!target) return;
  // Solo se daña a personajes reales de un equipo (nunca a copias sueltas).
  if(!getKeyOfTarget(target)) return;

  const effectiveAtk = getEffectiveStat(actor, 'atk');
  const effectiveDef = getEffectiveStat(target, 'def');

  let damage = Math.round(move.power * (effectiveAtk / effectiveDef));
  damage = Math.max(0, Math.round(damage * DAMAGE_MULT));

  const critChance = getCritChance(actor);
  let isCrit = false;

  if(gameRandom() < critChance){
    damage = Math.round(damage * 1.5);
    isCrit = true;
  }

  if(target.shield>0){
    const prev = target.shield;
    const after = Math.max(0, prev - damage);
    const absorbed = prev - after;
    damage = Math.max(0, damage - absorbed);
    target.shield = after;
    log(`${target.name} absorbió ${absorbed} con su escudo.`);
  }

  const variance = 0.85 + gameRandom()*0.3;
  damage = Math.max(0, Math.round(damage * variance));

  const hpBefore = target.hp;
  target.hp = Math.max(0, target.hp - damage);
  const hpDamage = Math.max(0, hpBefore - target.hp);

  if(isCrit){
    log(`⚡ ¡Golpe CRÍTICO! ${actor.name} usó ${move.name} y causó ${hpDamage} a ${target.name}.`);
  } else {
    log(`${actor.name} usó ${move.name} y causó ${hpDamage} a ${target.name}.`);
  }

  // El robo de vida usa únicamente el daño que realmente quitó HP.
  const lifestealPercent = getLifestealPercent(actor);
  if(lifestealPercent > 0 && hpDamage > 0 && actor.hp > 0){
    const healAmount = Math.round(hpDamage * lifestealPercent / 100);
    const healed = applyHealing(actor, actor, healAmount, 'Robo de vida');
    if(healed > 0){
      log(`🩸 ${actor.name} recuperó ${healed} HP mediante robo de vida.`);
    }
  }

  // El reflejo usa el daño de HP y no vuelve a reflejarse.
  const reflectPercent = getReflectDamagePercent(target);
  if(reflectPercent > 0 && hpDamage > 0 && actor.hp > 0){
    const reflected = Math.round(hpDamage * reflectPercent / 100);
    if(reflected > 0){
      applyReflectedDamage(target, actor, reflected);
      log(`↩️ ${target.name} reflejó ${reflected} de daño a ${actor.name}.`);
    }
  }

  flashHit(getKeyOfTarget(target));
}

/* swap */
function performSwap(player, newIndex, consumeTurn=false){
  const team = state.teams[player];
  if(!team[newIndex]) return;
  if(team[newIndex].hp <= 0) return;

  const oldIndex = state.activeIndex[player];
  if(oldIndex === newIndex) return;

  const oldActor = team[oldIndex];
  state.activeIndex[player] = newIndex;

  log(`${player==='p1'?'Jugador 1': (state.mode==='pve'?'IA':'Jugador 2')} cambió a ${team[newIndex].name}${consumeTurn ? ' (consumió turno)' : ''}.`);

  updateArena();

  if(consumeTurn){
    endTurn(oldActor);
  }
}

/* end turn */
function endTurn(finishedActor = null){
  const actor = finishedActor || (state.turnOwner ? getActive(state.turnOwner) : null);

  if(actor){
    processEndOfTurnEffects(actor);
  }

  // Marca que este jugador ya actuó en la ronda en curso.
  if(!state.roundActed) state.roundActed = { p1: false, p2: false };
  state.roundActed[state.turnOwner] = true;

  if(state.roundActed.p1 && state.roundActed.p2){
    // Ronda completa: se reevalúa la iniciativa según la SPD efectiva actual
    // (buffs, ralentizar, etc. ya cuentan, no solo la del inicio de la batalla).
    state.roundActed.p1 = false;
    state.roundActed.p2 = false;
    const prevOwner = state.turnOwner;
    const initiative = decideRoundInitiative();
    state.turnOwner = initiative.owner;
    if(state.turnOwner !== prevOwner){
      log(`⚡ Nueva ronda: ${(state.turnOwner==='p1'?'Jugador 1':(state.mode==='pve'?'IA':'Jugador 2'))} es más rápido (SPD ${initiative.s1} vs ${initiative.s2}) y toma la iniciativa.`);
    }
  } else {
    state.turnOwner = (state.turnOwner==='p1') ? 'p2' : 'p1';
  }

  startTurnActions();
  updateTurnInfo();
  updateArena();

  if(state.mode==='pve' && state.turnOwner==='p2'){
    setTimeout(()=> aiTakeTurn(), 900);
  }
}

/* helpers */
function getActive(player){ return state.teams[player][state.activeIndex[player]]; }
function getKeyOfTarget(target){ 
  for(const p of ['p1','p2']){ 
    const team = state.teams[p]; 
    for(let i=0;i<team.length;i++) 
      if(team[i]===target) return p; 
  } 
  return null; 
}
// Devuelve los objetos de personaje reales (no copias) que siguen vivos.
function getAliveChars(player){ return state.teams[player].filter(c => c && c.hp > 0); }
function getAliveTeam(player){ return state.teams[player].map((c,idx)=>({ idx, name:c.name, hp:c.hp, alive:c.hp>0 })); }

function checkKO(){
  for(const p of ['p1','p2']){ 
    const allDead = state.teams[p].every(ch=>ch.hp<=0); 
    if(allDead){ 
      log(`--- ${(p==='p1'?(state.mode==='pve'?'IA':'Jugador 2'):'Jugador 1')} gana la batalla! ---`); 
      state.phase='ended'; 
      $('moves-area').innerHTML = '<div class="small">Batalla finalizada.</div>'; 
      updateTurnInfo(); 
      if(state.storyMode){
        setTimeout(() => onStoryBattleEnd(p === 'p2' ? 'win' : 'lose'), 1400);
      }
      return true; 
    } 
  }
  
  {
    for(const p of ['p1','p2']){ 
      const team = state.teams[p]; 
      const idx = state.activeIndex[p]; 
      if(team[idx].hp <= 0){ 
        const aliveIdx = team.findIndex(c=>c.hp>0); 
        if(aliveIdx !== -1){ 
          state.activeIndex[p] = aliveIdx; 
          log(`${p==='p1'?'Jugador 1': (state.mode==='pve'?'IA':'Jugador 2')} trae a ${team[aliveIdx].name} al combate (auto).`); 
        } 
      } 
    }
  }
  
  return false;
}

/* modals */
function openSwapModal(player){ 
  const team = state.teams[player]; 
  const modal = createModal(); 
  const card = modal.querySelector('.modal-card'); 
  card.innerHTML = `<h3>Cambiar personaje — ${player==='p1'?'Jugador 1': (state.mode==='pve'?'IA':'Jugador 2')}</h3><div class="small">Elige uno (no consume turno).</div>`; 
  const list = document.createElement('div'); 
  list.className='flex'; 
  list.style.marginTop='10px';
  
  team.forEach((ch,idx)=>{ 
    const node = document.createElement('div'); 
    node.style.marginRight='8px'; 
    node.innerHTML = `<div style="width:88px;height:88px;border-radius:8px;background:#081223;display:flex;align-items:center;justify-content:center;cursor:pointer">${ch.hp>0?`<img src="${ch.img}" style="max-width:80px;max-height:80px">`:' <div class="small muted">KO</div>'}</div><div style="text-align:center;margin-top:6px">${ch.name}</div>`; 
    node.onclick = ()=>{ 
      if(ch.hp<=0) return; 
      performSwap(player, idx, false); 
      closeModal(); 
    }; 
    list.appendChild(node); 
  }); 
  card.appendChild(list); 
  const closeBtn = document.createElement('div'); 
  closeBtn.className='class-btn'; 
  closeBtn.style.marginTop='10px'; 
  closeBtn.innerText='Cerrar'; 
  closeBtn.onclick = closeModal; 
  card.appendChild(closeBtn); 
}

function openTargetModal(player, targets){ 
  return new Promise(res=>{ 
    const modal = createModal(); 
    const card = modal.querySelector('.modal-card'); 
    card.innerHTML = `<h3>Seleccionar objetivo</h3><div class="small">Elige a quién aplicar la habilidad</div>`; 
    const list = document.createElement('div'); 
    list.className='flex'; 
    list.style.marginTop='10px'; 
    targets.forEach(t=>{ 
      const node = document.createElement('div'); 
      node.style.marginRight='8px'; 
      const ch = state.teams[player][t.idx]; 
      node.innerHTML = `<div style="width:88px;height:88px;border-radius:8px;background:#081223;display:flex;align-items:center;justify-content:center;cursor:pointer">${ch.hp>0?`<img src="${ch.img}" style="max-width:80px;max-height:80px">`:'<div class="small muted">KO</div>'}</div><div style="text-align:center;margin-top:6px">${ch.name}</div>`; 
      node.onclick = ()=>{ 
        if(!ch || ch.hp<=0) return; 
        res(t.idx); 
        closeModal(); 
      }; 
      list.appendChild(node); 
    }); 
    card.appendChild(list); 
    const cancel = document.createElement('div'); 
    cancel.className='class-btn'; 
    cancel.style.marginTop='10px'; 
    cancel.innerText='Cancelar (aplicar a sí mismo)'; 
    cancel.onclick = ()=>{ 
      res(null); 
      closeModal(); 
    }; 
    card.appendChild(cancel); 
  }); 
}

function createModal(){ 
  const container = $('modal'); 
  container.style.display='flex'; 
  container.innerHTML = `<div class="modal"><div class="modal-card"></div></div>`; 
  return container; 
}

function closeModal(){ 
  const container = $('modal'); 
  container.style.display='none'; 
  container.innerHTML=''; 
}

/* anims */
function animateAttack(player){ 
  return new Promise(res=>{ 
    const img = $(`fighter-img-${player}`); 
    const dir = player==='p1'?1:-1; 
    img.style.transform = `translateX(${30*dir}px)`; 
    setTimeout(()=>{ 
      img.style.transform = `translateX(0px)`; 
      setTimeout(res,300); 
    },350); 
  }); 
}

function flashHit(playerKey){ 
  if(!playerKey) return;
  const img = $(`fighter-img-${playerKey}`); 
  if(!img) return;
  img.style.filter = 'brightness(1.6) saturate(1.6) hue-rotate(-20deg)'; 
  setTimeout(()=>{ 
    img.style.filter = ''; 
  },300); 
}

/* ui helpers */
function updateTurnInfo(){ 
  let turnText = state.phase==='select' ? 'Turno: selección' : 
                 state.phase==='battle' ? `Turno ${state.turnCount}: ${(state.turnOwner==='p1' ? 'Jugador 1' : (state.mode==='pve'?'IA':'Jugador 2'))}` : 
                 'Batalla finalizada';
  
  if(state.suddenDeath){
    turnText += ' ⚠️ MUERTE SÚBITA';
  }
  
  $('turnInfo').innerText = turnText;
}

/* AI logic (balanced) */
/* IA táctica */
function aiGetMoveEffects(move){
  return getMoveEffects(move);
}

function aiIsSupportMove(move){
  return isSupportMove(move);
}

function aiEstimateDamage(actor, target, move){
  if(!actor || !target || !move || !move.power || move.power <= 0) return 0;

  const atk = getEffectiveStat(actor, 'atk');
  const def = getEffectiveStat(target, 'def');
  if(def <= 0) return move.power * DAMAGE_MULT;

  return Math.max(0, move.power * (atk / def) * DAMAGE_MULT);
}

function aiEffectBonus(actor, target, move){
  const effects = aiGetMoveEffects(move);
  let score = 0;

  for(const e of effects){
    if(!e) continue;

    if(e.type === 'debuff'){
      const stat = e.stat;
      const current = stat && target ? getEffectiveStat(target, stat) : 0;
      const value = Math.max(0, Number(e.value) || 0);

      if(stat === 'atk'){
        score += current > 0 ? 12 + value * 0.7 : 5;
      }else if(stat === 'def'){
        score += current > 0 ? 15 + value * 0.8 : 5;
      }else if(stat === 'spd'){
        score += current > 0 ? 10 + value * 0.7 : 4;
      }
    }

    if(e.type === 'stun') score += 42;
    if(e.type === 'freeze') score += 48;
    if(e.type === 'charm') score += 35;
    if(e.type === 'fear') score += 27;
    if(e.type === 'slow') score += 16;

    if(e.type === 'damageOverTime'){
      const status = e.status || 'dot';
      const already = Array.isArray(target?.statusEffects) &&
        target.statusEffects.some(s => s.status === status && s.remaining > 0);

      score += already ? 5 : 17;
      score += Math.min(18, (Number(e.value) || 0) * 0.8);
    }

    if(e.type === 'lifesteal') score += 18 + normalizePercentValue(e.value) * 0.25;
    if(e.type === 'reflectDamage') score += 20 + normalizePercentValue(e.value) * 0.25;
    if(e.type === 'critChance') score += 20 + normalizePercentValue(e.value) * 0.35;
    if(e.type === 'healReduction') score += 28 + normalizePercentValue(e.value) * 0.45;
  }

  return score;
}

function aiChooseSupportTarget(team, actor, move){
  const effects = aiGetMoveEffects(move);
  const allies = team
    .map((c, idx) => ({ c, idx, pct: c.maxHp ? c.hp / c.maxHp : 0 }))
    .filter(x => x.c.hp > 0);

  if(!allies.length) return state.activeIndex.p2;

  if(effects.some(e => e.type === 'heal')){
    const target = allies.slice().sort((a,b) => a.pct - b.pct)[0];
    if(target && target.c.hp < target.c.maxHp * 0.92) return target.idx;
  }

  // Los buffs se priorizan sobre el personaje activo, salvo que exista
  // una curación urgente para otro aliado.
  const active = allies.find(x => x.c === actor);
  if(active) return active.idx;

  return allies[0].idx;
}

function aiScoreMove(actor, move, enemy, team){
  if(!actor || !move || move.cd !== 0) return -Infinity;

  const effects = aiGetMoveEffects(move);
  const support = aiIsSupportMove(move);
  let score = 0;

  if(support){
    for(const e of effects){
      if(e.type === 'selfHealPct'){
        const missing = 1 - (actor.hp / actor.maxHp);
        score += missing > 0.10 ? 55 + missing * 90 : -15;
      }else if(e.type === 'heal'){
        const injured = team
          .filter(c => c.hp > 0)
          .sort((a,b) => (a.hp/a.maxHp) - (b.hp/b.maxHp))[0];

        if(injured){
          const missing = 1 - injured.hp / injured.maxHp;
          score += missing > 0.08 ? 60 + missing * 100 : -10;
        }
      }else if(e.type === 'shield'){
        const missing = 1 - actor.hp / actor.maxHp;
        score += 24 + missing * 45;
      }else if(e.type === 'tempDef'){
        const missing = 1 - actor.hp / actor.maxHp;
        score += 17 + missing * 35;
      }else if(e.type === 'tempAtk'){
        score += enemy && enemy.hp > enemy.maxHp * 0.25 ? 25 : 8;
      }else if(e.type === 'tempSpd'){
        score += 12;
      }else if(e.type === 'lifesteal'){
        score += 18 + normalizePercentValue(e.value) * 0.25;
      }else if(e.type === 'reflectDamage'){
        score += 20 + normalizePercentValue(e.value) * 0.25;
      }else if(e.type === 'critChance'){
        score += 20 + normalizePercentValue(e.value) * 0.35;
      }
    }

    if(effects.some(e =>
      e.type === 'tempAtk' ||
      e.type === 'tempDef' ||
      e.type === 'tempSpd' ||
      e.type === 'lifesteal' ||
      e.type === 'reflectDamage' ||
      e.type === 'critChance'
    )){
      if(!Array.isArray(actor.tempEffects) || actor.tempEffects.length === 0){
        score += 8;
      }
    }

    if(effects.some(e => e.type === 'heal' || e.type === 'selfHealPct')){
      const actorPct = actor.hp / actor.maxHp;
      const allyCriticallyInjured = team.some(c => c.hp > 0 && c.hp < c.maxHp * 0.65);
      if(actorPct > 0.88 && !allyCriticallyInjured) score -= 25;
    }

    return score;
  }

  if(enemy && move.power > 0){
    const estimate = aiEstimateDamage(actor, enemy, move);
    score += estimate;

    if(estimate >= enemy.hp){
      score += 130;
    }else if(enemy.hp / enemy.maxHp < 0.25){
      score += 25;
    }
  }

  score += aiEffectBonus(actor, enemy, move);

  if(move.power >= 65 && enemy){
    if(aiEstimateDamage(actor, enemy, move) >= enemy.hp){
      score += 45;
    }else if(enemy.hp / enemy.maxHp > 0.55){
      score += 8;
    }
  }

  if(move.acc != null && move.acc < 0.9){
    score *= 0.92;
  }

  return score;
}

function aiChooseSwapIndex(){
  const actor = getActive('p2');
  const team = state.teams.p2;
  const enemy = getActive('p1');

  if(!actor || !enemy) return -1;

  const candidates = team
    .map((c,idx) => ({ c, idx }))
    .filter(x => x.c.hp > 0 && x.idx !== state.activeIndex.p2);

  if(!candidates.length) return -1;

  const actorPct = actor.hp / actor.maxHp;

  if(actorPct <= 0.28){
    candidates.sort((a,b) => (b.c.hp/b.c.maxHp) - (a.c.hp/a.c.maxHp));
    return candidates[0].idx;
  }

  const currentMoves = actor.moves.filter(m => m.cd === 0);
  const currentBest = currentMoves.length
    ? Math.max(...currentMoves.map(m => aiScoreMove(actor,m,enemy,team)))
    : -Infinity;

  let bestIdx = -1;
  let bestScore = currentBest;

  for(const item of candidates){
    const c = item.c;
    if(c.hp / c.maxHp < 0.35) continue;

    const available = c.moves.filter(m => m.cd === 0);
    if(!available.length) continue;

    const bestForCandidate = Math.max(
      ...available.map(m => aiScoreMove(c,m,enemy,team))
    );

    const threshold = actorPct < 0.50 ? 8 : 28;

    if(bestForCandidate > bestScore + threshold){
      bestScore = bestForCandidate;
      bestIdx = item.idx;
    }
  }

  return bestIdx;
}

function aiChooseAction(options = {}){
  const allowSwap = options.allowSwap !== false;
  const actor = getActive('p2');
  const team = state.teams.p2;
  const enemy = getActive('p1');

  if(!actor || !enemy) return { type:'none' };

  const actorPct = actor.hp / actor.maxHp;

  if(allowSwap){
    const swapIdx = aiChooseSwapIndex();
    const dangerousControl =
      actor.stunned > 0 ||
      hasControlEffect(actor,'freeze') ||
      hasControlEffect(actor,'charm');

    if(swapIdx !== -1){
      const turnsSinceSwap = state.turnCount - (state.aiLastSwapTurn || -999);

      if(
        turnsSinceSwap >= 2 ||
        actorPct <= 0.28 ||
        dangerousControl
      ){
        return { type:'swap', idx:swapIdx };
      }
    }
  }

  const availableMoves = actor.moves.filter(m => m.cd === 0);
  if(!availableMoves.length) return { type:'none' };

  let best = null;
  let bestScore = -Infinity;

  for(const move of availableMoves){
    const score = aiScoreMove(actor, move, enemy, team);
    if(score > bestScore){
      bestScore = score;
      best = move;
    }
  }

  if(!best) return { type:'none' };

  const targetIdx = aiIsSupportMove(best)
    ? aiChooseSupportTarget(team, actor, best)
    : state.activeIndex.p2;

  return {
    type:'use',
    moveId:best.id,
    targetIdx
  };
}

async function aiExecuteAction(action){
  if(!action || action.type !== 'use') return false;

  const actor = getActive('p2');
  if(!actor || actor.hp <= 0) return false;

  const move = actor.moves.find(m => m.id === action.moveId);
  if(!move || move.cd > 0) return false;

  // El personaje que entra mediante un cambio gratuito debe respetar
  // sus propios estados antes de actuar.
  if(actor.stunned > 0){
    log(`😵 ${actor.name} (IA) está aturdido y no puede actuar.`);
    return false;
  }

  if(hasControlEffect(actor, 'freeze')){
    log(`❄️ ${actor.name} (IA) está congelado y no puede actuar.`);
    return false;
  }

  const fear = getControlEffect(actor, 'fear');
  if(fear){
    const failChance = Math.max(0, Math.min(1, Number(fear.failChance) || 0.5));
    if(Math.random() < failChance){
      log(`😨 ${actor.name} (IA) está aterrorizado y pierde su acción.`);
      return false;
    }
  }

  await animateAttack('p2');

  if(move.acc && Math.random() > move.acc){
    log(`IA intentó ${move.name}... ¡Falló!`);
    if(move.baseCooldown) move.cd = move.baseCooldown;
    return true;
  }

  if(move.baseCooldown && move.baseCooldown > 0){
    move.cd = move.baseCooldown;
  }

  const effects = getMoveEffects(move);
  const isSupport = aiIsSupportMove(move);

  if(isSupport){
    const targetIdx = typeof action.targetIdx === 'number'
      ? action.targetIdx
      : state.activeIndex.p2;

    const targetChar = state.teams.p2[targetIdx] || actor;

    effects.forEach(e =>
      applyEffect(actor, targetChar, { ...move, effect:e })
    );
  }else{
    effects.forEach(e => {
      if(e.type === 'lifesteal' || e.type === 'critChance' || e.type === 'reflectDamage'){
        applySpecialEffect(actor, actor, e);
      }
    });

    const targets = getNormalMoveTargets('p2', actor, move);

    targets.forEach(target => {
      if(move.power && move.power > 0){
        applyDamage(actor, target, move);
      }

      effects.forEach(e => {
        if(
          e.type === 'lifesteal' ||
          e.type === 'critChance' ||
          e.type === 'reflectDamage'
        ){
          return;
        }

        if(e.type === 'debuff'){
          applyDebuff(actor, target, e);
        }else if(
          e.type === 'stun' ||
          e.type === 'freeze' ||
          e.type === 'charm' ||
          e.type === 'fear' ||
          e.type === 'slow' ||
          e.type === 'healReduction' ||
          e.type === 'damageOverTime'
        ){
          applyStatusEffect(actor, target, e);
        }
      });
    });
  }

  if(move.baseCooldown && move.baseCooldown > 0){
    move.cd = move.baseCooldown;
  }

  updateArena();
  if(checkKO()) return true;

  return true;
}

async function aiTakeTurn(){
  if(state.phase !== 'battle' || state.turnOwner !== 'p2') return;

  let actor = getActive('p2');
  if(!actor){
    endTurn();
    return;
  }

  if(actor.hp <= 0){
    const aliveIdx = state.teams.p2.findIndex(c=>c.hp>0);

    if(aliveIdx !== -1){
      performSwap('p2', aliveIdx, false);
      actor = getActive('p2');
    }

    if(!actor || actor.hp <= 0){
      endTurn(actor);
      return;
    }
  }

  if(actor.stunned > 0 || hasControlEffect(actor, 'freeze')){
    log(actor.stunned > 0
      ? `IA está aturdida y pierde su turno.`
      : `IA está congelada y pierde su turno.`
    );
    endTurn(actor);
    return;
  }

  const fear = getControlEffect(actor, 'fear');
  if(fear){
    const failChance = Math.max(0, Math.min(1, Number(fear.failChance) || 0.5));
    if(Math.random() < failChance){
      log(`😨 ${actor.name} (IA) está aterrorizada y pierde su turno.`);
      endTurn(actor);
      return;
    }
  }

  let action = aiChooseAction();
  await new Promise(r=>setTimeout(r, 650));

  if(action.type === 'swap'){
    performSwap('p2', action.idx, false);
    state.aiLastSwapTurn = state.turnCount;

    actor = getActive('p2');

    if(!actor || actor.hp <= 0){
      endTurn(actor);
      return;
    }

    log(`🧠 La IA cambió de personaje y ahora actúa con ${actor.name}.`);

    action = aiChooseAction({ allowSwap:false });
    await new Promise(r=>setTimeout(r, 350));
  }

  if(action.type === 'use'){
    const didAct = await aiExecuteAction(action);

    if(state.phase === 'ended') return;

    endTurn(getActive('p2') || actor);
    return;
  }

  endTurn(getActive('p2') || actor);
}

/* utility shuffle */
function shuffleArray(a){ 
  for(let i=a.length-1;i>0;i--){ 
    const j=Math.floor(Math.random()*(i+1)); 
    [a[i],a[j]]=[a[j],a[i]]; 
  } 
  return a; 
}

/* UI init and hooks */
$('startBtn').addEventListener('click', ()=> {
  // Evita que, si el botón sigue siendo accesible, se pueda relanzar
  // startBattle() (y por tanto reiniciar la batalla desde cero con el
  // equipo modificado) mientras ya hay un combate en curso.
  if(state.phase !== 'select') return;
  startBattle();
});
$('restartBtn').addEventListener('click', ()=> location.reload());

/* Hooks de la fase de baneos */
function setupBanUI(){
  const input = $('ban-search');
  if(!input) return;   // el HTML no tiene la fase de baneos
  input.addEventListener('input', () => {
    state.banSearch = input.value;
    renderBanGrid();
  });
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){ state.banSearch = ''; input.value = ''; renderBanGrid(); }
  });
  $('ban-clear').addEventListener('click', () => {
    state.banSearch = '';
    input.value = '';
    renderBanGrid();
    input.focus();
  });
  $('ban-confirm').addEventListener('click', () => {
    if(state.banPending) commitBan(state.banPending);
  });
  $('ban-blank').addEventListener('click', () => commitBan(null));
}

function setupGlossaryUI(){
  const input = $('glossary-search');
  if(!input) return;   // el HTML no tiene el glosario
  input.addEventListener('input', () => {
    state.glossarySearch = input.value;
    renderGlossaryGrid();
  });
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){ state.glossarySearch = ''; input.value = ''; renderGlossaryGrid(); }
  });
  $('glossary-clear').addEventListener('click', () => {
    state.glossarySearch = '';
    input.value = '';
    renderGlossaryGrid();
    input.focus();
  });
  $('glossary-back').addEventListener('click', closeGlossary);
  $('glossary-detail-close').addEventListener('click', closeCharacterDetail);
  $('glossary-detail').addEventListener('click', (e) => {
    if(e.target.id === 'glossary-detail') closeCharacterDetail();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && $('glossary-detail').style.display === 'flex') closeCharacterDetail();
  });
}

function setupStoryUI(){
  const backBtn = $('story-back');
  if(!backBtn) return;   // el HTML no tiene el Modo Historia
  backBtn.addEventListener('click', closeStoryMode);
  const titleEl = $('story-head-title');
  if(titleEl && typeof STORY_TITLE !== 'undefined') titleEl.innerText = '📖 ' + STORY_TITLE;

  const surrenderBtn = $('story-surrender-btn');
  if(surrenderBtn) surrenderBtn.addEventListener('click', surrenderStoryBattle);
}

function initAll(){ 
  state.mode = window.GAME_MODE || state.mode || 'pvp'; 
  initSelection(); 
  updateArena(); 
  updateInfoText(); 
  updateTurnInfo(); 
  renderMovesArea(); 
}

window.addEventListener('load', ()=>{ setupBanUI(); setupGlossaryUI(); setupStoryUI(); initAll(); });

window._state = state;
window.startMode = startMode;
window.commitBan = commitBan;
window.openGlossary = openGlossary;
window.openStoryMode = openStoryMode;
window.performSwap = performSwap;
window.setFilter = function(p,c){ state.filter[p]=c; renderPanel(p); };
window.showClassMenu = showClassMenu;