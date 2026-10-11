/* i18n.js
   Selector de idioma en ⚙️ Configuración: 🇪🇸 Español (original) · 🇬🇧 English (traducción).

   Cómo funciona (sin tocar game.js ni el resto de módulos):
     - El juego sigue escribiendo SIEMPRE en español. Este módulo traduce al vuelo
       lo que aparece en pantalla: nodos de texto y los atributos title / placeholder /
       aria-label / alt, además de alert(), confirm() y prompt().
     - Un MutationObserver traduce todo lo que el juego pinte después (turnos, registro
       de combate, ventanas, otros modos…). En español no hace nada (cero coste).
     - Al volver a "Español" se restauran los textos originales exactos.
     - Los textos con datos variables se traducen con plantillas: "{0} usó {1} y causó {2}
       a {3}." → "{0} used {1} and dealt {2} to {3}." Los huecos {n} (nombres, números,
       nombres de habilidades…) se traducen a su vez si están en el diccionario.
     - Lo que no esté en el diccionario se queda en español (nunca se rompe nada).

   Diccionarios: ficheros i18n-*.js que hacen
       (window.I18N_DICTS = window.I18N_DICTS || []).push({ lang: 'en', entries: { 'texto es': 'text en' } });
   y se cargan ANTES que este archivo. Este debe cargarse el ÚLTIMO (después de
   registro.js, que clasifica el registro leyendo el texto en español, y de interfaz.js).

   Para completar traducciones:   I18N.missing()  → lista de textos sin traducir vistos
   en esta sesión;  I18N.copyMissing()  → los copia como JSON al portapapeles.

   API:  I18N.lang · I18N.setLang('en'|'es') · I18N.t('texto en español') · I18N.add('en', {…})
*/
(function () {
  'use strict';

  const STORE_KEY = 'batalla-idioma';
  const LANGS = {
    es: { flag: '🇪🇸', label: 'Español', sub: 'Original' },
    en: { flag: '🇬🇧', label: 'English', sub: 'Translation' }
  };
  const NOTES = {
    es: 'Todo el juego en español (versión original).',
    en: 'The whole game in English. Any text that hasn\'t been translated yet stays in Spanish.'
  };
  const ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);   // ni texto ni atributos
  const NO_TEXT = new Set(['TEXTAREA']);                         // su texto es lo que escribe la persona
  const HAS_LETTER = /[A-Za-zÁÉÍÓÚÑáéíóúñü]{3}/;

  let lang = 'es';
  try { const v = localStorage.getItem(STORE_KEY); if (v && LANGS[v]) lang = v; } catch (e) { /* sin almacenamiento */ }

  /* ---------- diccionarios ---------- */
  const D = {};   // D[code] = { exact: Map, tpl: [], phrases: [], re: null, sorted: false }
  const norm = s => String(s).replace(/\s+/g, ' ').trim();
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cache = {};            // cache[code] = Map
  const missingSet = new Set();

  function dict(code) {
    return D[code] || (D[code] = { exact: new Map(), tpl: [], phrases: new Map(), re: null });
  }

  function add(code, entries) {
    const d = dict(code);
    cache[code] = new Map();
    d.re = null;
    for (const es in entries) {
      const en = entries[es];
      if (typeof en !== 'string') continue;
      const key = norm(es);
      if (!key) continue;
      if (/\{\d+\}/.test(key)) {
        const parts = key.split(/\{(\d+)\}/);          // [lit, idx, lit, idx, …, lit]
        const lits = parts.filter((_, i) => i % 2 === 0);
        const litLen = lits.join('').replace(/\s/g, '').length;
        if (litLen < 3) continue;                      // plantilla demasiado genérica
        let src = '^';
        const order = [];
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) src += escRe(parts[i]);
          else { src += '(.*?)'; order.push(Number(parts[i])); }
        }
        src += '$';
        d.tpl.push({ re: new RegExp(src, 's'), order, out: en, weight: litLen });
      } else {
        d.exact.set(key, en);
        if (key.length >= 6 && key.length <= 90 && HAS_LETTER.test(key)) d.phrases.set(key, en);
      }
    }
    d.tpl.sort((a, b) => b.weight - a.weight);
  }

  function phraseRegex(d) {
    if (d.re) return d.re;
    const keys = [...d.phrases.keys()].sort((a, b) => b.length - a.length);
    if (!keys.length) return (d.re = /$^/);
    d.re = new RegExp('(?<![\\p{L}\\p{N}])(?:' + keys.map(escRe).join('|') + ')(?![\\p{L}\\p{N}])', 'gu');
    return d.re;
  }

  /* ---------- traducción de una cadena ---------- */
  function lookup(code, cn, depth) {
    const d = D[code];
    if (!d) return null;
    const hit = d.exact.get(cn);
    if (hit !== undefined) return hit;

    for (const t of d.tpl) {
      const m = t.re.exec(cn);
      if (!m) continue;
      const groups = {};
      t.order.forEach((n, i) => {
        if (groups[n] === undefined) groups[n] = m[i + 1];
      });
      return t.out.replace(/\{(\d+)\}/g, (_, n) => {
        const g = groups[n];
        if (g === undefined) return '';
        if (depth > 3 || !/[A-Za-zÁÉÍÓÚÑáéíóúñü]{2}/.test(g)) return g;
        const r = tr(code, g, depth + 1);
        return r;
      });
    }

    if (HAS_LETTER.test(cn) && cn.length >= 4) {      // último recurso: frases conocidas dentro del texto
      const re = phraseRegex(d);
      re.lastIndex = 0;
      let covered = 0;
      const out = cn.replace(re, p => { const r = d.phrases.get(p); if (r !== undefined) { covered += p.length; return r; } return p; });
      // Solo se acepta si las frases conocidas cubren casi todo el texto; si no, saldría
      // una mezcla español/inglés peor que dejarlo entero en español.
      if (covered > 0 && covered >= cn.replace(/[\s\d.,:;()+\-−–—·•/|¿?¡!…*×%]/g, '').length * 0.7) return out;
    }
    if (cn.indexOf(', ') > 0 && depth < 2) {          // listas separadas por comas (clases, nombres…)
      const parts = cn.split(', ');
      let hit = 0;
      const outp = parts.map(p => { const r = d.exact.get(p); if (r !== undefined) { hit++; return r; } return p; });
      if (hit === parts.length) return outp.join(', ');
    }
    return null;
  }

  function tr(code, s, depth) {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    const core = m[2];
    if (!core) return s;
    const cn = core.replace(/\s+/g, ' ');
    let c = cache[code];
    if (!c) c = cache[code] = new Map();
    let r = c.get(cn);
    if (r === undefined) {
      r = lookup(code, cn, depth || 0);
      if (c.size > 20000) c.clear();
      c.set(cn, r);
    }
    if (r === null) {
      if (code !== 'es' && HAS_LETTER.test(cn) && missingSet.size < 5000) missingSet.add(cn);
      return s;
    }
    return m[1] + r + m[3];
  }

  const t = s => (lang === 'es' || s == null) ? s : tr(lang, String(s), 0);

  /* ---------- DOM ---------- */
  const textStore = new WeakMap();    // Text -> { es, out }
  const attrStore = new WeakMap();    // Element -> { attr: { es, out } }
  let obs = null;

  function doText(n) {
    if (n.parentNode && (NO_TEXT.has(n.parentNode.nodeName) || (n.parentNode.closest && n.parentNode.closest('#lang-section')))) return;
    const cur = n.nodeValue;
    const rec = textStore.get(n);
    const base = (rec && cur === rec.out) ? rec.es : cur;
    const out = lang === 'es' ? base : tr(lang, base, 0);
    if (out !== cur) n.nodeValue = out;
    if (out !== base) textStore.set(n, { es: base, out }); else if (rec) textStore.delete(n);
  }

  function doAttrs(el) {
    for (const a of ATTRS) {
      if (!el.hasAttribute || !el.hasAttribute(a)) continue;
      const cur = el.getAttribute(a);
      let rec = attrStore.get(el);
      const r = rec && rec[a];
      const base = (r && cur === r.out) ? r.es : cur;
      const out = lang === 'es' ? base : tr(lang, base, 0);
      if (out !== cur) el.setAttribute(a, out);
      if (out !== base) { if (!rec) { rec = {}; attrStore.set(el, rec); } rec[a] = { es: base, out }; }
      else if (r) delete rec[a];
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (!SKIP_TAGS.has(root.parentNode && root.parentNode.nodeName) && root.nodeValue.trim()) doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (SKIP_TAGS.has(root.nodeName) || root.id === 'lang-section') return;
      doAttrs(root);
    }
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (n.nodeType === 1 && (SKIP_TAGS.has(n.nodeName) || n.id === 'lang-section')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (n.nodeValue.trim() || textStore.has(n)) doText(n); }
      else doAttrs(n);
    }
  }

  function onMutations(list) {
    if (lang === 'es') return;
    const seen = new Set();
    for (const m of list) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(n => { if (!seen.has(n)) { seen.add(n); walk(n); } });
      } else if (m.type === 'characterData') {
        const n = m.target;
        if (!seen.has(n) && !SKIP_TAGS.has(n.parentNode && n.parentNode.nodeName)) { seen.add(n); doText(n); }
      } else if (m.type === 'attributes') {
        doAttrs(m.target);
      }
    }
    obs.takeRecords();                // descarta las mutaciones que acabamos de provocar nosotros
  }

  function applyAll() {
    walk(document.documentElement);
    if (obs) obs.takeRecords();
  }

  /* ---------- alert / confirm / prompt ---------- */
  function wrapDialogs() {
    ['alert', 'confirm'].forEach(name => {
      const orig = window[name];
      if (typeof orig !== 'function') return;
      window[name] = function (msg) { return orig.call(window, t(msg)); };
    });
    const op = window.prompt;
    if (typeof op === 'function') window.prompt = function (msg, def) { return op.call(window, t(msg), def); };
  }

  /* ---------- selector en Configuración ---------- */
  function injectCSS() {
    if (document.getElementById('i18n-css')) return;
    const st = document.createElement('style');
    st.id = 'i18n-css';
    st.textContent = `
      .lang-options{display:flex; gap:8px; flex-wrap:wrap}
      .lang-opt{flex:1 1 140px; display:flex; flex-direction:column; align-items:center; gap:2px;
        padding:10px 12px; border-radius:14px; cursor:pointer; font:inherit; font-size:15px; font-weight:700;
        color:#e5edf8; background:rgba(255,255,255,.04); border:1px solid rgba(148,163,184,.22);
        transition:border-color .12s ease, background .12s ease}
      .lang-opt small{font-size:11px; font-weight:400; color:#91a1b7}
      .lang-opt:hover{border-color:rgba(167,139,250,.55)}
      .lang-opt[aria-pressed="true"]{background:rgba(139,92,246,.22); border-color:rgba(167,139,250,.8); color:#fff}
      .lang-note{margin-top:8px}
    `;
    document.head.appendChild(st);
  }

  function buildSelector() {
    const card = document.querySelector('#settings-modal .settings-card');
    if (!card || document.getElementById('lang-section')) return false;
    const sec = document.createElement('div');
    sec.className = 'settings-section';
    sec.id = 'lang-section';
    sec.innerHTML = '<h4>🌐 Idioma / Language</h4><div class="lang-options" role="radiogroup" aria-label="Idioma / Language">' +
      Object.keys(LANGS).map(c =>
        `<button type="button" class="lang-opt" data-lang="${c}" role="radio" aria-pressed="false">` +
        `${LANGS[c].flag} ${LANGS[c].label}<small>${LANGS[c].sub}</small></button>`).join('') +
      '</div><div class="small lang-note"></div>';
    sec.addEventListener('click', e => {
      const b = e.target.closest('.lang-opt');
      if (b) setLang(b.dataset.lang);
    });
    const h3 = card.querySelector('h3');
    const intro = h3 && h3.nextElementSibling;          // el <p class="small"> de introducción
    card.insertBefore(sec, intro && intro.tagName === 'P' ? intro.nextSibling : (h3 ? h3.nextSibling : card.firstChild));
    return true;
  }

  function refreshSelector() {
    const sec = document.getElementById('lang-section');
    if (!sec) return;
    sec.querySelectorAll('.lang-opt').forEach(b => {
      const on = b.dataset.lang === lang;
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-checked', String(on));
    });
    sec.querySelector('.lang-note').textContent = NOTES[lang];
  }

  /* ---------- API ---------- */
  function setLang(code) {
    if (!LANGS[code] || code === lang) { refreshSelector(); return; }
    lang = code;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* modo privado */ }
    document.documentElement.lang = lang;
    applyAll();
    refreshSelector();
    document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
  }

  function init() {
    (window.I18N_DICTS || []).forEach(d => add(d.lang, d.entries));
    wrapDialogs();
    injectCSS();
    buildSelector();
    refreshSelector();
    document.documentElement.lang = lang;
    obs = new MutationObserver(onMutations);
    obs.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });
    if (lang !== 'es') applyAll();
    console.log('[i18n.js] idioma: ' + lang);
  }

  window.I18N = {
    get lang() { return lang; },
    setLang, t, add: (code, entries) => { add(code, entries); if (lang === code) applyAll(); },
    missing: () => [...missingSet],
    copyMissing() {
      const text = JSON.stringify(Object.fromEntries([...missingSet].map(k => [k, ''])), null, 1);
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      return text;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
