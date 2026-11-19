/* cooperativo.js — Modo COOPERATIVO online contra JEFES
   ---------------------------------------------------------------------------
   Dos jugadores (cada uno desde su dispositivo) se alían contra un JEFE único
   de este modo. Cada jugador elige 3 personajes (6 en total). En combate hay
   2 personajes al frente —uno de cada jugador— y los otros 4 esperan en
   reserva. Cada jugador pilota SU personaje; puedes cambiarlo (gratis) por uno
   de tu reserva, y tus habilidades de apoyo pueden curar/proteger también a
   los personajes de tu compañero. Al derrotar al jefe: ¡grandes recompensas!

   INSTALACIÓN (juego.html), DESPUÉS de multijugador.js:
       <script src="cooperativo.js" defer></script>
   Además:  game.js (con los 2 ganchos COOP_HOOK) y skins.js (con SKINS.grantSkin).

   CÓMO FUNCIONA (igual que multijugador.js)
     - Los dos navegadores ejecutan el MISMO motor de combate (game.js) con la
       misma semilla aleatoria. Solo viajan las ACCIONES (habilidad, cambio,
       saltar turno). El jefe lo mueve una IA determinista en los dos lados.
     - Tras cada acción se compara una huella (hash) del estado; si no coincide,
       el anfitrión manda una copia y se resincroniza.
     - Conexión por PeerJS (WebRTC), con código de sala de 5 caracteres.
     - «Probar en solitario»: controlas a los dos jugadores tú solo (sin red y
       SIN recompensas). Útil para probar o practicar.

   TURNOS
     Cada ronda actúan los 2 personajes del frente y el jefe, ordenados por SPD
     efectiva. Con poca vida algunos jefes se enfurecen (más ATK y/o dos acciones
     por ronda). No hay muerte súbita en este modo.

   PARA AÑADIR / EDITAR JEFES: mira la lista BOSSES justo debajo. Cada jefe usa
   el mismo formato de habilidades que personajes.js. Para usar tu propio dibujo:
       img: 'personajes/mi-jefe.png'
   Para que suene una música propia durante el combate contra ese jefe:
       music: 'bosses_cooperativo/music/mi-jefe.mp3'
   (si no pones img se genera un retrato con el emoji `icon`).

   JEFES DOBLES (duo:true) — ejemplo: «Nahamah y Lilith». Llevan `members` (los dos jefes, con
   su img/music/moves) y `stage2` (el jefe de la segunda fase, con `intro`). Ver el comentario
   sobre ese jefe más abajo para las mecánicas (special: chains / doom / guard / bloodpact).
   ------------------------------------------------------------------------- */
