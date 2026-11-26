/* Plansze z tapety „Paysage de Télémaque dans l’île de Calypso”.
   1) Przy wczytaniu strony: scena z tapety; po kliknięciu (lub klawiszu) przecina się na pół i rozsuwa na boki.
   2) Każdy moduł ma planszę ze sceną odpowiadającą kolejnemu epizodowi opowieści;
      przy otwarciu modułu papierowe skrzydła rozsuwają się i odsłaniają scenę.
   Dane: window.IKONO (ikonografia.js). Tylko zweryfikowane fotografie (status OK w raporcie pobrania). */
(() => {
  'use strict';
  const K = window.IKONO;
  if (!K) return;
  const IMG = new Map(K.items.map(i => [i.id, i]));
  const EP = new Map(K.episodes.map((e, i) => [e.id, Object.assign({ n: i + 1 }, e)]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mk = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const credit = (it, cls = 'plcredit') => {
    const p = mk('p', cls);
    p.append(document.createTextNode(`Dufour, „Paysage de Télémaque dans l’île de Calypso” · ${it.credit} · `));
    const a = mk('a', '', it.license.split(' (')[0]); a.href = it.license_url || it.source; a.target = '_blank'; a.rel = 'noopener';
    const s = mk('a', '', 'źródło'); s.href = it.source; s.target = '_blank'; s.rel = 'noopener';
    p.append(a, document.createTextNode(' · '), s);
    return p;
  };

  /* ---------- 1. plansza otwierająca ---------- */
  const op = K.opening && IMG.get(K.opening.img);
  const deepLink = /^#(boy-)?(cytat|fragment|strona)-/.test(location.hash);
  if (op && !reduce && !deepLink) {
    const ov = mk('div', 'intro');
    const url = `url("${op.img.bg.src}")`;
    for (const side of ['l', 'r']) {
      const half = mk('div', 'ihalf ' + side), inner = mk('div', 'iimg');
      inner.style.backgroundImage = url; inner.style.backgroundPosition = K.opening.pos;
      half.append(inner); ov.append(half);
    }
    const t = mk('div', 'ititle');
    t.append(mk('span', 'ieyebrow', 'Honoré de Balzac'), mk('strong', '', 'Ojciec Goriot'), mk('span', 'isub', 'Obyczaje epoki'));
    const enter = mk('button', 'ienter', 'Wejdź'); enter.type = 'button';
    t.append(enter);
    ov.append(t, credit(op, 'icredit'));
    document.body.append(ov);
    document.documentElement.classList.add('intro-on');
    const open = () => {
      if (ov.classList.contains('go')) return;
      ov.classList.add('go'); document.documentElement.classList.remove('intro-on');
      removeEventListener('keydown', onKey);
      setTimeout(() => ov.remove(), 1700);
    };
    const onKey = e => { if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key !== 'Tab') { e.preventDefault(); open(); } };
    ov.addEventListener('click', open);
    addEventListener('keydown', onKey);
    const im = new Image(); im.src = op.img.bg.src;
    (im.decode ? im.decode() : Promise.resolve()).then(() => ov.classList.add('ready'), () => ov.classList.add('ready'));
    enter.focus({ preventScroll: true });
  }
  /* przypis ilustracji planszy otwierającej w stopce strony */
  if (op) {
    const foot = document.querySelector('.foot');
    if (foot) { const c = credit(op, 'plnote'); c.prepend(document.createTextNode('Ilustracja planszy otwierającej: ')); foot.append(c); }
  }

  /* ---------- 2. plansze modułów ---------- */
  const NAMES = {};
  document.querySelectorAll('#tabs .tab').forEach(t => { NAMES[t.dataset.k] = t.textContent; });
  function band(panel) {
    const k = panel.id.replace('panel-', ''), m = K.modules[k];
    if (!m || panel.querySelector(':scope > .plansza')) return;
    const ep = EP.get(m[0]), it = IMG.get(m[1]) || IMG.get((ep.img || []).find(x => IMG.has(x)));
    if (!ep || !it) return;
    const b = mk('div', 'plansza');
    const bg = mk('div', 'plbg'); bg.style.backgroundImage = `url("${it.img.bg.src}")`; bg.style.backgroundPosition = m[2] || '50% 50%';
    const txt = mk('div', 'pltext');
    txt.append(mk('span', 'plep', `Rozdział ${ep.n} · ${ep.title}`), mk('strong', 'plname', NAMES[k] || ''));
    const wl = mk('div', 'plwing l'), wr = mk('div', 'plwing r');
    const ref = mk('a', 'plref', 'ilustracja ↓'); ref.href = '#przypis-' + k;
    ref.setAttribute('aria-label', 'Przypis: źródło i licencja ilustracji');
    ref.addEventListener('click', e => { e.preventDefault(); document.getElementById('przypis-' + k).scrollIntoView({ block: 'center' }); });
    b.append(bg, txt, ref, wl, wr);
    b.title = ep.evidence;
    panel.prepend(b);
    const note = credit(it, 'plnote'); note.id = 'przypis-' + k;
    note.prepend(document.createTextNode(`Ilustracja w nagłówku (rozdział ${ep.n}): `));
    panel.append(note);
  }
  function play(panel) {
    const b = panel.querySelector(':scope > .plansza');
    if (!b || reduce) return;
    b.classList.remove('go', 'done'); void b.offsetWidth; b.classList.add('go');
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.add('done'), 1600);
  }
  const panels = document.getElementById('panels');
  const seen = new WeakSet();
  const scan = () => {
    for (const p of panels.children) {
      band(p);
      if (!p.hidden && !seen.has(p)) { seen.add(p); play(p); }
      if (p.hidden) seen.delete(p);
    }
  };
  new MutationObserver(scan).observe(panels, { childList: true, subtree: false, attributes: true, attributeFilter: ['hidden'] });
  scan();

  /* nota o kolejności w module Ikonografia */
  const ik = () => {
    const p = document.getElementById('panel-ikonografia');
    if (!p || p.querySelector('.eporder')) return;
    const box = mk('section', 'msec eporder'), h = mk('div', 'sectionhead'), d = mk('div');
    d.append(mk('h2', '', 'Rozdziały strony a epizody tapety'), mk('p', '', K.order_note));
    h.append(d); box.append(h);
    const ol = mk('ol', 'eplist');
    for (const e of K.episodes) {
      const li = mk('li'); const has = e.img.some(x => IMG.has(x));
      li.append(mk('strong', '', e.title), mk('span', '', ' — ' + e.evidence + (has ? '' : ' (fotografia jeszcze niepobrana)')));
      const mods = Object.entries(K.modules).filter(([, v]) => v[0] === e.id).map(([kk]) => NAMES[kk]).filter(Boolean);
      if (mods.length) li.append(mk('span', 'epmods', ' Moduły: ' + mods.join(', ') + '.'));
      ol.append(li);
    }
    box.append(ol);
    const first = p.querySelector('.plansza');
    (first ? first.nextSibling : p.firstChild) ? p.insertBefore(box, (first ? first.nextSibling : p.firstChild)) : p.append(box);
  };
  new MutationObserver(ik).observe(panels, { childList: true });
  ik();
})();
