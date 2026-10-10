/* tutorial.js
   Tutorial interactivo de Batalla Mejorada.

   Qué hace:
     - Añade el botón "🎓 Tutorial interactivo" al menú principal.
     - Enseña lo esencial PRACTICANDO en un combate guiado de 3 vs 3 (con
       personajes de entrenamiento): estadísticas, iniciativa (SPD), atacar,
       cooldowns, escudos y apoyos, debufos, cambiar de personaje gratis, KOs
       y victoria. Después: estados y efectos, reglas clave, mini test y un
       resumen de los modos de juego con botones para ir directo a ellos.
     - Incluye cajas 📦, gloria y rangos (inventario.js y perfil.js) y accesos
       directos a los modos que existan en tu menú.
     - Cada paso bloquea lo que no toca y resalta lo que hay que pulsar, así
       que es imposible perderse. Se puede ir atrás, repetir un paso o salir.

   No modifica game.js ni el estado real del juego: el combate de práctica
   tiene su propio motor (simplificado: sin aleatoriedad) y se pinta en una
   capa aparte. Solo toca el menú para añadir su botón.

   INSTALACIÓN (juego.html), después del resto de scripts:
       <script src="tutorial.js" defer></script>

   Progreso: localStorage 'batalla-tutorial' (solo recuerda si ya lo completaste
   para quitar el aviso "¡Empieza aquí!"). Para abrirlo por código: TUTORIAL.open()
*/
(function () {
  'use strict';

  const KEY = 'batalla-tutorial';
  const DMG_MULT = 0.7;                    // el mismo multiplicador que el juego real
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* =====================================================================
     MOTOR DE PRÁCTICA (puro, sin DOM): estado JSON-seguro para poder
     guardar/restaurar instantáneas al ir atrás o repetir un paso.
     ===================================================================== */
  const MOVES = {
    quick:  { name: 'Golpe rápido',  type: 'attack',  power: 15, cd: 0, desc: 'Ataque básico. Sin espera: siempre disponible.' },
    heavy:  { name: 'Golpe fuerte',  type: 'attack',  power: 30, cd: 3, desc: 'Mucho daño, pero luego tarda 3 turnos en volver a estar listo.' },
    shield: { name: 'Escudo de luz', type: 'support', shield: 25, cd: 3, desc: 'Apoyo: das 25 de escudo a un aliado a tu elección.' },
    weaken: { name: 'Mirada débil',  type: 'attack',  power: 8, cd: 2, debuff: { stat: 'atk', value: 6, turns: 3 },
              desc: 'Poco daño, pero baja el ATK del rival (−6) durante 3 turnos.' },
    ram:    { name: 'Embestida',     type: 'attack',  power: 14, cd: 0, desc: 'Ataque básico del Guardián.' },
    wall:   { name: 'Muralla',       type: 'support', shield: 30, cd: 3, desc: 'Apoyo: das 30 de escudo a un aliado.' },
    zap:    { name: 'Rayo suave',    type: 'attack',  power: 12, cd: 0, desc: 'Ataque básico de la Sanadora.' },
    heal:   { name: 'Curación',      type: 'support', heal: 30, cd: 3, desc: 'Apoyo: curas 30 HP a un aliado.' },
    foe:    { name: 'Golpe de práctica', type: 'attack', power: 14, cd: 0, desc: '' }
  };

  const mk = (o, ids) => Object.assign({ shield: 0, fx: [] }, o, { moves: (ids || []).map(id => ({ id, cd: 0 })) });

  function newBattle() {
    return {
      heroes: [
        mk({ key: 'apr', name: 'Espadachín', emoji: '🗡️', cls: 'Atacante', maxHp: 100, hp: 100, atk: 22, def: 14, spd: 22 }, ['quick', 'heavy', 'shield', 'weaken']),
        mk({ key: 'gua', name: 'Guardián', emoji: '🛡️', cls: 'Defensor', maxHp: 120, hp: 120, atk: 16, def: 22, spd: 12 }, ['ram', 'wall']),
        mk({ key: 'san', name: 'Sanadora', emoji: '💊', cls: 'Sanador',  maxHp: 90,  hp: 90,  atk: 14, def: 14, spd: 16 }, ['zap', 'heal'])
      ],
      foes: [80, 40, 40].map((hp, i) =>
        mk({ key: 'foe' + i, name: 'Muñeco ' + (i + 1), emoji: '🎯', cls: 'Entrenamiento', maxHp: hp, hp, atk: 16, def: 15, spd: 10 }, ['foe'])),
      ha: 0, fa: 0, turn: 'hero', turnN: 1, log: [], over: null
    };
  }

  const effStat = (u, stat) => Math.max(1, u[stat] - u.fx.filter(f => f.stat === stat).reduce((s, f) => s + f.value, 0));
  const dmgCalc = (power, atk, def) => Math.max(1, Math.round(Math.round(power * atk / def) * DMG_MULT));
  const L = (B, msg) => { B.log.unshift(msg); if (B.log.length > 8) B.log.pop(); };

  function hit(att, tgt, power) {
    const raw = dmgCalc(power, effStat(att, 'atk'), effStat(tgt, 'def'));
    const absorbed = Math.min(tgt.shield, raw);
    tgt.shield -= absorbed;
    const real = raw - absorbed;
    tgt.hp = Math.max(0, tgt.hp - real);
    return { raw, absorbed, real };
  }

  function koCheck(B, side, out) {
    const team = side === 'foe' ? B.foes : B.heroes;
    const k = side === 'foe' ? 'fa' : 'ha';
    const u = team[B[k]];
    if (u.hp > 0) return;
    out.push({ t: 'ko', side, name: u.name });
    L(B, `💀 ${u.name} ha sido derrotado.`);
    const n = team.findIndex(x => x.hp > 0);
    if (n < 0) {
      B.over = side === 'foe' ? 'win' : 'lose';
      out.push({ t: B.over });
      L(B, B.over === 'win' ? '🏆 ¡Has derrotado a los 3 rivales!' : '☠️ Te han derrotado a los 3.');
    } else {
      B[k] = n;
      out.push({ t: 'enter', side, name: team[n].name });
      L(B, `➡️ ${team[n].name} entra al combate (automático).`);
    }
  }

  function tickFx(u) { u.fx.forEach(f => f.turns--); u.fx = u.fx.filter(f => f.turns > 0); }

  function heroAct(B, moveId, targetIdx) {
    const out = [];
    if (B.over || B.turn !== 'hero') return out;
    const u = B.heroes[B.ha];
    const slot = u.moves.find(m => m.id === moveId);
    const def = MOVES[moveId];
    if (!slot || !def || slot.cd > 0 || u.hp <= 0) return out;

    if (def.type === 'attack') {
      const f = B.foes[B.fa];
      const r = hit(u, f, def.power);
      out.push({ t: 'attack', side: 'hero', move: moveId, who: u.name, target: f.name, raw: r.raw, absorbed: r.absorbed, real: r.real });
      L(B, `${u.name} usa ${def.name}: −${r.real} HP a ${f.name}.`);
      if (def.debuff && f.hp > 0) {
        const cur = f.fx.find(x => x.stat === def.debuff.stat);
        if (cur) { cur.value = Math.max(cur.value, def.debuff.value); cur.turns = Math.max(cur.turns, def.debuff.turns); }
        else f.fx.push({ stat: def.debuff.stat, value: def.debuff.value, turns: def.debuff.turns });
        out.push({ t: 'debuff', target: f.name, stat: def.debuff.stat, value: def.debuff.value, turns: def.debuff.turns });
        L(B, `⬇️ ${f.name}: ${def.debuff.stat.toUpperCase()} −${def.debuff.value} durante ${def.debuff.turns} turnos.`);
      }
    } else {
      const t = B.heroes[targetIdx == null ? B.ha : targetIdx];
      if (!t || t.hp <= 0) return out;
      if (def.shield) {
        t.shield += def.shield;
        out.push({ t: 'shield', move: moveId, who: u.name, target: t.name, value: def.shield });
        L(B, `${u.name} usa ${def.name}: ${t.name} gana ${def.shield} de escudo.`);
      }
      if (def.heal) {
        const before = t.hp;
        t.hp = Math.min(t.maxHp, t.hp + def.heal);
        out.push({ t: 'heal', move: moveId, who: u.name, target: t.name, value: t.hp - before });
        L(B, `${u.name} usa ${def.name}: ${t.name} recupera ${t.hp - before} HP.`);
      }
    }
    if (def.cd > 0) slot.cd = def.cd;
    koCheck(B, 'foe', out);
    if (!B.over) { tickFx(u); B.turn = 'foe'; }
    return out;
  }

  function foeAct(B) {
    const out = [];
    if (B.over || B.turn !== 'foe') return out;
    const f = B.foes[B.fa], h = B.heroes[B.ha];
    const r = hit(f, h, MOVES.foe.power);
    out.push({ t: 'attack', side: 'foe', who: f.name, target: h.name, raw: r.raw, absorbed: r.absorbed, real: r.real });
    L(B, `${f.name} te ataca: −${r.real} HP a ${h.name}` + (r.absorbed ? ` (el escudo absorbió ${r.absorbed})` : '') + '.');
    koCheck(B, 'hero', out);
    if (!B.over) {
      tickFx(f);
      B.turn = 'hero';
      B.turnN++;
      B.heroes.forEach(x => x.moves.forEach(m => { if (m.cd > 0) m.cd--; }));   // los cooldowns bajan al empezar tu turno
    }
    return out;
  }

  function swapTo(B, idx) {
    const out = [];
    if (B.over || B.turn !== 'hero') return out;
    const t = B.heroes[idx];
    if (!t || t.hp <= 0 || idx === B.ha) return out;
    const from = B.heroes[B.ha].name;
    B.ha = idx;
    out.push({ t: 'swap', from, to: t.name });
    L(B, `🔁 Cambias a ${t.name} (no consume turno).`);
    return out;
  }

  /* =====================================================================
     PASOS
     view: 'panel' (contenido) | 'battle' (combate de práctica)
     gate: qué se puede pulsar (moves: ids permitidos; swap: bool)
     task: { label, match(evento) }  -> el paso se completa al cumplirse
     ===================================================================== */
  const num = n => `<b>${n}</b>`;
  const evFind = (evs, pred) => evs.find(pred);

  const STEPS = [
    { id: 'welcome', view: 'panel', title: '¡Bienvenido a Batalla Mejorada!', render: () => `
        <p class="tt-lead">En unos 5 minutos sabrás jugar. Aprenderás <b>practicando</b>, no leyendo: en cada paso te diré qué pulsar.</p>
        <div class="tt-cards">
          <div class="tt-card"><div class="tt-ico">🎯</div><h4>Objetivo</h4><p>Deja sin vida a los <b>3 personajes</b> del rival antes de que ellos acaben con los tuyos.</p></div>
          <div class="tt-card"><div class="tt-ico">🧩</div><h4>Equipos de 3</h4><p>Cada bando tiene 3 personajes: <b>1 activo</b> peleando y <b>2 en reserva</b>.</p></div>
          <div class="tt-card"><div class="tt-ico">⏱️</div><h4>Por turnos</h4><p>En tu turno usas <b>1 habilidad</b>. Luego le toca al rival, y así hasta que alguien caiga.</p></div>
        </div>
        <div class="tt-team">
          <div class="tt-mini"><span>🗡️</span><b>Espadachín</b><small>Atacante</small></div>
          <div class="tt-mini"><span>🛡️</span><b>Guardián</b><small>Defensor</small></div>
          <div class="tt-mini"><span>💊</span><b>Sanadora</b><small>Sanador</small></div>
        </div>
        <p class="tt-note">Estos son tus 3 personajes de práctica. En el juego real elegirás los tuyos entre muchísimos.</p>` },

    { id: 'team', view: 'panel', title: 'Cómo armar tu equipo', render: () => `
        <p class="tt-lead">Antes de pelear eliges <b>3 personajes</b> (botón «Ver todos» o «Elegir por clase») y pulsas <b>Comenzar batalla</b>. Toca cada clase para ver para qué sirve:</p>
        <div class="tt-cards tt-classes">${[
          ['🗡️', 'Atacante', 'Hace mucho daño directo. Suele ser frágil.'],
          ['🛡️', 'Defensor', 'Aguanta golpes (mucha vida o DEF) y protege al equipo.'],
          ['💊', 'Sanador', 'Cura y recupera a los aliados.'],
          ['⚙️', 'Soporte', 'Da bufos, escudos y utilidades al equipo.'],
          ['☠️', 'Debilitador', 'Rebaja al rival: debufos y daño continuo.'],
          ['🧙‍♀️', 'Mago', 'Daño con habilidades, a menudo contra varios rivales.'],
          ['🤖', 'Control', 'Aturde, congela o ralentiza para quitarle el turno al rival.']
        ].map(c => `<button class="tt-card tt-flip" data-act="flip"><div class="tt-ico">${c[0]}</div><h4>${c[1]}</h4><p class="tt-hid">${c[2]}</p></button>`).join('')}</div>
        <div class="tt-tip">💡 <b>Truco:</b> un equipo equilibrado suele llevar uno que dañe, uno que aguante y uno que ayude. Las clases son orientativas: cada personaje es distinto, mira su ficha en el <b>📖 Glosario</b>.</div>` },

    { id: 'screen', view: 'battle', title: 'La pantalla de combate', markers: true, gate: { moves: [], swap: false }, auto: true,
      text: () => `Esta es la pantalla donde se juega. Fíjate en las 4 zonas numeradas:
        <ol class="tt-ol">
          <li><b>① Barra de vida</b>: lo que le queda a cada personaje. A 0, queda KO.</li>
          <li><b>② Estadísticas y efectos</b>: sus números y los bufos/debufos que lleva.</li>
          <li><b>③ Habilidades</b>: lo que puedes hacer en tu turno, y el botón de cambiar personaje.</li>
          <li><b>④ Registro</b>: cuenta lo que ha pasado en cada turno.</li>
        </ol>
        Arriba verás tu personaje activo y debajo a los de reserva.` },

    { id: 'stats', view: 'battle', title: 'Las estadísticas', gate: { moves: [], swap: false },
      text: () => `Cada personaje tiene 4 números. <b>Tócalos</b> en el panel de tu Espadachín (zona ②) para ver qué hacen.`,
      task: { label: () => `Toca HP, ATK, DEF y SPD (${Math.min(4, S.clicks.size)}/4)`, kind: 'stats' },
      feedback: () => `Resumen: el daño de un golpe es aproximadamente <b>Poder × ATK ÷ DEF</b> (y un poco menos, ×0,7). Por eso un atacante con mucho ATK pega fuerte y un defensor con mucha DEF recibe poco. <i>En el juego real, además, el daño varía un ±15%.</i>` },

    { id: 'speed', view: 'battle', title: 'Quién actúa primero', gate: { moves: [], swap: false }, auto: true, pulse: 'spd',
      text: B => `La <b>SPD</b> decide el orden. Tu Espadachín tiene SPD ${num(B.heroes[B.ha].spd)} y el Muñeco ${num(B.foes[B.fa].spd)}: <b>tú actúas primero</b>.<br><br>
        Al terminar cada ronda (los dos habéis actuado) se vuelve a comparar la SPD <i>actual</i>: los bufos de velocidad y efectos como <b>ralentizar</b> cuentan, así que el orden puede cambiar durante el combate.` },

    { id: 'attack', view: 'battle', title: 'Tu primer ataque', gate: { moves: ['quick'], swap: false },
      text: () => `Es tu turno. Abajo tienes las habilidades del Espadachín. Empieza con la más sencilla.`,
      task: { label: () => 'Pulsa «Golpe rápido»', match: e => e.t === 'attack' && e.side === 'hero' && e.move === 'quick' },
      feedback: evs => {
        const h = evFind(evs, e => e.t === 'attack' && e.side === 'hero'), f = evFind(evs, e => e.t === 'attack' && e.side === 'foe');
        return `Hiciste ${num(h.real)} de daño (la barra del Muñeco bajó). ${f ? `Y él te respondió con ${num(f.real)}: es su turno, luego vuelve el tuyo.` : ''}<br>
          <i>Ojo: algunos golpes pueden ser <b>críticos</b> (⚡ 8% de base, daño ×1,5) y las habilidades con precisión baja pueden <b>fallar</b>.</i>`;
      } },

    { id: 'cooldown', view: 'battle', title: 'Habilidades con espera (cooldown)', gate: { moves: ['heavy'], swap: false },
      text: () => `Las habilidades potentes no se pueden usar sin parar. Prueba el <b>Golpe fuerte</b> y mira su botón después.`,
      task: { label: () => 'Pulsa «Golpe fuerte»', match: e => e.t === 'attack' && e.side === 'hero' && e.move === 'heavy' },
      feedback: evs => {
        const h = evFind(evs, e => e.t === 'attack' && e.side === 'hero');
        return `¡${num(h.real)} de daño! Pero mira: el botón ahora marca <b>CD:3</b> y está bloqueado. Ese número son los <b>turnos tuyos</b> que faltan para que vuelva a estar <b>«Listo»</b>; baja 1 en cada turno.<br>
          Estrategia: usa el ataque fuerte cuando esté listo y las habilidades sin espera mientras tanto.`;
      } },

    { id: 'shield', view: 'battle', title: 'Apoyo: escudos', gate: { moves: ['shield'], swap: false },
      text: () => `No todo es atacar. Las habilidades de <b>apoyo</b> (en verde) ayudan a tu equipo: escudos, curas, bufos… Te preguntan <b>a qué aliado</b> aplicarlas.<br>Usa el <b>Escudo de luz</b> sobre tu Espadachín.`,
      task: { label: () => 'Pulsa «Escudo de luz» y elige a un aliado', match: e => e.t === 'shield' },
      feedback: evs => {
        const s = evFind(evs, e => e.t === 'shield'), f = evFind(evs, e => e.t === 'attack' && e.side === 'foe');
        return `${esc(s.target)} ganó ${num(s.value)} de escudo (la barra celeste). El escudo <b>absorbe el daño antes que la vida</b>.${f ? ` El rival golpeó con ${num(f.raw)} y el escudo ${f.absorbed >= f.raw ? 'lo absorbió todo' : `absorbió ${f.absorbed}`}: solo perdiste ${num(f.real)} HP.` : ''}<br>
          Fíjate también en que el <b>Golpe fuerte</b> ya va por CD:${S.B.heroes[0].moves[1].cd}: el cooldown baja solo.` ;
      } },

    { id: 'debuff', view: 'battle', title: 'Debilitar al rival', gate: { moves: ['weaken'], swap: false },
      text: () => `Los <b>debufos</b> rebajan las estadísticas del rival durante unos turnos. Usa <b>Mirada débil</b>: hace poco daño, pero le quita ATK.`,
      task: { label: () => 'Pulsa «Mirada débil»', match: e => e.t === 'debuff' },
      feedback: evs => {
        const f = evFind(evs, e => e.t === 'attack' && e.side === 'foe');
        return `Mira el panel del Muñeco: aparece el chip <b>⬇️ ATK −6 (…)</b>. Su ATK bajó de 16 a 10, así que ${f ? `su golpe solo te quitó ${num(f.real)} en vez de 11` : 'sus golpes harán menos daño'}. Los debufos <b>caducan solos</b> tras los turnos indicados.<br>
          Hay muchos más: aturdir, congelar, quemar, ralentizar… los verás en un momento.`;
      } },

    { id: 'swap', view: 'battle', title: 'Cambiar de personaje (¡es gratis!)', gate: { moves: [], swap: true },
      text: () => `En cualquier momento de tu turno puedes <b>cambiar</b> a otro de tu equipo, y <b>no gasta el turno</b>. Úsalo para sacar a quien mejor encaje o para proteger a uno herido.<br>Pulsa <b>🔁 Cambiar personaje</b> y elige a otro.`,
      task: { label: () => 'Cambia a otro personaje', match: e => e.t === 'swap' },
      feedback: evs => {
        const s = evFind(evs, e => e.t === 'swap');
        return `Ahora ${num(esc(s.to))} está en combate. <b>Todavía es tu turno</b>: el cambio no consumió acción. Cada personaje conserva su propia vida, escudo, cooldowns y efectos.<br>
          Consejo: cambia cuando el activo esté a punto de caer o cuando otro personaje tenga ventaja.`;
      } },

    { id: 'ko', view: 'battle', title: 'KO y victoria', gate: { moves: null, swap: true },
      prep: B => { B.foes.forEach(f => { f.hp = Math.min(f.hp, 8); f.fx = []; }); },
      text: () => `Los Muñecos están muy débiles para que veas cómo funciona. Cuando un personaje llega a <b>0 HP</b> queda <b>KO</b> y <b>entra automáticamente</b> el siguiente de su equipo. Gana quien deje a los 3 rivales KO.<br><br>Ataca con lo que quieras hasta vencer a los tres.`,
      task: { label: () => `Derrota a los 3 Muñecos (${S.B.foes.filter(f => f.hp <= 0).length}/3)`, match: e => e.t === 'win', instant: true },
      feedback: () => `🏆 <b>¡Victoria!</b> Así termina un combate: los 3 rivales KO. Si te pasara a ti con los tuyos, perderías. Y recuerda: si el combate se alarga, a partir del <b>turno 70</b> hay <b>muerte súbita</b> (lo verás en las reglas).` },

    { id: 'effects', view: 'panel', title: 'Estados y efectos que verás', render: () => {
        const bad = [
          ['😵', 'Aturdido', 'Pierde su turno.'], ['❄️', 'Congelado', 'No puede actuar mientras dure.'],
          ['💕', 'Embelesado', 'Sus ataques golpean a un aliado suyo al azar.'], ['😨', 'Miedo', 'Cada turno puede fallar y perder su acción.'],
          ['🐌', 'Ralentizado', 'Baja su SPD (y con ello su iniciativa).'], ['🔥', 'Quemadura / ☠️ Veneno / 🩸 Sangrado', 'Daño cada turno mientras dura.'],
          ['🚫', 'Curación reducida', 'Recibe menos curación.'], ['👁️‍🗨️', 'Precisión reducida', 'Sus habilidades fallan más.'],
          ['⬇️', 'Debufo de ATK/DEF/SPD', 'Una estadística baja unos turnos.']
        ];
        const good = [
          ['🛡️', 'Escudo', 'Absorbe daño antes que la vida.'], ['⬆️', 'Bufo de ATK/DEF/SPD', 'Una estadística sube unos turnos.'],
          ['💚', 'Curación', 'Recupera HP.'], ['⚡', 'Crítico', 'Golpe con daño ×1,5 (8% de base; hay efectos que lo suben).'],
          ['🩸', 'Robo de vida', 'Curas parte del daño que infliges.'], ['🔁', 'Reflejo / Contraataque', 'Devuelve daño o responde al ser golpeado.'],
          ['🎯', 'Precisión aumentada', 'Tus habilidades aciertan más.'], ['🧼', 'Limpiar', 'Quita debufos y estados negativos propios o de aliados.'],
          ['✨', 'Purgar', 'Quita bufos al rival.']
        ];
        const card = c => `<button class="tt-card tt-flip tt-sm" data-act="flip"><div class="tt-ico">${c[0]}</div><h4>${c[1]}</h4><p class="tt-hid">${c[2]}</p></button>`;
        return `<p class="tt-lead">Toca cada tarjeta para ver qué hace. No hace falta memorizarlo: en combate, el chip de cada personaje te lo recuerda.</p>
          <h4 class="tt-sec">⚠️ Efectos negativos (los que sufres o aplicas al rival)</h4><div class="tt-cards">${bad.map(card).join('')}</div>
          <h4 class="tt-sec">✅ Efectos positivos</h4><div class="tt-cards">${good.map(card).join('')}</div>
          <div class="tt-tip">🧠 <b>Idea clave:</b> los efectos tienen <b>duración</b> (en turnos) y casi siempre <b>no se acumulan</b>: si ya están, solo se refrescan.</div>`;
      } },

    { id: 'rules', view: 'panel', title: 'Reglas clave', render: () => `
        <div class="tt-cards tt-rules">
          <div class="tt-card"><div class="tt-ico">⚡</div><h4>Iniciativa por ronda</h4><p>Cada ronda actúa primero el de mayor SPD actual. Los bufos y ralentizaciones cuentan.</p></div>
          <div class="tt-card"><div class="tt-ico">🔁</div><h4>Cambiar es gratis</h4><p>Cambiar de personaje no consume turno. Si uno cae (KO), el siguiente entra solo.</p></div>
          <div class="tt-card"><div class="tt-ico">⏳</div><h4>Cooldowns</h4><p>Tras usar una habilidad potente debes esperar su CD. Baja 1 por turno tuyo.</p></div>
          <div class="tt-card"><div class="tt-ico">☠️</div><h4>Muerte súbita</h4><p>Si el combate llega al <b>turno 70</b>, todos los personajes reciben <b>10 de daño por turno</b>. (En el modo Desafío llega al turno 100.)</p></div>
          <div class="tt-card"><div class="tt-ico">🚫</div><h4>Baneos</h4><p>En los modos «con baneos» cada jugador veta <b>4 personajes</b> (8 en total, por turnos) antes de elegir equipo. Los vetados no se pueden usar.</p></div>
          <div class="tt-card"><div class="tt-ico">🏆</div><h4>Victoria</h4><p>Gana quien deje KO a los 3 personajes del rival.</p></div>
        </div>` },

    { id: 'rewards', view: 'panel', title: 'Progreso: cajas, gloria y rangos', render: () => `
        <p class="tt-lead">Jugar también te da <b>recompensas</b>. Toca cada tarjeta:</p>
        <div class="tt-cards">
          <button class="tt-card tt-flip" data-act="flip"><div class="tt-ico">📦</div><h4>Cajas</h4>
            <p class="tt-hid">Al <b>terminar una partida libre contra la IA</b> (con o sin baneos) consigues una caja. <b>No</b> dan caja: Historia, Desafío, Infierno, Torneo, PvP local ni Multijugador.</p></button>
          <button class="tt-card tt-flip" data-act="flip"><div class="tt-ico">🎁</div><h4>Inventario</h4>
            <p class="tt-hid">Tus cajas se guardan en el <b>Inventario</b> (botón 📦 arriba a la derecha del menú). Al abrir una caja recibes entre <b>1 y 50 puntos de gloria</b>. Puedes abrirlas una a una o todas de golpe.</p></button>
          <button class="tt-card tt-flip" data-act="flip"><div class="tt-ico">⭐</div><h4>Puntos de gloria</h4>
            <p class="tt-hid">Suman gloria las <b>victorias en batalla libre</b>, los <b>capítulos de la Historia</b>, las <b>medallas del Desafío</b>, los <b>pisos del Infierno</b> y las <b>cajas</b>.</p></button>
          <button class="tt-card tt-flip" data-act="flip"><div class="tt-ico">🏅</div><h4>Rangos</h4>
            <p class="tt-hid">Subes de rango con la gloria: 🌱 Recluta (0) → 🗡️ Aprendiz (15) → ⚔️ Guerrero (40) → 🛡️ Veterano (90) → 💎 Élite (170) → 👑 Maestro (300) → 🔥 Leyenda (500).</p></button>
          <button class="tt-card tt-flip" data-act="flip"><div class="tt-ico">👤</div><h4>Perfil</h4>
            <p class="tt-hid">El botón de arriba a la izquierda del menú abre tu <b>perfil</b>: nombre, icono (cualquier personaje), 3 favoritos, rango y récords de cada modo.</p></button>
        </div>
        <div class="tt-tip">💡 <b>Consejo:</b> la forma más rápida de conseguir cajas es jugar <b>partidas contra la IA</b>. ¡Cada una cuenta!</div>` },

    { id: 'quiz', view: 'panel', title: 'Mini test (¡sin presión!)', quiz: true, render: () => quizHTML() },

    { id: 'modes', view: 'panel', title: '¡Listo! ¿Adónde vamos ahora?', final: true, render: () => finalHTML() }
  ];

  /* ---------- mini test ---------- */
  const QUIZ = [
    { q: '¿Cambiar de personaje consume tu turno?',
      o: ['Sí, siempre', 'No, es gratis', 'Solo si el personaje está KO'], a: 1,
      why: 'Cambiar es gratis: después de cambiar sigues pudiendo usar una habilidad.' },
    { q: '¿Para qué sirve la SPD?',
      o: ['Para hacer más daño', 'Para recibir menos daño', 'Para decidir quién actúa primero'], a: 2,
      why: 'La SPD decide la iniciativa de cada ronda.' },
    { q: 'Una habilidad muestra «CD:2». ¿Qué significa?',
      o: ['Que hace 2 de daño', 'Que no estará lista hasta dentro de 2 turnos tuyos', 'Que tiene 2 usos'], a: 1,
      why: 'El cooldown baja 1 por turno tuyo hasta que pone «Listo».' },
    { q: '¿Qué hace un escudo?',
      o: ['Absorbe daño antes que la vida', 'Sube tu DEF para siempre', 'Cura 25 HP'], a: 0,
      why: 'El escudo se gasta primero; luego ya recibes daño en HP.' },
    { q: '¿Cómo se gana el combate?',
      o: ['Con más vida total al turno 10', 'Dejando KO a los 3 personajes rivales', 'Usando 4 habilidades distintas'], a: 1,
      why: 'Hay que derrotar a los 3 personajes del rival.' },
    { q: '¿Cómo consigues una caja 📦?',
      o: ['Al terminar una partida libre contra la IA', 'Solo al pasarte el Modo Historia', 'Se compran en el menú'], a: 0,
      why: 'Las partidas libres contra la IA (con o sin baneos) dan una caja; luego la abres en el Inventario para ganar gloria.' }
  ];

  function quizHTML() {
    const ans = S.quiz;
    const total = Object.keys(ans).length;
    const ok = QUIZ.filter((q, i) => ans[i] === q.a).length;
    let h = `<p class="tt-lead">${QUIZ.length} preguntas rápidas para comprobar que lo tienes claro. Puedes fallar: te explico cada respuesta.</p>`;
    QUIZ.forEach((q, i) => {
      const a = ans[i];
      h += `<div class="tt-q"><h4>${i + 1}. ${q.q}</h4><div class="tt-opts">`;
      q.o.forEach((o, j) => {
        let cls = 'tt-opt';
        if (a != null) cls += j === q.a ? ' ok' : (j === a ? ' bad' : ' dim');
        h += `<button class="${cls}" data-act="ans" data-q="${i}" data-o="${j}" ${a != null ? 'disabled' : ''}>${o}</button>`;
      });
      h += `</div>${a != null ? `<div class="tt-why ${a === q.a ? 'ok' : 'bad'}">${a === q.a ? '✅ ¡Correcto!' : '❌ Casi.'} ${q.why}</div>` : ''}</div>`;
    });
    if (total === QUIZ.length) h += `<div class="tt-tip tt-score">🎉 Resultado: <b>${ok}/${QUIZ.length}</b>. ${ok === QUIZ.length ? '¡Perfecto, ya eres un veterano!' : ok >= 3 ? '¡Muy bien! Ya puedes jugar.' : 'Puedes repetir el tutorial cuando quieras; se aprende jugando.'}</div>`;
    return h;
  }

  /* ---------- modos / final ---------- */
  const MODES = [
    ['menu-pve', '🤖', 'Jugador vs IA', 'Ideal para practicar solo: 3 contra 3 contra la IA. ¡Y al terminar consigues una caja 📦!'],
    ['menu-pvp', '🧍‍♂️', 'Jugador vs Jugador', 'Dos personas en el mismo dispositivo, 3 contra 3.'],
    ['menu-pve-ban', '🚫', 'Con baneos', 'Antes de elegir equipo, cada jugador veta 4 personajes. Disponible contra IA o contra otro jugador.'],
    ['menu-story', '📖', 'Modo Historia', '«Papu no Filosophy»: capítulos con diálogos y combates preparados.'],
    ['menu-desafio', '🏆', 'Desafío', 'Enfréntate a jefes con 3 dificultades que puedes rejugar.'],
    ['menu-torneo', '🥇', 'Torneo vs IA', 'Cuartos, Semifinal y Final. Tras cada victoria eliges una mejora.'],
    ['menu-hell', '🔥', 'Infierno Infinito', 'Una torre de pisos sin final, con efectos y restricciones.'],
    ['menu-multijugador', '🌐', 'Multijugador online', '1 contra 1 por internet con un código de sala.'],
    ['menu-amigos', '👥', 'Amigos', 'Añade amigos y mira sus perfiles.'],
    ['menu-fama', '⭐', 'Salón de la Fama', 'Ranking por likes y puntos de gloria.'],
    ['inv-chip', '📦', 'Inventario', 'Abre tus cajas y consigue puntos de gloria para subir de rango.'],
    ['pf-chip', '👤', 'Mi perfil', 'Tu nombre, icono, favoritos, rango y récords.'],
    ['menu-glossary', '📖', 'Glosario', 'Fichas de todos los personajes, con comparador.']
  ];

  function finalHTML() {
    const have = MODES.filter(m => $(m[0]));
    let h = `<p class="tt-lead">🎓 <b>¡Tutorial completado!</b> Ya conoces lo esencial. Estos son los modos del juego; pulsa <b>Ir →</b> para entrar directamente:</p><div class="tt-cards tt-modes">`;
    have.forEach(m => { h += `<div class="tt-card"><div class="tt-ico">${m[1]}</div><h4>${m[2]}</h4><p>${m[3]}</p><button class="tt-go" data-act="go" data-id="${m[0]}">Ir →</button></div>`; });
    h += `</div><h4 class="tt-sec">💡 Trucos que te ahorran tiempo</h4><ul class="tt-ul">
      <li><b>Pasa el ratón</b> sobre una habilidad de ataque en combate: verás el daño estimado y si mata.</li>
      <li>En la selección puedes <b>guardar equipos</b> (5 huecos) y cargarlos de un clic.</li>
      <li>En el <b>Registro</b> puedes filtrar por equipo, ver solo lo importante (⭐ Clave) y exportarlo.</li>
      <li>En el <b>Glosario</b> hay un comparador para ver dos personajes lado a lado.</li>
      <li>Tu <b>perfil</b> (arriba a la izquierda) guarda tu rango y récords, y tu <b>inventario</b> 📦 (arriba a la derecha) tus cajas.</li></ul>
      <div class="tt-actions"><button class="tt-btn primary" data-act="go" data-id="menu-pve">🤖 Practicar contra la IA</button>
      <button class="tt-btn" data-act="exit">Volver al menú</button>
      <button class="tt-btn" data-act="restart">🔁 Repetir tutorial</button></div>`;
    return h;
  }

  /* =====================================================================
     SESIÓN E INTERFAZ
     ===================================================================== */
  let S = null;            // sesión actual
  let root = null, timer = null;

  function snapshot() { return JSON.stringify(S.B); }

  function enterStep(i, restore) {
    clearTimeout(timer);
    S.i = Math.max(0, Math.min(STEPS.length - 1, i));
    const st = STEPS[S.i];
    S.done = !st.task && !st.quiz;       // los pasos sin tarea se pueden pasar directamente
    S.pending = false; S.exchange = []; S.feedback = ''; S.extra = ''; S.fx = null;
    if (st.id === 'stats') S.clicks = new Set();
    if (restore) S.B = JSON.parse(restore);
    else if (S.snaps[S.i]) S.B = JSON.parse(S.snaps[S.i]);
    else { if (st.prep) st.prep(S.B); S.snaps[S.i] = snapshot(); }
    if (st.quiz) { S.quiz = {}; S.done = false; }
    if (st.final) markDone();
    if (S.B.turn === 'foe' && !S.B.over) S.B.turn = 'hero';
    render();
  }

  const next = () => { if (S.done && S.i < STEPS.length - 1) enterStep(S.i + 1); };
  const back = () => { if (S.i > 0) enterStep(S.i - 1); };
  const redo = () => enterStep(S.i, S.snaps[S.i]);

  function markDone() { try { localStorage.setItem(KEY, '1'); } catch (e) { /* modo privado */ } refreshBadge(); }
  function isDone() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }

  /* ---------- acciones del jugador ---------- */
  function onMove(id) {
    const st = STEPS[S.i];
    if (!st.gate || S.B.turn !== 'hero' || S.B.over || S.done) return;
    if (st.gate.moves && !st.gate.moves.includes(id)) return;
    const def = MOVES[id];
    if (def.type === 'support') { S.picking = { kind: 'support', move: id }; render(); return; }
    runHero(id, null);
  }

  function runHero(id, target) {
    S.picking = null;
    const evs = heroAct(S.B, id, target);
    if (!evs.length) { render(); return; }
    afterEvents(evs, 'hero');
  }

  function onSwap(idx) {
    const st = STEPS[S.i];
    if (!st.gate || !st.gate.swap || S.B.turn !== 'hero' || S.B.over) return;
    S.picking = null;
    afterEvents(swapTo(S.B, idx), 'hero');
  }

  function afterEvents(evs, side) {
    const st = STEPS[S.i];
    S.exchange.push(...evs);
    // Números flotantes
    const a = evs.find(e => e.t === 'attack');
    if (a) S.fx = { side: a.side === 'hero' ? 'foe' : 'hero', txt: a.real > 0 ? '−' + a.real : (a.absorbed ? '🛡️' : '0') };
    const h = evs.find(e => e.t === 'heal' || e.t === 'shield');
    if (h) S.fx = { side: 'hero', txt: h.t === 'heal' ? '+' + h.value : '+🛡️' + h.value };

    if (st.task && !S.done && !S.pending && side === 'hero' && evs.some(st.task.match || (() => false))) S.pending = true;

    if (S.B.over || (S.pending && S.B.turn === 'hero')) { finalize(); return; }   // sin respuesta del rival (victoria o cambio gratis)
    render();
    if (S.B.turn === 'foe') {
      const myStep = S.i;
      timer = setTimeout(() => {
        if (!S || S.i !== myStep) return;
        afterEvents(foeAct(S.B), 'foe');
      }, 850);
    } else if (side === 'foe' && S.pending) finalize();
  }

  function finalize() {
    const st = STEPS[S.i];
    S.pending = false;
    if (st.task) {
      if (S.B.over === 'lose') { S.feedback = '☠️ Te han derrotado en la práctica. Pulsa «Repetir paso» para reintentarlo.'; render(); return; }
      S.done = true;
      S.feedback = st.feedback ? st.feedback(S.exchange) : '';
    }
    render();
  }

  /* ---------- pintado ---------- */
  function hpPct(u) { return Math.max(0, Math.min(100, u.hp / u.maxHp * 100)); }

  function chip(label, val, st, key) {
    const clickable = st.task && st.task.kind === 'stats';
    const seen = S.clicks && S.clicks.has(key);
    const pulse = (clickable && !seen) || st.pulse === key.toLowerCase();
    return `<${clickable ? 'button' : 'span'} class="tt-chip${pulse ? ' tt-pulse' : ''}${seen ? ' seen' : ''}" ${clickable ? `data-act="stat" data-k="${key}"` : ''}>${label} <b>${val}</b></${clickable ? 'button' : 'span'}>`;
  }

  function panelHTML(side, st) {
    const B = S.B, team = side === 'hero' ? B.heroes : B.foes, u = team[side === 'hero' ? B.ha : B.fa];
    const fxChips = u.fx.map(f => `<span class="tt-fx bad">⬇️ ${f.stat.toUpperCase()} −${f.value} (${f.turns})</span>`).join('');
    const shield = u.shield > 0 ? `<span class="tt-fx good">🛡️ Escudo ${u.shield}</span>` : '';
    const bench = team.map((m, i) => `<div class="tt-bench${i === (side === 'hero' ? B.ha : B.fa) ? ' on' : ''}${m.hp <= 0 ? ' ko' : ''}" title="${esc(m.name)}">
        <span>${m.hp <= 0 ? '💀' : m.emoji}</span><i style="width:${hpPct(m)}%"></i></div>`).join('');
    const mark = (n) => st.markers ? `<span class="tt-marker">${n}</span>` : '';
    const eff = k => effStat(u, k);
    const stats = [['HP', 'HP', u.hp + '/' + u.maxHp], ['ATK', 'ATK', eff('atk')], ['DEF', 'DEF', eff('def')], ['SPD', 'SPD', eff('spd')]]
      .map(s => chip(s[0], s[2], side === 'hero' ? st : { }, s[1])).join('');
    return `<div class="tt-panel ${side}${S.fx && S.fx.side === side ? ' hit' : ''}">
      <div class="tt-who">${side === 'hero' ? 'Tu equipo' : 'Rival'}</div>
      <div class="tt-avatar">${u.hp > 0 ? u.emoji : '💀'}${S.fx && S.fx.side === side ? `<span class="tt-float">${esc(S.fx.txt)}</span>` : ''}</div>
      <div class="tt-name">${esc(u.name)} <small>${esc(u.cls)}</small></div>
      <div class="tt-hp">${mark('①')}<div class="tt-hpbar"><i style="width:${hpPct(u)}%"></i>${u.shield > 0 ? `<em style="width:${Math.min(100, u.shield / u.maxHp * 100)}%"></em>` : ''}</div><span>${u.hp}/${u.maxHp}</span></div>
      <div class="tt-stats">${mark('②')}${stats}</div>
      <div class="tt-fxrow">${shield}${fxChips}</div>
      <div class="tt-benchrow">${bench}</div></div>`;
  }

  function controlsHTML(st) {
    const B = S.B, u = B.heroes[B.ha], g = st.gate || { moves: [], swap: false };
    const myTurn = B.turn === 'hero' && !B.over && !S.done;
    const mark = st.markers ? '<span class="tt-marker">③</span>' : '';
    let h = `<div class="tt-controls">${mark}<div class="tt-ctitle">Controles — <b>${esc(u.name)}</b> (activo) <small>${myTurn ? '· tu turno' : (B.over ? '· combate terminado' : (S.done ? '· paso completado' : '· turno del rival…'))}</small></div>`;
    u.moves.forEach(m => {
      const d = MOVES[m.id];
      const allowed = g.moves === null || (g.moves && g.moves.includes(m.id));
      const ready = m.cd === 0;
      const enabled = myTurn && allowed && ready;
      const pulse = enabled && st.task && g.moves !== null;
      h += `<button class="tt-move${pulse ? ' tt-pulse' : ''}" data-act="move" data-id="${m.id}" ${enabled ? '' : 'disabled'}>
        <div><span class="tt-mname ${d.type}">${d.name}</span><span class="tt-cd${ready ? '' : ' wait'}">${ready ? 'Listo' : 'CD:' + m.cd}</span></div>
        <div class="tt-mdesc">${d.desc}</div></button>`;
    });
    const swapOn = myTurn && g.swap;
    h += `<button class="tt-swap${swapOn && st.task && st.task.kind !== 'stats' && st.id === 'swap' ? ' tt-pulse' : ''}" data-act="swap" ${swapOn ? '' : 'disabled'}>🔁 Cambiar personaje (no consume turno)</button>`;

    if (S.picking && myTurn) {
      const d = MOVES[S.picking.move];
      h += `<div class="tt-picker"><b>${d.name}:</b> ¿a qué aliado?<div class="tt-prow">${B.heroes.map((m, i) => m.hp > 0
        ? `<button class="tt-pick" data-act="target" data-i="${i}"><span>${m.emoji}</span>${esc(m.name)}</button>` : '').join('')}</div>
        <button class="tt-link" data-act="cancelpick">Cancelar</button></div>`;
    }
    if (S.swapping && myTurn) {
      h += `<div class="tt-picker"><b>Cambiar a…</b> (no gasta turno)<div class="tt-prow">${B.heroes.map((m, i) => (m.hp > 0 && i !== B.ha)
        ? `<button class="tt-pick tt-pulse" data-act="swapto" data-i="${i}"><span>${m.emoji}</span>${esc(m.name)}<small>${m.hp}/${m.maxHp} HP</small></button>` : '').join('')}</div>
        <button class="tt-link" data-act="cancelpick">Cancelar</button></div>`;
    }
    return h + '</div>';
  }

  function logHTML(st) {
    const mark = st.markers ? '<span class="tt-marker">④</span>' : '';
    return `<div class="tt-log">${mark}<div class="tt-ctitle">Registro</div>${S.B.log.map(l => `<div>${esc(l)}</div>`).join('') || '<div class="tt-muted">Aquí aparecerá lo que pase…</div>'}</div>`;
  }

  function coachHTML(st) {
    const task = st.task ? `<div class="tt-task${S.done ? ' ok' : ''}">${S.done ? '✅ ¡Hecho!' : '▶ ' + st.task.label()}</div>` : '';
    const body = st.text ? st.text(S.B) : '';
    return `<div class="tt-coach" aria-live="polite"><div class="tt-mascot">🎓</div><div class="tt-bubble">
      <h3>${st.title}</h3><div class="tt-text">${body}</div>${task}
      ${S.extra ? `<div class="tt-extra">${S.extra}</div>` : ''}
      ${S.feedback ? `<div class="tt-feedback">${S.feedback}</div>` : ''}</div></div>`;
  }

  function render() {
    if (!root || !S) return;
    const st = STEPS[S.i];
    const prev = root.querySelector('.tt-main');
    const scroll = prev ? prev.scrollTop : 0;

    const dots = STEPS.map((x, i) => `<i class="tt-dot${i < S.i ? ' done' : ''}${i === S.i ? ' cur' : ''}"></i>`).join('');
    let main;
    if (st.view === 'battle') {
      main = `${coachHTML(st)}
        <div class="tt-arena">${panelHTML('hero', st)}<div class="tt-vs">VS</div>${panelHTML('foe', st)}</div>
        <div class="tt-bottom">${controlsHTML(st)}${logHTML(st)}</div>`;
    } else {
      main = `<div class="tt-coach"><div class="tt-mascot">🎓</div><div class="tt-bubble"><h3>${st.title}</h3></div></div>
        <div class="tt-content">${st.render()}</div>`;
    }
    const last = S.i === STEPS.length - 1;
    const canNext = S.done && !last;
    const hint = !S.done && st.task ? 'Completa la tarea para continuar' : (!S.done && st.quiz ? 'Responde las ' + QUIZ.length + ' preguntas para continuar' : '');
    root.innerHTML = `
      <div class="tt-top"><div class="tt-title">🎓 Tutorial</div><div class="tt-prog" aria-label="Progreso">${dots}</div>
        <div class="tt-count">${S.i + 1}/${STEPS.length}</div><button class="tt-x" data-act="exit" title="Salir del tutorial">✕ Salir</button></div>
      <div class="tt-main">${main}</div>
      <div class="tt-foot">
        <button class="tt-btn" data-act="back" ${S.i === 0 ? 'disabled' : ''}>← Atrás</button>
        ${st.view === 'battle' && st.task ? '<button class="tt-btn" data-act="redo">↻ Repetir paso</button>' : ''}
        <span class="tt-hint">${hint}</span>
        ${last ? '' : `<button class="tt-btn primary${canNext ? ' tt-pulse' : ''}" data-act="next" ${canNext ? '' : 'disabled'}>Siguiente →</button>`}
      </div>`;
    const m = root.querySelector('.tt-main');
    if (m) m.scrollTop = scroll;
    S.fx = null;
  }

  /* ---------- eventos ---------- */
  function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b || !S) return;
    const act = b.dataset.act;
    if (act === 'next') next();
    else if (act === 'back') back();
    else if (act === 'redo') redo();
    else if (act === 'exit') close();
    else if (act === 'restart') { S = null; open(); }
    else if (act === 'flip') b.classList.toggle('open');
    else if (act === 'move') onMove(b.dataset.id);
    else if (act === 'target') runHero(S.picking.move, Number(b.dataset.i));
    else if (act === 'swap') { S.swapping = true; S.picking = null; render(); }
    else if (act === 'swapto') { S.swapping = false; onSwap(Number(b.dataset.i)); }
    else if (act === 'cancelpick') { S.picking = null; S.swapping = false; render(); }
    else if (act === 'stat') {
      const k = b.dataset.k;
      const info = {
        HP: '❤️ <b>HP</b>: puntos de vida. Si llegan a 0, el personaje queda KO.',
        ATK: '🗡️ <b>ATK</b>: fuerza de ataque. A más ATK, más daño hacen tus golpes.',
        DEF: '🛡️ <b>DEF</b>: defensa. A más DEF, menos daño recibes.',
        SPD: '💨 <b>SPD</b>: velocidad. Decide quién actúa primero en cada ronda.'
      };
      S.extra = info[k];
      S.clicks.add(k);
      if (S.clicks.size >= 4 && !S.done) { S.done = true; S.feedback = STEPS[S.i].feedback(); }
      render();
    }
    else if (act === 'ans') {
      const q = Number(b.dataset.q), o = Number(b.dataset.o);
      if (S.quiz[q] == null) S.quiz[q] = o;
      if (Object.keys(S.quiz).length === QUIZ.length) S.done = true;
      render();
    }
    else if (act === 'go') {
      const id = b.dataset.id, target = $(id);
      markDone();
      close();
      if (target) setTimeout(() => target.click(), 60);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape' && S) { e.preventDefault(); if (confirm('¿Salir del tutorial?')) close(); }
  }

  /* ---------- abrir / cerrar ---------- */
  function open() {
    if (root) return;
    injectCSS();
    S = { i: 0, B: newBattle(), snaps: [], done: true, clicks: new Set(), quiz: {}, exchange: [], feedback: '', extra: '', picking: null, swapping: false };
    root = document.createElement('div');
    root.id = 'tt-root';
    root.className = 'tt-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Tutorial interactivo');
    root.addEventListener('click', onClick);
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    enterStep(0);
  }

  function close() {
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null; S = null;
    document.body.style.overflow = '';
  }

  /* ---------- botón del menú ---------- */
  function refreshBadge() {
    const btn = $('menu-tutorial');
    if (!btn) return;
    const badge = btn.querySelector('.tt-new');
    if (isDone() && badge) badge.remove();
    if (!isDone() && !badge) btn.insertAdjacentHTML('beforeend', ' <span class="tt-new">¡Empieza aquí!</span>');
  }

  function addMenuButton() {
    if ($('menu-tutorial')) return true;
    const card = document.querySelector('.main-menu-card');
    if (!card) return false;
    const btn = document.createElement('button');
    btn.id = 'menu-tutorial';
    btn.className = 'menu-btn tutorial-btn';
    btn.textContent = '🎓 Tutorial interactivo';
    btn.addEventListener('click', open);
    const anchor = $('menu-pvp') || card.querySelector('.menu-btn');
    if (anchor) card.insertBefore(btn, anchor); else card.appendChild(btn);
    refreshBadge();
    return true;
  }

  /* ---------- estilos ---------- */
  function injectCSS() {
    if ($('tt-css')) return;
    const st = document.createElement('style');
    st.id = 'tt-css';
    st.textContent = `
      #menu-tutorial{border-color:rgba(250,204,21,.45); background:linear-gradient(135deg,rgba(250,204,21,.14),rgba(139,92,246,.16))}
      #menu-tutorial:hover{border-color:rgba(250,204,21,.8)}
      .tt-new{display:inline-block; margin-left:6px; padding:1px 8px; border-radius:999px; background:#facc15; color:#1f1500; font-size:11px; font-weight:800}
      .tt-root{position:fixed; inset:0; z-index:100000; display:flex; flex-direction:column; color:#eef4ff;
        background:radial-gradient(circle at 50% -10%,#1d1546 0,#060b1a 55%); font-family:inherit}
      .tt-root *{box-sizing:border-box}
      .tt-top{display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid rgba(148,163,184,.16); background:rgba(5,9,22,.7)}
      .tt-title{font-weight:800; white-space:nowrap}
      .tt-prog{flex:1; display:flex; gap:4px; min-width:60px}
      .tt-dot{flex:1; height:6px; border-radius:99px; background:rgba(148,163,184,.22)}
      .tt-dot.done{background:#8b5cf6} .tt-dot.cur{background:#facc15}
      .tt-count{font-size:12px; color:#94a3b8; white-space:nowrap}
      .tt-x{border:1px solid rgba(148,163,184,.25); background:transparent; color:#cbd5e1; border-radius:10px; padding:5px 10px; cursor:pointer; font:inherit; font-size:12px}
      .tt-x:hover{border-color:rgba(239,68,68,.6); color:#fff}
      .tt-main{flex:1; overflow:auto; padding:14px; width:100%; max-width:1040px; margin:0 auto}
      .tt-foot{display:flex; align-items:center; gap:10px; padding:10px 14px; border-top:1px solid rgba(148,163,184,.16); background:rgba(5,9,22,.7); justify-content:center; flex-wrap:wrap}
      .tt-hint{flex:1; text-align:center; font-size:12px; color:#94a3b8; min-width:140px}
      .tt-btn{border:1px solid rgba(148,163,184,.28); background:rgba(255,255,255,.04); color:#e5edf8; border-radius:12px; padding:9px 16px; cursor:pointer; font:inherit; font-weight:700}
      .tt-btn:hover:not(:disabled){border-color:rgba(167,139,250,.7); background:rgba(139,92,246,.18)}
      .tt-btn:disabled{opacity:.4; cursor:not-allowed}
      .tt-btn.primary{background:linear-gradient(135deg,#8b5cf6,#6366f1); border-color:transparent; color:#fff}
      .tt-coach{display:flex; gap:12px; align-items:flex-start; margin-bottom:12px}
      .tt-mascot{flex:0 0 auto; width:50px; height:50px; border-radius:50%; display:grid; place-items:center; font-size:26px;
        background:rgba(250,204,21,.15); border:1px solid rgba(250,204,21,.5)}
      .tt-bubble{flex:1; padding:12px 14px; border-radius:14px; background:rgba(15,23,42,.85); border:1px solid rgba(167,139,250,.3)}
      .tt-bubble h3{margin:0 0 6px; font-size:18px}
      .tt-text{font-size:14px; line-height:1.55; color:#dbe5f5}
      .tt-ol{margin:8px 0; padding-left:20px} .tt-ol li{margin:3px 0}
      .tt-task{margin-top:10px; padding:8px 12px; border-radius:10px; font-weight:800; font-size:14px; background:rgba(250,204,21,.12); border:1px solid rgba(250,204,21,.5); color:#fde68a}
      .tt-task.ok{background:rgba(34,197,94,.14); border-color:rgba(34,197,94,.55); color:#bbf7d0}
      .tt-extra{margin-top:8px; padding:8px 12px; border-radius:10px; background:rgba(56,189,248,.1); border:1px solid rgba(56,189,248,.4); font-size:13px}
      .tt-feedback{margin-top:10px; padding:10px 12px; border-radius:10px; background:rgba(34,197,94,.1); border:1px solid rgba(34,197,94,.4); font-size:13px; line-height:1.55}
      .tt-lead{font-size:15px; line-height:1.6; margin:0 0 12px}
      .tt-note,.tt-muted{font-size:12px; color:#94a3b8}
      .tt-tip{margin-top:14px; padding:10px 12px; border-radius:12px; background:rgba(139,92,246,.12); border:1px solid rgba(167,139,250,.35); font-size:13px; line-height:1.55}
      .tt-sec{margin:18px 0 8px; font-size:13px; letter-spacing:.04em; color:#c4b5fd}
      .tt-cards{display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:10px}
      .tt-card{position:relative; text-align:left; font:inherit; color:inherit; padding:12px; border-radius:14px; background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.2)}
      .tt-card h4{margin:6px 0 4px; font-size:14px} .tt-card p{margin:0; font-size:13px; line-height:1.5; color:#cbd5e1}
      .tt-ico{font-size:26px}
      .tt-flip{cursor:pointer} .tt-flip:hover{border-color:rgba(167,139,250,.6)}
      .tt-flip .tt-hid{display:none} .tt-flip.open .tt-hid{display:block} .tt-flip.open{border-color:rgba(250,204,21,.6); background:rgba(250,204,21,.07)}
      .tt-flip:not(.open)::after{content:'toca para ver'; display:block; margin-top:4px; font-size:10px; color:#7d8ca4}
      .tt-sm{padding:9px} .tt-sm .tt-ico{font-size:20px}
      .tt-team{display:flex; gap:10px; margin:14px 0 6px; flex-wrap:wrap}
      .tt-mini{display:flex; flex-direction:column; align-items:center; min-width:96px; padding:10px; border-radius:14px; background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.2)}
      .tt-mini span{font-size:32px} .tt-mini small{color:#94a3b8}
      .tt-ul{margin:6px 0 0; padding-left:20px; line-height:1.7; font-size:14px}
      .tt-actions{display:flex; gap:10px; flex-wrap:wrap; margin-top:18px}
      .tt-go{margin-top:8px; border:1px solid rgba(167,139,250,.5); background:rgba(139,92,246,.18); color:#fff; border-radius:10px; padding:5px 12px; cursor:pointer; font:inherit; font-weight:700}
      .tt-go:hover{background:rgba(139,92,246,.4)}
      /* combate */
      .tt-arena{display:grid; grid-template-columns:1fr 44px 1fr; gap:8px; align-items:stretch}
      .tt-vs{display:grid; place-items:center; font-weight:900; color:#a78bfa}
      .tt-panel{position:relative; padding:12px; border-radius:16px; background:rgba(11,20,39,.9); border:1px solid rgba(148,163,184,.2)}
      .tt-panel.hero{border-color:rgba(56,189,248,.4)} .tt-panel.foe{border-color:rgba(244,114,182,.4)}
      .tt-panel.hit{animation:ttShake .35s}
      .tt-who{font-size:11px; color:#94a3b8; text-transform:uppercase; letter-spacing:.06em}
      .tt-avatar{position:relative; text-align:center; font-size:58px; line-height:1.2; margin:4px 0}
      .tt-float{position:absolute; left:50%; top:0; transform:translateX(-50%); font-size:22px; font-weight:900; color:#fb7185; animation:ttFloat 1s ease-out forwards; text-shadow:0 2px 8px #000}
      .tt-name{text-align:center; font-weight:800} .tt-name small{display:block; color:#94a3b8; font-weight:500; font-size:11px}
      .tt-hp{position:relative; display:flex; align-items:center; gap:8px; margin:8px 0}
      .tt-hpbar{position:relative; flex:1; height:12px; border-radius:99px; background:rgba(148,163,184,.2); overflow:hidden}
      .tt-hpbar i{position:absolute; left:0; top:0; bottom:0; background:linear-gradient(90deg,#22c55e,#86efac); transition:width .4s}
      .tt-hpbar em{position:absolute; left:0; bottom:0; height:4px; background:#38bdf8}
      .tt-hp span{font-size:12px; color:#cbd5e1; min-width:52px; text-align:right}
      .tt-stats{position:relative; display:flex; gap:6px; flex-wrap:wrap; justify-content:center}
      .tt-chip{border:1px solid rgba(148,163,184,.25); background:rgba(255,255,255,.04); color:#cbd5e1; border-radius:999px; padding:3px 10px; font:inherit; font-size:12px}
      button.tt-chip{cursor:pointer} button.tt-chip.seen{border-color:rgba(34,197,94,.6); color:#bbf7d0}
      .tt-fxrow{display:flex; gap:6px; flex-wrap:wrap; justify-content:center; min-height:24px; margin-top:6px}
      .tt-fx{font-size:11px; padding:2px 8px; border-radius:999px; font-weight:700}
      .tt-fx.good{background:rgba(56,189,248,.16); color:#7dd3fc; border:1px solid rgba(56,189,248,.45)}
      .tt-fx.bad{background:rgba(239,68,68,.15); color:#fca5a5; border:1px solid rgba(239,68,68,.45)}
      .tt-benchrow{display:flex; gap:8px; justify-content:center; margin-top:8px}
      .tt-bench{position:relative; width:42px; height:42px; border-radius:10px; background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.2); display:grid; place-items:center; font-size:22px; overflow:hidden}
      .tt-bench.on{border-color:#facc15} .tt-bench.ko{opacity:.45}
      .tt-bench i{position:absolute; left:0; bottom:0; height:4px; background:#22c55e}
      .tt-bottom{display:grid; grid-template-columns:2fr 1fr; gap:10px; margin-top:10px}
      .tt-controls,.tt-log{position:relative; padding:12px; border-radius:16px; background:rgba(11,20,39,.9); border:1px solid rgba(148,163,184,.2)}
      .tt-ctitle{font-size:13px; margin-bottom:8px} .tt-ctitle small{color:#94a3b8}
      .tt-log{max-height:290px; overflow:auto; font-size:12px; line-height:1.5} .tt-log div:not(.tt-ctitle){padding:3px 0; border-top:1px solid rgba(148,163,184,.1)}
      .tt-move{display:block; width:100%; text-align:left; margin-bottom:6px; padding:9px 11px; border-radius:12px; font:inherit; color:#e5edf8; cursor:pointer;
        background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.22)}
      .tt-move:hover:not(:disabled){border-color:rgba(167,139,250,.7)}
      .tt-move:disabled,.tt-swap:disabled{opacity:.38; cursor:not-allowed}
      .tt-mname{font-weight:800} .tt-mname.attack{color:#fda4af} .tt-mname.support{color:#86efac}
      .tt-cd{float:right; font-size:11px; padding:1px 8px; border-radius:99px; background:rgba(34,197,94,.18); color:#86efac}
      .tt-cd.wait{background:rgba(245,158,11,.18); color:#fcd34d}
      .tt-mdesc{font-size:12px; color:#94a3b8; margin-top:3px}
      .tt-swap{display:block; width:100%; padding:9px; border-radius:12px; cursor:pointer; font:inherit; color:#e5edf8; background:rgba(56,189,248,.1); border:1px solid rgba(56,189,248,.4)}
      .tt-picker{margin-top:10px; padding:10px; border-radius:12px; background:rgba(250,204,21,.08); border:1px solid rgba(250,204,21,.45); font-size:13px}
      .tt-prow{display:flex; gap:8px; flex-wrap:wrap; margin:8px 0}
      .tt-pick{display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 12px; border-radius:12px; cursor:pointer; font:inherit; color:#fff; background:rgba(255,255,255,.06); border:1px solid rgba(148,163,184,.3)}
      .tt-pick span{font-size:24px} .tt-pick small{color:#94a3b8; font-size:10px}
      .tt-pick:hover{border-color:#facc15}
      .tt-link{border:0; background:transparent; color:#94a3b8; cursor:pointer; text-decoration:underline; font:inherit; font-size:12px}
      .tt-marker{position:absolute; top:-9px; left:-9px; width:26px; height:26px; border-radius:50%; display:grid; place-items:center; z-index:2;
        background:#facc15; color:#1f1500; font-weight:900; font-size:15px; box-shadow:0 0 0 4px rgba(250,204,21,.25)}
      .tt-pulse{animation:ttPulse 1.3s ease-in-out infinite}
      .tt-q{margin:14px 0; padding:12px; border-radius:14px; background:rgba(255,255,255,.03); border:1px solid rgba(148,163,184,.18)}
      .tt-q h4{margin:0 0 8px; font-size:15px}
      .tt-opts{display:flex; flex-direction:column; gap:6px}
      .tt-opt{text-align:left; padding:9px 12px; border-radius:10px; cursor:pointer; font:inherit; color:#e5edf8; background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.25)}
      .tt-opt:hover:not(:disabled){border-color:#a78bfa}
      .tt-opt.ok{background:rgba(34,197,94,.18); border-color:rgba(34,197,94,.7)} .tt-opt.bad{background:rgba(239,68,68,.18); border-color:rgba(239,68,68,.7)} .tt-opt.dim{opacity:.45}
      .tt-why{margin-top:8px; font-size:13px} .tt-why.ok{color:#bbf7d0} .tt-why.bad{color:#fecaca}
      @keyframes ttPulse{0%,100%{box-shadow:0 0 0 0 rgba(250,204,21,.0)}50%{box-shadow:0 0 0 5px rgba(250,204,21,.45)}}
      @keyframes ttShake{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
      @keyframes ttFloat{from{opacity:1; transform:translate(-50%,0)}to{opacity:0; transform:translate(-50%,-34px)}}
      @media (max-width:700px){
        .tt-arena{grid-template-columns:1fr 1fr; gap:6px} .tt-vs{display:none}
        .tt-avatar{font-size:40px} .tt-panel{padding:8px}
        .tt-bottom{grid-template-columns:1fr} .tt-log{max-height:150px}
        .tt-bubble h3{font-size:16px} .tt-count{display:none} .tt-title{font-size:13px}
      }
      @media (prefers-reduced-motion:reduce){ .tt-root *{animation:none !important; transition:none !important} }
    `;
    document.head.appendChild(st);
  }

  /* ---------- arranque ---------- */
  function init() {
    injectCSS();
    if (!addMenuButton()) {
      // El menú aún no existe: se reintenta unos instantes (otros scripts pueden tardar).
      let tries = 0;
      const t = setInterval(() => { if (addMenuButton() || ++tries > 20) clearInterval(t); }, 250);
    }
    console.log('[tutorial.js] tutorial interactivo listo');
  }

  window.TUTORIAL = { open, close, _state: () => S, _engine: { newBattle, heroAct, foeAct, swapTo, MOVES, STEPS } };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
