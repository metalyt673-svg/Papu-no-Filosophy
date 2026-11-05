/* notas-parche.js — NOTAS DE PARCHE (datos + pantalla)
   Se carga desde juego.html con <script src="notas-parche.js" defer></script>.
   La pantalla (HTML) sigue en juego.html (#patchnotes-screen) y los estilos en notas-parche.css.
   Para publicar un parche solo tienes que añadir una entrada AL PRINCIPIO de PATCH_NOTES. */

/* ============================================================
   NOTAS DE PARCHE
   Añade aquí una entrada nueva cada vez que hagas un parche.
   Pon las entradas más recientes AL PRINCIPIO del array.
   type puede ser: 'buff' | 'nerf' | 'ajuste' | 'nuevo' | 'bug'
   ============================================================ */
const PATCH_NOTES = [

{
  version: 'v1.12',
  date: '05/11/26',
  summary: 'REVAMP de Shiori Novella: pasa a ser una soporte-debilitadora mucho más sólida, con pasiva propia, habilidades más fiables y dos efectos que no funcionaban arreglados.',
  changes: [
{ type: 'nuevo',  target: 'Shiori - Pasiva: Nota al Margen', desc: 'NUEVA. Al recibir un ataque, tiene un 50% de probabilidad de reducir el ATK del atacante en 4 durante 2 turnos.' },
{ type: 'buff',   target: 'Shiori - Estadísticas base', desc: 'VIDA aumentada de 100 a 112, DEF de 14 a 16 y VEL de 15 a 17. ATQ sin cambios (22).' },
{ type: 'buff',   target: 'Shiori - Maldición del Relato', desc: 'Poder aumentado de 18 a 20, reducción de ATQ de 5 a 6 y cooldown reducido de 2 a 1 turno.' },
{ type: 'buff',   target: 'Shiori - Libro del Destino', desc: 'Antes: +7 ATQ durante 2 turnos. Ahora: +8 ATQ durante 3 turnos y además otorga 12 de escudo al aliado.' },
{ type: 'buff',   target: 'Shiori - Historia Prohibida', desc: 'Poder aumentado de 24 a 26 y ahora además reduce la precisión del enemigo un 10% durante 2 turnos.' },
{ type: 'buff',   target: 'Shiori - Control Narrativo', desc: 'Reducción de VEL aumentada de 6 a 8 y su duración de 2 a 3 turnos. Precisión de 90% a 95% y cooldown de 4 a 3 turnos.' },
{ type: 'bug',    target: 'Shiori - Perspicacia de la Bibliotecaria', desc: 'Corregido: el efecto no se aplicaba correctamente. Ahora funciona y además mejora: +8 DEF y +5 VEL durante 3 turnos (antes +6 DEF y +4 VEL durante 2).' },
{ type: 'bug',    target: 'Shiori - ULTI: Capítulo Final', desc: 'Corregido: el daño extra contra enemigos con debuffs no se aplicaba. Ahora tiene 32 de poder (antes 40) y siempre reduce la DEF (-8) y el ATQ (-6) del enemigo durante 3 turnos.' }
  ]
},


{
  version: 'v1.11',
  date: '03/11/26',
  summary: 'REVAMP de Mereoleona: deja de ser una atacante frágil y pasa a ser una tanque versátil que castiga a quien la golpea.',
  changes: [
{ type: 'nuevo',  target: 'Mereoleona - Pasiva: Sangre de León Ardiente', desc: 'NUEVA. Cada vez que recibe daño, quema a todos los enemigos: -5 de vida por turno durante 2 turnos.' },
{ type: 'ajuste', target: 'Mereoleona - Rol', desc: 'Clases de Atacante / Mago a Tanque / Atacante / Mago.' },
{ type: 'ajuste', target: 'Mereoleona - Estadísticas base', desc: 'VIDA aumentada de 142 a 168, DEF de 23 a 30. ATQ reducido de 27 a 24 y VEL de 24 a 22.' },
{ type: 'nerf',   target: 'Mereoleona - Calidos Brachium', desc: 'Poder reducido de 20 a 18, pero su cooldown baja de 2 a 1 turno.' },
{ type: 'ajuste', target: 'Mereoleona - Mana Zone', desc: 'Antes: +11 ATQ durante 3 turnos. Ahora: +8 ATQ durante 3 turnos y además gana 18 de escudo.' },
{ type: 'buff',   target: 'Mereoleona - Encarnación del Infierno', desc: 'Antes: +10 DEF durante 3 turnos. Ahora: +12 DEF y refleja un 20% del daño recibido durante 3 turnos.' },
{ type: 'ajuste', target: 'Mereoleona - ULTI: Purgatory Abyss', desc: 'Antes: 24 de poder a un solo enemigo y -8 ATQ. Ahora: 20 de poder en área (todos los enemigos), -6 ATQ y 20 de escudo para Mereoleona.' }
  ]
},
 

{
  version: 'v1.10',
  date: '06/10/26',
  summary: 'REWORK a varios personajes "magos" que hacían daño excesivo y nerf directo a otros personajes. NUEVOS PERSONAJES Y NUEVAS MECÁNICAS.',
  changes: [
{
  type: 'ajuste',
  target: 'Implacable',
  desc: 'Daño reducido y buffs aumentados para encajar más en el rol de soporte.'
},
{
  type: 'ajuste',
  target: 'Dizzy',
  desc: 'Ahora sus habilidades pueden congelar al coste de menos daño.'
},
{
  type: 'ajuste',
  target: 'Hsin',
  desc: 'Más habilidades con quemadura al coste de menos daño.'
},
{
  type: 'ajuste',
  target: 'Ellie',
  desc: 'La habilidad "Miedo Despertado" ya no hace daño, ahora aplica el estado de miedo al oponente.'
},
{
  type: 'ajuste',
  target: 'Isaac',
  desc: 'Ataque reducido y más cooldown en su habilidad "Urano", al coste de poder usar su habilidad "Tecla R" más de una vez por partida.'
},
{
  type: 'nuevo',
  target: 'Nuevos personajes',
  desc: 'Nueva tanda de personajes: Y.V, Doblilete, Blizzaria, Ryuk, Pifiasus, Cantonio, Tyrat, Buhu, Horror, entre otros.'
},
{
  type: 'nuevo',
  target: 'Desafío: Equipo Temático',
  desc: 'Nuevo modo de juego en el modo desafío: equipo temático. Solo puedes escoger tu equipo de un grupo determinado de personajes.'
},
{
  type: 'nuevo',
  target: 'Nuevo modo de juego: Torneo',
  desc: 'En el torneo, podrás enfrentarte continuamente a varios bots que aprenden de tu forma de jugar e incrementar en dificultad entre más lejos llegues.'
},
{
  type: 'nuevo',
  target: 'Registro mejorado',
  desc: 'Ahora el registro de batalla es mucho más claro. Puedes filtrar por tus acciones, las acciones del enemigo, los momentos clave, y hasta compartir tu registro con quien quieras.'
},
{
  type: 'nuevo',
  target: 'Previsualización de daño',
  desc: 'Ahora, todas las habilidades que hagan daño al oponente te enseñarán el daño estimado que harán, la precisión de estos, y si este ataque matará al enemigo.'
},
{
  type: 'nuevo',
  target: 'Comparar personajes',
  desc: 'Hay una nueva opción en el glosario para comparar dos personajes de tu elección, ves sus stats lado a lado y decides cuál te gusta más.'
},
{
  type: 'nuevo',
  target: 'Equipos',
  desc: 'Puedes guardar tus equipos favoritos para las batallas y ponertelos rápidamente cuando quieras.'
}
  ]
},

{
  version: 'v1.9',
  date: '04/10/26',
  summary: 'Aizen recibe daño AoE, balance general y nuevas funciones multijugador',
  changes: [
{
  type: 'Factos',
  target: 'Para el Presi',
  desc: 'Modo historia 2 es zzz.'
},
{
  type: 'ajuste',
  target: 'Aizen',
  desc: 'Aizen ahora cuenta con daño AoE (área de efecto), permitiéndole golpear a varios enemigos con sus habilidades.'
},
{
  type: 'ajuste',
  target: 'Balance general',
  desc: 'Se han balanceado varios personajes de forma general, ajustando estadísticas, daño, defensas, cooldowns y efectos de diferentes habilidades.'
},
{
  type: 'nuevo',
  target: 'Perfil de jugador',
  desc: 'Ahora cada jugador cuenta con su propio perfil, preparado para mostrar información y estadísticas del jugador.'
},
{
  type: 'nuevo',
  target: 'Modo Multijugador',
  desc: 'Se ha añadido un nuevo modo Multijugador que permite enfrentarse a otros jugadores en combates PvP.'
},
{
  type: 'ajuste',
  target: 'Sistema de combate',
  desc: 'Se han realizado mejoras generales en el sistema de combate y en la sincronización de las partidas multijugador.'
}
  ]
},

{
  version: 'v1.8',
  date: '27/09/26',
  summary: 'nerf a Fern, Zagred y Albedo',
  changes: [
{ type: 'nerf', target: 'Fern - Estadísticas base', desc: 'ATQ reducido de 36 a 28.' },
{ type: 'nerf', target: 'Fern - Zoltraak', desc: 'Poder reducido de 31 a 20.' },
{ type: 'nerf', target: 'Fern - Niebla Venenosa', desc: 'Duración del veneno de 4 a 3 turnos.' },
{ type: 'nerf', target: 'Fern - Supresión Mágica', desc: 'Poder reducido de 34 a 24.' },
{ type: 'nerf', target: 'Fern - ULTI: Zoltraak de Alta Velocidad', desc: 'Poder reducido de 78 a 30, efecto de veneno reducido de 14 a 5.' },
{ type: 'nerf', target: 'Zagred - Estadísticas base', desc: 'ATQ reducido de 37 a 26.' },
{ type: 'nerf', target: 'Albedo - Pilar de Muspelheim', desc: 'poder reducido de 30 a 20.' },
{ type: 'nerf', target: 'Albedo - Odio Verdadero', desc: 'poder reducido de 36 a 26.' },
{ type: 'ajuste', target: 'Albedo - Habilidades', desc: 'número de habilidades reducidas de 7 a 5.' },
{ type: 'nerf', target: 'Liebe - Estadísticas base', desc: 'ATQ reducido de 41 a 27.' },
{ type: 'nerf', target: 'Liebe - Corte Antimagia', desc: 'poder reducido de 30 a 20.' },
{ type: 'nerf', target: 'Liebe - ULTI: Liberación de la Antimagia', desc: 'poder reducido de 56 a 30.' },
{ type: 'nerf', target: 'Zagred - ULTI: Decreto del Inframundo', desc: 'Poder reducido de 52 a 30.' }
  ]
},

{
	version: 'v1.7',
	date: '26/09/26',
	summary: `NUEVO PERSONAJE: ANKHA, la famosa gata de Animal Crossing, se une al plantel como un personaje especializado en control y debilitamiento. ⚔️ Habilidades:

Maldición Egipcia — Ataca al enemigo y reduce su ATK.
Mirada de Faraona — Ralentiza al enemigo y reduce temporalmente su DEF.
Bendición del Nilo — Aumenta temporalmente el ATK y DEF de Ankha.
ULTI: Juicio de Anubis — Un poderoso ataque que reduce la DEF, ralentiza al enemigo y permite a Ankha recuperar parte de su vida.

Rol

Mago / Control / Debilitador`
},

{
    version: 'v1.6',
    date: '24/09/2026',
    summary: 'Nicktula golpeaba con su ULTI en vez de curar y obtener ventajas sobre un aliado. Nerf a Stocking por su gran daño exagerado.',
    changes: [
      { type:'ajuste', target:'Nicktula — TÉCNICA DEFINITIVA: Y ENTONCES... ¡¡OCURRIÓ!!', desc:'Poder reducido de 30 a 0, para que se puedan aplicar estos cambios.' },
      { type:'nerf', target:'Stocking Anarchy — Stripe I', desc:'Poder reducido de 32 a 20.' },
      { type:'nerf', target:'Stocking Anarchy — Estadísticas base', desc:'ATQ reducido de 40 a 28.' },
      { type:'nerf', target:'Stocking Anarchy — Dark Slash', desc:'Poder reducido de 30 a 25, efecto de sangrado reducido de 8 a 6.' },
      { type:'nerf', target:'Stocking Anarchy — Sweet Temptation', desc:'Poder reducido de 26 a 22, slow reducido de 25 a 10.' },
      { type:'nerf', target:'Stocking Anarchy — ULTI: Double Trouble', desc:'Poder reducido de 82 a 30, efecto de Def de 13 a 7, efecto sangrado de 12 a 6.' }
    ]
  },


{
    version: 'v1.5',
    date: '24/09/2026',
    summary: 'Griffith dominaba demasiado el ritmo inicial de las partidas gracias a su alta velocidad y daño consistente. Se reduce su capacidad de actuar primero, a cambio de un uso más frecuente de su golpe básico.',
    changes: [
      { type:'nerf', target:'Griffith — Estadísticas base', desc:'ATQ reducido de 30 a 27.' },
      { type:'nerf', target:'Griffith — Estadísticas base', desc:'VEL reducida drásticamente de 34 a 19.' },
      { type:'nerf', target:'Griffith — Estocada Relámpago', desc:'Poder reducido de 22 a 20.' },
      { type:'ajuste', target:'Griffith — Estocada Relámpago', desc:'Cooldown base reducido de 2 a 0 turnos, permitiendo usarla en cada turno.' },
      { type:'nerf', target:'Griffith — Presencia de Femto', desc:'Poder reducido de 22 a 20.' },
      { type:'nerf', target:'Griffith — ULTI: Eclipse', desc:'La reducción de VEL aplicada al enemigo baja de 8 a 6.' }
    ]
  },

  

  // Ejemplo — puedes borrar o editar esta entrada de muestra:
  // {
  //   version: 'v1.4',
  //   date: '24/09/2026',
  //   summary: 'Ajustes de equilibrio tras la primera ronda de partidas.',
  //   changes: [
  //     { type:'buff',  target:'Nombre del personaje', desc:'Su ataque X ahora hace un 15% más de daño.' },
  //     { type:'nerf',  target:'Otro personaje',       desc:'Se ha reducido la duración del stun de 2 a 1 turno.' },
  //     { type:'ajuste',target:'Otro más',             desc:'Su curación ahora también quita "sangrado".' },
  //     { type:'nuevo', target:'Personaje nuevo',      desc:'Se ha añadido al roster.' }
  //   ]
  // },
];

