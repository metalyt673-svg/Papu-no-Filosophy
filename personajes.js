/* personajes.js
   Datos de todos los personajes jugables.
   Las imágenes viven en la carpeta personajes/ (personajes/nombre.png, .jpg, .gif...).
   Se carga en juego.html ANTES que game.js (game.js usa la variable CHARACTERS).

   IMPORTANTE:
   - CHARACTERS = personajes disponibles en los modos de batalla libre
     (PvP, PvE, con/sin baneos, glosario, etc.).
   - STORY_ONLY_CHARACTERS = personajes EXCLUSIVOS del Modo Historia. Existen en
     el juego (historia.js puede usarlos en heroIds/villainIds), pero NO aparecen
     en la selección, baneos, IA aleatoria ni glosario de los modos libres.
     Para hacer exclusivo a otro personaje, muévelo de CHARACTERS a este array.
*/

const CHARACTERS = [


{
  id: 'vexoria',
  name: 'Vexoria the Sun Eater',
  img: 'personajes/vexoria.jpg',
  classes: ['atacante', 'control'],
  hp: 125,
  atk: 26,
  def: 16,
  spd: 19,

  moves: [
    {
      id: 'vex1',
      name: 'Mordida Solar',
      power: 22,
      acc: 0.97,
      desc: 'Vexoria ordena a sus serpientes atacar al enemigo mientras absorben parte de su energía.',
      baseCooldown: 0,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 5,
          duration: 2,
          prob: 0.9
        },
        {
          type: 'selfHealPct',
          value: 5
        }
      ]
    },

    {
      id: 'vex2',
      name: 'Eclipse de la Serpiente',
      power: 25,
      acc: 0.94,
      desc: 'Vexoria cubre al enemigo con una sombra solar que reduce su DEF y SPD.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 0.95
        },
        {
          type: 'slow',
          value: 15,
          duration: 2,
          prob: 0.9
        }
      ]
    },

    {
      id: 'vex3',
      name: 'Devoradora del Sol',
      power: 0,
      acc: 1.0,
      desc: 'Vexoria absorbe energía solar para fortalecerse, aumentando temporalmente su ATK y recuperando parte de sus HP.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 10,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        },
        {
          type: 'selfHealPct',
          value: 0.04
        }
      ]
    },

    {
      id: 'vex4',
      name: 'ULTI: Sun Eater',
      power: 30,
      acc: 0.90,
      desc: 'Vexoria desata su poder de Devoradora del Sol, envolviendo al enemigo en una gigantesca explosión solar mientras absorbe su energía.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 12,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 20,
          duration: 3,
          prob: 0.9
        },
        {
          type: 'selfHealPct',
          value: 0.08
        }
      ]
    }
  ]
},

{
  id: 'saitama',
  name: 'Saitama',
  img: 'personajes/saitama.jpg',
  classes: ['atacante'],
  hp: 135,
  atk: 30,
  def: 18,
  spd: 16,

  moves: [
    {
      id: 'sai1',
      name: 'Puñetazo Normal',
      power: 25,
      acc: 0.99,
      desc: 'Saitama lanza un simple puñetazo que causa un daño considerable.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 2,
          prob: 1.0
    },

    },

    {
      id: 'sai2',
      name: '¡Un Poco Más Fuerte!',
      power: 0,
      acc: 1.0,
      desc: 'Saitama se prepara para golpear con más fuerza. Potencia temporalmente su ATK, haciendo que su próximo Puñetazo Normal sea mucho más poderoso.',
      baseCooldown: 2,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 2
        }
      ]
    },

    {
      id: 'sai3',
      name: 'Puñetazo Serio',
      power: 0,
      acc: 1.0,
      desc: 'Saitama concentra una enorme cantidad de fuerza. Su próximo Puñetazo Normal obtiene un gran aumento de poder.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 15,
          duration: 2
        }
      ]
    },

    {
      id: 'sai4',
      name: 'ULTI: Puñetazo Serio',
      power: 38,
      acc: 0.88,
      desc: 'Saitama deja de contenerse y lanza un golpe devastador capaz de atravesar las defensas del enemigo.',
      baseCooldown: 16,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 15,
          duration: 2,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 20,
          duration: 2,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'emu_ootori',
  name: 'Ootori Emu',
  img: 'personajes/ootori emu.jpg',
  classes: ['soporte', 'atacante'],
  hp: 110,
  atk: 25,
  def: 13,
  spd: 25,

  moves: [
    {
      id: 'emu1',
      name: 'Wonderhoy!',
      power: 23,
      acc: 0.98,
      desc: '¡Emu salta hacia el enemigo con una enorme sonrisa y realiza un ataque acrobático!',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'tempSpd',
        value: 4,
        duration: 2
      }
    },

    {
      id: 'emu2',
      name: 'Salto Acrobático',
      power: 24,
      acc: 0.94,
      desc: 'Emu realiza una espectacular acrobacia y golpea al enemigo desde el aire, reduciendo temporalmente su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2,
        prob: 0.9
      }
    },

    {
      id: 'emu3',
      name: '¡Sonrisas Para Todos!',
      power: 0,
      acc: 1.0,
      desc: 'Emu anima a todos con su energía y entusiasmo, aumentando temporalmente su ATK y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'emu4',
      name: 'ULTI: ¡Wonder Magical Showtime!',
      power: 30,
      acc: 0.92,
      desc: 'Emu convierte el campo de batalla en un espectáculo lleno de energía, atacando al enemigo mientras inspira a sus aliados.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 0.9
        },
        {
          type: 'tempAtk',
          value: 7,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 4,
          duration: 3
        }
      ]
    }
  ]
},

{
  id: 'orochimaru_f',
  name: 'Orochimaru',
  img: 'personajes/orochigirl.jpg',
  classes: ['control', 'debilitador', 'soporte'],
  hp: 125,
  atk: 25,
  def: 16,
  spd: 20,

  moves: [
    {
      id: 'oro1',
      name: 'Manos de Serpientes Ocultas',
      power: 22,
      acc: 0.97,
      desc: 'Orochimaru invoca numerosas serpientes que atacan al enemigo y pueden paralizarlo.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'slow',
        value: 10,
        duration: 2,
        prob: 0.9
      }
    },

    {
      id: 'oro2',
      name: 'Espada Kusanagi',
      power: 24,
      acc: 0.94,
      desc: 'Orochimaru utiliza la legendaria Kusanagi para realizar un ataque preciso que atraviesa las defensas del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 3,
        prob: 0.9
      }
    },

    {
      id: 'oro3',
      name: 'Poder de la Serpiente Blanca',
      power: 0,
      acc: 1.0,
      desc: 'Orochimaru regenera su cuerpo y adopta características de la Serpiente Blanca, recuperando vida y aumentando temporalmente su DEF.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'selfHealPct',
          value: 0.6
        },
        {
          type: 'tempDef',
          value: 10,
          duration: 3
        }
      ]
    },

    {
      id: 'oro4',
      name: 'ULTI: Técnica de Ocho Ramificaciones',
      power: 30,
      acc: 0.90,
      desc: 'Orochimaru adopta la forma de una gigantesca serpiente de ocho cabezas y arrasa al enemigo, debilitándolo con su poder monstruoso.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 8,
          duration: 2,
          prob: 0.9
        },
        {
          type: 'lifesteal',
          value: 15
        }
      ]
    }
  ]
},

{
  id: 'ibuki_douji',
  name: 'Ibuki Douji',
  img: 'personajes/douji.jpg',
  classes: ['atacante', 'control'],
  hp: 125,
  atk: 26,
  def: 16,
  spd: 16,

  moves: [
    {
      id: 'ibu1',
      name: 'Colmillos de la Serpiente',
      power: 22,
      acc: 0.97,
      desc: 'Ibuki Douji ataca con su enorme espada y deja una marca venenosa sobre el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2,
        prob: 0.9
      }
    },

    {
      id: 'ibu2',
      name: 'Aliento de la Oni',
      power: 25,
      acc: 0.94,
      desc: 'Ibuki libera una poderosa energía demoníaca que debilita las defensas del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 3,
        prob: 0.9
      }
    },

    {
      id: 'ibu3',
      name: 'Presencia de la Montaña',
      power: 0,
      acc: 1.0,
      desc: 'Ibuki libera su aura de oni, aumentando temporalmente su ATK y DEF mientras intimida al enemigo.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        },
        {
          type: 'slow',
          value: 6,
          duration: 2,
          prob: 0.9
        }
      ]
    },

    {
      id: 'ibu4',
      name: 'ULTI: Ibuki no Kaze',
      power: 30,
      acc: 0.90,
      desc: 'Ibuki Douji desata su verdadero poder como oni divina y arrasa al enemigo con una devastadora ráfaga de energía.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 0.9
        },
        {
          type: 'lifesteal',
          value: 20
        }
      ]
    }
  ]
},

{
  id: 'sadako',
  name: 'Sadako Yamamura',
  img: 'personajes/sadako.jpg',
  classes: ['control', 'debilitador'],
  hp: 115,
  atk: 27,
  def: 14,
  spd: 17,

  moves: [
    {
      id: 'sad1',
      name: 'Aparición',
      power: 22,
      acc: 0.96,
      desc: 'Sadako aparece repentinamente frente al enemigo, causándole daño y reduciendo temporalmente su velocidad.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'slow',
        value: 12,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'sad2',
      name: 'La Cinta Maldita',
      power: 26,
      acc: 0.94,
      desc: 'Sadako transmite su maldición al enemigo, reduciendo su ATK y DEF durante varios turnos.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 3,
          prob: 0.9
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 5,
          duration: 3,
          prob: 0.9
        }
      ]
    },

    {
      id: 'sad3',
      name: 'Televisor Maldito',
      power: 0,
      acc: 1.0,
      desc: 'La pantalla del televisor se enciende y Sadako comienza a emerger de ella, aterrorizando al enemigo y protegiéndose con su presencia sobrenatural.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        },
        {
          type: 'slow',
          value: 10,
          duration: 3,
          prob: 1.0
        }
      ]
    },

    {
      id: 'sad4',
      name: 'ULTI: Maldición de Sadako',
      power: 30,
      acc: 0.90,
      desc: 'Sadako emerge completamente del televisor y libera toda su maldición sobre el enemigo, debilitándolo y drenando parte de su vida.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 5,
          duration: 3,
          prob: 0.9
        },
        {
          type: 'lifesteal',
          value: 20,
          duration: 1
        }
      ]
    }
  ]
},

{
  id: 'reze',
  name: 'Reze',
  img: 'personajes/reze.jpg',
  classes: ['atacante', 'control'],
  hp: 120,
  atk: 30,
  def: 15,
  spd: 16,

  moves: [
    {
      id: 'rez1',
      name: 'Patada Explosiva',
      power: 22,
      acc: 0.98,
      desc: 'Reze potencia sus ataques físicos con una explosión, causando daño y aumentando temporalmente su velocidad.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'tempSpd',
        value: 4,
        duration: 2
      }
    },

    {
      id: 'rez2',
      name: 'Disparo Explosivo',
      power: 24,
      acc: 0.93,
      desc: 'Reze dispara una pequeña carga explosiva que detona al alcanzar al enemigo y reduce temporalmente su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2,
        prob: 0.9
      }
    },

    {
      id: 'rez3',
      name: 'Propulsión Explosiva',
      power: 0,
      acc: 1.0,
      desc: 'Reze utiliza explosiones para impulsarse a gran velocidad, aumentando temporalmente su ATK y SPD.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 4,
          duration: 3
        }
      ]
    },

    {
      id: 'rez4',
      name: 'ULTI: Demonio Bomba',
      power: 30,
      acc: 0.90,
      desc: 'Reze activa su transformación híbrida y provoca una enorme explosión. El impacto debilita al enemigo y Reze recupera parte de sus HP.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 8,
          duration: 2,
          prob: 0.9
        },
        {
          type: 'lifesteal',
          value: 20,
	  duration: 2
        }
      ]
    }
  ]
},

{
  id: 'trump',
  name: 'Donald Trump',
  img: 'personajes/trump.gif',
  classes: ['atacante', 'soporte'],
  hp: 130,
  atk: 30,
  def: 16,
  spd: 14,

  moves: [
    {
      id: 'tru1',
      name: 'USA better than China',
      power: 23,
      acc: 0.98,
      desc: 'Trump lanza una lluvia de billetes contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'tru2',
      name: 'Paraguas Dorado',
      power: 0,
      acc: 1.0,
      desc: 'Trump abre su enorme paraguas y se protege, aumentando temporalmente su DEF.',
      baseCooldown: 2,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 9,
        duration: 3
      }
    },

    {
      id: 'tru3',
      name: 'No votes? take my money',
      power: 26,
      acc: 0.92,
      desc: 'Trump arroja una enorme cantidad de dinero al enemigo y aumenta temporalmente su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 4,
          prob: 0.7,
          duration: 2
        }
      ]
    },

    {
      id: 'tru4',
      name: 'ULTI: You, DEPORTED!!',
      power: 30,
      acc: 0.90,
      desc: 'Trump abre su paraguas y provoca una gigantesca lluvia de billetes que golpea al enemigo y reduce su DEF, deportándolo a su país de origen.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          prob: 1.0,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 4,
          prob: 0.8,
          duration: 2
        }
      ]
    }
  ]
},

{
  id: 'zani',
  name: 'Zani',
  img: 'personajes/zani.jpg',
  classes: ['atacante', 'defensor'],
  hp: 115,
  atk: 25,
  def: 25,
  spd: 15,

  moves: [
    {
      id: 'zan1',
      name: 'Negociación de Rutina',
      power: 20,
      acc: 0.98,
      desc: 'Zani realiza una rápida combinación de golpes con sus guanteletes.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'zan2',
      name: 'Protocolo de Defensa Estándar',
      power: 22,
      acc: 0.95,
      desc: 'Zani adopta una postura defensiva y contraataca, reduciendo la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.9,
        duration: 2
      }
    },

    {
      id: 'zan3',
      name: 'Ascuas Helíacas',
      power: 0,
      acc: 1.0,
      desc: 'Zani concentra su energía y aumenta temporalmente su ATK y DEF.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'zan4',
      name: 'ULTI: Modo Infierno',
      power: 30,
      acc: 0.90,
      desc: 'Zani entra en su Modo Infierno y libera todo su poder Espectro, destruyendo las defensas del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          prob: 1.0,
          duration: 3
        },
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        }
      ]
    }
  ]
},

{
  id: 'soukaku',
  name: 'Soukaku',
  img: 'personajes/soukaku.jpg',
  classes: ['soporte', 'atacante'],
  hp: 115,
  atk: 26,
  def: 15,
  spd: 18,

  moves: [
    {
      id: 'sou1',
      name: 'Golpe de Estandarte',
      power: 22,
      acc: 0.98,
      desc: 'Soukaku ataca con su arma y su estandarte, causando daño de hielo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'sou2',
      name: 'Rally!',
      power: 25,
      acc: 0.94,
      desc: 'Soukaku clava su estandarte y libera una ráfaga de hielo que ralentiza al enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        prob: 0.9,
        duration: 2
      }
    },

    {
      id: 'sou3',
      name: '¡Hora de Comer!',
      power: 0,
      acc: 1.0,
      desc: 'Soukaku se prepara para el combate y aumenta temporalmente su ATK y DEF.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 7,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'sou4',
      name: 'ULTI: Jumbo Pudding Slash',
      power: 30,
      acc: 0.92,
      desc: 'Soukaku desata una poderosa ráfaga de ataques de hielo con su estandarte, debilitando al enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          prob: 1.0,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 6,
          prob: 0.9,
          duration: 2
        }
      ]
    }
  ]
},

{
  id: 'nihilux',
  name: 'Nihilux',
  img: 'personajes/nihilux.jpg',
  classes: ['debilitador', 'soporte'],
  hp: 110,
  atk: 24,
  def: 15,
  spd: 21,

  moves: [
    {
      id: 'nih1',
      name: 'Viñeta Improvisada',
      power: 24,
      acc: 0.98,
      desc: 'Nihilux dibuja rápidamente una escena que golpea al enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'nih2',
      name: 'Guion Caótico',
      power: 18,
      acc: 0.94,
      desc: 'Nihilux altera el guion de la batalla, reduciendo el ATK y SPD del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 5,
          prob: 0.9,
          duration: 2
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 4,
          prob: 0.9,
          duration: 2
        }
      ]
    },

    {
      id: 'nih3',
      name: '¡Esto Será Material Para Mi Manga!',
      power: 0,
      acc: 1.0,
      desc: 'Nihilux se inspira en el caos de la batalla y aumenta temporalmente su ATK y SPD.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 7,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 5,
          duration: 3
        }
      ]
    },

    {
      id: 'nih4',
      name: 'ULTI: Obra Maestra del Caos',
      power: 30,
      acc: 0.90,
      desc: 'Nihilux convierte el campo de batalla en una página de su obra, debilitando gravemente al enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          prob: 1.0,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 7,
          prob: 0.9,
          duration: 3
        },
        {
          type: 'slow',
          value: 7,
          duration: 2,
          prob: 0.85
        }
      ]
    }
  ]
},

{
  id: 'emilou',
  name: 'Emilou Apacci',
  img: 'personajes/emilou apacci.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 105,
  atk: 29,
  def: 13,
  spd: 23,

  moves: [
    {
      id: 'emi1',
      name: 'Garra de Pantera',
      power: 22,
      acc: 0.97,
      desc: 'Apacci ataca rápidamente con sus garras.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'emi2',
      name: 'Cero',
      power: 24,
      acc: 0.91,
      desc: 'Dispara un poderoso Cero que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.85,
        duration: 2
      }
    },

    {
      id: 'emi3',
      name: 'Rugido de Pantera',
      power: 0,
      acc: 1.0,
      desc: 'Apacci libera su ferocidad y aumenta temporalmente su ATK y SPD.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 7,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 5,
          duration: 3
        }
      ]
    },

    {
      id: 'emi4',
      name: 'ULTI: Chispas',
      power: 30,
      acc: 0.88,
      desc: 'Apacci desata todo su poder causando un enorme daño y debilitando al enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          prob: 1.0,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 5,
          prob: 0.75,
          duration: 2
        }
      ]
    }
  ]
},

{
  id: 'ankha_animalcrossing',
  name: 'Ankha',
  img: 'personajes/ankha.jpg',
  classes: ['mago', 'control', 'debilitador'],

  hp: 116,
  atk: 29,
  def: 14,
  spd: 19,

  moves: [
    {
      id: 'ankha1',
      name: 'Maldición Egipcia',
      power: 22,
      acc: 0.97,
      desc: 'Ankha invoca una antigua maldición egipcia que golpea al enemigo y reduce su ATK.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'ankha2',
      name: 'Mirada de Faraona',
      power: 20,
      acc: 0.94,
      desc: 'Ankha fija su mirada en el enemigo, ralentizándolo y debilitando temporalmente sus defensas.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 15,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 6,
          duration: 3,
          prob: 1.0
        }
      ]
    },

    {
      id: 'ankha3',
      name: 'Bendición del Nilo',
      power: 0,
      acc: 1.0,
      desc: 'Ankha canaliza la energía del Nilo para aumentar temporalmente su ATK y DEF.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'ankha4',
      name: 'ULTI: Juicio de Anubis',
      power: 31,
      acc: 0.90,
      desc: 'Ankha invoca el poder del antiguo Egipto para ejecutar un poderoso ataque que reduce las defensas del enemigo, lo ralentiza y recupera parte de su vida.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 18,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'lifesteal',
          value: 20,
          duration: 1
        }
      ]
    }
  ]
},

{
  id: 'ganyu_genshin',
  name: 'Ganyu',
  img: 'personajes/ganyu.jpg',
  classes: ['atacante', 'mago', 'control'],

  hp: 110,
  atk: 30,
  def: 13,
  spd: 18,

  moves: [
    {
      id: 'ganyu1',
      name: 'Flecha de Escarcha',
      power: 23,
      acc: 0.98,
      desc: 'Ganyu dispara una flecha cubierta de energía Cryo que daña al enemigo y reduce ligeramente su velocidad.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'ganyu2',
      name: 'Sendero de la Qilin',
      power: 25,
      acc: 0.94,
      desc: 'Ganyu crea una flor de hielo que explota al impactar, debilitando las defensas del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'ganyu3',
      name: 'Lluvia Celestial',
      power: 0,
      acc: 1.0,
      desc: 'Ganyu concentra el poder Cryo y aumenta temporalmente su ATK y su probabilidad de golpe crítico.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'critChance',
          value: 15,
          duration: 3
        }
      ]
    },

    {
      id: 'ganyu4',
      name: 'ULTI: Lluvia de Fragmentos Celestiales',
      power: 30,
      acc: 0.90,
      desc: 'Ganyu invoca una poderosa tormenta de fragmentos Cryo sobre el enemigo, debilitando sus defensas y ralentizándolo. El ataque también recupera una pequeña parte de su vida.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 15,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'lifesteal',
          value: 20,
          duration: 1
        }
      ]
    }
  ]
},

{
  id: 'hibiscus',
  name: 'Hibiscus',
  img: 'personajes/hibiscus.jpg',
  classes: ['sanador', 'soporte'],
  hp: 112,
  atk: 24,
  def: 14,
  spd: 16,

  moves: [
    {
      id: 'hib1',
      name: 'Healing Arts',
      power: 0,
      acc: 1.0,
      desc: 'Hibiscus utiliza su arte médica para curar a un aliado herido.',
      baseCooldown: 0,
      type: 'support',
      effect: {
        type: 'heal',
        value: 10
      }
    },

    {
      id: 'hib2',
      name: 'Healing Field',
      power: 0,
      acc: 1.0,
      desc: 'Hibiscus crea un campo médico que cura a un aliado y aumenta temporalmente su DEF.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 26
        },
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'hib3',
      name: 'Medicinal Mist',
      power: 18,
      acc: 0.94,
      desc: 'Hibiscus libera una niebla medicinal que daña ligeramente al enemigo y reduce su capacidad ofensiva.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'hib4',
      name: 'ULTI: Advanced Treatment',
      power: 0,
      acc: 1.0,
      desc: 'Hibiscus concentra todo su conocimiento médico para realizar un tratamiento intensivo, restaurando una gran cantidad de HP y aumentando temporalmente la DEF del objetivo.',
      baseCooldown: 6,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 48
        },
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        }
      ]
    }
  ]
},

{
  id: 'lilith_fate',
  name: 'Lilith',
  img: 'personajes/lilith.jpg',
  classes: ['mago', 'control', 'debilitador'],

  hp: 118,
  atk: 30,
  def: 13,
  spd: 20,

  moves: [
    {
      id: 'lilith1',
      name: 'Sueño de Lilith',
      power: 20,
      acc: 0.96,
      desc: 'Lilith envuelve al enemigo en una ilusión oscura, reduciendo ligeramente su ATK.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 4,
        duration: 2,
        prob: 0.8
      }
    },

    {
      id: 'lilith2',
      name: 'Besos del Abismo',
      power: 22,
      acc: 0.94,
      desc: 'Lilith drena parte de la fuerza vital del enemigo mientras lo debilita con energía demoníaca.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 14,
          duration: 1
        },
        {
          type: 'healReduction',
          value: 30,
          duration: 3
        }
      ]
    },

    {
      id: 'lilith3',
      name: 'Sueño Profundo',
      power: 0,
      acc: 1.0,
      desc: 'Lilith se sumerge en un estado de concentración sobrenatural, aumentando su ATK y su probabilidad de golpe crítico.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 7,
          duration: 3
        },
        {
          type: 'critChance',
          value: 15,
          duration: 3
        }
      ]
    },

    {
      id: 'lilith4',
      name: 'ULTI: Jardín de los Sueños Eternos',
      power: 30,
      acc: 0.89,
      desc: 'Lilith sumerge al enemigo en una pesadilla absoluta. El ataque drena su vida, reduce sus defensas y dificulta enormemente cualquier recuperación.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 18,
          duration: 1
        },
        {
          type: 'healReduction',
          value: 45,
          duration: 4
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 15,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'nicktula',
  name: 'Nicktula',
  img: 'personajes/nictula.png',
  classes: ['soporte', 'control', 'mago'],
  hp: 122,
  atk: 27,
  def: 16,
  spd: 20,
  moves: [
    {
      id: 'nicktula1',
      name: '¡JAJAJAJA!',
      power: 20,
      acc: 0.98,
      desc: 'Nicktula se ríe del oponente mientras narra la batalla, reduciendo su ATK.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        duration: 2,
        prob: 1.0
      }
    },
    {
      id: 'nicktula2',
      name: '¡NO PUEDE SER!',
      power: 20,
      acc: 0.95,
      desc: 'Nicktula anuncia un inesperado giro de guión que altera el ritmo del combate y ralentiza al oponente.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'slow',
        value: 15,
        duration: 3,
        prob: 1.0
      }
    },
    {
      id: 'nicktula3',
      name: '¡CONSIGUE REMONTAR!',
      power: 0,
      acc: 1.0,
      desc: 'Nicktula convierte a un aliado en el protagonista de la escena, aumentando temporalmente su ATK y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {type:'tempAtk',value:10,duration:3},
        {type:'tempSpd',value:8,duration:3}
      ]
    },
    {
      id: 'nicktula4',
      name: 'TÉCNICA DEFINITIVA: Y ENTONCES... ¡¡OCURRIÓ!!',
      power: 0,
      acc: 0.96,
      desc: 'Nicktula narra el combate con una intensidad descomunal, alterando el curso de la batalla y potenciando a su equipo.',
      baseCooldown: 7,
      type: 'support',
      effects: [
        {type:'healPct',value:0.10},
        {type:'tempAtk',value:12,duration:3},
        {type:'tempDef',value:12,duration:3},
        {type:'tempSpd',value:10,duration:3}
      ]
    }
  ]
},

{
  id: 'negro',
  name: 'Negro',
  img: 'personajes/negro.png',
  classes: ['soporte', 'sanador', 'control'],
  hp: 128,
  atk: 22,
  def: 18,
  spd: 18,
  moves: [
    {
      id: 'negro1',
      name: 'Toque De Judas',
      power: 23,
      acc: 0.98,
      desc: 'Negro realiza un pequeño ataque mientras recuerda al enemigo que siempre puede dejarlo tirado.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'negro2',
      name: 'Abandono Repentino',
      power: 22,
      acc: 0.95,
      desc: 'Negro se acerca, distrae al enemigo y se vuelve a alejar, reduciendo su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {type:'slow',value:15,duration:3,prob:1.0},
        {type:'debuff',stat:'atk',value:6,duration:3,prob:1.0}
      ]
    },
    {
      id: 'negro3',
      name: 'Ayuda... Desde Lejos',
      power: 0,
      acc: 1.0,
      desc: 'Aunque no quiera acercarse demasiado, Negro presta apoyo al equipo y refuerza su defensa.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {type:'heal',value:15},
        {type:'tempDef',value:12,duration:3}
      ]
    },
    {
      id: 'negro4',
      name: 'TÉCNICA DEFINITIVA: Nos Vemos Pronto, Judas',
      power: 28,
      acc: 0.92,
      desc: 'Negro recuerda su legendaria huida del bachillerato y le envía fuerzas a sus compañeros para que se olviden de él.',
      baseCooldown: 7,
      type: 'support',
      effects: [
        {type:'healPct',value:0.30},
        {type:'tempDef',value:15,duration:3},
        {type:'tempSpd',value:8,duration:3}
      ]
    }
  ]
},

{
  id: 'orcasitas',
  name: 'Orcasitas',
  img: 'personajes/orcasitas.png',
  classes: ['atacante', 'control', 'debilitador'],
  hp: 120,
  atk: 30,
  def: 14,
  spd: 21,
  moves: [
    {
      id: 'orcasitas1',
      name: '¡Toledito!',
      power: 25,
      acc: 0.97,
      desc: 'Orcasitas golpea al oponente mientras que exclama su apodo favorito.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'orcasitas2',
      name: 'Taladrada Brutal',
      power: 22,
      acc: 0.94,
      desc: 'Orcasitas arremete contra el oponente con su actitud provocadora y aprovecha para ralentizarlo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {type:'debuff',stat:'atk',value:9,duration:3,prob:1.0},
        {type:'slow',value:10,duration:2,prob:1.0}
      ]
    },
    {
      id: 'orcasitas3',
      name: 'Venid A Mí, Minitas',
      power: 0,
      acc: 1.0,
      desc: 'Orcasitas se emociona al ver minitas al horizonte y aumenta temporalmente su SPD y ATK, queriéndo impresionarlas.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {type:'tempAtk',value:10,duration:3},
        {type:'tempSpd',value:8,duration:3}
      ]
    },
    {
      id: 'orcasitas4',
      name: 'TÉCNICA DEFINITIVA: Shot De Lefilla',
      power: 30,
      acc: 0.90,
      desc: 'Orcasitas desata todo su "poder" y arremete contra el oponente, dejándolo completamente desconcertado.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {type:'debuff',stat:'def',value:6,duration:3,prob:1.0},
        {type:'slow',value:10,duration:2,prob:1.0}
      ]
    }
  ]
},

{
  id: 'pancha_peluda',
  name: 'Pancha Peluda',
  img: 'personajes/pancha peluda.png',
  classes: ['sanador', 'debilitador', 'soporte'],

  hp: 128,
  atk: 27,
  def: 17,
  spd: 16,

  moves: [
    {
      id: 'pancha1',
      name: 'Abrazo Peludo',
      power: 22,
      acc: 0.97,
      desc: 'La Pancha envuelve al enemigo con su enorme pelaje, causando un pequeño impacto y dejándolo ralentizado.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'slow',
        value: 4,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'pancha2',
      name: 'Pelo De La Barba',
      power: 24,
      acc: 0.94,
      desc: 'La Pancha arranca un pelo de su frondosa barba y la dispara a su oponente, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'pancha3',
      name: 'Barrera Cabellera',
      power: 0,
      acc: 0.9,
      desc: 'La Pancha utiliza su abundante melena para proteger y recuperar sus fuerzas o las de un aliado.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 16
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'pancha4',
      name: 'TÉCNICA DEFINTIIVA: Tsunami Peludo',
      power: 30,
      acc: 0.91,
      desc: 'La Pancha libera todo su pelaje de golpe, creando una enorme tormenta que debilita al oponente mientras su energía curativa restaura al equipo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 6,
          duration: 2,
          prob: 1.0
        },
        {
          type: 'heal',
          value: 0.18
        }
      ]
    }
  ]
},

{
  id: 'minion',
  name: 'Minion',
  img: 'personajes/minion.png',
  classes: ['sanador', 'soporte'],

  hp: 132,
  atk: 24,
  def: 18,
  spd: 17,

  moves: [
    {
      id: 'minion1',
      name: 'Random Shit',
      power: 22,
      acc: 0.98,
      desc: 'La Minion arroja un monton de cosas aleatorias a su oponente, haciendo un daño mínimo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'minion2',
      name: 'Perfect Pronunciation',
      power: 0,
      acc: 1.0,
      desc: 'Minion corrige la pronunciación del equipo, restaurando parte de sus fuerzas.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'heal',
        value: 20
      }
    },

    {
      id: 'minion3',
      name: 'Teacher Support',
      power: 0,
      acc: 1.0,
      desc: 'La Minion le grita a sus aliados para que sigan luchando, aumentando temporalmente su DEF y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 10,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'minion4',
      name: 'TÉCNICA DEFINITIVA: Rephrasing Exam',
      power: 0,
      acc: 1.0,
      desc: 'La Minion da la clase de inglés definitiva, sus explicaciones son tan claras que el equipo recupera fuerzas y queda protegido.',
      baseCooldown: 7,
      type: 'support',
      effects: [
        {
          type: 'healPct',
          value: 0.20
        },
        {
          type: 'tempDef',
          value: 9,
          duration: 3
        }
      ]
    }
  ]
},

