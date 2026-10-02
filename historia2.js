/* historia2.js — Modo Historia 2: "La Convergencia de los Mil Mundos"
   ---------------------------------------------------------------------------
   Una historia nueva e independiente en la que aparecen los 171 personajes
   de personajes.js. Protagonista: Rades Spirito, guardián del Cementerio de
   Mundos. Villano final: Nihilux, el Sol Hueco.

   Se carga en juego.html DESPUÉS de game.js (y de desafio.js, si lo usas):
       <script src="historia2.js" defer></script>

   No modifica game.js, personajes.js ni historia.js. Añade su propio botón en
   el menú principal, debajo del Modo Historia original.

   Estructura de la historia: Prólogo + 4 actos (4 Heraldos con 4 Sellos) +
   final. Solo hay 8 combates; el resto son escenas narradas con "reparto".

   EDITAR LA HISTORIA: todo está en HIST2_CHAPTERS (más abajo).
     - type 'narrative': title, cast (ids que aparecen en la escena), lines.
     - type 'battle'   : title, intro, heroIds (máx. 3), villainIds (máx. 3),
                         victory, defeat, villainBoost (multiplicadores
                         opcionales { hp, atk, def, spd } para los rivales).
     Las líneas con formato "Nombre: texto" se muestran como diálogo.
     Ganar avanza la historia; perder o rendirse obliga a reintentar.

   MÚSICA (opcional), carpeta  historia2/  junto a juego.html:
       historia2/dialogo.mp3   → mientras se lee la historia
       historia2/combate.mp3   → durante los combates
   Si faltan los archivos, simplemente no suena nada. El volumen y la opción
   "música activada" se toman de la Configuración del juego.
   Portada opcional: personajes/convergencia.jpg
   ------------------------------------------------------------------------- */

const HIST2_TITLE = 'La Convergencia de los Mil Mundos';