const PATCH_BADGES = {
  buff:   { label: '⬆️ Buff',   cls: 'buff'   },
  nerf:   { label: '⬇️ Nerf',   cls: 'nerf'   },
  ajuste: { label: '⚖️ Ajuste', cls: 'ajuste' },
  nuevo:  { label: '✨ Nuevo',  cls: 'nuevo'  },
  bug:    { label: '🐞 Fix',    cls: 'bug'    }
};

function renderPatchNotes(){
  const cont = document.getElementById('patchnotes-list');
  cont.innerHTML = '';

  if(!PATCH_NOTES.length){
    const empty = document.createElement('div');
    empty.className = 'patchnotes-empty';
    empty.textContent = 'Todavía no hay notas de parche publicadas. ¡Vuelve pronto!';
    cont.appendChild(empty);
    return;
  }

  PATCH_NOTES.forEach(patch => {
    const entry = document.createElement('div');
    entry.className = 'patch-entry';

    const header = document.createElement('div');
    header.className = 'patch-entry-header';
    const version = document.createElement('span');
    version.className = 'patch-version';
    version.textContent = patch.version || '';
    header.appendChild(version);
    if(patch.date){
      const date = document.createElement('span');
      date.className = 'patch-date';
      date.textContent = patch.date;
      header.appendChild(date);
    }
    entry.appendChild(header);

    if(patch.summary){
      const summary = document.createElement('p');
      summary.className = 'patch-summary';
      summary.textContent = patch.summary;
      entry.appendChild(summary);
    }

    (patch.changes || []).forEach(change => {
      const row = document.createElement('div');
      row.className = 'patch-change';

      const badgeInfo = PATCH_BADGES[change.type] || { label: change.type, cls: 'ajuste' };
      const badge = document.createElement('span');
      badge.className = 'patch-badge ' + badgeInfo.cls;
      badge.textContent = badgeInfo.label;
      row.appendChild(badge);

      const body = document.createElement('div');
      body.className = 'patch-change-body';
      if(change.target){
        const target = document.createElement('div');
        target.className = 'patch-change-target';
        target.textContent = change.target;
        body.appendChild(target);
      }
      const desc = document.createElement('div');
      desc.className = 'patch-change-desc';
      desc.textContent = change.desc || '';
      body.appendChild(desc);
      row.appendChild(body);

      entry.appendChild(row);
    });

    cont.appendChild(entry);
  });
}

function openPatchNotes(){
  document.getElementById('main-menu').style.display = 'none';
  document.getElementById('patchnotes-screen').style.display = 'flex';
  renderPatchNotes();
}

function closePatchNotes(){
  document.getElementById('patchnotes-screen').style.display = 'none';
  document.getElementById('main-menu').style.display = 'flex';
}

document.getElementById('menu-patchnotes').addEventListener('click', openPatchNotes);
document.getElementById('patchnotes-back').addEventListener('click', closePatchNotes);