{
  id: 'maka_monster',
  name: 'Maka Monster',
  img: 'personajes/maka monster.png',
  classes: ['sanador', 'soporte', 'control'],

  hp: 130,
  atk: 25,
  def: 17,
  spd: 16,

  moves: [
    {
      id: 'maka1',
      name: '¡Toma!',
      power: 23,
      acc: 0.90,
      desc: 'Maka intenta atacar al oponente, pero no tiene muy claro qué está haciendo. De alguna manera, consigue golpearlo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'maka2',
      name: '¿Qué Está Pasando?',
      power: 0,
      acc: 1.0,
      desc: 'Maka se queda completamente confundido durante el combate, pero su actitud despistada termina ayudando al equipo.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 15
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'maka3',
      name: 'Curación Inesperada',
      power: 0,
      acc: 1.0,
      desc: 'Maka intenta hacer algo completamente distinto y, por pura casualidad, termina realizando una poderosa curación.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'heal',
        value: 12
      }
    },

    {
      id: 'maka4',
      name: 'TÉCNICA DEFINTIIVA: ¡PERO BUEEEENOOO!',
      power: 0,
      acc: 1.0,
      desc: 'Aunque Maka no sea muy bueno para golpear, suelta un grito de guerra que cura a sus aliados y les otorga más DEF.',
      baseCooldown: 7,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 15
        },
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        }
      ]
    }
  ]
},

{
  id: 'guijarro',
  name: 'Guijarro',
  img: 'personajes/guijarro.png',
  classes: ['mago', 'control', 'debilitador'],

  hp: 123,
  atk: 30,
  def: 16,
  spd: 18,

  moves: [
    {
      id: 'guijarro1',
      name: 'Eso Dijo Ella',
      power: 22,
      acc: 0.97,
      desc: 'Guijarro arremete contra su oponente con su misteriosa frase. ¿Qué significará? Nunca lo sabremos...',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'guijarro2',
      name: 'A Llorar A La Llorería',
      power: 25,
      acc: 0.94,
      desc: 'Guijarro concentra su poder en su poderosa frase que obliga al oponente a pensar mejor en lo que dice.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'guijarro3',
      name: 'A Pluma Y Espada',
      power: 0,
      acc: 1.0,
      desc: 'Guijarro adquiere temporalmente la forma de sus ancestros poetas, mejorando su ATK y DEF (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 10,
          duration: 3
        }
      ]
    },

    {
      id: 'guijarro4',
      name: 'TÉCNICA DEFINITIVA: Versos De Lope',
      power: 30,
      acc: 0.91,
      desc: 'Guijarro recita su poema prohibido que interrumpe en las mentes de los débiles, reduciendo ATK y DEF en su oponente.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'senor_holograma',
  name: 'Señor Holograma',
  img: 'personajes/señor holograma.png',
  classes: ['soporte', 'control', 'mago'],

  hp: 126,
  atk: 30,
  def: 17,
  spd: 23,

  moves: [
    {
      id: 'holograma1',
      name: 'Golpe Holográfico',
      power: 22,
      acc: 0.97,
      desc: 'El Señor Holograma extiende su brazo para dar un golpe certero al oponente.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'holograma2',
      name: 'Doble Puñetazo',
      power: 23,
      acc: 0.95,
      desc: 'El Señor Holograma extiende sus prótesis metálicas y golpea a su oponente en el cráneo, confundiéndolo y reduciendo su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 8,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'holograma3',
      name: 'Piel De Metal',
      power: 0,
      acc: 1.0,
      desc: 'El Señor Holograma activa sus protocolos y refuerza su piel con una capa de acero extra mientras aumenta temporalmente su SPD (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'shield',
          value: 30
        },
        {
          type: 'tempSpd',
          value: 9,
          duration: 3
        }
      ]
    },

    {
      id: 'holograma4',
      name: 'TÉCNICA DEFINITIVA: Descarga Eléctrica',
      power: 30,
      acc: 0.92,
      desc: 'El Señor Holograma conecta sus circuitos al oponente y le propicia una descarga de altos voltios, reduciendo su DEF y ralentizándolo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'paya',
  name: 'Paya',
  img: 'personajes/paya.png',
  classes: ['atacante', 'control', 'soporte'],

  hp: 116,
  atk: 30,
  def: 14,
  spd: 22,

  moves: [
    {
      id: 'paya1',
      name: 'Corte De Katana',
      power: 20,
      acc: 0.97,
      desc: 'Paya mantiene una expresión completamente seria y realiza un preciso corte con su katana al oponente.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'paya2',
      name: 'Desmembramiento',
      power: 24,
      acc: 0.95,
      desc: 'Paya desenvaina su katana e intenta cortar la pierna de su oponente, reduciendo su DEF y ralentizándolo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 5,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'paya3',
      name: 'Absolute Mewing',
      power: 0,
      acc: 1.0,
      desc: 'Paya adopta una postura perfecta y concentra su energía en la mandíbula, aumentando temporalmente su ATK y SPD (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 10,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'paya4',
      name: 'TÉCNICA DEFINITIVA: Espada De Los Mil Cortes',
      power: 30,
      acc: 0.89,
      desc: 'Paya permanece completamente inexpresiva, concentra todo su poder y desenvaina su katana para ejecutar varios corte devastadores con más chance de críticos a su oponente.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'critChance',
          value: 20,
          duration: 2
        }
      ]
    }
  ]
},

{
  id: 'joan',
  name: 'Joan',
  img: 'personajes/joan.png',
  classes: ['control', 'debilitador', 'soporte'],

  hp: 119,
  atk: 30,
  def: 15,
  spd: 20,

  moves: [
    {
      id: 'joan1',
      name: 'Palabras Envenenadas',
      power: 22,
      acc: 0.97,
      desc: 'Joan utiliza palabras cuidadosamente elegidas para sembrar dudas y manipular al enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'joan2',
      name: 'Rencor hacia Santi',
      power: 24,
      acc: 0.94,
      desc: 'Joan canaliza todo su rencor hacia Santi y convierte esa frustración en un ataque que debilita al enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 9,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'joan3',
      name: 'Manipulación Psicológica',
      power: 0,
      acc: 1.0,
      desc: 'Joan manipula la percepción del enemigo y aprovecha sus inseguridades para reforzar su propia posición.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'joan4',
      name: 'ULTI: La Venganza contra Santi',
      power: 31,
      acc: 0.90,
      desc: 'Joan libera todo el rencor acumulado y ejecuta una compleja estrategia de manipulación que deja al enemigo completamente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 6,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'abascal',
  name: 'Abascal',
  img: 'personajes/abascal.png',
  classes: ['defensor', 'atacante', 'control'],

  hp: 138,
  atk: 30,
  def: 21,
  spd: 15,

  moves: [
    {
      id: 'abascal1',
      name: 'Discurso de Acero',
      power: 25,
      acc: 0.97,
      desc: 'Abascal lanza un contundente discurso que impacta al enemigo con una poderosa onda de energía.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'abascal2',
      name: 'Muralla Nacional',
      power: 24,
      acc: 0.95,
      desc: 'Abascal levanta una barrera energética a su alrededor, reduciendo la fuerza ofensiva del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'abascal3',
      name: 'Voluntad de Hierro',
      power: 0,
      acc: 1.0,
      desc: 'Abascal adopta una postura firme y concentra toda su determinación, aumentando temporalmente su ATK y DEF.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 5,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'abascal4',
      name: 'ULTI: Discurso del Poder',
      power: 30,
      acc: 0.90,
      desc: 'Abascal libera una enorme descarga de energía mediante un discurso que sacude el campo de batalla y debilita al enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'simon',
  name: 'Simons',
  img: 'personajes/simon.jpg',
  classes: ['mago', 'control', 'soporte'],

  hp: 118,
  atk: 30,
  def: 15,
  spd: 19,

  moves: [
    {
      id: 'simon1',
      name: 'Rayo Processing',
      power: 22,
      acc: 0.97,
      desc: 'Simons escribe unas pocas líneas de código y las convierte en un rayo digital preciso contra el oponente.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'simon2',
      name: 'Ley De Ohm',
      power: 25,
      acc: 0.95,
      desc: 'Simons envía a Ohm a atacar al oponente, haciendo que sus movimientos sean menos efectivos y reduciendo su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'simon3',
      name: 'Regeneración Automática',
      power: 0,
      acc: 1.0,
      desc: 'Simons utiliza sus programas para convertir parte del daño recibido en mejoras a sí mismo, aumentando temporalmente su DEF y SPD (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'simon4',
      name: 'TÉCNICA DEFINITIVA: Llamadita A casa',
      power: 31,
      acc: 0.90,
      desc: 'Simons ejecuta un poderosísimo programa que llama a la madre del oponente para que le echen la bronca.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 10,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'carlos',
  name: 'Carlos',
  img: 'personajes/carlos.jpg',
  classes: ['mago', 'control', 'debilitador'],

  hp: 124,
  atk: 30,
  def: 17,
  spd: 18,

  moves: [
    {
      id: 'carlos1',
      name: 'Argumento Definitivo',
      power: 25,
      acc: 0.97,
      desc: 'Carlos presenta un argumento cuidadosamente construido que golpea al oponente con precisión intelectual.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'carlos2',
      name: 'Refutación Bien Planteada',
      power: 26,
      acc: 0.94,
      desc: 'Carlos desmonta los argumentos de su oponente, haciéndole que tenga que pensar más, reduce su DEF y lo ralentiza.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'carlos3',
      name: 'Virtud Y Conocimiento',
      power: 0,
      acc: 1.0,
      desc: 'Carlos accede a su virtud interior y adquiere más conocimiento, aumentando temporalmente su ATK y DEF.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 12,
          duration: 3
        }
      ]
    },

    {
      id: 'carlos4',
      name: 'TÉCNICA DEFINITIVA: Enseñando Con La Mayéutica',
      power: 32,
      acc: 0.91,
      desc: 'Carlos llama a las almas de todos sus alumnos y les guía a aprender nuevas ideas, luego expulsa todo este poder hacia su enemigo y le debilita temporalmente.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'presi',
  name: 'El Presi',
  img: 'personajes/presi.jpg',
  classes: ['atacante', 'defensor', 'control'],

  hp: 140,
  atk: 31,
  def: 20,
  spd: 14,

  moves: [
    {
      id: 'presi1',
      name: 'Golpe Del Gorila',
      power: 22,
      acc: 0.96,
      desc: 'El Presi descarga un poderoso golpe con la fuerza de un gorila hacia su oponente.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'presi2',
      name: '¿De Kebabs, Tío?',
      power: 25,
      acc: 0.94,
      desc: 'El Presi arroja gasolina sobre su oponente, pero se le ha olvidado un mechero para envolverlo en llamas... así que lo golpea y lo ralentiza temporalmente.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 15,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'presi3',
      name: '¡¡¡BABUUUUUUUUUUBAAAAAAAAA!!!',
      power: 0,
      acc: 1.0,
      desc: 'El Presi libera su grito de guerra primal y aumenta temporalmente su ATK y DEF.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 9,
          duration: 3
        }
      ]
    },

    {
      id: 'presi4',
      name: 'TÉCNICA DEFINITIVA: Destruktor Tankurum',
      power: 30,
      acc: 0.87,
      desc: 'El Presi toma una transformación temporal que le otorga dos espadas para cortar a su oponente y debilitarlo temporalmente..',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'calvencio',
  name: 'Calvencio',
  img: 'personajes/calvencio.jpg',
  classes: ['mago', 'control', 'soporte'],

  hp: 114,
  atk: 30,
  def: 15,
  spd: 22,

  moves: [
    {
      id: 'calvencio1',
      name: 'Ataque Sorpresa',
      power: 25,
      acc: 0.98,
      desc: 'Calvencio lanza un gancho secreto a su enemigo, hiriéndole por las espaldas.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'calvencio2',
      name: 'Ecuación Imposible',
      power: 25,
      acc: 0.95,
      desc: 'Calvencio plantea una ecuación imposible de resolver a su oponente, reduciendo su DEF y ralentizándolo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'calvencio3',
      name: 'Razones Trigonométricas',
      power: 0,
      acc: 1.0,
      desc: 'Calvencio resuelve cientos de calculos trigonométricos en su mente y descubre los puntos débiles de su oponente, aumentando temporalmente su ATK y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 9,
          duration: 3
        }
      ]
    },

    {
      id: 'calvencio4',
      name: 'TÉCNICA DEFINITIVA: El Número E',
      power: 30,
      acc: 0.92,
      desc: 'Calvencio atrapa a su oponente en una lección de matemáticas y lo obliga a luchar con su mascota, el número e, dejándolo completamente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 5,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'adam',
  name: 'Adam',
  img: 'personajes/adam.jpg',
  classes: ['atacante', 'defensor', 'control'],

  hp: 138,
  atk: 30,
  def: 20,
  spd: 15,

  moves: [
    {
      id: 'adam1',
      name: 'Patada Del Guerrero',
      power: 21,
      acc: 0.96,
      desc: 'Adam avanza con determinación y descarga un poderoso golpe contra el oponente.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'adam2',
      name: 'Full House',
      power: 24,
      acc: 0.92,
      desc: 'Adam saca la mejor mano de póker y la arroja a su oponente, reduciendo su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'adam3',
      name: '¡Señor Oliva!',
      power: 0,
      acc: 1.0,
      desc: 'Adam toma su forma de Biscuit Oliva temporalmente, otorgándole beneficios a su ATK y DEF (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'adam4',
      name: 'TÉCNICA DEFINITIVA: Bienvenido Al Casino',
      power: 30,
      acc: 0.89,
      desc: 'Adam lleva a su oponente al casino, en el que le otorgan una mala mano que le arrebata sus fuerzas temporalmente.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'guti',
  name: 'Guti',
  img: 'personajes/guti.jpg',
  classes: ['mago', 'atacante', 'debilitador'],

  hp: 116,
  atk: 30,
  def: 14,
  spd: 20,

  moves: [
    {
      id: 'guti1',
      name: '¿Tengo Que Pelear?',
      power: 20,
      acc: 0.96,
      desc: 'Guti lanza un ataque sin ganas a su oponente, estará muy ocupado pensando en otras cosas.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'guti2',
      name: 'Rasengan',
      power: 25,
      acc: 0.94,
      desc: 'Guti lanza una pequeña explosión cargada a su oponente, reduciendo su DEF y envolviéndolo en llamas.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'burn',
          value: 6,
          duration: 3,
          prob: 0.85
        }
      ]
    },

    {
      id: 'guti3',
      name: 'De Aquí Viene La Arcilla...',
      power: 0,
      acc: 1.0,
      desc: 'Guti se saca la cera de los oídos, dándole más material para sus explosiones y mejorando sus sentidos... aumenta temporalmente su ATK y SPD (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 12,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'guti4',
      name: 'TÉCNICA DEFINITIVA: Toque Explosivo ',
      power: 34,
      acc: 0.88,
      desc: 'Guti genera una enorme explosión junto a su oponente, envolviéndolo en llamas y debilitando su DEF.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'burn',
          value: 10,
          duration: 3,
          prob: 0.9
        }
      ]
    }
  ]
},

{
  id: 'papudo',
  name: 'Papudo',
  img: 'personajes/papudo.jpg',
  classes: ['mago', 'debilitador', 'control'],

  hp: 121,
  atk: 28,
  def: 16,
  spd: 17,

  moves: [
    {
      id: 'papudo1',
      name: 'Ondas De Papada',
      power: 22,
      acc: 0.97,
      desc: 'Papudo utiliza su papada para crear unas ondas que destabilizan a su oponente por su movimiento y volúmen.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'papudo2',
      name: 'El Poder De Las Palabras',
      power: 25,
      acc: 0.94,
      desc: 'Papudo comienza su lección de filosofía, enviando una ráfaga de palabras que agotan mentalmente al enemigo y reducen su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'papudo3',
      name: 'Inmolación',
      power: 0,
      acc: 1.0,
      desc: 'Papudo reflexiona sobre sus propias inseguridades y arde en rabia, aumentando temporalmente su ATK y DEF (usable an aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'papudo4',
      name: 'TÉCNICA DEFINITIVA: El Inconsciente Irónico',
      power: 30,
      acc: 0.90,
      desc: 'Papudo envía al oponente a un espacio cerrado con sus pensamientos inconscientes de fracaso, debilitándolo su DEF y ATK.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'butifarra',
  name: 'Butifarra',
  img: 'personajes/butifarra.jpg',
  classes: ['mago', 'control', 'debilitador'],

  hp: 118,
  atk: 30,
  def: 14,
  spd: 21,

  moves: [
    {
      id: 'butifarra1',
      name: 'Embestida Butifarrosa',
      power: 25,
      acc: 0.97,
      desc: 'Marionite aparece en su forma butifarra y embiste al oponente antes de volver a alejarse.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'butifarra2',
      name: 'Rayo Del Buti',
      power: 25,
      acc: 0.94,
      desc: 'Marionite lanza un gran rayo de butifarras a su oponente, absorbiendo parte de su energía y reduciendo su ATK temporalmente.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'butifarra3',
      name: '¡Solo Un Trago!',
      power: 0,
      acc: 1.0,
      desc: 'Marionite se toma un rápido descanso para beberse una Monster, aumentando temporalmente su DEF y SPD (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 9,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 4,
          duration: 3
        }
      ]
    },

    {
      id: 'butifarra4',
      name: 'TÉCNICA DEFINITIVA: ¡¡BUTIMONSTRUO!!',
      power: 30,
      acc: 0.90,
      desc: 'Marionite adquiere su forma superior mezclando sus butifarras con Monster, lanzando un golpe directo al oponente que reduce su DEF y lo ralentiza temporalmente.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 9,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'dopiko',
  name: 'Dopiko',
  img: 'personajes/dopiko.jpg',
  classes: ['atacante', 'debilitador', 'defensor'],

  hp: 135,
  atk: 30,
  def: 18,
  spd: 16,

  moves: [
    {
      id: 'dopiko1',
      name: 'Cabezazo De Burro',
      power: 21,
      acc: 0.96,
      desc: 'Dopiko embiste al oponente con brutalidad, aprovechando la fuerza de un burro enfurecido.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'dopiko2',
      name: 'Mordisco Salvaje',
      power: 24,
      acc: 0.94,
      desc: 'Dopiko muerde a su oponente con ferocidad, hiriéndole y reduciendo temporalmente su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 9,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'dopiko3',
      name: 'Sed De Sangre',
      power: 0,
      acc: 1.0,
      desc: 'Dopiko entra en un estado de furia y locura animalística, aumentando temporalmente su ATK y DEF (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 12,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'dopiko4',
      name: 'TÉCNICA DEFINITIVA: El Destroza Cráneos',
      power: 30,
      acc: 0.89,
      desc: 'Dopiko canaliza toda su fuerza en un ataque a mano abierta capaz de dejar desconcertado a su oponente, o en el peor de los casos...',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 8,
          duration: 2,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'santi',
  name: 'Santi',
  img: 'personajes/santi.jpg',
  classes: ['control', 'debilitador', 'atacante'],

  hp: 122,
  atk: 30,
  def: 16,
  spd: 19,

  moves: [
    {
      id: 'santi1',
      name: 'Corte Del Camarada',
      power: 25,
      acc: 0.97,
      desc: 'Santi realiza un corte inesperado con su hoz a su oponente mientras proclama que el poder pertenece al colectivo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'santi2',
      name: 'Divagación Desconcertante',
      power: 25,
      acc: 0.94,
      desc: 'Santi desata una ofensiva coordinada mientras que discute sobre femboys, desconcertando al oponente y reduciendo temporalmente su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'santi3',
      name: 'Apoyo Socialista',
      power: 0,
      acc: 1.0,
      desc: 'Santi comparte sus recursos con sus aliados y adquiere su defensa colectiva, aumentando temporalmente su DEF y ATK (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        },
        {
          type: 'tempAtk',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'santi4',
      name: 'TÉCNICA DEFINITIVA: Gambare, Gambare~',
      power: 32,
      acc: 0.90,
      desc: 'En un momento de apuro, Santi manifiesta una fuerza interior, que no logra controlar del todo, y libera una tormenta de cortes malditos que debilita al oponente y le aplica sangrado.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'bleed',
          value: 8,
          duration: 3,
          prob: 0.85
        }
      ]
    }
  ]
},

{
  id: 'lukraz',
  name: 'Lukraz',
  img: 'personajes/lukraz.png',
  classes: ['mago', 'control', 'soporte'],

  hp: 120,
  atk: 30,
  def: 15,
  spd: 19,

  moves: [
    {
      id: 'lukraz1',
      name: 'Rayo De ₿itcoin',
      power: 22,
      acc: 0.97,
      desc: 'Lukraz concentra una ráfaga de Bitcoins y ataca a su oponente con ella.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'lukraz2',
      name: 'Gráficas Salientes',
      power: 25,
      acc: 0.94,
      desc: 'Lukraz libera sus gráficas y las usa para encadenar a su oponente, reduciendo su DEF y ralentizando sus movimientos.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'lukraz3',
      name: 'ChatGPT, ¡CHAMBEA!',
      power: 0,
      acc: 1.0,
      desc: 'Lukraz explota laboralmente a su ChatGPT de confianza para que le aumente temporalmente su ATK y SPD (usable en aliados).',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 3,
          duration: 3
        }
      ]
    },

    {
      id: 'lukraz4',
      name: 'TÉCNICA DEFINITIVA: Papucoin',
      power: 30,
      acc: 0.89,
      desc: 'Lukraz libera un gigantesco tanque Papucoin y dispara un laser que desintegra a su oponente, provocándole un brutal impacto financiero que reduce su ATK y DEF.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'orochimaru',
  name: 'Orochimaru',
  img: 'personajes/orochimaru.jpg',
  classes: ['mago', 'debilitador', 'control'],

  hp: 128,
  atk: 30,
  def: 17,
  spd: 18,

  moves: [
    {
      id: 'orochimaru1',
      name: 'Kusanagi',
      power: 25,
      acc: 0.96,
      desc: 'Orochimaru ataca con la espada Kusanagi, extendiéndola de forma impredecible para alcanzar al enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'orochimaru2',
      name: 'Serpientes Ocultas',
      power: 21,
      acc: 0.94,
      desc: 'Orochimaru invoca serpientes que rodean al enemigo, reduciendo su DEF y causando daño continuo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 6,
          duration: 3,
          prob: 0.85
        }
      ]
    },

    {
      id: 'orochimaru3',
      name: 'Reemplazo de Piel',
      power: 0,
      acc: 1.0,
      desc: 'Orochimaru abandona temporalmente su cuerpo para recuperarse y reforzar sus defensas.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'selfHealPct',
          value: 0.08
        },
        {
          type: 'tempDef',
          value: 10,
          duration: 2
        }
      ]
    },

    {
      id: 'orochimaru4',
      name: 'ULTI: Yamata no Orochi',
      power: 22,
      acc: 0.90,
      desc: 'Orochimaru adopta la forma de una enorme serpiente de ocho cabezas y lanza un ataque devastador que debilita al enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 10,
          duration: 3,
          prob: 0.9
        }
      ]
    }
  ]
},

{
  id: 'aqua',
  name: 'Aqua',
  img: 'personajes/aqua.jpg',
  classes: ['sanador', 'mago', 'soporte'],

  hp: 125,
  atk: 22,
  def: 14,
  spd: 17,

  moves: [
    {
      id: 'aqua1',
      name: 'Purificación',
      power: 25,
      acc: 0.97,
      desc: 'Aqua canaliza poder divino y lanza un ataque de energía sagrada contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'aqua2',
      name: 'Curación Divina',
      power: 0,
      acc: 1.0,
      desc: 'Aqua utiliza su poder divino para restaurar parte de sus propios puntos de vida.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'heal',
        value: 28
      }
    },

    {
      id: 'aqua3',
      name: 'Bendición de la Diosa',
      power: 0,
      acc: 1.0,
      desc: 'Aqua fortalece temporalmente a un aliado mediante su poder divino, aumentando su ATK y DEF.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'aqua4',
      name: 'ULTI: Sacrificio de la Diosa',
      power: 22,
      acc: 0.90,
      desc: 'Aqua libera una enorme cantidad de poder divino en un ataque devastador que además debilita las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'konan',
  name: 'Konan',
  img: 'personajes/konan.jpg',
  classes: ['mago', 'control', 'debilitador'],

  hp: 115,
  atk: 28,
  def: 14,
  spd: 20,

  moves: [
    {
      id: 'konan1',
      name: 'Shuriken de Papel',
      power: 22,
      acc: 0.97,
      desc: 'Konan transforma hojas de papel en afilados proyectiles que lanza contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'konan2',
      name: 'Danza del Papel',
      power: 24,
      acc: 0.94,
      desc: 'Konan envuelve al enemigo con una corriente de papel, dificultando sus movimientos y reduciendo su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'spd',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'konan3',
      name: 'Ángel de Papel',
      power: 0,
      acc: 1.0,
      desc: 'Konan despliega sus alas de papel y se protege mientras aumenta temporalmente su DEF y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'konan4',
      name: 'ULTI: Mar de Papel',
      power: 30,
      acc: 0.91,
      desc: 'Konan cubre el campo de batalla con una enorme cantidad de papel, atrapando al enemigo y debilitando sus defensas.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 15,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'kirara_hoshi',
  name: 'Kirara Hoshi',
  img: 'personajes/kirara.jpg',
  classes: ['control', 'soporte', 'debilitador'],

  hp: 118,
  atk: 29,
  def: 15,
  spd: 21,

  moves: [
    {
      id: 'kirara1',
      name: 'Golpe Astral',
      power: 25,
      acc: 0.96,
      desc: 'Kirara ataca al enemigo mientras manipula la trayectoria del combate con su técnica maldita.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'kirara2',
      name: 'Magnetismo Estelar',
      power: 22,
      acc: 0.94,
      desc: 'Kirara aplica su técnica de estrellas, dificultando que el enemigo pueda acercarse y ralentizando sus movimientos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'slow',
        value: 25,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'kirara3',
      name: 'Órbita Protectora',
      power: 0,
      acc: 1.0,
      desc: 'Kirara utiliza su técnica para protegerse y controlar el espacio a su alrededor, aumentando temporalmente su DEF y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'kirara4',
      name: 'ULTI: Estrellas de Intercepción',
      power: 30,
      acc: 0.90,
      desc: 'Kirara despliega por completo su técnica de estrellas, atrapando al enemigo en una trayectoria imposible y debilitando sus defensas.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 11,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 315,
          duration: 2,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'yumeko_jabami',
  name: 'Yumeko Jabami',
  img: 'personajes/yumeko.gif',
  classes: ['control', 'debilitador', 'atacante'],

  hp: 110,
  atk: 26,
  def: 13,
  spd: 20,

  moves: [
    {
      id: 'yumeko1',
      name: 'Apuesta Audaz',
      power: 20,
      acc: 0.96,
      desc: 'Yumeko realiza un ataque impredecible que puede dejar al enemigo en una situación desfavorable.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'yumeko2',
      name: 'Lectura del Rival',
      power: 24,
      acc: 0.94,
      desc: 'Yumeko analiza los movimientos del enemigo y encuentra una abertura, reduciendo su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'yumeko3',
      name: 'Adrenalina del Riesgo',
      power: 0,
      acc: 1.0,
      desc: 'Cuanto mayor es el riesgo, más disfruta Yumeko del combate. Aumenta temporalmente su ATK y probabilidad de crítico.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 8,
          duration: 3
        },
        {
          type: 'critChance',
          value: 12,
          duration: 3
        }
      ]
    },

    {
      id: 'yumeko4',
      name: 'ULTI: All In',
      power: 32,
      acc: 0.88,
      desc: 'Yumeko se lo juega todo en un único ataque. Si acierta, deja al enemigo debilitado y aumenta su propia probabilidad de crítico.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'critChance',
          value: 18,
          duration: 2
        }
      ]
    }
  ]
},

{
  id: 'jeffrey_epstein',
  name: 'Jeffrey Epstein',
  img: 'personajes/jeffrey.jpg',
  classes: ['debilitador', 'control', 'soporte'],

  hp: 120,
  atk: 23,
  def: 18,
  spd: 16,

  moves: [
    {
      id: 'jeffrey1',
      name: 'OH NO! LOS ARCHIVOS',
      power: 22,
      acc: 0.95,
      desc: 'Jeffrey utiliza sus contactos e influencia para desestabilizar al enemigo y reducir su ATK.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 7,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'jeffrey2',
      name: 'Violación de menores',
      power: 0,
      acc: 1.0,
      desc: 'Jeffrey manipula la situación a su favor, aumentando temporalmente su DEF y reduciendo la SPD del enemigo.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 5,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'jeffrey3',
      name: 'Dinero e Influencia',
      power: 24,
      acc: 0.91,
      desc: 'Jeffrey utiliza sus recursos para presionar al enemigo y debilitar sus defensas.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'jeffrey4',
      name: 'ULTI: La Isla Cae',
      power: 30,
      acc: 0.86,
      desc: 'Jeffrey moviliza toda su red de influencia, golpeando al enemigo y dejándolo gravemente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},

{
  id: 'crazydave',
  name: 'Crazy Dave',
  img: 'personajes/dave.png',
  classes: ['atacante', 'soporte'],
  hp: 110,
  atk: 30,
  def: 12,
  spd: 14,
  moves: [
    {
      id: 'cd1',
      name: 'Lanzamiento Loco',
      power: 25,
      acc: 0.95,
      desc: 'Ataque básico con pequeña probabilidad de aturdir.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type: 'stun', prob: 0.2, duration: 1 }
    },
    {
      id: 'cd2',
      name: 'Risa Contagiosa',
      power: 0,
      acc: 1.0,
      desc: 'Buff de ATK',
      baseCooldown: 3,
      type: 'support', 
      effect: { type:'tempAtk', value:5, duration:2 }
    },
    {
      id: 'cd3',
      name: 'Explosión de Locura',
      power: 30,
      acc: 0.9,
      desc: 'Daño fuerte y posible reducción DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 5, prob: 0.4 ,
        duration: 2}
    },
    {
      id: 'cd4',
      name: 'Fiesta Final',
      power: 20,
      acc: 1.0,
      desc: 'Ataque, cura 40',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type: 'heal', value: 40 }
      ]
    }
  ]
},

{
  id: 'mint_nte',
  name: 'Mint',
  img: 'personajes/mint.jpg',
  classes: ['atacante', 'control'],
  hp: 116,
  atk: 33,
  def: 14,
  spd: 22,

  moves: [
    {
      id: 'mint1',
      name: 'Perfect Containment',
      power: 27,
      acc: 0.97,
      desc: 'Mint realiza una rápida sucesión de golpes contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'mint2',
      name: 'Justice from Above',
      power: 32,
      acc: 0.94,
      desc: 'Mint se lanza sobre el enemigo desde arriba, causando un fuerte impacto y ralentizando sus movimientos.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 20,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'mint3',
      name: 'Caramel Crisp',
      power: 36,
      acc: 0.91,
      desc: 'Mint aprovecha una apertura para realizar un rápido contraataque con mayor probabilidad de golpe crítico.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'critChance',
          value: 15,
          duration: 1
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 5,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'mint4',
      name: 'ULTI: Thunderous Whirlwind Slash',
      power: 68,
      acc: 0.89,
      desc: 'Mint desata una enorme ráfaga de ataques giratorios que ralentiza al enemigo y reduce temporalmente su defensa.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'critChance',
          value: 20,
          duration: 1
        },
        {
          type: 'slow',
          value: 25,
          duration: 2,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 2,
          prob: 1.0
        }
      ]
    }
  ]
},
{
  id: 'tokoyami_towa',
  name: 'Tokoyami Towa',
  img: 'personajes/tokoyami.jpg',
  classes: ['mago', 'control', 'debilitador'],

  hp: 112,
  atk: 31,
  def: 14,
  spd: 18,

  moves: [
    {
      id: 'towa1',
      name: 'Dark Blast',
      power: 20,
      acc: 0.97,
      desc: 'Towa dispara una ráfaga de energía oscura contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'towa2',
      name: 'Maldición Carmesí',
      power: 25,
      acc: 0.94,
      desc: 'Towa lanza una maldición que debilita al enemigo y le causa daño continuo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'burn',
          value: 6,
          duration: 3,
          prob: 0.8
        }
      ]
    },

    {
      id: 'towa3',
      name: 'Dark Chains',
      power: 26,
      acc: 0.91,
      desc: 'Towa atrapa al enemigo con cadenas oscuras, ralentizando sus movimientos.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 20,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 5,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'towa4',
      name: 'ULTI: Apocalypse',
      power: 30,
      acc: 0.89,
      desc: 'Towa libera una enorme explosión de energía demoníaca que daña al enemigo, reduce su DEF y provoca sangrado.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 9,
          duration: 3,
          prob: 0.8
        }
      ]
    }
  ]
},
{
  id: 'owari_azur_lane',
  name: 'Owari',
  img: 'personajes/owari.jpg',
  classes: ['atacante', 'defensor', 'soporte'],
  hp: 155,
  atk: 26,
  def: 24,
  spd: 11,

  moves: [
    {
      id: 'owari1',
      name: 'Salva Principal',
      power: 22,
      acc: 0.96,
      desc: 'Owari dispara una potente salva de artillería pesada contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'owari2',
      name: 'Fuego de Acero',
      power: 26,
      acc: 0.92,
      desc: 'Owari concentra el poder de sus cañones en una descarga que daña al enemigo y reduce su defensa.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    },

    {
      id: 'owari3',
      name: 'Coraza de Kii',
      power: 0,
      acc: 1.0,
      desc: 'Owari refuerza su armadura y crea una barrera para protegerse de los próximos ataques.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 15,
          duration: 3
        },
        {
          type: 'shield',
          value: 20
        }
      ]
    },

    {
      id: 'owari4',
      name: 'ULTI: Destrucción de la Gran Flota',
      power: 30,
      acc: 0.88,
      desc: 'Owari libera toda la potencia de su artillería en una devastadora salva que destruye las defensas enemigas y recupera parte de su vida.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 12,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'lifesteal',
          value: 30,
          duration: 1
        }
      ]
    }
  ]
},

