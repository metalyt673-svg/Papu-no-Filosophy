/* pasivas.js
   Motor de pasivas "de evento" (la de revivir sigue viviendo en game.js).
   Se declaran en la ficha del personaje, en personajes.js, con un campo opcional:

       passive: { type: '…', name: '…', desc: '…', …parámetros del tipo }

   TIPOS
     ultKillExtraTurn  moveId                   Si mata a un enemigo con esa habilidad (su ULT): turno
                                                extra y la habilidad queda lista (cooldown 0).
     dodge             chance                   Esa fracción de los ataques enemigos de un solo objetivo
                                                contra él fallan (se aplica a la precisión; la
                                                previsualización de daño ya lo refleja).
     lastStand         threshold, healPercent,  La 1ª vez que su vida baja de ese % (una vez por batalla):
                       shield, atk{value,dur.}  cura, escudo y/o buff de ATK.
     turnShield        value, max               Al empezar su turno gana escudo (hasta un máximo).
     turnRegen         percent                  Al empezar su turno recupera ese % de su vida máxima.
     openingShield     value                    Escudo al empezar su PRIMER turno en combate.
     openingBuff       stat, value, duration    Buff (atk/def/spd) al empezar su PRIMER turno en combate.
     executeDamage     threshold, bonus         Sus ataques hacen +bonus de daño (directo, ignora DEF y
                                                escudo) a enemigos que estaban por debajo de ese % de vida.
     onKill            healPercent, atk{…}      Al derrotar a un enemigo: cura y/o buff de ATK.
     onHitDebuff       stat, value, duration,   Al recibir un ataque, probabilidad de debilitar al atacante.
                       chance

   Cómo funciona (no modifica game.js; sirve en todos los modos, también contra la IA):
     - Envuelve applyDamage() (golpes, bajas, remate, represalias), startTurnActions()
       (efectos de inicio de turno), getEffectiveAcc() (esquiva) y endTurn() (turno extra).
     - Todo usa gameRandom() y las funciones del propio juego (applyHealing, applyEffect,
       applyDebuff, tryPassiveRevive), así que respeta revivir, escudos y el multijugador.
     - Añade la insignia ✨ en las tarjetas y la ficha de pasiva en el Glosario.

   Debe cargarse DESPUÉS de game.js (y antes de i18n.js).
*/
(function () {
  'use strict';

  const TYPES = new Set(['ultKillExtraTurn', 'dodge', 'lastStand', 'turnShield', 'turnRegen',
    'openingShield', 'openingBuff', 'executeDamage', 'onKill', 'onHitDebuff']);
  const getPassive = (ch, type) => (ch && ch.passive && ch.passive.type === type) ? ch.passive : null;
  const pname = ch => (ch.passive && ch.passive.name) || 'Pasiva';
  const enemyOf = key => key === 'p1' ? 'p2' : 'p1';

  let pending = null;                 // ULT que ha matado: { owner, moveId, turn, victim, name }
  const entered = new WeakSet();      // personajes que ya han empezado su primer turno
  const stood = new WeakSet();        // personajes cuyo lastStand ya se gastó

  const announce = (ch, extra) =>
    log(`✨ ${ch.name} activa su pasiva «${pname(ch)}»${extra || '.'}`);

  /* ---------- buffs reutilizando el motor del juego ---------- */
  function giveAtkBuff(ch, b) {
    if (!b) return;
    applyEffect(ch, ch, { name: pname(ch), effect: { type: 'tempAtk', value: Number(b.value) || 0, duration: Number(b.duration) || 2 } });
  }
  function heal(ch, pct) {
    if (!(pct > 0) || ch.hp <= 0) return 0;
    return applyHealing(ch, ch, Math.max(1, Math.round(ch.maxHp * pct)), pname(ch));
  }

  /* ---------- 1) golpes: remate, bajas, última resistencia, represalia, ULT ---------- */
  function afterHit(actor, target, move, before, frac) {
    const dealt = before - target.hp;

    // Remate (executeDamage): daño extra a enemigos ya débiles.
    const ex = getPassive(actor, 'executeDamage');
    if (ex && move && Number(move.power) > 0 && !move._isCounter && target.hp > 0 && dealt > 0 &&
        frac <= (Number(ex.threshold) || 0.5)) {
      const extra = Math.max(1, Math.round(dealt * (Number(ex.bonus) || 0.3)));
      target.hp = Math.max(0, target.hp - extra);
      announce(actor, `: +${extra} de daño a ${target.name}.`);
      if (target.hp <= 0) tryPassiveRevive(target);
    }

    const killed = target.hp <= 0;       // si revivió gracias a su propia pasiva, NO cuenta como baja

    if (killed) {
      // ULT que mata → turno extra (se resuelve en endTurn, que es donde game.js ya cerró el cooldown).
      const ult = getPassive(actor, 'ultKillExtraTurn');
      if (ult && move && move.id === ult.moveId && !pending) {
        pending = { owner: state.turnOwner, moveId: ult.moveId, turn: state.turnCount, victim: target.name, name: ult.name };
      }
      // Tras una baja: cura / buff.
      const ok = getPassive(actor, 'onKill');
      if (ok && actor.hp > 0 && actor !== target) {
        announce(actor);
        heal(actor, Number(ok.healPercent) || 0);
        giveAtkBuff(actor, ok.atk);
      }
      return;
    }

    // Última resistencia (una vez por batalla).
    const ls = getPassive(target, 'lastStand');
    if (ls && !stood.has(target) && target.maxHp && frac > (Number(ls.threshold) || 0.35) &&
        target.hp / target.maxHp <= (Number(ls.threshold) || 0.35)) {
      stood.add(target);
      announce(target);
      if (ls.shield) { target.shield = (target.shield || 0) + Number(ls.shield); log(`✨ ${target.name} gana ${ls.shield} de escudo.`); }
      heal(target, Number(ls.healPercent) || 0);
      giveAtkBuff(target, ls.atk);
    }

    // Represalia al ser golpeado.
    const oh = getPassive(target, 'onHitDebuff');
    if (oh && dealt > 0 && actor && actor !== target && actor.hp > 0 && !(move && move._isCounter) &&
        getKeyOfTarget(actor) !== getKeyOfTarget(target)) {
      if (gameRandom() < (oh.chance != null ? Number(oh.chance) : 1)) {
        announce(target);
        applyDebuff(target, actor, { stat: oh.stat, value: oh.value, duration: oh.duration });
      }
    }
  }

  function hookDamage() {
    const _dmg = window.applyDamage;
    window.applyDamage = function (actor, target, move) {
      const before = target ? target.hp : 0;
      const frac = (target && target.maxHp) ? before / target.maxHp : 1;
      const r = _dmg.apply(this, arguments);
      try {
        if (target && before > 0 && actor && typeof state !== 'undefined' && state.phase === 'battle') {
          afterHit(actor, target, move, before, frac);
        }
      } catch (e) { console.warn('[pasivas.js]', e); }
      return r;
    };
  }

  /* ---------- 2) efectos de inicio de turno ---------- */
  function onTurnStart(a) {
    const p = a.passive;
    if (!p) return;

    if (!entered.has(a)) {
      entered.add(a);
      const os = getPassive(a, 'openingShield');
      if (os) {
        a.shield = (a.shield || 0) + Number(os.value);
        announce(a, `: +${os.value} de escudo.`);
      }
      const ob = getPassive(a, 'openingBuff');
      if (ob) {
        announce(a);
        const type = { atk: 'tempAtk', def: 'tempDef', spd: 'tempSpd' }[ob.stat] || 'tempAtk';
        applyEffect(a, a, { name: pname(a), effect: { type, value: Number(ob.value) || 0, duration: Number(ob.duration) || 2 } });
      }
    }

    const ts = getPassive(a, 'turnShield');
    if (ts) {
      const max = Number(ts.max) || Infinity, add = Number(ts.value) || 0;
      const gain = Math.max(0, Math.min(add, max - (a.shield || 0)));
      if (gain > 0) { a.shield = (a.shield || 0) + gain; announce(a, `: +${gain} de escudo.`); }
    }

    const tr = getPassive(a, 'turnRegen');
    if (tr && a.hp < a.maxHp) {
      const healed = heal(a, Number(tr.percent) || 0);
      if (healed > 0) announce(a);
    }
  }

  function hookTurnStart() {
    const _start = window.startTurnActions;
    window.startTurnActions = function () {
      try {
        if (typeof state !== 'undefined' && state.phase === 'battle') {
          const a = getActive(state.turnOwner);
          if (a && a.hp > 0) onTurnStart(a);
        }
      } catch (e) { console.warn('[pasivas.js]', e); }
      return _start.apply(this, arguments);
    };
  }

  /* ---------- 3) esquiva (dodge) vía precisión ---------- */
  function hookAccuracy() {
    const _acc = window.getEffectiveAcc;
    if (typeof _acc !== 'function') return;
    window.getEffectiveAcc = function (actor, move) {
      let a = _acc.apply(this, arguments);
      try {
        if (move && !move.aoe && (Number(move.power) > 0 || move.type === 'attack')) {
          const key = getKeyOfTarget(actor);
          if (key) {
            const foe = getActive(enemyOf(key));
            const p = getPassive(foe, 'dodge');
            if (p && foe.hp > 0) a = a * (1 - Math.max(0, Math.min(0.9, Number(p.chance) || 0)));
          }
        }
      } catch (e) { /* sin esquiva */ }
      return a;
    };
  }

  /* ---------- 4) turno extra + cooldown regenerado ---------- */
  function hookEndTurn() {
    const _end = window.endTurn;
    window.endTurn = function (finishedActor) {
      const pd = pending;
      pending = null;
      if (!pd || typeof state === 'undefined' || state.phase !== 'battle' ||
          pd.turn !== state.turnCount || pd.owner !== state.turnOwner) {
        return _end.apply(this, arguments);
      }
      const actor = finishedActor || getActive(state.turnOwner);
      if (!actor || actor.hp <= 0) return _end.apply(this, arguments);   // cayó por reflejo, etc.

      const mv = actor.moves.find(m => m.id === pd.moveId);
      if (mv) mv.cd = 0;
      log(`⚔️ ¡${actor.name} activa su pasiva «${pd.name || 'Pasiva'}»! Derrota a ${pd.victim} con su ULT: turno extra y ${mv ? mv.name : 'su ULT'} lista de nuevo.`);

      processEndOfTurnEffects(actor);   // cierra el turno actual, como endTurn()
      startTurnActions();               // abre otro turno para el MISMO jugador
      updateTurnInfo();
      updateArena();
      if (state.mode === 'pve' && state.turnOwner === 'p2' && state.phase === 'battle') {
        setTimeout(() => aiTakeTurn(), 900);
      }
    };
  }

  /* ---------- 5) insignia y ficha en el Glosario ---------- */
  const passiveTitle = p => `${p.name || 'Pasiva'}: ${p.desc || ''}`.replace(/"/g, '&quot;');

  function hookUI() {
    const _badge = window.passiveBadgeHTML;
    if (typeof _badge === 'function') {
      window.passiveBadgeHTML = function (ch) {
        const r = _badge.apply(this, arguments);
        if (r) return r;
        return (ch && ch.passive && TYPES.has(ch.passive.type)) ? `<div class="passive-badge" title="${passiveTitle(ch.passive)}">✨</div>` : '';
      };
    }
    const _detail = window.openCharacterDetail;
    if (typeof _detail === 'function') {
      window.openCharacterDetail = function (id) {
        const r = _detail.apply(this, arguments);
        try {
          const ch = findBaseById(id);
          const body = document.getElementById('glossary-detail-body');
          const p = ch && ch.passive;
          if (body && p && TYPES.has(p.type) && !body.querySelector('.glossary-passive')) {
            const box = document.createElement('div');
            box.className = 'glossary-passive';
            box.innerHTML = `<h4>Pasiva</h4><div class="glossary-passive-card">
              <div class="glossary-passive-top"><span class="passive-name">✨ ${p.name || 'Pasiva'}</span></div>
              <div class="glossary-passive-desc">${p.desc || ''}</div></div>`;
            const moves = body.querySelector('.glossary-moves');
            if (moves) body.insertBefore(box, moves); else body.appendChild(box);
          }
        } catch (e) { console.warn('[pasivas.js]', e); }
        return r;
      };
    }
  }

  /* ---------- traducción (la recoge i18n.js) ---------- */
  (window.I18N_DICTS = window.I18N_DICTS || []).push({ lang: 'en', entries: {
    '⚔️ ¡{0} activa su pasiva «{1}»! Derrota a {2} con su ULT: turno extra y {3} lista de nuevo.':
      '⚔️ {0} triggers its passive «{1}»! It defeats {2} with its ULT: extra turn and {3} is ready again.',
    '✨ {0} activa su pasiva «{1}».': '✨ {0} triggers its passive «{1}».',
    '✨ {0} activa su pasiva «{1}»: +{2} de escudo.': '✨ {0} triggers its passive «{1}»: +{2} shield.',
    '✨ {0} activa su pasiva «{1}»: +{2} de daño a {3}.': '✨ {0} triggers its passive «{1}»: +{2} damage to {3}.',
    '✨ {0} gana {1} de escudo.': '✨ {0} gains {1} shield.',

    'Nunca Me Rendiré': 'I Will Never Give Up',
    'Si mata a un enemigo con su ULT, gana un turno extra y su ULT queda lista de nuevo.':
      'If it defeats an enemy with its ULT, it gains an extra turn and its ULT is ready again.',
    'Reflejos Perezosos': 'Lazy Reflexes',
    'El 20% de los ataques enemigos de un solo objetivo contra él fallan automáticamente.':
      '20% of single-target enemy attacks against him automatically miss.',
    'Zenkai': 'Zenkai',
    'La primera vez que su vida baja del 35%: recupera un 15% de su vida máxima y gana +8 ATK durante 3 turnos.':
      'The first time his health drops below 35%: recovers 15% of his max health and gains +8 ATK for 3 turns.',
    '¡Doraemon, Ayúdame!': 'Doraemon, Help Me!',
    'La primera vez que su vida baja del 40%: gana 30 de escudo y recupera un 10% de su vida máxima.':
      'The first time his health drops below 40%: gains 30 shield and recovers 10% of his max health.',
    'Capas de Ogro': 'Ogre Layers',
    'Al comenzar su turno gana 8 de escudo (máximo 40).': 'At the start of his turn he gains 8 shield (max. 40).',
    'Cura Milagrosa': 'Miraculous Cure',
    'Al comenzar su turno recupera un 8% de su vida máxima.': 'At the start of her turn she recovers 8% of her max health.',
    'Aguja Certera': 'Sure Needle',
    'Sus ataques infligen un 30% más de daño (directo) a enemigos con la vida por debajo del 50%.':
      'Her attacks deal 30% more (direct) damage to enemies below 50% health.',
    'Pentakill': 'Pentakill',
    'Al derrotar a un enemigo recupera un 25% de su vida máxima y gana +4 ATK durante 3 turnos.':
      'When he defeats an enemy he recovers 25% of his max health and gains +4 ATK for 3 turns.',
    'Berrinche': 'Tantrum',
    'Al recibir un ataque, tiene un 35% de probabilidad de reducir la SPD del atacante en 4 durante 2 turnos.':
      'When hit by an attack, it has a 35% chance to lower the attacker\'s SPD by 4 for 2 turns.',
    '¡El Gran Papyrus!': 'The Great Papyrus!',
    'Al comenzar su primer turno en combate gana +6 ATK durante 3 turnos.':
      'At the start of his first turn in battle he gains +6 ATK for 3 turns.',
    'Patrocinio Oficial': 'Official Sponsorship',
    'Al comenzar su primer turno en combate gana 25 de escudo.':
      'At the start of his first turn in battle he gains 25 shield.'
  } });

  function init() {
    const need = ['applyDamage', 'endTurn', 'startTurnActions', 'getKeyOfTarget', 'applyHealing', 'applyEffect', 'applyDebuff', 'tryPassiveRevive'];
    if (need.some(n => typeof window[n] !== 'function')) {
      console.warn('[pasivas.js] no se encontró el motor de combate; pasivas desactivadas');
      return;
    }
    hookDamage(); hookTurnStart(); hookAccuracy(); hookEndTurn(); hookUI();
    console.log('[pasivas.js] pasivas de evento activas');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
