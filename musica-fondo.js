/* musica-fondo.js — MÚSICA DE FONDO DEL MENÚ
   Suena en bucle el archivo  background.mp3  (guárdalo junto a juego.html, como battle-music.mp3).

   CUÁNDO SUENA:
     ✔ Pantalla de inicio, Glosario, Notas de parche, Inventario, Tienda, Perfil, Amigos, Fama, etc.
     ✔ Selección de equipo y fase de baneos (todavía no hay música ahí).
     ✘ NO suena durante el combate (usa la música de batalla) ni en el Modo Historia (usa la suya).
     ✘ Se calla mientras estés probando una pista en ⚙️ Configuración.
   Se funde (fade) al entrar y salir, se pausa si cambias de pestaña y se puede
   apagar / cambiar de volumen en ⚙️ Configuración (sección «🏠 Música del menú»).

   AJUSTES:  SRC (archivo), DEFAULT_VOLUME, FADE_MS. */
(function () {
  'use strict';

  const SRC = 'background.mp3';
  const DEFAULT_VOLUME = 0.35;
  const FADE_MS = 700;
  const KEY = 'batalla-menu-music';

  const byId = id => document.getElementById(id);

  /* ---------------- ajustes guardados ---------------- */
  const cfg = { enabled: true, volume: DEFAULT_VOLUME };
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    if (typeof d.enabled === 'boolean') cfg.enabled = d.enabled;
    if (typeof d.volume === 'number') cfg.volume = Math.min(1, Math.max(0, d.volume));
  } catch (e) { /* ignorar */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* modo privado */ } };

  /* ---------------- reproductor ---------------- */
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  audio.src = SRC;
  let broken = false;                        // background.mp3 no existe o no se puede leer
  audio.addEventListener('error', () => { broken = true; });
  audio.addEventListener('canplay', () => { broken = false; });

  let fadeTimer = null, fadeTarget = 0;
  function fadeTo(target, done) {
    if (fadeTarget === target) return;
    fadeTarget = target;
    clearInterval(fadeTimer);
    const from = audio.volume, steps = Math.max(1, Math.round(FADE_MS / 40));
    let i = 0;
    fadeTimer = setInterval(() => {
      i++;
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * (i / steps)));
      if (i >= steps) { clearInterval(fadeTimer); fadeTimer = null; audio.volume = target; if (done) done(); }
    }, 40);
  }

  /* ---------------- ¿debe sonar ahora? ---------------- */
  const shown = el => !!el && getComputedStyle(el).display !== 'none';
  const otherAudioPlaying = () => ['battle-music', 'story-dialogue-music', 'story-battle-music']
    .some(id => { const a = byId(id); return a && !a.paused; });

  function shouldPlay() {
    if (!cfg.enabled || broken || document.hidden) return false;
    if (shown(byId('story-screen'))) return false;                // Modo Historia: su propia música
    if (otherAudioPlaying()) return false;                         // batalla o vista previa de pistas
    const st = window._state;
    if (st && (st.storyMode || st.phase === 'battle' || st.phase === 'ended') && shown(byId('game-root'))) return false;   // combate
    return true;
  }

  function tick() {
    if (shouldPlay()) {
      if (audio.paused) {
        const p = audio.play();
        if (p && p.catch) p.catch(() => { /* el navegador exige un clic antes de reproducir: se reintenta */ });
      }
      if (!audio.paused) fadeTo(cfg.volume);
    } else if (!audio.paused && fadeTarget !== 0) {
      fadeTo(0, () => { if (!shouldPlay()) audio.pause(); });
    }
  }

  setInterval(tick, 400);
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => document.addEventListener(ev, tick, { passive: true }));
  document.addEventListener('visibilitychange', tick);

  /* ---------------- ajustes en ⚙️ Configuración ---------------- */
  function injectSettings() {
    const modal = byId('settings-modal');
    if (!modal || byId('menu-music-section')) return;
    const actions = modal.querySelector('.settings-actions');
    if (!actions) return;
    const pct = Math.round(cfg.volume * 100);
    const box = document.createElement('div');
    box.id = 'menu-music-section';
    box.innerHTML = `
      <hr style="border-color:rgba(148,163,184,.15);margin:16px 0">
      <h3>🏠 Música del menú</h3>
      <p class="small">Suena en el inicio, el inventario, la tienda y demás pantallas (no en combate ni en el Modo Historia).</p>
      <div class="settings-section">
        <h4>🎧 Volumen</h4>
        <div class="volume-row">
          <span>🔈</span>
          <input id="menu-volume-slider" type="range" min="0" max="100" step="1" value="${pct}">
          <span id="menu-volume-value" class="volume-value">${pct}%</span>
        </div>
        <label class="switch-row">
          <input id="menu-music-enabled" type="checkbox" ${cfg.enabled ? 'checked' : ''}>
          <span>Reproducir música en el menú</span>
        </label>
        <div class="small" style="line-height:1.7">Guarda tu canción en esta misma carpeta con el nombre <strong>${SRC}</strong>.</div>
      </div>`;
    actions.parentNode.insertBefore(box, actions);
    byId('menu-volume-slider').addEventListener('input', e => {
      cfg.volume = Number(e.target.value) / 100;
      byId('menu-volume-value').textContent = e.target.value + '%';
      if (!audio.paused && fadeTarget !== 0) { clearInterval(fadeTimer); fadeTimer = null; audio.volume = cfg.volume; fadeTarget = cfg.volume; }
      save();
    });
    byId('menu-music-enabled').addEventListener('change', e => { cfg.enabled = e.target.checked; save(); tick(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectSettings);
  else injectSettings();

  window.MUSICA_FONDO = { tick, audio, cfg };
})();