{
  id: 'belerick',
  name: 'Belerick',
  img: 'personajes/belerick.jpg',
  classes: ['defensor', 'soporte', 'control'],
  hp: 175,
  atk: 18,
  def: 30,
  spd: 11,

  moves: [
    {
      id: 'belerick_natures_grasp',
      name: 'Agarre de la Naturaleza',
      power: 20,
      acc: 0.96,
      desc: 'Belerick golpea al enemigo con raíces y prepara su cuerpo para devolver parte del daño recibido.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'reflectDamage',
        value: 20,
        duration: 2
      }
    },

    {
      id: 'belerick_natures_guardian',
      name: 'Guardián de la Naturaleza',
      power: 0,
      acc: 1.0,
      desc: 'Belerick refuerza su cuerpo con energía natural, aumentando su DEF y creando un escudo protector.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 9,
          duration: 3
        },
        {
          type: 'shield',
          value: 28
        }
      ]
    },

    {
      id: 'belerick_wrath_of_dryad',
      name: 'Ira de la Dríade',
      power: 22,
      acc: 0.93,
      desc: 'Belerick libera una poderosa ofensiva de raíces y convierte parte del daño que recibe en daño reflejado.',
      baseCooldown: 4,
      type: 'attack',
      effects: [
        {
          type: 'reflectDamage',
          value: 30,
          duration: 3
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 8,
          duration: 3
        }
      ]
    },

    {
      id: 'belerick_lifebloom',
      name: 'Flor de la Vida',
      power: 0,
      acc: 1.0,
      desc: 'Belerick utiliza la energía de la naturaleza para recuperar parte de sus HP y resistir durante más tiempo.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'selfHealPct',
          value: 0.04
        },
        {
          type: 'tempDef',
          value: 8,
          duration: 2
        }
      ]
    },

    {
      id: 'belerick_natures_will',
      name: 'Voluntad de la Naturaleza',
      power: 0,
      acc: 1.0,
      desc: 'Belerick adopta una postura defensiva absoluta, aumentando enormemente su DEF y reflejando una parte del daño recibido.',
      baseCooldown: 5,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 10,
          duration: 3
        },
        {
          type: 'shield',
          value: 35
        },
        {
          type: 'reflectDamage',
          value: 35,
          duration: 3
        }
      ]
    },

    {
      id: 'belerick_natures_wrath',
      name: 'ULTI: Ira de la Naturaleza',
      power: 26,
      acc: 0.90,
      desc: 'Belerick libera toda la fuerza de la naturaleza. Después del impacto queda protegido y devuelve una gran parte del daño que recibe.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3
        },
        {
          type: 'reflectDamage',
          value: 45,
          duration: 3
        },
        {
          type: 'selfHealPct',
          value: 0.05
        }
      ]
    }
  ]
},

{
  id: 'stocking_psg',
  name: 'Stocking Anarchy',
  img: 'personajes/stoking.jpg',

  classes: ['atacante', 'mago', 'debilitador'],

  hp: 115,
  atk: 28,
  def: 13,
  spd: 21,

  moves: [
    {
      id: 'stocking_stripe_1',
      name: 'Stripe I',
      power: 20,
      acc: 0.96,
      desc: 'Stocking desenvaina una de sus espadas y realiza un rápido corte contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'stocking_dark_slash',
      name: 'Dark Slash',
      power: 25,
      acc: 0.94,
      desc: 'Stocking libera una energía oscura con sus espadas que provoca sangrado y debilita el ataque del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 6,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'stocking_sweet_control',
      name: 'Sweet Temptation',
      power: 22,
      acc: 0.92,
      desc: 'Stocking utiliza su energía sobrenatural para desestabilizar al enemigo, reduciendo su velocidad y dificultando sus movimientos.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 10,
          duration: 3,
          prob: 1.0
        }
      ]
    },

    {
      id: 'stocking_double_strike',
      name: 'ULTI: Double Trouble',
      power: 30,
      acc: 0.89,
      desc: 'Stocking empuña ambas espadas y descarga todo su poder en una feroz combinación de ataques que debilita gravemente al enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 6,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},
{
  id: 'isaac',
  name: 'Isaac Moriah',
  img: 'personajes/isac.png',

  classes: ['mago', 'debilitador'],

  hp: 150,
  atk: 37,
  def: 12,
  spd: 17,

  moves: [
    {
      id: 'isac_basic',
      name: 'Lágrima básica',
      power: 21,
      acc: 1,
      desc: 'Lanza lágrimas a su enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'isaac_poison_tear',
      name: 'Galleta arcoíris',
      power: 24,
      acc: 0.95,
      desc: 'Isaac dispara una lágrima venenosa que envenena al enemigo y ralentiza sus movimientos.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'damageOverTime',
          status: 'poison',
          value: 7,
          duration: 2,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 18,
          duration: 3
        }
      ]
    },

    {
      id: 'isaac_ice_tear',
      name: 'Urano',
      power: 28,
      acc: 0.95,
      desc: 'Isaac dispara una lágrima helada que ralentiza al enemigo y puede congelarlo temporalmente.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 9,
          duration: 3
        },
        {
          type: 'freeze',
          duration: 1,
          prob: 0.4
        }
      ]
    },

    {
      id: 'isaac_ultimate',
      name: "Tecla 'R'",
      power: 0,
      acc: 1.0,
      desc: 'Isaac recibe una enorme curación y crea un poderoso escudo que absorbe daño (usable en aliados).',
      baseCooldown: 99,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 999
        },
        {
          type: 'shield',
          value: 25
        }
      ]
    }
  ]
},


{
  id: 'punpun',
  name: 'Punpun Punyama',
  img: 'personajes/punpun.jpg',

  classes: ['atacante', 'debilitador'],

  hp: 130,
  atk: 26,
  def: 18,
  spd: 20,

  moves: [
    {
      id: 'pun_atk1',
      name: '¡Dispara!',
      power: 20,
      acc: 0.95,
      desc: 'Hace un pequeño ataque a tu enemigo por las espaldas.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'pun_atk2',
      name: 'Oyasumi',
      power: 18,
      acc: 0.9,
      desc: 'Punpun se va a dormir, reduciendo la velocidad y el ataque del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'spd',
          value: 8,
          duration: 2
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 2
        }
      ]
    },

    {
      id: 'punatk_3',
      name: 'Aiko...',
      power: 24,
      acc: 0.97,
      desc: 'Punpun extraña a Aiko, hace daño a su enemigo e inflige quemadura.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'damageOverTime',
        status: 'burn',
        value: 8,
        duration: 3,
        prob: 0.8
      }
    },

    {
      id: 'punatk_ult',
      name: 'Kamisama Kamisama, Chinkuru Hoi',
      power: 30,
      acc: 0.98,
      desc: 'Punpun habla con Dios, aturde al enemigo e inflige daño.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type: 'stun',
        duration: 1,
        prob: 1.0
      }
    }
  ]
},

{
  id: 'fediel_granblue_fantasy',
  name: 'Fediel',
  img: 'personajes/fediel.jpg',
  classes: ['mago', 'control', 'debilitador'],
  hp: 128,
  atk: 27,
  def: 16,
  spd: 17,

  moves: [
    {
      id: 'fediel_dark_breath',
      name: 'Aliento de Oscuridad',
      power: 20,
      acc: 0.95,
      desc: 'Fediel libera una oleada de energía dracónica oscura que corroe al enemigo y le provoca Sangrado.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 5,
          duration: 4,
          prob: 1.0
        }
      ]
    },

    {
      id: 'fediel_shadow_grasp',
      name: 'Shadow Grasp',
      power: 23,
      acc: 0.93,
      desc: 'Sombras de Fediel envuelven al enemigo, reduciendo su velocidad y dificultando sus movimientos.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'spd',
          value: 4,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'fediel_draconic_veil',
      name: 'Manto Dracónico',
      power: 0,
      acc: 1.0,
      desc: 'Fediel envuelve su cuerpo con energía dracónica, aumentando su DEF y protegiéndose mediante un escudo.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        },
        {
          type: 'shield',
          value: 24
        }
      ]
    },

    {
      id: 'fediel_lord_of_darkness',
      name: 'ULTI: Lord of Darkness',
      power: 30,
      acc: 0.87,
      desc: 'Fediel libera una gigantesca explosión de poder dracónico que arrasa al enemigo, provoca Sangrado y reduce su DEF.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'damageOverTime',
          status: 'bleed',
          value: 7,
          duration: 4,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    }
  ]
},
{
  id: 'fern_frieren',
  name: 'Fern',
  img: 'personajes/fern.jpg',
  classes: ['mago', 'atacante', 'debilitador'],

  hp: 108,
  atk: 28,
  def: 13,
  spd: 21,

  moves: [
    {
      id: 'fern_zoltraak',
      name: 'Zoltraak',
      power: 20,
      acc: 0.97,
      desc: 'Fern dispara una poderosa ráfaga de Zoltraak contra el enemigo, causando daño mágico directo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'fern_poison_mist',
      name: 'Niebla Venenosa',
      power: 24,
      acc: 0.94,
      desc: 'Fern libera una energía mágica contaminante que envenena al enemigo durante varios turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'damageOverTime',
        status: 'poison',
        value: 7,
        duration: 3,
        prob: 0.9
      }
    },

    {
      id: 'fern_magic_suppression',
      name: 'Supresión Mágica',
      power: 24,
      acc: 0.93,
      desc: 'Fern lanza un hechizo preciso que atraviesa las defensas del enemigo y reduce su DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 9,
        duration: 3,
        prob: 1.0
      }
    },

    {
      id: 'fern_high_speed_zoltraak',
      name: 'ULTI: Zoltraak de Alta Velocidad',
      power: 30,
      acc: 0.88,
      desc: 'Fern libera una sucesión devastadora de disparos mágicos que deja al enemigo gravemente envenenado.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'damageOverTime',
        status: 'poison',
        value: 5,
        duration: 4,
        prob: 1.0
      }
    }
  ]
},
{
  id: 'hsin_wuthering_waves',
  name: 'Hsin',
  img: 'personajes/hsin.jpg',
  classes: ['atacante', 'mago', 'control'],
  hp: 118,
  atk: 26,
  def: 14,
  spd: 20,

  moves: [
    {
      id: 'hsin_moonlight_strike',
      name: 'Moonlight Strike',
      power: 20,
      acc: 0.95,
      desc: 'Hsin libera una descarga de energía lunar contra el enemigo, causando daño y reduciendo temporalmente su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2
      }
    },

    {
      id: 'hsin_burning_flare',
      name: 'Burning Flare',
      power: 24,
      acc: 0.92,
      desc: 'Hsin concentra una intensa energía ardiente en su ataque. El impacto aplica Quemadura al enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'damageOverTime',
        status: 'burn',
        value: 6,
        duration: 3,
        prob: 0.85
      }
    },

    {
      id: 'hsin_answering_heart',
      name: 'Answering Heart',
      power: 0,
      acc: 1.0,
      desc: 'Hsin concentra su energía y aumenta considerablemente su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 12,
        duration: 3
      }
    },

    {
      id: 'hsin_flame_pillars',
      name: 'Flame Pillars',
      power: 25,
      acc: 0.9,
      desc: 'Hsin hace surgir columnas de energía que golpean al enemigo y prolongan la Quemadura.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'damageOverTime',
        status: 'burn',
        value: 6,
        duration: 3,
        prob: 0.9
      }
    },

    {
      id: 'hsin_illumining_form',
      name: 'Illumining Form',
      power: 0,
      acc: 1.0,
      desc: 'Hsin entra en su forma iluminada, aumentando temporalmente su SPD y preparándose para una ofensiva más poderosa.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'tempSpd',
        value: 8,
        duration: 3
      }
    },

    {
      id: 'hsin_moon_fox_cataclysm',
      name: 'Moon Fox Cataclysm',
      power: 30,
      acc: 0.88,
      desc: 'Hsin libera todo su poder en una devastadora ofensiva. El impacto provoca una intensa Quemadura que continúa dañando al enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'damageOverTime',
        status: 'burn',
        value: 9,
        duration: 4,
        prob: 1.0
      }
    }
  ]
},

{
  id: 'tier_harribel',
  name: 'Tier Harribel',
  img: 'personajes/harribel.jpg',
  classes: ['atacante', 'defensor', 'control'],
  hp: 145,
  atk: 28,
  def: 22,
  spd: 14,
  moves: [
    {
      id: 'harribel_ola_azul',
      name: 'Ola Azul',
      power: 23,
      acc: 0.95,
      desc: 'Harribel concentra su energía en su espada y dispara una poderosa descarga que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 6, duration: 2 }
    },
    {
      id: 'harribel_cascada',
      name: 'Cascada',
      power: 25,
      acc: 0.92,
      desc: 'Harribel libera una enorme corriente de agua que golpea al enemigo y reduce considerablemente su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'harribel_escudo_de_agua',
      name: 'Escudo de Agua',
      power: 0,
      acc: 1.0,
      desc: 'Harribel crea una barrera de agua a su alrededor, aumentando considerablemente su DEF durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempDef', value: 14, duration: 3 }
    },
    {
      id: 'harribel_la_gota',
      name: 'La Gota',
      power: 27,
      acc: 0.9,
      desc: 'Harribel concentra una gran cantidad de agua y la dispara con enorme fuerza, debilitando las defensas del enemigo.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 9, duration: 3 }
    },
    {
      id: 'harribel_poder_del_tiburon',
      name: 'Poder del Tiburón',
      power: 0,
      acc: 1.0,
      desc: 'Harribel libera el poder de Tiburón y aumenta temporalmente su ATK y su capacidad ofensiva.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempAtk', value: 13, duration: 3 }
    },
    {
      id: 'harribel_cascada_final',
      name: 'Cascada Suprema',
      power:30,
      acc: 0.88,
      desc: 'Harribel desata una gigantesca corriente de agua con todo el poder de su Resurrección, devastando al enemigo y dejando sus defensas gravemente debilitadas.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 13, duration: 3 }
    }
  ]
},

{
  id: 'shylily',
  name: 'Shylily',
  img: 'personajes/lily.jpg',
  classes: ['mago', 'soporte', 'control'],
  hp: 110,
  atk: 27,
  def: 14,
  spd: 17,
  moves: [
    {
      id: 'shylily_ocean_blast',
      name: 'Ocean Blast',
      power: 27,
      acc: 0.95,
      desc: 'Shylily libera una poderosa ráfaga de energía oceánica que reduce temporalmente el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'shylily_orca_dash',
      name: 'Orca Dash',
      power: 29,
      acc: 0.92,
      desc: 'Shylily se mueve con rapidez como una orca y golpea al enemigo, reduciendo su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 7, duration: 3 }
    },
    {
      id: 'shylily_oceanic_power',
      name: 'Oceanic Power',
      power: 0,
      acc: 1.0,
      desc: 'Shylily canaliza la energía del océano para aumentar considerablemente su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 11, duration: 3 }
    },
    {
      id: 'shylily_tidal_wave',
      name: 'Tidal Wave',
      power: 34,
      acc: 0.9,
      desc: 'Shylily invoca una enorme ola que golpea al enemigo y reduce considerablemente su DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 8, duration: 3 }
    },
    {
      id: 'shylily_ocean_recovery',
      name: 'Ocean Recovery',
      power: 0,
      acc: 1.0,
      desc: 'Shylily recupera parte de sus fuerzas utilizando la energía del océano.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.2 }
    },
    {
      id: 'shylily_womp_womp',
      name: 'Womp Womp',
      power: 72,
      acc: 0.88,
      desc: 'Shylily libera todo su poder oceánico en un devastador ataque que deja al enemigo gravemente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 12, duration: 3 }
    }
  ]
},

{
  id: 'implacable_azur_lane',
  name: 'Implacable',
  img: 'personajes/implacable.jpg',
  classes: ['mago', 'control', 'soporte'],
  hp: 135,
  atk: 30,
  def: 17,
  spd: 14,
  moves: [
    {
      id: 'implacable_air_strike',
      name: 'Air Strike',
      power: 22,
      acc: 0.94,
      desc: 'Implacable lanza un poderoso ataque aéreo que golpea al enemigo y reduce considerablemente su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'implacable_no_escape',
      name: 'No Escape',
      power: 25,
      acc: 0.95,
      desc: 'Implacable controla el campo de batalla y ralentiza al enemigo, reduciendo considerablemente su SPD durante varios turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 9, duration: 3 }
    },
    {
      id: 'implacable_cruel_mercy',
      name: 'Cruel Mercy',
      power: 0,
      acc: 1.0,
      desc: 'Implacable acumula poder para su siguiente ofensiva, aumentando considerablemente su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 13, duration: 3 }
    },
    {
      id: 'implacable_slowing_field',
      name: 'Slowing Field',
      power: 20,
      acc: 0.92,
      desc: 'Una poderosa interferencia ralentiza al enemigo y reduce su capacidad para actuar con rapidez.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 11, duration: 3 }
    },
    {
      id: 'implacable_royal_protection',
      name: 'Royal Protection',
      power: 0,
      acc: 1.0,
      desc: 'Implacable utiliza su resistencia de portaaviones acorazado para reforzar temporalmente sus defensas.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempDef', value: 12, duration: 3 }
    },
    {
      id: 'implacable_unforgiving_airstrike',
      name: 'Unforgiving Airstrike',
      power: 30,
      acc: 0.88,
      desc: 'Implacable desata una devastadora ofensiva aérea que golpea con enorme fuerza y deja las defensas del enemigo gravemente debilitadas.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 13, duration: 3 }
    }
  ]
},


{
  id: 'wakamo_blue_archive',
  name: 'Wakamo',
  img: 'personajes/wakamo.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 112,
  atk: 28,
  def: 13,
  spd: 18,
  moves: [
    {
      id: 'wakamo_crimson_flower',
      name: 'Crimson Flower Divination',
      power: 22,
      acc: 0.95,
      desc: 'Wakamo dispara una poderosa flecha y deja al enemigo marcado por su devastador poder, reduciendo su DEF durante varios turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 8, duration: 3 }
    },
    {
      id: 'wakamo_scattered_flower',
      name: 'Scattered Flower Storm',
      power: 24,
      acc: 0.94,
      desc: 'Una lluvia de proyectiles atraviesa al enemigo y debilita temporalmente su capacidad ofensiva.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 7, duration: 2 }
    },
    {
      id: 'wakamo_blossoming_destruction',
      name: 'Blossoming Destruction',
      power: 0,
      acc: 1.0,
      desc: 'Wakamo libera su impulso destructivo y aumenta considerablemente su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 14, duration: 3 }
    },
    {
      id: 'wakamo_fox_hunt',
      name: 'Fox Hunt',
      power: 28,
      acc: 0.92,
      desc: 'Wakamo persigue al enemigo con una rápida sucesión de ataques, reduciendo su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'wakamo_burning_passion',
      name: 'Burning Passion',
      power: 0,
      acc: 1.0,
      desc: 'La intensa determinación de Wakamo despierta todavía más su poder ofensivo, aumentando temporalmente su ATK.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempAtk', value: 10, duration: 3 }
    },
    {
      id: 'wakamo_crimson_destruction',
      name: 'Crimson Destruction',
      power: 32,
      acc: 0.88,
      desc: 'Wakamo descarga todo su poder en un ataque devastador que deja al enemigo gravemente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 13, duration: 3 }
    }
  ]
},

{
  id: 'dizzy_guilty_gear',
  name: 'Dizzy',
  img: 'personajes/dizzy.jpg',
  classes: ['mago', 'control', 'soporte'],
  hp: 125,
  atk: 34,
  def: 16,
  spd: 15,
  moves: [
    {
      id: 'dizzy_ice_field',
      name: 'Ice Field',
      power: 27,
      acc: 0.92,
      desc: 'Dizzy congela el terreno alrededor del enemigo con el poder de Undine, reduciendo su SPD durante varios turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'dizzy_necro_attack',
      name: 'Necro',
      power: 32,
      acc: 0.93,
      desc: 'Necro libera su poder oscuro contra el enemigo, debilitando su capacidad ofensiva.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 7, duration: 2 }
    },
    {
      id: 'dizzy_undine',
      name: 'Undine',
      power: 0,
      acc: 1.0,
      desc: 'Dizzy canaliza el poder de Undine para protegerse y aumentar temporalmente su DEF.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempDef', value: 12, duration: 3 }
    },
    {
      id: 'dizzy_michael_sword',
      name: 'Michael Sword',
      power: 38,
      acc: 0.9,
      desc: 'Dizzy invoca la espada de energía y descarga un poderoso ataque que reduce considerablemente la DEF del enemigo.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 9, duration: 3 }
    },
    {
      id: 'dizzy_queen_compassion',
      name: 'Queen of Compassion',
      power: 0,
      acc: 1.0,
      desc: 'Dizzy utiliza sus poderes para recuperar parte de sus fuerzas y continuar protegiendo a quienes considera su familia.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.22 }
    },
    {
      id: 'dizzy_wings_of_light',
      name: 'Wings of Light',
      power: 76,
      acc: 0.88,
      desc: 'Dizzy libera una enorme cantidad de energía luminosa que arrasa al enemigo y deja sus defensas gravemente debilitadas.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 13, duration: 3 }
    }
  ]
},

{
  id: 'mudrock_arknights',
  name: 'Mudrock',
  img: 'personajes/mudrock.jpg',
  classes: ['defensor', 'atacante'],
  hp: 155,
  atk: 31,
  def: 27,
  spd: 9,
  moves: [
    {
      id: 'mudrock_defensive_stance',
      name: 'Postura Defensiva',
      power: 0,
      acc: 1.0,
      desc: 'Mudrock adopta una postura defensiva y aumenta considerablemente su DEF durante varios turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: { type: 'tempDef', value: 14, duration: 3 }
    },
    {
      id: 'mudrock_crag_splitter',
      name: 'Crag Splitter',
      power: 34,
      acc: 0.92,
      desc: 'Mudrock golpea violentamente con su martillo y recupera parte de sus fuerzas mientras debilita la DEF del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'mudrock_earth_shield',
      name: 'Escudo de Tierra',
      power: 0,
      acc: 1.0,
      desc: 'Mudrock se rodea de una poderosa barrera de tierra que absorbe parte del daño y refuerza temporalmente su defensa.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'shield', value: 25 }
    },
    {
      id: 'mudrock_heavy_slam',
      name: 'Golpe Demoledor',
      power: 40,
      acc: 0.9,
      desc: 'Mudrock descarga toda la fuerza de su enorme martillo sobre el enemigo, reduciendo su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 8, duration: 3 }
    },
    {
      id: 'mudrock_fertile_soil',
      name: 'Tierra Fértil',
      power: 0,
      acc: 1.0,
      desc: 'Cuando sus defensas se debilitan, Mudrock utiliza el poder de la tierra para recuperar una parte importante de sus HP.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.22 }
    },
    {
      id: 'mudrock_bloodline',
      name: 'Bloodline of Desecrated Earth',
      power: 70,
      acc: 0.9,
      desc: 'Mudrock libera todo el poder de la tierra, fortaleciendo enormemente su cuerpo y descargando un devastador golpe que debilita gravemente al enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'tempDef', value: 16, duration: 3 }
    }
  ]
},

{
  id: 'nekomata_okayu',
  name: 'Nekomata Okayu',
  img: 'personajes/onigiria.jpg',
  classes: ['soporte', 'control', 'atacante'],
  hp: 118,
  atk: 29,
  def: 15,
  spd: 20,
  moves: [
    {
      id: 'okayu_mogu_mogu',
      name: 'Mogu Mogu',
      power: 23,
      acc: 0.95,
      desc: 'Okayu ataca al enemigo con su característica energía felina y recupera parte de sus fuerzas.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'selfHealPct', value: 0.08 }
    },
    {
      id: 'okayu_cat_step',
      name: 'Cat Step',
      power: 24,
      acc: 0.95,
      desc: 'Okayu se mueve con gran agilidad alrededor del enemigo, reduciendo temporalmente su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 2 }
    },
    {
      id: 'okayu_yummy',
      name: 'Yummy',
      power: 0,
      acc: 1.0,
      desc: 'Okayu recupera energía mientras disfruta de su comida favorita, aumentando considerablemente su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 10, duration: 3 }
    },
    {
      id: 'okayu_feast',
      name: 'Feast',
      power: 25,
      acc: 0.92,
      desc: 'Okayu se lanza sobre el enemigo con un poderoso ataque que debilita su capacidad ofensiva.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 7, duration: 3 }
    },
    {
      id: 'okayu_healing_snack',
      name: 'Bocado Curativo',
      power: 0,
      acc: 1.0,
      desc: 'Okayu come tranquilamente para recuperar una parte importante de sus HP.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.22 }
    },
    {
      id: 'okayu_mogu_mogu_max',
      name: 'Mogu Mogu MAX',
      power: 30,
      acc: 0.9,
      desc: 'Okayu libera toda su energía felina en un ataque devastador que reduce considerablemente la DEF del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 11, duration: 3 }
    }
  ]
},

{
  id: 'lucy_kushinada',
  name: 'Lucy Kushinada',
  img: 'personajes/lucy.jpg',
  classes: ['mago', 'control', 'debilitador'],
  hp: 105,
  atk: 33,
  def: 12,
  spd: 20,
  moves: [
    {
      id: 'lucy_quickhack',
      name: 'Quickhack',
      power: 28,
      acc: 0.96,
      desc: 'Lucy invade los sistemas del enemigo y provoca una sobrecarga digital que reduce temporalmente su ATK.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 7, duration: 2 }
    },
    {
      id: 'lucy_reboot_optics',
      name: 'Reboot Optics',
      power: 25,
      acc: 0.95,
      desc: 'Lucy interfiere con los sistemas sensoriales del enemigo, dificultando sus movimientos y reduciendo su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'lucy_net_runner',
      name: 'Netrunner',
      power: 0,
      acc: 1.0,
      desc: 'Lucy entra en un estado de concentración absoluta y aumenta temporalmente su ATK y su capacidad para ejecutar ataques digitales.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 12, duration: 3 }
    },
    {
      id: 'lucy_system_corruption',
      name: 'System Corruption',
      power: 35,
      acc: 0.9,
      desc: 'Lucy corrompe los sistemas del enemigo, provocando una importante reducción de su DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 9, duration: 3 }
    },
    {
      id: 'lucy_deep_dive',
      name: 'Deep Dive',
      power: 0,
      acc: 1.0,
      desc: 'Lucy se concentra profundamente en la red para recuperar parte de sus fuerzas antes de volver al combate.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.18 }
    },
    {
      id: 'lucy_blackwall',
      name: 'Blackwall',
      power: 74,
      acc: 0.88,
      desc: 'Lucy libera una poderosa descarga de la red que atraviesa las defensas digitales del enemigo y lo deja gravemente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 12, duration: 3 }
    }
  ]
},

{
  id: 'athena_asamiya_kof',
  name: 'Athena Asamiya',
  img: 'personajes/asamiya.jpg',
  classes: ['mago', 'soporte', 'control'],
  hp: 112,
  atk: 30,
  def: 15,
  spd: 19,
  moves: [
    {
      id: 'athena_psycho_ball',
      name: 'Psycho Ball',
      power: 28,
      acc: 0.95,
      desc: 'Athena concentra su poder psíquico en una esfera de energía y la lanza contra el enemigo, reduciendo su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 6, duration: 2 }
    },
    {
      id: 'athena_psycho_sword',
      name: 'Psycho Sword',
      power: 34,
      acc: 0.92,
      desc: 'Athena se eleva envuelta en energía psíquica y golpea al enemigo con una poderosa descarga.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'athena_psycho_reflector',
      name: 'Psycho Reflector',
      power: 0,
      acc: 1.0,
      desc: 'Athena crea una barrera de energía psíquica que aumenta considerablemente su DEF durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempDef', value: 11, duration: 3 }
    },
    {
      id: 'athena_psycho_teleport',
      name: 'Psycho Teleport',
      power: 25,
      acc: 0.9,
      desc: 'Athena se teletransporta alrededor del enemigo y aparece en un instante para golpearlo, reduciendo temporalmente su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 7, duration: 2 }
    },
    {
      id: 'athena_psycho_heal',
      name: 'Psycho Heal',
      power: 0,
      acc: 1.0,
      desc: 'Athena utiliza sus poderes psíquicos para recuperar parte de sus fuerzas.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.22 }
    },
    {
      id: 'athena_shining_crystal_bit',
      name: 'Shining Crystal Bit',
      power: 70,
      acc: 0.9,
      desc: 'Athena concentra una enorme cantidad de energía psíquica a su alrededor y libera todo su poder en un devastador ataque.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 9, duration: 3 }
    }
  ]
},

