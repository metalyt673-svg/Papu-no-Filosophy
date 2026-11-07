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

   RAREZAS (de menos a más valor): common, rare, epic, legend (Legendaria) y event (Evento, la más valiosa y difícil de conseguir).
   COFRES EN LA TIENDA: CHEST_PRICE (cofre normal, va al Inventario) y SKIN_CHESTS (cofres y paquetes de skins garantizadas: precio, nº de skins y rarezas; dentro de lo permitido la rareza sale de RARITY_WEIGHT).
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
    /* ——— Noelle Silva ——— */
    { id: 'noelle5', charId: 'noelle_silva', name: 'Noelle · Diablita', img: 'personajes/noelle5.jpg', rarity: 'common' },
    { id: 'noelle1', charId: 'noelle_silva', name: 'Noelle · Diablita2', img: 'personajes/noelle1.jpg', rarity: 'rare' },
    { id: 'noelle2', charId: 'noelle_silva', name: 'Noelle · Swimsuit', img: 'personajes/noelle2.jpg', rarity: 'epic' },
    { id: 'noelle3', charId: 'noelle_silva', name: 'Noelle · Lazito_verde', img: 'personajes/noelle3.jpg', rarity: 'epic' },
    { id: 'noelle_hw', charId: 'noelle_silva', name: 'Noelle · Halloween', img: 'personajes/noelle4.jpg', rarity: 'event' },
    { id: 'noelle6', charId: 'noelle_silva', name: 'Noelle · Sirena', img: 'personajes/noelle6.jpg', rarity: 'legend' },

    /* ——— Albedo ——— */
    { id: 'albedo1', charId: 'albedo', name: 'Albedo · Atuendo default', img: 'personajes/albedo1.jpg', rarity: 'common' },
    { id: 'albedo2', charId: 'albedo', name: 'Albedo · Carruaje elegante', img: 'personajes/albedo2.jpg', rarity: 'rare' },
    { id: 'albedo3', charId: 'albedo', name: 'Albedo · Armadura', img: 'personajes/albedo3.jpg', rarity: 'epic' },
    { id: 'albedo_chm', charId: 'albedo', name: 'Albedo · Navidad', img: 'personajes/albedo4.jpg', rarity: 'event' },
    { id: 'albedo5', charId: 'albedo', name: 'Albedo · Succubus', img: 'personajes/albedo5.jpg', rarity: 'legend' },
    { id: 'albedo6', charId: 'albedo', name: 'Albedo · Yukata', img: 'personajes/albedo6.jpg', rarity: 'epic' },
    { id: 'albedo7', charId: 'albedo', name: 'Albedo · Pink Tank', img: 'personajes/albedo7.jpg', rarity: 'rare' },
    { id: 'albedo8', charId: 'albedo', name: 'Albedo · Gothic Gown', img: 'personajes/albedo8.jpg', rarity: 'legend' },

    /* ——— Secre ——— */
    { id: 'secre1', charId: 'secre', name: 'Secre · Atuendo default', img: 'personajes/secre1.jpg', rarity: 'common' },
    { id: 'secre2', charId: 'secre', name: 'Secre · Uniforme escolar', img: 'personajes/secre2.jpg', rarity: 'rare' },
    { id: 'secre3', charId: 'secre', name: 'Secre · kimono', img: 'personajes/secre3.jpg', rarity: 'epic' },
    { id: 'secre_maid', charId: 'secre', name: 'Secre · Maid', img: 'personajes/secre4.jpg', rarity: 'event' },
    { id: 'secre5', charId: 'secre', name: 'Secre · Magia sellada', img: 'personajes/secre5.jpg', rarity: 'legend' },

    /* ——— Belerick ——— */
    { id: 'belerick1', charId: 'belerick', name: "Belerick · Tiger's Claw", img: 'personajes/belerick1.jpg', rarity: 'common' },
    { id: 'belerick2', charId: 'belerick', name: 'Belerick · Torch Guardian', img: 'personajes/belerick2.jpg', rarity: 'rare' },
    { id: 'belerick3', charId: 'belerick', name: 'Belerick · Arbiter of Stars', img: 'personajes/belerick3.jpg', rarity: 'epic' },
    { id: 'belerick_star', charId: 'belerick', name: 'Belerick · Smouldering Fortress', img: 'personajes/belerick4.jpg', rarity: 'event' },
    { id: 'belerick5', charId: 'belerick', name: 'Belerick · The Deep One', img: 'personajes/belerick5.jpg', rarity: 'legend' },

    /* ——— Punpun ——— */
    { id: 'punpun1', charId: 'punpun', name: 'Punpun · Chibi', img: 'personajes/punpun1.jpeg', rarity: 'common' },
    { id: 'punpun2', charId: 'punpun', name: 'Punpun · Teen', img: 'personajes/punpun2.jpeg', rarity: 'rare' },
    { id: 'punpun3', charId: 'punpun', name: 'Punpun · Hair', img: 'personajes/punpun3.jpeg', rarity: 'rare' },
    { id: 'punpun4', charId: 'punpun', name: 'Punpun · Real', img: 'personajes/punpun4.jpeg', rarity: 'epic' },
    { id: 'punpun5', charId: 'punpun', name: 'Punpun · Triangle', img: 'personajes/punpun5.jpeg', rarity: 'epic' },
    { id: 'punpun6', charId: 'punpun', name: 'Punpun · ??', img: 'personajes/punpun6.jpeg', rarity: 'legend' },

    /* ——— Floryn ——— */
    { id: 'floryn1', charId: 'floryn', name: 'Floryn · Springtide', img: 'personajes/floryn1.jpg', rarity: 'common' },
    { id: 'floryn2', charId: 'floryn', name: 'Floryn · Paw Power', img: 'personajes/floryn2.jpg', rarity: 'rare' },
    { id: 'floryn3', charId: 'floryn', name: 'Floryn · Yatai Waitress', img: 'personajes/floryn3.jpg', rarity: 'epic' },
    { id: 'floryn4', charId: 'floryn', name: 'Floryn · Herald of Autumn', img: 'personajes/floryn4.jpg', rarity: 'epic' },
    { id: 'floryn_hk', charId: 'floryn', name: 'Floryn · Fluffly Dream', img: 'personajes/floryn5.jpg', rarity: 'event' },
    { id: 'floryn6', charId: 'floryn', name: 'Floryn · Melody of Light', img: 'personajes/floryn6.jpg', rarity: 'legend' },

    /* ——— Selena ——— */
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

    /* ——— Zora ——— */
    { id: 'zora1', charId: 'zora', name: 'Zora · Atuendo default', img: 'personajes/zora1.jpg', rarity: 'common' },
    { id: 'zora2', charId: 'zora', name: 'Zora · Agente Secreto', img: 'personajes/zora3.jpg', rarity: 'rare' },
    { id: 'zora3', charId: 'zora', name: 'Zora · Atuendo default2', img: 'personajes/zora2.jpg', rarity: 'epic' },

    /* ——— Vermeil ——— */
    { id: 'vermeil1', charId: 'vermeil', name: 'Vermeil · Uniforme Escolar', img: 'personajes/vermeil3.jpg', rarity: 'common' },
    { id: 'vermeil2', charId: 'vermeil', name: 'Vermeil · Pasión de Maná', img: 'personajes/vermeil8.jpg', rarity: 'rare' },
    { id: 'vermeil3', charId: 'vermeil', name: 'Vermeil · Kimono Borracha', img: 'personajes/vermeil2.jpg', rarity: 'epic' },
    { id: 'vermeil4', charId: 'vermeil', name: 'Vermeil · Succubus aburrida', img: 'personajes/vermeil1.jpg', rarity: 'epic' },
    { id: 'vermeil5', charId: 'vermeil', name: 'Vermeil · Succubus Maliciosa', img: 'personajes/vermeil4.jpg', rarity: 'legend' },
    { id: 'vermeil6', charId: 'vermeil', name: 'Vermeil · Vaquera', img: 'personajes/vermeil5.jpg', rarity: 'legend' },
    { id: 'vermeil_nurse', charId: 'vermeil', name: 'Vermeil · Enfermera', img: 'personajes/vermeil7.jpg', rarity: 'event' },
    { id: 'vermeil_gothic', charId: 'vermeil', name: 'Vermeil · Gótica', img: 'personajes/vermeil6.jpg', rarity: 'event' },

    /* ——— Dyrroth ——— */
    { id: 'dyrroth1', charId: 'dyrroth', name: 'Dyrroth · Prince of the Abyss', img: 'personajes/dyrroth1.jpg', rarity: 'common' },
    { id: 'dyrroth2', charId: 'dyrroth', name: 'Dyrroth · Scalebore', img: 'personajes/dyrroth2.jpg', rarity: 'rare' },
    { id: 'dyrroth3', charId: 'dyrroth', name: 'Dyrroth · Orochi Chris', img: 'personajes/dyrroth3.jpg', rarity: 'legend' },
    { id: 'dyrroth_star', charId: 'dyrroth', name: 'Dyrroth · Ruins Scavenger', img: 'personajes/dyrroth4.jpg', rarity: 'event' },
    { id: 'dyrroth5', charId: 'dyrroth', name: 'Dyrroth · V.E.N.O.M. Cobra', img: 'personajes/dyrroth5.jpg', rarity: 'epic' },
    { id: 'dyrroth6', charId: 'dyrroth', name: 'Dyrroth · Gon', img: 'personajes/dyrroth6.jpg', rarity: 'legend' },

    /* ——— Clarence ——— */
    { id: 'clarence1', charId: 'clarence', name: 'Clarence · Diva', img: 'personajes/clarence1.jpg', rarity: 'rare' },
    { id: 'clarence2', charId: 'clarence', name: 'Clarence · Hawai', img: 'personajes/clarence2.jpg', rarity: 'common' },
    { id: 'clarence3', charId: 'clarence', name: 'Clarence · Dino', img: 'personajes/clarence3.jpg', rarity: 'rare' },
    { id: 'clarence4', charId: 'clarence', name: 'Clarence · Rico', img: 'personajes/clarence4.gif', rarity: 'common' },
    { id: 'clarence5', charId: 'clarence', name: 'Clarence · Chuches', img: 'personajes/clarence5.jpg', rarity: 'epic' },
    { id: 'clarence9', charId: 'clarence', name: 'Clarence · Balance', img: 'personajes/balance.jpg', rarity: 'epic' },
    { id: 'clarence6', charId: 'clarence', name: 'Clarence · Pirata', img: 'personajes/clarence6.jpg', rarity: 'rare' },
    { id: 'clarence7', charId: 'clarence', name: 'Clarence · Maduro', img: 'personajes/clarence7.jpg', rarity: 'legend' },
    { id: 'clarence8', charId: 'clarence', name: 'Clarence · Vikingo', img: 'personajes/clarence8.jpg', rarity: 'legend' },

    /* ——— Miyabi (Hoshimi) ——— */
    { id: 'hoshimi1', charId: 'hoshimi', name: 'Miyabi · Gala', img: 'personajes/hoshimi1.jpg', rarity: 'legend' },
    { id: 'hoshimi2', charId: 'hoshimi', name: 'Miyabi · Espadachina', img: 'personajes/hoshimi2.jpg', rarity: 'rare' },
    { id: 'hoshimi3', charId: 'hoshimi', name: 'Miyabi · Espadachina ardiente', img: 'personajes/hoshimi3.jpg', rarity: 'legend' },
    { id: 'hoshimi4', charId: 'hoshimi', name: 'Miyabi · Melon Eater', img: 'personajes/hoshimi4.jpg', rarity: 'epic' },
    { id: 'hoshimi_summer', charId: 'hoshimi', name: 'Miyabi · Lifeguard', img: 'personajes/hoshimi5.jpg', rarity: 'event' },
    { id: 'hoshimi6', charId: 'hoshimi', name: 'Miyabi · Miko', img: 'personajes/hoshimi6.jpg', rarity: 'legend' },
    { id: 'hoshimi7', charId: 'hoshimi', name: 'Miyabi · Violinista', img: 'personajes/hoshimi7.jpg', rarity: 'common' },
    { id: 'hoshimi_hw', charId: 'hoshimi', name: 'Miyabi · Dracula', img: 'personajes/hoshimi8.jpg', rarity: 'event' },
    { id: 'hoshimi_summer1', charId: 'hoshimi', name: 'Miyabi · Swimsuit', img: 'personajes/hoshimi9.jpg', rarity: 'event' },
    { id: 'hoshimi10', charId: 'hoshimi', name: 'Miyabi · the Ice Espadachina', img: 'personajes/hoshimi10.jpg', rarity: 'legend' },

    /* ——— Cici ——— */
    { id: 'cici1', charId: 'cici', name: 'Cici · Buoyant Performer', img: 'personajes/cici6.png', rarity: 'common' },
    { id: 'cici2', charId: 'cici', name: 'Cici · Whimiscal Carnival', img: 'personajes/cici1.png', rarity: 'rare' },
    { id: 'cici_star', charId: 'cici', name: 'Cici · Circus Reverie', img: 'personajes/cici2.png', rarity: 'event' },
    { id: 'cici_star1', charId: 'cici', name: 'Cici · Circus Fantasy', img: 'personajes/cici3.png', rarity: 'event' },
    { id: 'cici_star2', charId: 'cici', name: 'Cici · Circus Glamour', img: 'personajes/cici4.png', rarity: 'event' },
    { id: 'cici3', charId: 'cici', name: 'Cici · P. ACE', img: 'personajes/cici5.png', rarity: 'epic' },

    /* ——— Mimosa ——— */
    { id: 'mimosa1', charId: 'mimosa', name: 'Mimosa · Gala', img: 'personajes/mimosa4.jpg', rarity: 'common' },
    { id: 'mimosa2', charId: 'mimosa', name: 'Mimosa · Amanecer Dorado', img: 'personajes/mimosa5.jpg', rarity: 'rare' },
    { id: 'mimosa3', charId: 'mimosa', name: 'Mimosa · Bunny', img: 'personajes/mimosa3.jpg', rarity: 'epic' },
    { id: 'mimosa4', charId: 'mimosa', name: 'Mimosa · Calle', img: 'personajes/mimosa1.jpg', rarity: 'epic' },
    { id: 'mimosa5', charId: 'mimosa', name: 'Mimosa · Clover Academy', img: 'personajes/mimosa2.jpg', rarity: 'legend' },
    { id: 'mimosa_chm', charId: 'mimosa', name: 'Mimosa · Navidad', img: 'personajes/mimosa6.jpg', rarity: 'event' },
    { id: 'mimosa_sport', charId: 'mimosa', name: 'Mimosa · Animadora', img: 'personajes/mimosa7.jpg', rarity: 'event' },
    { id: 'mimosa_casino', charId: 'mimosa', name: 'Mimosa · Casino', img: 'personajes/mimosa8.jpg', rarity: 'event' },

    /* ——— Gojo Satoru ——— */
    { id: 'gojo1', charId: 'gojo_satoru', name: 'Gojo · Hollow Red', img: 'personajes/gojo1.jpg', rarity: 'epic' },
    { id: 'gojo2', charId: 'gojo_satoru', name: 'Gojo · Last Battle', img: 'personajes/gojo5.jpg', rarity: 'common' },
    { id: 'gojo3', charId: 'gojo_satoru', name: 'Gojo · Mentor', img: 'personajes/gojo2.jpg', rarity: 'rare' },
    { id: 'gojo_chm', charId: 'gojo_satoru', name: 'Gojo · Navidad', img: 'personajes/gojo3.jpg', rarity: 'event' },
    { id: 'gojo_hk', charId: 'gojo_satoru', name: 'Gojo · Hello Kitty', img: 'personajes/gojo4.jpg', rarity: 'event' },
    { id: 'gojo4', charId: 'gojo_satoru', name: 'Gojo · Hollow Purple', img: 'personajes/gojo6.jpg', rarity: 'legend' },

    /* ——— Johnson ——— */
    { id: 'johnson1', charId: 'johnson_ml', name: 'Johnson · Wild Engine', img: 'personajes/johnson1.jpg', rarity: 'common' },
    { id: 'johnson2', charId: 'johnson_ml', name: 'Johnson · Fire Chief', img: 'personajes/johnson2.jpg', rarity: 'rare' },
    { id: 'johnson3', charId: 'johnson_ml', name: 'Johnson · S.A.B.E.R. Automata', img: 'personajes/johnson3.jpg', rarity: 'epic' },
    { id: 'johnson4', charId: 'johnson_ml', name: 'Johnson · Jeepney Racer', img: 'personajes/johnson4.jpg', rarity: 'rare' },
    { id: 'johnson5', charId: 'johnson_ml', name: 'Johnson · Wreck King', img: 'personajes/johnson5.jpg', rarity: 'legend' },
    { id: 'johnson6', charId: 'johnson_ml', name: 'Johnson · Death Ride', img: 'personajes/johnson6.jpg', rarity: 'epic' },
    { id: 'johnson_transformer', charId: 'johnson_ml', name: 'Johnson · Optimus Prime', img: 'personajes/johnson7.jpg', rarity: 'event' },
    { id: 'johnson7', charId: 'johnson_ml', name: 'Johnson · Starblazer', img: 'personajes/johnson8.jpg', rarity: 'epic' },
    { id: 'johnson8', charId: 'johnson_ml', name: 'Johnson · Sovereign of Realms', img: 'personajes/johnson9.jpg', rarity: 'legend' },

    /* ——— Gloo ——— */
    { id: 'gloo1', charId: 'gloo_ml', name: 'Gloo · Swamp Spirits', img: 'personajes/gloo1.jpg', rarity: 'common' },
    { id: 'gloo2', charId: 'gloo_ml', name: 'Gloo · Verdant Enchanter', img: 'personajes/gloo2.jpg', rarity: 'rare' },
    { id: 'gloo3', charId: 'gloo_ml', name: 'Gloo · Jellyman', img: 'personajes/gloo3.jpg', rarity: 'epic' },
    { id: 'gloo_patricio', charId: 'gloo_ml', name: 'Gloo · Patrick', img: 'personajes/gloo4.jpg', rarity: 'event' },

    /* ——— Estes ——— */
    { id: 'estes1', charId: 'estes', name: 'Estes · Holy Priest', img: 'personajes/estes1.jpg', rarity: 'rare' },
    { id: 'estes2', charId: 'estes', name: 'Estes · Galaxy Dominator', img: 'personajes/estes2.jpg', rarity: 'legend' },
    { id: 'estes3', charId: 'estes', name: 'Estes · Crow Bishop', img: 'personajes/estes3.jpg', rarity: 'epic' },
    { id: 'estes4', charId: 'estes', name: 'Estes · Rattan Dragon', img: 'personajes/estes4.jpg', rarity: 'epic' },
    { id: 'estes5', charId: 'estes', name: 'Estes · Arcane Magistrate', img: 'personajes/estes5.jpg', rarity: 'epic' },
    { id: 'estes6', charId: 'estes', name: 'Estes · SPARKLE', img: 'personajes/estes6.jpg', rarity: 'rare' },

    /* ——— Grock ——— */
    { id: 'grock1', charId: 'grock', name: 'Grock · Fortress Titan', img: 'personajes/grock1.jpg', rarity: 'common' },
    { id: 'grock2', charId: 'grock', name: 'Grock · Grave Guardian', img: 'personajes/grock2.jpg', rarity: 'rare' },
    { id: 'grock3', charId: 'grock', name: 'Grock · Castle Guard', img: 'personajes/grock3.jpg', rarity: 'rare' },
    { id: 'grock4', charId: 'grock', name: 'Grock · V.E.N.O.M. Monitor Lizard', img: 'personajes/grock4.jpg', rarity: 'epic' },
    { id: 'grock_star', charId: 'grock', name: 'Grock · Iceland Golem', img: 'personajes/grock5.jpg', rarity: 'event' },
    { id: 'grock5', charId: 'grock', name: 'Grock · Codename: Rhino', img: 'personajes/grock6.jpg', rarity: 'epic' },
    { id: 'grock6', charId: 'grock', name: 'Grock · Ancient Golem', img: 'personajes/grock7.jpg', rarity: 'rare' },
    { id: 'grock7', charId: 'grock', name: 'Grock · Wasteland Psycho', img: 'personajes/grock8.jpg', rarity: 'epic' },

    /* ——— Guinevere ——— */
    { id: 'guinevere1', charId: 'guinevere', name: 'Guinevere · Fleur de Bleau', img: 'personajes/guinevere1.jpg', rarity: 'common' },
    { id: 'guinevere_kof', charId: 'guinevere', name: 'Guinevere · Athena Asamiya', img: 'personajes/guinevere2.jpg', rarity: 'event' },
    { id: 'guinevere3', charId: 'guinevere', name: 'Guinevere · Lotus', img: 'personajes/guinevere3.jpg', rarity: 'rare' },
    { id: 'guinevere4', charId: 'guinevere', name: 'Guinevere · Amethyst Dance', img: 'personajes/guinevere4.jpg', rarity: 'epic' },
    { id: 'guinevere5', charId: 'guinevere', name: 'Guinevere · Lady Crane', img: 'personajes/guinevere5.jpg', rarity: 'epic' },
    { id: 'guinevere6', charId: 'guinevere', name: 'Guinevere · Sakura Wishes', img: 'personajes/guinevere6.jpg', rarity: 'epic' },
    { id: 'guinevere_summer', charId: 'guinevere', name: 'Guinevere · Summer Breeze', img: 'personajes/guinevere7.jpg', rarity: 'event' },
    { id: 'guinevere8', charId: 'guinevere', name: 'Guinevere · Psion of Tomorrow', img: 'personajes/guinevere8.jpg', rarity: 'legend' },
    { id: 'guinevere9', charId: 'guinevere', name: 'Guinevere · Elegant Butterfly', img: 'personajes/guinevere9.jpg', rarity: 'rare' },
    { id: 'guinevere10', charId: 'guinevere', name: 'Guinevere · Daybreak Halo', img: 'personajes/guinevere10.jpg', rarity: 'legend' },

    /* ——— Thamuz ——— */
    { id: 'thamuz1', charId: 'thamuz', name: 'Thamuz · Lord Lava', img: 'personajes/thamuz1.jpg', rarity: 'common' },
    { id: 'thamuz2', charId: 'thamuz', name: 'Thamuz · Lord of Wraith', img: 'personajes/thamuz2.jpg', rarity: 'rare' },
    { id: 'thamuz3', charId: 'thamuz', name: 'Thamuz · Liquid Fire', img: 'personajes/thamuz3.jpg', rarity: 'epic' },
    { id: 'thamuz4', charId: 'thamuz', name: 'Thamuz · Abyssal Reaper', img: 'personajes/thamuz4.jpg', rarity: 'epic' },
    { id: 'thamuz_kai', charId: 'thamuz', name: 'Thamuz · General Kai', img: 'personajes/thamuz5.jpg', rarity: 'event' },
    { id: 'thamuz_star', charId: 'thamuz', name: 'Thamuz · Sanctified Flame', img: 'personajes/thamuz6.jpg', rarity: 'legend' },
    { id: 'thamuz7', charId: 'thamuz', name: 'Thamuz · The Annihilator', img: 'personajes/thamuz7.jpg', rarity: 'legend' },

    /* ——— Helcurt ——— */
    { id: 'helcurt1', charId: 'helcurt', name: 'Helcurt · Shadowbringer', img: 'personajes/helcurt1.jpg', rarity: 'common' },
    { id: 'helcurt2', charId: 'helcurt', name: 'Helcurt · Exoracial Executer', img: 'personajes/helcurt2.jpg', rarity: 'rare' },
    { id: 'helcurt3', charId: 'helcurt', name: 'Helcurt · Ice Scythe', img: 'personajes/helcurt3.jpg', rarity: 'epic' },
    { id: 'helcurt4', charId: 'helcurt', name: 'Helcurt · Evolved Predator', img: 'personajes/helcurt4.jpg', rarity: 'epic' },
    { id: 'helcurt6', charId: 'helcurt', name: 'Helcurt · Scorpio', img: 'personajes/helcurt5.jpg', rarity: 'epic' },
    { id: 'helcurt_star', charId: 'helcurt', name: 'Helcurt · Dream Prowler', img: 'personajes/helcurt6.jpg', rarity: 'event' },
    { id: 'helcurt7', charId: 'helcurt', name: 'Helcurt · Kaiju of the Deep', img: 'personajes/helcurt7.jpg', rarity: 'legend' },

    /* ——— Rick Sanchez ——— */
    { id: 'ricksanchez1', charId: 'ricksanchez', name: 'Rick Sanchez · High', img: 'personajes/ricksanchez1.jpg', rarity: 'common' },
    { id: 'ricksanchez2', charId: 'ricksanchez', name: 'Rick Sanchez · Suit', img: 'personajes/ricksanchez2.jpg', rarity: 'rare' },
    { id: 'ricksanchez3', charId: 'ricksanchez', name: 'Rick Sanchez · Toxic Rick', img: 'personajes/ricksanchez3.jpg', rarity: 'rare' },
    { id: 'ricksanchez4', charId: 'ricksanchez', name: 'Rick Sanchez · Doofus Rick', img: 'personajes/ricksanchez4.jpg', rarity: 'epic' },
    { id: 'ricksanchez5', charId: 'ricksanchez', name: 'Rick Sanchez · Rick Prime', img: 'personajes/ricksanchez5.jpg', rarity: 'legend' },
    { id: 'ricksanchez6', charId: 'ricksanchez', name: 'Rick Sanchez · Gucci Rick', img: 'personajes/ricksanchez6.jpg', rarity: 'legend' },
    { id: 'ricksanchez7', charId: 'ricksanchez', name: 'Rick Sanchez · Evil Rick', img: 'personajes/ricksanchez7.jpg', rarity: 'epic' },
    { id: 'ricksanchez8', charId: 'ricksanchez', name: 'Rick Sanchez · Pickle Rick', img: 'personajes/ricksanchez8.jpg', rarity: 'legend' },

    /* ——— YV ——— */
    { id: 'yv1', charId: 'yv', name: 'Yung Venuz · Demi God', img: 'personajes/yv1.jpg', rarity: 'rare' },
    { id: 'yv2', charId: 'yv', name: 'Yung Venuz · Sad', img: 'personajes/yv2.jpg', rarity: 'common' },
    { id: 'yv3', charId: 'yv', name: 'Yung Venuz · Tha Gun God', img: 'personajes/yv3.jpg', rarity: 'epic' },

    /* ——— Horror ——— */
    { id: 'horror1', charId: 'horror', name: 'Horror · Portal', img: 'personajes/horror1.jpg', rarity: 'rare' },
    { id: 'horror2', charId: 'horror', name: 'Horror · IDPD', img: 'personajes/horror2.jpg', rarity: 'epic' },

    /* ——— Chicken ——— */
    { id: 'chicken1', charId: 'chicken', name: 'Chicken · Green Eyes', img: 'personajes/chicken1.jpg', rarity: 'rare' },
    { id: 'chicken2', charId: 'chicken', name: 'Chicken · Blind Samurai', img: 'personajes/chicken2.jpg', rarity: 'legend' },

    /* ——— Mayuri ——— */
    { id: 'mayuri1', charId: 'mayuri', name: 'Mayuri · Faraón Arrancar', img: 'personajes/mayuri1.jpg', rarity: 'legend' },
    { id: 'mayuri2', charId: 'mayuri', name: 'Mayuri · Desarrollo de Investigación', img: 'personajes/mayuri2.jpg', rarity: 'epic' },
    { id: 'mayuri3', charId: 'mayuri', name: 'Mayuri · Sol Brillante', img: 'personajes/mayuri3.jpg', rarity: 'rare' },
    { id: 'mayuri4', charId: 'mayuri', name: 'Mayuri · Departamento de Ciencias y Desarrollo', img: 'personajes/mayuri4.jpg', rarity: 'epic' },
    { id: 'mayuri5', charId: 'mayuri', name: 'Mayuri · Hueco mundo', img: 'personajes/mayuri5.jpg', rarity: 'common' },

    /* ——— Isaac ——— */
    { id: 'isaac1', charId: 'isaac', name: 'Isaac · Cain', img: 'personajes/isaac1.jpg', rarity: 'common' },
    { id: 'isaac2', charId: 'isaac', name: 'Isaac · Judas', img: 'personajes/isaac2.jpg', rarity: 'common' },
    { id: 'isaac3', charId: 'isaac', name: 'Isaac · The Lost', img: 'personajes/isaac3.jpg', rarity: 'rare' },
    { id: 'isaac4', charId: 'isaac', name: 'Isaac · Blue Baby', img: 'personajes/isaac4.jpg', rarity: 'rare' },
    { id: 'isaac5', charId: 'isaac', name: 'Isaac · Tainted Isaac', img: 'personajes/isaac5.jpg', rarity: 'epic' },
    { id: 'isaac6', charId: 'isaac', name: 'Isaac · Tainted Judas', img: 'personajes/isaac6.jpg', rarity: 'epic' },
    { id: 'isaac7', charId: 'isaac', name: 'Isaac · Tainted Samson', img: 'personajes/isaac7.jpg', rarity: 'legend' },
    { id: 'isaac8', charId: 'isaac', name: 'Isaac · Tainted Keeper', img: 'personajes/isaac8.jpg', rarity: 'legend' },
    { id: 'isaac9', charId: 'isaac', name: 'Isaac · Festive', img: 'personajes/isaac9.jpg', rarity: 'event' },

    /* ——— Sans ——— */
    { id: 'sans1', charId: 'sans', name: 'Sans · Trumpet', img: 'personajes/sans1.jpg', rarity: 'common' },
    { id: 'sans2', charId: 'sans', name: 'Sans · Ketchup', img: 'personajes/sans2.jpg', rarity: 'common' },
    { id: 'sans3', charId: 'sans', name: 'Sans · Scientist', img: 'personajes/sans3.jpg', rarity: 'rare' },
    { id: 'sans4', charId: 'sans', name: 'Sans · Underswap', img: 'personajes/sans4.jpg', rarity: 'rare' },
    { id: 'sans5', charId: 'sans', name: 'Sans · Underfell', img: 'personajes/sans5.jpg', rarity: 'epic' },
    { id: 'sans6', charId: 'sans', name: 'Sans · Errortale', img: 'personajes/sans6.jpg', rarity: 'epic' },
    { id: 'sans7', charId: 'sans', name: 'Sans · Inktale', img: 'personajes/sans7.jpg', rarity: 'legend' },
    { id: 'sans8', charId: 'sans', name: 'Sans · Saness', img: 'personajes/sans8.jpg', rarity: 'legend' },
    { id: 'sans9', charId: 'sans', name: 'Sans · Christmas', img: 'personajes/sans9.jpg', rarity: 'event' },
    { id: 'sans10', charId: 'sans', name: 'Sans · Halloween', img: 'personajes/sans10.jpg', rarity: 'event' },
    { id: 'sans11', charId: 'sans', name: 'Sans · Mortadela', img: 'personajes/sans11.jpg', rarity: 'legend' },

    /* ——— Yoruichi ——— */
    { id: 'yoruichi2', charId: 'yoruichi', name: 'Yoruichi · Atuendo default', img: 'personajes/yoruichi3.jpg', rarity: 'common' },
    { id: 'yoruichi1', charId: 'yoruichi', name: 'Yoruichi · Repartidora', img: 'personajes/yoruichi2.jpg', rarity: 'common' },
    { id: 'yoruichi9', charId: 'yoruichi', name: 'Yoruichi · Maid', img: 'personajes/yoruichi10.jpg', rarity: 'rare' },
    { id: 'yoruichi3', charId: 'yoruichi', name: 'Yoruichi · Baloncesto', img: 'personajes/yoruichi4.jpg', rarity: 'rare' },
    { id: 'yoruichi10', charId: 'yoruichi', name: 'Yoruichi · Streetwear', img: 'personajes/yoruichi9.jpg', rarity: 'epic' },
    { id: 'yoruichi4', charId: 'yoruichi', name: 'Yoruichi · Noche de piscina', img: 'personajes/yoruichi5.jpg', rarity: 'epic' },
    { id: 'yoruichi5', charId: 'yoruichi', name: 'Yoruichi · Verano en la playa', img: 'personajes/yoruichi6.jpg', rarity: 'epic' },
    { id: 'yoruichi_hw', charId: 'yoruichi', name: 'Yoruichi · Halloween', img: 'personajes/yoruichi8.jpg', rarity: 'event' },
    { id: 'yoruichi6', charId: 'yoruichi', name: 'Yoruichi · Shunkō Felino', img: 'personajes/yoruichi7.jpg', rarity: 'legend' },
    { id: 'yoruichi8', charId: 'yoruichi', name: 'Yoruichi · Gótica', img: 'personajes/yoruichi1.jpg', rarity: 'legend' },

    /* ——— CZ2128 ——— */
    { id: 'cz1', charId: 'cz2128', name: 'CZ2128 · Bufanda de camuflaje', img: 'personajes/cz2.jpg', rarity: 'common' },
    { id: 'cz2', charId: 'cz2128', name: 'CZ2128 · Descanso en el café', img: 'personajes/cz4.jpg', rarity: 'rare' },
    { id: 'cz3', charId: 'cz2128', name: 'CZ2128 · Doncella de combate', img: 'personajes/cz5.jpg', rarity: 'epic' },
    { id: 'cz_summer', charId: 'cz2128', name: 'CZ2128 · Piscina de verano', img: 'personajes/cz3.jpg', rarity: 'event' },
    { id: 'cz5', charId: 'cz2128', name: 'CZ2128 · Yukata del festival', img: 'personajes/cz1.jpg', rarity: 'legend' },

    /* ——— Nobara ——— */
    { id: 'nobara1', charId: 'nobara', name: 'Nobara · Merienda', img: 'personajes/nobara1.jpg', rarity: 'common' },
    { id: 'nobara3', charId: 'nobara', name: 'Nobara · Hechicera Maliciosa', img: 'personajes/nobara3.jpg', rarity: 'epic' },
    { id: 'nobara8', charId: 'nobara', name: 'Nobara · Jugadora de Golf', img: 'personajes/nobara8.jpg', rarity: 'rare' },
    { id: 'nobara_casino', charId: 'nobara', name: 'Nobara · Casino', img: 'personajes/nobara9.jpg', rarity: 'event' },
    { id: 'nobara4', charId: 'nobara', name: 'Nobara · Sonrisa de combate', img: 'personajes/nobara4.jpg', rarity: 'common' },
    { id: 'nobara2', charId: 'nobara', name: 'Nobara · Clavos resonantes', img: 'personajes/nobara2.jpg', rarity: 'rare' },
    { id: 'nobara5', charId: 'nobara', name: 'Nobara · Parche carmesí', img: 'personajes/nobara5.jpg', rarity: 'epic' },
    { id: 'nobara6', charId: 'nobara', name: 'Nobara · Luz de clavos', img: 'personajes/nobara6.jpg', rarity: 'epic' },
    { id: 'nobara7', charId: 'nobara', name: 'Nobara · Resonancia roja', img: 'personajes/nobara7.jpg', rarity: 'legend' },
    { id: 'nobara_maid', charId: 'nobara', name: 'Nobara · Maid', img: 'personajes/nobara10.jpg', rarity: 'event' },

    /* ——— Nakiri Ayame ——— */
    { id: 'nakiri7', charId: 'nakiri_ayame', name: 'Nakiri · Gafas', img: 'personajes/nakiri7.jpg', rarity: 'common' },
    { id: 'nakiri8', charId: 'nakiri_ayame', name: 'Nakiri · Paraguas rojo', img: 'personajes/nakiri8.jpg', rarity: 'common' },
    { id: 'nakiri1', charId: 'nakiri_ayame', name: 'Nakiri · Tímida', img: 'personajes/nakiri1.jpg', rarity: 'rare' },
    { id: 'nakiri3', charId: 'nakiri_ayame', name: 'Nakiri · Danza de cerezos', img: 'personajes/nakiri3.jpg', rarity: 'rare' },
    { id: 'nakiri11', charId: 'nakiri_ayame', name: 'Nakiri · Festival de verano', img: 'personajes/nakiri11.jpg', rarity: 'rare' },
    { id: 'nakiri5', charId: 'nakiri_ayame', name: 'Nakiri · Sake bajo la luna', img: 'personajes/nakiri5.jpg', rarity: 'epic' },
    { id: 'nakiri9', charId: 'nakiri_ayame', name: 'Nakiri · Espadachina espiritual', img: 'personajes/nakiri9.jpg', rarity: 'epic' },
    { id: 'nakiri12', charId: 'nakiri_ayame', name: 'Nakiri · Sake en tatami', img: 'personajes/nakiri12.jpg', rarity: 'epic' },
    { id: 'nakiri2', charId: 'nakiri_ayame', name: 'Nakiri · Luna sobre el cerezo', img: 'personajes/nakiri2.jpg', rarity: 'legend' },
    { id: 'nakiri6', charId: 'nakiri_ayame', name: 'Nakiri · Luna de sangre', img: 'personajes/nakiri6.jpg', rarity: 'legend' },
    { id: 'nakiri_autumn', charId: 'nakiri_ayame', name: 'Nakiri · Hojas de otoño', img: 'personajes/nakiri10.jpg', rarity: 'event' },
    { id: 'nakiri_maid', charId: 'nakiri_ayame', name: 'Nakiri · Maid', img: 'personajes/nakiri4.jpg', rarity: 'event' },

    /* ——— Shiori Novella ——— */
    { id: 'shiori5', charId: 'shiori_novella', name: 'Shiori · Casual', img: 'personajes/shiori5.jpg', rarity: 'common' },
    { id: 'shiori3', charId: 'shiori_novella', name: 'Shiori · Idol', img: 'personajes/shiori3.jpg', rarity: 'rare' },
    { id: 'shiori1', charId: 'shiori_novella', name: 'Shiori · Hongo nocturno', img: 'personajes/shiori1.jpg', rarity: 'epic' },
    { id: 'shiori4', charId: 'shiori_novella', name: 'Shiori · Reina gótica', img: 'personajes/shiori4.jpg', rarity: 'legend' },
    { id: 'shiori_hw', charId: 'shiori_novella', name: 'Shiori · Momia', img: 'personajes/shiori2.jpg', rarity: 'event' },
    { id: 'shiori8', charId: 'shiori_novella', name: 'Shiori · Uniforme escolar', img: 'personajes/shiori8.jpg', rarity: 'common' },
    { id: 'shiori6', charId: 'shiori_novella', name: 'Shiori · Jersey y cadenas', img: 'personajes/shiori6.jpg', rarity: 'rare' },
    { id: 'shiori7', charId: 'shiori_novella', name: 'Shiori · Bibliotecaria gótica', img: 'personajes/shiori7.jpg', rarity: 'epic' },
    { id: 'shiori9', charId: 'shiori_novella', name: 'Shiori · Científica', img: 'personajes/shiori9.jpg', rarity: 'legend' },
    { id: 'shiori_summer', charId: 'shiori_novella', name: 'Shiori · Swimsuit', img: 'personajes/shiori10.jpg', rarity: 'event' },
    { id: 'shiori15', charId: 'shiori_novella', name: 'Shiori · Gafas en la boca', img: 'personajes/shiori15.jpg', rarity: 'common' },
    { id: 'shiori13', charId: 'shiori_novella', name: 'Shiori · Día de lluvia', img: 'personajes/shiori13.jpg', rarity: 'rare' },
    { id: 'shiori11', charId: 'shiori_novella', name: 'Shiori · Escritora de la biblioteca', img: 'personajes/shiori11.jpg', rarity: 'epic' },
    { id: 'shiori14', charId: 'shiori_novella', name: 'Shiori · Gatita', img: 'personajes/shiori14.jpg', rarity: 'legend' },
    { id: 'shiori_hood', charId: 'shiori_novella', name: 'Shiori · Caperucita sangrienta', img: 'personajes/shiori12.jpg', rarity: 'event' },
    { id: 'shiori16', charId: 'shiori_novella', name: 'Shiori · Vestido negro', img: 'personajes/shiori16.jpg', rarity: 'common' },
    { id: 'shiori18', charId: 'shiori_novella', name: 'Shiori · Paso de cebra', img: 'personajes/shiori18.jpg', rarity: 'rare' },
    { id: 'shiori20', charId: 'shiori_novella', name: 'Shiori · Selfie en el espejo', img: 'personajes/shiori20.jpg', rarity: 'epic' },
    { id: 'shiori19', charId: 'shiori_novella', name: 'Shiori · Lolita rosa', img: 'personajes/shiori19.jpg', rarity: 'legend' },
    { id: 'shiori_summer1', charId: 'shiori_novella', name: 'Shiori · Playa', img: 'personajes/shiori17.jpg', rarity: 'event' },
    { id: 'shiori21', charId: 'shiori_novella', name: 'Shiori · Energy drink', img: 'personajes/shiori21.jpg', rarity: 'common' },
    { id: 'shiori24', charId: 'shiori_novella', name: 'Shiori · Parada de bus', img: 'personajes/shiori24.jpg', rarity: 'rare' },
    { id: 'shiori25', charId: 'shiori_novella', name: 'Shiori · Pijama nocturno', img: 'personajes/shiori25.jpg', rarity: 'epic' },
    { id: 'shiori22', charId: 'shiori_novella', name: 'Shiori · Espadachina', img: 'personajes/shiori22.jpg', rarity: 'legend' },
    { id: 'shiori_casino', charId: 'shiori_novella', name: 'Shiori · Casino', img: 'personajes/shiori23.jpg', rarity: 'event' },
    { id: 'shiori27', charId: 'shiori_novella', name: 'Shiori · Chaqueta de pelo', img: 'personajes/shiori27.jpg', rarity: 'rare' },
    { id: 'shiori30', charId: 'shiori_novella', name: 'Shiori · Conejita gótica', img: 'personajes/shiori30.jpg', rarity: 'epic' },
    { id: 'shiori28', charId: 'shiori_novella', name: 'Shiori · Tijeras sangrientas', img: 'personajes/shiori28.jpg', rarity: 'legend' },
    { id: 'shiori_summer2', charId: 'shiori_novella', name: 'Shiori · Camisa mojada', img: 'personajes/shiori26.jpg', rarity: 'event' },
    { id: 'shiori_chm', charId: 'shiori_novella', name: 'Shiori · Navidad', img: 'personajes/shiori29.jpg', rarity: 'event' },

    /* ——— Karin (Blue Archive) ——— */
    { id: 'karin1',  charId: 'karin', name: 'Karin · Street Puffer',      img: 'personajes/karin1.jpg',  rarity: 'common' },
    { id: 'karin2',  charId: 'karin', name: 'Karin · Bunny',              img: 'personajes/karin2.jpg',  rarity: 'epic' },
    { id: 'karin3',  charId: 'karin', name: 'Karin · Maid',               img: 'personajes/karin3.jpg',  rarity: 'rare' },
    { id: 'karin4',  charId: 'karin', name: 'Karin · Noche de piscina',   img: 'personajes/karin4.jpg',  rarity: 'epic' },
    { id: 'karin5',  charId: 'karin', name: 'Karin · Camarera',           img: 'personajes/karin5.jpg',  rarity: 'rare' },
    { id: 'karin6',  charId: 'karin', name: 'Karin · Street Fashion',     img: 'personajes/karin6.jpg',  rarity: 'epic' },
    { id: 'karin7',  charId: 'karin', name: 'Karin · Vestido oscuro',     img: 'personajes/karin7.jpg',  rarity: 'common' },
    { id: 'karin8',  charId: 'karin', name: 'Karin · Combat Bunny',       img: 'personajes/karin8.jpg',  rarity: 'legend' },
    { id: 'karin9',  charId: 'karin', name: 'Karin · Surfer',             img: 'personajes/karin9.jpg',  rarity: 'epic' },
    { id: 'karin10', charId: 'karin', name: 'Karin · Maid Heart',         img: 'personajes/karin10.jpg', rarity: 'rare' },
    { id: 'karin_summer', charId: 'karin', name: 'Karin · Volleyball Summer',  img: 'personajes/karin11.jpg', rarity: 'event' },
    { id: 'karin12', charId: 'karin', name: 'Karin · Beach Black',        img: 'personajes/karin12.jpg', rarity: 'legend' },

    /* ——— Ibuki (Blue Archive) ——— */
    { id: 'ibuki1',  charId: 'ibuki', name: 'Ibuki · Samurai',            img: 'personajes/ibuki1.jpg',  rarity: 'epic' },
    { id: 'ibuki2',  charId: 'ibuki', name: 'Ibuki · Miko',               img: 'personajes/ibuki2.jpg',  rarity: 'rare' },
    { id: 'ibuki3',  charId: 'ibuki', name: 'Ibuki · Maid Combat',        img: 'personajes/ibuki3.jpg',  rarity: 'legend' },
    { id: 'ibuki4',  charId: 'ibuki', name: 'Ibuki · Competition Swimsuit', img: 'personajes/ibuki4.jpg', rarity: 'epic' },
    { id: 'ibuki5',  charId: 'ibuki', name: 'Ibuki · Qipao',              img: 'personajes/ibuki5.jpg',  rarity: 'epic' },
    { id: 'ibuki6',  charId: 'ibuki', name: 'Ibuki · Dual Swords',        img: 'personajes/ibuki6.jpg',  rarity: 'legend' },
    { id: 'ibuki7',  charId: 'ibuki', name: 'Ibuki · Elegant Dress',      img: 'personajes/ibuki7.jpg',  rarity: 'legend' },
    { id: 'ibuki_summer',  charId: 'ibuki', name: 'Ibuki · Beach Bikini',       img: 'personajes/ibuki8.jpg',  rarity: 'event' },
    { id: 'ibuki9',  charId: 'ibuki', name: 'Ibuki · Tea Party',          img: 'personajes/ibuki9.jpg',  rarity: 'rare' },
    { id: 'ibuki10', charId: 'ibuki', name: 'Ibuki · Competition Swim',   img: 'personajes/ibuki10.jpg', rarity: 'epic' },

    /* ——— Castorice ——— */
    { id: 'castorice1',  charId: 'castorice', name: 'Castorice · Casual Home',       img: 'personajes/castorice1.jpg',  rarity: 'common' },
    { id: 'castorice2',  charId: 'castorice', name: 'Castorice · Butterfly Bikini',  img: 'personajes/castorice2.jpg',  rarity: 'epic' },
    { id: 'castorice3',  charId: 'castorice', name: 'Castorice · Street Coffee',     img: 'personajes/castorice3.jpg',  rarity: 'rare' },
    { id: 'castorice4',  charId: 'castorice', name: 'Castorice · Mourning',          img: 'personajes/castorice4.jpg',  rarity: 'legend' },
    { id: 'castorice5',  charId: 'castorice', name: 'Castorice · Dark Garden',       img: 'personajes/castorice5.jpg',  rarity: 'legend' },
    { id: 'castorice6',  charId: 'castorice', name: 'Castorice · Butterfly Throne',  img: 'personajes/castorice6.jpg',  rarity: 'epic' },
    { id: 'castorice_hw', charId: 'castorice', name: 'Castorice · Halloween Mummy',  img: 'personajes/castorice7.jpg',  rarity: 'event' },
    { id: 'castorice8',  charId: 'castorice', name: 'Castorice · Competition Swim', img: 'personajes/castorice8.jpg',  rarity: 'epic' },
    { id: 'castorice9',  charId: 'castorice', name: 'Castorice · Bunny Maid',       img: 'personajes/castorice9.jpg',  rarity: 'rare' },
    { id: 'castorice10', charId: 'castorice', name: 'Castorice · Casual Outdoor',   img: 'personajes/castorice10.jpg', rarity: 'common' },
    { id: 'castorice_summer', charId: 'castorice', name: 'Castorice · Beach Popsicle', img: 'personajes/castorice11.jpg', rarity: 'event' },

    /* ——— Onigiriya / Nekomata Okayu ——— */
    { id: 'onigiria1',  charId: 'nekomata_okayu', name: 'Onigiriya · Beach Bikini',       img: 'personajes/onigiria1.jpg',  rarity: 'epic' },
    { id: 'onigiria2',  charId: 'nekomata_okayu', name: 'Onigiriya · Birthday Casual',     img: 'personajes/onigiria2.jpg',  rarity: 'rare' },
    { id: 'onigiria3',  charId: 'nekomata_okayu', name: 'Onigiriya · Street Punk',         img: 'personajes/onigiria3.jpg',  rarity: 'epic' },
    { id: 'onigiria_hw',  charId: 'nekomata_okayu', name: 'Onigiriya · Halloween Devil',     img: 'personajes/onigiria4.jpg',  rarity: 'event' },
    { id: 'onigiria5',  charId: 'nekomata_okayu', name: 'Onigiriya · Onsen',               img: 'personajes/onigiria5.jpg',  rarity: 'legend' },
    { id: 'onigiria6',  charId: 'nekomata_okayu', name: 'Onigiriya · Pool Float',          img: 'personajes/onigiria6.jpg',  rarity: 'epic' },
    { id: 'onigiria7',  charId: 'nekomata_okayu', name: 'Onigiriya · Bunny Suit',          img: 'personajes/onigiria7.jpg',  rarity: 'legend' },
    { id: 'onigiria_hw1',  charId: 'nekomata_okayu', name: 'Onigiriya · Witch Halloween',     img: 'personajes/onigiria8.jpg',  rarity: 'event' },
    { id: 'onigiria9',  charId: 'nekomata_okayu', name: 'Onigiriya · School Uniform',      img: 'personajes/onigiria9.jpg',  rarity: 'rare' },
    { id: 'onigiria_hw2', charId: 'nekomata_okayu', name: 'Onigiriya · Mummy Halloween',     img: 'personajes/onigiria10.jpg', rarity: 'event' },
    { id: 'onigiria11', charId: 'nekomata_okayu', name: 'Onigiriya · Flower Bouquet',      img: 'personajes/onigiria11.jpg', rarity: 'common' },
    { id: 'onigiria12', charId: 'nekomata_okayu', name: 'Onigiriya · Hoodie Cat',          img: 'personajes/onigiria12.jpg', rarity: 'common' },

    /* ——— W ——— */
    { id: 'w1',  charId: 'w', name: 'W · Combat Frame',       img: 'personajes/w1.jpg',  rarity: 'epic' },
    { id: 'w2',  charId: 'w', name: 'W · Gothic Dress',       img: 'personajes/w2.jpg',  rarity: 'legend' },
    { id: 'w3',  charId: 'w', name: 'W · Shrine Curse',       img: 'personajes/w3.jpg',  rarity: 'epic' },
    { id: 'w4',  charId: 'w', name: 'W · Idol Stage',         img: 'personajes/w4.jpg',  rarity: 'rare' },
    { id: 'w_god',  charId: 'w', name: 'W · Nun',                img: 'personajes/w5.jpg',  rarity: 'event' },
    { id: 'w_summer',  charId: 'w', name: 'W · Poolside',           img: 'personajes/w6.jpg',  rarity: 'event' },
    { id: 'w_summer2',  charId: 'w', name: 'W · Water Hose',         img: 'personajes/w7.jpg',  rarity: 'rare' },
    { id: 'w8',  charId: 'w', name: 'W · Casino Bunny',       img: 'personajes/w8.jpg',  rarity: 'legend' },
    { id: 'w9',  charId: 'w', name: 'W · Office Chaos',       img: 'personajes/w9.jpg',  rarity: 'common' },
    { id: 'w_casino', charId: 'w', name: 'W · Bunny Suit',         img: 'personajes/w10.jpg', rarity: 'event' },
    { id: 'w11', charId: 'w', name: 'W · Beach Popsicle',     img: 'personajes/w11.jpg', rarity: 'event' },
    { id: 'w12', charId: 'w', name: 'W · Casual Crop',        img: 'personajes/w12.jpg', rarity: 'common' },
    { id: 'w13', charId: 'w', name: 'W · Cyber Screens',      img: 'personajes/w13.jpg', rarity: 'epic' },
    { id: 'w14', charId: 'w', name: 'W · Red Jacket',         img: 'personajes/w14.jpg', rarity: 'rare' },
    { id: 'w15', charId: 'w', name: 'W · Tactical',           img: 'personajes/w15.jpg', rarity: 'epic' },

    /* ——— Akuma Nihmane ——— */
    { id: 'akuma1',      charId: 'akuma_nihmane', name: 'Akuma · Catgirl',        img: 'personajes/akuma1.jpg',  rarity: 'epic' },
    { id: 'akuma2',      charId: 'akuma_nihmane', name: 'Akuma · Selfie',         img: 'personajes/akuma2.jpg',  rarity: 'rare' },
    { id: 'akuma_chm',   charId: 'akuma_nihmane', name: 'Akuma · Winter Plush',   img: 'personajes/akuma3.jpg',  rarity: 'event' },
    { id: 'akuma4',      charId: 'akuma_nihmane', name: 'Akuma · Beach Cat',      img: 'personajes/akuma4.jpg',  rarity: 'epic' },
    { id: 'akuma5',      charId: 'akuma_nihmane', name: 'Akuma · Festival',       img: 'personajes/akuma5.jpg',  rarity: 'rare' },
    { id: 'akuma6',      charId: 'akuma_nihmane', name: 'Akuma · Street Rock',    img: 'personajes/akuma6.jpg',  rarity: 'common' },
    { id: 'akuma7',      charId: 'akuma_nihmane', name: 'Akuma · School Uniform', img: 'personajes/akuma7.jpg',  rarity: 'common' },
    { id: 'akuma8',      charId: 'akuma_nihmane', name: 'Akuma · Punk Night',     img: 'personajes/akuma8.jpg',  rarity: 'legend' },
    { id: 'akuma_hw',    charId: 'akuma_nihmane', name: 'Akuma · Halloween Mummy',img: 'personajes/akuma9.jpg',  rarity: 'event' },
    { id: 'akuma_summer',charId: 'akuma_nihmane', name: 'Akuma · Beach Bikini',   img: 'personajes/akuma10.jpg', rarity: 'event' },
    { id: 'akuma11',     charId: 'akuma_nihmane', name: 'Akuma · Cyberpunk',      img: 'personajes/akuma11.jpg', rarity: 'legend' },

    /* ——— Marciana ——— */
    { id: 'marciana_summer',  charId: 'marciana', name: 'Marciana · Lifeguard Shock',   img: 'personajes/marciana1.jpg',  rarity: 'event' },
    { id: 'marciana2',        charId: 'marciana', name: 'Marciana · Covered Jacket',    img: 'personajes/marciana2.jpg',  rarity: 'rare' },
    { id: 'marciana_summer2', charId: 'marciana', name: 'Marciana · Beach Smile',       img: 'personajes/marciana3.jpg',  rarity: 'event' },
    { id: 'marciana4',        charId: 'marciana', name: 'Marciana · Shark Unit',        img: 'personajes/marciana4.jpg',  rarity: 'epic' },
    { id: 'marciana5',        charId: 'marciana', name: 'Marciana · Jacket Open',       img: 'personajes/marciana5.jpg',  rarity: 'epic' },
    { id: 'marciana_summer3', charId: 'marciana', name: 'Marciana · Red Bikini',        img: 'personajes/marciana6.jpg',  rarity: 'event' },
    { id: 'marciana7',        charId: 'marciana', name: 'Marciana · Golden Rifle',      img: 'personajes/marciana7.jpg',  rarity: 'legend' },
    { id: 'marciana8',        charId: 'marciana', name: 'Marciana · Beach Panic',       img: 'personajes/marciana8.jpg',  rarity: 'epic' },
    { id: 'marciana9',        charId: 'marciana', name: 'Marciana · Instructor',        img: 'personajes/marciana9.jpg',  rarity: 'rare' },
    { id: 'marciana10',       charId: 'marciana', name: 'Marciana · Sunbathe',          img: 'personajes/marciana10.jpg', rarity: 'common' },

    /* ——— Renner ——— */
    { id: 'renner1',     charId: 'renner_the_golden_princess', name: 'Renner · Vampire Peace',   img: 'personajes/renner1.jpg', rarity: 'epic' },
    { id: 'renner_hw',   charId: 'renner_the_golden_princess', name: 'Renner · Undead Crown',    img: 'personajes/renner2.jpg', rarity: 'event' },
    { id: 'renner3',     charId: 'renner_the_golden_princess', name: 'Renner · True Form',       img: 'personajes/renner3.jpg', rarity: 'legend' },

    /* ——— Inosuke Hashibira ——— */
    { id: 'inosuke1', charId: 'inosuke_hashibira', name: 'Inosuke · Beast Slash',     img: 'personajes/inosuke1.jpg', rarity: 'epic' },
    { id: 'inosuke2', charId: 'inosuke_hashibira', name: 'Inosuke · Unmasked Smile',  img: 'personajes/inosuke2.jpg', rarity: 'rare' },
    { id: 'inosuke3', charId: 'inosuke_hashibira', name: 'Inosuke · Wild Charge',     img: 'personajes/inosuke3.jpg', rarity: 'epic' },
    { id: 'inosuke4', charId: 'inosuke_hashibira', name: 'Inosuke · Moonlight Boar',  img: 'personajes/inosuke4.jpg', rarity: 'legend' },
    { id: 'inosuke5', charId: 'inosuke_hashibira', name: 'Inosuke · Mask Off',        img: 'personajes/inosuke5.jpg', rarity: 'common' },

    /* ——— Kisame Hoshigaki ——— */
    { id: 'kisame1', charId: 'kisame_hoshigaki', name: 'Kisame · Underwater Seal',  img: 'personajes/kisame1.jpg', rarity: 'epic' },
    { id: 'kisame2', charId: 'kisame_hoshigaki', name: 'Kisame · Samehada Form',    img: 'personajes/kisame2.jpg', rarity: 'legend' },
    { id: 'kisame3', charId: 'kisame_hoshigaki', name: 'Kisame · Shark Blade',      img: 'personajes/kisame3.jpg', rarity: 'rare' },

    /* ——— Zentreya ——— */
    { id: 'zentreya_summer',  charId: 'zentreya_dragon', name: 'Zentreya · USA Bikini',      img: 'personajes/zentreya1.jpg',  rarity: 'event' },
    { id: 'zentreya_maid',    charId: 'zentreya_dragon', name: 'Zentreya · Maid',            img: 'personajes/zentreya2.jpg',  rarity: 'event' },
    { id: 'zentreya3',        charId: 'zentreya_dragon', name: 'Zentreya · Metalcore',       img: 'personajes/zentreya3.jpg',  rarity: 'epic' },
    { id: 'zentreya4',        charId: 'zentreya_dragon', name: 'Zentreya · Goth Close-up',   img: 'personajes/zentreya4.jpg',  rarity: 'rare' },
    { id: 'zentreya_summer2', charId: 'zentreya_dragon', name: 'Zentreya · Pool Spikes',     img: 'personajes/zentreya5.jpg',  rarity: 'event' },
    { id: 'zentreya6',        charId: 'zentreya_dragon', name: 'Zentreya · Maid Wings',      img: 'personajes/zentreya6.jpg',  rarity: 'epic' },
    { id: 'zentreya7',        charId: 'zentreya_dragon', name: 'Zentreya · Fire Fist',       img: 'personajes/zentreya7.jpg',  rarity: 'legend' },
    { id: 'zentreya8',        charId: 'zentreya_dragon', name: 'Zentreya · Metal Crop',      img: 'personajes/zentreya8.jpg',  rarity: 'common' },
    { id: 'zentreya9',        charId: 'zentreya_dragon', name: 'Zentreya · Tribal',          img: 'personajes/zentreya9.jpg',  rarity: 'rare' },
    { id: 'zentreya_nurse',   charId: 'zentreya_dragon', name: 'Zentreya · Nurse',           img: 'personajes/zentreya10.jpg', rarity: 'event' },
    { id: 'zentreya_bunny',   charId: 'zentreya_dragon', name: 'Zentreya · Bunny',           img: 'personajes/zentreya11.jpg', rarity: 'event' },

    /* ——— Aoki Ruri ——— */
    { id: 'aoki1',       charId: 'aoki_ruki', name: 'Aoki · Tennis',       img: 'personajes/aoki1.jpg', rarity: 'epic' },
    { id: 'aoki2',       charId: 'aoki_ruki', name: 'Aoki · Cheerleader',  img: 'personajes/aoki2.jpg', rarity: 'rare' },
    { id: 'aoki_maid',   charId: 'aoki_ruki', name: 'Aoki · Maid',         img: 'personajes/aoki3.jpg', rarity: 'event' },

    /* ——— Akumi ——— */
    { id: 'akumi1',        charId: 'akumi_yoclesh', name: 'Akumi · Bandage Oni',      img: 'personajes/akumi1.jpg',  rarity: 'epic' },
    { id: 'akumi2',        charId: 'akumi_yoclesh', name: 'Akumi · Okonomiyaki',      img: 'personajes/akumi2.jpg',  rarity: 'rare' },
    { id: 'akumi_bday',    charId: 'akumi_yoclesh', name: 'Akumi · Birthday',         img: 'personajes/akumi3.jpg',  rarity: 'event' },
    { id: 'akumi4',        charId: 'akumi_yoclesh', name: 'Akumi · Gothic Rose',      img: 'personajes/akumi4.jpg',  rarity: 'epic' },
    { id: 'akumi5',        charId: 'akumi_yoclesh', name: 'Akumi · Masked Assassin',  img: 'personajes/akumi5.jpg',  rarity: 'legend' },
    { id: 'akumi_summer',  charId: 'akumi_yoclesh', name: 'Akumi · Beach',            img: 'personajes/akumi6.jpg',  rarity: 'event' },
    { id: 'akumi_bunny',   charId: 'akumi_yoclesh', name: 'Akumi · Bunny',            img: 'personajes/akumi7.jpg',  rarity: 'event' },
    { id: 'akumi8',        charId: 'akumi_yoclesh', name: 'Akumi · Streetwear',       img: 'personajes/akumi8.jpg',  rarity: 'rare' },
    { id: 'akumi_hw',      charId: 'akumi_yoclesh', name: 'Akumi · Ghost',            img: 'personajes/akumi9.jpg',  rarity: 'event' },
    { id: 'akumi10',       charId: 'akumi_yoclesh', name: 'Akumi · Shrine Boat',      img: 'personajes/akumi10.jpg', rarity: 'epic' },
    { id: 'akumi11',       charId: 'akumi_yoclesh', name: 'Akumi · Lingerie Plush',   img: 'personajes/akumi11.jpg', rarity: 'legend' },
    { id: 'akumi12',       charId: 'akumi_yoclesh', name: 'Akumi · Kimono Sake',      img: 'personajes/akumi12.jpg', rarity: 'epic' },
    { id: 'akumi_bunny2',  charId: 'akumi_yoclesh', name: 'Akumi · Bunny Formal',     img: 'personajes/akumi13.jpg', rarity: 'event' },
    { id: 'akumi14',       charId: 'akumi_yoclesh', name: 'Akumi · Captain',          img: 'personajes/akumi14.jpg', rarity: 'rare' },

    /* ——— Nitocris ——— */
    { id: 'nitocris1',       charId: 'nitocris_fate', name: 'Nitocris · Casual Bunny',    img: 'personajes/nitocris1.jpg',  rarity: 'rare' },
    { id: 'nitocris2',       charId: 'nitocris_fate', name: 'Nitocris · White Dress',     img: 'personajes/nitocris2.jpg',  rarity: 'epic' },
    { id: 'nitocris3',       charId: 'nitocris_fate', name: 'Nitocris · Pharaoh',         img: 'personajes/nitocris3.jpg',  rarity: 'legend' },
    { id: 'nitocris4',       charId: 'nitocris_fate', name: 'Nitocris · Witch Library',   img: 'personajes/nitocris4.jpg',  rarity: 'epic' },
    { id: 'nitocris5',       charId: 'nitocris_fate', name: 'Nitocris · Sakura Kimono',   img: 'personajes/nitocris5.jpg',  rarity: 'epic' },
    { id: 'nitocris_hw',     charId: 'nitocris_fate', name: 'Nitocris · Halloween',       img: 'personajes/nitocris6.jpg',  rarity: 'event' },
    { id: 'nitocris_hw2',  charId: 'nitocris_fate', name: 'Nitocris · Mummy',           img: 'personajes/nitocris7.jpg',  rarity: 'event' },
    { id: 'nitocris_bunny',  charId: 'nitocris_fate', name: 'Nitocris · Bunny',           img: 'personajes/nitocris8.jpg',  rarity: 'event' },
    { id: 'nitocris_summer', charId: 'nitocris_fate', name: 'Nitocris · Beach',           img: 'personajes/nitocris9.jpg',  rarity: 'event' },
    { id: 'nitocris10',      charId: 'nitocris_fate', name: 'Nitocris · Office',          img: 'personajes/nitocris10.jpg', rarity: 'rare' },

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
    selena_star: true,
    vermeil_nurse: true,
    vermeil_gothic: true,
    dyrroth_star: true,
    hoshimi_summer: true,
    hoshimi_summer1: true,
    gojo_chm: true,
    gojo_hk: true,
    johnson_transformer: true,
    gloo_patricio: true,
    grock_star: true,
    guinevere_kof: true,
    guinevere_summer: true,
    thamuz_kai: true,
    thamuz_star: true,
    helcurt_star: true,
    yoruichi_hw: true,
    cz_summer: true,
    nobara_maid: true,
    nobara_casino: true,
    nakiri_autumn: true,
    nakiri_maid: true,
    shiori_hw: true,
    shiori_summer: true,
    shiori_hood: true,
    shiori_summer1: true,
    shiori_casino: true,
    shiori_summer2: true,
    shiori_chm: true,
    karin_summer: true,
    ibuki_summer: true,
    castorice_hw: true,
    castorice_summer: true,
    onigiria_hw: true,
    onigiria_hw1: true,
    onigiria_hw2: true,
    w_god: true,
    w_summer: true,
    w_summer2: true,
    w_casino: true,
    akuma_chm: true,
    akuma_hw: true,
    akuma_summer: true,
    marciana_summer: true,
    marciana_summer2: true,
    marciana_summer3: true,
    renner_hw: true,
    zentreya_summer: true,
    zentreya_summer2: true,
    zentreya_maid: true,
    zentreya_nurse: true,
    zentreya_bunny: true,
    aoki_maid: true,
    akumi_bday: true,
    akumi_summer: true,
    akumi_bunny: true,
    akumi_hw: true,
    akumi_bunny2: true,
    nitocris_hw: true,
    nitocris_hw2: true,
    nitocris_bunny: true,
    nitocris_summer: true
  };

  const RARITY = {
    common: { label: 'Común',  color: '#94a3b8', icon: '⚪' },
    rare:   { label: 'Rara',   color: '#38bdf8', icon: '🔷' },
    epic:   { label: 'Épica',  color: '#c084fc', icon: '🟣' },
    event:  { label: 'Evento', color: '#fb7185', icon: '🎉' },
    legend: { label: 'Legendaria', color: '#fbbf24', icon: '🌟' }
  };
  const PRICES = { common: 150, rare: 300, epic: 600, legend: 1500, event: 2000 };       // monedas
  const RARITY_WEIGHT = { common: 5, rare: 3, epic: 1.3, event: 0.2, legend: 0.5 };       // % de cada RAREZA en los cofres (no por skin). Si una rareza no tiene skins disponibles, el resto se reparte hasta sumar 100 %
  const COINS_MIN = 15, COINS_MAX = 45;                        // monedas por cofre
  const SKIN_CHANCE = 0.12;                                    // 12 % de que un cofre dé una skin
  const CHEST_PRICE = 50;                                      // cofre normal de la tienda (monedas)
  /* COFRES Y PAQUETES DE SKINS GARANTIZADAS DE LA TIENDA (siempre dan skins que aún no tengas).
       price = monedas · count = nº de skins distintas · allow = rarezas posibles (null = todas)
       Dentro de lo permitido, la rareza sale de RARITY_WEIGHT. color/hue = aspecto del cofre.
       Para usar tu propio dibujo: img: 'personajes/cofre-oro.png' (si no existe se ve el emoji). */
  const SKIN_CHESTS = [
    { id: 'skin',       group: 'chest', icon: '🎁', name: 'Cofre Misterioso',  tag: 'Skin garantizada',            desc: 'Una skin que aún no tengas, de cualquier rareza.',                      price: 400,  count: 1, allow: null,                                color: '#fbbf24', hue: 0 },
    { id: 'plata',      group: 'chest', icon: '🥈', name: 'Cofre de Plata',    tag: 'Rara o superior',             desc: 'Nada de comunes: te toca una skin rara, épica o mejor.',                price: 700,  count: 1, allow: ['rare', 'epic', 'event', 'legend'], color: '#38bdf8', hue: 150 },
    { id: 'oro',        group: 'chest', icon: '🥇', name: 'Cofre de Oro',      tag: 'Épica o superior',            desc: 'Una skin épica, legendaria o de evento asegurada.',                     price: 1150, count: 1, allow: ['epic', 'event', 'legend'],         color: '#c084fc', hue: 260 },
    { id: 'legendario', group: 'chest', icon: '👑', name: 'Cofre Legendario',  tag: 'Legendaria garantizada',      desc: 'Una skin legendaria asegurada.',                                         price: 1800, count: 1, allow: ['legend'],                          color: '#f59e0b', hue: 20 },
    { id: 'evento',     group: 'chest', icon: '🎆', name: 'Cofre de Evento',   tag: 'Skin de evento garantizada',  desc: 'Las skins más valiosas: edición limitada, solo mientras haya eventos activos.', price: 2400, count: 1, allow: ['event'],                           color: '#fb7185', hue: 330 },
    { id: 'trio',       group: 'pack',  icon: '🎴', name: 'Paquete Trío',      tag: '3 skins distintas',           desc: 'Tres skins nuevas de cualquier rareza, más barato que por separado.',   price: 1100, count: 3, allow: null,                                color: '#34d399', hue: 90 },
    { id: 'real',       group: 'pack',  icon: '💎', name: 'Paquete Real',      tag: '3 skins épicas o superiores', desc: 'Tres skins distintas, todas épicas, legendarias o de evento.',          price: 3100, count: 3, allow: ['epic', 'event', 'legend'],         color: '#a78bfa', hue: 230 }
  ];
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

  /* Skins que aún se pueden conseguir con un cofre concreto */
  function chestPool(c) {
    S = load();
    return validSkins().filter(k => !S.owned[k.id] && isAvailable(k) && (!c.allow || c.allow.includes(k.rarity)));
  }

  /* Cofre / paquete de skins garantizadas: da `count` skins distintas que no tengas; solo varía la rareza */
  function buySkinChest(id) {
    const c = SKIN_CHESTS.find(x => x.id === (id || 'skin'));
    if (!c) return { ok: false, msg: 'Ese cofre no existe.' };
    let pool = chestPool(c);
    if (!pool.length) return { ok: false, msg: c.allow ? '¡Ya tienes todas las skins de este cofre o no hay ninguna disponible ahora!' : '¡Ya tienes todas las skins disponibles!' };
    if (pool.length < c.count) return { ok: false, msg: `Solo quedan ${pool.length} skins para este paquete (necesita ${c.count}).` };
    if (S.coins < c.price) return { ok: false, msg: `Te faltan ${fmt(c.price - S.coins)} monedas.` };
    const picks = [];
    for (let i = 0; i < c.count; i++) { const pick = weightedPick(pool); picks.push(pick); pool = pool.filter(x => x !== pick); }
    S.coins -= c.price;
    picks.forEach(pick => { S.owned[pick.id] = 1; if (!S.selected[pick.charId]) S.selected[pick.charId] = pick.id; });
    save(); applyAll(); refreshChip();
    return { ok: true, chest: c, skins: picks, skin: picks[0],
      msg: c.count === 1 ? `${c.icon} ¡Te ha tocado «${picks[0].name}»!` : `${c.icon} ¡${c.name}: has conseguido ${c.count} skins nuevas!` };
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

  /* Da directamente una skin que aún no tengas (la usa cooperativo.js como recompensa de jefe).
     allow = rarezas permitidas (['epic','legend']...) o null para cualquiera. La rareza sale de RARITY_WEIGHT.
     Devuelve { id, name, img, charId, rarity, rarityLabel, rarityColor, rarityIcon } o null si no queda ninguna. */
  function grantSkin(allow) {
    S = load();
    const pool = validSkins().filter(k => !S.owned[k.id] && isAvailable(k) && (!allow || !allow.length || allow.includes(k.rarity)));
    if (!pool.length) return null;
    const pick = weightedPick(pool);
    S.owned[pick.id] = 1;
    if (!S.selected[pick.charId]) S.selected[pick.charId] = pick.id;
    save(); applyAll(); refreshChip();
    const r = rarityOf(pick);
    return { id: pick.id, name: pick.name, img: pick.img, charId: pick.charId, rarity: pick.rarity,
             rarityLabel: r.label, rarityColor: r.color, rarityIcon: r.icon };
  }

  /* HTML del bonus para la ventana de apertura del cofre */
  function describeBonus(b) {
    if (!b) return '';
    const skins = (b.skins || []).map(s => `<div class="sk-drop" style="--c:${rarityOf(s).color}">
        ${fallbackImg(s.img, '🎨')}
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
    /* animación de lo que sale en los cofres normales (ventana del Inventario) */
    .sk-coin{animation:sk-coinpop .6s .15s cubic-bezier(.2,1.5,.4,1) both}
    .sk-drop{position:relative;overflow:hidden;animation:sk-dropin .75s .55s cubic-bezier(.2,1.4,.4,1) both,sk-glow 1.6s 1.3s ease-in-out 3}
    .sk-drop::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);transform:translateX(-120%);animation:sk-shine 1s 1.1s ease-out 2;pointer-events:none}
    @keyframes sk-coinpop{0%{opacity:0;transform:scale(.4) translateY(10px)}100%{opacity:1;transform:none}}
    @keyframes sk-dropin{0%{opacity:0;transform:scale(.3) rotate(-8deg)}60%{opacity:1;transform:scale(1.12) rotate(2deg)}100%{opacity:1;transform:none}}
    @keyframes sk-glow{0%,100%{box-shadow:0 0 0 var(--c)}50%{box-shadow:0 0 22px var(--c)}}
    @keyframes sk-shine{to{transform:translateX(120%)}}
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
    /* cofres y paquetes de skins: cada uno con su color */
    .sk-sc{position:relative;overflow:hidden;border:1px solid var(--cc);background:#0f1020;
      background:linear-gradient(135deg,color-mix(in srgb,var(--cc) 20%,transparent),transparent 58%),#0f1020;
      box-shadow:0 12px 30px rgba(0,0,0,.4),0 0 16px color-mix(in srgb,var(--cc) 28%,transparent);transition:transform .2s,box-shadow .2s}
    .sk-sc:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(0,0,0,.45),0 0 26px color-mix(in srgb,var(--cc) 55%,transparent)}
    .sk-sc::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.13) 50%,transparent 60%);transform:translateX(-130%);pointer-events:none}
    .sk-sc:hover::after{transform:translateX(130%);transition:transform .8s ease}
    .sk-sc .sk-chest-img{box-shadow:0 0 18px color-mix(in srgb,var(--cc) 55%,transparent)}
    .sk-tag{align-self:flex-start;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:2px 9px;border-radius:99px;color:var(--cc);border:1px solid var(--cc);background:rgba(255,255,255,.04)}
    .sk-chest-title{font-size:17px;letter-spacing:.02em;background:linear-gradient(90deg,#fff 30%,var(--cc));-webkit-background-clip:text;background-clip:text;color:transparent}
    .sk-ribbon{position:absolute;top:8px;right:-26px;transform:rotate(38deg);padding:2px 30px;font-size:11px;font-weight:900;color:#10131f;background:var(--cc)}
    #sk-reveal{position:fixed;inset:0;z-index:140;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,4,10,.82)}
    .sk-rv{width:min(340px,100%);display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;border-radius:22px;text-align:center;color:#fff;
      border:2px solid var(--c);background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.012)),#0f1020;box-shadow:0 0 40px var(--c)}
    .sk-rv img,.sk-rv .sk-fb{width:220px;max-width:100%;aspect-ratio:1;object-fit:cover;object-position:center 15%;border-radius:16px;background:#0d1730;display:flex;align-items:center;justify-content:center;font-size:70px}
    .sk-rv h3{margin:0;font-size:20px}
    /* paquetes: varias skins a la vez */
    .sk-rv.sk-rv-multi{width:min(720px,100%)}
    .sk-rv-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
    .sk-mini{width:190px;max-width:100%;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px;border-radius:16px;border:2px solid var(--c);
      background:rgba(255,255,255,.04);box-shadow:0 0 22px var(--c);animation:sk-cardin .7s calc(var(--i) * .35s + .2s) cubic-bezier(.2,1.3,.4,1) both}
    .sk-rv-multi .sk-mini img,.sk-rv-multi .sk-mini .sk-fb{width:100%;font-size:46px}
    .sk-mini b{font-size:14px}
    .sk-mini small{color:#9fb0c9}
    /* cofre de skin garantizada: apertura animada */
    .sk-open{position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;color:#fff;text-align:center;cursor:pointer}
    .sk-open-chest{position:relative;width:170px;height:170px;display:flex;align-items:center;justify-content:center}
    .sk-open-chest::before{content:'';position:absolute;inset:-30px;border-radius:50%;background:radial-gradient(circle,var(--c) 0%,transparent 65%);opacity:.15;animation:sk-aura var(--dur,1.6s) ease-in forwards}
    .sk-open-chest img,.sk-open-chest .sk-chest-img{position:relative;width:150px;height:150px;border-radius:20px;object-fit:cover;font-size:80px;display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 30px rgba(251,191,36,.45);animation:sk-shake var(--dur,1.6s) ease-in forwards}
    .sk-open small{color:#9fb0c9}
    .sk-flash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;animation:sk-flash .7s ease-out forwards}
    .sk-rv.sk-in{animation:sk-cardin .8s cubic-bezier(.2,1.3,.4,1) both}
    .sk-rv.sk-in img,.sk-rv.sk-in .sk-fb{animation:sk-imgin .9s .15s ease-out both}
    .sk-rv.sk-in .sk-rar{animation:sk-rarpop .6s .6s cubic-bezier(.2,1.6,.4,1) both}
    .sk-spark{position:absolute;left:50%;top:42%;width:8px;height:8px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);pointer-events:none;animation:sk-spark 1.1s ease-out forwards}
    @keyframes sk-shake{0%{transform:rotate(0) scale(1)}10%{transform:rotate(-4deg)}20%{transform:rotate(4deg) scale(1.03)}30%{transform:rotate(-6deg)}40%{transform:rotate(6deg) scale(1.06)}
      55%{transform:rotate(-9deg) scale(1.08)}70%{transform:rotate(9deg) scale(1.12)}85%{transform:rotate(-11deg) scale(1.16)}100%{transform:rotate(0) scale(1.3)}}
    @keyframes sk-aura{0%{opacity:.1;transform:scale(.6)}100%{opacity:.95;transform:scale(1.7)}}
    @keyframes sk-flash{0%{opacity:.95}100%{opacity:0}}
    @keyframes sk-cardin{0%{opacity:0;transform:scale(.4) rotate(-6deg)}100%{opacity:1;transform:none}}
    @keyframes sk-imgin{0%{filter:brightness(3) blur(6px);transform:scale(.85)}100%{filter:none;transform:none}}
    @keyframes sk-rarpop{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:none}}
    @keyframes sk-spark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}
    @media (prefers-reduced-motion:reduce){.sk-mini,.sk-sc,.sk-sc::after,.sk-coin,.sk-drop,.sk-drop::after,.sk-open-chest::before,.sk-open-chest img,.sk-open-chest .sk-chest-img,.sk-flash,.sk-rv.sk-in,.sk-rv.sk-in *,.sk-spark{animation:none!important}}
    .sk-card.sk-off{opacity:.55;filter:grayscale(.6)}
    .sk-btn{padding:8px 12px;border:0;border-radius:12px;cursor:pointer;font:inherit;font-weight:800;color:#1a1204;background:linear-gradient(180deg,#fde047,#f59e0b)}
    .sk-btn:disabled{opacity:.45;cursor:not-allowed}
    .sk-btn.alt{color:#fff;background:rgba(139,92,246,.35);border:1px solid rgba(167,139,250,.6)}
    .sk-btn.on{color:#bbf7d0;background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.6)}
    .sk-empty{padding:40px 10px;text-align:center;color:#9fb0c9}

    .sk-box{margin:0 0 16px}
    .sk-box h4{margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#9db0cc}
    .sk-row{display:grid;grid-template-columns:repeat(auto-fill,78px);gap:8px;justify-content:start}
    .sk-row .sk-opt.sk-hide{display:none}
    .sk-box h4.sk-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
    .sk-pager{display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0}
    .sk-pager span{font-size:12px;color:#9db0cc;min-width:56px;text-align:center}
    .sk-pg{width:32px;height:28px;border-radius:9px;cursor:pointer;font:inherit;font-weight:800;font-size:16px;line-height:1;color:#fff;
      background:rgba(139,92,246,.3);border:1px solid rgba(167,139,250,.55)}
    .sk-pg:hover:not(:disabled){background:rgba(139,92,246,.5)}
    .sk-pg:disabled{opacity:.3;cursor:not-allowed}
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

  /* Si una imagen no carga (p. ej. la tienes como .png/.jpeg en vez de .jpg) prueba las otras extensiones
     antes de rendirse y, si acierta, se acuerda de la ruta buena para el resto del juego. */
  const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const extOf = src => ((String(src).match(/\.([a-z0-9]+)$/i) || [])[1] || '').toLowerCase();
  const nextImg = (src, tried) => { const b = String(src).replace(/\.[a-z0-9]+$/i, ''); const e = IMG_EXTS.find(x => !tried.includes(x)); return e ? b + '.' + e : null; };
  function rememberImg(orig, now) {
    if (!orig || !now || orig === now) return;
    SKIN_CATALOG.forEach(k => { if (k.img === orig) k.img = now; });
    applyAll();
  }
  window.__skFix = function (img, emoji) {
    const orig = img.dataset.orig || img.getAttribute('src');
    img.dataset.orig = orig;
    const tried = (img.dataset.tried || extOf(orig)).split(',').filter(Boolean);
    if (!tried.includes(extOf(img.getAttribute('src')))) tried.push(extOf(img.getAttribute('src')));
    const nxt = nextImg(orig, tried);
    if (!nxt) { img.outerHTML = '<div class="sk-fb">' + emoji + '</div>'; return; }
    tried.push(extOf(nxt));
    img.dataset.tried = tried.join(',');
    img.setAttribute('src', nxt);
  };
  window.__skOk = function (img) { rememberImg(img.dataset.orig, img.getAttribute('src')); };
  function fallbackImg(src, emoji) {
    return `<img src="${esc(src)}" alt="" data-orig="${esc(src)}" onerror="__skFix(this,'${emoji}')" onload="__skOk(this)">`;
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

  function skinChestCard(c, s0) {
    const pool = chestPool(c).length;
    const can = s0.coins >= c.price && pool >= c.count;
    const note = !pool ? (c.allow ? 'Ya no quedan skins de este tipo disponibles.' : 'Ya las tienes todas.')
      : pool < c.count ? `Solo quedan ${pool} skins (necesita ${c.count}).` : `Quedan ${pool} por conseguir.`;
    const img = c.img || SKIN_CHEST_IMG;
    return `<div class="sk-chest sk-sc ${c.group === 'pack' ? 'pack' : ''}" style="--cc:${c.color}">
        ${c.count > 1 ? `<span class="sk-ribbon">×${c.count}</span>` : ''}
        <img class="sk-chest-img" style="filter:hue-rotate(${c.img ? 0 : c.hue}deg) saturate(1.1)" src="${esc(img)}" alt="" onerror="this.outerHTML='<div class=&quot;sk-chest-img&quot;>${c.icon}</div>'">
        <div class="sk-chest-info"><span class="sk-tag">${esc(c.tag)}</span>
          <b class="sk-chest-title">${c.icon} ${esc(c.name)}</b>
          <small>${esc(c.desc)} ${note}</small>
          <div class="sk-chest-btns">
            <button class="sk-btn" data-act="buySkinChest" data-chest="${c.id}" ${can ? '' : 'disabled'}>${coinImg()} ${fmt(c.price)} · Comprar</button></div></div></div>`;
  }

  function chestsHTML() {
    const s0 = load();
    let boxes = 0;
    try { boxes = window.INVENTARIO ? window.INVENTARIO.load().boxes || 0 : 0; } catch (e) { /* ignorar */ }
    const group = g => SKIN_CHESTS.filter(c => c.group === g).map(c => skinChestCard(c, s0)).join('');
    return `<div class="sk-h">📦 Cofres clásicos</div><div class="sk-chests">
      <div class="sk-chest sk-sc sk-normal" style="--cc:#fb923c">
        <img class="sk-chest-img" src="${esc(BOX_IMG)}" alt="" onerror="this.outerHTML='<div class=&quot;sk-chest-img&quot;>📦</div>'">
        <div class="sk-chest-info"><span class="sk-tag">Clásico · va al Inventario</span>
          <b class="sk-chest-title">📦 Cofre del Aventurero</b>
          <small>Igual que los de las partidas: gloria, ${COINS_MIN}-${COINS_MAX} monedas y un ${Math.round(SKIN_CHANCE * 100)} % de skin. Tienes ${boxes} sin abrir.</small>
          <div class="sk-chest-btns">
            <button class="sk-btn" data-act="buyChest" ${s0.coins >= CHEST_PRICE ? '' : 'disabled'}>${coinImg()} ${fmt(CHEST_PRICE)} · Comprar</button>
            <button class="sk-btn alt" data-act="inv">📦 Inventario</button></div></div></div>
    </div>
    <div class="sk-h">🎁 Cofres de skin garantizada</div><div class="sk-chests">${group('chest')}</div>
    <div class="sk-h">🎴 Paquetes de skins</div><div class="sk-chests">${group('pack')}</div>
    <div class="sk-h">🎨 Catálogo de hoy</div>`;
  }

  /* Rebote del cofre normal al comprarlo (va directo al Inventario, se abre allí con su propia animación) */
  function bounceChest() {
    try {
      const el = document.querySelector('.sk-chest.sk-normal .sk-chest-img');
      if (el && el.animate) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25) rotate(-6deg)' }, { transform: 'scale(.94) rotate(4deg)' }, { transform: 'scale(1)' }], { duration: 520, easing: 'ease-out' });
    } catch (e) { /* ignorar */ }
  }

  function showSkinReveal(skins, chest) {
    const list = [].concat(skins).filter(Boolean);
    if (!list.length) return;
    const old = byId('sk-reveal'); if (old) old.remove();
    const ORDER = ['common', 'rare', 'epic', 'legend', 'event'];       // de menos a más valor
    const best = list.reduce((a, k) => ORDER.indexOf(k.rarity) > ORDER.indexOf(a.rarity) ? k : a, list[0]);
    const br = rarityOf(best);
    const calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const big = best.rarity === 'legend' || best.rarity === 'event';   // las raras tardan un poco más (más suspense)
    const dur = calm ? 0 : (big ? 2200 : 1600);
    const m = document.createElement('div');
    m.id = 'sk-reveal';
    m.style.setProperty('--c', chest ? chest.color : br.color);
    let revealed = false, timer = null;

    const reveal = () => {
      if (revealed || !m.isConnected) return;
      revealed = true; clearTimeout(timer);
      m.style.setProperty('--c', br.color);
      if (list.length === 1) {
        const k = list[0];
        m.innerHTML = `<div class="sk-rv sk-in" style="--c:${br.color}">
          ${fallbackImg(k.img, '🎨')}
          <h3>${esc(k.name)}</h3><span class="sk-rar">${br.icon} ${br.label}</span>
          <small>${esc(baseOf(k).name)}</small>
          <button class="sk-btn" data-act="closeReveal">¡Genial!</button></div>`;
      } else {
        m.innerHTML = `<div class="sk-rv sk-rv-multi sk-in" style="--c:${br.color}">
          <h3>${chest ? esc(chest.icon + ' ' + chest.name) : '🎁 Tus skins'}</h3>
          <div class="sk-rv-row">${list.map((k, i) => { const r = rarityOf(k);
            return `<div class="sk-mini" style="--c:${r.color};--i:${i}">${fallbackImg(k.img, '🎨')}<b>${esc(k.name)}</b><span class="sk-rar">${r.icon} ${r.label}</span><small>${esc(baseOf(k).name)}</small></div>`; }).join('')}</div>
          <button class="sk-btn" data-act="closeReveal">¡Genial!</button></div>`;
      }
      if (calm) return;
      const fl = document.createElement('div'); fl.className = 'sk-flash'; m.appendChild(fl);
      const n = (big ? 34 : 22) + (list.length > 1 ? 14 : 0);
      for (let i = 0; i < n; i++) {                                    // chispas en abanico
        const sp = document.createElement('i'); sp.className = 'sk-spark';
        const ang = Math.random() * Math.PI * 2, d = 90 + Math.random() * (big ? 220 : 150);
        sp.style.setProperty('--dx', Math.round(Math.cos(ang) * d) + 'px');
        sp.style.setProperty('--dy', Math.round(Math.sin(ang) * d) + 'px');
        sp.style.animationDelay = Math.round(Math.random() * 180) + 'ms';
        m.appendChild(sp);
      }
      setTimeout(() => m.querySelectorAll('.sk-spark,.sk-flash').forEach(x => x.remove()), 1600);
    };

    const art = chest && chest.img ? chest.img : SKIN_CHEST_IMG;
    const hue = chest && !chest.img ? chest.hue : 0;
    m.innerHTML = `<div class="sk-open" style="--dur:${dur}ms">
      <div class="sk-open-chest">${fallbackImg(art, chest ? chest.icon : '🎁').replace('<img ', `<img class="sk-chest-img" style="filter:hue-rotate(${hue}deg) saturate(1.1)" `)}</div>
      <b>Abriendo ${chest ? esc(chest.name) : 'cofre'}…</b><small>Toca para saltar</small></div>`;
    m.addEventListener('click', e => {
      if (!revealed) { reveal(); return; }                              // un toque durante la apertura salta la animación
      if (e.target === m || e.target.closest('[data-act="closeReveal"]')) m.remove();
    });
    document.body.appendChild(m);
    if (calm) reveal(); else timer = setTimeout(reveal, dur);
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
    else if (act === 'buyChest') { const r = buyChest(); ui.msg = r.msg; renderShop(); if (r.ok) bounceChest(); }
    else if (act === 'buySkinChest') { const r = buySkinChest(b.dataset.chest); ui.msg = r.msg; renderShop(); if (r.skins) showSkinReveal(r.skins, r.chest); }
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
  const skPage = {};                       // página del selector recordada por personaje
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
          box.innerHTML = `<h4 class="sk-head"><span>🎨 Apariencia</span><span class="sk-pager" hidden><button type="button" class="sk-pg" data-pg="-1" title="Anterior">‹</button><span class="sk-pg-n"></span><button type="button" class="sk-pg" data-pg="1" title="Siguiente">›</button></span></h4><div class="sk-row">
            ${opt('', base.__img0 || base.img, 'Original', true, !cur)}
            ${skins.map(s => opt(s.id, s.img, s.name, !!S.owned[s.id], cur === s.id)).join('')}</div>
            <div class="sk-hint">Las skins con 🔒 salen en cofres 📦 o aparecen en el catálogo diario de la 🛒 Tienda.</div>`;
          const stats = body.querySelector('.glossary-stats');
          if (stats) body.insertBefore(box, stats); else body.appendChild(box);
          /* Paginación: solo 2 filas visibles; el nº de columnas depende del ancho disponible */
          const row = box.querySelector('.sk-row'), pager = box.querySelector('.sk-pager');
          const items = Array.from(row.querySelectorAll('.sk-opt'));
          const curIdx = Math.max(0, items.findIndex(el => el.classList.contains('sel')));
          let page = (skPage[id] != null) ? skPage[id] : -1;
          const layout = () => {
            const cols = Math.max(1, getComputedStyle(row).gridTemplateColumns.split(' ').filter(Boolean).length);
            const size = cols * 2, pages = Math.max(1, Math.ceil(items.length / size));
            if (page < 0) page = Math.floor(curIdx / size);          // primera vez: página de la skin equipada
            page = Math.min(Math.max(page, 0), pages - 1);
            skPage[id] = page;
            items.forEach((el, i) => el.classList.toggle('sk-hide', Math.floor(i / size) !== page));
            pager.hidden = pages <= 1;
            pager.querySelector('.sk-pg-n').textContent = (page + 1) + ' / ' + pages;
            pager.querySelector('[data-pg="-1"]').disabled = page <= 0;
            pager.querySelector('[data-pg="1"]').disabled = page >= pages - 1;
          };
          layout();
          requestAnimationFrame(layout);                              // por si el modal aún no tenía su ancho final
          const onResize = () => { if (!box.isConnected) { window.removeEventListener('resize', onResize); return; } layout(); };
          window.addEventListener('resize', onResize);
          pager.addEventListener('click', ev => {
            const g = ev.target.closest('.sk-pg');
            if (!g || g.disabled) return;
            page += Number(g.dataset.pg); layout();
          });
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
    healSelected();
  }

  function healSelected() {
    try {
      S = load();
      Object.keys(S.selected).forEach(cid => {
        const k = skinById(S.selected[cid]);
        if (!k || !S.owned[k.id]) return;
        const orig = k.img, tried = [extOf(orig)];
        const probe = src => {
          const im = new Image();
          im.onload = () => rememberImg(orig, src);
          im.onerror = () => { const n = nextImg(orig, tried); if (n) { tried.push(extOf(n)); probe(n); } };
          im.src = src;
        };
        probe(orig);
      });
    } catch (e) { /* ignorar */ }
  }

  /* Multijugador: skin equipada de un personaje (solo si la tienes) y su imagen (validada contra el catálogo) */
  const selectedSkinId = charId => { const d = load(); const id = d.selected[charId]; return (id && d.owned[id] && skinById(id)) ? id : null; };
  const skinImg = (skinId, charId) => { const s = skinById(skinId); return (s && s.charId === charId) ? s.img : null; };

  window.SKINS = {
    selectedSkinId, skinImg,
    rollChest, describeBonus, addCoins, coinImg, rates, buy, equip, open: openShop, grantSkin,
    coins: () => load().coins, catalog: SKIN_CATALOG, reload: () => { S = load(); applyAll(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
