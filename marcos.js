/* marcos.js — MARCOS DE PERFIL
   ---------------------------------------------------------------------------
   - Cada caja que abres en el Inventario tiene un 20 % de darte además un MARCO
     (los de la carpeta marcos/). Se guardan en tu colección y los equipas desde
     tu Perfil (botón "🎖️ Marco").
   - El marco equipado se ve en tu chip del menú, en tu perfil y, como viaja dentro
     del perfil público, también lo ven tus amigos (lista y perfil de amigo).
   - Si te toca un marco que ya tienes, se cambia por monedas de la tienda
     (ajustable en RARITIES.coins; pon 0 para desactivarlo).

   INSTALACIÓN (juego.html), ANTES de perfil.js:
       <script src="marcos.js" defer></script>
   Las imágenes van en la carpeta  marcos/ . Por defecto un marco usa  id + .PNG ; si el
   archivo se llama distinto (otra extensión, nombre con espacios...) pon  file:'nombre.ext'.
   Si una imagen trae fondo sólido (blanco, negro...) en vez de transparencia, se borra sola
   al cargarla; funciona servido por http(s), no abriendo el HTML con doble clic (file://).

   DÓNDE AJUSTAR COSAS:
     - Probabilidad por caja:                 CHEST_CHANCE
     - Peso de cada rareza (la suma se
       reajusta sola a 100 %):                RARITIES[x].weight
     - Nombre y rareza de cada marco:         FRAMES
     - Activar/desactivar un marco de evento: active:true / active:false
       (desactivado no sale en cajas; quien ya lo tiene lo conserva)
     - Si una imagen concreta deja el icono
       demasiado grande o pequeño dentro:     pad:<%> en ese marco (por defecto 9)

   API (por si otro archivo la necesita):
       MARCOS.rollChest(n)          → tirada para n cajas (la usa inventario.js)
       MARCOS.describe(lista)       → HTML para la pantalla de apertura
       MARCOS.equipped()            → id del marco equipado o null
       MARCOS.valid(id)             → ¿existe ese marco en el catálogo?
       MARCOS.avatar(html, id)      → envuelve un avatar con su marco
       MARCOS.openPicker({avatar, onChange})
       MARCOS.give(id) / giveAll()  → para probar desde la consola
   Todo se guarda en localStorage ('batalla-marcos').
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  const FOLDER = 'marcos/';
  const EXT = '.PNG';
  const KEY = 'batalla-marcos';
  const CHEST_CHANCE = 0.20;          // 20 % por caja abierta
  const DEFAULT_PAD = 9;              // % de margen del icono dentro del marco

  /* Mismo orden de rarezas que las skins. El peso solo reparte entre las rarezas disponibles. */
  const RARITIES = {
    comun:      { name: 'Común',      rgb: '148,163,184', weight: 45, coins: 5 },
    rara:       { name: 'Rara',       rgb: '56,189,248',  weight: 30, coins: 10 },
    epica:      { name: 'Épica',      rgb: '167,139,250', weight: 15, coins: 25 },
    evento:     { name: 'Evento',     rgb: '251,113,133', weight: 5,  coins: 40 },
    legendaria: { name: 'Legendaria', rgb: '251,191,36',  weight: 5,  coins: 60 }
  };
  const ORDER = ['comun', 'rara', 'epica', 'evento', 'legendaria'];

  /* id = nombre del archivo sin extensión. Nombres y rarezas puestos a ojo: cámbialos a tu gusto. */
  const FRAMES = [
    { id: 'MDFZ3480', name: 'Neón turquesa',      rarity: 'comun' },
    { id: 'GZUO3060', name: 'Lazo dorado',        rarity: 'comun' },
    { id: 'LTNH5669', name: 'Tentáculos',         rarity: 'comun' },
    { id: 'AKCW3769', name: 'Hielo y viento',     rarity: 'rara' },
    { id: 'EWJG1357', name: 'Laurel de plata',    rarity: 'rara' },
    { id: 'CFBP2214', name: 'Llamas y gafas',     rarity: 'rara' },
    { id: 'JDPX5341', name: 'Gladiador ámbar',    rarity: 'rara' },
    { id: 'LGTI9110', name: 'Cristal violeta',    rarity: 'rara' },
    { id: 'AWJQ8163', name: 'Gladiador carmesí',  rarity: 'epica' },
    { id: 'EEIX7124', name: 'Rayo azul',          rarity: 'epica' },
    { id: 'JVCH0300', name: 'Estela estelar',     rarity: 'epica' },
    { id: 'BISO4551', name: '1.5 Aniversario',    rarity: 'evento', active: true },
    { id: 'HKNY8184', name: 'Feliz Aniversario',  rarity: 'evento', active: true },
    { id: 'BDAK0591', name: 'Alas doradas',       rarity: 'legendaria' },
    { id: 'OEIU4690', name: 'Corona azul y oro',  rarity: 'legendaria' },

    /* Marcos con nombre propio: file = archivo dentro de marcos/ (el id no lleva espacios). */
    { id: 'break',       file: 'break.jpg',        name: 'Break',        rarity: 'comun' },
    { id: 'dark',        file: 'dark.jpg',         name: 'Oscuro',       rarity: 'comun' },
    { id: 'square',      file: 'square.jpg',       name: 'Cuadrado',     rarity: 'comun' },
    { id: 'water',       file: 'water.jpg',        name: 'Agua',         rarity: 'comun' },
    { id: 'silver',      file: 'silver.png',       name: 'Silver',       rarity: 'comun' },
    { id: 'casino',      file: 'casino.png',       name: 'Casino',       rarity: 'comun' },
    { id: 'secre',       file: 'secre.png',        name: 'Secre',        rarity: 'comun' },
    { id: 'arche',       file: 'arche.png',        name: 'Arche',        rarity: 'comun' },
    { id: 'demonns',     file: 'demonns.png',      name: 'Demonios',     rarity: 'rara' },
    { id: 'dorothy',     file: 'dorothy.png',      name: 'Dorothy',      rarity: 'rara' },
    { id: 'charmy',      file: 'charmy.jpg',       name: 'Charmy',       rarity: 'rara' },
    { id: 'kira',        file: 'kira.jpg',         name: 'Kira',         rarity: 'rara' },
    { id: 'natch',       file: 'natch.png',        name: 'Natch',        rarity: 'rara' },
    { id: 'sally',       file: 'sally.jpg',        name: 'Sally',        rarity: 'rara' },
    { id: 'tiny-king',   file: 'tiny king.jpg',    name: 'Tiny King',    rarity: 'rara' },
    { id: 'tiny-nero',   file: 'tiny nero.jpg',    name: 'Tiny Nero',    rarity: 'rara' },
    { id: 'lighter',     file: 'lighter.png',      name: 'Lighter',      rarity: 'rara' },
    { id: 'litch',       file: 'litch.jpg',        name: 'Litch',        rarity: 'rara' },
    { id: 'black-bulls', file: 'black bulls.png',  name: 'Black Bulls',  rarity: 'epica' },
    { id: 'gikku',       file: 'gikku.png',        name: 'Gikku',        rarity: 'epica' },
    { id: 'picanero',    file: 'picanero.jpg',     name: 'Picanero',     rarity: 'epica' },
    { id: 'wolf',        file: 'wolf.png',         name: 'Lobo',         rarity: 'epica' },
    { id: 'lumiere',     file: 'lumiere.png',      name: 'Lumiere',      rarity: 'epica' },
    { id: 'nero',        file: 'nero.jpg',         name: 'Nero',         rarity: 'epica' },
    { id: 'noelle',      file: 'noelle.jpg',       name: 'Noelle',       rarity: 'epica' },
    { id: 'vanessa',     file: 'vanessa.jpg',      name: 'Vanessa',      rarity: 'epica' },
    { id: 'yuno',        file: 'yuno.png',         name: 'Yuno',         rarity: 'epica' },
    { id: 'fest',        file: 'fest.jpg',         name: 'Festival',     rarity: 'evento', active: true },
    { id: 'salamander',  file: 'salamander.png',   name: 'Salamander',   rarity: 'legendaria' },
    { id: 'wizard-king', file: 'wizard king.jpg',  name: 'Wizard King',  rarity: 'legendaria' },
    { id: 'yami',        file: 'yami.jpg',         name: 'Yami',         rarity: 'legendaria' },
    { id: 'yami-dark',   file: 'yami dark.jpg',    name: 'Yami Dark',    rarity: 'legendaria' },
    { id: 'zagred',      file: 'zagred.jpg',       name: 'Zagred',       rarity: 'legendaria' },
    { id: 'king',        file: 'king.jpg',         name: 'King',         rarity: 'legendaria' }
  ];

  /* ---------------- utilidades ---------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const frameById = id => (typeof id === 'string' ? FRAMES.find(f => f.id === id) || null : null);
  const srcOf = f => FOLDER + encodeURI(f.file || (f.id + EXT));
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rarOf = f => RARITIES[f.rarity] || RARITIES.comun;

  /* ---------------- datos guardados ---------------- */
  function load() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
    const owned = {};
    if (d.owned && typeof d.owned === 'object') {
      Object.keys(d.owned).forEach(id => { if (frameById(id)) owned[id] = Number(d.owned[id]) || 0; });
    }
    const equipped = frameById(d.equipped) && owned[d.equipped] != null ? d.equipped : null;
    return { owned, equipped };
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* modo privado */ } }

  const equipped = () => load().equipped;
  const owns = id => load().owned[id] != null;

  function equip(id) {
    const d = load();
    d.equipped = id && d.owned[id] != null ? id : null;
    save(d);
    try { document.dispatchEvent(new CustomEvent('marcos:change', { detail: { equipped: d.equipped } })); } catch (e) { /* ignorar */ }
    return d.equipped;
  }

  /* ---------------- conseguir marcos ---------------- */
  function randOf(list) { return list[Math.floor(Math.random() * list.length)]; }

  function pickFrame() {
    const pool = FRAMES.filter(f => f.active !== false);
    const by = {};
    pool.forEach(f => { (by[f.rarity] = by[f.rarity] || []).push(f); });
    const avail = ORDER.filter(r => by[r]);
    if (!avail.length) return null;
    const total = avail.reduce((a, r) => a + RARITIES[r].weight, 0);
    let x = Math.random() * total;
    for (const r of avail) {
      x -= RARITIES[r].weight;
      if (x < 0) return randOf(by[r]);
    }
    return randOf(by[avail[avail.length - 1]]);
  }

  /* Da el marco; si ya lo tenías, lo cambia por monedas. */
  function grant(id) {
    const f = frameById(id);
    if (!f) return null;
    const d = load();
    if (d.owned[id] != null) {
      let coins = Math.max(0, rarOf(f).coins | 0);
      try {
        if (coins && window.SKINS && typeof window.SKINS.addCoins === 'function') window.SKINS.addCoins(coins);
        else coins = 0;
      } catch (e) { coins = 0; }
      return { id, isNew: false, coins };
    }
    d.owned[id] = Date.now();
    save(d);
    return { id, isNew: true, coins: 0 };
  }

  /* Una tirada por caja abierta: devuelve solo las que han dado marco. */
  function rollChest(n, chance) {
    const p = chance == null ? CHEST_CHANCE : chance;
    const out = [];
    for (let i = 0; i < Math.max(0, Math.floor(n) || 0); i++) {
      if (Math.random() >= p) continue;
      const f = pickFrame();
      const g = f && grant(f.id);
      if (g) out.push(g);
    }
    return out;
  }

  /* ---------------- fondo opaco -> transparente ----------------
     Algunas imagenes (sobre todo los .jpg) traen un fondo solido en vez de transparencia y
     taparian el icono. La primera vez que se carga un marco se detecta (esquinas opacas y de un
     mismo color) y se borra el fondo de fuera y el del centro del aro; el resultado se guarda en
     memoria. Si el navegador no deja leer la imagen (p. ej. al abrir juego.html con doble clic,
     file://), el marco se muestra tal cual. */
  const KEY_TOL = 48, KEY_SOFT = 30;

  /*KEY_START*/
  function keyOutBackground(d, w, h) {
    const N = w * h;
    const dist2 = (i, c) => { const dr = d[i * 4] - c[0], dg = d[i * 4 + 1] - c[1], db = d[i * 4 + 2] - c[2]; return dr * dr + dg * dg + db * db; };
    const colorAt = i => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]];
    const kill = new Uint8Array(N);
    const refs = [null, null, null];
    const queue = new Int32Array(N);
    const t2 = KEY_TOL * KEY_TOL;

    const flood = (seeds, ref, label) => {
      let head = 0, tail = 0;
      const visit = q => { if (!kill[q] && d[q * 4 + 3] >= 200 && dist2(q, ref) <= t2) { kill[q] = label; queue[tail++] = q; } };
      seeds.forEach(visit);
      while (head < tail) {
        const p = queue[head++], x = p % w;
        if (x > 0) visit(p - 1);
        if (x < w - 1) visit(p + 1);
        if (p >= w) visit(p - w);
        if (p < N - w) visit(p + w);
      }
    };
    const count = label => { let n = 0; for (let i = 0; i < N; i++) if (kill[i] === label) n++; return n; };
    const undo = label => { for (let i = 0; i < N; i++) if (kill[i] === label) kill[i] = 0; };

    // 1) fondo de fuera: las 4 esquinas opacas y de un mismo color
    const corners = [0, w - 1, (h - 1) * w, N - 1];
    if (corners.every(i => d[i * 4 + 3] >= 230)) {
      const c0 = colorAt(corners[0]);
      if (corners.every(i => dist2(i, c0) <= 40 * 40)) { refs[1] = c0; flood(corners, c0, 1); }
    }
    // 2) fondo del centro del aro: solo si es blanco, negro o del mismo color que el de fuera
    const ci = (h >> 1) * w + (w >> 1);
    if (d[ci * 4 + 3] >= 230) {
      const rc = colorAt(ci);
      const white = Math.min(rc[0], rc[1], rc[2]) >= 215, dark = Math.max(rc[0], rc[1], rc[2]) <= 45;
      const likeOuter = refs[1] && dist2(ci, refs[1]) <= 60 * 60;
      if (white || dark || likeOuter) { refs[2] = rc; flood([ci], rc, 2); }
    }
    // comprobaciones de cordura: si se borra casi nada o casi todo, no era un fondo
    if (count(1) > N * 0.6) undo(1);
    const inner = count(2);
    if (inner && (inner < N * 0.03 || inner > N * 0.8)) undo(2);
    let killed = 0;
    for (let i = 0; i < N; i++) if (kill[i]) killed++;
    if (killed < N * 0.02 || killed > N * 0.92) return false;

    // 3) borde suave: junto a lo borrado, cada pixel mezclado con el fondo se convierte en el color
    //    del aro con transparencia parcial (así no queda un halo claro alrededor)
    const nearKilled = p => {
      const x = p % w, y = (p / w) | 0;
      for (let dy = -2; dy <= 2; dy++) {
        const ny = y + dy; if (ny < 0 || ny >= h) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx; if (nx < 0 || nx >= w) continue;
          const k = kill[ny * w + nx]; if (k) return k;
        }
      }
      return 0;
    };
    const edges = [];
    for (let p = 0; p < N; p++) {
      if (kill[p]) continue;
      const lab = nearKilled(p);
      if (lab) edges.push(p, lab);
    }
    const out = [];
    for (let e = 0; e < edges.length; e += 2) {
      const p = edges[e], ref = refs[edges[e + 1]], x = p % w, y = (p / w) | 0;
      const dd = Math.sqrt(dist2(p, ref));
      let ink = p, best = dd;                              // pixel mas lejano del fondo en 7x7 = color del aro
      for (let dy = -3; dy <= 3; dy++) {
        const ny = y + dy; if (ny < 0 || ny >= h) continue;
        for (let dx = -3; dx <= 3; dx++) {
          const nx = x + dx; if (nx < 0 || nx >= w) continue;
          const q = ny * w + nx;
          if (kill[q]) continue;
          const dq = Math.sqrt(dist2(q, ref));
          if (dq > best) { best = dq; ink = q; }
        }
      }
      const cov = best > 1 ? Math.max(0.08, Math.min(1, dd / best)) : 1;
      if (cov < 0.97 && best >= KEY_TOL) out.push(p, ink, cov);
    }
    for (let e = 0; e < out.length; e += 3) {
      const p = out[e], ink = out[e + 1], cov = out[e + 2];
      d[p * 4] = d[ink * 4]; d[p * 4 + 1] = d[ink * 4 + 1]; d[p * 4 + 2] = d[ink * 4 + 2];
      d[p * 4 + 3] = Math.round(d[p * 4 + 3] * cov);
    }
    for (let p = 0; p < N; p++) if (kill[p]) d[p * 4 + 3] = 0;
    return true;
  }
  /*KEY_END*/

  const cleaned = {};   // id -> { state: 'busy' | 'ok' | 'same', url, p }

  function cleanImage(im) {
    const s = Math.min(1, 512 / Math.max(im.naturalWidth, im.naturalHeight));
    const w = Math.max(1, Math.round(im.naturalWidth * s)), h = Math.max(1, Math.round(im.naturalHeight * s));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(im, 0, 0, w, h);
    const data = cx.getImageData(0, 0, w, h);          // puede lanzar SecurityError (file://)
    if (!keyOutBackground(data.data, w, h)) return null;
    cx.putImageData(data, 0, 0);
    return cv.toDataURL('image/png');
  }

  function processFrame(f) {
    if (cleaned[f.id]) return cleaned[f.id].p;
    const st = cleaned[f.id] = { state: 'busy', url: null };
    st.p = new Promise(res => {
      const im = new Image();
      im.onload = () => {
        try { const url = cleanImage(im); st.url = url; st.state = url ? 'ok' : 'same'; }
        catch (e) { st.state = 'same'; }
        res(st);
      };
      im.onerror = () => { st.state = 'same'; res(st); };
      im.src = srcOf(f);
    });
    return st.p;
  }

  /* Deja el <img> del marco con la version buena (limpia o la original) y lo hace visible */
  function settle(im) {
    const f = frameById(im.dataset.mk);
    if (!f) return;
    const st = cleaned[f.id];
    if (!st || st.state === 'busy') { processFrame(f).then(() => settle(im)); return; }
    if (st.url && im.getAttribute('src') !== st.url) { im.src = st.url; return; }   // su 'load' volvera aqui
    im.classList.remove('mk-new');
  }

  /* ---------------- dibujo del marco ---------------- */
  /* Envuelve el HTML de un avatar: el icono queda recortado en círculo y el marco encima.
     El contenedor que lo recibe debe llevar la clase mk-host (quita su recorte y su borde). */
  function avatar(innerHTML, frameId) {
    const f = frameById(frameId);
    if (!f) return innerHTML;
    const pad = Number.isFinite(f.pad) ? f.pad : DEFAULT_PAD;
    const st = cleaned[f.id], ready = !!st && st.state !== 'busy';
    const src = st && st.url ? st.url : srcOf(f);
    return `<span class="mk-av" style="--mk-pad:${pad}%"><span class="mk-in">${innerHTML}</span>` +
      `<img class="mk-fr${ready ? '' : ' mk-new'}" data-mk="${esc(f.id)}" src="${esc(src)}" alt="" decoding="async" loading="lazy"></span>`;
  }

  function describe(list) {
    if (!list || !list.length) return '';
    return `<div class="mk-got">${list.map(g => {
      const f = frameById(g.id);
      if (!f) return '';
      const r = rarOf(f);
      const title = g.isNew ? '🎖️ ¡Marco nuevo!' : '🎖️ Marco repetido';
      const note = g.isNew ? 'Equípalo en tu Perfil'
        : (g.coins ? `Cambiado por +${g.coins} monedas` : 'Ya lo tenías');
      return `<div class="mk-got-i" style="--r:${r.rgb}">
        <span class="mk-got-av">${avatar('', f.id)}</span>
        <span class="mk-got-t"><b>${title}</b><small>${esc(f.name)} · ${esc(r.name)}</small><small>${esc(note)}</small></span>
      </div>`;
    }).join('')}</div>`;
  }

  /* ---------------- selector (desde el Perfil) ---------------- */
  let modal = null, pickerOpts = null;

  function closePicker() {
    if (modal) { modal.remove(); modal = null; }
    pickerOpts = null;
  }

  function pickerHTML() {
    const d = load();
    const base = (pickerOpts && pickerOpts.avatar) || '🎮';
    const visible = FRAMES.filter(f => d.owned[f.id] != null || f.active !== false);
    const sorted = visible.slice().sort((a, b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity));
    const have = sorted.filter(f => d.owned[f.id] != null).length;
    const cards = sorted.map(f => {
      const own = d.owned[f.id] != null, r = rarOf(f), sel = d.equipped === f.id;
      return `<button type="button" class="mk-pick${sel ? ' sel' : ''}${own ? '' : ' lock'}" data-id="${esc(f.id)}"
          style="--r:${r.rgb}" ${own ? `aria-pressed="${sel}"` : 'disabled aria-disabled="true"'}
          title="${esc(f.name)} · ${esc(r.name)}${own ? '' : ' (sin conseguir)'}">
        <span class="mk-pick-av">${avatar(base, f.id)}</span>
        <b>${esc(f.name)}</b>
        <small>${own ? esc(r.name) : '🔒 ' + esc(r.name)}</small>
        ${sel ? '<em>✔ Equipado</em>' : ''}
      </button>`;
    }).join('');
    return `
      <div class="mk-box" role="dialog" aria-modal="true" aria-labelledby="mk-title">
        <div class="mk-head">
          <div>
            <h3 id="mk-title">🎖️ Marcos de perfil</h3>
            <p>Tienes ${have} de ${sorted.length}. Cada caja que abres tiene un ${Math.round(CHEST_CHANCE * 100)} % de dar uno.</p>
          </div>
          <button type="button" class="mk-x" data-close aria-label="Cerrar">✕</button>
        </div>
        <div class="mk-grid">
          <button type="button" class="mk-pick mk-none${d.equipped ? '' : ' sel'}" data-id="" aria-pressed="${!d.equipped}" style="--r:148,163,184">
            <span class="mk-pick-av"><span class="mk-av"><span class="mk-in" style="--mk-pad:9%">${base}</span></span></span>
            <b>Sin marco</b><small>Solo tu icono</small>
            ${d.equipped ? '' : '<em>✔ Equipado</em>'}
          </button>
          ${cards}
        </div>
        <div class="mk-foot"><button type="button" class="class-btn" data-close>Cerrar</button></div>
      </div>`;
  }

  function renderPicker() {
    if (!modal) return;
    const grid = modal.querySelector('.mk-grid');
    const top = grid ? grid.scrollTop : 0;
    modal.innerHTML = pickerHTML();
    const g = modal.querySelector('.mk-grid');
    if (g) g.scrollTop = top;
  }

  function openPicker(opts) {
    closePicker();
    pickerOpts = opts || {};
    modal = document.createElement('div');
    modal.className = 'mk-modal';
    modal.innerHTML = pickerHTML();
    document.body.appendChild(modal);

    modal.addEventListener('mousedown', e => { if (e.target === modal) closePicker(); });
    modal.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) { closePicker(); return; }
      const b = e.target.closest('.mk-pick');
      if (!b || b.disabled) return;
      const cb = pickerOpts && pickerOpts.onChange;
      equip(b.dataset.id || null);
      renderPicker();
      if (typeof cb === 'function') { try { cb(equipped()); } catch (err) { /* ignorar */ } }
    });
    const first = modal.querySelector('.mk-pick.sel') || modal.querySelector('.mk-pick');
    if (first) first.focus({ preventScroll: true });
  }

  /* Escape cierra solo el selector (no el perfil que hay debajo) */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !modal) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    closePicker();
  }, true);

  /* Al cargar un marco por primera vez: limpiar el fondo (si lo trae) y mostrarlo */
  document.addEventListener('load', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.classList && t.classList.contains('mk-fr') && t.classList.contains('mk-new')) settle(t);
  }, true);

  /* Si falta una imagen, el avatar se queda sin marco en vez de mostrar un icono roto */
  document.addEventListener('error', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.classList.contains('mk-fr')) t.style.display = 'none';
  }, true);

  /* ---------------- estilos ---------------- */
  function injectCSS() {
    if (document.getElementById('mk-css')) return;
    const st = document.createElement('style');
    st.id = 'mk-css';
    st.textContent = `
      /* el contenedor del avatar deja de recortar para que el marco pueda sobresalir */
      .mk-host{overflow:visible !important; border-radius:0 !important; background:transparent !important;
        border-color:transparent !important; box-shadow:none !important}
      .pf-avatar.mk-on .pf-ring{display:none}

      .mk-av{position:relative; display:block; width:100%; height:100%}
      .mk-in{position:absolute; inset:var(--mk-pad,9%); border-radius:50%; overflow:hidden; display:flex;
        align-items:center; justify-content:center; background:#0d1730; font-size:.8em}
      .mk-av .mk-in > img{width:100%; height:100%; object-fit:cover; object-position:center 18%; border-radius:0}
      .mk-av .mk-fr{position:absolute; left:-6%; top:-6%; width:112%; height:112%; max-width:none;
        object-fit:contain; object-position:center; border-radius:0; transform:none !important;
        pointer-events:none; z-index:2; filter:drop-shadow(0 2px 5px rgba(0,0,0,.5)); transition:opacity .12s}
      .mk-av .mk-fr.mk-new{opacity:0}

      /* aviso al abrir cajas */
      .mk-got{display:flex; flex-direction:column; align-items:center; gap:8px; margin-top:10px; width:100%;
        max-height:230px; overflow:auto; padding:2px 4px}
      .mk-got-i{display:flex; align-items:center; gap:12px; padding:6px 16px 6px 8px; border-radius:16px; text-align:left;
        background:rgba(var(--r),.12); border:1px solid rgba(var(--r),.55); animation:mkPop .4s .5s cubic-bezier(.2,1.4,.4,1) both}
      .mk-got-av{flex:0 0 auto; width:64px; height:64px}
      .mk-got-t{display:flex; flex-direction:column; line-height:1.3}
      .mk-got-t b{font-size:14px; color:#fff}
      .mk-got-t small{font-size:11.5px; color:rgb(var(--r)); filter:brightness(1.25)}
      @keyframes mkPop{from{transform:scale(.7); opacity:0} to{transform:scale(1); opacity:1}}

      /* selector */
      .mk-modal{position:fixed; inset:0; z-index:150; display:flex; align-items:center; justify-content:center;
        padding:18px; background:rgba(1,5,15,.8); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px)}
      .mk-box{width:min(820px,100%); max-height:min(88vh,740px); display:flex; flex-direction:column; padding:20px;
        border-radius:22px; border:1px solid rgba(167,139,250,.38);
        background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01)),#0b1427;
        box-shadow:0 30px 80px rgba(0,0,0,.6); color:#e5e7eb}
      .mk-head{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px}
      .mk-head h3{margin:0; font-size:20px}
      .mk-head p{margin:4px 0 0; color:#9fb0c9; font-size:13px}
      .mk-x{flex:0 0 auto; width:38px; height:38px; border-radius:50%; border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.06); color:#fff; font-size:14px; cursor:pointer}
      .mk-x:hover{background:rgba(239,68,68,.4)}
      .mk-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(128px,1fr)); gap:12px; overflow:auto;
        padding:10px 8px 10px 4px; scrollbar-width:thin; scrollbar-color:rgba(139,92,246,.65) transparent}
      .mk-pick{position:relative; display:flex; flex-direction:column; align-items:center; gap:3px; padding:12px 8px 10px;
        border-radius:16px; cursor:pointer; color:inherit; font:inherit; text-align:center;
        background:rgba(255,255,255,.04); border:2px solid rgba(var(--r),.30);
        transition:transform .15s, border-color .15s, box-shadow .15s}
      .mk-pick:hover:not(:disabled){transform:translateY(-3px); border-color:rgba(var(--r),.85);
        box-shadow:0 10px 24px rgba(0,0,0,.4), 0 0 20px rgba(var(--r),.25)}
      .mk-pick.sel{border-color:#fbbf24; background:rgba(251,191,36,.10); box-shadow:0 0 0 1px #fbbf24 inset}
      .mk-pick b{font-size:13px; line-height:1.2; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
      .mk-pick small{font-size:11.5px; color:rgb(var(--r)); filter:brightness(1.25)}
      .mk-pick em{font-style:normal; font-size:11px; font-weight:800; color:#fde68a}
      .mk-pick.lock{cursor:not-allowed; border-style:dashed}
      .mk-pick.lock .mk-pick-av{filter:grayscale(1) brightness(.5)}
      .mk-pick.lock b, .mk-pick.lock small{color:#94a3b8; filter:none}
      .mk-pick-av{display:block; width:84px; height:84px; margin:4px 0 6px; font-size:34px}
      .mk-foot{display:flex; justify-content:flex-end; margin-top:12px}
      .mk-modal button:focus-visible, .mk-pick:focus-visible{outline:3px solid #fbbf24; outline-offset:2px}

      @media (prefers-reduced-motion:reduce){.mk-got-i, .mk-pick{animation:none !important; transition:none !important}}
    `;
    document.head.appendChild(st);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectCSS);
  else injectCSS();

  window.MARCOS = {
    chance: CHEST_CHANCE,
    rollChest, describe, equipped, equip, owns, avatar,
    valid: id => !!frameById(id),
    nameOf: id => { const f = frameById(id); return f ? f.name : ''; },
    openPicker, closePicker,
    list: () => FRAMES.map(f => Object.assign({}, f)),
    give: id => grant(id),
    giveAll: () => FRAMES.forEach(f => { const d = load(); if (d.owned[f.id] == null) grant(f.id); })
  };
})();