{
  id: 'ellie_omniheroes',
  name: 'Ellie',
  img: 'personajes/eli.png',
  classes: ['mago', 'debilitador', 'control'],
  hp: 108,
  atk: 26,
  def: 12,
  spd: 18,
  moves: [
    {
      id: 'ellie_profligate',
      name: 'Profligate',
      power: 22,
      acc: 0.92,
      desc: 'Ellie y Mister Rabbit combinan sus poderes para lanzar un devastador ataque mágico que debilita la capacidad ofensiva del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 7, duration: 2 }
    },
    {
      id: 'ellie_awakened_fear',
      name: 'Miedo Despertado',
      power: 25,
      acc: 0.9,
      desc: 'Mister Rabbit libera un poderoso rugido oscuro que aterroriza al enemigo y reduce su SPD durante varios turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 7, duration: 3 }
    },
    {
      id: 'ellie_nightmare',
      name: 'Pesadilla',
      power: 0,
      acc: 1.0,
      desc: 'Ellie desata el poder de Mister Rabbit, aumentando temporalmente su ATK para aprovechar las debilidades del enemigo.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 12, duration: 3 }
    },
    {
      id: 'ellie_dark_rabbit',
      name: 'Mister Rabbit',
      power: 26,
      acc: 0.9,
      desc: 'Mister Rabbit ataca violentamente al enemigo y reduce considerablemente su DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 9, duration: 3 }
    },
    {
      id: 'ellie_revenge',
      name: 'Revenge',
      power: 0,
      acc: 1.0,
      desc: 'El deseo de venganza de Ellie le permite recuperar parte de sus fuerzas y continuar luchando.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.18 }
    },
    {
      id: 'ellie_endless_nightmare',
      name: 'Pesadilla Eterna',
      power: 32,
      acc: 0.88,
      desc: 'Ellie y Mister Rabbit liberan todo su poder oscuro en un ataque mágico devastador que deja al enemigo gravemente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 12, duration: 3 }
    }
  ]
},

{
  id: 'emily_omniheroes',
  name: 'Emily',
  img: 'personajes/emily.png',
  classes: ['mago', 'debilitador', 'soporte'],
  hp: 112,
  atk: 28,
  def: 14,
  spd: 16,

  moves: [
    {
      id: 'emily_sorrowful_rose',
      name: 'Rosa del Dolor',
      power: 23,
      acc: 0.95,
      desc: 'Emily invoca rosas oscuras que desgarran al enemigo y reducen ligeramente su defensa.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'emily_silent_lament',
      name: 'Lamento Silencioso',
      power: 25,
      acc: 0.91,
      desc: 'Enredaderas de rosas espectrales atacan al enemigo y reducen temporalmente su poder ofensivo.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'emily_lovers_soul',
      name: 'Alma de su Amado',
      power: 0,
      acc: 1.0,
      desc: 'Emily canaliza la energía de las almas que la rodean para recuperar parte de sus fuerzas.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.15
      }
    },

    {
      id: 'emily_sorrowgrave',
      name: 'ULTI: Sorrowgrave',
      power: 30,
      acc: 0.88,
      desc: 'Emily invoca una enorme tumba espectral que golpea al enemigo con una devastadora oleada de magia y reduce sus defensas.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 10,
        duration: 3,
        prob: 1.0
      }
    }
  ]
},
{
  id: 'unknown_oni_sorceress',
  name: 'Anshurii',
  img: 'personajes/anshuri.jpg',
  classes: ['mago', 'control', 'debilitador'],
  hp: 108,
  atk: 34,
  def: 12,
  spd: 18,
  moves: [
    {
      id: 'unknown_oni_dark_seal',
      name: 'Sello Oscuro',
      power: 25,
      acc: 0.95,
      desc: 'La hechicera invoca un sello maldito que debilita el poder ofensivo del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'unknown_oni_cursed_hands',
      name: 'Manos Malditas',
      power: 30,
      acc: 0.9,
      desc: 'Canaliza energía oscura a través de sus manos, dañando al enemigo y debilitando su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'unknown_oni_ritual',
      name: 'Ritual Prohibido',
      power: 0,
      acc: 1.0,
      desc: 'Realiza un antiguo ritual que despierta temporalmente su poder sobrenatural.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 11, duration: 3 }
    },
    {
      id: 'unknown_oni_chain_curse',
      name: 'Cadena Maldita',
      power: 33,
      acc: 0.88,
      desc: 'Una cadena de energía sobrenatural envuelve al enemigo y ralentiza sus movimientos.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'unknown_oni_soul_drain',
      name: 'Drenaje Espiritual',
      power: 0,
      acc: 1.0,
      desc: 'Absorbe parte de la energía sobrenatural del campo para recuperar sus fuerzas.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.2 }
    },
    {
      id: 'unknown_oni_forbidden_ritual',
      name: 'Ritual de la Condenación',
      power: 72,
      acc: 0.88,
      desc: 'Libera toda la energía acumulada en un ritual devastador que destroza las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 11, duration: 3 }
    }
  ]
},

{
  id: 'hela',
  name: 'Hela',
  img: 'personajes/hela.jpg',
  classes: ['mago', 'debilitador', 'control'],
  hp: 115,
  atk: 33,
  def: 14,
  spd: 17,
  moves: [
    {
      id: 'hela_dark_magic',
      name: 'Magia Oscura',
      power: 27,
      acc: 0.95,
      desc: 'Hela concentra energía oscura y lanza un ataque mágico que reduce el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'hela_cursed_gaze',
      name: 'Mirada Maldita',
      power: 29,
      acc: 0.9,
      desc: 'La mirada sobrenatural de Hela debilita al enemigo, reduciendo considerablemente su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'hela_oni_power',
      name: 'Poder Demoníaco',
      power: 0,
      acc: 1.0,
      desc: 'Hela libera parte de su verdadero poder y aumenta temporalmente su ATK.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 11, duration: 3 }
    },
    {
      id: 'hela_shadow_bind',
      name: 'Atadura de Sombras',
      power: 34,
      acc: 0.88,
      desc: 'Sombras oscuras envuelven al enemigo y dificultan sus movimientos, reduciendo su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'hela_dark_regeneration',
      name: 'Regeneración Oscura',
      power: 0,
      acc: 1.0,
      desc: 'Hela absorbe energía sobrenatural para recuperar parte de sus fuerzas.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.2 }
    },
    {
      id: 'hela_underworld',
      name: 'Reino del Inframundo',
      power: 70,
      acc: 0.9,
      desc: 'Hela manifiesta todo su poder y desata una devastadora oleada de energía oscura que destroza las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 11, duration: 3 }
    }
  ]
},

{
  id: 'nitocris_fate',
  name: 'Nitocris',
  img: 'personajes/nitocris.jpg',
  classes: ['mago', 'control', 'debilitador'],
  hp: 110,
  atk: 30,
  def: 13,
  spd: 16,
  moves: [
    {
      id: 'nitocris_sand_magic',
      name: 'Magia de Arena',
      power: 25,
      acc: 0.95,
      desc: 'Nitocris manipula la arena para atacar al enemigo y reducir temporalmente su SPD.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 6, duration: 2 }
    },
    {
      id: 'nitocris_ankh_magic',
      name: 'Magia del Ankh',
      power: 28,
      acc: 0.9,
      desc: 'Nitocris canaliza el poder de su ankh y lanza una poderosa descarga de energía que debilita la DEF enemiga.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'nitocris_egyptian_mystery',
      name: 'Misterio de Egipto',
      power: 0,
      acc: 1.0,
      desc: 'Nitocris invoca antiguos misterios egipcios para aumentar temporalmente su poder mágico.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 10, duration: 3 }
    },
    {
      id: 'nitocris_kingdom_of_the_dead',
      name: 'Reino de los Muertos',
      power: 36,
      acc: 0.88,
      desc: 'Nitocris abre un portal hacia el reino de los muertos, debilitando considerablemente el ATK del enemigo.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 8, duration: 3 }
    },
    {
      id: 'nitocris_divine_protection',
      name: 'Protección Divina',
      power: 0,
      acc: 1.0,
      desc: 'Nitocris utiliza su poder espiritual para recuperar parte de sus fuerzas.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.2 }
    },
    {
      id: 'nitocris_anpu_neteru',
      name: 'Anpu Neteru',
      power: 68,
      acc: 0.9,
      desc: 'Nitocris invoca el poder de Anubis y libera una devastadora oleada de espíritus que destroza las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 11, duration: 3 }
    }
  ]
},

{
  id: 'crusader_darkest_dungeon',
  name: 'Crusader',
  img: 'personajes/crusader.png',
  classes: ['defensor', 'atacante', 'soporte'],
  hp: 155,
  atk: 24,
  def: 25,
  spd: 9,
  moves: [
    {
      id: 'crusader_smite',
      name: 'Smite',
      power: 25,
      acc: 0.95,
      desc: 'El Crusader descarga un poderoso golpe sagrado contra el enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 5, duration: 2 }
    },
    {
      id: 'crusader_zealous_accusation',
      name: 'Zealous Accusation',
      power: 23,
      acc: 0.9,
      desc: 'El Crusader lanza un ataque impulsado por su fervor religioso que debilita la capacidad ofensiva del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'crusader_bulwark_of_faith',
      name: 'Bulwark of Faith',
      power: 0,
      acc: 1.0,
      desc: 'El Crusader se protege tras su armadura y su fe, aumentando considerablemente su DEF durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempDef', value: 12, duration: 3 }
    },
    {
      id: 'crusader_holy_lance',
      name: 'Holy Lance',
      power: 25,
      acc: 0.9,
      desc: 'El Crusader realiza una poderosa embestida sagrada que atraviesa las defensas del enemigo.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 8, duration: 2 }
    },
    {
      id: 'crusader_battle_heal',
      name: 'Battle Heal',
      power: 0,
      acc: 1.0,
      desc: 'El Crusader utiliza su entrenamiento para recuperar parte de sus fuerzas durante el combate.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.22 }
    },
    {
      id: 'crusader_righteous_fury',
      name: 'Righteous Fury',
      power: 30,
      acc: 0.9,
      desc: 'El Crusader concentra toda su determinación y descarga un devastador ataque sagrado, debilitando gravemente las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 10, duration: 3 }
    }
  ]
},

{
  id: 'akumi_yoclesh',
  name: 'Akumi',
  img: 'personajes/akumi.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 125,
  atk: 28,
  def: 15,
  spd: 18,
  moves: [
    {
      id: 'akumi_oni_strike',
      name: 'Golpe del Oni',
      power: 22,
      acc: 0.95,
      desc: 'Akumi desata su fuerza de oni en un poderoso ataque que reduce temporalmente el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'akumi_battle_instinct',
      name: 'Instinto de Batalla',
      power: 25,
      acc: 0.92,
      desc: 'Los antiguos instintos de combate de Akumi despiertan, permitiéndole golpear al enemigo mientras debilita su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'akumi_oni_rage',
      name: 'Furia del Oni',
      power: 0,
      acc: 1.0,
      desc: 'Akumi recupera temporalmente su ferocidad de antaño y aumenta considerablemente su ATK.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 11, duration: 3 }
    },
    {
      id: 'akumi_warrior_sense',
      name: 'Sentidos de Guerrera',
      power: 25,
      acc: 0.9,
      desc: 'La experiencia adquirida durante incontables batallas permite a Akumi anticiparse a los movimientos del enemigo y reducir su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 7, duration: 3 }
    },
    {
      id: 'akumi_oni_resilience',
      name: 'Resistencia del Oni',
      power: 0,
      acc: 1.0,
      desc: 'La naturaleza sobrenatural de Akumi le permite recuperarse de sus heridas y continuar luchando.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.18 }
    },
    {
      id: 'akumi_final_battle',
      name: 'Última Batalla',
      power: 32,
      acc: 0.88,
      desc: 'Akumi libera todo el poder de la guerrera que fue en el pasado, lanzando un devastador ataque que deja al enemigo gravemente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 10, duration: 3 }
    }
  ]
},

{
  id: 'aoki_ruki',
  name: 'Aoki Ruki',
  img: 'personajes/aoki.jpg',
  classes: ['mago', 'atacante'],
  hp: 112,
  atk: 33,
  def: 13,
  spd: 18,
  moves: [
    {
      id: 'ruki_flame_staff',
      name: 'Bastón de Llamas',
      power: 25,
      acc: 0.95,
      desc: 'Ruki canaliza fuego a través de su bastón y lanza una poderosa llamarada que debilita el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 5, duration: 2 }
    },
    {
      id: 'ruki_oni_fire',
      name: 'Fuego del Oni',
      power: 32,
      acc: 0.9,
      desc: 'Ruki libera una intensa energía demoníaca que quema al enemigo y reduce temporalmente su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'ruki_oni_power',
      name: 'Poder del Oni',
      power: 0,
      acc: 1.0,
      desc: 'Ruki despierta su naturaleza de oni y aumenta considerablemente su ATK durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 10, duration: 3 }
    },
    {
      id: 'ruki_flame_burst',
      name: 'Explosión Ígnea',
      power: 36,
      acc: 0.9,
      desc: 'Ruki concentra una gran cantidad de fuego en su bastón y la libera contra el enemigo, reduciendo su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 6, duration: 3 }
    },
    {
      id: 'ruki_demonic_flame',
      name: 'Llama Demoníaca',
      power: 0,
      acc: 1.0,
      desc: 'Ruki envuelve su cuerpo en llamas sobrenaturales y aumenta temporalmente su SPD para atacar con mayor rapidez.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempSpd', value: 8, duration: 3 }
    },
    {
      id: 'ruki_oni_hellfire',
      name: 'Infierno del Oni',
      power: 70,
      acc: 0.88,
      desc: 'Ruki desata todo el poder de sus llamas demoníacas en una devastadora explosión que deja al enemigo con sus defensas gravemente debilitadas.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 10, duration: 3 }
    }
  ]
},

{
  id: 'wooper',
  name: 'Wooper',
  img: 'personajes/wooper.jpg',
  classes: ['soporte', 'control'],
  hp: 130,
  atk: 19,
  def: 18,
  spd: 11,
  moves: [
    {
      id: 'wooper_water_gun',
      name: 'Pistola Agua',
      power: 20,
      acc: 0.95,
      desc: 'Wooper lanza un pequeño chorro de agua que reduce temporalmente el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 4, duration: 2 }
    },
    {
      id: 'wooper_muddy_water',
      name: 'Agua Lodosa',
      power: 25,
      acc: 0.9,
      desc: 'Wooper arroja agua llena de barro que dificulta los movimientos del enemigo y reduce su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 6, duration: 2 }
    },
    {
      id: 'wooper_rain_dance',
      name: 'Danza Lluvia',
      power: 0,
      acc: 1.0,
      desc: 'Wooper invoca una lluvia que refuerza temporalmente su capacidad defensiva.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempDef', value: 9, duration: 3 }
    },
    {
      id: 'wooper_bounce',
      name: 'Salto',
      power: 27,
      acc: 0.9,
      desc: 'Wooper salta torpemente contra el enemigo y reduce temporalmente su DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 5, duration: 2 }
    },
    {
      id: 'wooper_recover',
      name: 'Recuperación',
      power: 0,
      acc: 1.0,
      desc: 'Wooper recupera parte de sus fuerzas gracias a su gran capacidad de supervivencia.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.2 }
    },
    {
      id: 'wooper_earthquake',
      name: 'Terremoto',
      power: 52,
      acc: 0.9,
      desc: 'Wooper provoca un fuerte terremoto bajo el enemigo, reduciendo su DEF durante varios turnos.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 8, duration: 3 }
    }
  ]
},

{
  id: 'zentreya_dragon',
  name: 'Zentreya',
  img: 'personajes/zentreya.jpg',
  classes: ['mago', 'control'],
  hp: 115,
  atk: 27,
  def: 14,
  spd: 18,
  moves: [
    {
      id: 'zentreya_dragon_breath',
      name: 'Aliento de Dragón',
      power: 22,
      acc: 0.95,
      desc: 'Zentreya libera un poderoso aliento de fuego que envuelve al enemigo y reduce su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 6, duration: 2 }
    },
    {
      id: 'zentreya_dragon_claw',
      name: 'Garra Dracónica',
      power: 25,
      acc: 0.9,
      desc: 'Zentreya ataca con sus garras cargadas de energía, debilitando el ATK del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'zentreya_draconic_power',
      name: 'Poder Dracónico',
      power: 0,
      acc: 1.0,
      desc: 'Zentreya libera su poder de dragón y aumenta temporalmente su ATK.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempAtk', value: 9, duration: 3 }
    },
    {
      id: 'zentreya_dragon_roar',
      name: 'Rugido del Dragón',
      power: 23,
      acc: 0.85,
      desc: 'Un poderoso rugido dracónico desestabiliza al enemigo y reduce considerablemente su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'zentreya_dragon_scales',
      name: 'Escamas Dracónicas',
      power: 0,
      acc: 1.0,
      desc: 'Zentreya refuerza temporalmente sus escamas, aumentando su DEF para resistir los ataques enemigos.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempDef', value: 9, duration: 3 }
    },
    {
      id: 'zentreya_ancient_dragon_flame',
      name: 'Llama del Dragón Ancestral',
      power: 30,
      acc: 0.9,
      desc: 'Zentreya desata una enorme llamarada dracónica que arrasa al enemigo y reduce drásticamente su DEF.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 10, duration: 3 }
    }
  ]
},

{
  id: 'inosuke_hashibira',
  name: 'Inosuke Hashibira',
  img: 'personajes/inosuke.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 120,
  atk: 30,
  def: 13,
  spd: 20,
  moves: [
    {
      id: 'inosuke_beast_breathing',
      name: 'Respiración de la Bestia',
      power: 20,
      acc: 0.95,
      desc: 'Inosuke ataca salvajemente con sus dos espadas, reduciendo temporalmente el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 5, duration: 2 }
    },
    {
      id: 'inosuke_fang_rush',
      name: 'Carga de Colmillos',
      power: 22,
      acc: 0.9,
      desc: 'Inosuke se lanza directamente contra el enemigo con una rápida sucesión de cortes que debilitan su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 4, duration: 2 }
    },
    {
      id: 'inosuke_beast_senses',
      name: 'Sentidos de la Bestia',
      power: 0,
      acc: 1.0,
      desc: 'Inosuke agudiza sus sentidos y aumenta temporalmente su SPD para atacar antes que sus enemigos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempSpd', value: 6, duration: 2 }
    },
    {
      id: 'inosuke_spatial_awareness',
      name: 'Percepción Espacial',
      power: 25,
      acc: 0.9,
      desc: 'Inosuke percibe los movimientos del enemigo y realiza un ataque preciso que reduce su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 6, duration: 3 }
    },
    {
      id: 'inosuke_persistent_fury',
      name: 'Furia del Jabalí',
      power: 0,
      acc: 1.0,
      desc: 'Inosuke entra en un estado de combate frenético, aumentando considerablemente su ATK durante varios turnos.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempAtk', value: 7, duration: 3 }
    },
    {
      id: 'inosuke_beast_breathing_fifth_fang',
      name: 'Respiración de la Bestia: Colmillo',
      power: 30,
      acc: 0.88,
      desc: 'Inosuke desata una brutal combinación de cortes con ambas espadas, destrozando las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 10, duration: 3 }
    }
  ]
},

{
  id: 'kisame_hoshigaki',
  name: 'Kisame Hoshigaki',
  img: 'personajes/kisame.jpg',
  classes: ['defensor', 'debilitador'],
  hp: 145,
  atk: 30,
  def: 23,
  spd: 11,
  moves: [
    {
      id: 'kisame_samehada_slash',
      name: 'Corte de Samehada',
      power: 27,
      acc: 0.95,
      desc: 'Kisame golpea brutalmente con Samehada, debilitando el poder ofensivo del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'kisame_water_shark_bomb',
      name: 'Bomba del Tiburón de Agua',
      power: 34,
      acc: 0.9,
      desc: 'Kisame lanza una enorme masa de agua con forma de tiburón que reduce la DEF del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'kisame_chakra_absorption',
      name: 'Absorción de Chakra',
      power: 0,
      acc: 1.0,
      desc: 'Samehada absorbe energía para recuperar parte de las fuerzas de Kisame.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'selfHealPct', value: 0.18 }
    },
    {
      id: 'kisame_water_prison',
      name: 'Prisión de Agua',
      power: 22,
      acc: 0.85,
      desc: 'Kisame encierra al enemigo en una masa de agua y reduce considerablemente su velocidad.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'kisame_fusion_samehada',
      name: 'Fusión con Samehada',
      power: 0,
      acc: 1.0,
      desc: 'Kisame se fusiona con Samehada y aumenta temporalmente su capacidad ofensiva.',
      baseCooldown: 5,
      type: 'support',
      effect: { type: 'tempAtk', value: 9, duration: 3 }
    },
    {
      id: 'kisame_giant_shark_bullet',
      name: 'Bala del Tiburón Gigante',
      power: 58,
      acc: 0.9,
      desc: 'Kisame libera un gigantesco tiburón de agua capaz de destrozar las defensas del enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 9, duration: 3 }
    }
  ]
},

{
  id: 'renner_the_golden_princess',
  name: 'Renner Theiere Chardelon Ryle Vaiself',
  img: 'personajes/renner.jpg',
  classes: ['soporte', 'control', 'debilitador'],
  hp: 105,
  atk: 18,
  def: 13,
  spd: 19,
  moves: [
    {
      id: 'renner_strategic_command',
      name: 'Orden Estratégica',
      power: 0,
      acc: 1.0,
      desc: 'Renner analiza la situación y aumenta su ATK durante 2 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: { type: 'tempAtk', value: 8, duration: 2 }
    },
    {
      id: 'renner_psychological_manipulation',
      name: 'Manipulación Psicológica',
      power: 16,
      acc: 0.95,
      desc: 'Renner manipula a su adversario para debilitar su capacidad ofensiva.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 6, duration: 2 }
    },
    {
      id: 'renner_calculated_move',
      name: 'Movimiento Calculado',
      power: 22,
      acc: 0.9,
      desc: 'Renner aprovecha una debilidad del enemigo y reduce temporalmente su DEF.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 7, duration: 2 }
    },
    {
      id: 'renner_commanding_presence',
      name: 'Presencia de la Princesa',
      power: 0,
      acc: 1.0,
      desc: 'La fría determinación de Renner aumenta su velocidad durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type: 'tempSpd', value: 7, duration: 3 }
    },
    {
      id: 'renner_total_control',
      name: 'Control Absoluto',
      power: 30,
      acc: 0.85,
      desc: 'Renner lleva su estrategia al límite, reduciendo considerablemente la velocidad del enemigo.',
      baseCooldown: 5,
      type: 'attack',
      effect: { type: 'debuff', stat: 'spd', value: 8, duration: 3 }
    },
    {
      id: 'renner_perfect_strategy',
      name: 'Estrategia Perfecta',
      power: 48,
      acc: 0.9,
      desc: 'Renner ejecuta una estrategia cuidadosamente preparada y deja al enemigo completamente debilitado.',
      baseCooldown: 7,
      type: 'attack',
      effect: { type: 'debuff', stat: 'atk', value: 8, duration: 3 }
    }
  ]
},

{
  id: 'marciana',
  name: 'Marciana',
  img: 'personajes/marciana.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 112,
  atk: 26,
  def: 15,
  spd: 17,
  moves: [
    {
      id: 'marciana_suppressing_fire',
      name: 'Fuego de Supresión',
      power: 23,
      acc: 0.95,
      desc: 'Marciana dispara una ráfaga concentrada contra el enemigo, reduciendo su ATK durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },
    {
      id: 'marciana_plasma_burst',
      name: 'Explosión de Plasma',
      power: 24,
      acc: 0.9,
      desc: 'Marciana dispara una poderosa descarga de plasma que impacta con gran fuerza y reduce la DEF del enemigo durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 2
      }
    },
    {
      id: 'marciana_combat_protocol',
      name: 'Protocolo de Combate',
      power: 0,
      acc: 1.0,
      desc: 'Marciana activa sus sistemas de combate, aumentando su ATK durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 2
      }
    },
    {
      id: 'marciana_rapid_assault',
      name: 'Asalto Relámpago',
      power: 22,
      acc: 0.9,
      desc: 'Marciana lanza una rápida sucesión de ataques contra el enemigo y reduce su SPD durante 2 turnos.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        duration: 2
      }
    },
    {
      id: 'marciana_overdrive',
      name: 'Sobrecarga',
      power: 0,
      acc: 1.0,
      desc: 'Marciana lleva sus sistemas al límite, aumentando temporalmente su ATK y SPD.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 7,
        duration: 2
      }
    },
    {
      id: 'marciana_annihilation',
      name: 'Aniquilación',
      power: 30,
      acc: 0.9,
      desc: 'Marciana concentra toda su potencia de fuego en un único objetivo y dispara una devastadora descarga. Tras el impacto, la DEF del enemigo queda reducida.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        duration: 2
      }
    }
  ]
},

{
  id: 'akuma_nihmane',
  name: 'Akuma Nihmane',
  img: 'personajes/akuma.jpg',
  classes: ['atacante', 'mago', 'debilitador'],
  hp: 108,
  atk: 30,
  def: 12,
  spd: 18,
  moves: [
    {
      id: 'akuma_nihmane_dark_slash',
      name: 'Corte Oscuro',
      power: 22,
      acc: 0.95,
      desc: 'Akuma Nihmane concentra energía oscura en su arma y realiza un rápido corte que reduce el ATK del enemigo durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },
    {
      id: 'akuma_nihmane_shadow_burst',
      name: 'Explosión de Sombras',
      power: 25,
      acc: 0.9,
      desc: 'Libera una explosión de energía oscura que golpea violentamente al enemigo y reduce su DEF durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 2
      }
    },
    {
      id: 'akuma_nihmane_demonic_power',
      name: 'Poder Demoníaco',
      power: 0,
      acc: 1.0,
      desc: 'Akuma despierta su poder demoníaco, aumentando su ATK y SPD durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 2
      }
    },
    {
      id: 'akuma_nihmane_cursed_flames',
      name: 'Llamas Malditas',
      power: 23,
      acc: 0.9,
      desc: 'Akuma envuelve al enemigo en llamas oscuras que debilitan su capacidad de combate, reduciendo su SPD durante 3 turnos.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        duration: 3
      }
    },
    {
      id: 'akuma_nihmane_dark_recovery',
      name: 'Regeneración Oscura',
      power: 0,
      acc: 1.0,
      desc: 'Akuma absorbe energía oscura del campo de batalla para recuperar parte de sus fuerzas.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.18
      }
    },
    {
      id: 'akuma_nihmane_final_destruction',
      name: 'Destrucción Demoníaca',
      power: 30,
      acc: 0.9,
      desc: 'Akuma Nihmane libera una enorme cantidad de energía demoníaca en un ataque devastador contra el enemigo.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        duration: 2
      }
    }
  ]
},

{
  id: 'w',
  name: 'W',
  img: 'personajes/w.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 110,
  atk: 34,
  def: 13,
  spd: 17,
  moves: [
    {
      id: 'w_grenade',
      name: 'Granada',
      power: 22,
      acc: 0.95,
      desc: 'W lanza una granada explosiva contra el enemigo, reduciendo su ATK durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },
    {
      id: 'w_mine',
      name: 'Mina Oculta',
      power: 28,
      acc: 0.9,
      desc: 'W coloca una mina que explota bajo el enemigo. La explosión reduce su DEF durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 2
      }
    },
    {
      id: 'w_ambush',
      name: 'Emboscada',
      power: 0,
      acc: 1.0,
      desc: 'W prepara el campo de batalla para su siguiente ataque, aumentando su ATK y SPD durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfBuff',
        atk: 8,
        spd: 5,
        duration: 2
      }
    },
    {
      id: 'w_bombardment',
      name: 'Bombardeo',
      power: 36,
      acc: 0.9,
      desc: 'W lanza una serie de explosivos contra el enemigo. Inflige daño adicional si el objetivo ya está debilitado.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 16
      }
    },
    {
      id: 'w_explosive_trap',
      name: 'Trampa Explosiva',
      power: 32,
      acc: 0.85,
      desc: 'W deja una trampa explosiva extremadamente peligrosa. La explosión debilita gravemente al enemigo y reduce su SPD durante 3 turnos.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 7,
        duration: 3
      }
    },
    {
      id: 'w_d12',
      name: 'D12',
      power: 65,
      acc: 0.9,
      desc: 'W desata una enorme explosión y convierte el campo de batalla en un caos absoluto. Inflige daño masivo y obtiene daño adicional contra enemigos debilitados.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 28
      }
    }
  ]
},

{
  id: 'castorice',
  name: 'Castorice',
  img: 'personajes/castorice.jpg',
  classes: ['defensor', 'soporte'],
  hp: 145,
  atk: 22,
  def: 25,
  spd: 10,
  moves: [
    {
      id: 'castorice_death_bloom',
      name: 'Flor de la Muerte',
      power: 18,
      acc: 0.95,
      desc: 'Castorice libera energía espectral contra un enemigo. El impacto reduce su ATK durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },
    {
      id: 'castorice_guardian_of_the_dead',
      name: 'Guardiana de los Muertos',
      power: 0,
      acc: 1.0,
      desc: 'Castorice adopta una postura defensiva y aumenta considerablemente su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'castorice_soul_barrier',
      name: 'Barrera de Almas',
      power: 0,
      acc: 1.0,
      desc: 'Castorice crea una barrera espiritual que absorbe parte del daño recibido.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'shield',
        value: 28
      }
    },
    {
      id: 'castorice_memento_mori',
      name: 'Memento Mori',
      power: 30,
      acc: 0.9,
      desc: 'Castorice concentra las almas que la rodean y lanza un poderoso ataque. El enemigo queda debilitado y pierde DEF durante 2 turnos.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 2
      }
    },
    {
      id: 'castorice_eternal_cycle',
      name: 'Ciclo Eterno',
      power: 0,
      acc: 1.0,
      desc: 'Castorice canaliza energía de los muertos para recuperar sus fuerzas. Recupera parte de sus HP y obtiene +6 DEF durante 2 turnos.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.2,
        secondary: {
          type: 'tempDef',
          value: 6,
          duration: 2
        }
      }
    },
    {
      id: 'castorice_death_over_life',
      name: 'Muerte sobre la Vida',
      power: 55,
      acc: 0.9,
      desc: 'Castorice desata todo el poder de la muerte en un devastador ataque. Cuanto más debilitado esté el enemigo, mayor será su amenaza.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 25
      }
    }
  ]
},

