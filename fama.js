/* fama.js — SALÓN DE LA FAMA
   ---------------------------------------------------------------------------
   - Un panel nuevo en el menú principal, justo DEBAJO de "Amigos".
   - Muestra el top de jugadores con podio 🥇🥈🥉 y clasificación, ordenable por
     LIKES o por PUNTOS DE GLORIA.
   - Pulsa un jugador para ver su perfil completo (icono, rango, favoritos, récords).
   - ❤️ Da (o quita) un like a cualquier jugador, y ➕ añádelo como amigo.
   - Puedes ocultarte del salón con el interruptor "Aparecer en el salón de la fama".

   QUIÉN SALE EN EL SALÓN (no hay servidor)
     Tú, tus amigos, los jugadores que se han conectado contigo y los que tus amigos
     conocen (se pasan la lista entre ellos). Los likes viajan por la conexión directa
     entre jugadores: si el otro no está conectado, tu like queda pendiente y se
     entrega solo en cuanto coincidáis. Cada navegador cuenta un solo like por jugador.

   INSTALACIÓN (juego.html), DESPUÉS de perfil.js y amigos.js:
       <script src="perfil.js" defer></script>
       <script src="amigos.js" defer></script>
       <script src="fama.js" defer></script>
   (amigos.js debe ser la versión que trae  AMIGOS.fame ; viene incluida.)

   PORTADA DEL MENÚ:  personajes/fama.jpg  (constante COVER). Si el archivo no existe
   se muestra un 🏆 en su lugar.

   DÓNDE AJUSTAR COSAS:
     - Colores del podio:  MEDALS
     - Orden del ranking:  SORTS
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  if (!window.PERFIL || !window.AMIGOS || !window.AMIGOS.fame) {
    console.warn('[fama.js] Debe cargarse DESPUÉS de perfil.js y amigos.js (versión con AMIGOS.fame).');
    return;
  }
  const F = window.AMIGOS.fame;
  const PERFIL = window.PERFIL;

  const MEDALS = [
    { medal: '🥇', rgb: '251,191,36',  label: 'Número 1' },
    { medal: '🥈', rgb: '203,213,225', label: 'Número 2' },
    { medal: '🥉', rgb: '217,119,6',   label: 'Número 3' }
  ];

  const byName = (a, b) => a.snap.name.localeCompare(b.snap.name, 'es');
  const SORTS = {
    likes: (a, b) => (b.likes - a.likes) || (b.snap.points - a.snap.points) || byName(a, b),
    glory: (a, b) => (b.snap.points - a.snap.points) || (b.likes - a.likes) || byName(a, b)
  };

  const ui = { open: false, sort: 'likes', modal: null, pop: null };

  /* ---------------- utilidades ---------------- */
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n || 0).toLocaleString('es-ES');
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const charById = id => { try { return id ? PERFIL.charById(id) : null; } catch (e) { return null; } };

  function imgTag(src, alt, fb, cls) {
    return `<img src="${esc(src)}" alt="${esc(alt)}" data-fb="${esc(fb)}" data-cls="${esc(cls || '')}" loading="lazy" decoding="async">`;
  }
  function avatarHTML(snap) {
    const c = snap && charById(snap.avatar);
    return c ? imgTag(c.img, c.name, '🎮') : '🎮';
  }
  function wireFallbacks(root) {
    root.addEventListener('error', e => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.dataset.fb) return;
      const fb = document.createElement('div');
      fb.className = img.dataset.cls || '';
      fb.textContent = img.dataset.fb;
      img.replaceWith(fb);
    }, true);
  }
  function ago(ts) {
    if (!ts) return 'nunca';
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return 'hace un momento';
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    return h < 24 ? `hace ${h} h` : `hace ${Math.floor(h / 24)} d`;
  }

  const ranked = () => F.list().sort(SORTS[ui.sort]);

  /* ---------------- estilos ---------------- */
  function injectStyles() {
    if (byId('fama-styles')) return;
    const st = document.createElement('style');
    st.id = 'fama-styles';
    st.textContent = `
    /* ---------- Panel del menú ---------- */
    .fm-poster-panel{border-color:rgba(251,191,36,.55)!important;
      background:radial-gradient(circle at 50% 0%,rgba(251,191,36,.22),transparent 55%),linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),#14100a!important;
      box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 46px rgba(251,191,36,.16)!important}
    .fm-poster-panel:hover{box-shadow:0 30px 78px rgba(0,0,0,.58),0 0 62px rgba(251,191,36,.34)!important}
    .fm-poster-panel .story-poster-frame{position:relative}
    .fm-poster-panel .story-poster-frame img{max-height:200px}
    .fm-poster-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:150px;font-size:64px;
      background:radial-gradient(circle at 50% 35%,rgba(251,191,36,.32),transparent 62%),linear-gradient(180deg,#2a1d06,#0f0b04)}
    .fm-poster-avs{position:absolute;right:8px;bottom:8px;display:flex;padding:4px 6px 4px 14px;border-radius:99px;background:rgba(5,10,24,.62);backdrop-filter:blur(6px)}
    .fm-poster-avs:empty{display:none}
    .fm-mini-av{display:flex;align-items:center;justify-content:center;width:30px;height:30px;margin-left:-8px;border-radius:50%;overflow:hidden;font-size:15px;background:#0d1730;
      box-shadow:0 0 0 2px rgb(var(--rank-rgb,251,191,36)),0 4px 10px rgba(0,0,0,.5)}
    .fm-mini-av:first-child{margin-left:0}
    .fm-mini-av img{width:100%;height:100%;object-fit:cover;object-position:center 18%}
    .fm-poster-panel .story-poster-subtitle{color:#fde68a!important}
    .fm-poster-panel .story-poster-cta{background:linear-gradient(180deg,#fde047,#d97706)!important;color:#1a1204!important}

    /* ---------- Pantalla ---------- */
    #fama-screen{position:fixed;inset:0;display:none;align-items:flex-start;justify-content:center;padding:24px 16px 48px;overflow:auto;z-index:126;color:#fff;
      background:radial-gradient(circle at 50% -6%,rgba(251,191,36,.2),transparent 40%),radial-gradient(circle at 10% 30%,rgba(244,114,182,.12),transparent 36%),
      radial-gradient(circle at 92% 62%,rgba(56,189,248,.12),transparent 38%),linear-gradient(180deg,#0a0a14,#0b1226 55%,#04070f)}
    .fm-wrap{width:min(1040px,100%);display:flex;flex-direction:column;gap:22px}
    .fm-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .fm-title{margin:0;font-size:clamp(24px,3vw,36px);font-weight:800;letter-spacing:-.02em;background:linear-gradient(90deg,#fff,#fde68a,#fbcfe8);-webkit-background-clip:text;background-clip:text;color:transparent}
    .fm-h{display:flex;align-items:center;gap:10px;margin:4px 0 -6px;font-size:18px;font-weight:800}
    .fm-h::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(251,191,36,.5),transparent)}
    .fm-h small{font-weight:500;color:#8fa0bb;font-size:12px}
    .fm-panel{display:flex;flex-direction:column;gap:12px;padding:16px 20px;border-radius:20px;border:1px solid rgba(255,255,255,.1);
      background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),#0b1226;box-shadow:0 18px 44px rgba(0,0,0,.42)}
    .fm-panel-row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .fm-count{font-size:14px;font-weight:600;color:#dbe5f5}
    .fm-seg{display:inline-flex;padding:4px;border-radius:99px;background:rgba(5,10,24,.8);border:1px solid rgba(255,255,255,.12)}
    .fm-seg button{padding:8px 16px;border:0;border-radius:99px;background:transparent;color:#a9b8d0;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s,color .15s}
    .fm-seg button.on{color:#1a1204;background:linear-gradient(180deg,#fde047,#f59e0b);box-shadow:0 6px 16px rgba(245,158,11,.35)}
    .fm-opt{display:flex;align-items:center;gap:8px;font-size:13px;color:#a9b8d0;cursor:pointer;user-select:none}
    .fm-note{font-size:12px;color:#8fa0bb;line-height:1.5}
    .fm-conn{font-size:12.5px;color:#fcd34d}

    /* ---------- Podio ---------- */
    .fm-podium{display:grid;grid-template-columns:1fr 1.16fr 1fr;gap:16px;align-items:end}
    .fm-pod{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 14px 0;border-radius:24px 24px 14px 14px;overflow:hidden;cursor:pointer;text-align:center;
      border:1px solid rgba(var(--c),.55);background:linear-gradient(180deg,rgba(var(--c),.16),rgba(9,18,40,.96) 70%),#0a1226;
      box-shadow:0 18px 44px rgba(0,0,0,.45),0 0 36px rgba(var(--c),.18);transition:transform .2s,box-shadow .2s}
    .fm-pod:hover{transform:translateY(-6px);box-shadow:0 26px 56px rgba(0,0,0,.55),0 0 56px rgba(var(--c),.38)}
    .fm-pod--first{padding-top:30px}
    .fm-pod::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 0%,rgba(var(--c),.28),transparent 55%)}
    .fm-pod>*{position:relative}
    .fm-pod-medal{font-size:30px;line-height:1;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))}
    .fm-pod--first .fm-pod-medal{font-size:38px}
    .fm-pod-av{position:relative;display:flex;align-items:center;justify-content:center;width:96px;height:96px;border-radius:50%;font-size:40px;background:#0d1730;
      box-shadow:0 0 0 4px rgb(var(--c)),0 0 26px rgba(var(--c),.55)}
    .fm-pod--first .fm-pod-av{width:128px;height:128px;font-size:52px}
    .fm-pod-av img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:center 18%}
    .fm-crown{position:absolute;top:-12px;right:-10px;transform:rotate(24deg);font-size:36px;filter:drop-shadow(0 4px 10px rgba(251,191,36,.7));z-index:2}
    .fm-pod-name{max-width:100%;padding:0 6px;font-size:19px;font-weight:800;letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .fm-pod--first .fm-pod-name{font-size:23px}
    .fm-pod-name em,.fm-who em{font-style:normal;font-size:.62em;font-weight:700;color:#93c5fd;margin-left:4px}
    .fm-rk{font-size:12.5px;font-weight:700;color:rgb(var(--rank-rgb,148,163,184))}
    .fm-rk span{color:#9fb0c9;font-weight:600}
    .fm-pod-acts{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:4px}
    .fm-pod-base{align-self:stretch;margin-top:6px;padding:9px 0;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgb(var(--c));
      background:rgba(var(--c),.12);border-top:1px solid rgba(var(--c),.35)}
    .fm-pod--first .fm-pod-base{padding:13px 0}
    .fm-pod--empty{cursor:default;opacity:.7;border-style:dashed;padding-bottom:18px;min-height:210px;justify-content:center}
    .fm-pod--empty:hover{transform:none;box-shadow:0 18px 44px rgba(0,0,0,.45)}
    .fm-pod--empty .fm-pod-av{box-shadow:0 0 0 3px rgba(var(--c),.4);color:rgba(var(--c),.8);background:rgba(var(--c),.08)}
    .fm-empty-txt{font-size:12px;color:#8fa0bb;max-width:200px}

    /* ---------- Botones ---------- */
    .fm-like{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:99px;cursor:pointer;font:inherit;font-size:14px;color:#fbcfe8;
      border:1px solid rgba(244,114,182,.5);background:rgba(244,114,182,.1);transition:transform .15s,background .15s,box-shadow .15s}
    .fm-like b{font-size:15px;color:#fff}
    button.fm-like:hover{transform:scale(1.07);background:rgba(244,114,182,.22)}
    .fm-like.on{background:linear-gradient(180deg,rgba(244,114,182,.5),rgba(190,24,93,.5));border-color:#f472b6;box-shadow:0 0 18px rgba(244,114,182,.45)}
    .fm-like--me{cursor:default;border-style:dashed}
    .fm-like.pop .fm-heart{display:inline-block;animation:fm-pop .6s ease}
    .fm-add{padding:8px 15px;border:0;border-radius:99px;cursor:pointer;font:inherit;font-size:13px;font-weight:800;color:#04210f;background:linear-gradient(180deg,#4ade80,#22c55e);
      box-shadow:0 6px 16px rgba(34,197,94,.3);transition:transform .15s}
    .fm-add:hover{transform:scale(1.06)}
    .fm-friend{padding:7px 13px;border-radius:99px;font-size:12.5px;font-weight:800;color:#86efac;border:1px solid rgba(74,222,128,.5);background:rgba(74,222,128,.1)}

    /* ---------- Clasificación ---------- */
    .fm-list{display:flex;flex-direction:column;gap:10px}
    .fm-row{display:grid;grid-template-columns:48px 58px minmax(0,1fr) auto auto;align-items:center;gap:14px;padding:12px 16px;border-radius:18px;cursor:pointer;
      border:1px solid rgba(var(--rank-rgb,148,163,184),.35);background:linear-gradient(90deg,rgba(var(--rank-rgb,148,163,184),.09),rgba(255,255,255,.012) 55%),#09122a;
      box-shadow:0 8px 22px rgba(0,0,0,.35);transition:transform .15s,box-shadow .15s}
    .fm-row:hover{transform:translateX(4px);box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 26px rgba(var(--rank-rgb,148,163,184),.2)}
    .fm-row.me{border-color:rgba(147,197,253,.6)}
    .fm-pos{font-size:19px;font-weight:800;color:#9fb0c9;text-align:center}
    .fm-av{position:relative;display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;font-size:24px;background:#0d1730;
      box-shadow:0 0 0 3px rgb(var(--rank-rgb,148,163,184)),0 0 14px rgba(var(--rank-rgb,148,163,184),.4)}
    .fm-av img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:center 18%}
    .fm-dot{position:absolute;right:-2px;bottom:-2px;width:15px;height:15px;border-radius:50%;border:3px solid #09122a;background:#64748b}
    .fm-dot.on{background:#4ade80;box-shadow:0 0 10px #4ade80}
    .fm-who{display:flex;flex-direction:column;gap:2px;min-width:0}
    .fm-who b{font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .fm-who small{font-size:12px;color:#9fb0c9}
    .fm-favs{display:flex;gap:6px}
    .fm-fav{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;overflow:hidden;font-style:normal;font-size:14px;color:#64748b;background:#0d1730;border:1px solid rgba(255,255,255,.12)}
    .fm-fav img{width:100%;height:100%;object-fit:cover;object-position:center 15%}
    .fm-acts{display:flex;align-items:center;gap:8px}
    @media (max-width:760px){
      .fm-podium{grid-template-columns:1fr;gap:14px}
      .fm-pod--first{order:-1}
      .fm-row{grid-template-columns:34px 50px minmax(0,1fr);gap:10px;padding:12px}
      .fm-row .fm-favs{display:none}
      .fm-row .fm-acts{grid-column:1 / -1;justify-content:flex-end}
      .fm-av{width:48px;height:48px}
    }

    /* ---------- Perfil (ventana) ---------- */
    .fm-modal{position:fixed;inset:0;z-index:150;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(1,5,15,.78);backdrop-filter:blur(10px);animation:fm-fade .18s}
    .fm-pf{position:relative;width:min(760px,100%);max-height:min(90vh,820px);overflow:auto;display:flex;flex-direction:column;gap:18px;padding:24px;border-radius:26px;
      border:1px solid rgba(var(--rank-rgb),.5);background:linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.012)),#09122a;
      box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 60px rgba(var(--rank-rgb),.18);animation:fm-pop-in .22s;scrollbar-width:thin}
    .fm-x{position:absolute;top:14px;right:14px;z-index:2;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:14px;cursor:pointer}
    .fm-x:hover{background:rgba(239,68,68,.45)}
    .fm-pf-head{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
    .fm-pf-av{display:flex;align-items:center;justify-content:center;width:124px;height:124px;flex:0 0 auto;border-radius:50%;font-size:50px;background:#0d1730;overflow:hidden;
      box-shadow:0 0 0 4px rgb(var(--rank-rgb)),0 0 30px rgba(var(--rank-rgb),.5)}
    .fm-pf-av img{width:100%;height:100%;object-fit:cover;object-position:center 18%}
    .fm-pf-id{flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:8px}
    .fm-pf-id h3{margin:0;padding-right:36px;font-size:clamp(24px,3.4vw,32px);font-weight:800;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis}
    .fm-pf-id h3 em{font-style:normal;font-size:.5em;color:#93c5fd}
    .fm-pf-acts{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px}
    .fm-live{font-size:12px;font-weight:700;color:#cbd5e1}
    .fm-live.on{color:#4ade80}
    .fm-pf .pf-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}
    .fm-sub{margin:2px 0 -6px;font-size:15px;font-weight:800}
    .fm-pf-favs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .fm-pf-fav{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(var(--c),.55);background:linear-gradient(180deg,rgba(var(--c),.12),rgba(9,18,40,.96)),#0a1226}
    .fm-pf-fav .art{height:120px;display:flex;align-items:center;justify-content:center;font-size:40px;background:radial-gradient(circle at 50% 30%,rgba(var(--c),.25),rgba(5,10,24,.9))}
    .fm-pf-fav .art img{width:100%;height:100%;object-fit:cover;object-position:center 15%}
    .fm-pf-fav span.m{position:absolute;top:8px;left:8px;padding:2px 8px;border-radius:99px;font-size:13px;background:rgba(5,10,24,.75);border:1px solid rgba(var(--c),.55)}
    .fm-pf-fav div.n{padding:8px 10px;font-size:12.5px;font-weight:800;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .fm-mp{display:flex;gap:18px;flex-wrap:wrap;padding:12px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:13px;color:#b9c6da}
    .fm-mp b{color:#fff;font-size:15px}
    @media (max-width:560px){.fm-pf{padding:18px}.fm-pf-head{justify-content:center;text-align:center}.fm-pf-acts{justify-content:center}.fm-pf-favs{gap:8px}}

    .fm-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:170;max-width:90vw;padding:12px 20px;border-radius:99px;font-size:14px;font-weight:700;
      background:rgba(9,18,38,.95);border:1px solid rgba(74,222,128,.55);box-shadow:0 14px 40px rgba(0,0,0,.55);animation:fm-pop-in .22s}

    @keyframes fm-fade{from{opacity:0}to{opacity:1}}
    @keyframes fm-pop-in{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
    @keyframes fm-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @keyframes fm-pop{0%{transform:scale(1)}30%{transform:scale(1.9) rotate(-12deg)}60%{transform:scale(.9)}100%{transform:scale(1)}}
    .fm-anim .fm-wrap > *{animation:fm-rise .5s both}
    .fm-anim .fm-wrap > *:nth-child(2){animation-delay:.05s}.fm-anim .fm-wrap > *:nth-child(3){animation-delay:.1s}
    .fm-anim .fm-wrap > *:nth-child(4){animation-delay:.15s}.fm-anim .fm-wrap > *:nth-child(5){animation-delay:.2s}
    @media (prefers-reduced-motion:reduce){.fm-anim .fm-wrap > *,.fm-modal,.fm-pf,.fm-toast,.fm-like.pop .fm-heart{animation:none!important}}
    `;
    document.head.appendChild(st);
  }

  /* ---------------- piezas ---------------- */
  function likeBtn(e) {
    if (e.me) return `<span class="fm-like fm-like--me" title="Likes que has recibido">❤️ <b>${fmt(e.likes)}</b></span>`;
    return `<button class="fm-like${e.liked ? ' on' : ''}${ui.pop === e.key ? ' pop' : ''}" data-like="${esc(e.key)}" title="${e.liked ? 'Quitar like' : 'Dar like'}">` +
      `<span class="fm-heart">${e.liked ? '❤️' : '🤍'}</span> <b>${fmt(e.likes)}</b></button>`;
  }
  function addBtn(e) {
    if (e.me) return '';
    if (e.friend) return '<span class="fm-friend">✔ Amigo</span>';
    return `<button class="fm-add" data-add="${esc(e.key)}">➕ Añadir</button>`;
  }
  const rankLine = s => `<div class="fm-rk">${esc(s.rank.icon)} ${esc(s.rank.name)} <span>· ${fmt(s.points)} 🏅</span></div>`;

  function podCard(e, i) {
    const m = MEDALS[i], first = i === 0 ? ' fm-pod--first' : '';
    if (!e) {
      return `<div class="fm-pod fm-pod--empty${first}" style="--c:${m.rgb}">
        <div class="fm-pod-medal">${m.medal}</div><div class="fm-pod-av">?</div>
        <div class="fm-pod-name">Puesto libre</div><div class="fm-empty-txt">Añade amigos para llenar el podio</div></div>`;
    }
    const s = e.snap;
    return `<div class="fm-pod${first}" style="--c:${m.rgb};--rank-rgb:${s.rank.rgb}" data-view="${esc(e.key)}" role="button" tabindex="0">
      <div class="fm-pod-medal">${m.medal}</div>
      <div class="fm-pod-av">${i === 0 ? '<span class="fm-crown">👑</span>' : ''}${avatarHTML(s)}</div>
      <div class="fm-pod-name">${esc(s.name)}${e.me ? '<em>(Tú)</em>' : ''}</div>
      ${rankLine(s)}
      <div class="fm-pod-acts">${likeBtn(e)}${addBtn(e)}</div>
      <div class="fm-pod-base">${m.label}</div>
    </div>`;
  }

  function rowHTML(e, pos) {
    const s = e.snap;
    const favs = [0, 1, 2].map(i => {
      const c = charById(s.favs[i]);
      return `<span class="fm-fav" title="${c ? esc(c.name) : 'Sin elegir'}">${c ? imgTag(c.img, c.name, '👤') : '<i>?</i>'}</span>`;
    }).join('');
    return `<div class="fm-row${e.me ? ' me' : ''}" style="--rank-rgb:${s.rank.rgb}" data-view="${esc(e.key)}" role="button" tabindex="0">
      <div class="fm-pos">#${pos}</div>
      <div class="fm-av">${avatarHTML(s)}<span class="fm-dot${e.online ? ' on' : ''}"></span></div>
      <div class="fm-who"><b>${esc(s.name)}${e.me ? '<em>(Tú)</em>' : ''}</b>${rankLine(s)}
        <small>${e.me ? 'Este eres tú' : (e.online ? '🟢 En línea' : '⚫ Visto ' + ago(e.seen))}</small></div>
      <div class="fm-favs">${favs}</div>
      <div class="fm-acts">${likeBtn(e)}${addBtn(e)}</div>
    </div>`;
  }

  function connText() {
    const s = F.status();
    if (s === 'ready') return '';
    const map = {
      off: '⚪ Estás desconectado de amigos: solo verás los perfiles guardados y tus likes quedarán pendientes.',
      noname: '⚠️ Ponle un nombre a tu perfil para aparecer en el salón y poder dar likes.',
      connecting: '🟡 Conectando con la red de jugadores…',
      taken: '🔴 Hay otra persona conectada con tu mismo nombre: cambia el nombre de tu perfil.',
      error: '🔴 Sin conexión con la red de jugadores. Reintentando…'
    };
    return map[s] || '';
  }

  function render() {
    const wrap = byId('fm-wrap');
    if (!wrap || !ui.open) return;
    const list = ranked();
    const others = list.filter(e => !e.me);
    const online = others.filter(e => e.online).length;
    const conn = connText();
    const podium = [1, 0, 2].map(i => podCard(list[i], i)).join('');
    const rest = list.slice(3);
    wrap.innerHTML = `
      <div class="fm-top">
        <h2 class="fm-title">🏆 Salón de la fama</h2>
        <button id="fm-back" class="class-btn">⬅ Volver al menú</button>
      </div>
      <section class="fm-panel">
        <div class="fm-panel-row">
          <span class="fm-count">👥 ${list.length} ${list.length === 1 ? 'jugador' : 'jugadores'} · 🟢 ${online} en línea</span>
          <div class="fm-seg" role="group" aria-label="Ordenar">
            <button data-sort="likes" class="${ui.sort === 'likes' ? 'on' : ''}">❤️ Más likes</button>
            <button data-sort="glory" class="${ui.sort === 'glory' ? 'on' : ''}">🏅 Más gloria</button>
          </div>
        </div>
        <div class="fm-panel-row">
          <label class="fm-opt"><input type="checkbox" id="fm-opt" ${F.isOn() ? 'checked' : ''}> Aparecer en el salón de la fama</label>
          ${conn ? `<span class="fm-conn">${conn}</span>` : ''}
        </div>
        <div class="fm-note">Aquí salen tú, tus amigos y los jugadores que ellos conocen. Los likes se entregan cuando el otro jugador está conectado.</div>
      </section>
      <div class="fm-podium">${podium}</div>
      ${rest.length ? `<div class="fm-h">📜 Clasificación <small>${ui.sort === 'likes' ? 'ordenada por likes' : 'ordenada por puntos de gloria'}</small></div>
        <div class="fm-list">${rest.map((e, i) => rowHTML(e, i + 4)).join('')}</div>` : ''}`;
  }

  /* ---------------- perfil en ventana ---------------- */
  function profileHTML(e) {
    const s = e.snap, rk = s.rank;
    const tile = (rgb, ic, num, lbl) => `<div class="pf-tile" style="--t:${rgb}"><span class="pf-tile-ic">${ic}</span>
      <div><div class="pf-tile-num">${num}</div><div class="pf-tile-lbl">${lbl}</div></div></div>`;
    const of = (a, b) => (b ? `${fmt(a)}<small> / ${fmt(b)}</small>` : '—');
    const favs = [0, 1, 2].map(i => {
      const m = MEDALS[i], c = charById(s.favs[i]);
      return `<div class="fm-pf-fav" style="--c:${m.rgb}"><span class="m">${m.medal}</span>
        <div class="art">${c ? imgTag(c.img, c.name, '👤') : '❔'}</div><div class="n">${c ? esc(c.name) : 'Sin elegir'}</div></div>`;
    }).join('');
    const mp = s.mp, mpPct = mp.played ? Math.round(mp.w / mp.played * 100) : 0;
    return `<div class="fm-pf" style="--rank-rgb:${rk.rgb}" role="dialog" aria-modal="true">
      <button class="fm-x" data-close-modal title="Cerrar">✕</button>
      <div class="fm-pf-head">
        <div class="fm-pf-av">${avatarHTML(s)}</div>
        <div class="fm-pf-id">
          <h3>${esc(s.name)} ${e.me ? '<em>(Tú)</em>' : ''}</h3>
          <div class="pf-rank-row" style="margin:0"><span class="pf-rank-badge">${esc(rk.icon)} ${esc(rk.name)}</span>
            <span class="pf-points"><b>${fmt(s.points)}</b> puntos de gloria</span></div>
          <div class="pf-xp"><i style="width:${rk.pct}%"></i></div>
          <div class="pf-xp-label">${rk.nextMin ? `${fmt(s.points)} / ${fmt(rk.nextMin)} para ser ${esc(rk.nextIcon)} ${esc(rk.nextName)}` : '¡Rango máximo!'}</div>
          <div class="fm-pf-acts">${likeBtn(e)}${addBtn(e)}
            <span class="fm-live ${e.online ? 'on' : ''}">${e.me ? '' : (e.online ? '🟢 En línea' : '⚫ Datos de ' + ago(e.seen))}</span></div>
        </div>
      </div>
      <div class="pf-tiles">
        ${tile('56,189,248', '⚔️', fmt(s.freeWins), 'Victorias en batalla libre')}
        ${tile('251,191,36', '📖', of(s.story.reached, s.story.total), 'Capítulos de Historia')}
        ${tile('168,85,247', '🎖️', of(s.medals.n, s.medals.max), 'Medallas del Desafío')}
        ${tile('251,113,133', '🔥', fmt(s.hell.highest), 'Piso más alto del Infierno')}
      </div>
      <div class="fm-sub">⭐ Personajes favoritos</div>
      <div class="fm-pf-favs">${favs}</div>
      <div class="fm-sub">🌐 Multijugador online</div>
      <div class="fm-mp"><span><b>${fmt(mp.played)}</b> partidas</span><span><b>${fmt(mp.w)}</b> victorias</span><span><b>${fmt(mp.l)}</b> derrotas</span>
        <span><b>${mpPct}%</b> winrate</span><span>🔥 mejor racha <b>${fmt(mp.best)}</b></span></div>
    </div>`;
  }

  function renderModal() {
    let m = byId('fm-modal');
    if (!ui.modal) { if (m) m.remove(); return; }
    const e = F.list().find(x => x.key === ui.modal);
    if (!e) { ui.modal = null; if (m) m.remove(); return; }
    if (!m) {
      m = document.createElement('div');
      m.id = 'fm-modal';
      m.className = 'fm-modal';
      byId('fama-screen').appendChild(m);
    }
    const old = m.querySelector('.fm-pf'), top = old ? old.scrollTop : 0;
    m.innerHTML = profileHTML(e);
    const nu = m.querySelector('.fm-pf');
    if (nu && top) nu.scrollTop = top;
  }

  function closeModal() { ui.modal = null; renderModal(); }

  function renderAll() { render(); renderModal(); }

  let toastT = null;
  function toast(msg) {
    const old = byId('fm-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'fm-toast';
    t.className = 'fm-toast';
    t.textContent = msg;
    byId('fama-screen').appendChild(t);
    clearTimeout(toastT);
    toastT = setTimeout(() => { const x = byId('fm-toast'); if (x) x.remove(); }, 2600);
  }

  /* ---------------- eventos ---------------- */
  function onClick(ev) {
    const t = ev.target;
    if (t.id === 'fm-modal' || t.closest('[data-close-modal]')) return closeModal();
    if (t.closest('#fm-back')) return closeFama();

    const like = t.closest('[data-like]');
    if (like) {
      ev.stopPropagation();
      const key = like.dataset.like;
      if (F.like(key)) { ui.pop = key; setTimeout(() => { ui.pop = null; }, 900); }
      return renderAll();
    }
    const add = t.closest('[data-add]');
    if (add) {
      ev.stopPropagation();
      const key = add.dataset.add, e = F.list().find(x => x.key === key);
      const ok = F.add(key);
      toast(ok ? `✅ ${e ? e.snap.name : 'Jugador'} añadido a tus amigos` : 'No se ha podido añadir ahora mismo');
      return renderAll();
    }
    const sort = t.closest('[data-sort]');
    if (sort) { ui.sort = sort.dataset.sort; return renderAll(); }

    const view = t.closest('[data-view]');
    if (view) { ui.modal = view.dataset.view; renderModal(); }
  }

  function onKey(ev) {
    if (ev.key === 'Enter' && ev.target.matches && ev.target.matches('[data-view]')) {
      ui.modal = ev.target.dataset.view; renderModal();
    }
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !ui.open) return;
    if (ui.modal) closeModal(); else closeFama();
  });

  /* ---------------- abrir / cerrar ---------------- */
  function openFama() {
    byId('main-menu').style.display = 'none';
    ui.open = true; ui.modal = null;
    const sc = byId('fama-screen');
    sc.style.display = 'flex';
    sc.scrollTop = 0;
    if (!reduceMotion()) { sc.classList.add('fm-anim'); setTimeout(() => sc.classList.remove('fm-anim'), 1000); }
    F.connectAll();            // busca a tus amigos y entrega los likes pendientes
    renderAll();
  }

  function closeFama() {
    ui.open = false; ui.modal = null;
    renderModal();
    byId('fama-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
  }

  /* ---------------- panel del menú ---------------- */
  const COVER = 'personajes/fama.jpg';    // portada del panel (si no existe, se ve un 🏆)
  let posterSig = '';
  function updatePoster() {
    const p = byId('menu-fama');
    if (!p) return;
    const top = ranked().slice(0, 3);
    const sig = top.map(e => e.key + '|' + e.snap.avatar + '|' + e.snap.rank.rgb).join(',') + '#' + F.list().length;
    if (sig === posterSig) return;
    posterSig = sig;
    const n = F.list().length;
    const sub = p.querySelector('.story-poster-subtitle');
    if (sub) sub.textContent = n > 1 ? `${n} jugadores · mira quién lidera` : 'Likes y perfiles de jugadores';
    const avs = p.querySelector('.fm-poster-avs');
    if (avs) avs.innerHTML = top.map(e => `<span class="fm-mini-av" style="--rank-rgb:${e.snap.rank.rgb}">${avatarHTML(e.snap)}</span>`).join('');
  }

  function place() {
    const panel = byId('menu-fama'), am = byId('menu-amigos');
    if (!panel || !am || !am.parentElement) return;
    if (am.nextElementSibling !== panel) am.parentElement.insertBefore(panel, am.nextSibling);
  }

  function injectMarkup() {
    if (!byId('fama-screen')) {
      const sc = document.createElement('div');
      sc.id = 'fama-screen';
      sc.innerHTML = '<div class="fm-wrap" id="fm-wrap"></div>';
      document.body.appendChild(sc);
      wireFallbacks(sc);
      sc.addEventListener('click', onClick);
      sc.addEventListener('keydown', onKey);
      sc.addEventListener('change', ev => { if (ev.target.id === 'fm-opt') { F.setOn(ev.target.checked); renderAll(); } });
    }
    if (!byId('menu-fama')) {
      const btn = document.createElement('button');
      btn.id = 'menu-fama';
      btn.className = 'story-poster-panel fm-poster-panel';
      btn.innerHTML = `
        <div class="story-poster-frame">${imgTag(COVER, 'Salón de la fama', '🏆', 'fm-poster-fallback')}<div class="fm-poster-avs"></div></div>
        <span class="story-poster-title">🏆 Salón de la fama</span>
        <span class="story-poster-subtitle">Likes y perfiles de jugadores</span>
        <span class="story-poster-cta">▶ Ver el top</span>`;
      wireFallbacks(btn);
      btn.addEventListener('click', openFama);
      const layout = document.querySelector('#main-menu .menu-layout');
      (byId('menu-amigos') && byId('menu-amigos').parentElement || layout || document.body).appendChild(btn);
    }
    place();
    updatePoster();
    // Infierno, Desafío o Amigos pueden recolocar sus paneles más tarde: el salón siempre vuelve debajo de Amigos.
    const layout = document.querySelector('#main-menu .menu-layout');
    if (layout && window.MutationObserver) new MutationObserver(place).observe(layout, { childList: true, subtree: true });
  }

  /* ---------------- arranque ---------------- */
  let rt = null;
  function init() {
    injectStyles();
    injectMarkup();
    F.onChange(() => {
      updatePoster();
      if (!ui.open) return;
      clearTimeout(rt);
      rt = setTimeout(renderAll, 150);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.FAMA = { open: openFama };
})();
