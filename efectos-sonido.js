/* efectos-sonido.js — EFECTOS DE SONIDO del juego
   Se carga desde juego.html con <script src="efectos-sonido.js" defer></script>.

   Para añadir un efecto nuevo:
     1) Pon el archivo de audio en la carpeta «efectos de sonido» (junto a juego.html).
     2) Añade una línea en SONIDOS:   nombre: { src: 'efectos de sonido/archivo.mp3', volume: 0.6 }
     3) Reprodúcelo desde cualquier script con:   SFX.play('nombre');

   Sonidos automáticos:
     'click'   al hacer clic en cualquier cosa seleccionable (botones, tarjetas de personaje,
               habilidades, filtros, huecos…).
     'cancel'  al hacer clic en un botón de volver atrás, cerrar (✕) o cancelar.
     'app'     al elegir un modo de juego en el menú principal (PvP, PvE, con baneos, Historia). */
(function () {
  'use strict';

  const SONIDOS = {
    click:  { src: 'efectos de sonido/press.mp3',  volume: 0.6 },
    cancel: { src: 'efectos de sonido/cancel.mp3', volume: 0.6 },
    app:    { src: 'efectos de sonido/app.mp3',    volume: 0.6 },
    mision:      { src: 'efectos de sonido/misiones.mp3',     volume: 0.7 },   // al elegir una misión
    enhorabuena: { src: 'efectos de sonido/enhorabuena.mp3',  volume: 0.8 }    // al reclamar la recompensa
    // ejemplo: hit:  { src: 'efectos de sonido/hit.mp3',  volume: 0.8 },
    // ejemplo: win:  { src: 'efectos de sonido/win.mp3',  volume: 0.8 },
  };

  const PREFS_KEY = 'sfx_prefs';
  let prefs = { enabled: true, volume: 1 };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); } catch (e) { /* sin preferencias */ }
  const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) { /* ignorar */ } };

  /* ---------- precarga ---------- */
  const base = {};
  Object.keys(SONIDOS).forEach(name => {
    const a = new Audio(encodeURI(SONIDOS[name].src));
    a.preload = 'auto';
    base[name] = a;
  });

  /* ---------- reproducción (permite solaparse si haces clic muy rápido) ---------- */
  function play(name) {
    if (!prefs.enabled) return;
    const def = SONIDOS[name], src = base[name];
    if (!def || !src) return;
    try {
      const a = src.cloneNode(true);
      a.volume = Math.max(0, Math.min(1, (def.volume != null ? def.volume : 1) * prefs.volume));
      const p = a.play();
      if (p && p.catch) p.catch(() => { /* el navegador bloqueó el audio hasta que haya interacción */ });
    } catch (e) { /* sin sonido */ }
  }

  /* ---------- ¿es algo seleccionable? ---------- */
  const NATIVOS = 'button, a[href], select, summary, label, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], [role="button"], [role="tab"], [role="option"]';

  function esSeleccionable(start) {
    let el = start, i = 0;
    while (el && el.nodeType === 1 && el !== document.body && i < 8) {
      if (el.disabled || el.getAttribute('aria-disabled') === 'true' || el.classList.contains('disabled')) return false;
      if (el.matches(NATIVOS) || typeof el.onclick === 'function') return true;
      // Tarjetas y huecos con listener: se reconocen por el cursor de mano.
      if (getComputedStyle(el).cursor === 'pointer') return true;
      el = el.parentElement; i++;
    }
    return false;
  }

  /* ---------- ¿es volver atrás / cerrar / cancelar? ---------- */
  // id o clase con palabras como back, close, cancel, volver, cerrar…  (story-back, settings-close…)
  const RE_NOMBRE = /(^|[-_])(back|close|cancel|volver|cerrar|cancelar|atras|salir)([-_]|$)/i;
  // texto: «← Volver», «Cerrar», «Cancelar», «✕», «×», «⬅ Menú»…
  const RE_TEXTO_PALABRA = /^[\s←⬅◀‹«<]*(volver|atrás|atras|cerrar|cancelar|salir|back|close|cancel)(\s|$)/i;
  const RE_TEXTO_CRUZ = /^\s*[✕✖✗✘×❌xX]\s*$/;
  const RE_TEXTO_FLECHA = /^\s*[←⬅◀‹«]/;

  function esCancelar(start) {
    let el = start, i = 0;
    while (el && el.nodeType === 1 && el !== document.body && i < 5) {
      if (RE_NOMBRE.test(el.id || '')) return true;
      if ([...el.classList].some(c => c !== 'back-btn' && RE_NOMBRE.test(c))) return true;   // 'back-btn' se usa también en «✔ Listo»: manda el texto
      const t = (el.textContent || '').trim();
      if (t && t.length <= 25 && (RE_TEXTO_PALABRA.test(t) || RE_TEXTO_CRUZ.test(t) || RE_TEXTO_FLECHA.test(t))) return true;
      if (el.matches(NATIVOS) && !el.matches('label')) break;   // ya hemos llegado al botón: no subir más
      el = el.parentElement; i++;
    }
    return false;
  }

  /* ---------- ¿es un botón de modo de juego? ---------- */
  // Añade aquí los ids de nuevos modos si los creas.
  const SEL_MODOS = '#menu-pvp, #menu-pve, #menu-pvp-ban, #menu-pve-ban, #menu-story';
  const esModo = el => !!(el.closest && el.closest(SEL_MODOS));

  /* ---------- ¿estamos en pleno combate? ---------- */
  // `state` es el objeto global de game.js; phase === 'battle' mientras dura la pelea
  // (en cualquier modo). Durante el combate NO suena el «click» (press.mp3).
  function enCombate() {
    try { return typeof state !== 'undefined' && state.phase === 'battle'; } catch (e) { return false; }
  }

  // «🏠 Volver al inicio» (combate y fase de baneos): el juego recarga la página, y la recarga
  // cortaría el sonido. Por eso se gestiona aquí: suena cancel.mp3 y se recarga al terminar.
  const SEL_INICIO = '#home-back, #ban-home-back';
  let saliendo = false;

  function esperaSonido(name) {
    if (!prefs.enabled || !SONIDOS[name]) return 0;
    const d = base[name] && isFinite(base[name].duration) ? base[name].duration : 0;
    return Math.min(1500, Math.max(350, d ? d * 1000 + 80 : 500));
  }

  function volverAlInicio() {
    if (saliendo) return;
    if (enCombate() && !confirm('¿Volver al inicio? Se perderá el combate en curso.')) return;
    saliendo = true;
    play('cancel');
    setTimeout(() => location.reload(), esperaSonido('cancel'));
  }

  // Captura: suena aunque otro script corte la propagación (stopPropagation).
  document.addEventListener('click', e => {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest(SEL_INICIO)) {
      e.stopImmediatePropagation();   // evita que goHome() recargue antes de que suene
      e.preventDefault();
      volverAlInicio();
      return;
    }
    if (!esSeleccionable(e.target)) return;
    // Botones con su propio sonido (data-sfx="none"): no suena el click genérico.
    if (e.target.closest('[data-sfx="none"]')) return;
    if (esModo(e.target)) { play('app'); return; }
    if (esCancelar(e.target)) { play('cancel'); return; }
    if (enCombate()) return;   // en combate no suena press.mp3
    play('click');
  }, true);

  /* ---------- API pública ---------- */
  window.SFX = {
    play,
    setEnabled(v) { prefs.enabled = !!v; savePrefs(); },
    setVolume(v) { prefs.volume = Math.max(0, Math.min(1, Number(v) || 0)); savePrefs(); },
    get enabled() { return prefs.enabled; },
    get volume() { return prefs.volume; }
  };
})();