{
  id: 'ibuki',
  name: 'Ibuki',
  img: 'personajes/ibuki.jpg',
  classes: ['atacante', 'soporte'],
  hp: 120,
  atk: 32,
  def: 17,
  spd: 13,
  moves: [
    {
      id: 'ibuki_tormenta_de_cuchillas',
      name: 'Tormenta de Cuchillas',
      power: 24,
      acc: 0.95,
      desc: 'Ibuki realiza una rápida sucesión de cortes contra un enemigo, causando daño y reduciendo su ATK durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },
    {
      id: 'ibuki_loto_ardiente',
      name: 'Loto Ardiente',
      power: 30,
      acc: 0.9,
      desc: 'Ibuki libera una poderosa energía espiritual que envuelve al enemigo en llamas. Reduce su DEF durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2
      }
    },
    {
      id: 'ibuki_paso_fantasma',
      name: 'Paso Fantasma',
      power: 0,
      acc: 1.0,
      desc: 'Ibuki se desplaza con gran velocidad, aumentando su SPD y ATK durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfBuff',
        atk: 6,
        spd: 6,
        duration: 2
      }
    },
    {
      id: 'ibuki_danza_de_las_llamas',
      name: 'Danza de las Llamas',
      power: 38,
      acc: 0.9,
      desc: 'Ibuki combina sus ataques con energía espiritual y ejecuta una poderosa danza ofensiva. Inflige daño adicional contra enemigos debilitados.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 15
      }
    },
    {
      id: 'ibuki_espiritu_del_loto',
      name: 'Espíritu del Loto',
      power: 0,
      acc: 1.0,
      desc: 'Ibuki concentra su energía espiritual y recupera parte de sus fuerzas. Obtiene además +5 DEF durante 2 turnos.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.15,
        secondary: {
          type: 'tempDef',
          value: 5,
          duration: 2
        }
      }
    },
    {
      id: 'ibuki_hana_kaze',
      name: 'Hana Kaze',
      power: 62,
      acc: 0.9,
      desc: 'Ibuki libera toda su energía espiritual en un devastador ataque final. Si el enemigo está debilitado, el ataque inflige daño adicional.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 25
      }
    }
  ]
},

{
  id: 'karin',
  name: 'Karin',
  img: 'personajes/karin.jpg',
  classes: ['atacante', 'soporte'],

  hp: 115,
  atk: 27,
  def: 15,
  spd: 14,

  moves: [

    {
      id: 'karin_exclusive_weapon',
      name: 'Disparo de Precisión',
      power: 22,
      acc: 0.95,
      desc: 'Karin apunta cuidadosamente antes de disparar, infligiendo un poderoso ataque físico contra un enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: null
    },

    {
      id: 'karin_fire_support',
      name: 'Fuego de Cobertura',
      power: 18,
      acc: 0.9,
      desc: 'Karin dispara una ráfaga de cobertura y aumenta el ATK de un aliado durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'tempAtk',
        value: 6,
        duration: 2
      }
    },

    {
      id: 'karin_target_lock',
      name: 'Objetivo Fijado',
      power: 20,
      acc: 0.95,
      desc: 'Karin fija su objetivo y dispara a un punto vulnerable, reduciendo su DEF durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 2
      }
    },

    {
      id: 'karin_amplify',
      name: 'Potenciación de Combate',
      power: 0,
      acc: 1.0,
      desc: 'Karin prepara su siguiente ataque, aumentando su ATK y SPD durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfBuff',
        atk: 8,
        spd: 4,
        duration: 2
      }
    },

    {
      id: 'karin_snipe',
      name: 'Railgun',
      power: 25,
      acc: 0.85,
      desc: 'Karin utiliza toda la potencia de su arma para realizar un disparo devastador. Inflige daño adicional contra enemigos cuya DEF haya sido reducida.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 20
      }
    },

    {
      id: 'karin_ex',
      name: 'EX: Destrucción Total',
      power: 30,
      acc: 0.9,
      desc: 'Karin concentra toda su potencia de fuego en un único objetivo y dispara un proyectil de enorme poder. Si el enemigo está debilitado, el ataque inflige daño adicional.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 30
      }
    }

  ]
},

{
  id: 'shiori_novella',
  name: 'Shiori Novella',
  img: 'personajes/shiori.jpg',
  classes: ['soporte', 'debilitador'],

  hp: 100,
  atk: 22,
  def: 14,
  spd: 15,

  moves: [

    {
      id: 'shiori_storytellers_curse',
      name: 'Maldición del Relato',
      power: 18,
      acc: 0.9,
      desc: 'Shiori recita una historia maldita que daña al enemigo y reduce su ATK durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },

    {
      id: 'shiori_book_of_fate',
      name: 'Libro del Destino',
      power: 0,
      acc: 1.0,
      desc: 'Shiori consulta su libro y revela el destino de un aliado, aumentando su ATK durante 2 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 7,
        duration: 2
      }
    },

    {
      id: 'shiori_forbidden_tale',
      name: 'Historia Prohibida',
      power: 24,
      acc: 0.85,
      desc: 'Shiori cuenta una historia prohibida que debilita la mente del enemigo. Reduce su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 3
      }
    },

    {
      id: 'shiori_narrative_control',
      name: 'Control Narrativo',
      power: 0,
      acc: 0.9,
      desc: 'Shiori altera el curso de la historia y ralentiza al enemigo, reduciendo su SPD durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        duration: 2
      }
    },

    {
      id: 'shiori_librarians_insight',
      name: 'Perspicacia de la Bibliotecaria',
      power: 0,
      acc: 1.0,
      desc: 'Shiori analiza el campo de batalla y fortalece a un aliado. El objetivo obtiene +6 DEF y +4 SPD durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfBuff',
        def: 6,
        spd: 4,
        duration: 2
      }
    },

    {
      id: 'shiori_final_chapter',
      name: 'Capítulo Final',
      power: 40,
      acc: 0.9,
      desc: 'Shiori escribe el capítulo final de la batalla. Inflige un poderoso ataque y causa daño adicional contra enemigos que tengan varios debuffs.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 25
      }
    }

  ]
},

{
  id: 'nakiri_ayame',
  name: 'Nakiri Ayame',
  img: 'personajes/nakiri.jpg',
  classes: ['atacante', 'debilitador'],

  hp: 105,
  atk: 30,
  def: 12,
  spd: 21,

  moves: [

    {
      id: 'ayame_kikoku',
      name: 'Kikoku',
      power: 22,
      acc: 0.95,
      desc: 'Ayame realiza un rápido corte con su espada, infligiendo daño y aplicando una Herida Demoníaca durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 3,
        duration: 2
      }
    },

    {
      id: 'ayame_dual_slash',
      name: 'Doble Corte Oni',
      power: 30,
      acc: 0.9,
      desc: 'Ayame ataca con ambas espadas en una sucesión de cortes. Si el enemigo está debilitado, inflige daño adicional.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 12
      }
    },

    {
      id: 'ayame_oni_step',
      name: 'Paso del Oni',
      power: 0,
      acc: 1.0,
      desc: 'Ayame se mueve a gran velocidad y adopta una postura ofensiva. Obtiene +7 SPD y +4 ATK durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfBuff',
        atk: 4,
        spd: 7,
        duration: 2
      }
    },

    {
      id: 'ayame_demon_blade',
      name: 'Demon Blade',
      power: 38,
      acc: 0.9,
      desc: 'Ayame concentra su poder demoníaco en sus espadas y ejecuta un poderoso corte. Reduce la DEF del enemigo durante 2 turnos.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        duration: 2
      }
    },

    {
      id: 'ayame_oni_fury',
      name: 'Furia del Oni',
      power: 45,
      acc: 0.85,
      desc: 'Ayame libera su poder demoníaco y lanza una ráfaga de cortes. Si el enemigo tiene un debuff, el ataque inflige daño adicional.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 18
      }
    },

    {
      id: 'ayame_yume_no_yo',
      name: 'Yume no Yo',
      power: 62,
      acc: 0.9,
      desc: 'Ayame desata todo su poder como oni y ejecuta un ataque devastador. Si el enemigo tiene un debuff, consume sus efectos y aumenta considerablemente el daño.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'debuffed',
        value: 28,
        consumeDebuffs: true
      }
    }

  ]
},

{
  id: 'floryn',
  name: 'Floryn',
  img: 'personajes/floryn.jpg',
  classes: ['sanador', 'soporte'],

  hp: 115,
  atk: 18,
  def: 14,
  spd: 16,

  moves: [

    {
      id: 'floryn_sprout',
      name: 'Sprout',
      power: 16,
      acc: 0.95,
      desc: 'Floryn lanza una semilla de energía contra un enemigo. Al impactar, libera energía que cura ligeramente a un aliado herido.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'heal',
        value: 18
      }
    },

    {
      id: 'floryn_energy_transfer',
      name: 'Transferencia de Energía',
      power: 0,
      acc: 1.0,
      desc: 'Floryn transfiere energía a un aliado, restaurando una cantidad considerable de sus HP.',
      baseCooldown: 2,
      type: 'support',
      effect: {
        type: 'heal',
        value: 30
      }
    },

    {
      id: 'floryn_bloom',
      name: 'Brote de Vida',
      power: 20,
      acc: 0.9,
      desc: 'Floryn libera una explosión de energía vegetal que daña al enemigo y reduce temporalmente su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        duration: 2
      }
    },

    {
      id: 'floryn_garden_of_hope',
      name: 'Jardín de la Esperanza',
      power: 0,
      acc: 1.0,
      desc: 'Floryn invoca el poder de su santuario para fortalecer a todo su equipo. Los aliados obtienen +5 DEF durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 5,
        duration: 3
      }
    },

    {
      id: 'floryn_seed_of_life',
      name: 'Semilla de Vida',
      power: 0,
      acc: 1.0,
      desc: 'Floryn libera una poderosa energía vital sobre el aliado con menos HP, restaurando una parte importante de su salud.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.25
      }
    },

    {
      id: 'floryn_blooming_light',
      name: 'Luz de la Esperanza',
      power: 0,
      acc: 1.0,
      desc: 'Floryn desata todo el poder de su reliquia. Todos los aliados recuperan una gran cantidad de HP y reciben +6 ATK durante 2 turnos.',
      baseCooldown: 7,
      type: 'support',
      effect: {
        type: 'heal',
        value: 35,
        secondary: {
          type: 'tempAtk',
          value: 6,
          duration: 2
        }
      }
    }

  ]
},

{
  id: 'selena_swimsuit',
  name: 'Don Pingo - GF',
  img: 'personajes/mel.jpg',
  classes: ['atacante', 'debilitador'],

  hp: 110,
  atk: 29,
  def: 13,
  spd: 20,

  moves: [

    {
      id: 'selena_swimsuit_abyssal_arrow',
      name: 'Flecha Abisal',
      power: 28,
      acc: 0.8,
      desc: 'Selena lanza una flecha de energía abisal que aturde al enemigo durante 1 turno si impacta.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'stun',
        duration: 1
      }
    },

    {
      id: 'selena_swimsuit_abyssal_trap',
      name: 'Trampa Abisal',
      power: 12,
      acc: 0.95,
      desc: 'Selena coloca una trampa abisal bajo el enemigo. La trampa reduce su DEF y aplica una Marca Abisal durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2,
        mark: true
      }
    },

    {
      id: 'selena_swimsuit_soul_eater',
      name: 'Devoradora de Almas',
      power: 25,
      acc: 0.95,
      desc: 'Selena concentra energía abisal y golpea al enemigo. Inflige daño adicional si el objetivo posee una Marca Abisal.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'marked',
        value: 15
      }
    },

    {
      id: 'selena_swimsuit_summer_wave',
      name: 'Ola del Abismo',
      power: 32,
      acc: 0.9,
      desc: 'Selena crea una enorme ola de energía que golpea al enemigo y reduce temporalmente su SPD.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        duration: 2
      }
    },

    {
      id: 'selena_swimsuit_abyssal_summer',
      name: 'Verano Abisal',
      power: 0,
      acc: 1.0,
      desc: 'Selena aprovecha el ambiente veraniego para recuperar fuerzas. Recupera un 12% de sus HP máximos y obtiene +5 SPD durante 2 turnos.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.12,
        secondary: {
          type: 'tempSpd',
          value: 5,
          duration: 2
        }
      }
    },

    {
      id: 'selena_swimsuit_primal_darkness',
      name: 'Oscuridad Primigenia',
      power: 42,
      acc: 0.9,
      desc: 'Selena desata todo el poder del Abismo. Si el enemigo está marcado, consume la Marca Abisal para infligir daño adicional.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'marked',
        value: 25,
        consumeMark: true
      }
    }

  ]
},

{
  id: 'hirara',
  name: 'Hirara',
  img: 'personajes/hirara.jpg',
  classes: ['atacante', 'control'],

  hp: 95,
  atk: 31,
  def: 10,
  spd: 22,

  moves: [

    {
      id: 'hirara_kaerazu',
      name: 'Kaerazu',
      power: 22,
      acc: 0.95,
      desc: 'Hirara libera una ráfaga de su abanico en forma de arco. Aplica una Marca Carmesí al enemigo durante 3 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'mark',
        mark: 'crimson',
        duration: 3
      }
    },

    {
      id: 'hirara_meisen_e',
      name: 'Meisen-e',
      power: 20,
      acc: 0.95,
      desc: 'Hirara se desplaza rápidamente hacia el enemigo y lo golpea con su abanico. Aplica una Marca de Muerte durante 3 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'mark',
        mark: 'death',
        duration: 3
      }
    },

    {
      id: 'hirara_infernal_torrent',
      name: 'Infernal Torrent',
      power: 42,
      acc: 0.9,
      desc: 'Combina Kaerazu y Meisen-e en un ataque giratorio. Si el enemigo posee una Marca Carmesí, queda inmovilizado durante 1 turno.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'conditionalControl',
        condition: 'crimson',
        control: 'stun',
        duration: 1
      }
    },

    {
      id: 'hirara_falling_maple',
      name: 'Falling Maple',
      power: 50,
      acc: 0.9,
      desc: 'Hirara entra en un estado evasivo durante 1 turno, durante el cual no puede ser objetivo de ataques. Después libera una devastadora explosión de hojas carmesí.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type: 'untargetable',
        duration: 1
      }
    },

    {
      id: 'hirara_twin_fans',
      name: 'Twin Fans: Ukifune',
      power: 0,
      acc: 1.0,
      desc: 'Hirara sincroniza sus dos abanicos. Durante 2 turnos obtiene +6 SPD y sus ataques contra enemigos que tengan las Marcas Carmesí y de Muerte infligen daño adicional.',
      baseCooldown: 5,
      type: 'support',
      effect: {
        type: 'tempSpd',
        value: 6,
        duration: 2
      }
    },

    {
      id: 'hirara_momijigari',
      name: 'Forbidden Jutsu: Momijigari',
      power: 65,
      acc: 0.85,
      desc: 'Hirara libera todo el poder de sus dos abanicos y atraviesa al enemigo con una sucesión de ataques. Si posee ambas Marcas, el daño aumenta y las consume.',
      baseCooldown: 7,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'crimson_and_death',
        value: 30,
        consumeMarks: true
      }
    }

  ]
},

{
  id: 'selena',
  name: 'Selena',
  img: 'personajes/selena.jpg',
  classes: ['mago', 'control', 'debilitador'],
  hp: 105,
  atk: 28,
  def: 12,
  spd: 18,

  moves: [
    {
      id: 'selena_soul_eater',
      name: 'Devoradora de Almas',
      power: 24,
      acc: 0.95,
      desc: 'Selena concentra el poder del Abismo y golpea al enemigo. Si el objetivo está marcado, inflige daño adicional.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'marked',
        value: 15
      }
    },

    {
      id: 'selena_abyssal_trap',
      name: 'Trampa Abisal',
      power: 8,
      acc: 0.95,
      desc: 'Coloca una trampa de energía abisal. El objetivo queda marcado y su DEF se reduce durante 2 turnos.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2,
        mark: true
      }
    },

    {
      id: 'selena_abyssal_arrow',
      name: 'Flecha Abisal',
      power: 30,
      acc: 0.75,
      desc: 'Dispara una flecha de energía abisal. Si impacta, aturde al enemigo durante 1 turno y le aplica una Marca Abisal.',
      baseCooldown: 4,
      type: 'attack',
      effect: {
        type: 'stun',
        duration: 1,
        mark: true
      }
    },

    {
      id: 'selena_primal_darkness',
      name: 'Oscuridad Primigenia',
      power: 35,
      acc: 0.9,
      desc: 'Selena adopta su forma Abisal y desata un poderoso ataque. Si el enemigo está marcado, consume la Marca Abisal para aumentar considerablemente el daño.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type: 'conditionalDamage',
        condition: 'marked',
        value: 25,
        consumeMark: true
      }
    },

    {
      id: 'selena_sacred_sacrifice',
      name: 'Sacrificio del Abismo',
      power: 0,
      acc: 1.0,
      desc: 'Selena entra en comunión con el Abismo durante 2 turnos. Obtiene +8 ATK y +5 SPD, pero pierde 5 HP al activarlo.',
      baseCooldown: 6,
      type: 'support',
      effect: {
        type: 'selfBuff',
        hpCost: 5,
        atk: 8,
        spd: 5,
        duration: 2
      }
    }
  ]
},

