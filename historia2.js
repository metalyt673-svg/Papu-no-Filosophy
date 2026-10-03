/* historia2.js — Modo Historia 2: "La Convergencia de los Mil Mundos"
   ---------------------------------------------------------------------------
   Una historia nueva e independiente en la que aparecen los 171 personajes
   de personajes.js. Protagonista: Rades Spirito, guardián del Cementerio de
   Mundos.

     PARTE I  — Los Cuatro Sellos: Rades y miles de héroes rompen cuatro Sellos
                para llegar hasta Nihilux, el Sol Hueco, que apaga los mundos.
     PARTE II — El Linaje Infernal: un arco de demonios, más lento y detenido.
                Seis actos de descenso por el Averno hasta Azmodrel, el Rey
                Carmesí, que se alimenta de mundos.

   Se carga en juego.html DESPUÉS de game.js (y de desafio.js, si lo usas):
       <script src="historia2.js" defer></script>

   No modifica game.js, personajes.js ni historia.js. Añade su propio botón en
   el menú principal, debajo del Modo Historia original.

   EDITAR LA HISTORIA: todo está en HIST2_CHAPTERS (más abajo).
     - type 'narrative': title, cast (ids que aparecen en la escena), lines.
                         Las escenas largas se leen por páginas de 6 líneas.
     - type 'battle'   : title, intro, heroIds (máx. 3), villainIds (máx. 3),
                         victory, defeat, villainBoost (multiplicadores
                         opcionales { hp, atk, def, spd } para los rivales).
     - part / partTitle: solo en la PRIMERA escena de cada parte.
     - act             : solo en la PRIMERA escena de cada acto (se propaga).
     Las líneas con formato "Nombre: texto" se muestran como diálogo.
     Ganar avanza la historia; perder o rendirse obliga a reintentar.
     Evita poner dos puntos al principio de una línea narrada (se leería
     como diálogo) y no uses el apóstrofo recto dentro de los textos.

   PERSONAJES PROPIOS: HIST2_ONLY_CHARACTERS (Azmodrel y su segunda forma).
   Solo existen en este modo; no salen en el glosario ni en otros modos.

   MÚSICA (opcional), carpeta  historia2/  junto a juego.html:
       historia2/dialogo.mp3   → mientras se lee la historia
       historia2/combate.mp3   → durante los combates
       historia2/combate2.mp3  → combates de la Parte II (si falta, usa combate.mp3)
   Si faltan los archivos, simplemente no suena nada. El volumen y la opción
   "música activada" se toman de la Configuración del juego.
   Portada opcional: personajes/convergencia.jpg
   Retratos opcionales: personajes/azmodrel.jpg y personajes/azmodrel2.jpg

   PROGRESO: se guarda en  batalla-convergencia-progress-v2  (la historia se
   amplió, así que el progreso de la versión anterior no se reutiliza).
   ------------------------------------------------------------------------- */

const HIST2_TITLE = 'La Convergencia de los Mil Mundos';

/* ---------------------------------------------------------------------------
   PERSONAJES EXCLUSIVOS DE ESTA HISTORIA (mismo formato que personajes.js)
   --------------------------------------------------------------------------- */
const HIST2_ONLY_CHARACTERS = [
  {
    id: 'azmodrel',
    name: 'Azmodrel, el Rey Carmesí',
    img: 'personajes/azmodrel.jpg',
    classes: ['mago', 'control'],
    hp: 320, atk: 30, def: 20, spd: 19,
    moves: [
      { id: 'azm1', name: 'Garra de Brasa', power: 24, acc: 0.97, baseCooldown: 0, type: 'attack',
        desc: 'Un zarpazo al rojo vivo que puede dejar al objetivo ardiendo.',
        effects: [{ type: 'damageOverTime', status: 'burn', value: 6, duration: 2, prob: 0.5 }] },
      { id: 'azm2', name: 'Pacto de Sangre', power: 0, acc: 1, baseCooldown: 3, type: 'support',
        desc: 'Sella un contrato consigo mismo: gana escudo y ataque.',
        effects: [{ type: 'shield', value: 40 }, { type: 'tempAtk', value: 8, duration: 2 }] },
      { id: 'azm3', name: 'Cadenas del Banquete', power: 20, acc: 0.95, baseCooldown: 2, type: 'attack',
        desc: 'Cadenas candentes que quiebran la defensa del objetivo y pueden ralentizarlo.',
        effects: [{ type: 'debuff', stat: 'def', value: 8, duration: 2, prob: 1.0 },
                  { type: 'slow', value: 20, duration: 2, prob: 0.6 }] },
      { id: 'azm4', name: 'Llamarada del Trono', power: 40, acc: 0.9, baseCooldown: 4, type: 'attack',
        desc: 'Un chorro de fuego del trono que puede aturdir al objetivo.',
        effects: [{ type: 'stun', prob: 0.25, duration: 1 }] }
    ]
  },
  {
    id: 'azmodrel2',
    name: 'Azmodrel, la Corona Hambrienta',
    img: 'personajes/azmodrel2.jpg',
    classes: ['mago', 'control'],
    hp: 240, atk: 30, def: 20, spd: 20,
    moves: [
      { id: 'azn1', name: 'Mordisco del Hambre', power: 28, acc: 0.97, baseCooldown: 0, type: 'attack',
        desc: 'Un mordisco voraz que le devuelve parte de la vida.',
        effects: [{ type: 'lifesteal', value: 12 }] },
      { id: 'azn2', name: 'Banquete de Mundos', power: 0, acc: 1, baseCooldown: 4, type: 'support',
        desc: 'Se alimenta de los mundos que ha devorado: gana escudo y ataque.',
        effects: [{ type: 'shield', value: 45 }, { type: 'tempAtk', value: 10, duration: 3 }] },
      { id: 'azn3', name: 'Lluvia de Ceniza', power: 26, acc: 0.95, baseCooldown: 2, type: 'attack',
        desc: 'Ceniza ardiente que quiebra la defensa y quema al objetivo.',
        effects: [{ type: 'debuff', stat: 'def', value: 8, duration: 2, prob: 1.0 },
                  { type: 'damageOverTime', status: 'burn', value: 7, duration: 2, prob: 0.7 }] },
      { id: 'azn4', name: 'ULTI: Corona Hambrienta', power: 42, acc: 0.88, baseCooldown: 5, type: 'attack',
        desc: 'La corona de huesos gira y arrasa con todo. Puede aturdir al objetivo.',
        effects: [{ type: 'stun', prob: 0.3, duration: 1 }] }
    ]
  }
];

