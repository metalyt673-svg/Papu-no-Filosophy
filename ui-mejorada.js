/* ui-mejorada.js
   Complemento de ui-mejorada.css. NO cambia la lógica del juego: solo lee el
   estado (`state`) y el DOM y añade clases / pequeños adornos visuales:

     - body.in-battle   → hay una batalla en curso (el panel de selección se
                          muestra como equipo compacto con barras de vida).
     - body.pve-mode    → modo contra la IA (se oculta la lista del rival).
     - .team-panel.is-turn → marca de quién tiene el turno.
     - Barras de vida de los 3 personajes de cada equipo + color según la vida.
     - Estadísticas del luchador activo en "chips".

   Instalación (juego.html), al final, tras los demás scripts:
       <script src="ui-mejorada.js" defer></script>
   Para quitarlo: borra esa línea (y la del .css). */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const st = () => { try { return state; } catch (e) { return null; } };
  const body = document.body;

  /* ---------- Estado general: en batalla / contra la IA ---------- */
  function syncMode() {
    const s = st();
    const row = document.querySelector('.selector-row');
    const hidden = !!row && row.style.display === 'none';
    const hasTeams = !!s && Array.isArray(s.teams.p1) && s.teams.p1.some(Boolean);
    const was = body.classList.contains('in-battle');
    const now = hidden && hasTeams;
    body.classList.toggle('in-battle', now);

    const t = $('p2-title');
    body.classList.toggle('pve-mode', !!t && /^IA\b/.test(t.textContent.trim()));

    if (now && !was) { decorateSlots('p1'); decorateSlots('p2'); }
    syncTurn();
  }

  /* ---------- Turno actual ---------- */
  function syncTurn() {
    const s = st();
    if (!s) return;
    ['p1', 'p2'].forEach(p => {
      const box = $('fighter-box-' + p);
      const panel = box && box.closest('.team-panel');
      if (!panel) return;
      panel.dataset.side = p;
      panel.classList.toggle('is-turn', s.phase === 'battle' && s.turnOwner === p);
    });
  }

  /* ---------- Equipo: nombre + barra de vida bajo cada retrato ---------- */
  function lvl(pct) { return pct <= 25 ? 'low' : pct <= 50 ? 'mid' : 'ok'; }

  function decorateSlots(player) {
    const s = st();
    const box = $(player + '-slots');
    if (!s || !box || !body.classList.contains('in-battle')) return;
    const team = s.teams[player] || [];
    Array.from(box.children).forEach((slot, i) => {
      const c = team[i];
      if (!c || slot.querySelector('.slot-meta')) return;
      const max = Math.max(1, c.maxHp || 1);
      const hp = Math.max(0, c.hp || 0);
      const pct = Math.min(100, Math.round(hp / max * 100));

      const meta = document.createElement('div');
      meta.className = 'slot-meta';

      const name = document.createElement('div');
      name.className = 'slot-name';
      name.textContent = c.name || '';
      name.title = c.name || '';

      const bar = document.createElement('div');
      bar.className = 'slot-hp';
      const fill = document.createElement('i');
      fill.style.width = pct + '%';
      fill.dataset.lvl = lvl(pct);
      bar.appendChild(fill);

      const num = document.createElement('div');
      num.className = 'slot-hpnum';
      num.textContent = hp + '/' + max;

      meta.append(name, bar, num);
      slot.appendChild(meta);
    });
  }

  function watchSlots(player) {
    const box = $(player + '-slots');
    if (!box) return;
    // Solo se observan los hijos directos: añadir .slot-meta dentro de un slot no re-dispara esto.
    new MutationObserver(() => decorateSlots(player)).observe(box, { childList: true });
  }

  /* ---------- Estadísticas del activo en chips ---------- */
  function chipKind(t) {
    if (/^HP/.test(t)) return 'hp';
    if (/^Escudo/.test(t)) return 'shield';
    if (/^ATK/.test(t)) return 'atk';
    if (/^DEF/.test(t)) return 'def';
    if (/^SPD/.test(t)) return 'spd';
    return 'status';
  }

  function chipify(player) {
    const box = $('stats-' + player);
    if (!box) return;
    const sm = box.querySelector('small');
    // Si el texto lleva etiquetas internas no se toca (se deja tal cual lo pinta game.js)
    if (!sm || sm.children.length) return;
    const txt = sm.textContent;
    if (!/^HP:/.test(txt)) return;

    const parts = txt.split(' · ')
      .flatMap(p => /^ATK:\S+ DEF:\S+ SPD:\S+$/.test(p.trim()) ? p.trim().split(' ') : [p])
      .map(p => p.trim())
      .filter(Boolean);

    const wrap = document.createElement('div');
    wrap.className = 'chips';
    parts.forEach(p => {
      const chip = document.createElement('span');
      chip.className = 'stat-chip ' + chipKind(p);
      chip.textContent = p;
      wrap.appendChild(chip);
    });
    box.replaceChildren(wrap);
  }

  function watchStats(player) {
    const box = $('stats-' + player);
    if (!box) return;
    new MutationObserver(() => chipify(player)).observe(box, { childList: true });
    chipify(player);
  }

  /* ---------- Color de la barra de vida principal según % ---------- */
  function watchHp(player) {
    const bar = $('hpbar-' + player);
    const fill = bar && bar.querySelector('i');
    if (!fill) return;
    const apply = () => { fill.dataset.lvl = lvl(parseFloat(fill.style.width) || 0); };
    new MutationObserver(apply).observe(fill, { attributes: true, attributeFilter: ['style'] });
    apply();
  }

  /* ---------- Arranque ---------- */
  function init() {
    const row = document.querySelector('.selector-row');
    if (row) new MutationObserver(syncMode).observe(row, { attributes: true, attributeFilter: ['style'] });

    const title = $('p2-title');
    if (title) new MutationObserver(syncMode).observe(title, { childList: true, characterData: true, subtree: true });

    const turn = $('turnInfo');
    if (turn) new MutationObserver(syncMode).observe(turn, { childList: true, characterData: true, subtree: true });

    ['p1', 'p2'].forEach(p => { watchSlots(p); watchStats(p); watchHp(p); });
    syncMode();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