{
  id: 'clementine',
  name: 'Clementine',
  img: 'personajes/clementine.gif',
  classes: ['atacante', 'control'],
  hp: 124,
  atk: 30,
  def: 18,
  spd: 20,

  moves: [
    {
      id: 'twin_blade_rush',
      name: 'Asalto de Dagas Gemelas',
      power: 22,
      acc: 0.95,
      desc: 'Lanza una veloz ráfaga de ataques que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'phantom_step',
      name: 'Paso Fantasma',
      power: 0,
      acc: 1.0,
      desc: 'Su increíble agilidad aumenta su SPD durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempSpd',
        value: 12,
        duration: 3
      }
    },
    {
      id: 'sadistic_instinct',
      name: 'Instinto Sádico',
      power: 0,
      acc: 1.0,
      desc: 'Disfruta del combate y aumenta su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'thousand_cuts',
      name: 'ULTI: Mil Cortes',
      power: 30,
      acc: 0.90,
      desc: 'Clementine desata una lluvia de ataques a una velocidad imposible, infligiendo un enorme daño y reduciendo el ATK del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},



{
  id: 'choso',
  name: 'Choso',
  img: 'personajes/choso.gif',
  classes: ['mago', 'atacante'],
  hp: 136,
  atk: 30,
  def: 24,
  spd: 13,

  moves: [
    {
      id: 'piercing_blood',
      name: 'Piercing Blood',
      power: 22,
      acc: 0.95,
      desc: 'Dispara un chorro de sangre a gran velocidad que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'flowing_red_scale',
      name: 'Flowing Red Scale',
      power: 0,
      acc: 1.0,
      desc: 'Refuerza su cuerpo con sangre, aumentando su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 6,
        duration: 3
      }
    },
    {
      id: 'blood_armor',
      name: 'Armadura de Sangre',
      power: 0,
      acc: 1.0,
      desc: 'Endurece la sangre de su cuerpo, aumentando su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 8,
        duration: 3
      }
    },
    {
      id: 'supernova',
      name: 'ULTI: Supernova',
      power: 30,
      acc: 0.90,
      desc: 'Hace detonar múltiples esferas de sangre, causando un daño devastador y reduciendo el ATK del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},



{
  id: 'ai_hoshino',
  name: 'Ai Hoshino',
  img: 'personajes/ai.gif',
  classes: ['soporte', 'control'],
  hp: 124,
  atk: 24,
  def: 22,
  spd: 23,

  moves: [
    {
      id: 'captivating_smile',
      name: 'Sonrisa Cautivadora',
      power: 20,
      acc: 1.0,
      desc: 'Su carisma deslumbra al enemigo, reduciendo su ATK.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'idol_performance',
      name: 'Actuación Idol',
      power: 0,
      acc: 1.0,
      desc: 'Una actuación inolvidable inspira a Ai, aumentando su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'star_eyes',
      name: 'Ojos Estrellados',
      power: 0,
      acc: 1.0,
      desc: 'Su presencia ilumina el escenario, aumentando su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'eternal_idol',
      name: 'ULTI: La Idol Eterna',
      power: 30,
      acc: 0.95,
      desc: 'Ai deslumbra con una actuación legendaria que causa un gran daño emocional y reduce la SPD del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},



{
  id: 'mereoleona',
  name: 'Mereoleona Vermillion',
  img: 'personajes/mereoleona.gif',
  classes: ['atacante', 'mago'],
  hp: 142,
  atk: 27,
  def: 23,
  spd: 24,

  moves: [
    {
      id: 'calidos_brachium',
      name: 'Calidos Brachium',
      power: 20,
      acc: 0.95,
      desc: 'Envuelve su brazo en llamas y golpea al enemigo, reduciendo su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'mana_zone',
      name: 'Mana Zone',
      power: 0,
      acc: 1.0,
      desc: 'Controla el maná del entorno para aumentar su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 11,
        duration: 3
      }
    },
    {
      id: 'hellfire_incarnate',
      name: 'Encarnación del Infierno',
      power: 0,
      acc: 1.0,
      desc: 'Su cuerpo arde con un fuego implacable, aumentando su DEF durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'purgatory_abyss',
      name: 'ULTI: Purgatory Abyss',
      power: 24,
      acc: 0.90,
      desc: 'Desata un océano de llamas que consume al enemigo, infligiendo un daño devastador y reduciendo su ATK.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},


{
  id: 'urahara',
  name: 'Kisuke Urahara',
  img: 'personajes/urahara.gif',
  classes: ['mago', 'soporte'],
  hp: 130,
  atk: 30,
  def: 24,
  spd: 31,

  moves: [
    {
      id: 'benihime',
      name: 'Benihime',
      power: 28,
      acc: 0.95,
      desc: 'Dispara un potente rayo de energía carmesí que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'kido_mastery',
      name: 'Maestría en Kidō',
      power: 0,
      acc: 1.0,
      desc: 'Urahara utiliza avanzados hechizos para aumentar su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'strategic_mind',
      name: 'Mente Estratégica',
      power: 0,
      acc: 1.0,
      desc: 'Tras analizar la situación, aumenta su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'kannonbiraki_benihime_aratame',
      name: 'ULTI: Kannonbiraki Benihime Aratame',
      power: 30,
      acc: 0.90,
      desc: 'Libera su Bankai para reconstruir y destrozar el cuerpo del enemigo, infligiendo un enorme daño y reduciendo su ATK.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},

	{
  id: 'l',
  name: 'L',
  img: 'personajes/l.gif',
  classes: ['control', 'soporte'],
  hp: 125,
  atk: 20,
  def: 24,
  spd: 26,

  moves: [
    {
      id: 'deduction',
      name: 'Deducción Absoluta',
      power: 18,
      acc: 1.0,
      desc: 'L analiza cada movimiento del enemigo y reduce su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'psychological_pressure',
      name: 'Presión Psicológica',
      power: 0,
      acc: 1.0,
      desc: 'La mente del enemigo se desestabiliza, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 7,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'sweet_tooth',
      name: 'Azúcar para el Cerebro',
      power: 0,
      acc: 1.0,
      desc: 'L recupera energía comiendo dulces, restaurando un 25% de su vida máxima.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.25
      }
    },
    {
      id: 'checkmate',
      name: 'ULTI: Jaque Mate',
      power: 30,
      acc: 0.95,
      desc: 'Tras descubrir todas las debilidades del enemigo, L ejecuta un plan perfecto que inflige un gran daño y reduce su SPD.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'nobara',
  name: 'Nobara Kugisaki',
  img: 'personajes/nobara.png',
  classes: ['mago', 'debilitador'],
  hp: 122,
  atk: 30,
  def: 21,
  spd: 18,

  moves: [
    {
      id: 'straw_doll',
      name: 'Técnica del Muñeco de Paja',
      power: 22,
      acc: 0.95,
      desc: 'Clava un clavo maldito que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'hairpin',
      name: 'Hairpin',
      power: 25,
      acc: 0.90,
      desc: 'Hace explotar los clavos malditos, reduciendo el ATK del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'fearless_spirit',
      name: 'Espíritu Indomable',
      power: 0,
      acc: 1.0,
      desc: 'Su determinación aumenta su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'resonance',
      name: 'ULTI: Resonancia',
      power: 30,
      acc: 0.95,
      desc: 'Golpea directamente el alma del enemigo con Resonancia, infligiendo un enorme daño y reduciendo su SPD.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'mahito',
  name: 'Mahito',
  img: 'personajes/mahito.gif',
  classes: ['control', 'mago'],
  hp: 128,
  atk: 30,
  def: 22,
  spd: 21,

  moves: [
    {
      id: 'idle_transfiguration',
      name: 'Transfiguración Ociosa',
      power: 22,
      acc: 0.95,
      desc: 'Mahito deforma el alma del enemigo, reduciendo su ATK.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'soul_manipulation',
      name: 'Manipulación del Alma',
      power: 0,
      acc: 1.0,
      desc: 'Altera la esencia del enemigo, reduciendo su DEF.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'body_reshaping',
      name: 'Reconfiguración Corporal',
      power: 0,
      acc: 1.0,
      desc: 'Mahito remodela su cuerpo para recuperar un 25% de su vida máxima.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.25
      }
    },
    {
      id: 'self_embodiment',
      name: 'ULTI: Autoencarnación de la Perfección',
      power: 30,
      acc: 0.90,
      desc: 'Expande su Dominio y deforma el alma del enemigo, infligiendo un daño devastador y reduciendo su SPD.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'ulquiorra',
  name: 'Ulquiorra Cifer',
  img: 'personajes/ulquiorra.gif',
  classes: ['mago', 'atacante'],
  hp: 132,
  atk: 28,
  def: 23,
  spd: 15,

  moves: [
    {
      id: 'cero_oscuras',
      name: 'Cero Oscuras',
      power: 22,
      acc: 0.95,
      desc: 'Dispara un Cero Oscuras que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'high_speed_regeneration',
      name: 'Regeneración de Alta Velocidad',
      power: 0,
      acc: 1.0,
      desc: 'Ulquiorra regenera un 25% de su vida máxima.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.25
      }
    },
    {
      id: 'murcielago',
      name: 'Resurrección: Murciélago',
      power: 0,
      acc: 1.0,
      desc: 'Libera su primera Resurrección, aumentando su ATK durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'lanza_del_relampago',
      name: 'ULTI: Lanza del Relámpago',
      power: 30,
      acc: 0.85,
      desc: 'Lanza una gigantesca lanza de reiatsu que causa un daño devastador y reduce el ATK del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'cz2128',
  name: 'CZ2128 Delta',
  img: 'personajes/cz.png',
  classes: ['atacante', 'control'],
  hp: 122,
  atk: 30,
  def: 22,
  spd: 18,

  moves: [
    {
      id: 'precision_shot',
      name: 'Disparo de Precisión',
      power: 22,
      acc: 1.0,
      desc: 'Un disparo certero que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'suppressive_fire',
      name: 'Fuego de Supresión',
      power: 24,
      acc: 0.95,
      desc: 'Una ráfaga continua obliga al enemigo a retroceder, reduciendo su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'combat_analysis',
      name: 'Análisis de Combate',
      power: 0,
      acc: 1.0,
      desc: 'Analiza los movimientos del rival y aumenta su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'omega_barrage',
      name: 'ULTI: Omega Barrage',
      power: 30,
      acc: 0.90,
      desc: 'CZ descarga todo su arsenal sobre el objetivo, causando un enorme daño y reduciendo el ATK del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'shalltear',
  name: 'Shalltear Bloodfallen',
  img: 'personajes/shalltear.gif',
  classes: ['atacante', 'mago', 'defensor'],
  hp: 138,
  atk: 25,
  def: 24,
  spd: 18,

  moves: [
    {
      id: 'spuit_lance',
      name: 'Spuit Lance',
      power: 22,
      acc: 0.96,
      desc: 'Una lanza de sangre atraviesa al enemigo. Shalltear recupera un 18% del daño que consigue infligir mediante su poder vampírico.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'lifesteal',
        value: 6,
        duration: 2
      }
    },

    {
      id: 'blood_frenzy',
      name: 'Frenesí Carmesí',
      power: 0,
      acc: 1.0,
      desc: 'Shalltear entra en un estado de frenesí vampírico, aumentando su ATK y su probabilidad de golpe crítico durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 6,
          duration: 3
        },
        {
          type: 'critChance',
          value: 18,
          duration: 3
        }
      ]
    },

    {
      id: 'einherjar',
      name: 'Einherjar',
      power: 0,
      acc: 1.0,
      desc: 'Invoca a su guerrero vampírico para protegerla, aumentando su DEF y reflejando parte del daño recibido durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        },
        {
          type: 'reflectDamage',
          value: 20,
          duration: 3
        }
      ]
    },

    {
      id: 'blood_spear',
      name: 'Blood Spear',
      power: 24,
      acc: 0.93,
      desc: 'Dispara varias lanzas de sangre contra el enemigo. El daño infligido alimenta directamente el cuerpo de Shalltear.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 11,
          duration: 2
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 6,
          duration: 2
        }
      ]
    },

    {
      id: 'vampiric_drain',
      name: 'Drenaje Vampírico',
      power: 25,
      acc: 0.94,
      desc: 'Shalltear absorbe violentamente la fuerza vital del enemigo, debilitando su capacidad para recuperarse mediante curaciones.',
      baseCooldown: 4,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 15,
          duration: 2
        },
        {
          type: 'healReduction',
          value: 40,
          duration: 3
        }
      ]
    },

    {
      id: 'blood_valkyrie',
      name: 'ULTI: Valkyrie de Sangre',
      power: 30,
      acc: 0.91,
      desc: 'Shalltear libera todo su poder como Verdadera Vampira. El ataque tiene una gran capacidad de crítico y devuelve una gran cantidad de vida según el daño infligido.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 18,
          duration: 2
        },
        {
          type: 'critChance',
          value: 25,
          duration: 2
        }
      ]
    }
  ]
},
	{
  id: 'dorothy',
  name: 'Dorothy Unsworth',
  img: 'personajes/dorothy.gif',
  classes: ['mago', 'control'],
  hp: 126,
  atk: 28,
  def: 22,
  spd: 30,

  moves: [
    {
      id: 'dream_magic',
      name: 'Magia de los Sueños',
      power: 24,
      acc: 0.95,
      desc: 'Dorothy atrapa al enemigo en una ilusión onírica, reduciendo su SPD.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'dream_world',
      name: 'Glamour World',
      power: 0,
      acc: 1.0,
      desc: 'El mundo de los sueños debilita la voluntad del enemigo, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'dream_barrier',
      name: 'Barrera Onírica',
      power: 0,
      acc: 1.0,
      desc: 'Las ilusiones protegen a Dorothy, aumentando su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'eternal_dream',
      name: 'ULTI: Reino Eterno de los Sueños',
      power: 30,
      acc: 0.90,
      desc: 'Arrastra al enemigo a Glamour World y desata un ataque mágico devastador que reduce enormemente su DEF.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 9,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'unohana',
  name: 'Retsu Unohana',
  img: 'personajes/unohana.gif',
  classes: ['sanador', 'atacante'],
  hp: 120,
  atk: 24,
  def: 22,
  spd: 17,

  moves: [
    {
      id: 'gentle_slash',
      name: 'Corte Preciso',
      power: 24,
      acc: 0.98,
      desc: 'Un elegante corte con su Zanpakutō que reduce el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 4,
        prob: 0.80,
        duration: 2
      }
    },
    {
      id: 'healing_kido',
      name: 'Kidō Curativo',
      power: 0,
      acc: 1.0,
      desc: 'Utiliza su excepcional Kidō médico para recuperar un 30% de su vida máxima.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.30
      }
    },
    {
      id: 'captain_presence',
      name: 'Presencia del Primer Kenpachi',
      power: 0,
      acc: 1.0,
      desc: 'Libera parte de su verdadera fuerza, aumentando su ATK durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'minazuki',
      name: 'ULTI: Bankai - Minazuki',
      power: 30,
      acc: 0.90,
      desc: 'Desata su Bankai, envolviendo el campo en sangre y realizando un devastador ataque mientras recupera un 20% de su vida máxima.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'selfHealPct',
        value: 0.20
      }
    }
  ]
},
	{
  id: 'power',
  name: 'Power',
  img: 'personajes/power.gif',
  classes: ['atacante', 'control'],
  hp: 140,
  atk: 30,
  def: 20,
  spd: 32,

  moves: [
    {
      id: 'blood_hammer',
      name: 'Martillo de Sangre',
      power: 22,
      acc: 0.95,
      desc: 'Power crea un enorme martillo de sangre que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'blood_spears',
      name: 'Lanzas Carmesí',
      power: 26,
      acc: 1.0,
      desc: 'Invoca múltiples lanzas de sangre que ralentizan al enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 7,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'blood_fiend',
      name: 'Poder Demoníaco',
      power: 0,
      acc: 1.0,
      desc: 'Power absorbe sangre para fortalecer su cuerpo, aumentando su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'blood_devil',
      name: 'ULTI: Verdadera Forma del Demonio de Sangre',
      power: 30,
      acc: 0.90,
      desc: 'Desata todo el poder del Demonio de Sangre, causando un daño devastador y reduciendo el ATK del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'riruka',
  name: 'Riruka Dokugamine',
  img: 'personajes/riruka.gif',
  classes: ['control', 'soporte'],
  hp: 118,
  atk: 22,
  def: 21,
  spd: 24,

  moves: [
    {
      id: 'dollhouse',
      name: 'Dollhouse',
      power: 20,
      acc: 0.95,
      desc: 'Encierra al enemigo dentro de una casa de muñecas, reduciendo su SPD.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'cute_trap',
      name: 'Trampa Adorable',
      power: 0,
      acc: 1.0,
      desc: 'Riruka confunde al enemigo con su Fullbring, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 7,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'sweet_barrier',
      name: 'Mundo de Caramelos',
      power: 0,
      acc: 1.0,
      desc: 'Se refugia dentro de un objeto, aumentando su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'fullbring_domain',
      name: 'ULTI: Dominio Dollhouse',
      power: 30,
      acc: 0.90,
      desc: 'Convierte el campo de batalla en su territorio, infligiendo un gran daño y reduciendo la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'nel',
  name: 'Nelliel',
  img: 'personajes/nel.gif',
  classes: ['atacante', 'sanador'],
  hp: 138,
  atk: 30,
  def: 24,
  spd: 17,

  moves: [
    {
      id: 'lanza_dash',
      name: 'Lanza Relámpago',
      power: 22,
      acc: 0.95,
      desc: 'Nel atraviesa al enemigo con su lanza, reduciendo su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 4,
        prob: 0.80,
        duration: 2
      }
    },
    {
      id: 'cero_doble',
      name: 'Cero Doble',
      power: 25,
      acc: 0.90,
      desc: 'Absorbe un Cero y lo devuelve con el doble de fuerza.',
      baseCooldown: 3,
      type: 'attack',
      effect: null
    },
    {
      id: 'instinto_protector',
      name: 'Instinto Protector',
      power: 0,
      acc: 1.0,
      desc: 'El deseo de proteger a sus amigos le permite recuperar un 25% de su vida máxima.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.25
      }
    },
    {
      id: 'gamuza_resurreccion',
      name: 'ULTI: Resurrección - Gamuza',
      power: 30,
      acc: 0.90,
      desc: 'Libera su verdadera forma Arrancar, causando un enorme daño y aumentando su ATK durante 3 turnos.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    }
  ]
},
	{
  id: 'spanish_miku',
  name: 'Spanish Miku',
  img: 'personajes/spanish_miku.png',
  classes: ['sanador', 'soporte'],
  hp: 132,
  atk: 22,
  def: 24,
  spd: 31,

  moves: [
    {
      id: 'cante_flamenco',
      name: 'Cante Flamenco',
      power: 18,
      acc: 1.0,
      desc: 'Una melodía tradicional anima a sus aliados mientras hiere levemente al enemigo.',
      baseCooldown: 1,
      type: 'attack',
      effects: [
        {
          type: 'heal',
          value: 15
        }
      ]
    },

    {
      id: 'melodia_curativa',
      name: 'Melodía Curativa',
      power: 0,
      acc: 1.0,
      desc: 'Su voz reconfortante restaura 40 HP a un aliado.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'heal',
        value: 40
      }
    },

    {
      id: 'espiritu_fiesta',
      name: 'Espíritu de la Fiesta',
      power: 0,
      acc: 1.0,
      desc: 'La alegría de su actuación fortalece la defensa de un aliado durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },

    {
      id: 'serenata_de_la_luna',
      name: 'ULTI: Serenata bajo la Luna',
      power: 0,
      acc: 1.0,
      desc: 'Interpreta una hermosa serenata que restaura 70 HP a un aliado.',
      baseCooldown: 6,
      type: 'support',
      effect: {
        type: 'heal',
        value: 70
      }
    }
  ]
},
	{
  id: 'zagred',
  name: 'Zagred',
  img: 'personajes/zagred.gif',
  classes: ['mago', 'control'],
  hp: 130,
  atk: 26,
  def: 21,
  spd: 27,

  moves: [
    {
      id: 'word_soul_magic',
      name: 'Magia del Alma de las Palabras',
      power: 24,
      acc: 0.95,
      desc: 'Las palabras de Zagred toman forma y reducen el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'binding_words',
      name: 'Palabras de Restricción',
      power: 0,
      acc: 1.0,
      desc: 'Las órdenes de Zagred debilitan al enemigo, reduciendo su SPD.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 7,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'demonic_manifestation',
      name: 'Manifestación Demoníaca',
      power: 0,
      acc: 1.0,
      desc: 'Libera parte de su poder demoníaco, aumentando su ATK durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'underworld_decree',
      name: 'ULTI: Decreto del Inframundo',
      power: 30,
      acc: 0.90,
      desc: 'Pronuncia una orden absoluta que provoca una explosión de magia demoníaca y reduce enormemente la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 9,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'liebe',
  name: 'Liebe',
  img: 'personajes/liebe.gif',
  classes: ['atacante', 'debilitador'],
  hp: 128,
  atk: 27,
  def: 19,
  spd: 33,

  moves: [
    {
      id: 'anti_magic_slash',
      name: 'Corte Antimagia',
      power: 20,
      acc: 0.95,
      desc: 'Un tajo envuelto en antimagia que reduce el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        prob: 0.85,
        duration: 2
      }
    },
    {
      id: 'devil_power',
      name: 'Poder Demoníaco',
      power: 0,
      acc: 1.0,
      desc: 'Liebe libera parte de su poder, aumentando su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'anti_magic_barrier',
      name: 'Aura Antimagia',
      power: 0,
      acc: 1.0,
      desc: 'La antimagia envuelve a Liebe, aumentando su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'demon_destroyer',
      name: 'ULTI: Liberación de la Antimagia',
      power: 30,
      acc: 0.90,
      desc: 'Liebe libera una inmensa ola de antimagia que inflige un daño devastador y reduce la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'brazilian_miku',
  name: 'Brazilian Miku',
  img: 'personajes/brazilian_miku.png',
  classes: ['mago', 'soporte'],
  hp: 118,
  atk: 30,
  def: 18,
  spd: 27,

  moves: [
    {
      id: 'samba_beat',
      name: 'Ritmo de Samba',
      power: 24,
      acc: 0.95,
      desc: 'Un ritmo contagioso golpea al enemigo y reduce su SPD.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'carnival_energy',
      name: 'Energía del Carnaval',
      power: 0,
      acc: 1.0,
      desc: 'El ambiente festivo inspira a Brazilian Miku, aumentando su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'viral_melody',
      name: 'Melodía Viral',
      power: 0,
      acc: 1.0,
      desc: 'Su voz llena de energía restaura un 20% de su vida máxima.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.20
      }
    },
    {
      id: 'festival_finale',
      name: 'ULTI: Festival Infinito',
      power: 30,
      acc: 0.90,
      desc: 'Desata un gigantesco concierto que causa un daño masivo y reduce la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 7,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'itachi',
  name: 'Itachi Uchiha',
  img: 'personajes/itachi.gif',
  classes: ['atacante', 'debilitador'],
  hp: 120,
  atk: 30,
  def: 22,
  spd: 24,

  moves: [
    {
      id: 'amaterasu',
      name: 'Amaterasu',
      power: 22,
      acc: 0.95,
      desc: 'Las llamas negras consumen al enemigo, reduciendo su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'tsukuyomi',
      name: 'Tsukuyomi',
      power: 0,
      acc: 1.0,
      desc: 'Atrapa al enemigo en una poderosa ilusión, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'crow_clone',
      name: 'Clon de Cuervos',
      power: 0,
      acc: 1.0,
      desc: 'Desaparece entre cuervos y aumenta su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'susanoo',
      name: 'ULTI: Susanoo',
      power: 30,
      acc: 0.90,
      desc: 'Invoca el Susanoo para asestar un golpe devastador que reduce la velocidad del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 7,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'deidara',
  name: 'Deidara',
  img: 'personajes/deidara.gif',
  classes: ['atacante', 'debilitador'],
  hp: 115,
  atk: 30,
  def: 16,
  spd: 22,

  moves: [
    {
      id: 'clay_bird',
      name: 'Pájaro de Arcilla',
      power: 22,
      acc: 0.95,
      desc: 'Lanza un ave explosiva que reduce la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 4,
        prob: 0.80,
        duration: 2
      }
    },
    {
      id: 'c2_dragon',
      name: 'C2: Dragón de Arcilla',
      power: 24,
      acc: 0.90,
      desc: 'Invoca un dragón de arcilla que bombardea al enemigo, reduciendo su SPD.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        prob: 0.90,
        duration: 2
      }
    },
    {
      id: 'explosive_art',
      name: '¡El Arte es una Explosión!',
      power: 0,
      acc: 1.0,
      desc: 'La emoción de la batalla aumenta su ATK durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'c3',
      name: 'ULTI: C3',
      power: 30,
      acc: 0.85,
      desc: 'Lanza una gigantesca bomba de arcilla que causa un daño devastador y reduce la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'naruto',
  name: 'Naruto Uzumaki',
  img: 'personajes/naruto.gif',
  classes: ['atacante', 'soporte'],
  hp: 135,
  atk: 30,
  def: 20,
  spd: 30,

  moves: [
    {
      id: 'rasengan',
      name: 'Rasengan',
      power: 20,
      acc: 0.95,
      desc: 'Concentra chakra en su mano y golpea al enemigo con una poderosa esfera de energía.',
      baseCooldown: 2,
      type: 'attack',
      effect: null
    },
    {
      id: 'shadow_clone',
      name: 'Kage Bunshin no Jutsu',
      power: 0,
      acc: 1.0,
      desc: 'Crea clones de sombra para aumentar su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 8,
        duration: 3
      }
    },
    {
      id: 'kurama_chakra',
      name: 'Chakra de Kurama',
      power: 0,
      acc: 1.0,
      desc: 'El chakra del Kyūbi regenera un 25% de la vida máxima de Naruto.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.25
      }
    },
    {
      id: 'rasenshuriken',
      name: 'ULTI: Fūton Rasenshuriken',
      power: 30,
      acc: 0.90,
      desc: 'Lanza un devastador Rasenshuriken que reduce la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'yoruichi',
  name: 'Yoruichi Shihōin',
  img: 'personajes/yoruichi.png',
  classes: ['atacante', 'soporte'],
  hp: 115,
  atk: 30,
  def: 18,
  spd: 42,

  moves: [
    {
      id: 'shunpo_strike',
      name: 'Golpe Shunpō',
      power: 22,
      acc: 1.0,
      desc: 'Se mueve a una velocidad imperceptible y golpea al enemigo.',
      baseCooldown: 1,
      type: 'attack',
      effect: null
    },
    {
      id: 'shunko',
      name: 'Shunkō',
      power: 0,
      acc: 1.0,
      desc: 'Envuelve su cuerpo en energía, aumentando su ATK y velocidad durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 9,
        duration: 3
      }
    },
    {
      id: 'flash_step',
      name: 'Paso Relámpago',
      power: 0,
      acc: 1.0,
      desc: 'Incrementa enormemente su velocidad durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempSpd',
        value: 12,
        duration: 3
      }
    },
    {
      id: 'raiju_senkei',
      name: 'ULTI: Shunkō Raijū Senkei',
      power: 30,
      acc: 0.95,
      desc: 'Desata una feroz descarga eléctrica que causa un daño masivo al enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: null
    }
  ]
},
	{
  id: 'mayuri',
  name: 'Mayuri Kurotsuchi',
  img: 'personajes/mayuri.png',
  classes: ['debilitador', 'soporte', 'control'],
  hp: 120,
  atk: 24,
  def: 20,
  spd: 28,

  moves: [
    {
      id: 'ashisogi_jizo',
      name: 'Ashisogi Jizō',
      power: 18,
      acc: 0.95,
      desc: 'El veneno de su Zanpakutō paraliza parcialmente al enemigo, reduciendo su SPD.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 7,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'experimental_drug',
      name: 'Droga Experimental',
      power: 0,
      acc: 1.0,
      desc: 'Inyecta un compuesto que reduce drásticamente el ATK del enemigo.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 8,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'body_modification',
      name: 'Modificación Corporal',
      power: 0,
      acc: 1.0,
      desc: 'Gracias a sus mejoras corporales aumenta su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'konjiki_ashisogi_jizo',
      name: 'ULTI: Konjiki Ashisogi Jizō',
      power: 34,
      acc: 0.95,
      desc: 'Libera a su Bankai, inundando el campo con un veneno letal que reduce enormemente la DEF del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 10,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'griffith',
  name: 'Griffith',
  img: 'personajes/griffith.png',
  classes: ['atacante', 'soporte'],
  hp: 125,
  atk: 27,
  def: 18,
  spd: 19,

  moves: [
    {
      id: 'swift_rapier',
      name: 'Estocada Relámpago',
      power: 20,
      acc: 0.98,
      desc: 'Una rápida estocada con su espada que reduce la DEF del enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 4,
        prob: 0.75,
        duration: 2
      }
    },
    {
      id: 'hawk_leader',
      name: 'Líder de la Banda del Halcón',
      power: 0,
      acc: 1.0,
      desc: 'Su liderazgo inspira a sus aliados, aumentando su ATK durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 8,
        duration: 3
      }
    },
    {
      id: 'femto_presence',
      name: 'Presencia de Femto',
      power: 20,
      acc: 1.0,
      desc: 'La presión de Femto intimida al enemigo, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'eclipse',
      name: 'ULTI: Eclipse',
      power: 30,
      acc: 0.90,
      desc: 'Invoca el Eclipse, desatando una masacre que causa un daño devastador y reduce la velocidad del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'ichigo',
  name: 'Ichigo Kurosaki',
  img: 'personajes/ichigo.gif',
  classes: ['atacante'],
  hp: 135,
  atk: 32,
  def: 18,
  spd: 30,

  moves: [

     
    {
      id: 'getsuga_tensho',
      name: 'Getsuga Tenshō',
      power: 23,
      acc: 0.95,
      desc: 'Lanza una poderosa onda de energía con Zangetsu.',
      baseCooldown: 2,
      type: 'attack',
      effect: null
    },
    {
      id: 'bankai',
      name: 'Bankai: Tensa Zangetsu',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta su ATK y SPD durante 3 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'hollow_instinct',
      name: 'Instinto Hollow',
      power: 0,
      acc: 1.0,
      desc: 'El poder Hollow toma el control y regenera un 20% de la vida máxima.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.20
      }
    },
    {
      id: 'mugetsu',
      name: 'ULTI: Mugetsu',
      power: 30,
      acc: 0.90,
      desc: 'Libera el Getsuga Final, infligiendo un daño devastador.',
      baseCooldown: 7,
      type: 'attack',
      effect: null
    }
  ]
},
	{
  id: 'wonderofu',
  name: 'Wonder of U',
  img: 'personajes/wonder_of_u.png',
  classes: ['debilitador', 'defensor', 'control'],
  hp: 165,
  atk: 22,
  def: 34,
  spd: 26,

  moves: [
    {
      id: 'calamity',
      name: 'Calamidad',
      power: 18,
      acc: 1.0,
      desc: 'La calamidad alcanza al enemigo, reduciendo su ATK durante 3 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 5,
        prob: 1.0,
        duration: 2
      }
    },
    {
      id: 'inevitable_fate',
      name: 'Destino Inevitable',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta su DEF durante 3 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempDef',
        value: 10,
        duration: 3
      }
    },
    {
      id: 'misfortune',
      name: 'Mala Fortuna',
      power: 0,
      acc: 0.95,
      desc: 'Reduce la velocidad del enemigo durante 2 turnos.',
      baseCooldown: 2,
      type: 'support',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 6,
        prob: 0.95,
        duration: 2
      }
    },
    {
      id: 'flow_of_calamity',
      name: 'ULTI: Flujo de la Calamidad',
      power: 42,
      acc: 1.0,
      desc: 'Una calamidad inevitable golpea al enemigo, reduciendo su DEF de forma severa.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 8,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},
	{
  id: 'peter',
  name: 'Peter Griffin',
  img: 'personajes/peter.png',
  classes: ['atacante', 'debilitador'],
  hp: 145,
  atk: 34,
  def: 24,
  spd: 14,

  moves: [
    {
      id: 'chicken_fight',
      name: 'Pelea con el Pollo',
      power: 28,
      acc: 0.90,
      desc: 'Golpea brutalmente al enemigo y tiene un 40% de reducir su DEF.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 4,
        prob: 0.40,
        duration: 2
      }
    },
    {
      id: 'road_house',
      name: '¡Road House!',
      power: 20,
      acc: 1.0,
      desc: 'Peter entra en modo pelea, aumentando su ATK durante 2 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: {
        type: 'tempAtk',
        value: 8,
        duration: 2
      }
    },
    {
      id: 'beer_break',
      name: 'Descanso con Cerveza',
      power: 0,
      acc: 1.0,
      desc: 'Se toma una cerveza y recupera un 20% de su vida máxima.',
      baseCooldown: 4,
      type: 'support',
      effect: {
        type: 'selfHealPct',
        value: 0.20
      }
    },
    {
      id: 'giant_chicken_final',
      name: 'ULTI: Guerra Infinita contra el Pollo',
      power: 48,
      acc: 0.85,
      desc: 'Desata una pelea épica causando un enorme daño y reduciendo el ATK del enemigo.',
      baseCooldown: 6,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'atk',
        value: 6,
        prob: 1.0,
        duration: 3
      }
    }
  ]
},

  {
  id: 'aizen',
  name: 'Sosuke Aizen',
  img: 'personajes/aizen.png',
  classes: ['mago', 'debilitador'],
  hp: 120,
  atk: 30,
  def: 19,
  spd: 35,

  moves: [
    {
      id: 'kurohitsugi',
      name: 'Hadō 90: Kurohitsugi',
      power: 22,
      acc: 0.8,
      desc: 'Reduce la DEF enemiga.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type:'debuff',
        stat:'def',
        value:3,
        prob:0.89,
        duration: 2
      }
    },
    {
      id: 'kyoka',
      name: 'Kyōka Suigetsu',
      power: 0,
      acc: 1,
      desc: 'Reduce DEF y ATK del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        { type:'debuff', stat:'def', value:2, prob:0.89 },
        { type:'debuff', stat:'atk', value:3, prob:0.98 }
      ]
    },
    {
      id: 'basicaizenattack',
      name: 'Espadazo',
      power: 24,
      acc: 0.8,
      desc: 'Ataque básico.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'goryutenmetsu',
      name: 'ULTI: Hadō 99: Goryūtenmetsu',
      power: 30,
      acc: 0.9,
      desc: 'Reduce la velocidad enemiga.',
      baseCooldown: 5,
      type: 'attack',
      effect: {
        type:'debuff', stat:'spd', value:5, prob:1 ,
        duration: 3}
    }
  ]
},

	
  {
  id: 'helcurt',
  name: 'Helcurt',
  img: 'personajes/helcurt.png',
  classes: ['atacante', 'asesino'],
  hp: 110,
  atk: 30,
  def: 16,
  spd: 30,

  moves: [
    {
      id: 'shadow_blade',
      name: 'Shadow Blade',
      power: 22,
      acc: 0.95,
      desc: 'Helcurt ataca con energía sombría, dañando y reduciendo un poco la velocidad del enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value: 5, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'deadly_stinger',
      name: 'Deadly Stinger',
      power: 25,
      acc: 0.9,
      desc: 'Acumula energía oscura y la libera en un ataque devastador.',
      baseCooldown: 3,
      type: 'attack'
    },
    {
      id: 'shadow_of_terror',
      name: 'Shadow of Terror',
      power: 20,
      acc: 1.0,
      desc: 'Helcurt lanza un grito sombrío que debilita severamente al enemigo, imitando un silencio.',
      baseCooldown: 4,
      type: 'attack',
      effects: [
        { type:'debuff', stat:'atk', value: 10, prob: 1.0 },
        { type:'debuff', stat:'spd', value: 10, prob: 1.0 }
      ]
    },
    {
      id: 'dark_night_falls',
      name: 'Dark Night Falls',
      power: 0,
      acc: 1.0,
      desc: 'Helcurt envuelve el campo en oscuridad, volviéndose más rápido y anulando temporalmente a los enemigos.',
      baseCooldown: 6,
      type: 'support',
      effects: [
        { type:'tempSpd', value: 12, duration: 2 },    
        { type:'debuff', stat:'spd', value: 8, prob: 1.0 }, 
        { type:'debuff', stat:'atk', value: 8, prob: 1.0 }  
      ]
    }
  ]
},
  {
  id: 'thamuz',
  name: 'Thamuz',
  img: 'personajes/thamuz.png', 
  classes: ['atacante', 'luchador'],
  hp: 145,
  atk: 30,
  def: 24,
  spd: 20,

  moves: [
    {
      id: 'molten_scythes',
      name: 'Molten Scythes',
      power: 22,
      acc: 0.95,
      desc: 'Thamuz lanza sus guadañas ardientes, causando daño inicial y dejando una quemadura flameante.',
      baseCooldown: 0,
      type: 'attack',
      effects: [
        { type:'debuff', stat:'hpBurn', value: 8, duration: 2 } 
      ]
    },
    {
      id: 'chasm_leap',
      name: 'Chasm Leap',
      power: 25,
      acc: 0.9,
      desc: 'Thamuz salta violentamente, golpeando el suelo y reduciendo la DEF del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value: 8, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'cursed_blood',
      name: 'Cursed Blood',
      power: 0,
      acc: 1.0,
      desc: 'La sangre demoníaca de Thamuz arde, curándolo ligeramente durante varios turnos.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        { type:'selfHealPct', value: 0.06 },       ]
    },
    {
      id: 'crimson_armor',
      name: 'Crimson Armor',
      power: 30,
      acc: 1.0,
      desc: 'Thamuz libera su forma demoníaca, causando gran daño, aplicando quemadura y restaurando HP.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type:'debuff', stat:'hpBurn', value: 12, duration: 2 },
        { type:'selfHealPct', value: 0.12 } 
      ]
    }
  ]
},
  {
  id: 'minotauro',
  name: 'Minotauro',
  img: 'personajes/minotaur.png', // reemplázalo con la ruta real
  classes: ['atacante', 'defensor'],
  hp: 150,
  atk: 38,
  def: 28,
  spd: 14,

  moves: [
    {
      id: 'embestida_brutal',
      name: 'Embestida Brutal',
      power: 45,
      acc: 0.9,
      desc: 'El Minotauro embiste con su fuerza descomunal, dañando y rompiendo la defensa del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value: 8, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'fuerza_desatada',
      name: 'Fuerza Desatada',
      power: 0,
      acc: 1.0,
      desc: 'Canaliza su furia interior, aumentando enormemente su ATK durante algunos turnos.',
      baseCooldown: 0,
      type: 'support',
      effect: { type:'tempAtk', value: 12, duration: 2 }
    },
    {
      id: 'golpe_terremoto',
      name: 'Golpe Terremoto',
      power: 40,
      acc: 0.95,
      desc: 'Golpea el suelo con tanta fuerza que ralentiza al enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value: 6, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'ira_del_laberinto',
      name: 'Ira del Laberinto',
      power: 60,
      acc: 1.0,
      desc: 'El Minotauro libera toda su furia, causando enorme daño y reforzándose con un escudo.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type:'shield', value: 40 }
      ]
    }
  ]
},
  {
  id: 'guinevere',
  name: 'Guinevere',
  img: 'personajes/guinevere.png',   classes: ['atacante', 'control'],
  hp: 125,
  atk: 28,
  def: 18,
  spd: 24,

  moves: [
    {
      id: 'energy_wave',
      name: 'Energy Wave',
      power: 20,
      acc: 0.95,
      desc: 'Guinevere lanza una onda de energía mágica que daña y reduce la velocidad del enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value: 6, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'spatial_migration',
      name: 'Spatial Migration',
      power: 0,
      acc: 1.0,
      desc: 'Se desplaza rápidamente, aumentando su SPD y preparando su siguiente ataque.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type:'tempSpd', value: 10, duration: 2 },
        { type:'tempAtk', value: 5, duration: 1 }
      ]
    },
    {
      id: 'magic_thump',
      name: 'Magic Thump',
      power: 25,
      acc: 0.9,
      desc: 'Ataca desde el aire, levantando al enemigo y reduciendo su DEF.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value: 8, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'violet_requiem',
      name: 'Violet Requiem',
      power: 28,
      acc: 1.0,
      desc: 'Guinevere libera energía explosiva en un área, causando gran daño mágico y aumentando su ATK temporalmente.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type:'tempAtk', value: 10, duration: 2 }
      ]
    }
  ]
},
  {
  id: 'grock',
  name: 'Grock',
  img: 'personajes/grock.png', 
  classes: ['defensor', 'tanque'],
  hp: 160,
  atk: 28,
  def: 35,
  spd: 9,

  moves: [
    {
      id: 'power_of_nature',
      name: 'Power of Nature',
      power: 20,
      acc: 0.95,
      desc: 'Grock carga su hacha y libera un poderoso ataque que aumenta temporalmente su DEF.',
      baseCooldown: 0,
      type: 'attack',
      effects: [
        { type:'tempDef', value: 10, duration: 2 }
      ]
    },
    {
      id: 'guardians_barrier',
      name: "Guardian's Barrier",
      power: 0,
      acc: 1.0,
      desc: 'Grock invoca una barrera protectora y obtiene un fuerte escudo.',
      baseCooldown: 4,
      type: 'support',
      effect: { type:'shield', value: 35 }
    },
    {
      id: 'wild_charge',
      name: 'Wild Charge',
      power: 25,
      acc: 0.9,
      desc: 'Grock embiste brutalmente, causando gran daño y reduciendo la SPD del enemigo.',
      baseCooldown: 4,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value: 8, prob: 1.0 ,
        duration: 2}
    },
    {
      id: 'ancestors_wrath',
      name: "Ancestor's Wrath",
      power: 30,
      acc: 1.0,
      desc: 'Grock canaliza la ira de sus ancestros, causando daño a todos y fortaleciéndose.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type:'tempDef', value: 12, duration: 3 },
        { type:'tempAtk', value: 8, duration: 2 }
      ]
    }
  ]
},
  {
  id: 'estes',
  name: 'Estes',
  img: 'personajes/estes.png', 
  classes: ['sanador', 'soporte'],
  hp: 120,
  atk: 15,
  def: 25,
  spd: 19,

  moves: [
    {
      id: 'moonlight_immersion',
      name: 'Moonlight Immersion',
      power: 0,
      acc: 1.0,
      desc: 'Canaliza poder lunar para curar a un aliado con una fuerte ráfaga de luz.',
      baseCooldown: 0,
      type: 'support',
      effect: { type:'heal', value: 35 }
    },
    {
      id: 'domain_moon_goddess',
      name: 'Domain of the Moon Goddess',
      power: 0,
      acc: 1.0,
      desc: 'Crea un campo lunar que otorga DEF adicional a un aliado durante varios turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'tempDef', value: 10, duration: 3 }
    },
    {
      id: 'blessing_moonlight',
      name: 'Blessing of Moonlight',
      power: 0,
      acc: 1.0,
      desc: 'Bendice a un aliado restaurando parte de su HP y aumentando su SPD levemente.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type:'heal', value: 30 },
        { type:'tempSpd', value: 5, duration: 2 }
      ]
    },
    {
      id: 'moonlight_revelation',
      name: 'Moonlight Revelation',
      power: 0,
      acc: 1.0,
      desc: 'Desata la energía lunar suprema, curando a todo el equipo por un gran porcentaje de la vida máxima.',
      baseCooldown: 6,
      type: 'support',
      effect: { type:'selfHealPct', value: 0.30 } 
    }
  ]
},
  {
  id: 'gloo_ml',
  name: 'Gloo',
  img: 'personajes/gloo.png', 
  classes: ['defensor', 'debilitador'],
  hp: 170,
  atk: 22,
  def: 32,
  spd: 14,

  moves: [
    {
      id: 'pegajosidad',
      name: 'Pegajosidad',
      power: 25,
      acc: 0.95,
      desc: 'Gloo golpea al enemigo y aplica lentitud con su gel pegajoso.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:6, prob:1.0 ,
        duration: 2}
    },

    {
      id: 'dividirse',
      name: 'Dividirse',
      power: 0,
      acc: 1.0,
      desc: 'Gloo se divide en fragmentos que reducen el daño recibido y aumentan su DEF.',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'tempDef', value:12, duration:2 }
    },

    {
      id: 'glooing_stick',
      name: 'Glooing Stick',
      power: 0,
      acc: 1.0,
      desc: 'Los enemigos afectados quedan debilitados, reduciendo su ATK.',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'debuff', stat:'atk', value:6, prob:1.0 ,
        duration: 2}
    },

    {
      id: 'monstruo_pega_pega',
      name: 'Ultimate: Monstruo Pega-pega',
      power: 45,
      acc: 0.9,
      desc: 'Gloo se adhiere a un enemigo, absorbiendo parte de su vida y reduciendo fuertemente su DEF.',
      baseCooldown: 6,
      type: 'attack',
      effect: 
        { type:'debuff', stat:'def', value:10, prob:1.0 ,
        duration: 3}
    }
  ]
},
  {
  id: 'johnson_ml',
  name: 'Johnson',
  img: 'personajes/jhonson.png',
  classes: ['defensor', 'soporte'],
  hp: 160,
  atk: 20,
  def: 35,
  spd: 15,

  moves: [
    {
      id: 'electro_escudo',
      name: 'Electro Escudo',
      power: 0,
      acc: 1.0,
      desc: 'Johnson activa un escudo eléctrico que absorbe una gran cantidad de daño.',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'shield', value:40 }
    },

    {
      id: 'martillo_impacto',
      name: 'Martillo de Impacto',
      power: 30,
      acc: 0.95,
      desc: 'Golpea con su martillo eléctrico, causando daño y reduciendo el ATK del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'debuff', stat:'atk', value:6, prob:1.0 ,
        duration: 2}
    },

    {
      id: 'refuerzo_de_acero',
      name: 'Refuerzo de Acero',
      power: 0,
      acc: 1.0,
      desc: 'Refuerza su estructura metálica, aumentando temporalmente su DEF.',
      baseCooldown: 4,
      type: 'support',
      effect: { type:'tempDef', value:12, duration:2 }
    },

    {
      id: 'auto_letal',
      name: 'Ultimate: Auto Letal',
      power: 50,
      acc: 0.9,
      desc: 'Johnson se transforma en auto y embiste a todos los enemigos, causando gran daño y reduciendo su SPD.',
      baseCooldown: 6,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:8, prob:1.0 ,
        duration: 3}
    }
  ]
},
  {
  id: 'gojo_satoru',
  name: 'Gojo Satoru',
  img: 'personajes/gojo.png',
  classes: ['atacante', 'soporte', 'debilitador'],
  hp: 140,
  atk: 30,
  def: 20,
  spd: 30,

  moves: [
    {
      id: 'colision_negativa',
      name: 'Cursed Technique Reversal: Red',
      power: 22,
      acc: 0.95,
      desc: 'Gojo dispara energía invertida que causa daño masivo. Alta probabilidad de empujar al enemigo y reducir su DEF.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:8, prob:0.8 ,
        duration: 2}
    },

    {
      id: 'infinito',
      name: 'Infinity',
      power: 0,
      acc: 1.0,
      desc: 'Gojo activa Infinity, reduciendo el daño recibido y aumentando su DEF por 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect: { type:'tempDef', value:15, duration:2 }
    },

    {
      id: 'colision_azul',
      name: 'Cursed Technique Lapse: Blue',
      power: 25,
      acc: 1.0,
      desc: 'Un ataque que atrae al enemigo y le reduce la SPD por la manipulación del espacio.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:10, prob:1.0 ,
        duration: 2}
    },

    {
      id: 'vacio_ilimitado',
      name: 'Domain Expansion: Unlimited Void',
      power: 30,
      acc: 0.9,
      desc: 'Gojo despliega su dominio. Daño a todos los enemigos y reducción total de SPD por 2 turnos.',
      baseCooldown: 6,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:999, prob:1.0 ,
        duration: 2}
    }
  ]
},
  {
  id: 'cici',
  name: 'Cici',
  img: 'personajes/cici.png',
  classes: ['atacante', 'soporte'],
  hp: 115,
  atk: 30,
  def: 18,
  spd: 28,
  moves: [
    {
      id: 'El deleite del intérprete',
      name: 'Lluvia de Cintas',
      power: 35,
      acc: 0.95,
      desc: 'Ataca múltiples veces con sus cintas causando daño y reduciendo levemente la DEF del enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:5, prob:1.0 ,
        duration: 2}
    },

    {
      id: 'Bombardeo YoYo',
      name: 'Danza Acrobática',
      power: 0,
      acc: 1.0,
      desc: 'Cici realiza un giro elegante, aumentando su SPD y esquivando más fácilmente.',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'tempSpd', value:10, duration:2 }
    },

    {
      id: 'Rebote flotante',
      name: 'Rebote Travieso',
      power: 30,
      acc: 1.0,
      desc: 'Cici rebota entre enemigos, dañando al objetivo y curándose un poco.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'selfHealPct', value:0.08 } // se cura 8% del HP máx
    },

    {
      id: 'Llamada de cortina',
      name: 'Danza Final',
      power: 45,
      acc: 0.9,
      desc: 'Ataque giratorio poderoso que golpea a todos los enemigos y aumenta ligeramente la SPD de todos los aliados.',
      baseCooldown: 5,
      type: 'attack',
      effect: { type:'tempSpd', value:5, duration:1 }
    }
  ]
},
  {
  id: 'ricky_edit',
  name: 'Ricky Edit',
  img: 'personajes/edit.png', 
  classes: ['soporte', 'debilitador'],
  hp: 50,
  atk: 15,
  def: 5,
  spd: 5,
  moves: [
    {
      id: 'corte_viral',
      name: 'Corte Viral',
      power: 35,
      acc: 0.9,
      desc: 'Un ataque creativo que golpea al enemigo y reduce su DEF temporalmente.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:5, prob:1.0 ,
        duration: 2}
    },
    {
      id: 'edicion_magica',
      name: 'Edición Mágica',
      power: 0,
      acc: 1.0,
      desc: 'Aplica un buff aleatorio a un aliado: ATK, DEF o SPD por 2 turnos.',
      baseCooldown: 3,
      type: 'support',
      effect: [
        { type:'tempAtk', value:5, duration:2 },
        { type:'tempDef', value:5, duration:2 },
        { type:'tempSpd', value:5, duration:2 }
      ]
    },
    {
      id: 'memazo',
      name: 'Memazo',
      power: 0,
      acc: 1.0,
      desc: 'Desorienta a todos los enemigos reduciendo su SPD temporalmente.',
      baseCooldown: 4,
      type: 'support',
      effect: { type:'debuff', stat:'spd', value:5, prob:1.0 ,
        duration: 2}
    },
    {
      id: 'viralizar',
      name: 'Viralizar',
      power: 40,
      acc: 0.95,
      desc: 'Ataque que inflige daño a todos los enemigos y tiene 30% de probabilidad de confundirlos.',
      baseCooldown: 5,
      type: 'attack',
      effect: { type:'debuff', stat:'atk', value:5, prob:0.3 ,
        duration: 2}
    }
  ]
},
  {
  id: 'fernando_alonso',
  name: 'Fernando Alonso',
  img: 'personajes/alonso.png', 
  classes: ['atacante', 'soporte'],
  hp: 110,
  atk: 35,
  def: 10,
  spd: 30,
  moves: [
    {
      id: 'adelantamiento',
      name: 'Adelantamiento',
      power: 40,
      acc: 0.95,
      desc: 'Realiza un movimiento rápido que golpea al enemigo y aumenta temporalmente su SPD.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'tempSpd', value:5, duration:2 }
    },
    {
      id: 'pit_stop',
      name: 'Pit Stop Estratégico',
      power: 0,
      acc: 1.0,
      desc: 'Restaura HP de un aliado por 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effect:
        { type:'heal', value:30 }
    },
    {
      id: 'manobra_defensiva',
      name: 'Manobra Defensiva',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta temporalmente DEF de un aliado, ideal para protegerlo de ataques fuertes.',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'tempDef', value:10, duration:2 }
    },
    {
      id: 'turbo_final',
      name: 'Turbo Final',
      power: 50,
      acc: 0.9,
      desc: 'Ataque rápido que inflige daño a todos los enemigos y reduce temporalmente su SPD.',
      baseCooldown: 5,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:5, prob:1.0 ,
        duration: 2}
    }
  ]
},
  {
  id: 'yami',
  name: 'Yami Sukehiro',
  img: 'personajes/yamisukehiro.png',    classes: ['atacante', 'contraataque'],
  hp: 130,
  atk: 34,
  def: 14,
  spd: 12,

  moves: [
    {
      id: 'yami1',
      name: 'Corte Oscuro',
      power: 26,
      acc: 0.95,
      desc: 'Un corte reforzado con oscuridad. Puede bajar la DEF del enemigo.',
      baseCooldown: 1,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:4, duration:2 }
    },

    {
      id: 'yami2',
      name: 'Agujero Dimensional',
      power: 34,
      acc: 0.85,
      desc: 'Un tajo que ignora parte de la defensa enemiga.',
      baseCooldown: 3,
      type: 'attack',
      effect: { type:'pierce', value:0.40 } 
      // Ignora 40% de DEF del objetivo
    },

    {
      id: 'yami3',
      name: 'Contra Oscura',
      power: 0,
      acc: 1.0,
      desc: 'Adopta una postura que devuelve parte del daño recibido.',
      baseCooldown: 4,
      type: 'support',
      effect: { type:'reflect', value:0.30, duration:2 } 
      // Refleja 30% del daño recibido
    },

    {
      id: 'yami4',
      name: 'Espada del Destino (ULT)',
      power: 45,
      acc: 0.9,
      desc: 'Un tajo devastador de oscuridad que puede aturdir.',
      baseCooldown: 6,
      type: 'attack',
      effect: { type:'stun', prob:0.25, duration:1 }
    }
  ]
},
  {
  id: 'noelle_silva',
  name: 'Noelle Silva',
  img: 'personajes/noellesilva.jpg',
  classes: ['defensor', 'soporte'],
  hp: 155,
  atk: 24,
  def: 27,
  spd: 14,

  moves: [
    {
      id: 'noe1',
      name: 'Nido del Dragón Marino',
      power: 18,
      acc: 0.97,
      desc: 'Noelle crea una barrera de agua alrededor de sí misma, reduciendo la velocidad del enemigo mientras se protege.',
      baseCooldown: 0,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 10,
          duration: 2,
          prob: 1.0
        },
        {
          type: 'tempDef',
          value: 5,
          duration: 2
        }
      ]
    },

    {
      id: 'noe2',
      name: 'Cuna del Dragón Marino',
      power: 0,
      acc: 1.0,
      desc: 'Noelle crea una enorme esfera de agua que la protege y absorbe una gran cantidad de daño.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'shield',
          value: 25
        },
        {
          type: 'tempDef',
          value: 7,
          duration: 3
        }
      ]
    },

    {
      id: 'noe3',
      name: 'Robe de Valkyrie',
      power: 0,
      acc: 1.0,
      desc: 'Noelle se cubre con una armadura de agua, aumentando enormemente su resistencia y preparándose para proteger a sus aliados.',
      baseCooldown: 5,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 4
        },
        {
          type: 'shield',
          value: 27
        },
        {
          type: 'tempSpd',
          value: 5,
          duration: 4
        }
      ]
    },

    {
      id: 'noe4',
      name: 'ULTI: Sea Dragon\'s Roar',
      power: 30,
      acc: 0.92,
      desc: 'Noelle invoca un enorme dragón de agua que golpea al enemigo mientras libera una poderosa barrera que protege a Noelle.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'shield',
          value: 28
        },
        {
          type: 'tempDef',
          value: 10,
          duration: 3
        },
        {
          type: 'lifesteal',
          value: 12
        }
      ]
    }
  ]
},

  {
  id: 'ainz',
  name: 'Ainz',
  img: 'personajes/ainz.jpeg',
  classes: ['mago', 'atacante'],
  hp: 105,
  atk: 24,
  def: 14,
  spd: 12,

  moves: [
    {
      id: 'ainz1',
      name: 'Orbe Tenebroso',
      power: 26,
      acc: 0.94,
      desc: 'Un proyectil de energía oscura que reduce DEF.',
      baseCooldown: 1,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:4, duration:2 }
    },

    {
      id: 'ainz2',
      name: 'Punzada de Alma',
      power: 28,
      acc: 0.92,
      desc: 'Ataque mágico que reduce temporalmente la SPD del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:3, duration:2 }
    },

    {
      id: 'ainz3',
      name: 'Aura de Desesperación',
      power: 0,
      acc: 1.0,
      desc: 'Reduce ATK y ACC del enemigo con energía opresora.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        { type:'debuff', stat:'atk', value:5, duration:2 },
        { type:'debuff', stat:'acc', value:0.12, duration:2 }
      ]
    },

    {
      id: 'ainz4',
      name: 'Cataclismo Abismal (ULT)',
      power: 40,
      acc: 0.85,
      desc: 'Explosión de magia oscura que elimina buffs y puede aturdir.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type:'removeBuffs', value:'all' },
        { type:'stun', prob:0.25, duration:1 }
      ]
    }
  ]
},
  {
  id: 'asta',
  name: 'Asta',
  img: 'personajes/asta.jpg', 
  classes: ['atacante', 'antimagia'],
  hp: 130,
  atk: 34,
  def: 16,
  spd: 18,

  moves: [
    {
      id: 'ast1',
      name: 'Golpe Antienergía',
      power: 26,
      acc: 0.96,
      desc: 'Un ataque físico que rompe escudos y elimina energía residual.',
      baseCooldown: 1,
      type: 'attack',
      effect: { type:'removeShield', value:true }
    },
    {
      id: 'ast2',
      name: 'Carga Determinada',
      power: 30,
      acc: 0.9,
      desc: 'Embiste al enemigo, reduciendo su ATK durante 2 turnos.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'debuff', stat:'atk', value:4, duration:2 }
    },
    {
      id: 'ast3',
      name: 'Voluntad Inquebrantable',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta su ATK +6 y cura una pequeña cantidad de vida.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        { type:'tempAtk', value:6, duration:2 },
        { type:'heal', value:20 }
      ]
    },
    {
      id: 'ast4',
      name: 'Corte Anulador (ULT)',
      power: 44,
      acc: 0.87,
      desc: 'Un tajo devastador que elimina buffs y puede reducir la SPD.',
      baseCooldown: 6,
      type: 'attack',
      effects: [
        { type:'removeBuffs', value:'all' },
        { type:'debuff', stat:'spd', value:4, duration:2 }
      ]
    }
  ]
},
  {
  id: 'mago_electrico',
  name: 'Mago Eléctrico',
  img: 'personajes/magoelectrico.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 95,
  atk: 28,
  def: 12,
  spd: 18,

  moves: [
    {
      id: 'elec1',
      name: 'Descarga Rápida',
      power: 20,
      acc: 0.97,
      desc: 'Ataque eléctrico básico con ligera chance de paralizar.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type:'stun', prob:0.15, duration:1 }
    },
    {
      id: 'elec2',
      name: 'Electrocutar',
      power: 32,
      acc: 0.9,
      desc: 'Daño moderado eléctrico que reduce SPD del objetivo.',
      baseCooldown: 2,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:4, prob:1.0, duration:2 }
    },
    {
      id: 'elec3',
      name: 'Campo Estático',
      power: 0,
      acc: 1.0,
      desc: 'Crea un aura que reduce el ATK y la ACC del enemigo.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        { type:'debuff', stat:'atk', value:5, duration:2 },
        { type:'debuff', stat:'acc', value:0.10, duration:2 } 
      ]
    },
    {
      id: 'elec4',
      name: 'Tormenta de Relámpagos (ULT)',
      power: 42,
      acc: 0.88,
      desc: 'Ataque en área que puede paralizar a todos los enemigos.',
      baseCooldown: 6,
      type: 'attack',
      aoe: true,
      effect: { type:'stun', prob:0.25, duration:1 }
    }
  ]
},
  {
  id: 'musculitos',
  name: 'Musculitos',
  img: 'personajes/musculitos.jpg',
  classes: ['atacante', 'tanque'],
  hp: 140,
  atk: 30,
  def: 20,
  spd: 10,

  moves: [
    {
      id: 'msc1',
      name: 'Aplastamiento Poderoso',
      power: 28,
      acc: 0.96,
      desc: 'Golpe físico contundente con posibilidad de bajar DEF.',
      baseCooldown: 1,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:4, prob:0.4 ,
        duration: 2}
    },
    {
      id: 'msc2',
      name: '¡Mis Músculos!',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta su DEF +6 y recupera 15 HP.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type:'tempDef', value:6, duration:2 },
        { type:'heal', value:15 }
      ]
    },
    {
      id: 'msc3',
      name: 'Rugido Intimidante',
      power: 0,
      acc: 1.0,
      desc: 'Reduce ATK y SPD del enemigo durante 2 turnos.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        { type:'debuff', stat:'atk', value:5, prob:1.0, duration:2 },
        { type:'debuff', stat:'spd', value:4, prob:1.0, duration:2 }
      ]
    },
    {
      id: 'msc4',
      name: 'Golpe Titánico (ULT)',
      power: 48,
      acc: 0.85,
      desc: 'Un ataque devastador que puede aturdir al objetivo.',
      baseCooldown: 6,
      type: 'attack',
      effect: { type:'stun', prob:0.3, duration:1 }
    }
  ]
},
  {
  id: 'chansin',
  name: 'Chansin',
  img: 'personajes/chansin.png',  classes: ['soporte', 'atacante'],
  hp: 120,
  atk: 25,
  def: 15,
  spd: 20,
  moves: [
    {
      id: 'viento_cortante',
      name: 'Combo Uno-Dos',
      power: 30,
      acc: 0.95,
      desc: 'Básico, baja spd',
      baseCooldown: 1,
      type: 'attack',
      effect: { type:'debuff', stat:'spd', value:5, prob:1.0 ,
        duration: 2}    },
    {
      id: 'todo o nada',
      name: 'Todo o nada',
      power: 0,
      acc: 1.0,
      desc: 'Da un escudo de 25',
      baseCooldown: 3,
      type: 'support',
      effect: { type:'shield', value:25 }
    },
    {
      id: 'cha3',
      name: 'Órdago',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta temporalmente ATK y SPD de un aliado.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        { type:'tempAtk', value:5, duration:2 },
        { type:'tempSpd', value:5, duration:2 }
      ]
    },
    {
      id: 'Ascuas',
      name: 'Ascuas',
      power: 40,
      acc: 0.9,
      desc: 'daño muy fuerte, aplica reducción de DEF por 2 turnos.',
      baseCooldown: 5,
      type: 'attack',
      effect: { type:'debuff', stat:'def', value:8, prob:1.0 ,
        duration: 2}
    }
  ]
},
  {
  id: 'mimosa',
  name: 'Mimosa Vermillion',
  img: 'personajes/mimosa.png',  classes: ['sanador', 'soporte'],
  hp: 115,
  atk: 20,
  def: 15,
  spd: 14,

  moves: [
    {
      id: 'mim1',
      name: 'Lanza Floral',
      power: 18,
      acc: 0.98,
      desc: 'Ataque básico mágico.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'mim2',
      name: 'Bendición Regeneradora',
      power: 0,
      acc: 1.0,
      desc: 'Cura 30 HP a un aliado.',
      baseCooldown: 2,
      type: 'support',
      effect: { type:'heal', value:30 }
    },
    {
      id: 'mim3',
      name: 'Luz de Crecimiento',
      power: 0,
      acc: 1.0,
      desc: 'Aumenta ATK +5 y DEF +5 durante 2 turnos (Doble buff).',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type:'tempAtk', value:5, duration:2 },
        { type:'tempDef', value:5, duration:2 }
      ]
    },
    {
      id: 'mim4',
      name: 'Sanación Real (ULT)',
      power: 0,
      acc: 1.0,
      desc: 'Cura 45 HP y aumenta SPD +4 durante 2 turnos a un aliado.',
      baseCooldown: 6,
      type: 'support',
      effects: [
        { type:'heal', value:45 },
        { type:'tempSpd', value:4, duration:2 }
      ]
    }
  ]
},
{
  id: 'hosimi',
  name: 'Hosimi Miyabi',
  img: 'personajes/hoshimi.jpg',
  classes: ['atacante', 'control'],

  hp: 105,
  atk: 30,
  def: 11,
  spd: 19,

  moves: [
    {
      id: 'hos1',
      name: 'Tajo Elegante',
      power: 22,
      acc: 0.98,
      desc: 'Miyabi realiza un corte rápido y preciso contra el enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'hos2',
      name: 'Corte Relámpago',
      power: 25,
      acc: 0.95,
      desc: 'Miyabi ejecuta un corte veloz que reduce temporalmente la DEF del enemigo.',
      baseCooldown: 2,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'def',
        value: 6,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'hos3',
      name: 'Danza Mortal',
      power: 25,
      acc: 0.91,
      desc: 'Miyabi encadena varios cortes con gran precisión. El último golpe reduce la velocidad del enemigo.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'spd',
          value: 6,
          duration: 2,
          prob: 1.0
        },
        {
          type: 'critChance',
          value: 12,
          duration: 1
        }
      ]
    },

    {
      id: 'hos4',
      name: 'Concentración Absoluta',
      power: 0,
      acc: 1.0,
      desc: 'Miyabi concentra su energía y aumenta temporalmente su ATK y SPD.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 9,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 5,
          duration: 3
        }
      ]
    },

    {
      id: 'hos5',
      name: 'Espada del Honor',
      power: 23,
      acc: 0.89,
      desc: 'Miyabi descarga un poderoso corte que puede dejar al enemigo aturdido.',
      baseCooldown: 5,
      type: 'attack',
      effects: [
        {
          type: 'stun',
          prob: 0.30,
          duration: 1
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 6,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'hos6',
      name: 'Elegancia de la Espada',
      power: 0,
      acc: 1.0,
      desc: 'Miyabi perfecciona sus movimientos, aumentando temporalmente su probabilidad de crítico y su SPD.',
      baseCooldown: 5,
      type: 'support',
      effects: [
        {
          type: 'critChance',
          value: 18,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 6,
          duration: 3
        }
      ]
    },

    {
      id: 'hos7',
      name: 'ULTI: Corte del Vacío',
      power: 30,
      acc: 0.90,
      desc: 'Miyabi concentra toda su energía en un único corte devastador que atraviesa las defensas del enemigo y puede dejarlo aturdido.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 11,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'critChance',
          value: 20,
          duration: 1
        },
        {
          type: 'stun',
          prob: 0.35,
          duration: 1
        }
      ]
    }
  ]
},

     { id: 'sans', name: 'Sans',  img: 'personajes/sans.jpg',  classes: ['atacante'], hp: 80, atk: 34, def: 7, spd: 14,
  moves: [
    { id: 'san1', name: 'Are you ready?', power: 20, acc: 0.98, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'san2', name: 'Haz de hueco', power: 25, acc: 1.0, desc: 'Daño moderado, baja un poco la precisión', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'acc', value:0.07, duration:2 }
    },
    { id: 'san3', name: 'Lluvia de huesos', power: 31, acc: 0.9, desc: 'Daño alto, baja un poco la preición', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'acc', value:0.07, duration:2 }
    },
    { id: 'san4', name: 'Corazón en un puño', power: 36, acc: 1.0, desc: 'Daño masivo, baja un poco la precisión', 
      baseCooldown: 6, type: 'attack', effect: { type:'debuff', stat:'acc', value:0.07, duration:2 }
    } ]
},