const HIST2_CHAPTERS = [

  /* ===================== PRÓLOGO ===================== */
  {
    type: 'narrative',
    title: 'Prólogo — El guardián del Cementerio',
    cast: ['rades_spirito', 'nicktula'],
    lines: [
      'En el borde del Nexo, donde los mundos muertos van a descansar, hay un cementerio que nadie visita... salvo su guardián.',
      'Rades: Otra noche tranquila. Los cadáveres no hablan, no discuten y no piden propina.',
      'De pronto, el suelo tiembla. Bajo las lápidas, los restos de mundos enteros empiezan a susurrar el mismo nombre.',
      'Cadáveres: Nihilux... Nihilux... Nihilux...',
      'Nicktula: ¡Rades! ¡Menos mal que te encuentro! Soy el archivista del Nexo y traigo una noticia buena y una mala.',
      'Rades: Empieza por la buena.',
      'Nicktula: No hay buena. El Reloj de los Mil Mundos se está parando. Nihilux, el Sol Hueco, borra mundos deteniendo sus relojes uno a uno... y tú guardas los restos de los que ya ha borrado.',
      'Nicktula: Cuatro Heraldos custodian cuatro Sellos que mantienen cerrada la puerta del Reloj. Necesitamos campeones de todos los mundos para romperlos.',
      'Rades: Mi vida son los muertos... pero hasta yo sé que quedan vivos por los que merece la pena luchar. Vamos.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 1 — Los primeros corrompidos',
    intro: [
      'De camino al Nexo, la Fisura escupe a sus primeras víctimas: viejos conocidos con los ojos huecos.',
      'Crazy Dave: ¡WABBY WABBO! ¡Quiero tacos... y vuestras almas!',
      'Nicktula: ¡Es Crazy Dave! ¿Y ese Wooper también está corrompido?',
      'Rades: Tranquilo. Solo hay que sacudirles la Fisura de encima.'
    ],
    heroIds: ['rades_spirito', 'nicktula'],
    villainIds: ['crazydave', 'wooper'],
    victory: [
      'La Fisura se desprende de ellos como humo negro. Crazy Dave se sienta en el suelo, confuso.',
      'Crazy Dave: ¿Dónde está mi olla...? ¿Por qué tengo un cadáver en la cabeza?',
      'Wooper: ¡Wooper!',
      'Rades: Solo ha sido el primer mordisco de Nihilux. Sigamos.'
    ],
    defeat: [
      'Rades cae de rodillas mientras la Fisura se cierra sobre él.',
      'Una voz hueca susurra: «Todo termina».',
      'Nicktula: ¡Aún no, Rades! ¡Levántate e inténtalo de nuevo!'
    ]
  },

  {
    type: 'narrative',
    title: 'Interludio — El mercado del Nexo',
    cast: ['fernando_alonso', 'antonio', 'calamardo', 'shrek', 'nobita', 'caillou', 'padrinos', 'ladybug',
           'kevin', 'richard', 'musculitos', 'mago_electrico', 'chansin', 'Matador', 'Trumpeter', 'David',
           'ricky_edit', 'zoe', 'cici', 'clarence', 'hosimi', 'mint_nte'],
    lines: [
      'El Nexo es un enorme mercado flotante donde cada mundo ha dejado un puesto, una tienda o un problema.',
      'Fernando Alonso: ¡Adelanto por la derecha, apocalipsis a la vista!',
      'Antonio Lobato: ¡Y Alonso se prepara para el fin del mundo, señoras y señores! ¡Qué manera de gestionar la Fisura!',
      'Shrek: ¡Largo de mi ciénaga! ...Perdón, esto es un mercado. Es que mi mundo acaba de desaparecer.',
      'Calamardo: Siempre supe que todo acabaría mal. Ahora, además, tengo alas.',
      'Nobita: ¡Doraemon no responde! ¿Alguien me ayuda con el examen del fin del universo?',
      'Padrinos Mágicos: ¡Pide un deseo! Ay, no... el último lo gastamos en tapar la Fisura.',
      'Ricky Edit: ¡Estoy retransmitiendo en directo desde el único sitio con cobertura!',
      'David: Yo solo vendo cosas, Rades. No me mires así.',
      'Rades: David, eres mi Cadáver Nº3. Vuelve al cementerio.',
      'David: Es un trabajo temporal, ¿vale?',
      'Entre los puestos, Lady Bug, Kevin, el Richard Cachas, Musculitos, Caillou, el Mago Eléctrico, Chansin, Matador, Trumpeter, Clarence, Zoe, Cici, Hosimi y Mint ofrecen provisiones, canciones y consejos.',
      'Nicktula: Mirad el mapa. Cuatro puertas: el Cielo Abierto, las Sombras, el Instituto y los Reinos. Cada una guarda un Sello.',
      'Rades: Entonces empezaremos por la más ruidosa.'
    ]
  },

  /* ===================== ACTO I — CIELO ABIERTO ===================== */
  {
    type: 'narrative',
    title: 'Acto I — La puerta del Cielo Abierto',
    cast: ['saitama', 'goku', 'naruto', 'ichigo', 'gojo_satoru', 'asta', 'yami', 'noelle_silva',
           'mereoleona', 'mimosa', 'inosuke_hashibira'],
    lines: [
      'La primera puerta se abre sobre un cielo sin nubes, donde los mejores guerreros de mil mundos entrenan sin parar.',
      'Saitama: Oye, ¿esto es el torneo? Me dijeron que había descuentos en el súper.',
      'Goku: ¡Qué energía! ¡Esa Fisura tiene un poder enorme! ¡Quiero pelear con quien la haya hecho!',
      'Naruto: ¡Dattebayo! Si hay que salvar el universo, cuenta conmigo. ¡Ese es mi camino ninja!',
      'Gojo Satoru: Tranquilos, soy el más fuerte. ...Aunque esta vez la cosa parece seria.',
      'Ichigo: Algo no encaja. Noto una energía corrompida muy cerca de aquí.',
      'Asta: ¡Voy a ser el Rey Mago! ¡Y también a salvar el multiverso, no hay problema!',
      'Yami: Menos gritos, chaval. Pero... cuenta conmigo.',
      'Noelle, Mereoleona, Mimosa e Inosuke se suman al grupo sin pensarlo demasiado.',
      'Entonces, desde lo alto, dos figuras con los ojos vacíos descienden: Mahito y Ulquiorra.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 2 — Ecos de la traición',
    intro: [
      'Mahito: Qué divertido... un alma tan grande para jugar.',
      'Ulquiorra: Qué inútil es resistirse. La desesperación es lo único real.',
      'Gojo Satoru: Ichigo, ¿te encargas del de los ojos verdes? Yo me quedo con el feo.',
      'Ichigo: Trato hecho.'
    ],
    heroIds: ['rades_spirito', 'ichigo', 'gojo_satoru'],
    villainIds: ['mahito', 'ulquiorra'],
    victory: [
      'Las dos figuras caen. Del pecho de Ulquiorra sale un hilo de humo con forma de sonrisa.',
      'Ulquiorra: Aizen... esto era lo que querías ver...',
      'Ichigo: Aizen. Lo sabía.'
    ],
    defeat: [
      'La Fisura se traga el cielo y los gritos de los guerreros se apagan.',
      'Gojo Satoru: Vaya... esto no estaba en el plan. Inténtalo otra vez, Rades.'
    ]
  },

  {
    type: 'narrative',
    title: 'La sombra de Aizen',
    cast: ['urahara', 'yoruichi', 'mayuri', 'unohana', 'nel', 'tier_harribel', 'riruka', 'nobara', 'choso',
           'itachi', 'deidara', 'konan', 'orochimaru', 'l', 'fern_frieren', 'aqua'],
    lines: [
      'En una casita escondida entre las nubes, un puñado de estrategas estudia el mapa de la Fisura.',
      'Kisuke Urahara: Lo suponía. Detrás de esto hay alguien que conoce nuestros nombres.',
      'L: Hay un 97% de probabilidad de que el primer Heraldo sea Sosuke Aizen. Es el único que lleva siglos planeando una traición.',
      'Yoruichi Shihōin: Entonces habrá que ser más rápidos que él.',
      'Mayuri Kurotsuchi: ¡Interesante! ¿Puedo diseccionar la Fisura?',
      'Retsu Unohana: Primero curaremos a los heridos, Mayuri.',
      'Itachi Uchiha: Aizen domina la ilusión. Cuidado con lo que veis.',
      'Deidara: ¡El arte es una explosión! ¡Hagámosle una exposición a ese traidor!',
      'Konan: Yo me encargaré de que nadie caiga en sus trampas.',
      'Aqua: ¡Yo purifico lo que haga falta! Pero que no me hagan cargar con cosas pesadas...',
      'Fern: Estaré a vuestra espalda si hace falta.',
      'Nel, Tier Harribel, Riruka, Nobara, Choso y Orochimaru se unen en silencio a la expedición.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 3 — El Heraldo de la Traición',
    intro: [
      'En una sala de espejos, Aizen les espera sentado, con una sonrisa tranquila.',
      'Aizen: Qué conmovedor. Un guardián de cadáveres y un puñado de niños. ¿De verdad creéis que podéis detener lo inevitable?',
      'Kisame Hoshigaki: Y yo vengo de regalo.',
      'Rades: No venimos a detener lo inevitable. Venimos a cambiar el final.'
    ],
    heroIds: ['rades_spirito', 'naruto', 'yami'],
    villainIds: ['aizen', 'kisame_hoshigaki'],
    villainBoost: { hp: 1.35, atk: 1.05 },
    victory: [
      'El Primer Sello se rompe con un estallido dorado y vuelve al Reloj.',
      'Aizen: ...Curioso. Nihilux me prometió que nadie sería capaz de vencerme.',
      'Naruto: ¡Uno menos! ¡Y todavía faltan tres!'
    ],
    defeat: [
      'Los espejos se rompen y todo se vuelve oscuro. Aizen ni siquiera se ha levantado.',
      'Aizen: ¿Era esto lo mejor que tenéis?',
      'Rades: No... aún no. Una vez más.'
    ]
  },

  /* ===================== ACTO II — SOMBRAS ===================== */
  {
    type: 'narrative',
    title: 'Acto II — La puerta de las Sombras',
    cast: ['ainz', 'shalltear', 'albedo', 'sadako', 'ibuki_douji', 'orochimaru_f', 'reze', 'zani', 'soukaku',
           'emilou', 'lilith_fate', 'ankha_animalcrossing', 'power', 'punpun', 'isaac'],
    lines: [
      'La segunda puerta da a un cielo morado y a un castillo envuelto en niebla.',
      'Ainz: Un guardián de cadáveres... Qué casualidad. Yo también tengo mis propios súbditos.',
      'Rades: Nos vendría bien un rey de los no-muertos.',
      'Ainz: Un trato justo. Yo me ocupo de los fuertes, tú de los muertos.',
      'Shalltear: Ainz-sama, ¿puedo morder a alguien?',
      'Albedo: Ainz-sama, estoy a su completa disposición.',
      'Sadako: Ya estoy aquí. No hace falta encender la tele.',
      'Ibuki Douji: ¡Sake para todos antes de la batalla!',
      'Reze: Si hay explosiones de por medio, me apunto.',
      'Power: ¡Esto va a ser genial! ¡Voy a pelear con todo el mundo!',
      'Ankha: Si salvamos el multiverso, que me pongan una estatua.',
      'Zani, Soukaku, Emilou, Lilith, Orochimaru, Punpun e Isaac completan el grupo, cada uno a su manera.'
    ]
  },

  {
    type: 'narrative',
    title: 'El eclipse',
    cast: ['belerick', 'zagred', 'liebe', 'nitocris_fate', 'castorice', 'dorothy', 'cz2128', 'w',
           'akuma_nihmane', 'stocking_psg', 'hibiscus'],
    lines: [
      'Entre los árboles muertos aparecen los guardianes del eclipse: gente rota, pero dispuesta a luchar.',
      'Belerick: Soy un escudo. Si hay que protegeros a todos, lo haré.',
      'Castorice: Los muertos y yo nos conocemos bien, Rades. Guárdame un hueco.',
      'Zagred: Dos poderes oscuros en la misma sala... Esto acabará en milagro o en desastre.',
      'Hibiscus: Os daré un respiro si hace falta, pero no me pidáis milagros.',
      'Nitocris, Dorothy, Liebe, Stocking, W, CZ2128 y Akuma Nihmane se preparan para cruzar el bosque.',
      'Entonces, la luna se oscurece del todo y un hombre con una capa de plumas blancas surge del eclipse.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 4 — El Heraldo del Sacrificio',
    intro: [
      'Griffith: Para hacer realidad un sueño hay que pagar un precio. Yo ya pagué el mío... ¿y vosotros?',
      'Ainz: Hmpf. Hablas demasiado.',
      'Rades: Yo guardo los cadáveres de los sueños ajenos. No dejaré que conviertas el nuestro en uno más.'
    ],
    heroIds: ['rades_spirito', 'ainz', 'power'],
    villainIds: ['griffith'],
    villainBoost: { hp: 1.9, atk: 1.15, def: 1.1 },
    victory: [
      'El Segundo Sello se parte con un chasquido y la luna vuelve a brillar.',
      'Griffith: El sueño... se acaba.',
      'Ainz: No cantéis victoria. Faltan dos Sellos.'
    ],
    defeat: [
      'Griffith sonríe con tristeza mientras el eclipse cubre todo.',
      'Griffith: Era un precio demasiado alto para vosotros.',
      'Rades: Aún no estamos acabados. Una vez más.'
    ]
  },

  /* ===================== ACTO III — INSTITUTO ===================== */
  {
    type: 'narrative',
    title: 'Acto III — La puerta del Instituto',
    cast: ['carlos', 'presi', 'calvencio', 'adam', 'guti', 'santi', 'lukraz', 'negro', 'orcasitas',
           'pancha_peluda', 'minion', 'maka_monster', 'maka', 'guijarro', 'senor_holograma', 'paya',
           'joan', 'simon', 'gfamaka'],
    lines: [
      'La tercera puerta da a un instituto, con sus pasillos, sus taquillas y sus problemas de siempre.',
      'Carlos: ¡Buenas tardes, niños! Rades, ¿verdad? Hemos oído que hay un examen final de vida o muerte.',
      'Presi: ¡¡BABUUUUBAAA!!',
      'Santi: ¿Otra guerra? Qué pereza, y eso que acabamos de salir de la anterior.',
      'Lukraz: ¡Eh! ¡Las Bitcoin suben con la Fisura abierta!',
      'Guti: ¡Mi genio maligno dice que ya hemos ganado!',
      'Negro: Ni me he despeinado.',
      'Guijarro: Hay una cita de Heráclito que viene al caso: todo fluye. Menos las notas de Papudo.',
      'Maka Monster: ¡ESA ES! ¡¡PERO BUEEENOOOO!!',
      'Orcasitas, Calvencio, Adam, Joan, Simon, Minion, Paya, la Pancha Peluda, el Señor Holograma y la Novia de Amaka también se apuntan al grupo.',
      'De repente, la puerta del aula se abre de golpe y Papudo entra con aire solemne.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 5 — El Heraldo del Aprobado',
    intro: [
      'Papudo: Roberto es mi nombre en el censo, pero Heraldo del Aprobado en mi currículum.',
      'Carlos: ¡Esta vez no te vas a salir con la tuya, Robert!',
      'Butifarra: Je, hasta una butifarra le ganaría a estos.',
      'Presi: ¡¡BABUUUUBAAA!!'
    ],
    heroIds: ['rades_spirito', 'carlos', 'presi'],
    villainIds: ['papudo', 'dopiko', 'butifarra'],
    villainBoost: { hp: 1.1 },
    victory: [
      'El Tercer Sello se parte en mil pedazos. Papudo cae de rodillas.',
      'Papudo: ¡Me prometió un instituto sin examen de recuperación! ¡MENTIROSO!',
      'Carlos: Roberto... ayúdanos y te dejo ser jefe de estudios.',
      'Papudo: ...Trato hecho.'
    ],
    defeat: [
      'Papudo se ríe con todas sus papadas mientras los profesores celebran.',
      'Papudo: ¡Suspensos para todos!',
      'Carlos: No te rindas, Rades. Te toca reintentarlo.'
    ]
  },

  {
    type: 'narrative',
    title: 'Entre dos puertas',
    cast: ['trump', 'abascal', 'jeffrey_epstein', 'peter'],
    lines: [
      'Antes de la última puerta, el grupo hace un alto en un rincón tranquilo del Nexo.',
      'Un trío de visitantes, Donald Trump, Abascal y Jeffrey Epstein, prefiere observar la escena desde lejos, sin querer meterse en problemas.',
      'Peter Griffin: ¡Jejejeje! ¡Yo no sé qué es la Fisura, pero ese mapa tiene unos dibujos geniales!',
      'Rades: Descansad. Mañana cruzamos la última puerta.'
    ]
  },

  /* ===================== ACTO IV — REINOS ===================== */
  {
    type: 'narrative',
    title: 'Acto IV — La puerta de los Reinos',
    cast: ['helcurt', 'thamuz', 'minotauro', 'guinevere', 'grock', 'estes', 'gloo_ml', 'johnson_ml',
           'owari_azur_lane', 'implacable_azur_lane', 'wakamo_blue_archive', 'mudrock_arknights',
           'dizzy_guilty_gear', 'athena_asamiya_kof', 'crusader_darkest_dungeon', 'hornet', 'tenshi',
           'dyrroth', 'sans', 'Papyrus'],
    lines: [
      'La última puerta da a un reino de torres altas y murallas enormes, lleno de héroes curtidos en mil guerras.',
      'Sans: eh, hola. me han dicho que hay que salvar el multiverso. buah, qué pereza. pero vale.',
      'Papyrus: ¡NYEH HEH HEH! ¡EL GRAN PAPYRUS SE ENCARGARÁ DE ESTA FISURA!',
      'Hornet: Dame un sitio en primera línea. Mi aguja ya está lista.',
      'Grock: Yo muro. Tú pegas.',
      'Mudrock: No necesito tanto trato. Solo díganme a quién golpear.',
      'Owari, Implacable, Wakamo, Dizzy y Athena forman una línea de combate impecable.',
      'Helcurt, Thamuz, Minotauro, Guinevere, Estes, Gloo y Johnson completan la vanguardia, mientras Crusader, Tenshi y Dyrroth guardan las murallas.'
    ]
  },

  {
    type: 'narrative',
    title: 'Refuerzos de todas partes',
    cast: ['ganyu_genshin', 'ellie_omniheroes', 'emily_omniheroes', 'unknown_oni_sorceress', 'akumi_yoclesh',
           'aoki_ruki', 'zentreya_dragon', 'renner_the_golden_princess', 'marciana', 'hsin_wuthering_waves',
           'shiori_novella', 'floryn', 'karin', 'ibuki', 'fediel_granblue_fantasy', 'lucy_kushinada',
           'vermeil', 'gal', 'secre', 'zora', 'atlantis', 'izumi', 'nakiri_ayame'],
    lines: [
      'De las puertas laterales llegan refuerzos de todos los rincones del Nexo.',
      'Ganyu: Reportando: la Fisura ha cerrado tres pasos. Me ofrezco como arquera.',
      'Vermeil: Soy medio demonio y hago lo que me da la gana... como siempre.',
      'Fediel: Mi lanza y yo estamos listas.',
      'Ellie, Emily, Anshurii, Akumi, Aoki Ruki, Zentreya y Renner llegan en formación, sin perder el paso.',
      'Marciana, Hsin, Shiori Novella, Floryn, Karin, Ibuki, Lucy, Galbrena, Secre, Zora, Atlantis, Izumi y Nakiri Ayame ocupan cada rincón de la plaza.',
      'Entonces, el suelo se hiela y Hela cruza la plaza con paso lento.',
      'Hela: Los muertos me pertenecen, Rades. Y tú custodias lo que es mío.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 6 — El Heraldo de la Corona Muerta',
    intro: [
      'Hela: Tu puesto de guardián es un insulto a la muerte.',
      'Rades: La muerte no pertenece a nadie. Es solo un capítulo más.',
      'Thamuz: Y yo soy el capítulo que lo cierra.'
    ],
    heroIds: ['rades_spirito', 'mudrock_arknights', 'hornet'],
    villainIds: ['hela', 'thamuz'],
    villainBoost: { hp: 1.3, atk: 1.05 },
    victory: [
      'El Cuarto y último Sello vuelve al Reloj. Las cuatro puertas se abren en un único pasillo.',
      'Hela: ...Vaya. Así que los muertos también tienen opinión.',
      'Nicktula: ¡Lo hemos conseguido! ¡La puerta del Reloj se ha abierto!'
    ],
    defeat: [
      'Hela alza la mano y la plaza se congela por completo.',
      'Hela: Os lo advertí.',
      'Rades: Todavía no. Una vez más.'
    ]
  },

  /* ===================== FINAL ===================== */
  {
    type: 'narrative',
    title: 'El concierto del fin del mundo',
    cast: ['emu_ootori', 'hatsume', 'spanish_miku', 'brazilian_miku', 'ai_hoshino', 'shylily',
           'nekomata_okayu', 'tokoyami_towa', 'kirara_hoshi', 'yumeko_jabami', 'selena', 'selena_swimsuit',
           'clementine', 'hirara'],
    lines: [
      'Antes de cruzar el último pasillo, Nicktula propone una locura: un concierto.',
      'Nicktula: El Reloj funciona con historias, risas y canciones. Si suena suficiente música, tardará más en pararse.',
      'Hatsune Miku: ¡Yo pongo la voz!',
      'Spanish Miku: ¡Y yo, el taconeo!',
      'Brazilian Miku: ¡Y yo, el ritmo!',
      'Ai Hoshino: Mentiré lo que haga falta para que sea el mejor concierto de sus vidas.',
      'Emu Ootori: ¡WONDERHOY! ¡Sonreíd, que el fin del mundo no tiene por qué ser triste!',
      'Shylily: ¡Chat, aquí hay directo!',
      'Yumeko Jabami: Apuesto a que el Reloj cobra más tiempo del que cree.',
      'Nekomata Okayu, Tokoyami Towa, Kirara Hoshi, Selena, Don Pingo, Clementine y Hirara completan el escenario entre luces y aplausos.',
      'Y mientras la música suena, el Reloj de los Mil Mundos late un poco más fuerte.'
    ]
  },

  {
    type: 'narrative',
    title: 'El Reloj de los Mil Mundos',
    cast: ['nihilux', 'wonderofu', 'typhon', 'rades_spirito'],
    lines: [
      'Al fondo del pasillo, una esfera negra flota sobre un reloj gigante, cuyas agujas se mueven cada vez más despacio.',
      'Nihilux: Habéis llegado lejos. Pero todo reloj se para, todo mundo muere, toda historia termina.',
      'Rades: Lo sé. Llevo toda la vida cuidando de los finales. Pero también sé algo que tú no: lo que muere deja huella.',
      'Nihilux: Entonces os enseñaré lo que es el vacío. Wonder of U, Typhon: ocupaos de ellos.',
      'Detrás de Rades, miles de héroes de todos los mundos dan un paso al frente.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 7 — Los guardianes del Reloj',
    intro: [
      'Wonder of U: Toda desgracia que os ocurra será culpa vuestra por intentarlo.',
      'Typhon: Dejadme probar a los héroes de mil mundos.',
      'Gojo Satoru: Naruto, ¿listo?',
      'Naruto: ¡Más que nunca!'
    ],
    heroIds: ['rades_spirito', 'gojo_satoru', 'naruto'],
    villainIds: ['wonderofu', 'typhon'],
    villainBoost: { hp: 1.3, atk: 1.1 },
    victory: [
      'Los dos guardianes caen y las agujas del Reloj dan un pequeño salto hacia delante.',
      'Wonder of U: ...Qué extraño. Esta vez, la desgracia fue mía.',
      'Nihilux: Qué inútiles. Tendré que encargarme yo.'
    ],
    defeat: [
      'Wonder of U y Typhon sonríen mientras el Reloj se detiene un poco más.',
      'Nicktula: ¡No pares, Rades! ¡El Reloj aún late!'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo final — Nihilux, el Sol Hueco',
    intro: [
      'Nihilux: Vuestros mundos fueron un error. Una simple nota en una canción ya olvidada.',
      'Rades: Entonces recordaremos esa canción entre todos.',
      'Rades alza la mano y, desde el suelo, los cadáveres de mil mundos caídos se levantan para formar una muralla de memoria.',
      'Goku: ¡Esto es increíble! ¡Esto sí que es una pelea!',
      'Saitama: Vale, pero que sea rápida. Se me enfría la cena.'
    ],
    heroIds: ['rades_spirito', 'goku', 'saitama'],
    villainIds: ['nihilux'],
    villainBoost: { hp: 2.4, atk: 1.25, def: 1.3, spd: 1.1 },
    victory: [
      'Nihilux se resquebraja como un cristal mientras la luz del Reloj lo atraviesa.',
      'Nihilux: ¿Por qué...? Yo solo quería que... acabara el dolor...',
      'Rades: El dolor no se borra borrando a los demás, Nihilux. Se comparte.',
      'Las agujas del Reloj de los Mil Mundos vuelven a girar, esta vez con más fuerza que nunca.'
    ],
    defeat: [
      'Nihilux alza la mano y el Reloj se detiene un instante... que parece eterno.',
      'Nicktula: ¡Rades, el Reloj sigue latiendo! ¡Aún queda tiempo!',
      'Rades: Lo sé. Una vez más.'
    ]
  },

  {
    type: 'narrative',
    title: 'Epílogo — Las agujas vuelven a girar',
    cast: ['rades_spirito', 'nicktula', 'carlos', 'papudo', 'saitama', 'goku', 'gojo_satoru', 'ainz',
           'hatsume', 'sans'],
    lines: [
      'El Nexo vuelve a llenarse de luz. Los mundos que estuvieron a punto de borrarse brillan de nuevo en el firmamento.',
      'Nicktula: Lo hemos conseguido. Los archivos del Nexo registrarán esto como la Gran Convergencia.',
      'Papudo: ¿Y mi cargo de jefe de estudios?',
      'Carlos: Roberto, déjalo.',
      'Sans: bueno, ha estado bien. ahora, ¿quién invita a un ketchup?',
      'Rades vuelve a su cementerio. Los cadáveres, por fin, duermen en silencio.',
      'Rades: Gracias a todos. Hasta la próxima convergencia.',
      '— FIN —'
    ]
  }
];


/* =============================================================================
   MOTOR DEL MODO (no hace falta tocar nada de aquí hacia abajo)
   ============================================================================= */
(function () {
  'use strict';

  const PROGRESS_KEY   = 'batalla-convergencia-progress';
  const STORY_MUSIC_CFG = 'batalla-story-music-config';   // volumen / activada (Configuración)
  const COVER          = 'personajes/convergencia.jpg';
  const MUSIC_DIALOGUE = 'historia2/dialogo.mp3';
  const MUSIC_BATTLE   = 'historia2/combate.mp3';
  const CHAPTERS       = HIST2_CHAPTERS;

  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const safeLog = m => { try { if (typeof log === 'function') log(m); } catch (e) { /* ignorar */ } };
  const baseOf = id => (typeof findBaseById === 'function' ? findBaseById(id) : CHARACTERS.find(c => c.id === id));

  function loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function loadProgress() {
    try { const n = parseInt(localStorage.getItem(PROGRESS_KEY), 10); return Number.isFinite(n) && n >= 0 ? n : 0; }
    catch (e) { return 0; }
  }
  function saveProgress(n) {
    // Guarda siempre el capítulo MÁS LEJANO alcanzado.
    try { if (n > loadProgress()) localStorage.setItem(PROGRESS_KEY, String(n)); } catch (e) { /* modo privado */ }
  }
  function resetProgress() { try { localStorage.setItem(PROGRESS_KEY, '0'); } catch (e) { /* ignorar */ } }

  /* ---------------- Música ---------------- */
  const audio = new Audio();
  audio.loop = true;
  let curSrc = '';

  function musicSettings() {
    const s = loadJSON(STORY_MUSIC_CFG, {});
    return {
      volume: typeof s.volume === 'number' ? Math.min(1, Math.max(0, s.volume)) : 0.5,
      enabled: typeof s.enabled === 'boolean' ? s.enabled : true
    };
  }
  function stopMusic() {
    audio.pause();
    try { audio.currentTime = 0; } catch (e) { /* ignorar */ }
    curSrc = '';
  }
  function playMusic(src) {
    if (window.stopAllStoryMusic) window.stopAllStoryMusic();
    const cfg = musicSettings();
    if (!cfg.enabled || !src) { stopMusic(); return; }
    if (curSrc === src && !audio.paused) return;
    curSrc = src;
    audio.volume = cfg.volume;
    audio.setAttribute('src', src);
    audio.load();
    audio.play().catch(() => { /* falta el archivo o el navegador lo bloquea */ });
  }

  /* ---------------- Estado del modo ---------------- */
  const H = { active: false, index: 0 };

  /* ---------------- Utilidades de render ---------------- */
  function formatLines(lines) {
    return (lines || []).map(line => {
      const m = /^([^:.!?¿¡]{1,28}):\s+(.+)$/.exec(line);
      if (m) {
        return `<div class="story-line story-line--speech">
                  <span class="story-line-speaker">${esc(m[1])}</span>
                  <p class="story-line-text">${esc(m[2])}</p>
                </div>`;
      }
      return `<p class="story-line story-line--narration">${esc(line)}</p>`;
    }).join('');
  }

  function progressHTML(index, badge) {
    const total = CHAPTERS.length;
    const pct = total ? Math.round(((index + 1) / total) * 100) : 0;
    return `<div class="story-progress">
      <div class="story-progress-top">
        <span class="story-type-badge">${badge}</span>
        <span class="story-progress-label">Escena ${index + 1} / ${total}</span>
      </div>
      <div class="story-progress-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }

  function chipsHTML(ids) {
    return (ids || []).map(id => {
      const b = baseOf(id);
      if (!b) { console.warn('[historia2] personaje no encontrado:', id); return ''; }
      return `<div class="story-chip"><img src="${esc(b.img)}" alt="" onerror="this.style.display='none'"><span>${esc(b.name)}</span></div>`;
    }).join('');
  }

  const body = () => byId('h2-body');

  /* ---------------- Vistas ---------------- */
  function renderStart() {
    const furthest = loadProgress();
    const canContinue = furthest > 0 && furthest < CHAPTERS.length;
    body().innerHTML = `
      <div class="story-narrative story-fade">
        <span class="story-type-badge">🌌 Historia 2</span>
        <h3>${esc(HIST2_TITLE)}</h3>
        <p class="story-line story-line--narration">Un guardián de cadáveres, cuatro Sellos y un Sol Hueco que quiere borrar todos los mundos. En esta historia aparecen los ${CHARACTERS.length} personajes del juego.</p>
        ${canContinue ? `<p class="story-line story-line--narration">Tienes progreso guardado: escena ${furthest + 1} de ${CHAPTERS.length}.</p>` : ''}
        <div class="story-actions">
          ${canContinue
            ? `<button id="h2-continue" class="class-btn story-btn-primary">▶ Continuar</button>
               <button id="h2-restart" class="class-btn">⟲ Empezar de nuevo</button>
               <button id="h2-chapters" class="class-btn">📜 Elegir escena</button>`
            : `<button id="h2-restart" class="class-btn story-btn-primary">▶ Empezar</button>`}
        </div>
      </div>`;
    const on = (id, fn) => { const el = byId(id); if (el) el.addEventListener('click', fn); };
    on('h2-continue', () => { H.index = furthest; renderChapter(); });
    on('h2-restart', () => { resetProgress(); H.index = 0; renderChapter(); });
    on('h2-chapters', renderChapterList);
  }

  function renderChapterList() {
    const furthest = loadProgress();
    const items = CHAPTERS.map((c, i) => i <= furthest
      ? `<button class="class-btn h2-ch" data-i="${i}">${c.type === 'battle' ? '⚔' : '📖'} ${i + 1}. ${esc(c.title)}</button>`
      : '').join('');
    body().innerHTML = `
      <div class="story-narrative story-fade">
        <span class="story-type-badge">📜 Escenas desbloqueadas</span>
        <h3>${esc(HIST2_TITLE)}</h3>
        <div class="h2-list">${items}</div>
        <div class="story-actions"><button id="h2-back" class="class-btn">◀ Volver</button></div>
      </div>`;
    byId('h2-back').addEventListener('click', renderStart);
    body().querySelectorAll('.h2-ch').forEach(el =>
      el.addEventListener('click', () => { H.index = Number(el.dataset.i); renderChapter(); }));
  }

  function renderChapter() {
    const ch = CHAPTERS[H.index];
    playMusic(MUSIC_DIALOGUE);

    if (!ch) {
      body().innerHTML = `
        <div class="story-narrative story-fade">
          <span class="story-type-badge">🌌 Fin de la historia</span>
          <h3>${esc(HIST2_TITLE)}</h3>
          <p class="story-line story-line--narration">¡Historia completada! Gracias por jugar.</p>
          <div class="story-actions"><button id="h2-menu" class="class-btn story-btn-primary">Volver al inicio</button></div>
        </div>`;
      byId('h2-menu').addEventListener('click', renderStart);
      return;
    }

    saveProgress(H.index);

    if (ch.type === 'narrative') {
      body().innerHTML = `
        <div class="story-narrative story-fade">
          ${progressHTML(H.index, '📖 Narración')}
          <h3>${esc(ch.title)}</h3>
          ${ch.cast && ch.cast.length ? `<div class="story-vs-label">En esta escena</div><div class="story-vs-chips h2-cast">${chipsHTML(ch.cast)}</div>` : ''}
          ${formatLines(ch.lines)}
          <div class="story-actions"><button id="h2-next" class="class-btn story-btn-primary">Continuar ▶</button></div>
        </div>`;
      byId('h2-next').addEventListener('click', () => { H.index += 1; renderChapter(); });
      return;
    }

    if (ch.type === 'battle') {
      body().innerHTML = `
        <div class="story-narrative story-fade">
          ${progressHTML(H.index, '⚔ Combate')}
          <h3>${esc(ch.title)}</h3>
          ${formatLines(ch.intro)}
          <div class="story-vs">
            <div class="story-vs-side"><div class="story-vs-label">Tu equipo</div><div class="story-vs-chips">${chipsHTML(ch.heroIds)}</div></div>
            <div class="story-vs-versus">VS</div>
            <div class="story-vs-side"><div class="story-vs-label">Rivales</div><div class="story-vs-chips">${chipsHTML(ch.villainIds)}</div></div>
          </div>
          <div class="story-actions"><button id="h2-fight" class="class-btn story-btn-primary">Empezar combate ⚔</button></div>
        </div>`;
      byId('h2-fight').addEventListener('click', () => startBattleChapter(ch));
    }
  }

  /* ---------------- Combate ---------------- */
  function buildTeam(ids, boost) {
    return ids.map(id => {
      const b = baseOf(id);
      if (!b) { console.warn('[historia2] personaje no encontrado:', id); return null; }
      const c = cloneCharacter(b);
      if (boost) {
        if (boost.hp)  { c.maxHp = Math.round(c.maxHp * boost.hp); c.hp = c.maxHp; }
        if (boost.atk) c.atk = Math.round(c.atk * boost.atk);
        if (boost.def) c.def = Math.round(c.def * boost.def);
        if (boost.spd) c.spd = Math.round(c.spd * boost.spd);
      }
      return c;
    }).filter(Boolean);
  }

  function startBattleChapter(ch) {
    const heroes = buildTeam(ch.heroIds);
    const villains = buildTeam(ch.villainIds, ch.villainBoost);
    if (!heroes.length || !villains.length) { alert('No se pudo preparar este combate: revisa los ids en historia2.js.'); return; }

    H.active = true;

    state.mode = 'pve';
    window.GAME_MODE = 'pve';
    state.bansEnabled = false;
    state.storyMode = true;          // reutiliza el flujo de combate scriptado de game.js
    state.challengeMode = false;
    state.moveLock = false;
    state.teams.p1 = heroes;
    state.teams.p2 = villains;
    state.activeIndex.p1 = 0;
    state.activeIndex.p2 = 0;

    byId('hist2-screen').style.display = 'none';
    byId('game-root').style.display = 'block';
    byId('p2-title').innerText = villains.length > 1 ? 'Rivales de la historia' : 'Rival de la historia';
    byId('enemy-label').innerText = 'Rival';
    const banner = byId('banned-banner');
    if (banner) banner.style.display = 'none';
    const hell = byId('hell-banner');            // por si el Infierno dejó su cartel
    if (hell) hell.style.display = 'none';
    const logEl = byId('log');
    if (logEl) logEl.innerHTML = '';
    const surrender = byId('story-surrender-btn');
    if (surrender) surrender.style.display = 'inline-block';

    playMusic(MUSIC_BATTLE);

    state.phase = 'battle';
    startBattle();
    safeLog(`🌌 ${esc(ch.title)}`);
    if (ch.villainBoost) safeLog('⚠️ Los rivales están reforzados por la Fisura.');
  }

  function onBattleEnd(result) {
    const ch = CHAPTERS[H.index];
    H.active = false;
    state.storyMode = false;
    state.moveLock = false;
    byId('game-root').style.display = 'none';
    const surrender = byId('story-surrender-btn');
    if (surrender) surrender.style.display = 'none';
    byId('hist2-screen').style.display = 'flex';
    playMusic(MUSIC_DIALOGUE);

    const won = result === 'win';
    body().innerHTML = `
      <div class="story-narrative story-fade">
        ${progressHTML(H.index, won ? '✅ Victoria' : '💀 Derrota')}
        <h3>${won ? '✅ Victoria' : '💀 Derrota'}</h3>
        ${formatLines(won ? ch.victory : ch.defeat)}
        <div class="story-actions">
          ${won
            ? '<button id="h2-after" class="class-btn story-btn-primary">Continuar ▶</button>'
            : '<button id="h2-after" class="class-btn story-btn-primary">Reintentar combate ⚔</button>'}
        </div>
      </div>`;
    byId('h2-after').addEventListener('click', () => {
      if (won) { H.index += 1; renderChapter(); }
      else startBattleChapter(ch);
    });
  }

  let hooked = false;
  function installHooks() {
    if (hooked) return;
    hooked = true;
    // Encadena con lo que hubiera antes (historia original, Desafío, Infierno).
    const _end = window.onStoryBattleEnd;
    window.onStoryBattleEnd = function (result) {
      if (H.active) return onBattleEnd(result);
      return typeof _end === 'function' ? _end.apply(this, arguments) : undefined;
    };
  }

  /* ---------------- Interfaz ---------------- */
  function injectStyles() {
    if (byId('hist2-styles')) return;
    const st = document.createElement('style');
    st.id = 'hist2-styles';
    st.textContent = `
    .menu-col{display:flex;flex-direction:column;gap:22px;flex:0 1 300px;width:min(300px,100%)}
    .menu-col > .story-poster-panel{flex:0 0 auto;width:100%}
    @media (max-width:900px){.menu-col{flex:0 1 auto;width:min(420px,100%)}}
    .h2-poster-panel{border-color:rgba(56,189,248,.5)!important;
      background:radial-gradient(circle at 50% 0%,rgba(56,189,248,.20),transparent 50%),linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.014)),#08121f!important;
      box-shadow:0 26px 64px rgba(0,0,0,.5),0 0 44px rgba(56,189,248,.16)!important}
    .h2-poster-panel:hover{box-shadow:0 30px 78px rgba(0,0,0,.58),0 0 60px rgba(56,189,248,.3)!important}
    .h2-poster-panel .story-poster-subtitle{color:#7dd3fc!important}
    .h2-poster-panel .story-poster-cta{background:linear-gradient(180deg,rgba(56,189,248,.96),rgba(3,105,161,.94))!important;color:#fff!important}
    .h2-poster-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:150px;font-size:64px;border-radius:18px;background:linear-gradient(180deg,#0c4a6e,#07101c)}
    #hist2-screen{position:fixed;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow:auto;z-index:122;
      background:radial-gradient(circle at 15% 0%,rgba(56,189,248,.14),transparent 34%),radial-gradient(circle at 85% 10%,rgba(139,92,246,.16),transparent 36%),linear-gradient(180deg,#040712 0%,#071124 55%,#050a16 100%)}
    #hist2-screen .story-card{border-color:rgba(56,189,248,.28)}
    #hist2-screen .story-card::before{background:linear-gradient(90deg,rgba(56,189,248,.9),rgba(139,92,246,.6),rgba(251,191,36,.7))}
    .h2-cast{margin-bottom:14px}
    .h2-list{display:grid;gap:8px;margin:14px 0}
    .h2-list .h2-ch{text-align:left}`;
    document.head.appendChild(st);
  }

  function injectMarkup() {
    if (!byId('hist2-screen')) {
      const screen = document.createElement('div');
      screen.id = 'hist2-screen';
      screen.style.display = 'none';
      screen.innerHTML = `
        <div class="story-card">
          <div class="story-head">
            <div class="story-head-title">🌌 ${esc(HIST2_TITLE)}</div>
            <button id="h2-exit" class="class-btn">⬅ Volver al menú</button>
          </div>
          <div id="h2-body"></div>
        </div>`;
      document.body.appendChild(screen);
      byId('h2-exit').addEventListener('click', closeScreen);
    }

    if (!byId('menu-historia2')) {
      const layout = document.querySelector('#main-menu .menu-layout');
      const story = byId('menu-story');
      if (!layout) return;

      let col = story && story.parentElement && story.parentElement.classList.contains('menu-col') ? story.parentElement : null;
      if (!col && story) {
        col = document.createElement('div');
        col.className = 'menu-col';
        story.parentNode.insertBefore(col, story);
        col.appendChild(story);
      }

      const btn = document.createElement('button');
      btn.id = 'menu-historia2';
      btn.className = 'story-poster-panel h2-poster-panel';
      btn.innerHTML = `
        <div class="story-poster-frame"><img src="${COVER}" alt="${esc(HIST2_TITLE)}"></div>
        <span class="story-poster-title">🌌 Modo Historia 2</span>
        <span class="story-poster-subtitle">${esc(HIST2_TITLE)}</span>
        <span class="story-poster-cta">▶ Jugar</span>`;
      const img = btn.querySelector('img');
      img.addEventListener('error', () => {
        const fb = document.createElement('div');
        fb.className = 'h2-poster-fallback';
        fb.textContent = '🌌';
        img.replaceWith(fb);
      }, { once: true });
      (col || layout).appendChild(btn);
      btn.addEventListener('click', openScreen);
    }
  }

  function openScreen() {
    byId('main-menu').style.display = 'none';
    byId('hist2-screen').style.display = 'flex';
    playMusic(MUSIC_DIALOGUE);
    renderStart();
  }

  function closeScreen() {
    byId('hist2-screen').style.display = 'none';
    byId('main-menu').style.display = 'flex';
    stopMusic();
    if (window.stopAllStoryMusic) window.stopAllStoryMusic();
  }

  function init() {
    injectStyles();
    injectMarkup();
    installHooks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // API mínima para depurar desde la consola del navegador
  window.HISTORIA2 = { open: openScreen, chapters: CHAPTERS, loadProgress, resetProgress };
})();