const HIST2_CHAPTERS = [

  /* ===================== PARTE I · PRÓLOGO ===================== */
  {
    type: 'narrative',
    part: 1, partTitle: 'Parte I — Los Cuatro Sellos',
    act: 'Prólogo — El mundo antes del fin',
    title: 'Prólogo I — Antes del primer latido',
    cast: ['nicktula'],
    lines: [
      'Antes de que existieran los mundos, existía el Reloj. Nadie lo construyó y nadie recuerda quién le dio cuerda por primera vez. Solo se sabe que, cada vez que sus agujas avanzan, nace un mundo nuevo.',
      'Así nacieron mil universos distintos: uno con ninjas, otro con espadas de almas, otro con un instituto lleno de filósofos y profesores demasiado serios. Cada mundo es un latido del Reloj, y cada latido es irrepetible.',
      'En el centro de todos ellos está el Nexo: un enorme mercado flotante donde los caminos de los mil mundos se cruzan. Allí conviven héroes, villanos, estudiantes, vagabundos, vtubers y toda clase de criaturas, porque en el Nexo no se pregunta de dónde vienes, solo qué traes para vender.',
      'Los archivistas del Nexo se encargan de anotarlo todo. Uno de ellos, un joven muy hablador llamado Nicktula, lleva años dejando por escrito cada nacimiento, cada visita y cada pelea de taberna.',
      'Nicktula: Siempre digo lo mismo a los recién llegados: un mundo no desaparece cuando muere. Se queda quieto, se enfría y viaja hasta el borde del Nexo. Allí acaba en el Cementerio de Mundos.',
      'Pero hace unos meses, algo empezó a ir mal. Los relojes de algunos mundos empezaron a detenerse sin motivo. Primero uno, luego tres, luego decenas. Los mundos no morían de forma natural: se apagaban de golpe, como una vela entre dos dedos.',
      'Los archivistas buscaron al culpable durante semanas. Lo único que encontraron fue un nombre, repetido por los últimos supervivientes de cada mundo caído.',
      'Nicktula: Nihilux. El Sol Hueco. Nadie sabe de dónde salió ni qué quiere, solo que allí donde pasa, el tiempo se detiene.',
      'Y así, mientras el Nexo se llenaba de refugiados sin hogar, solo una persona seguía trabajando como si nada: el guardián del Cementerio.'
    ]
  },

  {
    type: 'narrative',
    title: 'Prólogo II — El guardián de los finales',
    cast: ['rades_spirito', 'David'],
    lines: [
      'En el borde del Nexo, el aire huele a tierra húmeda y a campanas viejas. Entre lápidas torcidas y farolillos apagados, un hombre sin prisas riega unas flores que casi nunca florecen.',
      'Se llama Rades Spirito y hace tanto tiempo que cuida del Cementerio que ya no recuerda cuándo empezó. Los visitantes lo confunden con un enterrador. No lo es. Es el guardián de los finales.',
      'Rades: Buenos días, Carl. ¿Has dormido bien? Vaya, qué pregunta tan tonta.',
      'Detrás de él, un esqueleto con un escudo de magia asiente despacio. Es Carl, el Cadáver Nº1. A su lado están Doña Eulalia, el Nº2, que siempre tiene algo que opinar, David, el Nº3, que habla demasiado para estar muerto, y Jimmy, el Nº4, que sigue preocupado por no haber podido despedirse de su familia.',
      'David: Rades, ¿puedo preguntarte una cosa? ¿Por qué no nos dejas descansar de verdad?',
      'Rades: Porque descansar es olvidar, David. Y mientras yo os recuerde, vosotros seguiréis aquí.',
      'Rades no siempre fue guardián. Hace muchísimo tiempo fue enterrador en un mundo que se apagó, y fue el último en abandonarlo. Antes de que las luces se fueran, prometió algo en voz alta: recordaría el nombre de cada uno de los muertos.',
      'Desde ese día, los difuntos le obedecen como a un hermano mayor, y el Cementerio se convirtió en su hogar. En él cabe lo que ningún otro lugar quiso guardar: los restos de mundos enteros.',
      'Rades: Nadie viene a vernos, pero no pasa nada. Aquí se está tranquilo.',
      'Esa noche, por primera vez en mucho tiempo, las lápidas empezaron a temblar.'
    ]
  },

  {
    type: 'narrative',
    title: 'Prólogo III — La noche en que el Reloj tembló',
    cast: ['rades_spirito', 'nicktula'],
    lines: [
      'Los cadáveres se levantaron sin que nadie se lo ordenara. No atacaban, no gritaban: simplemente susurraban todos a la vez, con una voz que parecía venir de muy lejos.',
      'Cadáveres: Nihilux... Nihilux... Nihilux...',
      'Rades: Calma, calma. ¿Qué os pasa? ¡Jimmy, suelta esa lápida!',
      'Una linterna se acercó rebotando entre las tumbas. Era Nicktula, sin aliento y con tres libros bajo el brazo.',
      'Nicktula: ¡Rades! ¡Menos mal que te encuentro! Tengo una noticia buena y una mala.',
      'Rades: Empieza por la buena.',
      'Nicktula: No hay buena. El Reloj de los Mil Mundos se está parando. Y quien lo está parando es Nihilux, el Sol Hueco.',
      'Nicktula: Lo he investigado durante semanas. Nihilux no puede ser derrotado desde fuera, porque el Reloj lo protege. Pero la puerta que lleva hasta el Reloj está cerrada con cuatro Sellos, y cada Sello está custodiado por un Heraldo.',
      'Rades: ¿Y qué tengo que ver yo con todo eso? Soy un guardián de cadáveres.',
      'Nicktula: Todo. Los mundos que Nihilux apaga acaban en tu Cementerio. Eres el único que sabe cómo suenan sus restos... y el único que puede abrir una Fisura sin enfermar de frío.',
      'Rades miró a Carl, a Doña Eulalia, a David y a Jimmy. Ninguno dijo nada, pero los cuatro asintieron a la vez.',
      'Rades: Los muertos no necesitan héroes, Nicktula.',
      'Nicktula: Lo sé. Los vivos sí.',
      'Rades suspiró, dejó la regadera junto a una lápida y se echó la capa al hombro.',
      'Rades: Está bien. Pero que quede claro: si me manchan el Cementerio, la factura es tuya.'
    ]
  },

  {
    type: 'narrative',
    title: 'Prólogo IV — El Consejo del Nexo',
    cast: ['nicktula', 'rades_spirito', 'l', 'urahara', 'carlos'],
    lines: [
      'El Consejo se reunió esa misma noche en una taberna sin nombre, donde nadie hace preguntas. Allí esperaban tres de las mentes más brillantes de los mil mundos.',
      'L: Voy a ser directo. Según mis cálculos, hay un 97% de probabilidad de que cada Heraldo pertenezca a un mundo distinto, y un 100% de que ninguno querrá hablar.',
      'Kisuke Urahara: Yo he traído una brújula hecha con un trozo del Reloj. Señala los cuatro Sellos como si fueran faros. Con ella podemos saber a qué puerta toca ir.',
      'Carlos: Y yo traigo estudiantes. Pueden ser un desastre, pero nunca se rinden. Rades, aquí tienes a un profesor de filosofía que cree que todo se puede arreglar hablando.',
      'Nicktula: Un último detalle. En los archivos he encontrado algo extraño. Todos los mundos que Nihilux apagó llevaban una marca carmesí en su reloj. Una grieta roja, muy fina.',
      'L: No lo menciones fuera de esta sala. Todavía no sabemos qué significa.',
      'Urahara: O, para ser exactos, sí lo sabemos, pero no queremos decirlo en voz alta.',
      'Rades escuchó el plan en silencio: cuatro puertas, cuatro Sellos, cuatro Heraldos. Y al final, un Reloj, un Sol Hueco y la última oportunidad de salvar a mil mundos.',
      'Rades: Entonces empecemos. Reunid a todos los que estén dispuestos a luchar.',
      'Esa misma noche, el Nexo empezó a llenarse de voluntarios.'
    ]
  },

  {
    type: 'battle',
    act: 'Preludio — Las primeras señales',
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
      'Una voz hueca susurra «Todo termina».',
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
    act: 'Acto I — El Cielo Abierto',
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
    act: 'Acto II — Las Sombras',
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
    act: 'Acto III — El Instituto',
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
    act: 'Acto IV — Los Reinos',
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
    act: 'Final — El Reloj de los Mil Mundos',
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
    title: 'Capítulo 8 — Nihilux, el Sol Hueco',
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

  /* ===================== FIN DE LA PARTE I ===================== */
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
      'Rades: Gracias a todos. Hasta la próxima convergencia.'
    ]
  },

  {
    type: 'narrative',
    title: 'Fin de la Parte I — La grieta roja',
    cast: ['rades_spirito', 'nicktula'],
    lines: [
      'Esa noche, mientras el Nexo celebraba, Rades no pudo dormir. Se sentó junto a la tumba de Carl y miró hacia el cielo, donde el Reloj de los Mil Mundos seguía latiendo.',
      'Nicktula: ¿Tampoco puedes dormir?',
      'Rades: Hay algo que no encaja. Nihilux no parecía odiarnos. Parecía... cansada.',
      'Nicktula: Todos los villanos tienen una historia triste. No le des más vueltas.',
      'Rades: Tal vez. Pero hay una cosa que no me suena, Nicktula. Mira el cristal del Reloj.',
      'Nicktula levantó la vista y se quedó sin palabras. Allí, a lo lejos, una grieta carmesí muy fina recorría el cristal del Reloj de los Mil Mundos.',
      'Nicktula: Es la misma marca que había en los mundos apagados. Pero esta vez... se está abriendo.',
      'Bajo sus pies, la tierra del Cementerio se calentó de pronto. Los cadáveres, todos a la vez, volvieron a susurrar, pero esta vez no era Nihilux a quien nombraban.',
      'Cadáveres: Azmodrel... Azmodrel... Azmodrel...',
      '— FIN DE LA PARTE I —'
    ]
  },

  /* ===================== PARTE II · EL LINAJE INFERNAL ===================== */
  {
    type: 'narrative',
    part: 2, partTitle: 'Parte II — El Linaje Infernal',
    act: 'Preludio — La calma aparente',
    title: 'Segunda Parte — El Linaje Infernal',
    cast: ['rades_spirito'],
    lines: [
      'El Sol Hueco cayó, los cuatro Sellos se rompieron y las agujas del Reloj de los Mil Mundos volvieron a girar. Por un tiempo, todo fue paz.',
      'Pero hay finales que no cierran una historia, sino que abren otra. Bajo el Nexo, más abajo que el Cementerio, más abajo que el último mundo muerto, algo había estado esperando.',
      'Esta es la historia de lo que Nihilux intentaba detener, de lo que los héroes de mil mundos descubrieron demasiado tarde... y de un descenso lento y cuidadoso por el reino de los demonios.'
    ]
  },

  {
    type: 'narrative',
    title: 'Tres semanas después',
    cast: ['papudo', 'carlos', 'presi', 'guti', 'santi', 'lukraz', 'negro', 'maka', 'nicktula',
           'fernando_alonso', 'antonio'],
    lines: [
      'Tres semanas después de la Gran Convergencia, el Nexo estaba irreconocible. Los puestos se habían reconstruido, los mundos salvados enviaban regalos y alguien había colgado una pancarta enorme que decía: «GRACIAS, HÉROES».',
      'Papudo: Como jefe de estudios del Nexo, he decidido instaurar una norma nueva. ¡Los exámenes de recuperación serán obligatorios para todos!',
      'Carlos: Roberto, no eres jefe de estudios de nada. Te lo dije para que dejaras de gritar.',
      'Presi: ¡¡BABUUUUBAAA!!',
      'Guti: Mi genio maligno dice que hoy hay buena comida, un buen cielo y ningún apocalipsis. Voy a aprovecharlo.',
      'Santi: Yo voy a dormir una semana. Despertadme solo si hay churros.',
      'Lukraz: ¡Eh! ¡Las Bitcoin han subido el doble desde que se cerró la Fisura!',
      'Fernando Alonso: ¡Y Alonso toma la última curva del mercado con determinación, señoras y señores!',
      'Antonio Lobato: ¡Qué manera de gestionar la reconstrucción, qué manera!',
      'Maka: ¡ESA ES! ¡¡PERO BUEEENOOOO!!',
      'Era un día tranquilo, de esos que se recuerdan con cariño. Pero Nicktula, que llevaba unos días revisando los archivos, tenía el ceño fruncido.',
      'Nicktula: ¿Alguien más ha notado que hace mucho calor?',
      'Negro: Es verano, Nicktula.',
      'Nicktula: No hay veranos en el Nexo, Negro. Nunca los ha habido.',
      'Nadie le hizo demasiado caso. Pero en un puesto de fruta, una manzana empezó a ennegrecerse sola.'
    ]
  },

  {
    type: 'narrative',
    title: 'La mesa de los muertos',
    cast: ['rades_spirito', 'David', 'hela', 'castorice'],
    lines: [
      'Mientras el Nexo celebraba, el Cementerio seguía inquieto. Los cadáveres de Rades no dormían y la tierra estaba cada día más caliente.',
      'David: Rades, no quiero preocuparte, pero Jimmy lleva tres noches contando lápidas y sigue contando mal.',
      'Rades: Jimmy siempre cuenta mal.',
      'David: Sí, pero esta vez es distinto. No se equivoca de número. Se equivoca de nombre.',
      'Una figura alta y pálida cruzó la verja del Cementerio. Rades la reconoció al instante: era Hela, la reina de los muertos, con una corona de espinas y la mirada de quien no está acostumbrada a pedir ayuda.',
      'Hela: No vengo a luchar, guardián. Vengo a hablar.',
      'Rades: Pasa. Hay té frío. Ya está frío de por sí.',
      'Hela: Faltan almas en mi reino. Desde hace semanas, cientos de muertos desaparecen sin dejar rastro. No las he perdido: las están sacando por debajo.',
      'Castorice: ¿Por debajo? Ningún muerto puede cruzar ese umbral sin permiso de la muerte.',
      'Hela: Ese es el problema. Alguien tiene un permiso más fuerte que el mío. Y no me gusta nada.',
      'Rades miró a su pequeña familia de cadáveres y luego volvió a mirar a Hela.',
      'Rades: Hela, te derroté hace poco. No estoy seguro de que quieras mi ayuda.',
      'Hela: Por eso mismo. Eres el único mortal que me ha tratado como una igual.'
    ]
  },

  {
    type: 'narrative',
    title: 'Diablillos en el mercado',
    cast: ['shrek', 'ladybug', 'fernando_alonso', 'padrinos', 'nobita', 'caillou', 'mago_electrico', 'kevin'],
    lines: [
      'Fue un martes cualquiera, en el momento más tranquilo del día, cuando el mercado se llenó de un olor a azufre. Una manzana, luego otra, luego un puesto entero se pudrió de golpe.',
      'Padrinos Mágicos: ¡Pide un deseo! ¡Rápido, que se nos acaba el dinero!',
      'Nobita: ¡Ay! ¡Algo me ha mordido el tobillo!',
      'Entre los puestos aparecieron figuras diminutas con cuernos y ojos de brasa. Eran diablillos, una docena, y cada uno cargaba un trozo de ceniza que les quemaba las manos.',
      'Shrek: ¡Largo de mi mercado, bichos! ¡Aquí solo vengo yo a quejarme!',
      'Lady Bug: Son demonios menores. Alguien los ha enviado para tantear nuestras defensas.',
      'De entre los diablillos salieron tres rostros conocidos con los ojos teñidos de rojo: Caillou, el Mago Eléctrico y Kevin, poseídos por el calor.',
      'Caillou: ¡Quiero... galletas... y almas!',
      'Rades llegó corriendo desde el Cementerio, con el abrigo ardiendo en una manga.',
      'Rades: No son enemigos. Están poseídos. Hay que sacudirles el calor de encima, sin hacerles daño.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 9 — Diablillos en el mercado',
    intro: [
      'Shrek: Ya me has oído, Rades. Yo hago de muro, tú de enterrador y Lady Bug de lo que haga falta.',
      'Lady Bug: Prometo no usar el yo-yo en la cara de nadie.'
    ],
    heroIds: ['rades_spirito', 'shrek', 'ladybug'],
    villainIds: ['caillou', 'mago_electrico', 'kevin'],
    victory: [
      'Los tres poseídos caen de rodillas y de sus bocas sale un humo rojo con forma de rostro sonriente.',
      'Humo: Azmodrel os saluda... y os da la bienvenida a su banquete.',
      'Caillou: ¿Dónde estoy? ¿Por qué tengo cenizas en el pelo?',
      'Rades recoge un trozo de ceniza del suelo. Tiene grabado un símbolo: una corona hecha de colmillos.',
      'Rades: Nicktula, convoca al Consejo. Y trae a L. Esto ya no es un susto aislado.'
    ],
    defeat: [
      'El calor se vuelve insoportable y los diablillos ríen por todo el mercado.',
      'Shrek: ¡Rades, aguanta!',
      'Rades aprieta los dientes. Todavía no.'
    ]
  },

  /* ----------------- ACTO I ----------------- */
  {
    type: 'narrative',
    act: 'Acto I — Las Puertas de Ceniza',
    title: 'El diario del Sol Hueco',
    cast: ['nicktula', 'l', 'urahara', 'carlos', 'hela', 'ainz', 'rades_spirito'],
    lines: [
      'El Consejo del Nexo se reunió de nuevo, esta vez en una sala con las ventanas tapiadas. Sobre la mesa, Nicktula depositó un cuaderno chamuscado.',
      'Nicktula: Lo encontré entre los restos del Reloj. Es el diario de Nihilux.',
      'L: Léelo en voz alta. Quiero que todos oigan lo mismo.',
      'Nicktula: «Fui el Sol Guardián del Reloj. Mi trabajo era vigilar que las agujas no se detuvieran. Pero una noche descubrí una grieta bajo el Nexo, una puerta que daba a un lugar llamado el Averno».',
      'Nicktula: «Allí vive un ser que llaman Azmodrel, el Rey Carmesí. No devora cuerpos ni almas. Devora mundos. Y su hambre es tan grande que se aprovecha de cada mundo que muere».',
      'Hela: Entonces las almas que desaparecen de mi reino son el aperitivo.',
      'Nicktula: «Intenté detenerlo. Pero cada vez que el Reloj latía, Azmodrel crecía. La única forma de matar su hambre era no dejarle mundos que comer. Así que empecé a apagarlos antes de que se infectaran».',
      'Carlos: ¿Nihilux apagaba mundos para que Azmodrel no se los comiera?',
      'Nicktula: «No sabía qué otra cosa hacer. Y mientras yo apagaba mundos, el Rey Carmesí se reía».',
      'Se hizo un silencio muy largo. Ainz fue el primero en hablar, con la voz de quien ha cargado con decisiones imposibles.',
      'Ainz: Un guardián desesperado que cree que la solución es la crueldad. Lo entiendo mejor de lo que me gustaría.',
      'Urahara: Y al derrotarlo, rompimos el tapón que mantenía cerrado el Averno.',
      'Rades: Entonces tenemos que bajar. Alguien debe cerrar esa puerta desde dentro.',
      'Hela: Yo conozco el camino. No me gusta, pero lo conozco.',
      'Se votó y nadie se opuso. Al amanecer saldría una expedición hacia las profundidades.'
    ]
  },

  {
    type: 'narrative',
    title: 'La Expedición Carmesí',
    cast: ['rades_spirito', 'asta', 'yami', 'noelle_silva', 'mereoleona', 'mimosa', 'itachi', 'deidara',
           'konan', 'fern_frieren', 'aqua', 'belerick', 'saitama', 'goku', 'gojo_satoru', 'naruto', 'ichigo'],
    lines: [
      'Al amanecer, una larga fila de voluntarios esperaba a las puertas del Nexo. No eran los mismos que en la guerra anterior: esta vez, todos sabían a lo que se enfrentaban.',
      'Saitama: Yo no voy. Alguien tiene que quedarse vigilando el hueco de la Fisura, y si se cuela algo, lo arreglo de un puñetazo.',
      'Goku: ¡Yo también me quedo! Entre los dos podemos tapar la grieta si se pone fea.',
      'Gojo Satoru: Yo me quedo con ellos. Si baja alguien tan fuerte como yo, el Averno se llenaría de ruido.',
      'Naruto: ¡Yo guardo la puerta del Nexo, dattebayo! Rades, confío en ti.',
      'Ichigo: Cuando me necesites, llámame. Estaré aquí.',
      'De entre la multitud avanzó un grupo más pequeño pero más decidido. Asta, Yami, Noelle, Mereoleona y Mimosa se plantaron frente a Rades.',
      'Asta: ¡Voy a ser el Rey Mago, así que ya puedo ir practicando contra reyes de verdad!',
      'Yami: Calla, mocoso. Pero cuenta conmigo.',
      'Mereoleona: Tengo ganas de pelear con algo que arda más que yo.',
      'Itachi, Deidara, Konan, Fern, Aqua y Belerick cerraron el grupo, cada uno con su propia razón para bajar.',
      'Aqua: ¡Yo voy de sanadora! Que conste que bajar a un sitio tan caliente me da mucha pereza.',
      'Rades miró por última vez el cielo del Nexo.',
      'Rades: Volveremos todos. Es una promesa de guardián.'
    ]
  },

  {
    type: 'narrative',
    title: 'La escalera de ceniza',
    cast: ['rades_spirito', 'hela', 'nicktula', 'sans', 'Papyrus', 'asta', 'yami'],
    lines: [
      'La entrada al Averno era una escalera de caracol tallada en piedra negra, tan larga que no se veía el fondo. Cada escalón desprendía un calor distinto al anterior.',
      'Hela: Esta escalera tiene mil escalones. Cada cien, el Averno cobra algo.',
      'Nicktula: ¿Cobra... qué, exactamente?',
      'Hela: Recuerdos. Mentiras. Nombres. Depende de a quién le pregunte.',
      'Sans: eh, bonito sitio. me recuerda a mi cocina cuando papyrus cocina espaguetis.',
      'Papyrus: ¡NYEH HEH HEH! ¡MIS ESPAGUETIS SON UN MANJAR! ¡SOLO QUE A VECES... ARDEN!',
      'Asta: ¡Yo tengo energía de sobra! ¡Podemos bajar corriendo!',
      'Yami: No corras, idiota. Hay que conservar fuerzas.',
      'Al llegar al escalón cien, el aire se espesó y una sombra enorme se desprendió de la pared. No tenía forma de hombre ni de bestia, sino de ambas cosas a la vez.',
      'Hela: Los guardianes de la escalera. Antiguos soldados de Azmodrel que no han querido rendirse.',
      'De las sombras emergieron dos figuras colosales: Thamuz, con sus guadañas fundidas, y Minotauro, con la ira del laberinto en cada músculo.',
      'Thamuz: Sabía que vendrías, guardián. Mi señor me prometió una revancha.',
      'Minotauro: Nadie baja más allá de este escalón.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 10 — Los guardianes de la escalera',
    intro: [
      'Yami: Dos monstruos que bloquean un pasillo. Qué previsible.',
      'Mereoleona: Me quedo con el del hacha. Tú con el del cuerno.',
      'Rades: Y yo cubro la retaguardia. Que nadie baje un escalón sin mi permiso.'
    ],
    heroIds: ['rades_spirito', 'yami', 'mereoleona'],
    villainIds: ['thamuz', 'minotauro'],
    villainBoost: { hp: 1.3, atk: 1.05 },
    victory: [
      'Los dos guardianes caen, pero no mueren: se arrodillan en medio del pasillo, agotados.',
      'Thamuz: Pensaba que Azmodrel nos había dado poder... pero era solo una correa.',
      'Minotauro: Dejadnos pasar la noche aquí. Mañana ya no nos obligarán.',
      'Hela: El primer eslabón de su cadena se ha roto.'
    ],
    defeat: [
      'Thamuz levanta sus guadañas y la escalera se estremece.',
      'Thamuz: ¿Eso es todo, guardián?',
      'Rades respira hondo. Todavía no.'
    ]
  },

  {
    type: 'narrative',
    title: 'Brasas de campamento',
    cast: ['rades_spirito', 'yami', 'mereoleona', 'asta', 'noelle_silva', 'hela', 'mimosa'],
    lines: [
      'Aquella noche acamparon en un rellano de la escalera, alrededor de una hoguera que ardía sin madera. Nadie hablaba mucho. El calor, el cansancio y la tensión hacían que los silencios fueran cómodos.',
      'Mimosa: Os he preparado algo caliente. Perdonad, aquí todo está demasiado caliente, pero de verdad es de menta.',
      'Noelle: Gracias, Mimosa. Asta, ¿estás bien? Llevas un rato callado.',
      'Asta: Es que... pienso que Nihilux solo quería proteger a los demás. Y nosotros la derrotamos. ¿Y si estábamos equivocados?',
      'Yami: Estuvisteis bien, mocoso. Lo que hizo estaba mal, aunque lo hiciera por miedo.',
      'Mereoleona: En mi familia decimos que el miedo es una armadura que pesa. Nihilux llevó demasiado tiempo su peso, y se rompió.',
      'Rades miraba el fuego en silencio. Hela se sentó a su lado, sin pedir permiso.',
      'Hela: Los vivos pensáis que la muerte es el final. Yo he visto mil finales. Ninguno es tan malo como el de olvidar.',
      'Rades: Ese es mi trabajo, Hela. Recordar para que no se pierdan.',
      'Hela: Entonces ya sabes por qué estoy aquí. Esos muertos que faltan... uno de ellos era mi hijo.',
      'Rades la miró despacio. Por primera vez desde que la conocía, la reina de los muertos tenía los ojos húmedos.',
      'Rades: Entonces lo recuperaremos. Te lo prometo.',
      'Y bajo las brasas de aquel campamento improvisado, los héroes de mil mundos durmieron lo mejor que pudieron.'
    ]
  },

  /* ----------------- ACTO II ----------------- */
  {
    type: 'narrative',
    act: 'Acto II — El Círculo de las Lágrimas',
    title: 'El lago que llora',
    cast: ['rades_spirito', 'asta', 'liebe', 'aqua', 'castorice', 'lilith_fate'],
    lines: [
      'Al día siguiente, la escalera se abrió sobre un valle inmenso. En el centro había un lago de agua oscura que sollozaba. Literalmente: de su superficie salía un llanto suave, constante, como el de un niño dormido.',
      'Aqua: Este lago es una trampa. Lo noto en el agua. Cada gota es una lágrima de alguien que perdió algo.',
      'Castorice: Es el Círculo de las Lágrimas. Aquí viven los recuerdos de todos los que lloraron antes de morir.',
      'Mientras caminaban por la orilla, cada uno oyó su propio nombre desde el agua. A Asta lo llamaba una voz de niño. A Rades, cuatro voces a la vez. A Aqua, una voz que no conocía pero que le resultaba muy familiar.',
      'Liebe: No escuchéis. Es magia de sueño. Si respondéis, el lago os traga.',
      'Asta: Gracias, Liebe. Siempre sabes qué pasa antes que yo.',
      'Liebe: Soy un demonio, Asta. Conozco este sitio mejor de lo que me gustaría.',
      'En el centro del lago, una mujer muy hermosa flotaba sobre una balsa de pétalos negros. Cantaba una nana que habría dormido a una montaña.',
      'Lilith: Bienvenidos a mi jardín, viajeros. Quedaos un rato. Nadie os va a hacer daño... salvo el sueño.',
      'A su lado apareció otra figura, esta vez familiar para Liebe.',
      'Zagred: Hermano. Pensé que no volvería a verte.'
    ]
  },

  {
    type: 'narrative',
    title: 'Liebe y Asta',
    cast: ['liebe', 'asta', 'zagred', 'lilith_fate'],
    lines: [
      'Liebe se quedó petrificado. Hacía siglos que no oía esa voz.',
      'Zagred: Vuelve a casa. Azmodrel te perdonará. Ha dicho que a los demonios que regresen no les hará nada.',
      'Liebe: No es perdón. Es una correa con otro nombre.',
      'Zagred: Es nuestra naturaleza. Los demonios no sirven a los humanos. Tú mismo lo dijiste.',
      'Liebe: Dije muchas cosas cuando era más joven y más tonto.',
      'Asta dio un paso adelante, con la espada antimagia temblando en las manos.',
      'Asta: Liebe no es mi sirviente. Es mi compañero. Y si quiere irse, le dejaré ir. Pero si decide quedarse conmigo, lo defenderé hasta el final.',
      'Liebe miró a Asta durante un largo momento. Detrás de él, el lago seguía llorando.',
      'Liebe: Eres un idiota, Asta. Pero eres mi idiota.',
      'Zagred: Entonces no me dejas opción, hermano.',
      'Lilith: Qué bonito. Qué triste. Y qué inútil. Dormid, valientes. Dormid.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 11 — Sueños y juramentos',
    intro: [
      'Una neblina morada se extiende por el lago. Los héroes sienten cómo los párpados les pesan.',
      'Asta: ¡No pienso dormirme! ¡Hoy no! ¡Mañana tampoco!',
      'Liebe: Y yo te cubro por si acaso. Pelea con todo, Asta.',
      'Rades: Dos demonios, dos formas de ver el mundo. Veamos cuál aguanta más.'
    ],
    heroIds: ['asta', 'liebe', 'rades_spirito'],
    villainIds: ['lilith_fate', 'zagred'],
    villainBoost: { hp: 1.3, atk: 1.05 },
    victory: [
      'Lilith cae de la balsa y los pétalos negros se deshacen en el agua. Zagred se arrodilla a su lado.',
      'Zagred: Hermano... no sabía que habías encontrado a alguien que te quisiera de verdad.',
      'Liebe: Yo tampoco, Zagred. Pero aquí estamos.',
      'Lilith se incorpora con dificultad. Por primera vez, no hay burla en su voz.'
    ],
    defeat: [
      'Asta cae de rodillas, vencido por un sueño que no le pertenece.',
      'Lilith: Dulces sueños.',
      'Liebe: ¡Asta, despierta! ¡Aún no!'
    ]
  },

  {
    type: 'narrative',
    title: 'Lo que dejan las lágrimas',
    cast: ['lilith_fate', 'zagred', 'liebe', 'rades_spirito', 'hela', 'nicktula'],
    lines: [
      'Cuando la niebla se disipó, el lago dejó de llorar por un momento. Lilith, sentada en la orilla, tenía los pies mojados y la mirada perdida.',
      'Lilith: No me gusta ser la mala de este cuento. Pero tampoco me han dado otra opción.',
      'Rades: Cuéntame cómo funciona. Cómo os obliga Azmodrel a servirle.',
      'Zagred: Con contratos. Cada demonio del Averno tiene su nombre verdadero escrito en un libro enorme, el Libro de los Nombres. Quien posee ese libro, controla a todos.',
      'Lilith: Yo firmé el mío hace siglos para proteger a mi familia. Ahora mi familia está presa y yo tengo que servir.',
      'Hela: ¿Dónde está ese libro?',
      'Zagred: En la Corte de los Contratos, en el cuarto círculo. Lo guardan dos de los más listos del Averno: Tokoyami Towa y Akuma Nihmane.',
      'Liebe: Si destruimos el libro, ¿los demonios quedan libres?',
      'Lilith: Si lo hacéis bien, sí. Si lo hacéis mal, todos los nombres se pierden y los demonios dejan de existir.',
      'Rades: Entonces no lo destruiremos. Lo leeremos en voz alta, nombre por nombre.',
      'Nicktula: Eso puede llevar semanas.',
      'Rades: Tengo todo el tiempo del mundo. Es mi oficio, recordar nombres.',
      'Lilith se rió por primera vez en siglos, una risa corta y quebradiza.',
      'Lilith: Eres tonto, guardián. Pero me caes bien.'
    ]
  },

  /* ----------------- ACTO III ----------------- */
  {
    type: 'narrative',
    act: 'Acto III — El Bosque de las Máscaras',
    title: 'Máscaras bajo la luna roja',
    cast: ['rades_spirito', 'ibuki_douji', 'nakiri_ayame', 'unknown_oni_sorceress', 'castorice', 'noelle_silva'],
    lines: [
      'El tercer círculo era un bosque de árboles retorcidos cuyas hojas eran máscaras de oni. Cada paso crujía como una cáscara de huevo y, sobre las copas, brillaba una luna enorme, roja como una herida.',
      'Castorice: Las máscaras son recuerdos congelados. No las pises.',
      'Noelle: Yo no voy a pisar nada. Prefiero ir con mucho cuidado.',
      'En un claro apareció una larga mesa de madera cubierta de jarras de sake. En su cabecera, tres figuras esperaban.',
      'Ibuki Douji: ¡Ajá! ¡Visitas! ¡Qué alegría! ¡Sentaos, bebed y luego luchamos!',
      'Nakiri Ayame: Ibuki, por favor, sé educada. Esta gente ha venido a pelear, no a una boda.',
      'Anshurii: Seamos honestas. Ninguna de nosotras tiene nada contra ellos. Pero el contrato obliga.',
      'Rades: ¿Vosotras también estáis atadas al Libro?',
      'Ibuki Douji: Es una larga historia. En resumen, Azmodrel nos prometió un hogar. Nos dio una jaula con tejas bonitas.',
      'Nakiri Ayame: Los oni respetamos el combate. Nos batimos en duelo y el que gana, decide.',
      'Rades miró a su alrededor. Los héroes habían empezado a sentarse. Mimosa ya estaba repartiendo té. Mereoleona brindaba con Ibuki Douji como si se conocieran de siempre.',
      'Rades: Un brindis primero, luego el duelo. ¿Os parece?',
      'Ibuki Douji: ¡Me parece perfecto!'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 12 — El duelo de las tres máscaras',
    intro: [
      'Tras el brindis, las tres oni se colocaron en el centro del claro. Las máscaras de los árboles se estremecieron y una música lenta de tambores empezó a sonar.',
      'Ibuki Douji: ¡Por mi honor, y por mi sake!',
      'Nakiri Ayame: ¡Por mi hogar perdido!',
      'Anshurii: Por el último contrato que firmaré.',
      'Noelle: Es un duelo justo. Que gane la mejor.'
    ],
    heroIds: ['rades_spirito', 'noelle_silva', 'ganyu_genshin'],
    villainIds: ['ibuki_douji', 'nakiri_ayame', 'unknown_oni_sorceress'],
    villainBoost: { hp: 1.1 },
    victory: [
      'Cuando cae la última oni, las máscaras de los árboles caen al suelo y se convierten en flores blancas.',
      'Ibuki Douji: ¡Ha sido un gran duelo! ¡Hacía siglos que no me divertía tanto!',
      'Nakiri Ayame: El contrato dice que quien nos venza en duelo puede pedirnos una cosa.',
      'Rades: Pido una sola cosa. Que nos ayudéis a llegar a la Corte de los Contratos.'
    ],
    defeat: [
      'Las tres oni se miran, un poco decepcionadas.',
      'Ibuki Douji: Pensaba que erais mejores. ¡Pero no pasa nada, otra ronda de sake!',
      'Noelle: Ahora lo haremos mejor.'
    ]
  },

  {
    type: 'narrative',
    title: 'Sake y secretos',
    cast: ['ibuki_douji', 'nakiri_ayame', 'unknown_oni_sorceress', 'rades_spirito', 'castorice', 'yami', 'mereoleona'],
    lines: [
      'Esa noche fue la más larga del viaje. Las oni, ya sin cadenas, abrieron sus mejores jarras y contaron historias de su antiguo hogar, una montaña con un manantial de agua caliente que Azmodrel quemó hasta dejar solo ceniza.',
      'Ibuki Douji: Nos dijo que reconstruiría la montaña si le servíamos. Llevamos tres siglos sirviendo y solo hemos visto crecer su trono.',
      'Nakiri Ayame: Yo guardo un secreto. En el cuarto círculo, la Corte de los Contratos tiene una puerta lateral que solo se abre con el sello de un oni.',
      'Rades: ¿Nos darías ese sello?',
      'Nakiri Ayame: Mejor. Os acompaño yo misma.',
      'Anshurii: Yo también. Si queremos romper el Libro, hará falta alguien que entienda de rituales.',
      'Ibuki Douji: ¡Y yo voy de guardaespaldas! ¡Con el sake, claro!',
      'Yami se echó a reír por primera vez en semanas.',
      'Yami: Con esa tripulación, el Rey Carmesí no tiene nada que hacer.',
      'Mereoleona: Cállate, Yami. Se pierde el efecto sorpresa.',
      'Y bajo aquella luna roja, un grupo improbable de héroes y oni brindó por el siguiente paso.'
    ]
  },

  /* ----------------- ACTO IV ----------------- */
  {
    type: 'narrative',
    act: 'Acto IV — La Corte de los Contratos',
    title: 'El mercado de los nombres',
    cast: ['albedo', 'shalltear', 'ainz', 'tokoyami_towa', 'akuma_nihmane', 'rades_spirito', 'nicktula', 'l'],
    lines: [
      'La Corte de los Contratos era una catedral inmensa, con arañas de cristal colgando de un techo que nadie veía. En cada pared había estantes con pergaminos que susurraban nombres sin parar.',
      'L: Esto es peor de lo que imaginaba. Hay millones de contratos. Solo un error y todo el sistema se desmorona.',
      'Albedo: Ainz-sama, este lugar me desagrada. Huele a trampas.',
      'Ainz: Todo huele a trampas aquí. Es un reino diseñado para hacernos firmar.',
      'Shalltear: ¿Puedo morder a alguien, Ainz-sama?',
      'Ainz: Todavía no, Shalltear.',
      'En el centro de la sala, sobre un estrado de mármol negro, descansaba un libro enorme encadenado a un atril. A sus lados, dos figuras vestidas de gala esperaban.',
      'Tokoyami Towa: Bienvenidos a la Corte. Soy la Heredera de los Contratos y tengo la dicha de recibiros.',
      'Akuma Nihmane: Y yo soy la Notaria. Todo lo que se diga aquí tiene valor legal. Os recomiendo medir bien las palabras.',
      'Rades: Hemos venido a llevarnos el Libro de los Nombres.',
      'Tokoyami Towa: Qué directo. Me gusta. Pero el Libro no se entrega a cualquiera. Ofrecemos dos caminos: juego o combate.'
    ]
  },

  {
    type: 'narrative',
    title: 'Una apuesta a ciegas',
    cast: ['yumeko_jabami', 'tokoyami_towa', 'akuma_nihmane', 'l', 'rades_spirito'],
    lines: [
      'Antes de que Rades pudiera responder, una voz dulce se escuchó desde el fondo de la sala.',
      'Yumeko Jabami: ¿He oído la palabra juego?',
      'La joven avanzó entre los héroes con una sonrisa delicada, casi infantil. Sus ojos, sin embargo, brillaban con una avidez peligrosa.',
      'Tokoyami Towa: Una apostadora. Qué encanto. Juguemos pues. Una partida a tres manos de Corona y Sombra. Quien gane se queda con la primera mitad del Libro.',
      'L: Es un juego de faroles. Se gana leyendo las expresiones del rival.',
      'Yumeko Jabami: Adoro los faroles.',
      'La partida duró tres horas. Nadie habló. Nadie respiró fuerte. Yumeko ganó las dos primeras manos, perdió la tercera adrede y sonrió con ternura.',
      'Yumeko Jabami: Gracias por la partida, Heredera. Ahora, sobre la mitad del Libro...',
      'Akuma Nihmane: Nos ha ganado en el juego, pero sigue en pie la otra parte del contrato. Para llevarse el Libro entero, deberéis vencernos en combate.',
      'Tokoyami Towa: No me lo tomes a mal, apostadora. Es la ley.',
      'Yumeko Jabami: Nunca me lo tomo a mal. Pero tengo curiosidad: ¿cuál de las dos apostó mejor?',
      'Nadie supo responder. Y entonces las puertas de la Corte se cerraron con un golpe seco.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 13 — El Libro de los Nombres',
    intro: [
      'Tokoyami Towa: Queridos invitados, el Libro está en juego. Si perdéis, vuestros nombres se quedan para siempre en estas páginas.',
      'Akuma Nihmane: Sin presión.',
      'Albedo: Ainz-sama me ha dado permiso. Preparaos.',
      'Yumeko Jabami: Apuesto a que ganamos nosotros.'
    ],
    heroIds: ['rades_spirito', 'yumeko_jabami', 'albedo'],
    villainIds: ['tokoyami_towa', 'akuma_nihmane'],
    villainBoost: { hp: 1.35, atk: 1.05 },
    victory: [
      'Towa y Akuma Nihmane caen de rodillas, rodeadas de pergaminos arrugados. El Libro cae al suelo con un estruendo.',
      'Tokoyami Towa: Hmpf. Teníais razón. No sois cualquiera.',
      'Akuma Nihmane: Quedaos con él. Estoy harta de ser la Notaria de un tirano.'
    ],
    defeat: [
      'El Libro brilla con luz roja y varios nombres de los héroes aparecen escritos en sus páginas.',
      'Akuma Nihmane: Ya lo veis. Es la ley.',
      'Yumeko Jabami: Aún podemos reescribir esta partida.'
    ]
  },

  {
    type: 'narrative',
    title: 'Las páginas arrancadas',
    cast: ['nicktula', 'l', 'tokoyami_towa', 'akuma_nihmane', 'lilith_fate', 'zagred', 'rades_spirito'],
    lines: [
      'La lectura del Libro de los Nombres duró tres días y tres noches. Nicktula, L, Towa y Akuma Nihmane se turnaron para leer, página a página, los nombres de millones de demonios.',
      'Con cada nombre, una cadena invisible se rompía. Y con cada cadena rota, una figura aparecía en la sala: un diablillo, un súcubo, un gigante con alas de murciélago.',
      'Lilith: Esos eran mis hermanos. Hacía siglos que no los veía.',
      'Zagred: Mira. Ese de ahí es mi sobrino. Pensaba que había muerto.',
      'Tokoyami Towa: No me lo creo. Hemos pasado cientos de años encadenados y bastó leer unas páginas.',
      'Akuma Nihmane: Todos los contratos injustos son frágiles. Solo hay que tener paciencia para leerlos.',
      'Rades: Hay que seguir. Aún falta la última página.',
      'Nicktula pasó la hoja con cuidado y de pronto se quedó pálido.',
      'Nicktula: La última página no tiene nombre. Tiene un dibujo. Una corona hecha de colmillos.',
      'En ese instante, el libro empezó a arder desde dentro.',
      'Una voz grave retumbó en las paredes de la catedral.',
      'Azmodrel: Habéis liberado a mi ganado. Qué detalle. Ahora ya sé dónde están todos. Venid a mi mesa. Os he preparado un banquete.'
    ]
  },

  /* ----------------- ACTO V ----------------- */
  {
    type: 'narrative',
    act: 'Acto V — El Banquete Carmesí',
    title: 'La mesa interminable',
    cast: ['mahito', 'ulquiorra', 'isaac', 'rades_spirito', 'nicktula'],
    lines: [
      'El quinto círculo era un salón de banquetes infinito. La mesa, de madera roja, se extendía hasta donde alcanzaba la vista, cubierta de platos vacíos y copas de cristal.',
      'En la cabecera, sentados con elegancia y sonrisas ensayadas, esperaban tres comensales.',
      'Mahito: Bienvenidos. Qué alegría ver caras nuevas. Los viejos clientes son muy aburridos.',
      'Ulquiorra: No tiene sentido que sigáis. Todo termina en vacío. Azmodrel solo acelera lo inevitable.',
      'Isaac: Yo también tengo miedo, pero cada uno decide qué hacer con él.',
      'Rades: Tú eres Isaac, ¿verdad? He oído hablar de ti. Del niño que lloraba.',
      'Isaac: Lloré tanto que se me acabaron las lágrimas. Y entonces Azmodrel me ofreció un sitio en su mesa. Aquí, al menos, nadie me juzga.',
      'Mahito: La curiosidad es el mejor condimento. ¿Quieres saber cómo termina esto? Pues siéntate.',
      'Nicktula: Rades, no te sientes. Es una trampa.',
      'Rades: Lo sé. Pero también sé que a veces la mejor forma de entender a un enemigo es compartir su mesa.',
      'Rades se sentó. Durante diez minutos no hizo nada: solo escuchó. Al final, se levantó con calma.',
      'Rades: Os entiendo, comensales. De verdad. Pero no puedo dejar que sigáis en esta mesa.',
      'Ulquiorra: Entonces tendremos que destruirte.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 14 — Los tres comensales',
    intro: [
      'Mahito: Vamos a jugar a un juego nuevo. Se llama «quién se levanta último».',
      'Ulquiorra: Cero Oscuras.',
      'Isaac: Yo... lo siento por esto.',
      'Rades: No lo sientas. Solo perdona al que venga después.'
    ],
    heroIds: ['rades_spirito', 'shalltear', 'castorice'],
    villainIds: ['mahito', 'ulquiorra', 'isaac'],
    villainBoost: { hp: 1.05 },
    victory: [
      'Los tres comensales caen sobre la mesa, rodeados de platos rotos.',
      'Ulquiorra: Así que esto es... sentir algo.',
      'Isaac: Gracias. Por no odiarme.',
      'Mahito: Qué final tan aburrido. Pero me ha gustado.',
      'La mesa roja empieza a desvanecerse, y detrás aparece una escalera de oro.'
    ],
    defeat: [
      'Los tres comensales brindan con copas vacías.',
      'Mahito: Un brindis por los que no lo consiguieron.',
      'Castorice: No acabará así.'
    ]
  },

  {
    type: 'narrative',
    title: 'El peso de la mesa',
    cast: ['rades_spirito', 'hela', 'isaac', 'ulquiorra', 'mahito', 'nicktula'],
    lines: [
      'Cuando la mesa se desvaneció del todo, los tres comensales se quedaron sentados en el suelo, sin cadenas, mirándose las manos como si fueran nuevas.',
      'Hela: Esto no estaba en el plan. Ellos sirven al Rey Carmesí.',
      'Rades: Ya no. Nadie sirve a nadie si no quiere. Eso se acaba aquí.',
      'Isaac: Rades, antes de que subáis, tengo que contaros algo. Azmodrel no quiere solo comerse el Reloj.',
      'Ulquiorra: Quiere convertirlo en su trono. Cada aguja, un diente.',
      'Mahito: Quiere un mundo hecho a su medida, sin gente. Solo hambre.',
      'Nicktula anotó todo, con la mano temblando.',
      'Rades: Entonces es nuestra última oportunidad. Gracias, comensales. Vuestros nombres no se perderán.',
      'Ulquiorra: Yo no tengo nombre en vuestros libros.',
      'Rades: Sí lo tienes. Ulquiorra Cifer. Lo acabo de escribir.',
      'El espada se quedó callado. Después, sin decir nada, hizo un pequeño gesto con la cabeza.'
    ]
  },

  /* ----------------- ACTO VI ----------------- */
  {
    type: 'narrative',
    act: 'Acto VI — El Trono Carmesí',
    title: 'La última escalera',
    cast: ['rades_spirito', 'nicktula', 'hela', 'castorice', 'David'],
    lines: [
      'La escalera de oro llevaba directamente al trono de Azmodrel. Cada escalón desprendía un calor más suave, como si el Averno quisiera dar una última oportunidad de volver atrás.',
      'Nicktula: Rades, ¿puedo decirte algo? Antes de entrar.',
      'Rades: Dime.',
      'Nicktula: Cuando te conocí, pensé que eras un viejo gruñón que vivía entre muertos. Ahora creo que eres la persona más viva que he conocido.',
      'Rades: No digas tonterías. Los muertos me dan la razón.',
      'David: Rades, nosotros hemos hablado. Jimmy, Carl, Doña Eulalia y yo. Queremos entrar contigo.',
      'Rades: No podéis. El Averno os consumiría.',
      'David: Entonces dejaremos que nos uses. Una última vez. Para algo hemos sido tus cadáveres.',
      'Rades miró a sus cuatro muertos. Uno a uno, les tocó el hombro.',
      'Rades: Estoy orgulloso de vosotros. Siempre lo estuve.',
      'Detrás de ellos, un grupo enorme de héroes de todos los mundos subía la escalera. Habían recibido el aviso y habían llegado a tiempo.',
      'Hela: Mira, guardián. Todos han venido.',
      'Rades sonrió, por primera vez en meses, de verdad.'
    ]
  },

  {
    type: 'narrative',
    title: 'El pacto de Nihilux',
    cast: ['nihilux', 'rades_spirito', 'nicktula'],
    lines: [
      'En el último rellano, la escalera se abrió a una sala sin techo. Una pequeña luz flotaba en el centro. Débil, apenas una brasa. Rades la reconoció al instante.',
      'Nihilux: Guardián. Hola otra vez.',
      'Rades: Pensaba que te habías ido.',
      'Nihilux: Lo que queda de mí. Una brasa, nada más. Pero todavía puedo ayudar.',
      'Nicktula: ¡Nihilux! ¿Cómo es posible?',
      'Nihilux: Cuando me derrotasteis, mi llama no se apagó del todo. Se escondió en el Reloj. Desde allí he visto todo lo que hacíais. Me avergüenzo de lo que hice.',
      'Rades: No tienes por qué...',
      'Nihilux: Sí, tengo. Apagué mundos por miedo. Vosotros los habéis salvado por esperanza. Quiero que me escuchéis.',
      'La brasa se acercó a Rades y se posó en su mano.',
      'Nihilux: Esta es mi Última Hora. Un segundo del Reloj detenido para siempre. Úsalo contra Azmodrel y le robarás el hambre durante un instante.',
      'Rades: ¿Qué te costará?',
      'Nihilux: Nada. Ya no tengo nada que perder.',
      'Rades cerró la mano con cuidado. Sintió su calor, tan pequeño, tan frágil.',
      'Rades: Gracias, Nihilux. Te debo una.',
      'Nihilux: Entonces recuérdame. Con eso me basta.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 15 — La guardia del trono',
    intro: [
      'Ante las puertas del trono, tres figuras familiares les cerraron el paso. Tenían los ojos rojos y la ropa quemada.',
      'Aizen: Azmodrel nos ha ofrecido otra oportunidad.',
      'Griffith: Y nosotros hemos aceptado.',
      'Kisame Hoshigaki: A mí me han prometido un acuario enorme.',
      'Naruto: ¡Son sombras de los Heraldos! ¡Ya los derrotamos una vez!',
      'Ichigo: Pues lo haremos de nuevo.'
    ],
    heroIds: ['rades_spirito', 'naruto', 'ichigo'],
    villainIds: ['aizen', 'griffith', 'kisame_hoshigaki'],
    villainBoost: { hp: 1.15, atk: 1.1 },
    victory: [
      'Las tres sombras se deshacen en ceniza y las puertas del trono se abren solas.',
      'Aizen: Curioso. Nos han usado como peones una vez más.',
      'Griffith: No volveré a servir a nadie.',
      'Kisame Hoshigaki: Qué lástima lo del acuario.'
    ],
    defeat: [
      'Las tres sombras se alinean ante las puertas con una calma aterradora.',
      'Aizen: Os lo advertimos.',
      'Naruto: ¡No pasa nada! ¡Lo volveremos a intentar!'
    ]
  },

  {
    type: 'narrative',
    title: 'El Rey sin hambre',
    cast: ['azmodrel', 'rades_spirito', 'hela'],
    lines: [
      'El salón del trono era enorme, con una cúpula formada por mil relojes rotos. En el centro, sobre un trono de colmillos negros, descansaba una figura imposible: un coloso con alas de brasa, cuernos retorcidos y una sonrisa llena de dientes.',
      'Azmodrel: Así que el guardián de los muertos ha cruzado todo mi Averno solo para saludarme. Qué detalle tan generoso.',
      'Rades: No he venido a saludarte. He venido a cerrar la puerta.',
      'Azmodrel: ¿Y qué pretendes hacer cuando me tengas delante? ¿Convencerme con palabras? Los de tu especie siempre creéis que los gigantes pueden razonar.',
      'Rades: Los gigantes no. Pero tú eras un niño hambriento hace mucho tiempo.',
      'Se hizo un silencio muy largo. Azmodrel dejó de sonreír por un instante.',
      'Hela: Guardián, ¿qué estás haciendo?',
      'Rades: Hela, tú me dijiste que recordar es mi oficio. Pues he recordado. Azmodrel fue un demonio pequeño, abandonado en un mundo que murió. Nadie le dio de comer y creció pensando que el mundo era un banquete.',
      'Azmodrel: ¡Cállate!',
      'Rades: Entiendo tu hambre. Pero no puedo permitir que se coma a los demás.',
      'La sonrisa regresó, más ancha que antes.',
      'Azmodrel: Entonces demuéstrame que merece la pena salvaros.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 16 — Azmodrel, el Rey Carmesí',
    intro: [
      'El Rey Carmesí se levanta del trono. Cada paso agrieta el suelo y de sus alas caen chispas que queman todo lo que tocan.',
      'Goku: ¡Menudo oponente! ¡Esto sí que es una pelea!',
      'Saitama: Vale, pero que sea rápida. Se me enfría la cena.',
      'Rades: Aguantad todo lo que podáis. Yo os cubro.'
    ],
    heroIds: ['rades_spirito', 'goku', 'saitama'],
    villainIds: ['azmodrel'],
    victory: [
      'Azmodrel cae de rodillas, jadeando. Su cuerpo empieza a resquebrajarse como el cristal del Reloj.',
      'Azmodrel: No... no puede ser... yo soy el hambre...',
      'Pero de las grietas no sale sangre, sino fuego. Y de ese fuego empieza a crecer otra forma, más grande y más desesperada.',
      'Hela: ¡Cuidado! ¡Esto no ha terminado!'
    ],
    defeat: [
      'Azmodrel sonríe mientras el trono de colmillos se expande por la sala.',
      'Azmodrel: Qué lástima. Esperaba más.',
      'Goku: ¡Aún no hemos terminado!'
    ]
  },

  {
    type: 'narrative',
    title: 'El hambre verdadera',
    cast: ['azmodrel', 'azmodrel2', 'rades_spirito', 'nihilux'],
    lines: [
      'El cuerpo del Rey Carmesí se hundió en el suelo, y por un momento todo quedó en silencio. Después, el trono entero empezó a temblar.',
      'Azmodrel: ¿Creíais que ese era yo? Ese era solo mi disfraz. El Rey Carmesí era mi jaula. Lo que de verdad queda es... el hambre.',
      'De las grietas del suelo emergió un monstruo enorme y delgado, formado de llamas y colmillos. Tenía los ojos blancos, la boca abierta y una corona de huesos que giraba lentamente sobre su cabeza.',
      'Hela: Eso ya no es Azmodrel. Es lo que Azmodrel intentó esconder.',
      'Nicktula: ¡Rades! ¡Usa la Última Hora!',
      'Rades abrió la mano. La brasa de Nihilux brilló con una luz clara, casi cálida.',
      'Nihilux: Ahora, guardián. Hazlo por todos.',
      'Un instante después, el tiempo de la sala se detuvo. La corona dejó de girar. Los colmillos dejaron de moverse. Y la voz del monstruo se volvió un susurro.',
      'Azmodrel: Tengo... mucha... hambre...',
      'Rades: Lo sé. Y por eso voy a quedarme contigo hasta el final.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo final — Azmodrel, la Corona Hambrienta',
    intro: [
      'El tiempo regresa de golpe y el monstruo ruge con una voz que hace temblar los cimientos del Averno.',
      'Asta: ¡Voy a cortar esa corona con mi espada antimagia!',
      'Gojo Satoru: Y yo te cubro con el Infinito.',
      'Rades: Todos a una. Por Nihilux, por mis muertos y por los mil mundos.'
    ],
    heroIds: ['rades_spirito', 'asta', 'gojo_satoru'],
    villainIds: ['azmodrel2'],
    victory: [
      'La corona de huesos se parte en dos y el monstruo cae de rodillas.',
      'Azmodrel: Tengo... frío...',
      'Rades se acerca despacio y le pone una mano en el hombro.',
      'Rades: Ya está. Ya no tienes que comer más.',
      'Un resplandor cálido envuelve a la criatura, y el gigante de llamas se convierte en un niño pequeño con cuernos diminutos.',
      'Azmodrel: ...Gracias.'
    ],
    defeat: [
      'La corona gira con más fuerza y el suelo se resquebraja.',
      'Hela: ¡No os rindáis! ¡Todavía hay tiempo!',
      'Rades aprieta los dientes. Una vez más.'
    ]
  },

  {
    type: 'narrative',
    title: 'Epílogo I — Lo que queda del hambre',
    cast: ['rades_spirito', 'azmodrel', 'hela', 'nihilux', 'nicktula', 'lilith_fate', 'zagred', 'liebe'],
    lines: [
      'El Averno entero dejó de temblar. Las paredes, antes ardientes, se enfriaron poco a poco, y los relojes rotos del techo empezaron a girar otra vez.',
      'Hela: Mi hijo... mi hijo está en la puerta.',
      'Una figura pequeña, con los ojos muy abiertos, cruzó el umbral de la sala y corrió hacia ella. Hela se arrodilló y lo abrazó con una ternura que nadie le había visto nunca.',
      'Lilith: Mis hermanos están fuera. Todos libres. Gracias, Rades.',
      'Zagred: Liebe, hermano. Cuando quieras, podemos tomar un té.',
      'Liebe: Con Asta cerca, imposible. Pero me apunto.',
      'Rades miró al pequeño Azmodrel, que dormía encogido en el suelo.',
      'Rades: ¿Qué hacemos con él?',
      'Nihilux: Yo cuidaré de él. Soy un sol hueco, pero tengo experiencia con las criaturas que tienen hambre. Le enseñaré a alimentarse de otra cosa: de luz.',
      'Nicktula: ¿Y el Averno?',
      'Hela: Lo cerraremos. Pero no del todo. Hay demonios que no quieren volver arriba. Les daremos un hogar tranquilo, sin contratos ni coronas.',
      'Rades asintió. Por primera vez desde que había empezado todo, sentía que el peso de los finales se aligeraba.'
    ]
  },

  {
    type: 'narrative',
    title: 'Epílogo II — Un nuevo amanecer',
    cast: ['rades_spirito', 'nicktula', 'carlos', 'papudo', 'saitama', 'goku', 'sans', 'Papyrus',
           'ibuki_douji', 'nakiri_ayame', 'unknown_oni_sorceress', 'yumeko_jabami', 'tokoyami_towa'],
    lines: [
      'Cuando los héroes salieron del Averno, el cielo del Nexo estaba tan despejado que parecía recién pintado. Habían pasado cuatro meses desde la despedida.',
      'Carlos: ¡Ahí están! ¡Chicos, han vuelto!',
      'Papudo: Os dije que volverían. Y os dije que me guardarais mis papadas.',
      'Presi: ¡¡BABUUUUBAAA!!',
      'Saitama: Oye, ¿habéis traído algo de cenar? Llevo semanas con arroz.',
      'Goku: ¡Cuéntame cómo fue la pelea! ¡Quiero todos los detalles!',
      'Ibuki Douji: ¡Y hemos traído sake! ¡Para todos!',
      'Nakiri Ayame: Han accedido a quedarse con nosotros en el Nexo. Será un hogar nuevo.',
      'Yumeko Jabami: Y yo he abierto un casino. Pasaos cuando queráis.',
      'Sans: ey, rades. buen trabajo. te debo un ketchup.',
      'Papyrus: ¡NYEH HEH HEH! ¡EL GRAN PAPYRUS ESTÁ MUY ORGULLOSO!',
      'Rades miró a su alrededor, a la multitud de mundos distintos que se mezclaban en una sola plaza. Sonrió con calma.',
      'Rades: Nicktula, anota esto en tus archivos: Nadie se olvida mientras alguien lo recuerde.',
      'Nicktula: ¿Es una cita célebre?',
      'Rades: Es una promesa.',
      'Esa tarde, Rades regresó al Cementerio con sus cuatro muertos. Se sentó junto a la tumba de Carl, abrió su regadera y volvió a regar las flores que casi nunca florecen.',
      'Esa tarde, por primera vez en mucho tiempo, una de ellas se abrió.',
      '— FIN —'
    ]
  }
];


/* =============================================================================
   MOTOR DEL MODO (no hace falta tocar nada de aquí hacia abajo)
   ============================================================================= */
(function () {
  'use strict';

  const PROGRESS_KEY    = 'batalla-convergencia-progress-v2';   // v2: la historia se amplió con la Parte II
  const STORY_MUSIC_CFG = 'batalla-story-music-config';          // volumen / activada (Configuración)
  const COVER           = 'personajes/convergencia.jpg';
  const MUSIC_DIALOGUE  = 'historia2/dialogo.mp3';
  const MUSIC_BATTLE    = 'historia2/combate.mp3';
  const MUSIC_BATTLE_2  = 'historia2/combate2.mp3';               // opcional: combates de la Parte II
  const LINES_PER_PAGE  = 6;                                      // líneas que se muestran por "página"
  const CHAPTERS        = HIST2_CHAPTERS;

  const byId = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const safeLog = m => { try { if (typeof log === 'function') log(m); } catch (e) { /* ignorar */ } };

  /* findBaseById (game.js) solo conoce CHARACTERS y STORY_ONLY_CHARACTERS.
     Lo ampliamos para que también encuentre los personajes exclusivos de esta historia. */
  (function patchFind() {
    const _find = window.findBaseById;
    if (typeof _find !== 'function' || _find.__h2) return;
    const patched = function (id) {
      return _find.apply(this, arguments) || HIST2_ONLY_CHARACTERS.find(c => c.id === id);
    };
    patched.__h2 = true;
    window.findBaseById = patched;
  })();

  const baseOf = id => (typeof findBaseById === 'function' ? findBaseById(id) : null)
    || HIST2_ONLY_CHARACTERS.find(c => c.id === id)
    || (typeof CHARACTERS !== 'undefined' ? CHARACTERS.find(c => c.id === id) : null);

  /* ---------------- Metadatos: parte y acto de cada escena ----------------
     "part" y "act" solo se escriben en la primera escena de cada parte/acto;
     aquí se propagan hacia delante para conocer los de cualquier escena. */
  const META = [];
  (function buildMeta() {
    let part = 1, partTitle = '', act = '';
    CHAPTERS.forEach((c, i) => {
      if (c.part) { part = c.part; partTitle = c.partTitle || ''; }
      if (c.act) act = c.act;
      META[i] = { part, partTitle, act, newAct: !!c.act, newPart: !!c.part };
    });
  })();
  const partStart = p => META.findIndex(m => m.part === p);
  const partCount = () => Math.max(...META.map(m => m.part));
  const partTitleOf = p => (META[partStart(p)] || {}).partTitle || ('Parte ' + p);

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
  let curFallback = '';

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
  function playMusic(src, fallback) {
    if (window.stopAllStoryMusic) window.stopAllStoryMusic();
    const cfg = musicSettings();
    if (!cfg.enabled || !src) { stopMusic(); return; }
    if (curSrc === src && !audio.paused) return;
    curSrc = src;
    curFallback = fallback || '';
    audio.volume = cfg.volume;
    audio.setAttribute('src', src);
    audio.load();
    audio.play().catch(() => { /* falta el archivo o el navegador lo bloquea */ });
  }
  audio.addEventListener('error', () => {
    // Si no existe la canción propia de la Parte II, se usa la de la Parte I.
    if (curFallback && curSrc !== curFallback) {
      const fb = curFallback;
      curFallback = '';
      curSrc = fb;
      audio.setAttribute('src', fb);
      audio.load();
      audio.play().catch(() => { /* sin música */ });
    }
  });

  /* ---------------- Estado del modo ---------------- */
  const H = { active: false, index: 0, shown: 1 };

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

  /* Insignia + barra de progreso. La barra mide el avance dentro de la parte actual. */
  function progressHTML(index, badge) {
    const m = META[index];
    const first = partStart(m.part);
    let last = CHAPTERS.length - 1;
    for (let i = index; i < CHAPTERS.length; i++) { if (META[i].part !== m.part) break; last = i; }
    const total = last - first + 1;
    const pos = index - first + 1;
    const pct = total ? Math.round((pos / total) * 100) : 0;
    return `<div class="story-progress">
      <div class="story-progress-top">
        <span class="story-type-badge">${badge}</span>
        <span class="story-progress-label">Parte ${m.part} · Escena ${pos} / ${total}</span>
      </div>
      <div class="story-progress-bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }

  /* Cartel de parte/acto que aparece al empezar una parte nueva o un acto nuevo. */
  function bannerHTML(index) {
    const m = META[index];
    let html = '';
    if (m.newPart) html += `<div class="h2-part-banner">${esc(m.partTitle)}</div>`;
    if (m.newAct)  html += `<div class="h2-act-banner">📍 ${esc(m.act)}</div>`;
    return html;
  }

  function chipsHTML(ids) {
    return (ids || []).map(id => {
      const b = baseOf(id);
      if (!b) { console.warn('[historia2] personaje no encontrado:', id); return ''; }
      return `<div class="story-chip"><img src="${esc(b.img)}" alt="" onerror="this.style.display='none'"><span>${esc(b.name)}</span></div>`;
    }).join('');
  }

  const body = () => byId('h2-body');
  const scrollDown = () => { const sc = byId('hist2-screen'); if (sc) sc.scrollTop = sc.scrollHeight; };

  /* ---------------- Vistas ---------------- */
  function renderStart() {
    const furthest = loadProgress();
    const canContinue = furthest > 0 && furthest < CHAPTERS.length;
    const parts = [];
    for (let p = 1; p <= partCount(); p++) {
      const unlocked = furthest >= partStart(p);
      parts.push(`<div class="h2-part-card${unlocked ? '' : ' locked'}">
        <b>${unlocked ? '' : '🔒 '}${esc(partTitleOf(p))}</b>
        <small>${unlocked ? 'Disponible' : 'Termina la parte anterior para desbloquearla'}</small>
      </div>`);
    }
    const partButtons = [];
    for (let p = 1; p <= partCount(); p++) {
      if (furthest >= partStart(p) && (p === 1 || furthest >= partStart(p))) {
        partButtons.push(`<button class="class-btn h2-part-btn" data-p="${p}">${p === 1 ? '▶' : '⏭'} Empezar la Parte ${p === 1 ? 'I' : 'II'}</button>`);
      }
    }
    body().innerHTML = `
      <div class="story-narrative story-fade">
        <span class="story-type-badge">🌌 Historia 2</span>
        <h3>${esc(HIST2_TITLE)}</h3>
        <p class="story-line story-line--narration">Un guardián de cadáveres, un Reloj que se detiene y, bajo el Nexo, un reino de demonios que lleva siglos esperando. En esta historia aparecen los ${CHARACTERS.length} personajes del juego.</p>
        <div class="h2-parts">${parts.join('')}</div>
        ${canContinue ? `<p class="story-line story-line--narration">Progreso guardado: Parte ${META[furthest].part}, escena ${furthest + 1} de ${CHAPTERS.length}.</p>` : ''}
        <div class="story-actions">
          ${canContinue ? '<button id="h2-continue" class="class-btn story-btn-primary">▶ Continuar</button>' : ''}
          ${canContinue ? '' : '<button id="h2-begin" class="class-btn story-btn-primary">▶ Empezar</button>'}
          ${canContinue ? '<button id="h2-chapters" class="class-btn">📜 Elegir escena</button>' : ''}
          ${canContinue ? '<button id="h2-restart" class="class-btn">⟲ Empezar de nuevo</button>' : ''}
        </div>
        ${partButtons.length > 1 ? `<div class="story-actions" style="margin-top:6px">${partButtons.join('')}</div>` : ''}
      </div>`;
    const on = (id, fn) => { const el = byId(id); if (el) el.addEventListener('click', fn); };
    on('h2-continue', () => go(furthest));
    on('h2-begin', () => { resetProgress(); go(0); });
    on('h2-restart', () => { if (confirm('¿Seguro? Se borrará tu progreso en esta historia.')) { resetProgress(); go(0); } });
    on('h2-chapters', renderChapterList);
    body().querySelectorAll('.h2-part-btn').forEach(el =>
      el.addEventListener('click', () => go(partStart(Number(el.dataset.p)))));
  }

  function renderChapterList() {
    const furthest = loadProgress();
    let html = '', lastPart = 0, lastAct = '';
    CHAPTERS.forEach((c, i) => {
      if (i > furthest) return;
      const m = META[i];
      if (m.part !== lastPart) { html += `<div class="h2-list-part">${esc(partTitleOf(m.part))}</div>`; lastPart = m.part; lastAct = ''; }
      if (m.act !== lastAct)   { html += `<div class="h2-list-act">${esc(m.act)}</div>`; lastAct = m.act; }
      html += `<button class="class-btn h2-ch" data-i="${i}">${c.type === 'battle' ? '⚔' : '📖'} ${esc(c.title)}</button>`;
    });
    body().innerHTML = `
      <div class="story-narrative story-fade">
        <span class="story-type-badge">📜 Escenas desbloqueadas</span>
        <h3>${esc(HIST2_TITLE)}</h3>
        <div class="h2-list">${html}</div>
        <div class="story-actions"><button id="h2-back" class="class-btn">◀ Volver</button></div>
      </div>`;
    byId('h2-back').addEventListener('click', renderStart);
    body().querySelectorAll('.h2-ch').forEach(el =>
      el.addEventListener('click', () => go(Number(el.dataset.i))));
  }

  function go(index) { H.index = index; H.shown = 1; renderChapter(); }

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
      // Las escenas largas se muestran por páginas para que se lean con calma.
      const pages = Math.max(1, Math.ceil((ch.lines || []).length / LINES_PER_PAGE));
      const shownLines = (ch.lines || []).slice(0, H.shown * LINES_PER_PAGE);
      const more = H.shown < pages;
      body().innerHTML = `
        <div class="story-narrative${H.shown === 1 ? ' story-fade' : ''}">
          ${progressHTML(H.index, '📖 Narración')}
          ${H.shown === 1 ? bannerHTML(H.index) : ''}
          <h3>${esc(ch.title)}</h3>
          ${H.shown === 1 && ch.cast && ch.cast.length ? `<div class="story-vs-label">En esta escena</div><div class="story-vs-chips h2-cast">${chipsHTML(ch.cast)}</div>` : ''}
          ${formatLines(shownLines)}
          <div class="story-actions">
            ${more
              ? `<span class="small" style="align-self:center">${H.shown} / ${pages}</span><button id="h2-more" class="class-btn story-btn-primary">Seguir ▶</button>`
              : '<button id="h2-next" class="class-btn story-btn-primary">Continuar ▶</button>'}
          </div>
        </div>`;
      const nextBtn = byId('h2-next'), moreBtn = byId('h2-more');
      if (moreBtn) moreBtn.addEventListener('click', () => { H.shown += 1; renderChapter(); scrollDown(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { go(H.index + 1); });
      return;
    }

    if (ch.type === 'battle') {
      body().innerHTML = `
        <div class="story-narrative story-fade">
          ${progressHTML(H.index, '⚔ Combate')}
          ${bannerHTML(H.index)}
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

    // Parte II: canción propia si existe; si no, la de la Parte I.
    if (META[H.index].part >= 2) playMusic(MUSIC_BATTLE_2, MUSIC_BATTLE);
    else playMusic(MUSIC_BATTLE);

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
      if (won) go(H.index + 1);
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
    .h2-list .h2-ch{text-align:left}
    .h2-list-part{margin-top:10px;font-weight:800;font-size:15px;color:#fcd34d}
    .h2-list-act{margin-top:4px;font-size:12px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:#7dd3fc}
    .h2-part-banner{margin:2px 0 6px;padding:10px 14px;border-radius:12px;font-weight:900;font-size:17px;text-align:center;
      color:#fff;background:linear-gradient(90deg,rgba(220,38,38,.35),rgba(251,191,36,.25));border:1px solid rgba(248,113,113,.4)}
    .h2-act-banner{margin:0 0 8px;font-size:12.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#7dd3fc}
    .h2-parts{display:grid;gap:8px;margin:12px 0}
    .h2-part-card{padding:10px 14px;border-radius:12px;border:1px solid rgba(56,189,248,.28);background:rgba(255,255,255,.035)}
    .h2-part-card.locked{opacity:.45}
    .h2-part-card small{display:block;color:#94a3b8;margin-top:2px}`;
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
  window.HISTORIA2 = { open: openScreen, chapters: CHAPTERS, meta: META, loadProgress, resetProgress, go };
})();
