/* skins.js — MONEDAS Y SKINS
   ---------------------------------------------------------------------------
   - 🪙 Monedas: se ganan al abrir cofres del Inventario (inventario.js).
   - 🎨 Skins: apariencias alternativas de personajes que YA existen
     (p. ej. Noelle con noelle1.jpg). Salen en los cofres (con probabilidad)
     o aparecen en el catálogo diario de la 🛒 Tienda (5 skins al azar que cambian cada 24 h).
   - 📖 Glosario: en la ficha de cada personaje eliges qué apariencia usar.
   - La skin elegida se aplica a TODO el juego (selección, combate, perfil...)
     cambiando la imagen del personaje; no se toca game.js.

   INSTALACIÓN (juego.html), después de pasivas.js y antes de i18n-en.js:
       <script src="skins.js" defer></script>
   Y los 3 cambios pequeños de inventario.js (ver instrucciones).

   AÑADIR UNA SKIN: una línea en SKIN_CATALOG (abajo) + la imagen en personajes/.
     { id: 'noelle1', charId: 'noelle_silva', name: 'Noelle de gala',
       img: 'personajes/noelle1.jpg', rarity: 'rare' }
   El precio sale de la rareza (PRICES) salvo que pongas price: N.

   RAREZAS: common, rare, epic, event (Evento) y legend (Legendaria); las dos últimas son las más raras y caras.
   COFRES EN LA TIENDA: CHEST_PRICE (cofre normal, va al Inventario) y SKIN_CHEST_PRICE (skin garantizada; la rareza sale de RARITY_WEIGHT).
   SKINS DE EVENTO: se activan/desactivan una a una en EVENT_ACTIVE (id: true/false).
   AJUSTES: PRICES, COINS_MIN/COINS_MAX por cofre, SKIN_CHANCE, RARITY_WEIGHT.
   Todo se guarda en localStorage ('batalla-skins').
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  if (typeof findBaseById !== 'function') {
    console.warn('[skins.js] Debe cargarse DESPUÉS de game.js.');
    return;
  }

  /* ---------------- CATÁLOGO ---------------- */
  const SKIN_CATALOG = [
    { id: 'noelle5', charId: 'noelle_silva', name: 'Noelle · Diablita', img: 'personajes/noelle5.jpg', rarity: 'common' },
    { id: 'noelle1', charId: 'noelle_silva', name: 'Noelle · Diablita2', img: 'personajes/noelle1.jpg', rarity: 'rare' },
    { id: 'noelle2', charId: 'noelle_silva', name: 'Noelle · Swimsuit', img: 'personajes/noelle2.jpg', rarity: 'epic' },
    { id: 'noelle3', charId: 'noelle_silva', name: 'Noelle · Lazito_verde', img: 'personajes/noelle3.jpg', rarity: 'epic' },
    { id: 'noelle_hw', charId: 'noelle_silva', name: 'Noelle · Halloween', img: 'personajes/noelle4.jpg', rarity: 'event' },
    { id: 'noelle6', charId: 'noelle_silva', name: 'Noelle · Sirena', img: 'personajes/noelle6.jpg', rarity: 'legend' },
    { id: 'albedo1', charId: 'albedo', name: 'Albedo · Atuendo default', img: 'personajes/albedo1.jpg', rarity: 'common' },
    { id: 'albedo2', charId: 'albedo', name: 'Albedo · Carruaje elegante', img: 'personajes/albedo2.jpg', rarity: 'rare' },
    { id: 'albedo3', charId: 'albedo', name: 'Albedo · Armadura', img: 'personajes/albedo3.jpg', rarity: 'epic' },
    { id: 'albedo_chm', charId: 'albedo', name: 'Albedo · Navidad', img: 'personajes/albedo4.jpg', rarity: 'event' },
    { id: 'albedo5', charId: 'albedo', name: 'Albedo · Succubus', img: 'personajes/albedo5.jpg', rarity: 'legend' },
    { id: 'secre1', charId: 'secre', name: 'Secre · Atuendo default', img: 'personajes/secre1.jpg', rarity: 'common' },
    { id: 'secre2', charId: 'secre', name: 'Secre · Uniforme escolar', img: 'personajes/secre2.jpg', rarity: 'rare' },
    { id: 'secre3', charId: 'secre', name: 'Secre · kimono', img: 'personajes/secre3.jpg', rarity: 'epic' },
    { id: 'secre_maid', charId: 'secre', name: 'Secre · Maid', img: 'personajes/secre4.jpg', rarity: 'event' },
    { id: 'secre5', charId: 'secre', name: 'Secre · Magia sellada', img: 'personajes/secre5.jpg', rarity: 'legend' },
    { id: 'belerick1', charId: 'belerick', name: "Belerick · Tiger's Claw", img: 'personajes/belerick1.jpg', rarity: 'common' },
    { id: 'belerick2', charId: 'belerick', name: 'Belerick · Torch Guardian', img: 'personajes/belerick2.jpg', rarity: 'rare' },
    { id: 'belerick3', charId: 'belerick', name: 'Belerick · Arbiter of Stars', img: 'personajes/belerick3.jpg', rarity: 'epic' },
    { id: 'belerick_star', charId: 'belerick', name: 'Belerick · Smouldering Fortress', img: 'personajes/belerick4.jpg', rarity: 'event' },
    { id: 'belerick5', charId: 'belerick', name: 'Belerick · The Deep One', img: 'personajes/belerick5.jpg', rarity: 'legend' },
    { id: 'punpun1', charId: 'punpun', name: 'Punpun · Chibi', img: 'personajes/punpun1.jpeg', rarity: 'common' },
    { id: 'punpun2', charId: 'punpun', name: 'Punpun · Teen', img: 'personajes/punpun2.jpeg', rarity: 'rare' },
    { id: 'punpun3', charId: 'punpun', name: 'Punpun · Hair', img: 'personajes/punpun3.jpeg', rarity: 'rare' },
    { id: 'punpun4', charId: 'punpun', name: 'Punpun · Real', img: 'personajes/punpun4.jpeg', rarity: 'epic' },
    { id: 'punpun5', charId: 'punpun', name: 'Punpun · Triangle', img: 'personajes/punpun5.jpeg', rarity: 'epic' },
    { id: 'punpun6', charId: 'punpun', name: 'Punpun · ??', img: 'personajes/punpun6.jpeg', rarity: 'legend' },
    { id: 'floryn1', charId: 'floryn', name: 'Floryn · Springtide', img: 'personajes/floryn1.jpg', rarity: 'common' },
    { id: 'floryn2', charId: 'floryn', name: 'Floryn · Paw Power', img: 'personajes/floryn2.jpg', rarity: 'rare' },
    { id: 'floryn3', charId: 'floryn', name: 'Floryn · Yatai Waitress', img: 'personajes/floryn3.jpg', rarity: 'epic' },
    { id: 'floryn4', charId: 'floryn', name: 'Floryn · Herald of Autumn', img: 'personajes/floryn4.jpg', rarity: 'epic' },
    { id: 'floryn_hk', charId: 'floryn', name: 'Floryn · Fluffly Dream', img: 'personajes/floryn5.jpg', rarity: 'event' },
    { id: 'floryn6', charId: 'floryn', name: 'Floryn · Melody of Light', img: 'personajes/floryn6.jpg', rarity: 'legend' },
    { id: 'selena1', charId: 'selena', name: 'Selena · Abyssal Witch', img: 'personajes/selena1.jpg', rarity: 'common' },
    { id: 'selena2', charId: 'selena', name: 'Selena · Wasp Queen', img: 'personajes/selena2.jpg', rarity: 'rare' },
    { id: 'selena3', charId: 'selena', name: 'Selena · Virus', img: 'personajes/selena3.jpg', rarity: 'epic' },
    { id: 'selena4', charId: 'selena', name: 'Selena · Gemini-Shadow', img: 'personajes/selena4.jpg', rarity: 'epic' },
    { id: 'selena_star', charId: 'selena', name: 'Selena · Double Identity', img: 'personajes/selena5.jpg', rarity: 'event' },
    { id: 'selena6', charId: 'selena', name: 'Selena · Thunder Flash', img: 'personajes/selena6.jpg', rarity: 'epic' },
    { id: 'selena7', charId: 'selena', name: 'Selena · Gothic Curse', img: 'personajes/selena7.jpg', rarity: 'rare' },
    { id: 'selena8', charId: 'selena', name: 'Selena · S.T.U.N', img: 'personajes/selena8.jpg', rarity: 'epic' },
    { id: 'selena9', charId: 'selena', name: 'Selena · Lady Vengeance', img: 'personajes/selena9.jpg', rarity: 'legend' },
    { id: 'selena10', charId: 'selena', name: 'Selena · Curse of Cinder', img: 'personajes/selena10.jpg', rarity: 'legend' },
    { id: 'selena11', charId: 'selena', name: 'Selena · Silverblot Raiko', img: 'personajes/selena11.jpg', rarity: 'legend' },
    // { id: 'yami1', charId: 'yami', name: 'Yami · Skin 1', img: 'personajes/yami1.jpg', rarity: 'common' },
  ];

  /* SKINS DE EVENTO: interruptor individual. true = se puede conseguir ahora (tienda y cofres);
     false o ausente = el evento ha terminado: no se puede obtener hasta que lo vuelvas a activar.
     Quien ya la tenga la conserva y puede equiparla. Al volver el evento, pon su id en true. */
  const EVENT_ACTIVE = {
    noelle_hw: true,
    albedo_chm: true,
    secre_maid: true,
    belerick_star: true,
    floryn_hk: true,
    selena_star: true
  };

  const RARITY = {
    common: { label: 'Común',  color: '#94a3b8', icon: '⚪' },
    rare:   { label: 'Rara',   color: '#38bdf8', icon: '🔷' },
    epic:   { label: 'Épica',  color: '#c084fc', icon: '🟣' },
    event:  { label: 'Evento', color: '#fb7185', icon: '🎉' },
    legend: { label: 'Legendaria', color: '#fbbf24', icon: '🌟' }
  };
  const PRICES = { common: 150, rare: 300, epic: 600, event: 1000, legend: 1500 };       // monedas
  const RARITY_WEIGHT = { common: 5, rare: 3, epic: 1.3, event: 0.2, legend: 0.5 };       // % de cada RAREZA en los cofres (no por skin). Si una rareza no tiene skins disponibles, el resto se reparte hasta sumar 100 %
  const COINS_MIN = 15, COINS_MAX = 45;                        // monedas por cofre
  const SKIN_CHANCE = 0.12;                                    // 12 % de que un cofre dé una skin
  const CHEST_PRICE = 50;                                      // cofre normal de la tienda (monedas)
  const SKIN_CHEST_PRICE = 400;                                // cofre de skin garantizada (monedas)
  const SHOP_SIZE = 5;                                         // skins en el catálogo diario de la tienda
  const BOX_IMG = 'personajes/caja.jpg';
  const COIN_IMG = 'personajes/papucoin.png';                  // imagen de la moneda
  const SKIN_CHEST_IMG = 'personajes/cofre.png';               // imagen del cofre de skin garantizada
  const KEY = 'batalla-skins';

  /* ---------------- utilidades ---------------- */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const fmt = n => Number(n || 0).toLocaleString('es-ES');
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  const isAvailable = s => s.rarity !== 'event' || !!EVENT_ACTIVE[s.id];   // ¿se puede conseguir ahora?
  const coinImg = () => `<img class="sk-coin-i" src="${esc(COIN_IMG)}" alt="🪙" onerror="this.replaceWith(document.createTextNode('🪙'))">`;
  const skinById = id => SKIN_CATALOG.find(s => s.id === id) || null;
  const priceOf = s => Number(s.price) > 0 ? Number(s.price) : (PRICES[s.rarity] || PRICES.common);
  const rarityOf = s => RARITY[s.rarity] || RARITY.common;
  const baseOf = s => { try { return findBaseById(s.charId); } catch (e) { return null; } };
  const validSkins = () => SKIN_CATALOG.filter(baseOf);
  const skinsOf = charId => validSkins().filter(s => s.charId === charId);

  /* ---------------- datos guardados ---------------- */
  function load() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { d = {}; }
    const owned = {};
    (Array.isArray(d.owned) ? d.owned : []).forEach(id => { if (typeof id === 'string') owned[id] = 1; });
    const selected = {};
    if (d.selected && typeof d.selected === 'object') {
      Object.keys(d.selected).forEach(cid => { if (typeof d.selected[cid] === 'string') selected[cid] = d.selected[cid]; });
    }
    return {
      coins: Math.max(0, Math.min(1e9, Math.floor(Number(d.coins)) || 0)),
      earned: Math.max(0, Math.floor(Number(d.earned)) || 0),
      owned, selected,
      shop: { day: Math.floor(Number(d.shop && d.shop.day)) || 0, ids: (d.shop && Array.isArray(d.shop.ids)) ? d.shop.ids.filter(x => typeof x === 'string') : [] }
    };
  }
  let S = load();
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ coins: S.coins, earned: S.earned, owned: Object.keys(S.owned), selected: S.selected, shop: S.shop }));
    } catch (e) { /* modo privado */ }
  }

  /* ---------------- aplicar la skin elegida ---------------- */
  function applyAll() {
    const charIds = new Set(SKIN_CATALOG.map(s => s.charId));
    charIds.forEach(cid => {
      const base = findBaseById(cid);
      if (!base) return;
      if (!base.__img0) base.__img0 = base.img;                    // imagen original
      const sel = S.selected[cid] && skinById(S.selected[cid]);
      base.img = (sel && S.owned[sel.id]) ? sel.img : base.__img0;
    });
  }

  function equip(charId, skinId) {            // skinId = null -> por defecto
    if (skinId) {
      const s = skinById(skinId);
      if (!s || s.charId !== charId || !S.owned[skinId]) return false;
      S.selected[charId] = skinId;
    } else {
      delete S.selected[charId];
    }
    save(); applyAll();
    return true;
  }

  /* ---------------- catálogo diario de la tienda ---------------- */
  // Cada día (a medianoche, hora local) se eligen SHOP_SIZE skins al azar entre todas las que se pueden conseguir.
  // El sorteo del día usa una semilla fija, y se guarda para que añadir skins al catálogo no lo cambie a mitad de día.
  const dayNum = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); };
  function msToNextDay() { const d = new Date(); const n = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); return n - d; }
  function seededRand(seed) {                                   // mulberry32
    let a = (seed * 2654435761) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shopSkins() {
    const today = dayNum();
    const pool = validSkins().filter(isAvailable).sort((a, b) => a.id < b.id ? -1 : 1);
    let ids = (S.shop.day === today) ? S.shop.ids.filter(id => pool.some(s => s.id === id)) : [];
    if (ids.length < Math.min(SHOP_SIZE, pool.length)) {
      const rnd = seededRand(today + 7);
      const order = pool.slice();
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      for (const s of order) { if (ids.length >= SHOP_SIZE) break; if (!ids.includes(s.id)) ids.push(s.id); }
    }
    if (S.shop.day !== today || ids.join() !== S.shop.ids.join()) { S.shop = { day: today, ids }; save(); }
    return ids.map(skinById).filter(Boolean);
  }

  /* ---------------- monedas y compras ---------------- */
  function addCoins(n) {
    n = Math.max(0, Math.floor(Number(n)) || 0);
    S = load(); S.coins += n; S.earned += n; save(); refreshChip();
    return n;
  }

  function buy(skinId) {
    S = load();
    const s = skinById(skinId);
    if (!s || !baseOf(s)) return { ok: false, msg: 'Esa skin no existe.' };
    if (S.owned[s.id]) return { ok: false, msg: 'Ya tienes esta skin.' };
    if (!isAvailable(s)) return { ok: false, msg: 'Esta skin de evento no está disponible ahora.' };
    if (!shopSkins().some(x => x.id === s.id)) return { ok: false, msg: 'Esa skin ya no está en el catálogo de hoy.' };
    const p = priceOf(s);
    if (S.coins < p) return { ok: false, msg: `Te faltan ${fmt(p - S.coins)} monedas.` };
    S.coins -= p; S.owned[s.id] = 1;
    if (!S.selected[s.charId]) S.selected[s.charId] = s.id;        // la primera skin de ese personaje se equipa sola
    save(); applyAll(); refreshChip();
    return { ok: true, msg: `¡Has comprado «${s.name}»!` };
  }

  const weightOf = r => (r in RARITY_WEIGHT) ? RARITY_WEIGHT[r] : 1;

  /* Reparte el pool por rareza: solo cuentan las rarezas que tienen skins disponibles
     (sin las de evento desactivadas, sin las que ya tienes...), así los % siempre suman 100. */
  function groupByRarity(pool) {
    const g = {};
    pool.forEach(s => { (g[s.rarity] = g[s.rarity] || []).push(s); });
    return g;
  }

  function weightedPick(pool) {
    const g = groupByRarity(pool), rs = Object.keys(g).filter(r => weightOf(r) > 0);
    if (!rs.length) return pool[0];
    const total = rs.reduce((a, r) => a + weightOf(r), 0);
    let x = Math.random() * total, chosen = rs[rs.length - 1];
    for (const r of rs) { x -= weightOf(r); if (x <= 0) { chosen = r; break; } }
    const list = g[chosen];
    return list[Math.floor(Math.random() * list.length)];       // dentro de una rareza, todas igual de probables
  }

  /* % real de cada rareza ahora mismo (para comprobar: SKINS.rates() en la consola) */
  function rates() {
    S = load();
    const g = groupByRarity(validSkins().filter(s => !S.owned[s.id] && isAvailable(s)));
    const rs = Object.keys(g).filter(r => weightOf(r) > 0);
    const total = rs.reduce((a, r) => a + weightOf(r), 0) || 1;
    const out = {};
    rs.forEach(r => { out[r] = Math.round(weightOf(r) / total * 1000) / 10; });
    return out;
  }

  /* Cofre normal: se compra con monedas y va al Inventario como los de las partidas */
  function buyChest() {
    S = load();
    if (!window.INVENTARIO) return { ok: false, msg: 'El inventario no está disponible.' };
    if (S.coins < CHEST_PRICE) return { ok: false, msg: `Te faltan ${fmt(CHEST_PRICE - S.coins)} monedas.` };
    S.coins -= CHEST_PRICE; save(); refreshChip();
    window.INVENTARIO.add(1);
    return { ok: true, msg: '📦 ¡Cofre comprado! Ya lo tienes en tu Inventario.' };
  }

  /* Cofre de skin garantizada: siempre da una skin que no tengas; solo varía la rareza */
  function buySkinChest() {
    S = load();
    const pool = validSkins().filter(s => !S.owned[s.id] && isAvailable(s));
    if (!pool.length) return { ok: false, msg: '¡Ya tienes todas las skins disponibles!' };
    if (S.coins < SKIN_CHEST_PRICE) return { ok: false, msg: `Te faltan ${fmt(SKIN_CHEST_PRICE - S.coins)} monedas.` };
    const pick = weightedPick(pool);
    S.coins -= SKIN_CHEST_PRICE; S.owned[pick.id] = 1;
    if (!S.selected[pick.charId]) S.selected[pick.charId] = pick.id;
    save(); applyAll(); refreshChip();
    return { ok: true, skin: pick, msg: `🎁 ¡Te ha tocado «${pick.name}»!` };
  }

  /* Recompensa extra de n cofres: { coins, skins:[skin...] } (la usa inventario.js) */
  function rollChest(n) {
    S = load();
    let coins = 0;
    const got = [];
    for (let i = 0; i < n; i++) {
      coins += rand(COINS_MIN, COINS_MAX);
      if (Math.random() < SKIN_CHANCE) {
        const pool = validSkins().filter(s => !S.owned[s.id] && isAvailable(s));
        if (pool.length) {
          const pick = weightedPick(pool);
          S.owned[pick.id] = 1;
          if (!S.selected[pick.charId]) S.selected[pick.charId] = pick.id;
          got.push(pick);
        } else {
          coins += Math.round(priceOf({ rarity: 'common' }) / 3);  // ya las tienes todas: consuelo en monedas
        }
      }
    }
    S.coins += coins; S.earned += coins;
    save(); applyAll(); refreshChip();
    return { coins, skins: got };
  }

  /* HTML del bonus para la ventana de apertura del cofre */
  function describeBonus(b) {
    if (!b) return '';
    const skins = (b.skins || []).map(s => `<div class="sk-drop" style="--c:${rarityOf(s).color}">
        <img src="${esc(s.img)}" alt="" onerror="this.replaceWith(document.createTextNode('🎨'))">
        <span><b>🎨 ¡Skin nueva!</b><small>${esc(s.name)} · ${rarityOf(s).label}</small></span></div>`).join('');
    return `<div class="sk-bonus"><span class="sk-coin">${coinImg()} +${fmt(b.coins)} monedas</span>${skins}</div>`;
  }

  /* ---------------- estilos ---------------- */
  function injectCSS() {
    if (byId('sk-css')) return;
    const st = document.createElement('style');
    st.id = 'sk-css';
    st.textContent = `
    .sk-bonus{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:10px}
    .sk-coin{padding:4px 14px;border-radius:99px;font-weight:800;font-size:15px;color:#fde047;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.5)}
    .sk-drop{display:flex;align-items:center;gap:10px;padding:6px 14px 6px 6px;border-radius:14px;border:1px solid var(--c);background:rgba(255,255,255,.05);text-align:left}
    .sk-drop img,.sk-drop .sk-fb{width:48px;height:48px;border-radius:10px;object-fit:cover}
    .sk-drop small{display:block;color:#c9b9a4;font-size:11px}

    #sk-chip{display:inline-block;margin-left:8px;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:800;color:#fde047;background:rgba(251,191,36,.14);border:1px solid rgba(251,191,36,.45)}

    #sk-screen{position:fixed;inset:0;display:none;align-items:flex-start;justify-content:center;padding:24px 16px 40px;overflow:auto;z-index:128;color:#fff;
      background:radial-gradient(circle at 15% 0%,rgba(234,179,8,.16),transparent 34%),radial-gradient(circle at 85% 8%,rgba(139,92,246,.14),transparent 36%),linear-gradient(180deg,#0d0a10,#14101a 55%,#05060a)}
    .sk-wrap{width:min(1040px,100%);display:flex;flex-direction:column;gap:16px}
    .sk-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .sk-title{margin:0;font-size:clamp(22px,2.6vw,32px);font-weight:800;background:linear-gradient(90deg,#fff,#fde68a,#fdba74);-webkit-background-clip:text;background-clip:text;color:transparent}
    .sk-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .sk-wallet{padding:8px 16px;border-radius:99px;font-weight:800;color:#fde047;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.5)}
    .sk-timer{padding:6px 14px;border-radius:99px;font-size:12px;color:#bae6fd;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.4)}
    .sk-search{flex:1 1 220px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:inherit;font:inherit}
    .sk-msg{min-height:20px;font-size:13px;color:#fcd34d}
    .sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
    .sk-card{display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:18px;border:1px solid var(--c);
      background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),#0f1020;box-shadow:0 12px 30px rgba(0,0,0,.4)}
    .sk-pair{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .sk-pair figure{margin:0;text-align:center;font-size:10px;color:#94a3b8}
    .sk-pair img,.sk-pair .sk-fb{width:100%;aspect-ratio:1;object-fit:cover;object-position:center 15%;border-radius:10px;background:#0d1730;display:flex;align-items:center;justify-content:center;font-size:30px}
    .sk-card b{font-size:14px} .sk-card small{color:#9fb0c9}
    .sk-rar{font-size:11px;font-weight:800;color:var(--c)}
    .sk-card.r-event{box-shadow:0 0 18px rgba(251,113,133,.35),0 12px 30px rgba(0,0,0,.4)}
    .sk-card.r-legend{box-shadow:0 0 24px rgba(251,191,36,.5),0 12px 30px rgba(0,0,0,.4);background:linear-gradient(180deg,rgba(251,191,36,.12),rgba(255,255,255,.012)),#0f1020}
    .sk-h{margin:4px 0 0;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#9db0cc}
    .sk-chests{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
    .sk-chest{display:flex;gap:12px;align-items:center;padding:12px;border-radius:18px;border:1px solid rgba(251,191,36,.45);
      background:linear-gradient(180deg,rgba(251,191,36,.08),rgba(255,255,255,.012)),#0f1020;box-shadow:0 12px 30px rgba(0,0,0,.4)}
    .sk-chest.gold{border-color:#fbbf24;box-shadow:0 0 22px rgba(251,191,36,.35),0 12px 30px rgba(0,0,0,.4)}
    .sk-chest-img{flex:0 0 84px;width:84px;height:84px;border-radius:14px;object-fit:cover;display:flex;align-items:center;justify-content:center;font-size:44px;background:#0d1730}
    .sk-coin-i{width:1.15em;height:1.15em;vertical-align:-.2em;object-fit:contain}
    .sk-chest-info{display:flex;flex-direction:column;gap:6px;min-width:0}
    .sk-chest-info small{color:#9fb0c9;line-height:1.35}
    .sk-chest-btns{display:flex;gap:6px;flex-wrap:wrap}
    #sk-reveal{position:fixed;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,4,10,.82)}
    .sk-rv{width:min(340px,100%);display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;border-radius:22px;text-align:center;color:#fff;
      border:2px solid var(--c);background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.012)),#0f1020;box-shadow:0 0 40px var(--c)}
    .sk-rv img,.sk-rv .sk-fb{width:220px;max-width:100%;aspect-ratio:1;object-fit:cover;object-position:center 15%;border-radius:16px;background:#0d1730;display:flex;align-items:center;justify-content:center;font-size:70px}
    .sk-rv h3{margin:0;font-size:20px}
    .sk-card.sk-off{opacity:.55;filter:grayscale(.6)}
    .sk-btn{padding:8px 12px;border:0;border-radius:12px;cursor:pointer;font:inherit;font-weight:800;color:#1a1204;background:linear-gradient(180deg,#fde047,#f59e0b)}
    .sk-btn:disabled{opacity:.45;cursor:not-allowed}
    .sk-btn.alt{color:#fff;background:rgba(139,92,246,.35);border:1px solid rgba(167,139,250,.6)}
    .sk-btn.on{color:#bbf7d0;background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.6)}
    .sk-empty{padding:40px 10px;text-align:center;color:#9fb0c9}

    .sk-box{margin:0 0 16px}
    .sk-box h4{margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#9db0cc}
    .sk-row{display:flex;gap:8px;flex-wrap:wrap}
    .sk-opt{position:relative;width:78px;padding:4px;border-radius:12px;cursor:pointer;color:inherit;font:inherit;text-align:center;
      background:rgba(255,255,255,.04);border:1px solid rgba(148,163,184,.25)}
    .sk-opt img,.sk-opt .sk-fb{width:100%;aspect-ratio:1;object-fit:cover;object-position:center 15%;border-radius:9px;background:#0d1730;display:flex;align-items:center;justify-content:center;font-size:26px}
    .sk-opt span{display:block;margin-top:3px;font-size:10px;font-weight:700;line-height:1.2}
    .sk-opt.sel{border-color:#fbbf24;box-shadow:0 0 0 1px #fbbf24 inset,0 0 16px rgba(251,191,36,.3);background:rgba(251,191,36,.1)}
    .sk-opt.locked{opacity:.4;cursor:not-allowed}
    .sk-opt.locked::after{content:'🔒';position:absolute;top:6px;right:8px}
    .sk-hint{margin-top:6px;font-size:11px;color:#7d8ca4}
    `;
    document.head.appendChild(st);
  }

  /* ---------------- tienda ---------------- */
  const ui = { open: false, msg: '', timer: null };

  function injectScreen() {
    if (byId('sk-screen')) return;
    const sc = document.createElement('div');
    sc.id = 'sk-screen';
    sc.innerHTML = '<div class="sk-wrap" id="sk-wrap"></div>';
    document.body.appendChild(sc);
    sc.addEventListener('click', onClick);
  }

  function fallbackImg(src, emoji) {
    return `<img src="${esc(src)}" alt="" onerror="this.outerHTML='<div class=&quot;sk-fb&quot;>${emoji}</div>'">`;
  }

  function cardHTML(s) {
    const base = baseOf(s), r = rarityOf(s), owned = !!S.owned[s.id], eq = S.selected[s.charId] === s.id;
    const p = priceOf(s), can = S.coins >= p;
    const btn = owned
      ? (eq ? `<button class="sk-btn on" data-act="unequip" data-c="${esc(s.charId)}">✔ Equipada · quitar</button>`
            : `<button class="sk-btn alt" data-act="equip" data-s="${esc(s.id)}">🎨 Equipar</button>`)
      : !isAvailable(s)
        ? `<button class="sk-btn" disabled>⏳ Evento finalizado</button>`
      : `<button class="sk-btn" data-act="buy" data-s="${esc(s.id)}" ${can ? '' : 'disabled'}>${coinImg()} ${fmt(p)} · Comprar</button>`;
    return `<div class="sk-card r-${esc(s.rarity)}${(!owned && !isAvailable(s)) ? ' sk-off' : ''}" style="--c:${r.color}">
      <div class="sk-pair">
        <figure>${fallbackImg(base.__img0 || base.img, '👤')}Original</figure>
        <figure>${fallbackImg(s.img, '🎨')}Skin</figure>
      </div>
      <b>${esc(s.name)}</b><small>${esc(base.name)}</small>
      <span class="sk-rar">${r.icon} ${r.label}</span>${btn}</div>`;
  }

  function chestsHTML() {
    const s0 = load();
    const left = validSkins().filter(s => !s0.owned[s.id] && isAvailable(s)).length;
    let boxes = 0;
    try { boxes = window.INVENTARIO ? window.INVENTARIO.load().boxes || 0 : 0; } catch (e) { /* ignorar */ }
    return `<div class="sk-h">📦 Cofres</div><div class="sk-chests">
      <div class="sk-chest">
        <img class="sk-chest-img" src="${esc(BOX_IMG)}" alt="" onerror="this.outerHTML='<div class=&quot;sk-chest-img&quot;>📦</div>'">
        <div class="sk-chest-info"><b>Cofre normal</b>
          <small>Igual que los de las partidas: gloria, ${COINS_MIN}-${COINS_MAX} monedas y un ${Math.round(SKIN_CHANCE * 100)} % de skin. Se guarda en tu Inventario (${boxes} sin abrir).</small>
          <div class="sk-chest-btns">
            <button class="sk-btn" data-act="buyChest" ${s0.coins >= CHEST_PRICE ? '' : 'disabled'}>${coinImg()} ${fmt(CHEST_PRICE)} · Comprar</button>
            <button class="sk-btn alt" data-act="inv">📦 Inventario</button></div></div></div>
      <div class="sk-chest gold">
        <img class="sk-chest-img" src="${esc(SKIN_CHEST_IMG)}" alt="" onerror="this.outerHTML='<div class=&quot;sk-chest-img&quot;>🎁</div>'">
        <div class="sk-chest-info"><b>Cofre de skin garantizada</b>
          <small>Siempre te da una skin que aún no tengas. Solo varía la rareza (desde Común hasta Legendaria). Quedan ${left} por conseguir.</small>
          <div class="sk-chest-btns">
            <button class="sk-btn" data-act="buySkinChest" ${(s0.coins >= SKIN_CHEST_PRICE && left) ? '' : 'disabled'}>${coinImg()} ${fmt(SKIN_CHEST_PRICE)} · Comprar</button></div></div></div>
    </div><div class="sk-h">🎨 Catálogo de hoy</div>`;
  }

  function showSkinReveal(s) {
    const old = byId('sk-reveal'); if (old) old.remove();
    const r = rarityOf(s);
    const m = document.createElement('div');
    m.id = 'sk-reveal';
    m.innerHTML = `<div class="sk-rv" style="--c:${r.color}">
      ${fallbackImg(s.img, '🎨')}
      <h3>${esc(s.name)}</h3><span class="sk-rar">${r.icon} ${r.label}</span>
      <small>${esc(baseOf(s).name)}</small>
      <button class="sk-btn" data-act="closeReveal">¡Genial!</button></div>`;
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-act="closeReveal"]')) m.remove(); });
    document.body.appendChild(m);
  }

  function renderGrid() {
    const g = byId('sk-grid');
    if (!g) return;
    S = load();
    const list = shopSkins();
    g.innerHTML = list.length ? list.map(cardHTML).join('') : '<div class="sk-empty">No hay skins en el catálogo de hoy.</div>';
  }

  function renderShop() {
    S = load();
    const wrap = byId('sk-wrap');
    if (!wrap) return;
    const have = validSkins().filter(s => S.owned[s.id]).length;
    wrap.innerHTML = `
      <div class="sk-top">
        <h2 class="sk-title">🛒 Tienda de skins</h2>
        <div class="sk-bar"><span class="sk-wallet">${coinImg()} ${fmt(S.coins)} monedas</span>
          <button class="class-btn" data-act="back">⬅ Volver al inventario</button></div>
      </div>
      <div class="sk-bar">
        <span class="sk-timer">🔄 El catálogo cambia en <b id="sk-timer">--:--:--</b></span>
        <small class="sk-hint">Tienes ${have}/${validSkins().length} skins · Las monedas y skins también salen de los cofres 📦 · Elige apariencia en el 📖 Glosario</small>
      </div>
      <div class="sk-msg" id="sk-msg">${esc(ui.msg)}</div>
      ${chestsHTML()}
      <div class="sk-grid" id="sk-grid"></div>`;
    renderGrid();
  }

  function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'back') closeShop();
    else if (act === 'buy') { ui.msg = buy(b.dataset.s).msg; renderShop(); }
    else if (act === 'buyChest') { ui.msg = buyChest().msg; renderShop(); }
    else if (act === 'buySkinChest') { const r = buySkinChest(); ui.msg = r.msg; renderShop(); if (r.skin) showSkinReveal(r.skin); }
    else if (act === 'inv') { closeShop(); if (!invVisible() && window.INVENTARIO) window.INVENTARIO.open(); }
    else if (act === 'equip') { const s = skinById(b.dataset.s); if (s) equip(s.charId, s.id); ui.msg = '🎨 Skin equipada.'; renderShop(); }
    else if (act === 'unequip') { equip(b.dataset.c, null); ui.msg = 'Vuelves a la apariencia original.'; renderShop(); }
  }

  const invVisible = () => { const e = byId('inv-screen'); return !!e && e.style.display === 'flex'; };

  function openShop() {
    byId('main-menu').style.display = 'none';
    ui.open = true; ui.msg = '';
    const sc = byId('sk-screen');
    sc.style.display = 'flex'; sc.scrollTop = 0;
    renderShop();
    tickTimer();
    clearInterval(ui.timer); ui.timer = setInterval(tickTimer, 1000);
  }
  function tickTimer() {
    const el = byId('sk-timer');
    if (!el) return;
    const ms = msToNextDay();
    if (ui.day && ui.day !== dayNum()) { ui.day = dayNum(); renderShop(); return; }   // pasó la medianoche con la tienda abierta
    ui.day = dayNum();
    const t = Math.max(0, Math.floor(ms / 1000));
    el.textContent = [Math.floor(t / 3600), Math.floor(t % 3600 / 60), t % 60].map(n => String(n).padStart(2, '0')).join(':');
  }
  function closeShop() {
    clearInterval(ui.timer); ui.timer = null; ui.day = 0;
    ui.open = false;
    byId('sk-screen').style.display = 'none';
    if (invVisible()) { if (window.INVENTARIO && window.INVENTARIO.refresh) window.INVENTARIO.refresh(); }   // se abrió desde el Inventario: volvemos a él
    else byId('main-menu').style.display = 'flex';
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.open) closeShop(); });

  /* La Tienda ya no tiene botón en el menú principal: se abre desde el 🎒 Inventario (botón 🛒 Tienda). */
  function refreshChip() {
    const c = byId('sk-chip');
    if (c) c.innerHTML = coinImg() + ' ' + fmt(load().coins);
  }

  /* ---------------- selector en el glosario ---------------- */
  function hookGlossary() {
    const _detail = window.openCharacterDetail;
    if (typeof _detail === 'function') {
      window.openCharacterDetail = function (id) {
        const r = _detail.apply(this, arguments);
        try {
          const skins = skinsOf(id);
          const body = byId('glossary-detail-body');
          if (!skins.length || !body || body.querySelector('.sk-box')) return r;
          S = load();
          const base = findBaseById(id);
          const cur = S.selected[id] && S.owned[S.selected[id]] ? S.selected[id] : null;
          const opt = (skinId, img, label, ownedOk, sel) => `<button class="sk-opt${sel ? ' sel' : ''}${ownedOk ? '' : ' locked'}" ${ownedOk ? `data-skin="${esc(skinId)}"` : 'disabled'}
              title="${ownedOk ? esc(label) : esc(label) + ' — consíguela en cofres o en el catálogo de la tienda'}">${fallbackImg(img, '🎨')}<span>${esc(label)}</span></button>`;
          const box = document.createElement('div');
          box.className = 'sk-box';
          box.innerHTML = `<h4>🎨 Apariencia</h4><div class="sk-row">
            ${opt('', base.__img0 || base.img, 'Original', true, !cur)}
            ${skins.map(s => opt(s.id, s.img, s.name, !!S.owned[s.id], cur === s.id)).join('')}</div>
            <div class="sk-hint">Las skins con 🔒 salen en cofres 📦 o aparecen en el catálogo diario de la 🛒 Tienda.</div>`;
          const stats = body.querySelector('.glossary-stats');
          if (stats) body.insertBefore(box, stats); else body.appendChild(box);
          box.addEventListener('click', ev => {
            const o = ev.target.closest('.sk-opt');
            if (!o || o.disabled) return;
            equip(id, o.dataset.skin || null);
            try { renderGlossaryGrid(); } catch (e) { /* ignorar */ }
            window.openCharacterDetail(id);                     // repinta la ficha con la nueva imagen
          });
        } catch (err) { console.warn('[skins.js]', err); }
        return r;
      };
    }
  }

  /* ---------------- traducción (la recoge i18n.js) ---------------- */
  (window.I18N_DICTS = window.I18N_DICTS || []).push({ lang: 'en', entries: {
    '🛒 Tienda de skins': '🛒 Skin shop', '🛒 Tienda': '🛒 Shop', '⬅ Volver al inventario': '⬅ Back to inventory', '🎨 Apariencia': '🎨 Appearance',
    'Original': 'Original', 'Skin': 'Skin', 'Monedas': 'Coins', 'Común': 'Common', 'Rara': 'Rare', 'Épica': 'Epic', 'Evento': 'Event', 'Legendaria': 'Legendary',
    '{0} monedas': '{0} coins', '+{0} monedas': '+{0} coins', '🎨 ¡Skin nueva!': '🎨 New skin!',
    '🎨 Equipar': '🎨 Equip', '{0} · Comprar': '{0} · Buy', '✔ Equipada · quitar': '✔ Equipped · remove',
    'Buscar skin o personaje…': 'Search skin or character…',
    'No hay skins con ese nombre.': 'No skins with that name.',
    '🎨 Skin equipada.': '🎨 Skin equipped.',
    'Vuelves a la apariencia original.': 'Back to the original appearance.',
    '📦 Cofres': '📦 Boxes', '🎨 Skins': '🎨 Skins', 'Cofre normal': 'Normal box', 'Cofre de skin garantizada': 'Guaranteed skin box',
    '📦 Inventario': '📦 Inventory', '¡Genial!': 'Awesome!',
    'Igual que los de las partidas: gloria, {0}-{1} monedas y un {2} % de skin. Se guarda en tu Inventario ({3} sin abrir).': 'Just like the ones from matches: glory, {0}-{1} coins and a {2} % chance of a skin. It goes to your Inventory ({3} unopened).',
    'Siempre te da una skin que aún no tengas. Solo varía la rareza (desde Común hasta Legendaria). Quedan {0} por conseguir.': 'Always gives a skin you don\'t own yet. Only the rarity varies (from Common to Legendary). {0} left to get.',
    '📦 ¡Cofre comprado! Ya lo tienes en tu Inventario.': '📦 Box bought! It\'s now in your Inventory.',
    '🎁 ¡Te ha tocado «{0}»!': '🎁 You got «{0}»!',
    '¡Ya tienes todas las skins disponibles!': 'You already own all the available skins!',
    '⏳ Evento finalizado': '⏳ Event ended',
    'Esta skin de evento no está disponible ahora.': 'This event skin isn\'t available right now.',
    'Te faltan {0} monedas.': 'You need {0} more coins.',
    'Ya tienes esta skin.': 'You already own this skin.',
    'Las skins con 🔒 salen en cofres 📦 o aparecen en el catálogo diario de la 🛒 Tienda.': 'Skins with 🔒 drop from boxes 📦 or show up in the 🛒 Shop\'s daily catalog.',
    '🔄 El catálogo cambia en': '🔄 The catalog changes in', '🎨 Catálogo de hoy': '🎨 Today\'s catalog',
    'No hay skins en el catálogo de hoy.': 'No skins in today\'s catalog.',
    'Esa skin ya no está en el catálogo de hoy.': 'That skin is no longer in today\'s catalog.'
  } });

  /* ---------------- arranque ---------------- */
  function init() {
    injectCSS();
    injectScreen();
    applyAll();
    hookGlossary();
  }

  window.SKINS = {
    rollChest, describeBonus, addCoins, coinImg, rates, buy, equip, open: openShop,
    coins: () => load().coins, catalog: SKIN_CATALOG, reload: () => { S = load(); applyAll(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