(function () {
  'use strict';

  const VERSION = 2;                       // v2: jefes dobles (nuevo protocolo de acciones)
  const PEER_SOURCES = [
    'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
    'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js'
  ];
  const ID_PREFIX = 'batallamejorada-coop-';
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const NICK_KEY = 'batalla-mp-nick';      // comparte el nombre con el multijugador
  const PROG_KEY = 'batalla-coop';          // progreso: veces que has derrotado a cada jefe
  const PING_MS = 4000;
  const PEER_TIMEOUT_MS = 45000;
  const TURN_MS = 75 * 1000;                // tiempo máximo por turno de jugador
  const COVER = 'personajes/cooperativo.png';   // portada del panel del menú (cámbiala si quieres)
  const BOSS_THINK_MS = 900;                // pausa antes de que actúe el jefe

  const W = window;
  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const cleanNick = s => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16);
  const fmt = n => Number(n || 0).toLocaleString('es-ES');
  const safeLog = m => { try { if (typeof log === 'function') log(m); } catch (e) { /* ignorar */ } };

  /* =====================================================================
     JEFES  (únicos de este modo)
       hp/atk/def/spd ........ estadísticas (el daño es power·ATK/DEF·0.7, como siempre)
       ccResist .............. prob. de resistir aturdir/congelar/embelesar/miedo (0–1)
       phases ................ al bajar de «at» (fracción de vida) ocurre algo una vez:
                               atk/def/spd (suman), heal (% vida máx), shield, actions
                               (acciones por ronda a partir de entonces), cleanse
       moves ................. igual que en personajes.js  ·  ult:true = la IA la prefiere
                               aiWeight = preferencia extra de la IA (por defecto 1)
       rewards ............... coins/chests: SIEMPRE que ganes. firstCoins/firstChests: extra la
                               1ª vez que derrotas a ese jefe. skinAllow: rarezas de la skin
                               garantizada de la 1ª victoria. repeatSkinChance: prob. de skin en
                               las siguientes victorias.
     ===================================================================== */
  const bossSvg = (icon, c1, c2) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><radialGradient id="g" cx="50%" cy="42%" r="68%">' +
    '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></radialGradient></defs>' +
    '<rect width="300" height="300" rx="40" fill="url(#g)"/>' +
    '<text x="150" y="205" font-size="170" text-anchor="middle">' + icon + '</text></svg>');

  const BOSSES = [
    {
      id: 'coopboss_gusty', name: 'Gusty Bones', icon: '💀', c1: '#6366f1', c2: '#0f0a2e', tier: 1,
      img: 'bosses_cooperativo/gusty_bones.jpg',
      music: 'bosses_cooperativo/music/gusty_music.mp3',
      tagline: 'Un esqueleto fantasmal con mucho aguante. Se esconde tras su escudo y ataca por sorpresa.',
      hp: 700, atk: 22, def: 15, spd: 19, ccResist: 0.7,
      phases: [
        { at: 0.5, log: 'Gusty Bones se enfurece: ¡más ATK y más velocidad!', atk: 3, spd: 3 },
        { at: 0.25, log: '¡Gusty Bones pierde la paciencia y ataca DOS veces por ronda!', actions: 2 }
      ],
      moves: [
        { id: 'gusty1', name: 'Golpe de Huesos', power: 25, acc: 0.95, baseCooldown: 0, type: 'attack', effects: null,
          desc: 'Un golpe seco con sus huesos contra uno de los dos personajes del frente.' },
        { id: 'gusty2', name: 'Susto Fantasmal', power: 14, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'fear', prob: 0.5, duration: 1 }],
          desc: 'Un susto repentino a los dos del frente. Puede aterrorizarlos.' },
        { id: 'gusty3', name: 'Escudo de Huesos', power: 0, acc: 1, baseCooldown: 4, type: 'support', aiWeight: 0.8,
          effects: [{ type: 'shield', value: 80 }, { type: 'tempDef', value: 4, duration: 2 }],
          desc: 'Se protege con sus huesos: escudo y más DEF durante 2 turnos.' },
        { id: 'gusty4', name: 'ULTRA: Lluvia de Huesos', power: 29, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'damageOverTime', status: 'bleed', value: 5, duration: 3, prob: 0.85 }],
          desc: 'Una lluvia de huesos sobre el frente. Puede provocar sangrado.' }
      ],
      rewards: { coins: 250, chests: 2, firstCoins: 250, firstChests: 2, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.18 }
    },
    {
      id: 'coopboss_slimamander', name: 'Slimamander', icon: '🦎', c1: '#22c55e', c2: '#052e16', tier: 1,
      img: 'bosses_cooperativo/slimamander.jpg',
      music: 'bosses_cooperativo/music/slimamander_music.mp3',
      tagline: 'Una salamandra viscosa que quema y ralentiza. Se regenera, así que no le des tregua.',
      hp: 800, atk: 23, def: 14, spd: 17, ccResist: 0.65,
      phases: [
        { at: 0.5, log: 'Slimamander se calienta: ¡su baba arde y ataca con más fuerza!', atk: 3 },
        { at: 0.25, log: '¡Slimamander pierde el control y ataca DOS veces por ronda!', actions: 2 }
      ],
      moves: [
        { id: 'slima1', name: 'Salivazo Viscoso', power: 24, acc: 0.95, baseCooldown: 0, type: 'attack',
          effects: [{ type: 'debuff', stat: 'spd', value: 3, duration: 2 }],
          desc: 'Un salivazo pegajoso que reduce la SPD del objetivo.' },
        { id: 'slima2', name: 'Llamarada Pegajosa', power: 13, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'damageOverTime', status: 'burn', value: 4, duration: 3, prob: 0.8 }],
          desc: 'Fuego y baba sobre los dos del frente. Puede quemarlos.' },
        { id: 'slima3', name: 'Regenerar Baba', power: 0, acc: 1, baseCooldown: 4, type: 'support', aiWeight: 0.8,
          effects: [{ type: 'selfHealPct', value: 0.08 }, { type: 'shield', value: 50 }],
          desc: 'Se cubre de baba: recupera algo de vida y gana escudo.' },
        { id: 'slima4', name: 'ULTRA: Erupción Viscosa', power: 28, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'damageOverTime', status: 'burn', value: 5, duration: 3, prob: 0.9 }],
          desc: 'Una erupción de baba ardiente sobre el frente. Quemadura casi segura.' }
      ],
      rewards: { coins: 300, chests: 2, firstCoins: 300, firstChests: 2, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.2 }
    },
    {
      id: 'coopboss_sproink', name: 'Sproink', icon: '🐗', c1: '#f472b6', c2: '#3b0a24', tier: 2,
      img: 'bosses_cooperativo/sproink.jpg',
      music: 'bosses_cooperativo/music/sproink_music.mp3',
      tagline: 'Rápido y testarudo. Embiste, ensordece y se pone cada vez más furioso.',
      hp: 900, atk: 24, def: 14, spd: 21, ccResist: 0.65,
      phases: [
        { at: 0.6, log: 'Sproink resopla: ¡más ATK y más velocidad!', atk: 3, spd: 3 },
        { at: 0.3, log: '¡Sproink se desboca y ataca DOS veces por ronda!', atk: 2, actions: 2 }
      ],
      moves: [
        { id: 'sproink1', name: 'Embestida', power: 25, acc: 0.95, baseCooldown: 0, type: 'attack', effects: null,
          desc: 'Una embestida contra uno de los dos personajes del frente.' },
        { id: 'sproink2', name: 'Chillido Ensordecedor', power: 13, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'slow', value: 20, duration: 2, prob: 0.85 }, { type: 'accuracyDown', value: 10, duration: 2 }],
          desc: 'Un chillido que ralentiza y resta precisión a los dos del frente.' },
        { id: 'sproink3', name: 'Subidón', power: 0, acc: 1, baseCooldown: 5, type: 'support', aiWeight: 0.9,
          effects: [{ type: 'tempAtk', value: 5, duration: 3 }, { type: 'tempSpd', value: 4, duration: 3 }],
          desc: 'Se emociona: más ATK y SPD durante 3 turnos.' },
        { id: 'sproink4', name: 'ULTRA: Carga Desbocada', power: 30, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'stun', prob: 0.3, duration: 1 }],
          desc: 'Una carga a toda velocidad sobre el frente. Puede aturdir.' }
      ],
      rewards: { coins: 400, chests: 3, firstCoins: 400, firstChests: 2, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.22 }
    },
    {
      id: 'coopboss_animaustro', name: 'Animaustro', icon: '🏺', c1: '#a16207', c2: '#1c1202', tier: 2,
      img: 'bosses_cooperativo/animaustro.jpg',
      music: 'bosses_cooperativo/music/animaustro_music.mp3',
      tagline: 'Un jefe duro y sereno que castiga la prisa. Resiste mucho y devuelve con fuerza.',
      hp: 950, atk: 25, def: 15, spd: 20, ccResist: 0.7,
      phases: [
        { at: 0.5, log: 'Animaustro se concentra: ¡más ATK y más velocidad!', atk: 3, spd: 2 },
        { at: 0.25, log: '¡Animaustro pierde la calma y ataca DOS veces por ronda!', actions: 2 }
      ],
      moves: [
        { id: 'anima1', name: 'Golpe Severo', power: 26, acc: 0.95, baseCooldown: 0, type: 'attack', effects: null,
          desc: 'Un golpe contundente contra uno de los dos personajes del frente.' },
        { id: 'anima2', name: 'Onda Opresiva', power: 14, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'debuff', stat: 'atk', value: 3, duration: 2 }],
          desc: 'Una onda sobre los dos del frente que reduce su ATK.' },
        { id: 'anima3', name: 'Postura Firme', power: 0, acc: 1, baseCooldown: 4, type: 'support', aiWeight: 0.8,
          effects: [{ type: 'shield', value: 90 }, { type: 'tempDef', value: 4, duration: 2 }],
          desc: 'Adopta una postura defensiva: escudo y más DEF durante 2 turnos.' },
        { id: 'anima4', name: 'ULTRA: Sentencia Final', power: 31, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'stun', prob: 0.3, duration: 1 }],
          desc: 'Un golpe demoledor sobre el frente. Puede aturdir.' }
      ],
      rewards: { coins: 450, chests: 3, firstCoins: 450, firstChests: 2, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.22 }
    },
    {
      id: 'coopboss_maddiman', name: 'Dr. Maddiman', icon: '😈', c1: '#dc2626', c2: '#2a0606', tier: 2,
      img: 'bosses_cooperativo/dr_maddiman.jpg',
      music: 'bosses_cooperativo/music/maddiman_music.mp3',
      tagline: 'Un jefe irascible: cuanto más lo castigas, más fuerte golpea.',
      hp: 1050, atk: 26, def: 15, spd: 18, ccResist: 0.7,
      phases: [
        { at: 0.6, log: 'Dr. Maddiman se enfada: ¡más ATK!', atk: 3 },
        { at: 0.3, log: '¡Dr. Maddiman estalla de ira! Más ATK y ataca DOS veces por ronda.', atk: 3, actions: 2 }
      ],
      moves: [
        { id: 'madd1', name: 'Puñetazo Furioso', power: 27, acc: 0.95, baseCooldown: 0, type: 'attack', effects: null,
          desc: 'Un puñetazo cargado de rabia contra uno de los dos del frente.' },
        { id: 'madd2', name: 'Grito de Rabia', power: 14, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'fear', prob: 0.4, duration: 1 }, { type: 'accuracyDown', value: 10, duration: 2 }],
          desc: 'Un grito que puede asustar y resta precisión a los dos del frente.' },
        { id: 'madd3', name: 'Ataque de Ira', power: 0, acc: 1, baseCooldown: 5, type: 'support', aiWeight: 0.9,
          effects: [{ type: 'tempAtk', value: 6, duration: 3 }, { type: 'critChance', value: 15, duration: 3 }],
          desc: 'Se enfurece: más ATK y probabilidad de crítico durante 3 turnos.' },
        { id: 'madd4', name: 'ULTRA: Rabieta Total', power: 31, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'damageOverTime', status: 'burn', value: 5, duration: 3, prob: 0.8 }],
          desc: 'Una rabieta que arrasa el frente. Puede quemar.' }
      ],
      rewards: { coins: 500, chests: 3, firstCoins: 500, firstChests: 2, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.24 }
    },
    {
      id: 'coopboss_tarantutor', name: 'Tarantutor', icon: '🕷️', c1: '#7c3aed', c2: '#12062b', tier: 3,
      img: 'bosses_cooperativo/tarantutor.jpg',
      music: 'bosses_cooperativo/music/tarantutor_music.mp3',
      tagline: 'Rápido y venenoso. Te debilita poco a poco y se cura con tu energía.',
      hp: 1150, atk: 27, def: 15, spd: 21, ccResist: 0.7,
      phases: [
        { at: 0.5, log: 'Tarantutor se agita: ¡más ATK y más velocidad!', atk: 3, spd: 3 },
        { at: 0.25, log: '¡Tarantutor se lanza a la caza y ataca DOS veces por ronda!', actions: 2 }
      ],
      moves: [
        { id: 'taran1', name: 'Mordisco Venenoso', power: 25, acc: 0.95, baseCooldown: 0, type: 'attack',
          effects: [{ type: 'damageOverTime', status: 'poison', value: 4, duration: 3, prob: 0.5 }],
          desc: 'Un mordisco que puede envenenar al objetivo.' },
        { id: 'taran2', name: 'Telaraña Pegajosa', power: 14, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'slow', value: 20, duration: 2, prob: 0.85 }],
          desc: 'Una telaraña sobre los dos del frente que reduce su SPD.' },
        { id: 'taran3', name: 'Succión Vital', power: 0, acc: 1, baseCooldown: 5, type: 'support', aiWeight: 0.8,
          effects: [{ type: 'lifesteal', value: 20, duration: 2 }, { type: 'selfHealPct', value: 0.02 }],
          desc: 'Roba vida con sus ataques durante 2 turnos y recupera algo de salud.' },
        { id: 'taran4', name: 'ULTRA: Plaga de Arañas', power: 30, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'damageOverTime', status: 'poison', value: 5, duration: 3, prob: 0.9 }, { type: 'healReduction', value: 30, duration: 2 }],
          desc: 'Una plaga sobre el frente. Envenena y reduce la curación recibida.' }
      ],
      rewards: { coins: 600, chests: 3, firstCoins: 600, firstChests: 3, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.26 }
    },
	{
      id: 'coopboss_zombie_chef', name: 'Zombie Chef', icon: '👨‍🍳', c1: '#7c3aed', c2: '#12062b', tier: 3,
      img: 'bosses_cooperativo/zombie_chef.png',
      music: 'bosses_cooperativo/music/zombie_chef.mp3',
      tagline: "Ex school cafeteria chef who's got revived by Clyde with the power of toxic alien goo in a form of Nazi Zombie.",
      hp: 1100, atk: 27, def: 20, spd: 15, ccResist: 0.7,
      phases: [
        { at: 0.1, log: 'Zombie Chef is furious! Speed increases massively!', spd: 10 }
      ],
      moves: [
        { id: 'chef1', name: 'Spatula Attack', power: 27, acc: 0.7, baseCooldown: 1, type: 'attack',
          desc: 'Swings his giant cooking spatula and strikes you.' },
        { id: 'chef2', name: 'Chocolate Salty Balls', power: 14, acc: 0.95, baseCooldown: 1, type: 'attack',
          effects: [{ type: 'damageOverTime', status: 'poison', value: 7, duration: 2, prob: 0.85 }, { type: 'healReduction', value: 30, duration: 2 }],
          desc: 'Pulls out chocolate salty balls from his chest cavity inflicts and hurles them at you, dealing poison damage and reducing healing.' },
        { id: 'chef3', name: 'Hello Children (Zombie Bite)', power: 90, acc: 0.5, baseCooldown: 4, type: 'attack', aiWeight: 0.8,
          effects: [{ type: 'lifesteal', value: 90, duration: 1 }, { type: 'selfHealPct', value: 0.02 }],
          desc: 'Chef lunges forward to bite one of your characters.' },
        { id: 'chef4', name: 'ULTRA: Flaming Suicide Rush', power: 40, acc: 0.95, baseCooldown: 99, type: 'attack', aoe: true, ult: true, 
		  selfDestruct: true, finalAt: 0.1,
          effects: [{ type: 'damageOverTime', status: 'burn', value: 8, duration: 2, prob: 1 }],
          desc: 'Zombie Chef ignites himself and charges at both opponents, inflicting massive damage and burning them. He dies after the attack.' }
      ],
      rewards: { coins: 0, chests: 0, firstCoins: 600, firstChests: 3, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.26 }
    },
    {
      id: 'coopboss_cremaligno', name: 'Cremaligno', icon: '🥛', c1: '#e5e7eb', c2: '#1e293b', tier: 4,
      img: 'bosses_cooperativo/cremaligno.jpg',
      music: 'bosses_cooperativo/music/cremaligno.mp3',
      tagline: 'Un engendro espeso y pegajoso que lo embadurna todo. Ralentiza, debilita la curación y se regenera: hay que tumbarlo rápido.',
      hp: 1400, atk: 28, def: 16, spd: 20, ccResist: 0.75,
      phases: [
        { at: 0.5, log: 'Cremaligno hierve de rabia: ¡más ATK y más velocidad!', atk: 3, spd: 3 },
        { at: 0.25, log: '¡Cremaligno pierde el control y ataca DOS veces por ronda!', atk: 2, actions: 2 }
      ],
      moves: [
        { id: 'crema1', name: 'Aliento Lefoso', power: 27, acc: 0.95, baseCooldown: 0, type: 'attack',
          effects: [{ type: 'debuff', stat: 'def', value: 2, duration: 2 }],
          desc: 'Un aliento espeso y apestoso contra uno de los dos del frente. Reduce su DEF.' },
        { id: 'crema2', name: 'Chorreón Pegajoso', power: 14, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
          effects: [{ type: 'slow', value: 20, duration: 2, prob: 0.85 }, { type: 'accuracyDown', value: 10, duration: 2 }],
          desc: 'Un chorreón de lefa sobre los dos del frente. Los ralentiza y resta precisión.' },
        { id: 'crema3', name: 'Baño de Crema', power: 0, acc: 1, baseCooldown: 4, type: 'support', aiWeight: 0.8,
          effects: [{ type: 'selfHealPct', value: 0.06 }, { type: 'shield', value: 70 }, { type: 'tempDef', value: 3, duration: 2 }],
          desc: 'Se rebozan en su propia lefa: recupera vida, gana escudo y más DEF durante 2 turnos.' },
        { id: 'crema4', name: 'ULTRA: Tsunami Lefoso', power: 31, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
          effects: [{ type: 'damageOverTime', status: 'poison', value: 5, duration: 3, prob: 0.85 }, { type: 'healReduction', value: 30, duration: 2 }],
          desc: 'Una ola gigante de lefa sobre el frente. Puede envenenar y reduce la curación recibida.' }
      ],
      rewards: { coins: 700, chests: 4, firstCoins: 700, firstChests: 3, skinAllow: ['rare', 'epic', 'legend'], repeatSkinChance: 0.28 }
    },
    /* ---------------------------------------------------------------
       JEFE DOBLE (duo:true): dos jefes a la vez (members) y, al derrotarlos a los dos,
       una SEGUNDA FASE (stage2) contra un único jefe. Mecánicas propias de este combate:
         · Resurrección Gemela ... un gemelo caído revive UNA vez (reviveAfter rondas) con
                                    reviveHpPct de vida, salvo que mates al otro antes.
         · Furia de Luto .......... el gemelo superviviente gana ATK/SPD cuando el otro cae.
         · special:'chains' ....... Cadenas: el objetivo no puede ser cambiado por la reserva.
         · special:'doom' ......... Condena: tras N rondas el marcado pierde % de su vida máx.
                                    (se rompe si cae quien la lanzó).
         · special:'guard' ........ Guardia Gemela: los ataques dirigidos al otro gemelo se
                                    desvían a quien guarda.
         · special:'bloodpact' .... Pacto Carmesí: sacrifica vida propia por robo de vida y ATK
                                    para los dos gemelos.
       Al atacar a un jefe doble eliges objetivo (clic en su panel o botones 🎯).
       --------------------------------------------------------------- */
    {
      id: 'coopboss_gemelos', name: 'Nahamah y Lilith', icon: '👿', c1: '#7c3aed', c2: '#1e0a3c', tier: 5,
      duo: true,
      music: 'bosses_cooperativo/music/gemelos.mp3',
      tagline: 'Dos hermanas demoníacas a la vez: Nahamah, la sangre, y Lilith, el hielo. Si una cae puede volver… y al final se fusionan.',
      reviveAfter: 3, reviveHpPct: 0.4, reviveMax: 1, mournAtk: 3, mournSpd: 2,
      members: [
        {
          id: 'coopboss_nahamah', name: 'Nahamah', icon: '🩸', c1: '#dc2626', c2: '#2a0606',
          img: 'bosses_cooperativo/nahamah.jpg',
          hp: 880, atk: 26, def: 14, spd: 21, ccResist: 0.7,
          phases: [
            { at: 0.4, log: 'Nahamah se desata: ¡más ATK!', atk: 3 }
          ],
          moves: [
            { id: 'naha1', name: 'Desgarro Carmesí', power: 26, acc: 0.95, baseCooldown: 0, type: 'attack',
              effects: [{ type: 'damageOverTime', status: 'bleed', value: 4, duration: 3, prob: 0.6 }],
              desc: 'Un zarpazo que puede provocar sangrado a uno de los dos del frente.' },
            { id: 'naha2', name: 'Lluvia de Sangre', power: 13, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
              effects: [{ type: 'damageOverTime', status: 'bleed', value: 4, duration: 3, prob: 0.8 }, { type: 'healReduction', value: 25, duration: 2 }],
              desc: 'Una lluvia roja sobre el frente. Sangrado y menos curación recibida.' },
            { id: 'naha3', name: 'Pacto Carmesí', power: 0, acc: 1, baseCooldown: 5, type: 'support', aiWeight: 0.9, special: 'bloodpact',
              effects: [{ type: 'special' }],
              desc: 'Sacrifica el 8 % de su vida: ella y su hermana ganan robo de vida y ATK durante 3 turnos.' },
            { id: 'naha4', name: 'ULTRA: Festín de Sangre', power: 29, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
              effects: [{ type: 'lifesteal', value: 35, duration: 1 }, { type: 'damageOverTime', status: 'bleed', value: 5, duration: 3, prob: 0.9 }],
              desc: 'Devora al frente: daño en área, sangrado casi seguro y se cura con lo que roba.' }
          ]
        },
        {
          id: 'coopboss_lilith', name: 'Lilith', icon: '❄️', c1: '#38bdf8', c2: '#0c1a3a',
          img: 'bosses_cooperativo/lilith.jpg',
          hp: 840, atk: 25, def: 15, spd: 19, ccResist: 0.7,
          phases: [
            { at: 0.4, log: 'Lilith se enfurece: ¡más velocidad y ATK!', atk: 2, spd: 3 }
          ],
          moves: [
            { id: 'lili1', name: 'Cadenas Gélidas', power: 24, acc: 0.95, baseCooldown: 2, type: 'attack', special: 'chains',
              effects: [{ type: 'slow', value: 20, duration: 2, prob: 0.8 }],
              desc: 'Un golpe helado que ralentiza y ENCADENA: el objetivo no podrá ser cambiado por la reserva durante 2 turnos suyos.' },
            { id: 'lili2', name: 'Ventisca Lunar', power: 13, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
              effects: [{ type: 'freeze', prob: 0.25, duration: 1 }, { type: 'accuracyDown', value: 10, duration: 2 }],
              desc: 'Una ventisca sobre el frente. Puede congelar y resta precisión.' },
            { id: 'lili3', name: 'Velo Gemelo', power: 0, acc: 1, baseCooldown: 5, type: 'support', aiWeight: 0.9, special: 'guard',
              effects: [{ type: 'shield', value: 60 }, { type: 'special' }],
              desc: 'Gana escudo y protege a su hermana: los ataques dirigidos a ella se desvían a Lilith durante 2 rondas.' },
            { id: 'lili4', name: 'ULTRA: Condena de Medianoche', power: 22, acc: 0.9, baseCooldown: 7, type: 'attack', aoe: true, ult: true, special: 'doom',
              effects: [{ type: 'slow', value: 15, duration: 2, prob: 0.7 }],
              desc: 'Daño en área y CONDENA a los dos del frente: en 3 rondas perderán el 35 % de su vida máx. Se rompe si Lilith cae.' }
          ]
        }
      ],
      stage2: {
        id: 'coopboss_fusion', name: 'Fusión Demoníaca', icon: '🌌', c1: '#a855f7', c2: '#0b0620',
        img: 'bosses_cooperativo/combined.jpg',
        music: 'bosses_cooperativo/music/combined.mp3',
        intro: '¡Nahamah y Lilith se funden en un solo ser! FUSIÓN DEMONÍACA: las rondas se reinician y los supervivientes recuperan toda su vida.',
        hp: 1500, atk: 29, def: 17, spd: 21, ccResist: 0.8,
        phases: [
          { at: 0.6, log: 'La Fusión Demoníaca se estabiliza: ¡más ATK!', atk: 3 },
          { at: 0.3, log: '¡La Fusión Demoníaca se desgarra! Más ATK y SPD, y ataca DOS veces por ronda.', atk: 2, spd: 2, actions: 2 }
        ],
        moves: [
          { id: 'fus1', name: 'Garra Dual', power: 28, acc: 0.95, baseCooldown: 0, type: 'attack',
            effects: [{ type: 'damageOverTime', status: 'bleed', value: 5, duration: 3, prob: 0.55 }, { type: 'debuff', stat: 'spd', value: 3, duration: 2 }],
            desc: 'Un zarpazo de sangre y hielo contra uno del frente. Puede sangrar y reduce su SPD.' },
          { id: 'fus2', name: 'Aullido Dual', power: 14, acc: 0.95, baseCooldown: 3, type: 'attack', aoe: true,
            effects: [{ type: 'freeze', prob: 0.2, duration: 1 }, { type: 'healReduction', value: 25, duration: 2 }, { type: 'accuracyDown', value: 10, duration: 2 }],
            desc: 'Un aullido doble sobre el frente: puede congelar, resta precisión y reduce la curación.' },
          { id: 'fus3', name: 'Espejo Abisal', power: 0, acc: 1, baseCooldown: 5, type: 'support', aiWeight: 0.8,
            effects: [{ type: 'shield', value: 90 }, { type: 'tempDef', value: 4, duration: 2 }, { type: 'reflectDamage', value: 30, duration: 2 }],
            desc: 'Escudo, más DEF y reflejo del 30 % del daño recibido durante 2 turnos.' },
          { id: 'fus4', name: 'Cadenas del Abismo', power: 15, acc: 0.95, baseCooldown: 4, type: 'attack', aoe: true, special: 'chains', aiWeight: 0.9,
            effects: [{ type: 'slow', value: 15, duration: 2, prob: 0.7 }],
            desc: 'Encadena a los dos del frente: no podrán cambiar de personaje durante 2 turnos suyos.' },
          { id: 'fus5', name: 'ULTRA: Cataclismo Gemelo', power: 33, acc: 0.9, baseCooldown: 6, type: 'attack', aoe: true, ult: true,
            effects: [{ type: 'damageOverTime', status: 'bleed', value: 5, duration: 3, prob: 0.9 }, { type: 'healReduction', value: 30, duration: 2 }],
            desc: 'Un cataclismo de sangre y hielo sobre el frente. Sangrado casi seguro y menos curación.' }
        ]
      },
      rewards: { coins: 1000, chests: 5, firstCoins: 1000, firstChests: 4, skinAllow: ['epic', 'legend'], repeatSkinChance: 0.3 }
    },
  ];
  const finishBoss = b => {
    if (!b.img) b.img = bossSvg(b.icon, b.c1, b.c2);
    b.classes = [];
    b.isBoss = true;
  };
  BOSSES.forEach(b => {
    if (b.duo) {
      b.members.forEach(finishBoss);
      finishBoss(b.stage2);
      b.img = b.members[0].img;
      b.hp = b.members.reduce((a, m) => a + m.hp, 0);
      b.atk = b.members.map(m => m.atk).join('/');
      b.def = b.members.map(m => m.def).join('/');
    }
    finishBoss(b);
  });
  const bossById = id => BOSSES.find(b => b.id === id) || null;
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  /* ---------------- Progreso (solo local) ---------------- */
  function loadProg() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(PROG_KEY) || '{}') || {}; } catch (e) { d = {}; }
    const wins = {};
    if (d.wins && typeof d.wins === 'object') Object.keys(d.wins).forEach(k => { wins[k] = Math.max(0, Math.floor(Number(d.wins[k])) || 0); });
    return { wins };
  }
  function saveProg(p) { try { localStorage.setItem(PROG_KEY, JSON.stringify({ wins: p.wins })); } catch (e) { /* ignorar */ } }

  /* =====================================================================
     ESTADO DEL MODO
     Asientos: 0 = anfitrión (equipo state.teams.p1[0..2]), 1 = invitado ([3..5]).
     Los 6 aliados viven en state.teams.p1; el jefe es state.teams.p2[0].
     ===================================================================== */
  const CO = {
    active: false, local: false, isHost: false, seat: 0,
    peer: null, conn: null, code: '', seed: 0, bossId: BOSSES[0].id,
    nick: { me: 'Jugador', opp: 'Compañero' }, avatar: { me: null, opp: null },
    ready: { me: false, opp: false }, started: false, building: false, oppTeamIds: null, oppSkins: {},
    queue: [], draining: false, applied: 0, hashes: { me: {}, opp: {} },
    applyingRemote: false, presetTarget: null, busy: false, frozen: false,
    ended: false, leaving: false, leavingMatch: false, installed: false, pingTimer: null, lastSeen: 0,
    rematch: { me: false, opp: false }, desyncs: 0,
    front: [0, 3], order: [], pos: 0, round: 0, cur: null, seq: 0,
    bossBusy: false, bossTok: 0, lastTarget: null, rewarded: false, result: null,
    stage: 1, focus: 0, extraThink: 0,
    timer: { key: null, deadline: 0, firedKey: null, int: null }
  };
  const orig = {};

  const slotRange = k => (k === 0 ? [0, 1, 2] : [3, 4, 5]);
  const aliveIn = k => slotRange(k).filter(i => state.teams.p1[i] && state.teams.p1[i].hp > 0);
  const slotAlive = k => aliveIn(k).length > 0;
  const slotChar = k => state.teams.p1[CO.front[k]];
  const bossChar = () => state.teams.p2[0];
  const bosses = () => state.teams.p2;
  const bossDef = () => bossById(CO.bossId);
  const bId = i => 'b' + i;                                   // id de turno de un jefe: 'b0', 'b1'
  const bIdx = id => (typeof id === 'string' && id.charAt(0) === 'b' ? Number(id.slice(1)) : -1);
  const isBossTurn = () => bIdx(CO.cur) >= 0;
  const curBoss = () => state.teams.p2[bIdx(CO.cur)];
  const isBossChar = c => !!c && state.teams.p2.includes(c);
  const aliveBossIdx = () => state.teams.p2.map((b, i) => (b && b.hp > 0 ? i : -1)).filter(i => i >= 0);
  const finalName = b => (b.duo ? b.stage2.name : b.name);
  const mySeats = () => (CO.local ? [0, 1] : [CO.seat]);
  const isMine = k => mySeats().includes(k);
  const isMyTurn = () => typeof CO.cur === 'number' && isMine(CO.cur) && state.phase === 'battle' && CO.started;
  const frontAlive = () => [0, 1].map(slotChar).filter(c => c && c.hp > 0);
  const seatOfIndex = i => (i < 3 ? 0 : 1);
  const seatName = k => (CO.local ? 'Jugador ' + (k + 1) : (k === CO.seat ? CO.nick.me : CO.nick.opp));
  const bossActs = b => {
    if (!b || !Array.isArray(b.phases)) return 1;
    return b.phases.slice(0, b.phaseIdx || 0).reduce((m, p) => Math.max(m, p.actions || 1), 1);
  };

  /* ---------------- Aleatoriedad compartida (mulberry32) ---------------- */
  let rngS = 0;
  function seedRng(seed) {
    rngS = seed >>> 0;
    W.__mpRng = function () {
      rngS = (rngS + 0x6D2B79F5) >>> 0;
      let t = rngS;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randomSeed() {
    try { const a = new Uint32Array(1); (W.crypto || crypto).getRandomValues(a); return a[0] >>> 0; }
    catch (e) { return (Math.random() * 4294967296) >>> 0; }
  }
  const rnd = () => (typeof gameRandom === 'function' ? gameRandom() : Math.random());

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
    const parts = [CO.stage, CO.round, CO.pos, String(CO.cur), CO.front.join(','), state.turnCount, state.phase,
      state.activeIndex.p1, state.turnOwner, rngS];
    ['p1', 'p2'].forEach(p => state.teams[p].forEach(c => {
      parts.push(c.id, c.hp, c.shield, c.stunned, c.tempAtk, c.tempDef, c.tempSpd, c.atk, c.def, c.spd,
        c.moves.map(m => m.cd).join(','),
        (c.statusEffects || []).length, (c.controlEffects || []).length,
        (c.debuffEffects || []).length, (c.tempEffects || []).length, (c.specialEffects || []).length,
        c.reviveIn || 0, c.reviveLeft || 0, c.noSwap || 0, c.doom ? c.doom.rounds : 0, c.guardTurns || 0);
    }));
    const s = parts.join('|');
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }

  /* =====================================================================
     RED (PeerJS)
     ===================================================================== */
  function send(msg) {
    if (CO.local) return;
    try { if (CO.conn && CO.conn.open) CO.conn.send(msg); } catch (e) { /* conexión cerrada */ }
  }

  function loadPeerLib() {
    if (W.Peer) return Promise.resolve();
    return new Promise((res, rej) => {
      let i = 0;
      const next = () => {
        if (i >= PEER_SOURCES.length) return rej(new Error('No se pudo cargar PeerJS. Comprueba tu conexión.'));
        const s = document.createElement('script');
        s.src = PEER_SOURCES[i++];
        s.onload = () => (W.Peer ? res() : next());
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
    const el = byId('co-status');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? '#fca5a5' : '';
  }

  function resetNetwork() {
    CO.leaving = true;
    if (CO.pingTimer) { clearInterval(CO.pingTimer); CO.pingTimer = null; }
    try { if (CO.conn) CO.conn.close(); } catch (e) { /* ignorar */ }
    try { if (CO.peer) CO.peer.destroy(); } catch (e) { /* ignorar */ }
    CO.conn = null; CO.peer = null; CO.code = '';
    CO.leaving = false;
  }

  function showChoose() {
    byId('co-step-choose').style.display = '';
    byId('co-step-wait').style.display = 'none';
  }

  function failLobby(msg) {
    resetNetwork();
    showChoose();
    setStatus(msg, true);
  }

  function myProfile() {
    try { return (W.PERFIL && W.PERFIL.load && W.PERFIL.load()) || {}; } catch (e) { return {}; }
  }
  function readNick() {
    const n = cleanNick(byId('co-nick').value) || 'Jugador';
    try { localStorage.setItem(NICK_KEY, n); } catch (e) { /* ignorar */ }
    CO.nick.me = n;
    return n;
  }

  async function createRoom() {
    readNick();
    CO.local = false; CO.isHost = true; CO.seat = 0;
    setStatus('Conectando con el servidor de salas…');
    try { await loadPeerLib(); } catch (e) { return failLobby(e.message); }

    const tryCreate = attempt => {
      const code = randomCode();
      let peer;
      try { peer = new W.Peer(ID_PREFIX + code, { debug: 0 }); }
      catch (e) { return failLobby('No se pudo crear la sala: ' + e.message); }
      CO.peer = peer;
      peer.on('open', () => {
        CO.code = code;
        byId('co-step-choose').style.display = 'none';
        byId('co-step-wait').style.display = '';
        byId('co-code-show').textContent = code;
        const b = bossById(CO.bossId);
        byId('co-wait-msg').textContent = `Jefe elegido: ${b.icon} ${b.name}. Comparte este código con tu compañero y espera a que se conecte…`;
        setStatus('');
      });
      peer.on('connection', conn => {
        if (CO.conn) { try { conn.close(); } catch (e) { /* ignorar */ } return; }
        CO.conn = conn;
        attachConn(conn);
      });
      peer.on('error', err => {
        if (err && err.type === 'unavailable-id' && attempt < 5) {
          try { peer.destroy(); } catch (e) { /* ignorar */ }
          return tryCreate(attempt + 1);
        }
        if (CO.active) return;
        failLobby('Error de conexión: ' + ((err && (err.type || err.message)) || 'desconocido'));
      });
    };
    tryCreate(0);
  }

  async function joinRoom() {
    readNick();
    const code = String(byId('co-code').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 5) return setStatus('Escribe el código de 5 caracteres de la sala.', true);
    CO.local = false; CO.isHost = false; CO.seat = 1;
    setStatus('Conectando…');
    try { await loadPeerLib(); } catch (e) { return failLobby(e.message); }

    let peer;
    try { peer = new W.Peer({ debug: 0 }); }
    catch (e) { return failLobby('No se pudo iniciar la conexión: ' + e.message); }
    CO.peer = peer;
    let connected = false;
    const timer = setTimeout(() => { if (!connected) failLobby('No se pudo conectar con la sala (tiempo agotado).'); }, 15000);
    peer.on('open', () => {
      const conn = peer.connect(ID_PREFIX + code, { reliable: true, serialization: 'json' });
      CO.conn = conn;
      attachConn(conn, () => { connected = true; clearTimeout(timer); });
    });
    peer.on('error', err => {
      clearTimeout(timer);
      if (CO.active) return;
      const t = err && err.type;
      failLobby(t === 'peer-unavailable' ? 'No existe ninguna sala con ese código.' : 'Error de conexión: ' + (t || (err && err.message) || 'desconocido'));
    });
  }

  function attachConn(conn, onOpen) {
    const opened = () => {
      CO.lastSeen = Date.now();
      if (onOpen) onOpen();
      CO.avatar.me = myProfile().avatar || null;
      send({ t: 'hello', v: VERSION, nick: CO.nick.me, avatar: CO.avatar.me });
      if (!CO.pingTimer) {
        CO.pingTimer = setInterval(() => {
          send({ t: 'p' });
          if (CO.active && Date.now() - CO.lastSeen > PEER_TIMEOUT_MS) onClose('timeout');
        }, PING_MS);
      }
    };
    conn.on('open', opened);
    if (conn.open) opened();
    conn.on('data', onMessage);
    conn.on('close', () => onClose('close'));
    conn.on('error', () => onClose('error'));
  }

  function onMessage(msg) {
    if (!msg || typeof msg !== 'object') return;
    CO.lastSeen = Date.now();
    switch (msg.t) {
      case 'p': return;
      case 'hello':
        if (msg.v !== VERSION) return failLobby('Versiones distintas del juego. Actualiza la página en los dos dispositivos.');
        CO.nick.opp = cleanNick(msg.nick) || 'Compañero';
        CO.avatar.opp = typeof msg.avatar === 'string' ? msg.avatar.slice(0, 80) : null;
        if (CO.isHost && !CO.active) {
          CO.seed = randomSeed();
          send({ t: 'config', boss: CO.bossId, seed: CO.seed });
          beginSetup();
        }
        return;
      case 'config':
        if (CO.isHost) return;
        if (!bossById(msg.boss)) return failLobby('El anfitrión eligió un jefe que no existe en tu versión. Actualiza la página.');
        CO.bossId = msg.boss;
        CO.seed = msg.seed >>> 0;
        beginSetup();
        return;
      case 'team':
        if (!Array.isArray(msg.ids)) return;
        CO.oppTeamIds = msg.ids.slice(0, 3).map(String);
        CO.oppSkins = {};
        if (msg.skins && typeof msg.skins === 'object') {
          CO.oppTeamIds.forEach(id => { if (typeof msg.skins[id] === 'string') CO.oppSkins[id] = msg.skins[id].slice(0, 80); });
        }
        CO.ready.opp = true;
        if (CO.active && state.phase === 'select') { W.updateTurnInfo(); tryStartBattle(); }
        return;
      case 'move': case 'swap': case 'skip':
        CO.queue.push(msg);
        drain();
        return;
      case 'h':
        CO.hashes.opp[msg.n] = msg.h;
        compareHash(msg.n);
        return;
      case 'resync_req':
        if (CO.isHost) sendSnapshot();
        return;
      case 'snap':
        if (!CO.isHost) applySnapshot(msg.data);
        return;
      case 'rematch':
        CO.rematch.opp = true;
        refreshResultUi();
        maybeRematch();
        return;
      case 'bye':
        return onClose('bye');
    }
  }

  function onClose(why) {
    if (CO.leaving || CO.leavingMatch) return;
    if (!CO.active) {
      const scr = byId('co-screen');
      if (scr && scr.style.display !== 'none') failLobby('Se perdió la conexión con tu compañero.');
      return;
    }
    if (CO.local || CO.ended) { refreshResultUi(); return; }
    if (CO.pingTimer) { clearInterval(CO.pingTimer); CO.pingTimer = null; }
    if (state.phase === 'battle') {
      state.phase = 'ended';
      safeLog(`🔌 ${esc(CO.nick.opp)} se ha desconectado. El combate termina sin recompensa.`);
      endMatchUi('disconnect');
    } else if (state.phase !== 'ended') {
      state.phase = 'ended';
      const area = byId('moves-area');
      if (area) area.innerHTML = `<div class="small">🔌 ${esc(CO.nick.opp)} se ha desconectado.</div>`;
      endMatchUi('disconnect');
    }
  }

  /* =====================================================================
     INICIO DE PARTIDA Y SELECCIÓN DE EQUIPO
     ===================================================================== */
  const ownKey = () => (CO.local ? null : (CO.seat === 0 ? 'p1' : 'p2'));
  const oppKey = () => (CO.seat === 0 ? 'p2' : 'p1');

  function resetMatchState() {
    CO.ready = { me: false, opp: false };
    CO.started = false; CO.building = false; CO.oppTeamIds = null; CO.oppSkins = {};
    CO.queue = []; CO.draining = false;
    CO.applied = 0; CO.hashes = { me: {}, opp: {} };
    CO.applyingRemote = false; CO.presetTarget = null; CO.busy = false; CO.frozen = false;
    CO.rematch = { me: false, opp: false };
    CO.ended = false; CO.rewarded = false; CO.result = null;
    CO.front = [0, 3]; CO.order = []; CO.pos = 0; CO.round = 0; CO.cur = null; CO.seq = 0;
    CO.bossBusy = false; CO.bossTok++; CO.lastTarget = null;
    CO.stage = 1; CO.focus = 0; CO.extraThink = 0;
    CO.timer = { key: null, deadline: 0, firedKey: null, int: CO.timer.int };
  }

  function beginSetup() {
    CO.active = true;
    installPatches();
    resetMatchState();
    seedRng(CO.seed);
    W.COOP_HOOK.active = false;

    const scr = byId('co-screen'); if (scr) scr.style.display = 'none';
    const logEl = byId('log'); if (logEl) logEl.innerHTML = '';
    hideResultUi();
    const arena = byId('co-arena'); if (arena) arena.style.display = 'none';
    const oa = document.querySelector('.battle-arena'); if (oa) oa.style.display = '';
    const lb = byId('co-leave-btn'); if (lb) lb.style.display = 'none';
    const rs = byId('restartBtn'); if (rs) rs.style.display = '';
    state.moveLock = false;
    W.GAME_MODE = 'pvp';
    W.startMode('pvp', false);          // selección de equipos (los dos paneles); no hay baneos
    startTimerLoop();
    const b = bossById(CO.bossId);
    if (CO.local) safeLog(`🧪 Práctica en solitario contra ${esc(b.name)}: controlas a los dos jugadores. No da recompensas.`);
    else safeLog(`🤝 Cooperativo online: ${esc(CO.nick.me)} y ${esc(CO.nick.opp)} contra ${esc(b.name)}.`);
  }

  function applySelectionUI() {
    if (!CO.active || state.phase !== 'select') return;
    const startBtn = byId('startBtn');
    if (startBtn) startBtn.style.display = '';
    const rs = byId('restartBtn'); if (rs) rs.style.display = '';
    const sb = byId('story-surrender-btn'); if (sb) sb.style.display = 'none';
    if (!CO.local) {
      const own = ownKey(), opp = oppKey();
      const ownList = byId(own + '-list'), oppList = byId(opp + '-list');
      if (ownList && ownList.parentElement) ownList.parentElement.style.display = '';
      if (oppList && oppList.parentElement) oppList.parentElement.style.display = 'none';
      const ownTitle = own === 'p1'
        ? (ownList && ownList.parentElement && ownList.parentElement.querySelector && ownList.parentElement.querySelector('h3'))
        : byId('p2-title');
      if (ownTitle) ownTitle.textContent = `${CO.nick.me} — elige TUS 3 personajes`;
    } else {
      const t1 = byId('p1-list') && byId('p1-list').parentElement && byId('p1-list').parentElement.querySelector('h3');
      if (t1) t1.textContent = 'Jugador 1 — elige 3 personajes';
      const t2 = byId('p2-title'); if (t2) t2.textContent = 'Jugador 2 — elige 3 personajes';
    }
    W.updateStartBtn();
    W.updateTurnInfo();
  }

  function makeSkinned(id, skinMap) {
    const base = findBaseById(id);
    const c = cloneCharacter(base);
    try {
      const skinId = skinMap && skinMap[id];
      const img = skinId && W.SKINS && W.SKINS.skinImg ? W.SKINS.skinImg(skinId, id) : null;
      if (img) c.img = img;
      else if (base.__img0) c.img = base.__img0;     // sin skin: imagen original, no la mía
    } catch (e) { /* ignorar */ }
    return c;
  }

  function tryStartBattle() {
    if (CO.started || CO.local || !CO.ready.me || !CO.ready.opp || !CO.oppTeamIds) return;
    const ids = CO.oppTeamIds;
    const valid = ids.length === 3 && new Set(ids).size === 3 && ids.every(id => findBaseById(id));
    if (!valid) { alert('Tu compañero envió un equipo no válido. Se cancela la partida.'); return leaveMatch(); }
    const mine = state.teams[ownKey()].filter(Boolean);
    const theirs = ids.map(id => makeSkinned(id, CO.oppSkins));
    // El anfitrión es siempre el asiento 0: los dos clientes montan el mismo orden de 6 personajes.
    const host = CO.seat === 0 ? mine : theirs;
    const guest = CO.seat === 0 ? theirs : mine;
    beginBattle(host, guest);
  }

  /* ---------------- Música del jefe ----------------
     Si el jefe tiene `music`, sustituye a la música de batalla normal mientras dura el combate.
     Respeta el volumen y el interruptor de música de Ajustes (batalla-music-config). */
  let bossAudio = null;
  function playBossMusic(boss) {
    stopBossMusic();
    if (!boss || !boss.music) return;
    let vol = 0.5, enabled = true;
    try {
      const cfg = JSON.parse(localStorage.getItem('batalla-music-config') || '{}') || {};
      if (typeof cfg.volume === 'number') vol = Math.min(1, Math.max(0, cfg.volume));
      if (typeof cfg.enabled === 'boolean') enabled = cfg.enabled;
    } catch (e) { /* ignorar */ }
    if (!enabled) return;
    try {
      const normal = byId('battle-music');           // la música de batalla normal se silencia
      if (normal && !normal.paused) { normal.pause(); normal.currentTime = 0; }
    } catch (e) { /* ignorar */ }
    try {
      bossAudio = new Audio(boss.music);
      bossAudio.loop = true;
      bossAudio.volume = vol;
      const pr = bossAudio.play();
      if (pr && pr.catch) pr.catch(err => console.log('No se pudo reproducir la música del jefe:', err));
    } catch (e) { bossAudio = null; }
  }
  function stopBossMusic() {
    if (!bossAudio) return;
    try { bossAudio.pause(); bossAudio.currentTime = 0; } catch (e) { /* ignorar */ }
    bossAudio = null;
  }

  /* Monta el combate: 6 aliados en state.teams.p1 (3 del anfitrión + 3 del invitado) y el jefe en p2. */
  function beginBattle(hostChars, guestChars) {
    const boss = bossById(CO.bossId);
    state.teams.p1 = hostChars.concat(guestChars);
    state.teams.p2 = (boss.duo ? boss.members : [boss]).map(m => {
      const c = cloneCharacter(m);
      c.phaseIdx = 0; c.guardTurns = 0; c.reviveIn = 0; c.fallen = false;
      c.reviveLeft = boss.duo ? (boss.reviveMax || 0) : 0;
      return c;
    });
    CO.stage = 1; CO.focus = 0;
    playBossMusic(boss);
    CO.front = [0, 3];
    CO.order = []; CO.pos = 0; CO.round = 0; CO.cur = null; CO.seq = 0;
    CO.started = true;
    CO.building = true;
    W.COOP_HOOK.active = true;
    const prevStory = state.storyMode;
    state.storyMode = true;              // evita las comprobaciones de «3 vs 3» del motor y las estadísticas del perfil
    try { orig.startBattle.call(W); }
    finally { state.storyMode = prevStory; CO.building = false; }

    state.mode = 'pve';                   // el jefe cuenta como IA: sus botones nunca se activan
    W.GAME_MODE = 'pve';
    state.suddenDeath = false;
    state.activeIndex.p1 = CO.front[0];
    state.activeIndex.p2 = 0;

    const oa = document.querySelector('.battle-arena'); if (oa) oa.style.display = 'none';
    const rs = byId('restartBtn'); if (rs) rs.style.display = 'none';
    const sb = byId('story-surrender-btn'); if (sb) sb.style.display = 'none';
    const lb = byId('co-leave-btn'); if (lb) lb.style.display = CO.local ? 'none' : 'inline-block';
    ensureArena().style.display = '';
    safeLog(`⚔️ ¡Comienza el combate contra ${esc(boss.name)}! (${esc(seatName(0))}: ${esc(slotChar(0).name)} · ${esc(seatName(1))}: ${esc(slotChar(1).name)} al frente)`);

    CO.pos = -1;
    advance();                            // primera ronda y primer turno
    afterActionInit();
  }

  function afterActionInit() { if (!CO.local) { const n = CO.applied, h = hashState(); CO.hashes.me[n] = h; send({ t: 'h', n, h }); compareHash(n); } }

  /* =====================================================================
     TURNOS: 2 aliados del frente + jefe, por SPD
     ===================================================================== */
  function ensureFront(k) {
    const ch = slotChar(k);
    if (ch && ch.hp > 0) return true;
    const idx = aliveIn(k)[0];
    if (idx === undefined) return false;
    CO.front[k] = idx;
    safeLog(`🔁 ${esc(state.teams.p1[idx].name)} (${esc(seatName(k))}) sale de la reserva y entra al frente.`);
    return true;
  }

  /* Al empezar cada ronda: temporizadores de los jefes dobles (guardia, resurrección) y Condena. */
  function reviveBoss(b) {
    const def = bossDef();
    b.hp = Math.max(1, Math.round(b.maxHp * (def.reviveHpPct || 0.4)));
    b.fallen = false; b.reviveIn = 0; b.shield = 0; b.stunned = 0; b.guardTurns = 0;
    b.statusEffects = []; b.controlEffects = []; b.debuffEffects = []; b.specialEffects = [];
    b.tempEffects = []; b.tempAtk = 0; b.tempDef = 0; b.tempSpd = 0;
    b.moves.forEach(m => { m.cd = 0; });
    safeLog(`⚡ <strong>¡${esc(b.name)} se levanta de nuevo con ${b.hp} HP!</strong> (Resurrección Gemela)`);
    showBanner(`⚡ ¡${b.name} revive!`);
    bosses().forEach(o => { if (o !== b && o.hp > 0) o.shield += 50; });
  }

  function roundUpkeep() {
    const bs = bosses();
    bs.forEach(b => { if (b.guardTurns > 0) b.guardTurns--; });
    bs.forEach(b => {
      if (b.hp <= 0 && b.reviveIn > 0) {
        b.reviveIn--;
        if (b.reviveIn <= 0) {
          if (bs.some(o => o !== b && o.hp > 0)) reviveBoss(b);
        } else safeLog(`⏳ ${esc(b.name)} revivirá en ${b.reviveIn} ronda(s) si su hermana sigue en pie.`);
      }
    });
    state.teams.p1.forEach(c => {
      if (c.hp <= 0 || !c.doom) return;
      const src = bs.find(b => b.id === c.doom.src);
      if (!src || src.hp <= 0) { delete c.doom; return; }
      c.doom.rounds--;
      if (c.doom.rounds > 0) { safeLog(`💀 La Condena sobre ${esc(c.name)} se cumple en ${c.doom.rounds} ronda(s).`); return; }
      delete c.doom;
      if (isInvulnerable(c)) { safeLog(`🛡️✨ ${esc(c.name)} es invulnerable: la Condena no le afecta.`); return; }
      const before = c.hp, dmg = Math.round(c.maxHp * 0.35);
      c.hp = Math.max(0, c.hp - dmg);
      if (c.hp <= 0) c.shield = 0;
      safeLog(`💀 ¡La Condena de ${esc(src.name)} se cumple! ${esc(c.name)} pierde ${before - c.hp} HP.`);
      if (before > 0 && c.hp <= 0) tryPassiveRevive(c);
    });
  }

  function startRound() {
    CO.round++;
    roundUpkeep();
    const items = [];
    [0, 1].forEach(k => {
      if (slotAlive(k) && ensureFront(k)) items.push({ id: k, spd: getEffectiveStat(slotChar(k), 'spd'), r: rnd() });
    });
    bosses().forEach((b, i) => { if (b.hp > 0) items.push({ id: bId(i), spd: getEffectiveStat(b, 'spd'), r: rnd() }); });
    items.sort((a, b) => (b.spd - a.spd) || (a.r - b.r));
    CO.order = items.map(i => i.id);
    bosses().forEach((b, i) => { if (b.hp > 0) for (let n = 1; n < bossActs(b); n++) CO.order.push(bId(i)); });
    CO.pos = 0;
    safeLog(`<strong>— Ronda ${CO.round} —</strong> orden: ${CO.order.map(orderLabel).join(' → ')}`);
  }

  function orderLabel(id) {
    const bi = bIdx(id);
    if (bi >= 0) { const b = state.teams.p2[bi]; return '👹 ' + esc(b ? b.name : '?'); }
    const c = slotChar(id);
    return '⚔️ ' + esc(c ? c.name : '?');
  }

  function advance() {
    if (state.phase !== 'battle') return;
    CO.seq++;
    CO.pos++;
    let guard = 0;
    while (guard++ < 24) {
      if (CO.pos >= CO.order.length) {
        startRound();
        if (state.teams.p1.every(c => c.hp <= 0)) { finish('lose'); return; }
      }
      const id = CO.order[CO.pos];
      const bi = bIdx(id);
      if (bi >= 0 ? (state.teams.p2[bi] && state.teams.p2[bi].hp > 0) : (slotAlive(id) && ensureFront(id))) { CO.cur = id; break; }
      CO.pos++;
    }
    if (typeof CO.cur === 'number') {
      state.turnOwner = 'p1'; state.activeIndex.p1 = CO.front[CO.cur];
      state.activeIndex.p2 = Math.max(0, aliveBossIdx()[0] || 0);
    } else {
      state.turnOwner = 'p2'; state.activeIndex.p2 = Math.max(0, bIdx(CO.cur));
    }
    beginTurn();
  }

  function beginTurn() {
    const seq = CO.seq;
    orig.startTurnActions.call(W);        // DoT, cooldowns, aturdido/congelado/miedo (puede saltar el turno)
    if (CO.seq !== seq || state.phase !== 'battle') return;
    const bi = bIdx(CO.cur);
    if (bi >= 0 && (!state.teams.p2[bi] || state.teams.p2[bi].hp <= 0)) { advance(); return; }   // murió por un DoT al empezar su turno
    if (typeof CO.cur === 'number' && (!slotAlive(CO.cur) || !slotChar(CO.cur) || slotChar(CO.cur).hp <= 0)) {
      if (!ensureFront(CO.cur)) { advance(); return; }
      state.activeIndex.p1 = CO.front[CO.cur];
    }
    W.updateTurnInfo();
    W.updateArena();
    if (bi >= 0) scheduleBoss();
    else startTimerFor();
  }

  /* Gancho que usa game.js al morir el personaje activo por un DoT al empezar su turno. */
  W.COOP_HOOK = {
    active: false,
    pick(p) {
      if (CO.active && CO.started && p === 'p2') return -1;     // un jefe caído por un DoT no es sustituido por su hermano: el turno se salta
      if (!CO.active || !CO.started || p !== 'p1' || typeof CO.cur !== 'number') return undefined;
      const idx = aliveIn(CO.cur)[0];
      if (idx === undefined) return -1;
      CO.front[CO.cur] = idx;
      return idx;
    }
  };

  /* =====================================================================
     IA DEL JEFE (determinista: usa la misma semilla en los dos navegadores)
     ===================================================================== */
  /* Mecánicas especiales de los jefes (campo `special` de la habilidad):
       hit(actor, objetivo) .... se ejecuta tras golpear a cada objetivo (ataques)
       use(actor) .............. se ejecuta al usarla (apoyo: lleva el efecto {type:'special'}) */
  const SPECIALS = {
    chains: {
      hit(actor, t) {
        if (!t || t.hp <= 0 || isBossChar(t)) return;
        t.noSwap = Math.max(t.noSwap || 0, 2);
        safeLog(`⛓️ ${esc(t.name)} queda ENCADENADO: no podrá cambiar de personaje durante 2 turnos suyos.`);
      }
    },
    doom: {
      hit(actor, t) {
        if (!t || t.hp <= 0 || isBossChar(t) || t.doom) return;
        t.doom = { rounds: 3, src: actor.id };
        safeLog(`💀 ${esc(t.name)} está CONDENADO por ${esc(actor.name)}: en 3 rondas perderá el 35 % de su vida máxima (se rompe si ${esc(actor.name)} cae).`);
      }
    },
    guard: {
      use(actor) {
        actor.guardTurns = 2;
        const o = bosses().find(b => b !== actor && b.hp > 0);
        safeLog(o ? `🛡️ ${esc(actor.name)} protege a ${esc(o.name)}: los ataques contra ella se desvían a ${esc(actor.name)} durante 2 rondas.`
                  : `🛡️ ${esc(actor.name)} se pone en guardia.`);
      }
    },
    bloodpact: {
      use(actor) {
        const cost = Math.max(0, Math.min(Math.round(actor.maxHp * 0.08), actor.hp - 1));
        actor.hp -= cost;
        safeLog(`🩸 ${esc(actor.name)} sacrifica ${cost} HP en un Pacto Carmesí.`);
        bosses().filter(b => b.hp > 0).forEach(b => {
          applySpecialEffect(actor, b, { type: 'lifesteal', value: 25, duration: 3 });
          orig.applyEffect.call(W, actor, b, { name: 'Pacto Carmesí', effect: { type: 'tempAtk', value: 4, duration: 3 } });
        });
      }
    }
  };

  function scheduleBoss() {
    CO.bossBusy = true;
    const tok = ++CO.bossTok;
    const delay = BOSS_THINK_MS + (CO.extraThink || 0);
    CO.extraThink = 0;
    setTimeout(() => runBossTurn(tok), delay);
  }

  async function runBossTurn(tok) {
    let acted = false;
    try {
      if (tok !== CO.bossTok) return;
      await waitFor(() => !CO.frozen && !state.moveLock && !CO.busy, 8000);
      if (state.phase !== 'battle' || !isBossTurn() || tok !== CO.bossTok) return;
      const boss = curBoss();
      if (!boss || boss.hp <= 0) return;
      state.activeIndex.p2 = bIdx(CO.cur);
      const mv = chooseBossMove(boss);
      acted = true;
      if (!mv) { safeLog(`${esc(boss.name)} no puede hacer nada este turno.`); W.endTurn(boss); }
      else {
        await orig.onUseMove.call(W, 'p2', mv.id);
        if (mv.selfDestruct && state.phase === 'battle') {
          boss.hp = 0;
          boss.shield = 0;
          safeLog(`💥 ${esc(boss.name)} self-destroys with ${esc(mv.name)}!`);
          W.updateArena();
          checkEnd();
        }
      }
    } finally {
      if (CO.bossTok === tok) CO.bossBusy = false;
    }
    if (acted) afterAction();
  }

  function chooseBossMove(boss) {
    const hpPct = boss.hp / boss.maxHp;
    const finalMove = boss.moves.find(m => m.finalAt != null && hpPct <= m.finalAt && m.cd === 0);
    if (finalMove) return finalMove;

    const avail = boss.moves.filter(m => m.cd === 0 && m.finalAt == null);
    if (!avail.length) return null;
    const fronts = frontAlive();
    const sibling = bosses().some(o => o !== boss && o.hp > 0);
    const ws = avail.map(m => {
      let w = Number(m.aiWeight) || 1;
      if (m.aoe) w *= fronts.length >= 2 ? 1.7 : 0.6;
      if (m.ult) w *= 3.5;
      if (m.type === 'support') {
        w *= hpPct > 0.7 ? 0.25 : 0.9;
        if (boss.shield > 0 && (m.effects || []).some(e => e.type === 'shield')) w *= 0.2;
      }
      if (m.special === 'guard' && !sibling) w *= 0.3;
      if (m.special === 'bloodpact' && hpPct < 0.3) w *= 0.1;
      if (m.special === 'doom' && fronts.every(c => c.doom)) w *= 0.15;
      if (m.special === 'chains' && fronts.every(c => c.noSwap > 0)) w *= 0.25;
      return Math.max(0.01, w);
    });
    const total = ws.reduce((a, b) => a + b, 0);
    let r = rnd() * total;
    for (let i = 0; i < avail.length; i++) { r -= ws[i]; if (r <= 0) return avail[i]; }
    return avail[avail.length - 1];
  }

  function applyPhases() {
    bosses().forEach(boss => {
      if (!boss || boss.hp <= 0 || !Array.isArray(boss.phases)) return;
      boss.phaseIdx = boss.phaseIdx || 0;
      while (boss.phaseIdx < boss.phases.length && boss.hp / boss.maxHp <= boss.phases[boss.phaseIdx].at) {
        const ph = boss.phases[boss.phaseIdx++];
        safeLog(`🔥 <strong>${esc(ph.log)}</strong>`);
        if (ph.atk) boss.atk += ph.atk;
        if (ph.def) boss.def += ph.def;
        if (ph.spd) boss.spd += ph.spd;
        if (ph.heal) boss.hp = Math.min(boss.maxHp, boss.hp + Math.round(boss.maxHp * ph.heal));
        if (ph.shield) boss.shield += ph.shield;
        if (ph.cleanse) { boss.statusEffects = []; boss.controlEffects = []; boss.debuffEffects = []; boss.stunned = 0; }
      }
    });
  }

  /* Un gemelo cae: su Condena se rompe, el otro entra en Furia de Luto y, si aún le queda,
     el caído revivirá tras `reviveAfter` rondas (Resurrección Gemela). */
  function handleFalls() {
    const def = bossDef(), bs = bosses();
    bs.forEach(b => {
      if (b.hp > 0 || b.fallen) return;
      b.fallen = true; b.guardTurns = 0;
      state.teams.p1.forEach(c => {
        if (c.doom && c.doom.src === b.id) { delete c.doom; safeLog(`✨ La Condena de ${esc(b.name)} se rompe.`); }
      });
      if (!def.duo || CO.stage !== 1) return;
      const other = bs.find(o => o !== b && o.hp > 0);
      if (!other) return;
      if ((b.reviveLeft || 0) > 0) {
        b.reviveLeft--; b.reviveIn = def.reviveAfter;
        safeLog(`⏳ ${esc(b.name)} ha caído… ¡pero revivirá en ${def.reviveAfter} rondas si ${esc(other.name)} sigue en pie! (Resurrección Gemela)`);
      } else safeLog(`☠️ ${esc(b.name)} cae definitivamente.`);
      other.atk += def.mournAtk || 0; other.spd += def.mournSpd || 0;
      safeLog(`😡 <strong>${esc(other.name)} ruge de dolor: ¡+${def.mournAtk || 0} ATK y +${def.mournSpd || 0} SPD!</strong> (Furia de Luto)`);
    });
  }

  /* Segunda fase: los gemelos se funden. Rondas y contador de turnos a cero, sin muerte súbita,
     y todos los aliados que no están KO recuperan TODA su vida. */
  function startStage2() {
    const st = bossDef().stage2;
    CO.stage = 2;
    safeLog(`🌌 <strong>${esc(st.intro)}</strong>`);
    showBanner('🌌 ' + st.name.toUpperCase());
    state.teams.p1.forEach(c => {
      delete c.doom; delete c.noSwap;
      if (c.hp > 0) c.hp = c.maxHp;
    });
    state.turnCount = 0; state.suddenDeath = false;
    CO.round = 0; CO.order = []; CO.pos = -1; CO.cur = null; CO.lastTarget = null; CO.focus = 0;
    const f = cloneCharacter(st);
    f.phaseIdx = 0; f.guardTurns = 0; f.reviveIn = 0; f.fallen = false; f.reviveLeft = 0;
    state.teams.p2 = [f];
    state.activeIndex.p2 = 0;
    playBossMusic(st);
    CO.extraThink = 2600;               // pausa para leer la transición si empieza el jefe
    W.updateArena();
    advance();
  }

  /* =====================================================================
     FIN DE COMBATE Y RECOMPENSAS
     ===================================================================== */
  function checkEnd() {
    if (state.phase === 'ended') return true;
    handleFalls();
    applyPhases();
    const def = bossDef();
    if (bosses().every(b => b.hp <= 0)) {
      if (def.duo && CO.stage === 1) { startStage2(); return true; }
      finish('win'); return true;
    }
    if (state.teams.p1.every(c => c.hp <= 0)) { finish('lose'); return true; }
    [0, 1].forEach(k => {
      const ch = slotChar(k);
      if (ch.hp <= 0 && ensureFront(k) && CO.cur === k) state.activeIndex.p1 = CO.front[k];
    });
    return false;
  }

  function finish(result) {
    if (state.phase === 'ended') return;
    state.phase = 'ended';
    CO.ended = true; CO.cur = null; CO.bossTok++; CO.bossBusy = false;
    stopBossMusic();
    const boss = bossChar();
    safeLog(result === 'win' ? `--- ¡${esc(boss.name)} ha sido derrotado! ---` : '--- Vuestro equipo ha caído... ---');
    const area = byId('moves-area'); if (area) area.innerHTML = '<div class="small">Batalla finalizada.</div>';
    W.updateTurnInfo();
    W.updateArena();
    setTimeout(() => endMatchUi(result), 1200);
  }

  function grantRewards(b) {
    const out = { first: false, coins: 0, chests: 0, skin: null, practice: CO.local, skinMissing: false };
    if (CO.local) return out;                       // práctica: sin recompensas
    const prog = loadProg();
    const R = b.rewards;
    out.first = !(prog.wins[b.id] > 0);
    out.coins = R.coins + (out.first ? R.firstCoins : 0);
    out.chests = R.chests + (out.first ? R.firstChests : 0);
    const wantSkin = out.first || Math.random() < (R.repeatSkinChance || 0);
    if (wantSkin) {
      try { if (W.SKINS && typeof W.SKINS.grantSkin === 'function') out.skin = W.SKINS.grantSkin(R.skinAllow); } catch (e) { /* ignorar */ }
      if (!out.skin && out.first) { out.skinMissing = true; out.coins += Math.round(R.coins * 0.6); }   // no quedan skins de esa rareza: compensación
    }
    try { if (W.SKINS && typeof W.SKINS.addCoins === 'function') W.SKINS.addCoins(out.coins); else out.coins = 0; } catch (e) { out.coins = 0; }
    try { if (W.INVENTARIO && typeof W.INVENTARIO.add === 'function') W.INVENTARIO.add(out.chests); else out.chests = 0; } catch (e) { out.chests = 0; }
    prog.wins[b.id] = (prog.wins[b.id] || 0) + 1;
    saveProg(prog);
    return out;
  }

  /* =====================================================================
     SINCRONIZACIÓN: acciones locales y remotas
     ===================================================================== */
  function afterAction() {
    CO.applied++;
    if (CO.local) return;
    reportHash();
  }

  function reportHash() {
    const n = CO.applied, h = hashState();
    CO.hashes.me[n] = h;
    send({ t: 'h', n, h });
    compareHash(n);
  }

  function compareHash(n) {
    const a = CO.hashes.me[n], b = CO.hashes.opp[n];
    if (a === undefined || b === undefined) return;
    delete CO.hashes.me[n]; delete CO.hashes.opp[n];
    if (a !== b) desync(n);
  }

  function desync(n) {
    if (CO.local) return;
    CO.desyncs++;
    console.warn('[cooperativo] desincronización en la acción', n);
    safeLog('⚠️ Se detectó una desincronización. Resincronizando…');
    CO.frozen = true;
    CO.hashes = { me: {}, opp: {} };
    if (CO.isHost) sendSnapshot();
    else send({ t: 'resync_req' });
  }

  async function sendSnapshot() {
    CO.frozen = true;
    await waitFor(() => !state.moveLock && !CO.busy && !CO.draining && !CO.bossBusy, 8000);
    CO.queue = [];
    const data = JSON.parse(JSON.stringify({
      teams: state.teams, activeIndex: state.activeIndex, turnOwner: state.turnOwner, turnCount: state.turnCount,
      phase: state.phase, rng: rngS, applied: CO.applied,
      front: CO.front, order: CO.order, pos: CO.pos, round: CO.round, cur: CO.cur, seq: CO.seq, stage: CO.stage
    }));
    send({ t: 'snap', data });
    CO.frozen = false;
    if (state.phase === 'battle') { W.updateArena(); if (isBossTurn() && !CO.bossBusy) scheduleBoss(); }
  }

  function applySnapshot(d) {
    if (!d || !d.teams) return;
    CO.queue = [];
    state.teams.p1 = d.teams.p1; state.teams.p2 = d.teams.p2;
    state.activeIndex = d.activeIndex; state.turnOwner = d.turnOwner; state.turnCount = d.turnCount; state.phase = d.phase;
    rngS = d.rng >>> 0; CO.applied = d.applied;
    CO.front = d.front; CO.order = d.order; CO.pos = d.pos; CO.round = d.round; CO.cur = d.cur; CO.seq = d.seq;
    const newStage = d.stage || 1;
    if (newStage !== CO.stage) { CO.stage = newStage; const bd = bossDef(); playBossMusic(newStage === 2 && bd.stage2 ? bd.stage2 : bd); }
    state.moveLock = false; CO.busy = false; CO.frozen = false; CO.bossBusy = false; CO.bossTok++;
    CO.hashes = { me: {}, opp: {} };
    W.updateArena(); W.updateTurnInfo();
    safeLog('✅ Partida resincronizada con el anfitrión.');
    if (state.phase === 'battle' && isBossTurn()) scheduleBoss();
  }

  async function drain() {
    if (CO.draining) return;
    CO.draining = true;
    try {
      while (CO.queue.length) {
        const ok = await waitFor(() => !state.moveLock && !CO.busy && !CO.bossBusy, 12000);
        if (!ok) { CO.queue = []; desync(CO.applied); break; }
        const msg = CO.queue.shift();
        await applyRemote(msg);
      }
    } finally { CO.draining = false; }
  }

  async function applyRemote(msg) {
    if (state.phase !== 'battle' || !CO.started) return;
    const oppSeat = 1 - CO.seat;
    if (typeof CO.cur !== 'number' || CO.cur !== oppSeat || msg.slot !== oppSeat) return desync(CO.applied);

    if (msg.t === 'skip') {
      safeLog(`⏱ ${esc(CO.nick.opp)} se quedó sin tiempo y pierde el turno.`);
      W.endTurn(slotChar(oppSeat));
      afterAction();
      return;
    }

    if (msg.t === 'swap') {
      const idx = Number(msg.idx);
      if (!canSwap(oppSeat, idx)) return desync(CO.applied);
      CO.applyingRemote = true;
      try { doSwap(oppSeat, idx, false); } finally { CO.applyingRemote = false; }
      afterAction();
      return;
    }

    if (msg.t === 'move') {
      const actor = slotChar(oppSeat);
      const move = actor && actor.moves.find(m => m.id === msg.moveId);
      if (!actor || !move || move.cd > 0) return desync(CO.applied);
      if (typeof msg.req === 'number') state.activeIndex.p2 = resolveFocus(msg.req);
      CO.applyingRemote = true;
      CO.presetTarget = { value: (msg.target === undefined ? null : msg.target) };
      try { await orig.onUseMove.call(W, 'p1', msg.moveId); }
      finally { CO.applyingRemote = false; CO.presetTarget = null; }
      afterAction();
    }
  }

  function canSwap(k, idx) {
    const t = state.teams.p1[idx];
    const cur = slotChar(k);
    if (cur && cur.hp > 0 && cur.noSwap > 0) return false;        // ENCADENADO
    return !!t && t.hp > 0 && slotRange(k).includes(idx) && idx !== CO.front[k];
  }

  /* ---------------- Objetivo en jefes dobles ---------------- */
  function pickFocus() {
    const alive = aliveBossIdx();
    return alive.includes(CO.focus) ? CO.focus : (alive[0] || 0);
  }
  // Devuelve el jefe que recibirá un ataque a un objetivo; la Guardia Gemela lo desvía.
  function resolveFocus(req) {
    const alive = aliveBossIdx();
    if (!alive.length) return 0;
    let idx = alive.includes(req) ? req : alive[0];
    const g = alive.find(i => i !== idx && bosses()[i].guardTurns > 0);
    if (g !== undefined) {
      safeLog(`🛡️ ${esc(bosses()[g].name)} intercepta el ataque dirigido a ${esc(bosses()[idx].name)}.`);
      idx = g;
    }
    return idx;
  }
  function showBanner(text) {
    let el = byId('co-banner');
    if (!el) { el = document.createElement('div'); el.id = 'co-banner'; document.body.appendChild(el); }
    el.textContent = text;
    el.className = 'show';
    clearTimeout(showBanner.t);
    showBanner.t = setTimeout(() => { el.className = ''; }, 3600);
  }
  function doSwap(k, idx, consume) {
    CO.front[k] = idx;                     // antes de llamar al motor: su endTurn ya debe ver el nuevo frontal
    return orig.performSwap.call(W, 'p1', idx, !!consume);
  }

  /* ---------------- Límite de tiempo por turno ---------------- */
  function ensureTimerEl() {
    let el = byId('co-timer');
    if (!el) {
      const anchor = byId('turnInfo');
      if (!anchor || !anchor.parentNode) return null;
      el = document.createElement('span');
      el.id = 'co-timer';
      el.className = 'co-timer';
      el.style.display = 'none';
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
    }
    return el;
  }
  const fmtTime = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function startTimerFor() { CO.timer.key = null; }
  function stopTimer() { const el = byId('co-timer'); if (el) el.style.display = 'none'; CO.timer.key = null; }

  function tickTimer() {
    const el = ensureTimerEl();
    if (!el) return;
    if (!CO.active || CO.local || !CO.started || state.phase !== 'battle' || CO.ended || typeof CO.cur !== 'number') {
      el.style.display = 'none'; CO.timer.key = null; return;
    }
    const key = CO.seq + '|' + CO.cur;
    if (key !== CO.timer.key) { CO.timer.key = key; CO.timer.deadline = Date.now() + TURN_MS; }
    const left = Math.max(0, CO.timer.deadline - Date.now());
    const mine = isMine(CO.cur);
    el.style.display = 'inline-flex';
    el.className = 'co-timer' + (mine ? ' mine' : '') + (left <= 15000 ? ' low' : '');
    el.textContent = `⏱ ${fmtTime(left)}${mine ? ' · tu turno' : ' · ' + seatName(CO.cur)}`;
    if (left <= 0 && mine) handleTimeout(key);
  }

  function handleTimeout(key) {
    if (CO.timer.firedKey === key || CO.ended || CO.frozen) return;
    if (CO.busy || state.moveLock || CO.draining) {
      if (CO.busy && !state.moveLock) {
        const m = byId('modal');
        if (m && m.style.display !== 'none') {
          const btns = m.querySelectorAll('.class-btn');
          if (btns.length) btns[btns.length - 1].click();
        }
      }
      CO.timer.deadline = Date.now() + 1500;
      return;
    }
    CO.timer.firedKey = key;
    try { if (typeof closeModal === 'function') closeModal(); } catch (e) { /* ignorar */ }
    safeLog(`⏱ ${esc(CO.nick.me)} se quedó sin tiempo y pierde el turno.`);
    send({ t: 'skip', slot: CO.cur });
    const k = CO.cur;
    W.endTurn(slotChar(k));
    afterAction();
  }

  function startTimerLoop() {
    if (CO.timer.int) return;
    CO.timer.int = setInterval(tickTimer, 500);
  }

  /* =====================================================================
     PARCHES SOBRE game.js (solo actúan si CO.active)
     Se instalan al empezar la primera partida, así quedan por fuera de los
     ganchos de otros archivos (perfil.js, pasivas.js...).
     ===================================================================== */
  function lockButtons() {
    const area = byId('moves-area');
    if (area && area.querySelectorAll) area.querySelectorAll('button').forEach(b => { b.disabled = true; });
  }
  const inBattle = () => CO.active && CO.started;

  function installPatches() {
    if (CO.installed) return;
    CO.installed = true;
    ['toggleSelectChar', 'updateStartBtn', 'startBattle', 'initAll', 'renderMovesArea', 'onUseMove', 'performSwap',
      'openTargetModal', 'updateTurnInfo', 'checkKO', 'endTurn', 'startTurnActions', 'updateArena',
      'getNormalMoveTargets', 'applyStatusEffect', 'applyDamage', 'applyEffect', 'animateAttack', 'flashHit'
    ].forEach(n => { orig[n] = W[n]; });

    /* ----- selección de equipo ----- */
    W.toggleSelectChar = function (player) {
      if (CO.active && CO.started) return;
      if (CO.active && !CO.local && (player !== ownKey() || CO.ready.me)) return;
      return orig.toggleSelectChar.apply(this, arguments);
    };
    W.updateStartBtn = function () {
      if (!CO.active) return orig.updateStartBtn.apply(this, arguments);
      const b = byId('startBtn');
      if (!b) return;
      if (CO.local) {
        b.disabled = !(state.teams.p1.filter(Boolean).length === 3 && state.teams.p2.filter(Boolean).length === 3) || state.phase !== 'select';
        b.innerText = 'Comenzar batalla';
        return;
      }
      b.disabled = !(state.teams[ownKey()].filter(Boolean).length === 3) || CO.ready.me || state.phase !== 'select';
      b.innerText = CO.ready.me ? 'Esperando al compañero…' : 'Estoy listo ✔';
    };
    W.startBattle = function () {
      if (!CO.active) return orig.startBattle.apply(this, arguments);
      if (CO.started || state.phase !== 'select') return;
      if (CO.local) {
        const a = state.teams.p1.filter(Boolean), b = state.teams.p2.filter(Boolean);
        if (a.length !== 3 || b.length !== 3) return alert('Cada jugador debe elegir 3 personajes.');
        return beginBattle(a, b);
      }
      const mine = state.teams[ownKey()].filter(Boolean);
      if (mine.length !== 3 || CO.ready.me) return;
      CO.ready.me = true;
      const skins = {};
      mine.forEach(c => {
        try { const sid = W.SKINS && W.SKINS.selectedSkinId ? W.SKINS.selectedSkinId(c.id) : null; if (sid) skins[c.id] = sid; }
        catch (e) { /* ignorar */ }
      });
      send({ t: 'team', ids: mine.map(c => c.id), skins });
      W.updateStartBtn();
      W.updateTurnInfo();
      tryStartBattle();
    };
    W.initAll = function () {
      const r = orig.initAll.apply(this, arguments);
      if (CO.active && !CO.started) applySelectionUI();
      return r;
    };

    /* ----- combate ----- */
    W.startTurnActions = function () {
      if (!CO.active || !CO.started) return orig.startTurnActions.apply(this, arguments);
      if (CO.building) return;           // el motor la llama al montar el combate: la primera ronda la inicio yo
      return orig.startTurnActions.apply(this, arguments);
    };

    W.endTurn = function (finished) {
      if (!inBattle()) return orig.endTurn.apply(this, arguments);
      if (state.phase !== 'battle') return;
      const actor = finished || (state.turnOwner ? getActive(state.turnOwner) : null);
      if (actor) { try { processEndOfTurnEffects(actor); } catch (e) { /* ignorar */ } }
      if (actor && actor.noSwap > 0) actor.noSwap--;          // el encadenamiento dura N turnos del propio personaje
      if (W.checkKO()) return;
      advance();
    };

    W.checkKO = function () {
      if (!inBattle()) return orig.checkKO.apply(this, arguments);
      return checkEnd();
    };

    W.getNormalMoveTargets = function (playerKey, actor, move) {
      if (!inBattle() || playerKey !== 'p2') return orig.getNormalMoveTargets.apply(this, arguments);
      const fronts = frontAlive();
      if (!fronts.length) return [];
      if (isCharmed(actor) && move.type === 'attack') return orig.getNormalMoveTargets.apply(this, arguments);
      if (move.aoe) return fronts;
      // Un solo objetivo: 55 % el más herido, si no al azar entre los del frente.
      if (fronts.length > 1 && rnd() < 0.55) {
        return [fronts.slice().sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0]];
      }
      return [fronts[Math.floor(rnd() * fronts.length)]];
    };

    W.openTargetModal = function (player, targets) {
      if (inBattle()) {
        if (player === 'p2') return Promise.resolve(state.activeIndex.p2);   // el jefe siempre se apoya a sí mismo
        if (CO.presetTarget) {
          const v = CO.presetTarget.value;
          CO.presetTarget = null;
          return Promise.resolve(v);
        }
      }
      return orig.openTargetModal.apply(this, arguments);
    };

    W.applyStatusEffect = function (actor, target, effect) {
      if (inBattle() && target && isBossChar(target) && effect &&
          ['stun', 'freeze', 'charm', 'fear'].includes(effect.type)) {
        const resist = Number(target.ccResist);
        if (resist > 0 && rnd() < resist) {
          safeLog(`🛡️ ${esc(target.name)} resiste el efecto de control de ${esc(effect.type)}.`);
          return;
        }
        const r = orig.applyStatusEffect.apply(this, arguments);
        if (target.stunned > 1) target.stunned = 1;                  // sin aturdimientos largos
        return r;
      }
      return orig.applyStatusEffect.apply(this, arguments);
    };

    W.applyDamage = function (actor, target, move) {
      if (inBattle()) CO.lastTarget = target;
      const r = orig.applyDamage.apply(this, arguments);
      if (inBattle() && move && move.special && !move._isCounter && isBossChar(actor)) {
        const sp = SPECIALS[move.special];
        if (sp && sp.hit) sp.hit(actor, target, move);
      }
      return r;
    };

    // Habilidades de apoyo especiales del jefe: llevan el efecto {type:'special'}.
    W.applyEffect = function (actor, target, move) {
      if (inBattle() && isBossChar(actor) && move && move.effect && move.effect.type === 'special') {
        const sp = SPECIALS[move.special];
        if (sp && sp.use) sp.use(actor, move);
        return;
      }
      return orig.applyEffect.apply(this, arguments);
    };

    W.onUseMove = async function (playerKey, moveId) {
      if (!inBattle() || CO.applyingRemote || playerKey === 'p2') return orig.onUseMove.apply(this, arguments);
      if (playerKey !== 'p1' || !isMyTurn() || state.moveLock || CO.busy || CO.frozen) return;
      const actor = getActive('p1');
      const move = actor && actor.moves.find(m => m.id === moveId);
      if (!move || move.cd > 0 || actor.hp <= 0 || actor.stunned > 0) return;
      const slot = CO.cur;
      CO.busy = true;
      try {
        let target = null;
        if (isSupportMove(move)) {
          const chosen = await orig.openTargetModal.call(W, 'p1', getAliveTeam('p1'));
          target = chosen == null ? null : chosen;
        }
        if (state.phase !== 'battle' || CO.cur !== slot) return;
        // Jefe doble: los ataques a un objetivo van al jefe elegido (la Guardia Gemela puede desviarlos).
        let req;
        if (bosses().length > 1 && !isSupportMove(move) && !move.aoe) {
          req = pickFocus();
          state.activeIndex.p2 = resolveFocus(req);
        }
        send({ t: 'move', slot, moveId, target, req });
        CO.presetTarget = { value: target };
        lockButtons();
        await orig.onUseMove.call(W, 'p1', moveId);
      } finally {
        CO.presetTarget = null;
        CO.busy = false;
      }
      afterAction();
    };

    W.performSwap = function (player, newIndex, consumeTurn) {
      if (!inBattle() || CO.applyingRemote) return orig.performSwap.apply(this, arguments);
      if (player !== 'p1' || !isMyTurn() || state.moveLock || CO.busy || CO.frozen) return;
      if (!canSwap(CO.cur, newIndex)) return;
      send({ t: 'swap', slot: CO.cur, idx: newIndex });
      const r = doSwap(CO.cur, newIndex, consumeTurn);
      afterAction();
      return r;
    };

    /* ----- interfaz ----- */
    W.updateArena = function () {
      if (!inBattle()) return orig.updateArena.apply(this, arguments);
      renderArena();
      W.renderMovesArea();
    };

    W.renderMovesArea = function () {
      if (!CO.active || !CO.started) return orig.renderMovesArea.apply(this, arguments);
      if (state.phase !== 'battle') return;           // al terminar, el resultado ocupa esta zona
      renderMoves();
    };

    W.updateTurnInfo = function () {
      const r = orig.updateTurnInfo.apply(this, arguments);
      if (!CO.active) return r;
      const el = byId('turnInfo');
      if (!el) return r;
      if (state.phase === 'select') {
        el.innerText = CO.local ? 'Cada jugador elige 3 personajes y pulsa «Comenzar batalla»'
          : (CO.ready.me
            ? `Esperando a ${CO.nick.opp}…${CO.ready.opp ? ' (ya está listo)' : ''}`
            : `Elige 3 personajes y pulsa «Estoy listo»${CO.ready.opp ? ` — ${CO.nick.opp} ya está listo` : ''}`);
      } else if (state.phase === 'battle' && CO.started) {
        const who = isBossTurn() ? '👹 ' + (curBoss() ? curBoss().name : '?') : (typeof CO.cur === 'number' ? seatName(CO.cur) + (isMine(CO.cur) && !CO.local ? ' (tú)' : '') : '…');
        el.innerText = `Ronda ${CO.round} · Turno de ${who}`;
      }
      return r;
    };

    W.animateAttack = function (player) {
      if (!inBattle()) return orig.animateAttack.apply(this, arguments);
      return new Promise(res => {
        const img = byId(player === 'p2' ? 'co-img-b' + state.activeIndex.p2 : 'co-img-' + CO.cur);
        if (!img) return setTimeout(res, 650);
        const dir = player === 'p2' ? -1 : 1;
        img.style.transform = `translateX(${34 * dir}px)`;
        setTimeout(() => { img.style.transform = ''; setTimeout(res, 300); }, 350);
      });
    };

    W.flashHit = function (playerKey) {
      if (!inBattle()) return orig.flashHit.apply(this, arguments);
      const t = CO.lastTarget;
      let id = null;
      if (t && state.teams.p2.indexOf(t) >= 0) id = 'co-img-b' + state.teams.p2.indexOf(t);
      else if (t) { const i = state.teams.p1.indexOf(t); if (i === CO.front[0]) id = 'co-img-0'; else if (i === CO.front[1]) id = 'co-img-1'; }
      const img = id && byId(id);
      if (!img) return;
      img.style.filter = 'brightness(1.7) saturate(1.7) hue-rotate(-20deg)';
      setTimeout(() => { img.style.filter = ''; }, 300);
    };
  }

  /* =====================================================================
     INTERFAZ DE COMBATE
     ===================================================================== */
  function ensureArena() {
    let el = byId('co-arena');
    if (el) return el;
    const base = document.querySelector('.battle-arena');
    el = document.createElement('main');
    el.id = 'co-arena';
    el.className = 'card co-arena';
    el.style.display = 'none';
    if (base && base.parentNode) base.parentNode.insertBefore(el, base.nextSibling);
    else (byId('game-root') || document.body).appendChild(el);
    el.addEventListener('click', e => {
      const t = e.target && e.target.closest ? e.target.closest('[data-swap]') : null;
      if (t) W.performSwap('p1', Number(t.getAttribute('data-swap')), false);
      const f = e.target && e.target.closest ? e.target.closest('[data-focus]') : null;
      if (f && isMyTurn()) { CO.focus = Number(f.getAttribute('data-focus')); W.updateArena(); }
    });
    return el;
  }

  function statusLine(ch) {
    const bits = [`HP ${ch.hp}/${ch.maxHp}`];
    if (ch.shield > 0) bits.push(`🛡️${ch.shield}`);
    bits.push(`ATK ${getEffectiveStat(ch, 'atk')} · DEF ${getEffectiveStat(ch, 'def')} · SPD ${getEffectiveStat(ch, 'spd')}`);
    if (ch.stunned > 0) bits.push(`😵 STUN(${ch.stunned})`);
    (ch.statusEffects || []).forEach(s => bits.push(`${s.status === 'burn' ? '🔥' : s.status === 'bleed' ? '🩸' : '☠️'}${s.status}(${s.remaining})`));
    (ch.controlEffects || []).forEach(e => bits.push(`${e.type === 'freeze' ? '❄️' : e.type === 'charm' ? '💕' : e.type === 'fear' ? '😨' : e.type === 'slow' ? '🐌' : '⚠️'}${e.type}(${e.remaining})`));
    (ch.debuffEffects || []).forEach(d => bits.push(`⬇️${String(d.stat).toUpperCase()}-${d.value}(${d.remaining})`));
    try { if (isInvulnerable(ch)) bits.push('✨INVULNERABLE'); } catch (e) { /* ignorar */ }
    if (ch.noSwap > 0) bits.push(`⛓️ENCADENADO(${ch.noSwap})`);
    if (ch.doom) bits.push(`💀CONDENA(${ch.doom.rounds})`);
    if (ch.guardTurns > 0) bits.push(`🛡️GUARDIA(${ch.guardTurns})`);
    if (ch.hp <= 0 && ch.reviveIn > 0) bits.push(`⏳REVIVE EN ${ch.reviveIn}`);
    return bits.join(' · ');
  }

  const hpPct = ch => Math.max(0, Math.round((ch.hp / ch.maxHp) * 100));

  function allyPanel(k) {
    const ch = slotChar(k);
    if (!ch) return '';
    const cur = CO.cur === k ? ' co-turn' : '';
    const mine = isMine(k) ? ' co-mine' : '';
    return `<div class="co-panel${cur}${mine}${ch.hp <= 0 ? ' co-ko' : ''}">
      <div class="co-tag">${esc(seatName(k))}${isMine(k) && !CO.local ? ' (tú)' : ''}</div>
      <div class="co-fighter"><img id="co-img-${k}" src="${esc(ch.img)}" alt=""></div>
      <div class="co-name">${esc(ch.name)}</div>
      <div class="hpbar"><i style="width:${hpPct(ch)}%"></i></div>
      <div class="co-stats">${esc(statusLine(ch))}</div>
    </div>`;
  }

  function reserveStrip(k) {
    const chips = slotRange(k).filter(i => i !== CO.front[k]).map(i => {
      const c = state.teams.p1[i];
      const canClick = isMyTurn() && CO.cur === k && canSwap(k, i);
      return `<div class="co-chip${c.hp <= 0 ? ' co-ko' : ''}${canClick ? ' co-click' : ''}" title="${esc(c.name)} — ${c.hp}/${c.maxHp} HP"${canClick ? ` data-swap="${i}"` : ''}>
        <img src="${esc(c.img)}" alt=""><div class="hpbar"><i style="width:${hpPct(c)}%"></i></div><span>${esc(c.name)}</span></div>`;
    }).join('');
    return `<div class="co-reserve"><div class="co-reserve-title">Reserva de ${esc(seatName(k))}</div><div class="co-chips">${chips}</div></div>`;
  }

  function renderArena() {
    const el = ensureArena();
    const oa = document.querySelector('.battle-arena'); if (oa) oa.style.display = 'none';
    el.style.display = '';
    const boss = bossChar();
    if (!boss || !state.teams.p1.length) return;
    const order = CO.order.length ? CO.order.map((id, i) =>
      `<span class="co-ord${i === CO.pos ? ' now' : ''}${i < CO.pos ? ' done' : ''}">${orderLabel(id)}</span>`).join('<i>›</i>') : '';
    const multi = bosses().length > 1;
    const focus = pickFocus();
    const tier = bossById(CO.bossId).tier;
    const bossPanel = (b, i) => {
      const bp = b.phases && b.phaseIdx ? ` · ${'🔥'.repeat(Math.min(3, b.phaseIdx))}` : '';
      const focused = multi && b.hp > 0 && focus === i;
      const clickable = multi && b.hp > 0 && isMyTurn();
      return `<div class="co-boss${CO.cur === bId(i) ? ' co-turn' : ''}${b.hp <= 0 ? ' co-ko' : ''}${focused ? ' co-focus' : ''}${clickable ? ' co-click' : ''}"${clickable ? ` data-focus="${i}"` : ''}>
          <div class="co-tag">JEFE ${stars(tier)}${bp}${focused ? ' · 🎯' : ''}</div>
          <div class="co-fighter co-bigfighter"><img id="co-img-b${i}" src="${esc(b.img)}" alt=""></div>
          <div class="co-name">${esc(b.name)}</div>
          <div class="hpbar co-bosshp"><i style="width:${hpPct(b)}%"></i></div>
          <div class="co-stats">${esc(statusLine(b))}</div>
        </div>`;
    };
    const stageTag = bossDef().duo ? `<div class="co-stage">${CO.stage === 2 ? '🌌 FASE 2 — ' + esc(bossDef().stage2.name) : '⚔️ FASE 1 — ' + esc(bossDef().name)}</div>` : '';
    el.innerHTML = `
      <div class="co-top"><div class="co-order">${order}</div></div>
      ${stageTag}
      <div class="co-grid${multi ? ' co-duo' : ''}">
        <div class="co-allies">
          <div class="co-front">${allyPanel(0)}${allyPanel(1)}</div>
          <div class="co-reserves">${reserveStrip(0)}${reserveStrip(1)}</div>
        </div>
        <div class="co-bossbox${multi ? ' co-two' : ''}">${bosses().map(bossPanel).join('')}</div>
      </div>`;
  }

  function renderMoves() {
    const area = byId('moves-area');
    if (!area) return;
    area.innerHTML = '';
    if (CO.cur === null || CO.cur === undefined) { area.innerHTML = '<div class="small">Preparando el combate…</div>'; return; }
    if (isBossTurn()) {
      area.innerHTML = `<div class="small">👹 Turno de ${esc(curBoss() ? curBoss().name : 'jefe')}…</div>`;
      return;
    }
    const k = CO.cur;
    const actor = slotChar(k);
    if (!isMyTurn() || !actor) {
      area.innerHTML = `<div class="small">⏳ Turno de ${esc(seatName(k))}${actor ? ' — ' + esc(actor.name) + ' (activo)' : ''}…</div>`;
      return;
    }
    const frozen = CO.frozen;
    const title = document.createElement('div');
    title.innerHTML = `<strong>${esc(seatName(k))} — ${esc(actor.name)} (activo)</strong>`;
    area.appendChild(title);
    const aliveB = aliveBossIdx();
    if (aliveB.length > 1) {
      const row = document.createElement('div');
      row.className = 'co-swaprow';
      row.innerHTML = '<div class="small" style="margin:6px 0 4px;width:100%">🎯 Objetivo de los ataques a un objetivo (también puedes pulsar al jefe):</div>';
      aliveB.forEach(i => {
        const b = bosses()[i];
        const bt = document.createElement('button');
        bt.className = 'swap-btn' + (pickFocus() === i ? ' co-focusbtn' : '');
        bt.textContent = `${pickFocus() === i ? '🎯 ' : ''}${b.name} (${b.hp}/${b.maxHp})${b.guardTurns > 0 ? ' 🛡️' : ''}`;
        bt.onclick = () => { CO.focus = i; W.updateArena(); };
        row.appendChild(bt);
      });
      area.appendChild(row);
    }
    actor.moves.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'move-btn';
      const nameClass = (m.type === 'support' || getMoveEffects(m).some(e => e && (e.type === 'heal' || e.type === 'shield' || (typeof e.type === 'string' && e.type.startsWith('temp'))))) ? 'support' : 'attack';
      btn.innerHTML = `<div><span class="move-name ${nameClass}">${esc(m.name)}</span><span style="float:right" class="cooldown-badge">${m.cd > 0 ? ('CD:' + m.cd) : 'Listo'}</span></div><div class="move-desc">${esc(m.desc)}</div>`;
      if (m.cd > 0 || actor.hp <= 0 || actor.stunned > 0 || frozen) btn.disabled = true;
      btn.onclick = () => W.onUseMove('p1', m.id);
      area.appendChild(btn);
    });
    if (actor.noSwap > 0) {
      const note = document.createElement('div');
      note.className = 'small';
      note.style.margin = '8px 0 4px';
      note.textContent = `⛓️ ${actor.name} está ENCADENADO: no puedes cambiarlo durante ${actor.noSwap} turno(s) suyo(s).`;
      area.appendChild(note);
    }
    const reserve = slotRange(k).filter(i => canSwap(k, i));
    if (reserve.length) {
      const row = document.createElement('div');
      row.className = 'co-swaprow';
      row.innerHTML = '<div class="small" style="margin:8px 0 4px">🔁 Cambiar personaje (no consume turno):</div>';
      reserve.forEach(i => {
        const b = document.createElement('button');
        b.className = 'swap-btn';
        b.textContent = `${state.teams.p1[i].name} (${state.teams.p1[i].hp}/${state.teams.p1[i].maxHp})`;
        b.onclick = () => W.performSwap('p1', i, false);
        row.appendChild(b);
      });
      area.appendChild(row);
    }
  }

  /* =====================================================================
     RESULTADO
     ===================================================================== */
  function endMatchUi(result) {
    if (CO.result && CO.result.kind === result) { showResultUi(); return; }
    CO.ended = true;
    stopTimer();
    const b = bossById(CO.bossId);
    let title, sub = '', rewards = null;
    if (result === 'win') {
      title = `🏆 ¡${finalName(b)} derrotado!`;
      sub = CO.local ? 'Práctica terminada (sin recompensas).' : '¡Gran trabajo en equipo!';
      if (!CO.rewarded) { CO.rewarded = true; rewards = grantRewards(b); CO.rewardsInfo = rewards; }
      try { if (!CO.local && W.SFX) W.SFX.play('enhorabuena'); } catch (e) { /* ignorar */ }
    } else if (result === 'lose') {
      title = '💀 Vuestro equipo ha caído';
      sub = `${b.name} era demasiado fuerte esta vez. ¡Probad otra estrategia!`;
    } else {
      title = 'Partida terminada';
      sub = `${CO.nick.opp} se ha desconectado.`;
    }
    CO.result = { kind: result, title, sub, rewards: rewards || CO.rewardsInfo || null };
    const t = byId('turnInfo'); if (t) t.innerText = title;
    showResultUi();
  }

  function rewardHTML(r) {
    if (!r) return '';
    if (r.practice) return '';
    const coin = (W.SKINS && W.SKINS.coinImg) ? W.SKINS.coinImg() : '🪙';
    let h = '<div class="co-rewards">';
    if (r.first) h += '<div class="co-first">✨ ¡Primera victoria contra este jefe! Bonus extra incluido.</div>';
    h += `<div class="co-rw">${coin} <b>+${fmt(r.coins)}</b> monedas</div>`;
    h += `<div class="co-rw">📦 <b>+${fmt(r.chests)}</b> cofres <small>(en tu Inventario)</small></div>`;
    if (r.skin) {
      h += `<div class="co-rw co-skin" style="--c:${esc(r.skin.rarityColor)}"><img src="${esc(r.skin.img)}" alt="" onerror="this.style.display='none'">
        <span>${esc(r.skin.rarityIcon)} Skin ${esc(r.skin.rarityLabel)}: <b>${esc(r.skin.name)}</b></span></div>`;
    } else if (r.skinMissing) {
      h += '<div class="co-rw"><small>Ya tienes todas las skins de esa rareza: te compensamos con monedas extra.</small></div>';
    }
    return h + '</div>';
  }

  function resultButtons() {
    const connected = CO.local || (!!(CO.conn && CO.conn.open) && !CO.leavingMatch);
    const label = CO.rematch.me ? '⏳ Esperando al compañero…' : (CO.rematch.opp ? '🔁 Aceptar revancha' : '🔁 Otra vez');
    return `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <button id="co-rematch" class="class-btn" data-sfx="none" ${connected && !CO.rematch.me ? '' : 'disabled'}>${label}</button>
      <button id="co-exit" class="class-btn">🚪 Salir al menú</button></div>`;
  }

  function showResultUi() {
    const r = CO.result || { title: '', sub: '', rewards: null };
    const area = byId('moves-area');
    if (area) { area.innerHTML = `<div><strong>${esc(r.title)}</strong></div><div class="small">${esc(r.sub)}</div>${resultButtons()}`; bindResultButtons(area); }
    let ov = byId('co-result');
    if (!ov) { ov = document.createElement('div'); ov.id = 'co-result'; document.body.appendChild(ov); }
    ov.style.display = 'flex';
    ov.innerHTML = `<div class="co-result-card"><h2>${esc(r.title)}</h2><p class="small">${esc(r.sub)}</p>${rewardHTML(r.rewards)}${resultButtons()}
      <button id="co-result-close" class="class-btn" style="margin-top:8px">Ver el combate</button></div>`;
    bindResultButtons(ov);
    const c = byId('co-result-close'); if (c) c.onclick = () => { ov.style.display = 'none'; };
  }

  function refreshResultUi() { if (state.phase === 'ended' && CO.result) showResultUi(); }
  function hideResultUi() { const ov = byId('co-result'); if (ov) ov.style.display = 'none'; }

  function bindResultButtons(root) {
    const rb = root.querySelector ? root.querySelector('#co-rematch') : null;
    const eb = root.querySelector ? root.querySelector('#co-exit') : null;
    if (rb) rb.onclick = () => {
      if (CO.rematch.me) return;
      CO.rematch.me = true;
      if (CO.local) { CO.seed = randomSeed(); beginSetup(); return; }
      send({ t: 'rematch' }); refreshResultUi(); maybeRematch();
    };
    if (eb) eb.onclick = () => leaveMatch();
  }

  function maybeRematch() {
    if (!CO.isHost || CO.local || !CO.rematch.me || !CO.rematch.opp) return;
    CO.seed = randomSeed();
    send({ t: 'config', boss: CO.bossId, seed: CO.seed });
    beginSetup();
  }

  function leaveMatch() {
    stopBossMusic();
    send({ t: 'bye' });
    CO.leavingMatch = true;
    setTimeout(() => { try { location.reload(); } catch (e) { /* ignorar */ } }, 150);
  }

  /* =====================================================================
     LOBBY (elegir jefe, crear/unirse a sala, práctica)
     ===================================================================== */
  function injectStyles() {
    if (byId('co-styles')) return;
    const st = document.createElement('style');
    st.id = 'co-styles';
    st.textContent = `
    .co-poster-panel .story-poster-subtitle{color:#fdba74!important}
    .co-poster-panel .story-poster-cta{background:linear-gradient(180deg,rgba(251,146,60,.96),rgba(194,65,12,.94))!important;color:#fff!important;box-shadow:0 10px 22px rgba(194,65,12,.36)!important}
    #co-screen{position:fixed;inset:0;display:none;align-items:flex-start;justify-content:center;padding:20px;overflow:auto;z-index:123;
      background:radial-gradient(circle at 15% 0%,rgba(251,146,60,.16),transparent 38%),radial-gradient(circle at 85% 8%,rgba(167,139,250,.16),transparent 38%),linear-gradient(180deg,#040712 0%,#0a1124 100%)}
    #co-screen .co-card{width:min(760px,100%);display:flex;flex-direction:column;gap:10px;margin:auto}
    #co-screen input[type=text]{padding:10px 12px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:rgba(255,255,255,.04);color:inherit;font-size:15px;width:100%;box-sizing:border-box}
    #co-screen .co-row{display:flex;gap:8px;align-items:center}
    #co-screen .co-code{font-size:38px;font-weight:900;letter-spacing:.18em;text-align:center;padding:10px;border-radius:12px;background:rgba(255,255,255,.05);border:1px dashed rgba(251,146,60,.55)}
    .co-bosses{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin:4px 0}
    .co-bosscard{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:14px;cursor:pointer;border:1px solid rgba(148,163,184,.2);background:rgba(255,255,255,.03);transition:transform .15s,border-color .15s}
    .co-bosscard:hover{transform:translateY(-2px)}
    .co-bosscard.sel{border-color:rgba(251,146,60,.9);box-shadow:0 0 0 2px rgba(251,146,60,.25),0 0 22px rgba(251,146,60,.18)}
    .co-bosscard img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px}
    .co-bosscard h4{margin:0;font-size:15px}
    .co-bosscard .co-st{color:#fbbf24;letter-spacing:.1em;font-size:13px}
    .co-bosscard small{color:#94a3b8;line-height:1.35}
    .co-bosscard .co-rwd{color:#fde68a}
    .co-timer{display:inline-flex;align-items:center;margin-left:8px;padding:7px 11px;border-radius:999px;font-size:12px;font-weight:800;color:#cbd5e1;background:rgba(148,163,184,.10);border:1px solid rgba(148,163,184,.25)}
    .co-timer.mine{color:#fed7aa;background:rgba(251,146,60,.12);border-color:rgba(251,146,60,.45)}
    .co-timer.low{color:#fecaca;background:rgba(248,113,113,.16);border-color:rgba(248,113,113,.55)}
    .co-arena{margin-top:16px;padding:14px}
    .co-top{display:flex;justify-content:center;margin-bottom:10px}
    .co-order{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;font-size:12px}
    .co-order i{color:#64748b;font-style:normal}
    .co-ord{padding:4px 9px;border-radius:999px;border:1px solid rgba(148,163,184,.2);background:rgba(255,255,255,.03);color:#94a3b8}
    .co-ord.now{color:#fff;border-color:rgba(251,146,60,.8);background:rgba(251,146,60,.18);font-weight:800}
    .co-ord.done{opacity:.45}
    .co-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:16px;align-items:start}
    .co-front{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .co-panel,.co-boss{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px;border-radius:18px;border:1px solid rgba(148,163,184,.14);background:rgba(255,255,255,.02);min-width:0}
    .co-panel.co-mine{border-color:rgba(56,189,248,.35)}
    .co-boss{border-color:rgba(244,114,182,.30)}
    .co-turn{box-shadow:0 0 0 2px rgba(251,146,60,.85),0 0 22px rgba(251,146,60,.28)}
    .co-ko{filter:grayscale(1);opacity:.55}
    .co-tag{padding:4px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.16);background:rgba(255,255,255,.03);color:#b7c3d6;text-transform:uppercase;letter-spacing:.1em;font-size:10px;font-weight:800}
    .co-fighter{width:100%;height:180px;display:flex;align-items:center;justify-content:center;border-radius:16px;overflow:hidden;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.07),transparent 46%)}
    .co-bigfighter{height:250px}
    .co-fighter img{max-width:88%;max-height:92%;object-fit:contain;transition:transform .45s ease,filter .2s ease;filter:drop-shadow(0 18px 18px rgba(0,0,0,.35))}
    .co-name{font-weight:800;font-size:14px;text-align:center}
    .co-stats{font-size:11px;color:#aab8cc;text-align:center;line-height:1.4}
    .co-panel .hpbar,.co-boss .hpbar{width:92%}
    .co-reserves{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
    .co-reserve-title{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
    .co-chips{display:flex;gap:8px;flex-wrap:wrap}
    .co-chip{width:74px;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px;border-radius:12px;border:1px solid rgba(148,163,184,.14);background:rgba(255,255,255,.03)}
    .co-chip img{width:52px;height:52px;object-fit:cover;border-radius:10px}
    .co-chip span{font-size:10px;color:#b7c3d6;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .co-chip .hpbar{width:100%;height:8px;padding:1px;margin:0}
    .co-chip.co-click{cursor:pointer;border-color:rgba(56,189,248,.5)}
    .co-chip.co-click:hover{transform:translateY(-2px)}
    .co-swaprow{display:flex;gap:6px;flex-wrap:wrap}
    #co-result{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.74);z-index:124;padding:14px}
    #co-result .co-result-card{padding:22px 26px;border-radius:18px;background:#0b1530;border:1px solid rgba(251,146,60,.35);text-align:center;min-width:280px;max-width:min(92vw,480px);max-height:92vh;overflow:auto}
    .co-rewards{display:flex;flex-direction:column;gap:8px;margin:12px 0;text-align:left}
    .co-first{padding:8px 10px;border-radius:10px;background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.4);color:#fde68a;font-size:13px;font-weight:700}
    .co-rw{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.04);font-size:15px}
    .co-rw img.sk-coin-i{width:22px;height:22px}
    .co-skin{border:1px solid var(--c,#fbbf24);box-shadow:0 0 16px rgba(251,191,36,.2)}
    .co-skin img{width:54px;height:54px;object-fit:cover;border-radius:10px}
    .co-bossbox{display:flex;flex-direction:column;gap:12px;min-width:0}
    .co-bossbox.co-two{display:grid;grid-template-columns:1fr 1fr}
    .co-grid.co-duo{grid-template-columns:minmax(0,1.1fr) minmax(0,1.4fr)}
    .co-bossbox.co-two .co-bigfighter{height:190px}
    .co-boss.co-click{cursor:pointer}
    .co-boss.co-click:hover{transform:translateY(-2px)}
    .co-boss.co-focus{border-color:rgba(244,63,94,.85);box-shadow:0 0 0 2px rgba(244,63,94,.35)}
    .co-boss.co-focus.co-turn{box-shadow:0 0 0 2px rgba(251,146,60,.85),0 0 22px rgba(251,146,60,.28)}
    .swap-btn.co-focusbtn{border-color:rgba(244,63,94,.8);background:rgba(244,63,94,.16)}
    .co-stage{text-align:center;margin:-2px 0 10px;font-size:12px;font-weight:800;letter-spacing:.1em;color:#e9d5ff;text-transform:uppercase}
    .co-duoimg{display:grid;grid-template-columns:1fr 1fr;gap:4px}
    .co-duoimg img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px}
    #co-banner{position:fixed;left:50%;top:16%;transform:translateX(-50%) scale(.9);padding:16px 28px;border-radius:16px;background:linear-gradient(180deg,#3b0764,#0b0620);border:1px solid rgba(192,132,252,.7);box-shadow:0 0 40px rgba(168,85,247,.45);color:#f5d0fe;font-weight:900;font-size:22px;letter-spacing:.06em;text-align:center;z-index:125;opacity:0;pointer-events:none;transition:opacity .4s,transform .4s;max-width:90vw}
    #co-banner.show{opacity:1;transform:translateX(-50%) scale(1)}
    @media (max-width:820px){.co-grid.co-duo{grid-template-columns:1fr}.co-grid{grid-template-columns:1fr}.co-fighter{height:150px}.co-bigfighter{height:200px}}`;
    document.head.appendChild(st);
  }

  function bossCardHTML(b) {
    const wins = loadProg().wins[b.id] || 0;
    const R = b.rewards;
    return `<div class="co-bosscard${b.id === CO.bossId ? ' sel' : ''}" data-boss="${esc(b.id)}">
      ${b.duo ? `<div class="co-duoimg">${b.members.map(m => `<img src="${esc(m.img)}" alt="">`).join('')}</div>` : `<img src="${esc(b.img)}" alt="">`}
      <h4>${esc(b.name)}</h4>
      <div class="co-st">${stars(b.tier)}</div>
      <small>${esc(b.tagline)}</small>
      <small>${b.duo ? `❤️ ${b.members.map(m => fmt(m.hp)).join(' + ')} HP · ⚔️ ${b.atk} · 🛡️ ${b.def}<br>🌌 Fase final: ${esc(b.stage2.name)} (❤️ ${fmt(b.stage2.hp)})` : `❤️ ${fmt(b.hp)} HP · ⚔️ ${b.atk} · 🛡️ ${b.def}`}</small>
      <small class="co-rwd">🪙 ${fmt(R.coins)} · 📦 ${R.chests} · 1ª vez: +🪙${fmt(R.firstCoins)} +📦${R.firstChests} + skin</small>
      <small>${wins > 0 ? `✅ Derrotado ${wins} ${wins === 1 ? 'vez' : 'veces'}` : '🆕 Aún sin derrotar'}</small>
    </div>`;
  }

  function renderBossList() {
    const box = byId('co-boss-list');
    if (!box) return;
    box.innerHTML = BOSSES.map(bossCardHTML).join('');
    box.querySelectorAll('[data-boss]').forEach(el => {
      el.addEventListener('click', () => { CO.bossId = el.getAttribute('data-boss'); renderBossList(); });
    });
  }

  function injectMarkup() {
    if (!byId('co-screen')) {
      const s = document.createElement('div');
      s.id = 'co-screen';
      s.innerHTML = `
        <div class="menu-card co-card">
          <h2>🤝 Cooperativo online — Jefes</h2>
          <p class="small">Dos jugadores contra un jefe único. Cada uno elige 3 personajes y lucháis juntos: 2 al frente (uno de cada jugador) y el resto en reserva. ¡Al ganar, grandes recompensas!</p>
          <label class="small" for="co-nick">Tu nombre</label>
          <input id="co-nick" type="text" maxlength="16" placeholder="Jugador" autocomplete="off">
          <div id="co-step-choose">
            <div class="small" style="margin:6px 0 2px">1) El anfitrión elige el jefe (el invitado se une con el código):</div>
            <div id="co-boss-list" class="co-bosses"></div>
            <button id="co-create" class="menu-btn">➕ Crear sala con el jefe elegido</button>
            <div class="co-row" style="margin-top:8px">
              <input id="co-code" type="text" maxlength="5" placeholder="CÓDIGO" autocomplete="off" style="text-transform:uppercase;text-align:center;letter-spacing:.2em">
              <button id="co-join" class="menu-btn" style="margin:0;white-space:nowrap">🔗 Unirse</button>
            </div>
            <button id="co-solo" class="class-btn" style="margin-top:8px">🧪 Probar en solitario (controlas a los dos jugadores, sin recompensas)</button>
          </div>
          <div id="co-step-wait" style="display:none">
            <div class="small">Código de sala</div>
            <div id="co-code-show" class="co-code"></div>
            <div class="co-row" style="margin-top:8px"><button id="co-copy" class="class-btn">📋 Copiar código</button></div>
            <div id="co-wait-msg" class="small" style="margin-top:8px"></div>
          </div>
          <div id="co-status" class="small" style="min-height:18px"></div>
          <button id="co-back" class="class-btn">⬅ Volver al menú</button>
        </div>`;
      document.body.appendChild(s);
      byId('co-create').addEventListener('click', createRoom);
      byId('co-join').addEventListener('click', joinRoom);
      byId('co-solo').addEventListener('click', startSolo);
      byId('co-back').addEventListener('click', closeLobby);
      byId('co-copy').addEventListener('click', () => {
        try { navigator.clipboard.writeText(CO.code); setStatus('Código copiado.'); }
        catch (e) { setStatus('Código: ' + CO.code); }
      });
      byId('co-code').addEventListener('keydown', e => { if (e.key === 'Enter') joinRoom(); });
    }

    /* Panel con portada en el menú (igual que Desafío, Torneo, Infierno…).
       interfaz.js lo oculta del menú y lo muestra dentro de «Más modos». */
    if (!byId('menu-coop')) {
      const layout = document.querySelector('#main-menu .menu-layout');
      const story = byId('menu-story');
      if (layout) {
        let col = story && story.parentElement && story.parentElement.classList.contains('menu-col') ? story.parentElement : null;
        if (!col && story) {
          col = document.createElement('div');
          col.className = 'menu-col';
          story.parentNode.insertBefore(col, story);
          col.appendChild(story);
        }
        const btn = document.createElement('button');
        btn.id = 'menu-coop';
        btn.className = 'story-poster-panel co-poster-panel';
        btn.innerHTML = `
          <div class="story-poster-frame"><img src="${esc(COVER)}" alt="Cooperativo online"></div>
          <span class="story-poster-title">🤝 Cooperativo online</span>
          <span class="story-poster-subtitle">2 jugadores contra un jefe</span>
          <span class="story-poster-cta">▶ Jugar</span>`;
        const im = btn.querySelector('img');
        im.addEventListener('error', () => {
          const fb = document.createElement('div');
          fb.style.cssText = 'font-size:64px;display:flex;align-items:center;justify-content:center;height:100%';
          fb.textContent = '🤝';
          im.replaceWith(fb);
        }, { once: true });
        (col || layout).appendChild(btn);
        btn.addEventListener('click', openLobby);
      }
    }

    if (!byId('co-leave-btn')) {
      const restart = byId('restartBtn');
      if (restart && restart.parentNode) {
        const b = document.createElement('button');
        b.id = 'co-leave-btn';
        b.className = 'class-btn';
        b.style.cssText = 'display:none;background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4)';
        b.textContent = '🚪 Abandonar';
        b.addEventListener('click', () => {
          if (!CO.active || state.phase !== 'battle') return;
          if (!confirm('¿Abandonar el combate? Tu compañero también perderá la partida.')) return;
          leaveMatch();
        });
        restart.parentNode.insertBefore(b, restart);
      }
    }
  }

  function openLobby() {
    byId('main-menu').style.display = 'none';
    byId('co-screen').style.display = 'flex';
    byId('co-nick').value = cleanNick(myProfile().name) || (function () { try { return cleanNick(localStorage.getItem(NICK_KEY)); } catch (e) { return ''; } })() || CO.nick.me || '';
    renderBossList();
    showChoose();
    setStatus('');
  }

  function closeLobby() {
    resetNetwork();
    byId('co-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
  }

  function startSolo() {
    readNick();
    CO.local = true; CO.isHost = true; CO.seat = 0;
    CO.seed = randomSeed();
    beginSetup();
  }

  function init() {
    injectStyles();
    injectMarkup();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Para depurar desde la consola del navegador.
  W.COOP = { CO, BOSSES, open: openLobby, solo: startSolo, hashState, _t: { beginSetup, createRoom, joinRoom, grantRewards } };
})();
