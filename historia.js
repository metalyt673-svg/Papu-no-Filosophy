/* historia.js
   Guion del Modo Historia: "Papu no Filosophy".
   Se carga en juego.html DESPUÉS de personajes.js y ANTES de game.js
   (game.js usa las variables STORY_TITLE, STORY_COVER y STORY_CHAPTERS).

   Cada capítulo es de tipo:
   - 'narrative': texto de historia, sin combate. Se avanza con "Continuar".
   - 'battle': una batalla scripted. heroIds/villainIds son ids de personajes
     ya existentes en personajes.js. El motor los clona automáticamente.

   Para añadir/editar capítulos solo hay que tocar este archivo.

   Reparto:
   Villano final: Papudo.
   Aliados fijos de Papudo: Simon, Dopiko, Guijarro, Paya, Minion, Pancha Peluda.
   Mano derecha de Papudo: Señor Holograma.
   Traidores cruzados: Adam (empieza villano, se redime) y Butifarra (empieza
   héroe, traiciona a Carlos).
   Héroe: Carlos. Aliados fijos: Santi, Presi, Lukraz, Guti, Maka Monster, Negro.
*/

const STORY_TITLE = 'Papu no Filosophy';
const STORY_COVER = 'personajes/papu no filosophy.jpg';

const STORY_CHAPTERS = [

  {
    type: 'narrative',
    title: 'Prólogo — El arjé de la filosofía',
    speaker: 'Narrador',
    lines: [
      'Un día como cualquier otro en la clase de filosofía de Carlos...',
      'Carlos: ¡Buenas tardes, niños! Tengo que avisaros, Roberto ha amenazado con que ha llegado el día de su rebelión. Me ha dicho que vendrá con todo su ejército.',
      'Guti: ¡Le hacemos la del motor inmóvil, profe!',
      'Presi: ¡Estamos dispuestos a luchar a tu lado, Carlos!',

      'De repente, llega una nota por la puerta.',
      'Maka: ¡AHH! ¡¡PROFEEE, NOS INVADEEEEN!!',
      'Santi: Es solo una nota chaval, tranquilo.',
      'La nota cae al suelo y de ella sale un simio holográfico que narra lo siguiente:',
      'Señor Holograma: *bzzzt* "¡Os advertí que este día llegaría! Carlitos, prepara a tus 8 estudiantes más fuertes y traelos al techo de inmediato. Aquí realizaremos combates 1v1 hasta que uno se rinda... o muera. ¿Cuáles son las normas? Muy simple. ¡NO HAY! Nos vemos pronto... atentamente, Roberto." *bzzzt*',
      'Carlos: ¡Maldito Papudo-! Digo, Roberto... Chicos, si perdemos esta guerra, lo más seguro es que Robert se apodere del instituto y hasta del mundo. De verdad, no entiendo por qué hace esto...',
      'Cuando todo parece perdido en el aula, un estudiante se levanta, y detras de él, otro, y otro, y otro... Carlos los observa con orgullo, y se da cuenta de que ya tiene a sus 8 guerreros para este combate.',
      'Carlos: ¡G-Gracias, chicos! Entonces, está decidido. ¡VAMOS A SALVAR EL INSTITUTO!',
      'Por último, un estudiante más se levanta.',
      '???: ¡Profe! No estoy seguro de tener la fuerza suficiente para luchar, ¡pero me ofrezco a narrar las batallas para evitar que hayan injusticias y poder informar a los demás de clase sobre los ganadores!',
      'Carlos: Aprecio tus ganas de ayudar, ¡vente con nosotros!',
      'Y con eso, Carlos y sus estudiantes se dirigieron al campo de batalla...',
    ]
  },
{
    type: 'narrative',
    title: 'Prólogo — ¡Preparados para la batalla!',
    speaker: 'Narrador',
    lines: [
      'Mientras Carlos marchaba con sus estudiantes elegidos hacia la arena, al horizonte vió la silueta del otro profesor de filosofía con sus guerreros, cada uno de distinta apariencia.',
      'Papudo: Así que te has decidido por aparecerte, ¿eh?',
      'Carlos: Te arrepentirás de esto, Robert. ¡Mis alumnos darán su máximo esfuerzo y te derrotarán!',
      'Detrás de él, los guerreros de Carlos exclamaban gritos de apoyo y emoción, y uno que otro "¡Puto Papudo!".',
      'Papudo: Eso ya lo veremos, Carlitos.', 'Respondió Papudo, con una expresión de asco, antes de alejarse e ir hacia su equipo.',
      'Carlos: Confío en vosotros chicos, la victoria está asegurada. ¡Presentaros!', 'Y así, el primer guerrero saltó entre los demás, usando todo su esfuerzo para no tropezarse... ¡MAKA!',
      'Maka: ¡ESA ES! ¡¡PERO BUEEENOOOO!!', 'De repente, el grito de Maka hizo que un estudiante con la mirada perdida volviese a concentrarse en sus alrededores... ¡LUKRAZ!',
      'Lukraz: ¡Eh! ¡Las Bitcoin están subiendo, profe!', 'No muy lejos de él, un chico se burlaba del extraño comportamiento de su amigo, y con confianza, se presentó... ¡SANTIAGO!',
      'Santi: ¡No necesitaré ni entrar al ring!', 'A su lado, se encontraba su mejor amigo, el delegado de la clase, el gorila, la leyenda... ¡EL PRESI!',
      'Presi: ¡¡BABUUUUUBAAA!!', 'La energía que desprendían estos dos fue suficiente para animar a su tercer amigo, y como quien no quiere la cosa, se presentó... ¡GUTI!',
      'Guti: ¡Mi genio maligno me dice que ya hemos ganado!', 'De entre las sombras, salió un señor al que apodaban "Judas" por su intento de abandonar bachillerato, este señor era el... ¡NEGRO!',
      'Negro: Ni me he despeinado.', 'Detrás de él, se camuflaba otro de los guerreros de Carlos, el de los mil nombres, "Nite", "Mario", pero el más famoso de todos... ¡BUTIFARRA!',
      'Butifarra: Je, hasta una butifarra le ganaría a esos.', 'Entonces, salió un chico que estaba muy ocupado en otros asuntos como para presentarse antes... ¡ORCASITAS!',
      'Orcasitas: ¡Venid a por mí... minitas!', 'Y por último, de entre ellos se asomó el estudiante dispuesto a narrar las batallas.',
      'Nicktula: ¡Profe! ¡Estoy listo para evitar las injusticias en este ring!',
      'Carlos: Entonces... estamos listos para la guerra. Por el poder del ser, ¡¡al ataque, chicos!!', 
     ]
  },

  {
    type: 'battle',
    title: 'Capítulo 1 — Maka vs la Paya',
    loseToProgress: true, // esta pelea está pensada para perderse: rendirse también avanza la historia
    intro: [
      'Nicktula: ¡Vale, chicos, tenemos nuestro primer combate del día! Maka versus... ¡la Paya!',
      'Desde un costado del ring, se sube una chica con una gran katana y una mandíbula marcada, es imposible saber cuál de las dos corta más...',
      'Paya: Venga, ¡entra al ring!', 'Mientras tanto, los compañeros de Maka discutían entre ellos.',
      'Presi: ¿Crees que saldrá vivo de esta, compa?', 'Santi: Tú sueñas mucho, chaval.', 'Al oír estas acusaciones, a Maka no le quedó otra opción.',
      'Maka: EGHH. ¡ME TENDRÉ QUE TRANSFORMAR EN... MAKA MONSTER!', 'Entonces, el chico tomó una forma de un bicho grotesco con tentáculos y, sin pensarlo dos veces, se subió al ring.',
      'Paya: ¿Crees que eso te va a salvar?', 'Dijo la Paya con un tono burlón, antes de arrojarse hacia su oponente con su katana desenvainada.',
    ],
    heroIds: ['maka_monster'],
    villainIds: ['paya'],
    victory: [
      'La Paya, al presentir su derrota, arroja su katana fuera del ring en una rabieta y esta impacta contra la cabeza de Lukraz, matándole por accidente.',
      'Presi: ¡NOOOO, HIJA PUTA!',
      'NO PODEMOS PERMITIR QUE PASE ESTO, INTÉNTALO DE NUEVO... ¿TAL VEZ NO SE SUPONE QUE DEBERÍAS GANAR? LUEGO LO ENTENDERÁS...',
    ],
    defeat: [
      'Maka: L-LO SIENTO, CARLOS... QUERÍA SER MÁS ÚTIL.',
      'Ante tantos cortes y heridas, Maka Monster por fin cede, pierde la consciencia y... cae muerto al suelo.',
      'Nicktula: ¡N-No puede ser! ¡Maka ha muerto! Vamos 1-0, g-ganando el equipo Papudo...',
      'Paya: Mierda... he perdido mi brazo y ese cabrón ha roto mi espada, ¡pero gané!',
      'Los compañeros de Maka discutían sobre la muerte de este.', 'Orcasitas: Joder, pues casi gana Maka...', 'Santi: Ya, bueno, mucho ha durado...',
      'Desde el otro extremo de la arena, Papudo hablaba entre risas.', 'Papudo: ¡Parece que tus chicos no son tan fuertes después de todo, Carlitos!',
      'Carlos: No le hagáis caso, niños, estoy seguro de que ganaremos la siguiente, ¡no os rindáis todavía!',
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 2 — Santiago vs la Pancha peluda',
    intro: [
      'El ambiente que rodeaba al equipo Carlos era cada vez más pesado, hasta que un chico habló por todos con valentía.', 'Santi: Carlos tiene razón, ¡tenemos que seguir luchando!',
      'Nicktula: ¡Está bien, chicos! La siguiente pelea es... ¡Santi versus la Pancha Peluda!', 'Al oír su nombre, los ojos de Santi casi se le salen de las cuencas. Subiéndose al ring, una chica esbelta con un kimono e interminable pelaje notó la reacción de su oponente y no tardó en burlarse de él.', 'Pancha: ¿Qué te pasa, me tienes miedo? ¡JAJAJAJA!',
      'Santi: ¡¿Yo?! ¡Ya verás!', 'Santi subió al ring y se preparó para luchar.', 'Nicktula: Preparense, y... ¡luchen!', 'Mientras más avanzaba el round, Santi ganaba ventaja sobre la Pancha, hasta que esta sacó un truco de debajo de su manga...', 'La Pancha arrancó un pelo de su frondosa barba y lo disparó con gran velocidad al ojo de Santi, este quedó cegado y ella aprovechó para tirarlo al suelo de un golpe.', 'Nicktula: ¡No! La Pancha está usando trucos sucios contra Santi, ¡levantate, tú puedes!', 'Pancha: Preparate para morir, pequeñín...', 'Santi, en el suelo, escuchando las voces de sus compañeros animándole, tomó todas las fuerzas que le quedaban y apretó su colgante con fuerza, ¡y entonces...!', 'Nicktula: ¿QUÉ ESTÁ PASANDO? ¡Hay dos figuras nuevas en el ring!', 'Santi, mientras se levantaba y se apoyaba en sus nuevos aliados, dijo con una sonrisa...', 'Santi: ...Preparate tú.',
    ],
    heroIds: ['santi', 'astolfo', 'marx'],
    villainIds: ['pancha_peluda'],
    victory: [
      'La Pancha estaba completamente abrumada, le era imposible defenderse de tantos golpes, se le veía bastante mareada y desconcertada.', 'Nicktula: ¡SANTI ESTÁ REMONTANDO JUNTO CON SUS INVOCACIONES! ¡La Pancha está a punto de caer...!', 'La Pancha, con su cabeza dando mil vueltas, se apoyó en el esquinero para recuperar su compostura. De repente, vió una figura frente a ella que le agarraba de la cabeza y la observaba fijamente. No con rabia, sino con algo mucho peor...', 'Santi: No te preocupes, no soy un salvaje, no te mataré...', 'La Pancha suspiró con alivio, un suspiro que fue rápidamente cortado.', 'Santi: Solo te voy a envíar a un lugar que te hará reflexionar...', 'La sonrisa de Santi se agrandaba, y la figura de la Pancha desaparecía mientras que el miedo llenaba sus ojos.', 'Pancha: ¿Q-Qué? ¿Dónde e-estoy?', 'Jeffrey: Bienvenida a la isla, pequeña...', 'Pancha: ¡AHH-', 'De vuelta en el ring, Santi celebraba la victoria junto con sus compañeros.', 'Carlos: ¡MUY BIEN, SANTI!', 'Nicktula: ¡SANTI HA GANADO! ¡EMPATAMOS 1-1 CONTRA EL PAPUDO!', 'El Papudo los observaba con rabia, murmurando a sí mismo.', 'Papudo: No cantéis victoria todavía...',
    ],
    defeat: [
      'Santi volvió a caer al suelo, pero esta vez, Astolfo y Marx desaparecieron con el viento.', 'La Pancha seguía riéndose mientras sostenía a Santi contra el esquinero del ring.',
      'Santi vió una última vez a sus compañeros y murmuró.', 'Santi: ...Vaya.', 'Y con esto, Santi cayó derrotado al suelo.', 'VUELVE A INTENTARLO, ESTO NO PUEDE PASAR.',
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 3 — Guti vs la Minion',
    intro: [
      'Ante la remontada de Santiago, el equipo Carlos esperaba con ansías el anunciamiento de la siguiente ronda.', 'Nicktula: ¡Señoras y señores! ¡La siguiente pelea que vamos a presenciar es... ¡Guti versus la Minion! ¡JAJAJAJA, que nombre tan tonto!', 'Guti: ¿La Minion? Ese nombre es un mierdón, pero seguro eso significa que será un fuerte oponente.', 'Del otro lado del ring, Papudo replicaba.', 'Papudo: Os reís ahora, pero no habrá tanta risa cuando destruyan a vuestro compañero de color cartón. ¡LIBEREN A LA MINION!', 'De repente, una gran neblina se forma y de ella sale...', 'Guti: No puede ser...', 'Una señora con forma de Minion (y estatura también) sale de la neblina y, aunque con mucho esfuerzo de por medio, se sube al ring.', 'Minion: Te voy a derrotar sin esfuerzo. Para cuando estés en el suelo, ¡tendrás pronunciación perfecta en inglés!', 'Guti usa toda su fuerza para no explotar en risas y se une a su oponente en el ring.', 'Minion: Grrr... Fight, bitch!', 'Guti: (No puedo tomarmele en serio... le dejaré un poco de ventaja.)', 'Piensa Guti al ver a su oponente de tamaño reducido.', 'Nicktula: Sin más que comentar... ¡luchen!',
    ],
    heroIds: ['guti'],
    villainIds: ['minion'],
    victory: [
      'La Minion al no poder hacer más que curarse a sí misma, hacia cualquier cosa por dañar a Guti.', 'Le tiraba shurikens de papel, le disparaba con una pistola de agua, le gritaba lecciones de rephrasing con un micrófono... y el único daño que salió de Guti era en sus oídos y en su paciencia.', 'Cansado de tanta compasión, Guti se preparó para tirar un golpe en serio.', 'Guti: Está bien... ¡ahí voy!', 'Guti: ¡OSTIA!', 'Guti no logró medir su fuerza correctamente y accidentalmente aplastó a la Minion, dejando tan solo una marca roja en el suelo.', 'Nicktula: ¡JAJAJAJAJAJA! ¡VAYA PELEA! ¡Vamos 2-1, ganando el equipo Carlos!', 'Los chicos celebraban la segunda victoria mientras Papudo se enfadaba y gritaba a su equipo.', 'Papudo: ¡JODER! ¡¿Quién ha pensado que era buena idea reclutar a esa para el combate?!', '???: Pues has sido tú, mierdecilla.', '???: Has sido tú, profe.', '???: ¿Me puedo tomar unas vacaciones ya?', 'Papudo: ¡C-Cállense! Si no ganais para mí, ¡arruinaré vuestras vidas!', 'Del otro lado, Carlos animaba a su equipo.', 'Carlos: Parece que no le está yendo tan bien a Robert, jeje... ¡seguid así, chicos!',
    ],
    defeat: [
      'La Minion daba todo su esfuerzo y potencial en tirar cualquier cosa a Guti, hasta que uno de sus shurikens le da en el ojo y se le clava.', 'Guti: ¡AHHHH! ¡QUITENMELO!', 'En un intento de quitarse el arma de papel del ojo, Guti accidentalmente le prende fuego con sus poderes y, entre gritos de dolor, se quema vivo.', 'Carlos: ...¿Será subnormal el Robin?', 'Minion: ¡Jijijiji! Such a weak opponent!', '...¿HAS PERDIDO A PROPÓSITO, VERDAD? INTÉNTALO DE NUEVO, ANDA.',
    ]
  },

  {
    type: 'narrative',
    title: 'Un nuevo sentimiento...',
    speaker: 'Narrador',
    lines: [
      'Guti se alegraba de ver a sus amigos y compañeros celebrar su victoria, pero cuando volteaba a ver los restos de la Minion, no sentía repulsión... de hecho, sentía cierta atracción hacia esa destrucción que causó con sus propias manos...', 'No podía dejar de mirarlo fijamente...', 'Santi: Guti, ¿qué miras?', 'Guti volvió a la realidad del tirón.', 'Guti: ¿Eh? Ah, nada, nada...', 'Guti decidió ignorar esa satisfacción... por ahora.',
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 4 — Lukraz vs Simon',
    intro: [
      'Nicktula: "ESTO SI QUE PODEMOS DECIR QUE ES UNA PELEA DIGITAL, solo miren cuantos mecanismo complejos y códigos están usando".',
      'Nicktula: "no puedo dejar de reirme, Lukraz usó a chat gpt para dejar calvo al Simon, parece que le ha sentado muy mal, Lukraz por favor no la cagues".'
    ],
    heroIds: ['lukraz', 'chatgpt'],
    villainIds: ['simon'],
    victory: [
      'Nicktula: "Lukraz está usando su famoso ataque papucoin, DIOS! parece que ha reventado a Simon con ese golpe, AY NO, Simon... SIGUE VIVO!".',
      'Nicktula: "parece que hasta ha vuelto de la muerte, por poco derrota a Lukraz, no se quiso dejar vencer. Esto da un 1-3 de resultado favoreciendo a Carlos YIIPEEE!!!".'
    ],
    defeat: [
      'Ni un parpadeo. Paya se retira invicta, con el mewing intacto.',
      'Carlos aprieta los puños: la próxima vez será distinto.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 5 — Orcasitas vs Señor Holograma',
    loseToProgress: true, // esta pelea está pensada para perderse: rendirse también avanza la historia
    intro: [
      'Nicktula: "Orcasitas NOOOOOO, resiste!!".',
      'Nicktula: "la pelea ha sido tan breve que no me dio tiempo a procesarla, menos mal que Orcasitas perdió pero con vida, phew".'
    ],
    heroIds: ['carlos'],
    villainIds: ['senor_holograma'],
    victory: [
      'Nicktula: "concluimos con un 2-3, Carlos no te rindas!! tenemos que ganar las demás".',
      'Nicktula: "Orcasitas, no te preocupes, solo prepárate para ganar la próxima vez que luches de nuevo".'
    ],
    defeat: [
      'Guijarro remata con una cita imposible de rebatir. El grupo se retira, confundido y sin argumentos.',
      'Tocará volver a la biblioteca a estudiar mejor la estrategia.'
    ]
  },

  {
    type: 'narrative',
    title: 'El momento de la sospecha',
    speaker: 'Narrador',
    lines: [
      'Adam está sentado cerca de Papudo, se le ve algo indeciso, como si no supiese si ayudar al Papudo es lo correcto realmente.',
      'Aún sin decidirse, es llamado para luchar el siguiente combate y sin más tiempo de pensar, se dispone a intentar ganarlo.',
      'Papudo parece reirse, como si supiera que estos resultados hasta ahora estuviesen yendo como el había planeado.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 6 — el Presi vs Adam',
    intro: [
      'Nicktula: "OMG, tenemos a los dos titanes de ambos equipos en el ring! parece que será una batalla a pura fuerza bruta".',
      'Nicktula: Presi, lánzanos tu grito de guerra, queremos escuchas ese BABUUUBAAAA!!".'
    ],
    heroIds: ['presi'],
    villainIds: ['adam'],
    victory: [
      'Nicktula: "Adam tiene su forma Oliva, además, ESTÁ CONTRARRESTANDO LOS GOLPES DEL PRESI".',
      'Nicktula: "siempre confié en mi hombre, el Presi consigue ganar esta batalla! 2-4 para Carlos".'
    ],
    defeat: [
      'Butifarra ríe entre la niebla mientras se retira victorioso.',
      'Carlos aprieta los puños. Habrá revancha.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 7 — Negro vs Dopiko',
    loseToProgress: true, // esta pelea está pensada para perderse: rendirse también avanza la historia
    intro: [
      'Dopiko es llamado para luchar, parece un animal con un mínimo de comprensión solo para saber cuando destrozar a su presa, todos parecen temblar al verlo.',
      'Nicktula: "mi Negro y favorito contra Dopiko! no se por qué tiene una cara de burro pero no te dejes intimidar Negro!!".'
    ],
    heroIds: ['negro'],
    villainIds: ['dopiko'],
    victory: [
      'Nicktula: *sin saber que decir, con la boca abierta ante el suceso* ne-nn-n-negro...".',
      'Papudo: "ya que el comentarista no lo dice, lo diré yo, 3-4, ya estamos remontando jejeje".'
    ],
    defeat: [
      'Entre curas y abrazos, el dúo aguanta cada embate. Carlos y los suyos se retiran a recuperar fuerzas.',
      'Necesitarán un plan mejor contra dos sanadores a la vez.'
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo 8 — Nite vs Guijarro',
    loseToProgress: true, // esta pelea está pensada para perderse: rendirse también avanza la historia
    intro: [
      'Nicktula: "NO PROFE, QUE HACES CON EL PAPUDO!! tú no que me caes bien aaaahhhhhh".',
      'Nicktula: *después de un rato luchando* Guijarro no deja de jugar con Butifarra como quiere, está actuando raro, ha sacado un poema y lo está recitando en medio de la pelea, que cojones".'
    ],
    heroIds: ['butifarra'],
    villainIds: ['guijarro'],
    victory: [
      'Nicktula: "el poema era un truco de hipnosis, que mal, el Nite se ha cambiado al lado del papudo. NOS QUEDAMOS EN DESVENTAJA!".',
      'Nicktula: "empate en resultados, 4-4".'
    ],
    defeat: [
      'La señal del Señor Holograma es demasiado fuerte. El grupo se retira a reagrupar fuerzas.',
      'Papudo, desde la distancia, observa satisfecho.'
    ]
  },

  {
    type: 'narrative',
    title: 'EL empate',
    speaker: 'Narrador',
    lines: [
      'Nicktula: " al tener un empate, haremos una segunda y última ronda para decidir el futuro de todo, los aliados disponibles de Carlos son: el Presi, Guti, Santiago, Lukras y orcasitas está fuera, pero con esperanzas de volver".',
      '"Estos serán los emparejamientos de la segunda ronda: Santiago vs la Paya, Orcasitas si se recupera vs ¡¿Señor Holograma de nuevo?!, Guti vs el Nite, por qué nos tuvo que pasar esto ;_; Lukraz vs Guijarro y el Presi vs Dopiko."',
      'Papudo es interceptado intentando sabotear a Carlos, Calvencio, un alumno no elegido para luchar golpea a Papudo para que no pueda sabotear nada pero este se defiende con sus papadas. Calvencio acaba en el suelo dolorido pero llega Carlos justo a tiempo para ayudarlo y frenar a Papudo. "Las peleas en el ring", dice Carlos. "Por supuesto, buena suerte en la segunda ronda", dice el Papudo y se retira con los suyos.',
    ]
  },

  {
    type: 'battle',
    title: 'Capítulo final — Calvencio',
    intro: [
      'Para terminar con la primera parte de la historia, una pelea bonus de calvencio con Papudo!.',
      'Solo el mas fuerte sobrevive.'
    ],
    heroIds: ['calvencio'],
    villainIds: ['papudo'],
    victory: [
      'Papudo cae de rodillas. "Quizás... quizás mi argumento tenía un fallo lógico", admite por primera vez en su vida.',
      'Carlos: "No os durmáis chicos, nos toca prepararnos para la segunda ronda, esta la debemos ganar!".'
    ],
    defeat: [
      '"¿Lo veis?", ríe Papudo. "Nadie puede refutar la Verdad Absoluta."',
      'Pero Carlos no se rinde. Volverán a intentarlo.'
    ]
  },

  {
    type: 'narrative',
    title: 'Fin de la S1-Papu no Filosophy',
    speaker: 'Narrador',
    lines: [
      'Papudo se retira para entrenar a los suyos en la segunda ronda.',
      'Carlos, Santi, Presi, Lukraz, Guti y Orcasitas celebran la victoria juntos.',
      'Dopiko, Guijarro, Paya, el Señor Holograma y Butifarra... ya se les ocurrirá algo para la próxima.',
      '— FIN —',
      '(¿O es solo el principio de "Papu no Filosophy-S2"?)'
    ]
  }
];