{id: 'Papyrus', name: 'Papyrus', img: 'personajes/Papyrus.gif', classes: ['atacante','soporte'], hp: 80, atk: 30, def: 10, spd: 17, 
    moves: [ {id:'mak1', name:'Plato de Espaguetis', power: 22, acc: 0.95, desc: 'Ataque básico.', baseCooldown: 0, type:'attack'},
         {id:'mak2', name:'Ataque azul', power: 32, acc: 1, desc: 'Daño fuerte.', baseCooldown: 2, type:'attack'},
         {id:'mak3', name:'Nyehehe', power: 0, acc: 1.0, desc: 'Otorga escudo 15.', effect:{type:'shield', value:15}, baseCooldown:3, type:'support'},
         {id:'mak4', name:'Ataque especial', power: 52, acc: 0.85, desc: 'Daño devastador.', baseCooldown: 6, type:'attack'} ] },

     { id: 'clarence', name: 'Clarence',  img: 'personajes/clarence.jpg',  classes: ['soporte'], hp: 120, atk: 24, def: 14, spd: 12,
  moves: [
    { id: 'cla1', name: 'Abrazo aplastante', power: 20, acc: 0.98, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'cla2', name: 'Clarence feliz', power: 0, acc: 1.0, desc: 'sube def (3 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempDef', value:6, duration:3 }
    },
    { id: 'cla3', name: 'Golpe GordiPower', power: 28, acc: 0.9, desc: 'daño alto', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'atk', value:6, prob:0.6 ,
        duration: 2}
    },
    { id: 'cla4', name: 'Amigos Para Siempre', power: 0, acc: 1.0, desc: 'Gran cura de 70', 
      baseCooldown: 6, type: 'support', effect: { type:'heal', value:70 }
    } ]
},
     { id: 'David', name: 'David',  img: 'personajes/David.gif',  classes: ['soporte', 'debilitador'], hp: 120, atk: 15, def: 15, spd: 20,
  moves: [
    { id: 'dav1', name: 'Dormina', power: 10, acc: 1.0, desc: 'Ataque básico que puede stunear', 
      baseCooldown: 0, type: 'attack', effect: { type: 'stun', prob: 0.2, duration: 1 }
    },
    { id: 'dav2', name: 'Luster Candy', power: 0, acc: 1.0, desc: 'Sube defensa y velocidad durante 2 turnos', 
      baseCooldown: 2, type: 'attack', effects: [
        { type:'tempDef', value:3, duration:2 },
        { type:'tempSpd', value:3, duration:2 }
      ]
    },
    { id: 'dav3', name: 'Mudoon', power: 6666, acc: 0.25, desc: 'Instakill, muy baja precisión ', 
      baseCooldown: 6, type: 'attack', effect: null
    },
    { id: 'dav4', name: 'Haunting Rhapsody', power: 10, acc: 1, desc: 'Bajada masiva de ataque, daño bajo', 
      baseCooldown: 4, type: 'attack', effect: { type: 'debuff', stat: 'atk', value: 15, prob: 1 ,
        duration: 2}
    } ]
},
    { id: 'Matador', name: 'Matador',  img: 'personajes/Matador.gif',  classes: ['atacante', 'soporte'], hp: 100, atk: 25, def: 10, spd: 25,
  moves: [
    { id: 'mat1', name: '<i>Espada</i>', power: 20, acc: 1, desc: 'Ataque básico, puede bajar la precisión', 
      baseCooldown: 0, type: 'attack', effect: { type:'debuff', stat:'acc', value:0.05, prob:0.85 ,
        duration: 2}
    },
    { id: 'mat2', name: 'Focus', power: 0, acc: 1.0, desc: 'Sube mucho el ataque durante 2 turnos', 
      baseCooldown: 3, type: 'attack', effect: { type:'tempAtk', value:10, duration:2 },
    },
    { id: 'mat3', name: '<i>Red Capote</i>', power: 0, acc: 1, desc: 'Se otorga escudo', 
      baseCooldown: 4, type: 'support', effect: { type:'shield', value:35 }
    },
    { id: 'mat4', name: '<i>Bloody Andalucia</i>', power: 40, acc: 1, desc: 'Daño masivo, baja la precisión', 
      baseCooldown: 5, type: 'attack', effect: { type: 'debuff', stat: 'acc', value: 0.15, prob: 1 ,
        duration: 2}
    } ]
},
     { id: 'Trumpeter', name: 'Trumpeter',  img: 'personajes/Trumpeter.gif',  classes: ['atacante', 'sanador'], hp: 100, atk: 25, def: 15, spd: 10,
  moves: [
    { id: 'tru1', name: 'Riot Gun', power: 25, acc: 0.9, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'tru2', name: 'Great Logos', power: 37, acc: 0.9, desc: 'Daño alto', 
      baseCooldown: 3, type: 'attack', effect: null
    },
    { id: 'tru3', name: 'Holy Melody', power: 0, acc: 1, desc: 'Cura muy potente', 
      baseCooldown: 3, type: 'support', effect: { type:'heal', value:33 }
    },
    { id: 'tru4', name: 'Evil Melody', power: 6666, acc: 0.33, desc: 'Instakill, muy baja precisión', 
      baseCooldown: 5, type: 'attack', effect: null
    } ]
},
     { id: 'gfamaka', name: 'Novia de Amaka',  img: 'personajes/gfamaka.jpg',  classes: ['defensor'], hp: 120, atk: 22, def: 16, spd: 9,
  moves: [
    { id: 'ama1', name: 'Beso', power: 20, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'ama2', name: 'Sexo con Amaka', power: 0, acc: 0.84, desc: 'sube def (3 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempDef', value:4, duration:3 }
    },
    { id: 'ama3', name: 'Amor carnal', power: 26, acc: 0.77, desc: 'daño moderado ', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'ama4', name: 'Tener un hijo', power: 30, acc: 0.88, desc: 'ataque fuerte', 
      baseCooldown: 6, type: 'attack', effect: { type:'debuff', stat:'spd', value:2, prob:0.7 ,
        duration: 2}
    } ]
},
     { id: 'calamardo', name: 'Calamardo(Angel)',  img: 'personajes/calamardo.jpg',  classes: ['debilitador'], hp: 86, atk: 29, def: 12, spd: 16,
  moves: [
    { id: 'cal1', name: 'Clarinete', power: 20, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: { type:'debuff', stat:'def', value:4, prob:0.4 ,
        duration: 2}
    },
    { id: 'cal2', name: 'Olvidarse de clase', power: 23, acc: 0.84, desc: 'baja atk (2 turnos)', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'atk', value:4, prob:0.6 ,
        duration: 2}
    },
    { id: 'cal3', name: 'Improvisar', power: 40, acc: 0.50, desc: '50% de fallar, mucho daño ', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'cal4', name: 'figarofigaro,FIIIGARO', power: 28, acc: 0.85, desc: 'ataque fuerte', 
      baseCooldown: 6, type: 'attack', effect: { type:'debuff', stat:'atk', value:4, prob:0.9 ,
        duration: 2}
    } ]
},
     { id: 'hatsume', name: 'Hatsune Miku',  img: 'personajes/hatsume.jpg',  classes: ['sanador', 'soporte'], hp: 98, atk: 22, def: 17, spd: 15,
  moves: [
    { id: 'hat1', name: 'Ritmo sanador', power: 0, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'support', effect: { type:'heal', value:20 }
    },
    { id: 'hat2', name: 'Nota brillante', power: 0, acc: 1.0, desc: 'sube atk (2 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempAtk', value:6, duration:2 }
    },
    { id: 'hat3', name: 'Coro hipnótico', power: 0, acc: 0.90, desc: 'se otorga un escudo ', 
      baseCooldown: 2, type: 'support', effect: { type:'shield', value:30 }
    },
    { id: 'hat4', name: 'Sinfonía estelar', power: 35, acc: 0.85, desc: 'ataque fuerte', 
      baseCooldown: 6, type: 'attack', effect: null
    } ]
},
     { id: 'zoe', name: 'Zoe Lopez',  img: 'personajes/zoe.jpeg',  classes: ['sanador', 'soporte'], hp: 113, atk: 22, def: 17, spd: 8,
  moves: [
    { id: 'zoe1', name: 'Desnudarse', power: 0, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'support', effect: { type:'heal', value:20 }
    },
    { id: 'zoe2', name: 'Mamada', power: 0, acc: 1.0, desc: 'sube spd (2 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempSpd', value:6, duration:2 }
    },
    { id: 'zoe3', name: 'Anal', power: 0, acc: 0.90, desc: 'cura y sube spd ', 
      baseCooldown: 2, type: 'support', effect: { type:'heal', value:40 }
    },
    { id: 'zoe4', name: 'Embarazo', power: 40, acc: 0.7, desc: 'Mega ataque fuerte', 
      baseCooldown: 6, type: 'attack', effect: null
    } ]
},
     { id: 'antonio', name: 'Antonio Lobato',  img: 'personajes/antonio.jpg',  classes: ['atacante'], hp: 110, atk: 32, def: 8, spd: 10,
  moves: [
    { id: 'ant1', name: 'F1', power: 20, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'ant2', name: 'Tu coche', power: 0, acc: 1.0, desc: 'da un escudo de 40', 
      baseCooldown: 2, type: 'support', effect: { type:'shield', value:40 }
    },
    { id: 'ant3', name: 'El mismísimo Antonio Lobato', power: 30, acc: 0.80, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'ant4', name: 'Hola, ¿Quieres saber cuanto ale tu coche?', power: 40, acc: 0.8, desc: 'Mega ataque fuerte', 
      baseCooldown: 6, type: 'attack', effect: null
    } ]
},
     { id: 'padrinos', name: 'Padrinos Mágicos',  img: 'personajes/padrinos.jpg',  classes: ['sanador'], hp: 100, atk: 15, def: 12, spd: 20,
  moves: [
    { id: 'pad1', name: 'curasiao', power: 0, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'support', effect: { type:'heal', value:15 }
    },
    { id: 'pad2', name: 'golpiao', power: 20, acc: 1.0, desc: 'Ataque no muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'pad3', name: 'mega curasiao', power: 0, acc: 0.80, desc: 'cura muy potente', 
      baseCooldown: 2, type: 'support', effect: { type:'heal', value:25 }
    },
    { id: 'pad4', name: 'magic heal', power: 0, acc: 0.9, desc: 'curación fuerte', 
      baseCooldown: 6, type: 'support', effect: { type:'heal', value:35 }
    } ]
},
     { id: 'nobita', name: 'Nobita Nobi',  img: 'personajes/nobita.jpg',  classes: ['soporte'], hp: 84, atk: 19, def: 14, spd: 10,
  moves: [
    { id: 'nob1', name: 'Lloriqueo', power: 20, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'nob2', name: 'Invento de Doraemon', power: 20, acc: 1.0, desc: 'buff de escudo (3 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'shield', value:25 }
    },
    { id: 'nob3', name: 'WUAAAAA DORAEMON', power: 29, acc: 0.97, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'nob4', name: '0 en el examen', power: 44, acc: 0.7, desc: 'Ulti devastadora, posible oneshot', 
      baseCooldown: 6, type: 'attack', effect: null
    } ]
},
     { id: 'hornet', name: 'Hornet',  img: 'personajes/hornet.jpg',  classes: ['atacante'], hp: 89, atk: 32, def: 9, spd: 15,
  moves: [
    { id: 'hor1', name: 'Lanza sedeña', power: 24, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'hor2', name: 'Paso ágil', power: 0, acc: 1.0, desc: 'buff de spd (3 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempSpd', value:5, duration:3 }
    },
    { id: 'hor3', name: 'Garra elongada', power: 28, acc: 0.85, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'hor4', name: 'Dardo veloz', power: 36, acc: 0.91, desc: 'Ulti potente', 
      baseCooldown: 6, type: 'attack', effect: null
    } ]
},
     { id: 'tenshi', name: 'Tenshi Fumo',  img: 'personajes/tenshi.png',  classes: ['atacante'], hp: 97, atk: 30, def: 8, spd: 15,
  moves: [
    { id: 'ten1', name: 'Slash', power: 24, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'ten2', name: 'Terremoto', power: 26, acc: 0.90, desc: 'debuff de spd', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'spd', value:3, prob:0.9 ,
        duration: 2}
    },
    { id: 'ten3', name: 'People Manipulation', power: 0, acc: 1.0, desc: 'buff de atk (2turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempAtk', value:5, duration:2 }
    },
    { id: 'ten4', name: 'Heaaven sign', power: 0, acc: 0.91, desc: 'heal full hp', 
      baseCooldown: 6, type: 'support', effect: { type:'heal', value: 20 }
    } ]
},
     { id: 'shrek', name: 'Shrek',  img: 'personajes/shrek.jpg',  classes: ['defensor', 'soporte'], hp: 120, atk: 23, def: 9, spd: 12,
  moves: [
    { id: 'shr1', name: 'ARRGH', power: 20, acc: 1.0, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'shr2', name: 'Amor platónico', power: 20, acc: 0.89, desc: 'debuff de atk (2 turnos)', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'atk', value:3, prob:0.7 ,
        duration: 2}
    },
    { id: 'shr3', name: 'PUTO ASNO VETE YA OSTIA', power: 22, acc: 0.95, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'atk', value:4, prob:0.4 ,
        duration: 2}
    },
    { id: 'shr4', name: 'OH SI FIONA', power: 32, acc: 0.91, desc: 'debuff atk', 
      baseCooldown: 6, type: 'attack', effect: { type:'debuff', stat:'atk', value:5, prob:0.7 ,
        duration: 2}
    } ]
},
     { id: 'caillou', name: 'Caillou del futuro',  img: 'personajes/caillou.jpg',  classes: ['debilitador'], hp: 100, atk: 23, def: 10, spd: 17,
  moves: [
    { id: 'cai1', name: 'cigarrillos', power: 20, acc: 0.98, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: { type:'debuff', stat:'spd', value:4, prob:0.6 ,
        duration: 2}
    },
    { id: 'cai2', name: 'Marihuana', power: 20, acc: 1.0, desc: 'debuff de def (3 turnos)', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'atk', value:4, prob:0.6 ,
        duration: 2}
    },
    { id: 'cai3', name: 'Vaporoso', power: 22, acc: 0.95, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'cai4', name: '¡CADA VEZ MÁS CALVO!', power: 40, acc: 1.0, desc: 'debuff atk y daño', 
      baseCooldown: 6, type: 'attack', effect: { type:'debuff', stat:'atk', value:9, prob:0.8 ,
        duration: 2}
    } ]
},
     { id: 'goku', name: 'Goku',  img: 'personajes/goku.jpg',  classes: ['atacante'], hp: 100, atk: 30, def: 9, spd: 12,
  moves: [
    { id: 'gok1', name: 'Puños poderosos', power: 23, acc: 0.70, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'gok2', name: 'super saiyan', power: 0, acc: 1.0, desc: 'buff para atk y spd (2 turnos)', 
      baseCooldown: 2, type: 'support', 
      effects: [ 
        { type:'tempAtk', value:5, duration:2 }, 
        { type:'tempSpd', value:4, duration:2 } 
      ]
    },
    { id: 'gok3', name: 'Poder del guión', power: 25, acc: 0.90, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack'
    },
    { id: 'gok4', name: 'HAMEAMEHA', power: 30, acc: 0.80, desc: 'Ataque extremadamente potente', 
      baseCooldown: 6, type: 'attack', effect: null
    } ]
    },
	{ id: 'dyrroth', name: 'Dyrroth',  img: 'personajes/dyrroth.jpg',  classes: ['atacante'], hp: 140, atk: 30, def: 10, spd: 11,
  moves: [
    { id: 'dyr1', name: 'Garras letales', power: 20, acc: 0.80, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'dyr2', name: 'Ira del abismo', power: 25, acc: 0.80, desc: 'Ataque no muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'dyr3', name: 'Paso del espectro', power: 30, acc: 0.98, desc: 'Ataque muy potente, reduce def', 
      baseCooldown: 2, type: 'attack', effect: { type:'debuff', stat:'def', value:4, prob:1.0 ,
        duration: 2}
    },
    { id: 'dyr4', name: 'Abysm Strike', power: 40, acc: 0.89, desc: 'Ataque extremadamente potente', 
      baseCooldown: 6, type: 'attack', effect: null } ]
    },
	{id: 'kevin', name: 'Kevin', img: 'personajes/kevin.jpeg', classes: ['atacante', 'debilitador'], hp: 90, atk: 28, def: 12, spd: 13,
  moves: [
    {id:'kev1', name: 'Glasses mortales', power: 20, acc: 1.0, desc: 'Ataque rápido', baseCooldown: 0, type:'attack'},
    {id:'kev2', name: 'Double kill', power: 28, acc: 0.89, desc: 'Daño tocho', baseCooldown: 2, type:'attack'},
    {id:'kev3', name: 'Quickily', power: 25, acc: 0.9, desc:'Daño y posible reducción SPD.', effect:{type:'debuff', stat:'spd', value:3, prob:0.25,
        duration: 2}, baseCooldown:3, type:'attack'},
    {id:'kev4', name: 'And never person', power: 40, acc: 0.80, desc: 'Desintegra al enemigo, mucho daño', baseCooldown: 6, type:'attack'}
  ]
},
    { id: 'ladybug', name: 'Lady Bug',  img: 'personajes/ladybug.jpg',  classes: ['soporte'], hp: 90, atk: 22, def: 16, spd: 14,
  moves: [
    { id: 'lad1', name: 'Yo-yo', power: 20, acc: 0.98, desc: 'Ataque básico, cura 15', 
      baseCooldown: 0, type: 'attack', 
      effects: [
        { type:'heal', value:15 }
      ]
    },
    { id: 'lad2', name: 'eres Mariquita', power: 0, acc: 1.0, desc: 'buff de heal', 
      baseCooldown: 2, type: 'support', effect: { type:'heal', value:30 }
    },
    { id: 'lad3', name: 'BITCH', power: 22, acc: 0.95, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'lad4', name: 'Purificar', power: 0, acc: 1.0, desc: 'cura', 
      baseCooldown: 6, type: 'support', effect: { type:'heal', value:50 }
    }, ]
},
   { id: 'richard', name: 'el Richard Cachas',  img: 'personajes/richard.jpg',  classes: ['defensor'], hp: 140, atk: 29, def: 20, spd: 5,
  moves: [
    { id: 'ric1', name: 'Ostión', power: 20, acc: 0.98, desc: 'Ataque básico', 
      baseCooldown: 0, type: 'attack', effect: null
    },
    { id: 'ric2', name: 'Exhibición en la fuente', power: 0, acc: 1.0, desc: 'buff de def (3 turnos)', 
      baseCooldown: 2, type: 'support', effect: { type:'tempDef', value:10, duration:3 }
    },
    { id: 'ric3', name: 'Golpe de pectorales', power: 22, acc: 0.95, desc: 'Ataque muy potente', 
      baseCooldown: 2, type: 'attack', effect: null
    },
    { id: 'ric4', name: 'SOY UN BUEN PADREEE', power: 40, acc: 1.0, desc: 'destroza todo a su paso', 
      baseCooldown: 6, type: 'attack', effect: null 
    }, ]
},
  {id: 'maka', name: 'Maka Monster', img: 'personajes/maka.jpeg', classes: ['atacante','soporte'], hp: 98, atk: 30, def: 10, spd: 16,
moves: [
  {
    id: 'mak1',
    name: 'Big Pickle',
    power: 15,
    acc: 0.97,
    desc: 'Zarpazo rápido que puede abrir una herida y provocar sangrado.',
    baseCooldown: 0,
    type: 'attack',
    effects: [
      { type: 'damageOverTime', status: 'bleed', value: 6, duration: 3, prob: 0.35 }
    ]
  },
  {
    id: 'mak2',
    name: 'Maka Skin',
    power: 25,
    acc: 0.92,
    desc: 'Su piel muta y absorbe parte del daño infligido, curando a Maka.',
    baseCooldown: 2,
    type: 'attack',
    effects: [
      { type: 'lifesteal', value: 22, duration: 1 }
    ]
  },
  {
    id: 'mak3',
    name: 'Hunter Garage',
    power: 0,
    acc: 1.0,
    desc: 'Se atrinchera en su guarida: gana un escudo y refleja parte del daño que reciba.',
    baseCooldown: 3,
    type: 'support',
    effects: [
      { type: 'shield', value: 20 },
      { type: 'reflectDamage', value: 22, duration: 2 }
    ]
  },
  {
    id: 'mak4',
    name: 'Scary People (ULT)',
    power: 48,
    acc: 0.85,
    desc: 'Un rugido devastador que aterroriza al enemigo (puede paralizarlo de miedo) y debilita su ataque.',
    baseCooldown: 6,
    type: 'attack',
    effects: [
      { type: 'fear', value: 0.45, duration: 2, prob: 0.5 },
      { type: 'debuff', stat: 'atk', value: 8, duration: 2, prob: 1.0 }
    ]
  }
] },

  {
  id: 'albedo',
  name: 'Albedo',
  img: 'personajes/Albedo.gif',
  classes: ['defensor', 'soporte', 'control'],
  hp: 150,
  atk: 25,
  def: 28,
  spd: 10,

  moves: [
    {
      id: 'alb1',
      name: 'Pilar de Muspelheim',
      power: 20,
      acc: 0.98,
      desc: 'Albedo golpea al enemigo con su guja y reduce temporalmente su velocidad.',
      baseCooldown: 0,
      type: 'attack',
      effect: {
        type: 'debuff',
        stat: 'spd',
        value: 5,
        duration: 2,
        prob: 1.0
      }
    },

    {
      id: 'alb2',
      name: 'Odio Verdadero',
      power: 26,
      acc: 0.93,
      desc: 'Albedo descarga toda su fuerza física contra el enemigo, reduciendo su ATK y SPD.',
      baseCooldown: 3,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'spd',
          value: 6,
          duration: 2,
          prob: 1.0
        }
      ]
    },

    {
      id: 'alb3',
      name: 'Supervisora de NPCs',
      power: 0,
      acc: 1.0,
      desc: 'Albedo adopta una postura defensiva, aumentando su DEF y creando un poderoso escudo.',
      baseCooldown: 4,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 8,
          duration: 3
        },
        {
          type: 'shield',
          value: 35
        }
      ]
    },

    {
      id: 'alb4',
      name: 'Presencia Opresiva',
      power: 28,
      acc: 0.94,
      desc: 'La presencia de Albedo debilita al enemigo, reduciendo su ATK, su velocidad y la cantidad de curación que puede recibir.',
      baseCooldown: 4,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'healReduction',
          value: 40,
          duration: 3
        },
        {
          type: 'slow',
          value: 20,
          duration: 2
        }
      ]
    },

    {
      id: 'alb5',
      name: 'ULTI: Guerrera de la Destrucción',
      power: 30,
      acc: 0.89,
      desc: 'Albedo libera todo su poder como Guardiana de Nazarick, debilitando al enemigo mientras se protege con una enorme resistencia.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 8,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 10,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'tempDef',
          value: 10,
          duration: 3
        },
        {
          type: 'reflectDamage',
          value: 45,
          duration: 3
        },
        {
          type: 'shield',
          value: 40
        },
        {
          type: 'selfHealPct',
          value: 0.18
        }
      ]
    }
  ]
},

  {
  id: 'vermeil',
  name: 'Vermeil',
  img: 'personajes/vermeil.jpg',
  classes: ['atacante', 'mago', 'sanador'],

  hp: 115,
  atk: 30,
  def: 13,
  spd: 16,

  moves: [
    {
      id: 'ver1',
      name: 'Dardo Místico',
      power: 22,
      acc: 0.98,
      desc: 'Vermeil dispara un proyectil de magia oscura que inflige daño directo al enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },

    {
      id: 'ver2',
      name: 'Sombra Lacerante',
      power: 24,
      acc: 0.94,
      desc: 'Vermeil corta al enemigo con energía demoníaca, debilitando sus defensas y absorbiendo parte de su fuerza vital.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        {
          type: 'debuff',
          stat: 'def',
          value: 7,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'lifesteal',
          value: 20,
          duration: 1
        }
      ]
    },

    {
      id: 'ver3',
      name: 'Velo Reconstituyente',
      power: 0,
      acc: 1.0,
      desc: 'Vermeil utiliza su magia para restaurar la vitalidad de un aliado y reforzar temporalmente su cuerpo.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        {
          type: 'heal',
          value: 28
        },
        {
          type: 'tempDef',
          value: 8,
          duration: 2
        }
      ]
    },

    {
      id: 'ver4',
      name: 'Encanto Demoníaco',
      power: 26,
      acc: 0.92,
      desc: 'Vermeil seduce al enemigo con su poder demoníaco, ralentizándolo y reduciendo la cantidad de curación que puede recibir.',
      baseCooldown: 4,
      type: 'attack',
      effects: [
        {
          type: 'slow',
          value: 25,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'healReduction',
          value: 40,
          duration: 3
        }
      ]
    },

    {
      id: 'ver5',
      name: 'Magia Vampírica',
      power: 0,
      acc: 1.0,
      desc: 'Vermeil despierta temporalmente su naturaleza demoníaca, aumentando su poder ofensivo y su capacidad de realizar golpes críticos.',
      baseCooldown: 5,
      type: 'support',
      effects: [
        {
          type: 'tempAtk',
          value: 14,
          duration: 3
        },
        {
          type: 'critChance',
          value: 20,
          duration: 3
        }
      ]
    },

    {
      id: 'ver6',
      name: 'Absorción Demoníaca',
      power: 20,
      acc: 0.91,
      desc: 'Vermeil concentra una enorme cantidad de magia oscura en un ataque que drena violentamente la vida del enemigo.',
      baseCooldown: 5,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 35,
          duration: 1
        },
        {
          type: 'debuff',
          stat: 'atk',
          value: 8,
          duration: 3,
          prob: 1.0
        }
      ]
    },

    {
      id: 'ver7',
      name: 'ULTI: Fulgor Final',
      power: 30,
      acc: 0.89,
      desc: 'Vermeil libera todo su poder demoníaco en una devastadora explosión mágica. El impacto debilita al enemigo y permite a Vermeil recuperar una gran cantidad de vida.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        {
          type: 'lifesteal',
          value: 45,
          duration: 1
        },
        {
          type: 'critChance',
          value: 25,
          duration: 1
        },
        {
          type: 'debuff',
          stat: 'def',
          value: 12,
          duration: 3,
          prob: 1.0
        },
        {
          type: 'healReduction',
          value: 50,
          duration: 4
        }
      ]
    }
  ]
},

  { id:'gal', name:'Galbrena', img:'personajes/Galbrena.png', classes:['defensor','debilitador'], hp:120, atk:24, def:14, spd:11,
    moves:[ {id:'gal1',name:'Corte Lunar',power:13,acc:0.98,desc:'Corte rápido.',baseCooldown:0, type:'attack'},
            {id:'gal2',name:'Estocada Grave',power:26,acc:0.9,desc:'Buen daño.',baseCooldown:3, type:'attack'},
            {id:'gal3',name:'Guardia firme',power:0,acc:1.0,desc:'Aumenta DEF +9 (2 turnos).',effect:{type:'tempDef',value:9,duration:2},baseCooldown:3, type:'support'},
            {id:'gal4',name:'Luna Roja (ULT)',power:46,acc:0.87,desc:'Daño y reduce ATK 5.',baseCooldown:6,effect:{type:'debuff',stat:'atk',value:5,prob:1,
        duration: 2}, type:'attack'} ] },
{
  id: 'secre',
  name: 'Secre',
  img: 'personajes/secre.jpg',
  classes: ['atacante', 'debilitador'],
  hp: 108,
  atk: 36,
  def: 11,
  spd: 24,
  moves: [
    {
      id: 'sec1',
      name: 'Aguijón',
      power: 18,
      acc: 1.0,
      desc: 'Secre ataca con un movimiento fulminante, tan rápido que a veces abre una pequeña herida.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type: 'damageOverTime', status: 'bleed', value: 4, duration: 2, prob: 0.4 }
    },
    {
      id: 'sec2',
      name: 'Sombras Cortantes',
      power: 26,
      acc: 0.94,
      desc: 'Secre golpea desde las sombras, bajando la defensa del enemigo mientras afila su propia puntería.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        { type: 'debuff', stat: 'def', value: 6, duration: 2, prob: 0.9 },
        { type: 'critChance', value: 20, duration: 2 }
      ]
    },
    {
      id: 'sec3',
      name: 'Velo Sutil',
      power: 0,
      acc: 1.0,
      desc: 'Secre se vuelve casi invisible, ganando velocidad y agresividad de golpe.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type: 'tempSpd', value: 12, duration: 2 },
        { type: 'tempAtk', value: 8, duration: 2 }
      ]
    },
    {
      id: 'sec4',
      name: 'ULTI: Niebla Asesina',
      power: 30,
      acc: 0.85,
      desc: 'Secre desaparece entre la niebla y golpea con precisión letal, desangrando al enemigo y robando su fuerza vital.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        { type: 'lifesteal', value: 30, duration: 1 },
        { type: 'damageOverTime', status: 'bleed', value: 10, duration: 3, prob: 0.85 },
        { type: 'critChance', value: 30, duration: 2 }
      ]
    }
  ]
},

{
  id: 'zora',
  name: 'Zora',
  img: 'personajes/zora.jpg',
  classes: ['soporte', 'debilitador', 'control'],
  hp: 114,
  atk: 21,
  def: 14,
  spd: 17,
  moves: [
    {
      id: 'zor1',
      name: 'Burbuja Rápida',
      power: 15,
      acc: 1.0,
      desc: 'Zora lanza una ráfaga de burbujas a presión que puede entorpecer levemente al enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type: 'slow', value: 10, duration: 1, prob: 0.3 }
    },
    {
      id: 'zor2',
      name: 'Corriente Entorpecedora',
      power: 20,
      acc: 0.95,
      desc: 'Zora envuelve al enemigo en una corriente que ralentiza sus movimientos y reduce su fuerza de ataque.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        { type: 'slow', value: 20, duration: 2, prob: 0.9 },
        { type: 'debuff', stat: 'atk', value: 5, duration: 2, prob: 0.8 }
      ]
    },
    {
      id: 'zor3',
      name: 'Aguas Calmantes',
      power: 0,
      acc: 1.0,
      desc: 'Zora envuelve a un aliado en aguas curativas y le otorga una barrera protectora.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type: 'heal', value: 22 },
        { type: 'shield', value: 16 }
      ]
    },
    {
      id: 'zor4',
      name: 'ULTI: Marea Silente',
      power: 30,
      acc: 0.88,
      desc: 'Zora invoca una marea abisal que puede congelar al enemigo en el sitio y deja su cuerpo entumecido durante varios turnos.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        { type: 'freeze', duration: 1, prob: 0.35 },
        { type: 'slow', value: 35, duration: 3, prob: 1.0 },
        { type: 'debuff', stat: 'spd', value: 8, duration: 3, prob: 1.0 }
      ]
    }
  ]
},

{
  id: 'atlantis',
  name: 'Atlantis',
  img: 'personajes/atlantis.png',
  classes: ['atacante', 'sanador'],
  hp: 118,
  atk: 34,
  def: 12,
  spd: 15,
  moves: [
    {
      id: 'att1',
      name: 'Tridente',
      power: 22,
      acc: 0.99,
      desc: 'Atlantis clava su tridente con fuerza, resquebrajando ligeramente la guardia del enemigo.',
      baseCooldown: 0,
      type: 'attack',
      effect: { type: 'debuff', stat: 'def', value: 3, duration: 1, prob: 0.3 }
    },
    {
      id: 'att2',
      name: 'Abrasamiento Marino',
      power: 30,
      acc: 0.92,
      desc: 'Atlantis arrastra al enemigo con una corriente abrasiva, recuperando parte del daño infligido como vida propia.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        { type: 'lifesteal', value: 18, duration: 1 }
      ]
    },
    {
      id: 'att3',
      name: 'Abrazo del Océano',
      power: 0,
      acc: 1.0,
      desc: 'Atlantis envuelve a un aliado en aguas sanadoras y refuerza su defensa temporalmente.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type: 'heal', value: 26 },
        { type: 'tempDef', value: 10, duration: 2 }
      ]
    },
    {
      id: 'att4',
      name: 'ULTI: Tsunami Ancestral',
      power: 36,
      acc: 0.87,
      desc: 'Atlantis desata un tsunami que arrasa a todo el equipo enemigo por igual, debilitando su defensa.',
      baseCooldown: 7,
      type: 'attack',
      aoe: true,
      effects: [
        { type: 'debuff', stat: 'def', value: 8, duration: 3, prob: 0.9 }
      ]
    }
  ]
},

{
  id: 'izumi',
  name: 'Izumi',
  img: 'personajes/izumi.jpg',
  classes: ['atacante', 'sanador'],
  hp: 120,
  atk: 30,
  def: 15,
  spd: 19,
  moves: [
    {
      id: 'izumi1',
      name: 'Mordisco Voraz',
      power: 22,
      acc: 0.98,
      desc: 'Izumi muerde al enemigo con un hambre digna de una oni, sin ningún truco de por medio.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'izumi2',
      name: 'Doble Hamburguesa',
      power: 26,
      acc: 0.95,
      desc: 'Izumi golpea con una hamburguesa en cada mano y devora parte de la fuerza vital del enemigo de paso.',
      baseCooldown: 2,
      type: 'attack',
      effects: [
        { type: 'lifesteal', value: 18, duration: 2 }
      ]
    },
    {
      id: 'izumi3',
      name: 'Festín Reparador',
      power: 0,
      acc: 1.0,
      desc: 'Izumi comparte su bolsa de comida rápida con un aliado, curando sus heridas.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type: 'heal', value: 30 }
      ]
    },
    {
      id: 'izumi4',
      name: 'ULTI: Atracón Definitivo',
      power: 34,
      acc: 0.9,
      desc: 'Izumi se lo come TODO de golpe: patatas, refrescos y hamburguesas incluidos. El subidón de azúcar le roba fuerza vital al enemigo... y le deja una tremenda indigestión.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        { type: 'lifesteal', value: 25, duration: 2 },
        { type: 'damageOverTime', status: 'poison', value: 8, duration: 3, prob: 0.8 }
      ]
    }
  ]
},

{
  id: 'typhon',
  name: 'Typhon',
  img: 'personajes/typhon.jpg',
  classes: ['debilitador', 'control', 'atacante'],
  hp: 112,
  atk: 27,
  def: 14,
  spd: 22,
  moves: [
    {
      id: 'typhon1',
      name: 'Zarpazo de Cola',
      power: 24,
      acc: 0.98,
      desc: 'Typhon golpea con su larga cola demoníaca en un movimiento rápido y directo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'typhon2',
      name: 'Mirada Hipnótica',
      power: 20,
      acc: 0.95,
      desc: 'Typhon clava su mirada seductora en el enemigo, dejándolo embelesado y a merced de sus propios aliados.',
      baseCooldown: 4,
      type: 'attack',
      effects: [
        { type: 'charm', duration: 2, prob: 0.6 }
      ]
    },
    {
      id: 'typhon3',
      name: 'Encanto Oscuro',
      power: 0,
      acc: 1.0,
      desc: 'Typhon se envuelve en un aura demoníaca que agudiza sus reflejos y afila sus garras.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type: 'tempSpd', value: 10, duration: 3 },
        { type: 'critChance', value: 15, duration: 3 }
      ]
    },
    {
      id: 'typhon4',
      name: 'ULTI: Abismo Tifónico',
      power: 32,
      acc: 0.88,
      desc: 'Typhon libera su verdadera naturaleza monstruosa, sumiendo al enemigo en un terror paralizante mientras lo arrastra al fondo del abismo.',
      baseCooldown: 7,
      type: 'attack',
      effects: [
        { type: 'fear', failChance: 0.5, duration: 2, prob: 0.85 },
        { type: 'slow', value: 30, duration: 3, prob: 1.0 }
      ]
    }
  ]
},

{
  id: 'rades_spirito',
  name: 'Rades Spirito',
  img: 'personajes/rades.jpg',
  classes: ['tanque', 'defensor'],
  hp: 125,
  atk: 24,
  def: 45,
  spd: 28,

  moves: [
    {
      id: 'rades1',
      name: 'Cadáver Nº4: Jimmy',
      power: 18,
      acc: 0.95,
      desc: 'Rades invoca un espectro que dispara una bala maldita al enemigo. Puede envenenarlo.',
      baseCooldown: 0,
      type: 'attack',
      effects: [
        { type: 'damageOverTime', status: 'poison', value: 4, duration: 2, prob: 0.5 }
      ]
    },
    {
      id: 'rades2',
      name: 'Cadáver Nº3: David',
      power: 14,
      acc: 0.92,
      desc: 'Un espectro escupe agua fangosa y venenosa sobre todo el equipo enemigo, con buena probabilidad de envenenarlos.',
      baseCooldown: 4,
      type: 'attack',
      aoe: true,
      effects: [
        { type: 'damageOverTime', status: 'poison', value: 5, duration: 3, prob: 0.75 }
      ]
    },
    {
      id: 'rades3',
      name: 'Cadáver Nº1: Carl',
      power: 0,
      acc: 1.0,
      desc: 'Carl levanta un escudo de magia espiritual que protege a un aliado y refuerza su DEF durante 2 turnos.',
      baseCooldown: 3,
      type: 'support',
      effects: [
        { type: 'shield', value: 45 },
        { type: 'tempDef', value: 8, duration: 2 }
      ]
    },
    {
      id: 'rades4',
      name: 'ULTI: Muralla de los Muertos',
      power: 0,
      acc: 1.0,
      desc: 'Rades convoca a todos sus cadáveres para formar una muralla: un aliado recibe un gran escudo y mucha DEF durante 3 turnos, y Rades recupera parte de su vida.',
      baseCooldown: 9,
      type: 'support',
      effects: [
        { type: 'shield', value: 60 },
        { type: 'tempDef', value: 12, duration: 3 },
        { type: 'selfHealPct', value: 0.15 }
      ]
    }
  ]
}
];

/* =========================================================
   PERSONAJES EXCLUSIVOS DEL MODO HISTORIA
   (no aparecen en los modos de batalla libre)
   ========================================================= */
const STORY_ONLY_CHARACTERS = [

{
  id: 'marx',
  name: 'Karl Marx',
  img: 'personajes/marx.png',
  classes: ['soporte', 'control'],
  hp: 100,
  atk: 27,
  def: 16,
  spd: 20,
  moves: [
    {
      id: 'marx1',
      name: 'Uppercut Comunista',
      power: 22,
      acc: 1,
      desc: 'Marx tira un golpe ascendente a su oponente con el poder del pueblo.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'marx2',
      name: 'Llamado Al Proletariado',
      power: 0,
      acc: 1,
      desc: 'Marx le grita a Santi que siga luchando por el proletariado, aumentando temporalmente su DEF y SPD.',
      baseCooldown: 2,
      type: 'support',
      effects: [
        {
          type: 'tempDef',
          value: 6,
          duration: 3
        },
        {
          type: 'tempSpd',
          value: 6,
          duration: 3
        }
      ]
    }
  ]
},
{
  id: 'astolfo',
  name: 'Astolfo',
  img: 'personajes/astolfo.png',
  classes: ['soporte', 'sanador'],
  hp: 90,
  atk: 20,
  def: 16,
  spd: 25,
  moves: [
    {
      id: 'astolfo1',
      name: 'Gancho Mariposa',
      power: 20,
      acc: 1,
      desc: 'Astolfo ataca al oponente con todas sus fuerzas.',
      baseCooldown: 0,
      type: 'attack',
      effect: null
    },
    {
      id: 'astolfo2',
      name: 'Besito De Apoyo',
      power: 0,
      acc: 1,
      desc: 'Astolfo da un beso en la mejilla a Santi para animarle y curarle.',
      baseCooldown: 2,
      type: 'support',
      effect: {
        type: 'heal',
        value: 16
      }
    }
  ]
}

];
