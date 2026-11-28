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
  const deepLink = /^#((boy-)?(cytat|fragment|strona)-|modul-|scena-)/.test(location.hash);
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
    if (!m || panel.querySelector(':scope > .plnote')) return;
    const ep = EP.get(m[0]), it = IMG.get(m[1]) || (ep && IMG.get((ep.img || []).find(x => IMG.has(x))));
    if (!it) return;
    const note = credit(it, 'plnote'); note.id = 'przypis-' + k;
    note.prepend(document.createTextNode('Ilustracja planszy: '));
    panel.append(note);
  }
  /* plansza działu: ta sama rozsuwana tapeta co na wejściu, otwiera się sama */
  function play(panel) {
    const k = panel.id.replace('panel-', ''), m = K.modules[k];
    if (!m || reduce || document.documentElement.classList.contains('intro-on')) return;
    const ep = EP.get(m[0]), it = IMG.get(m[1]) || (ep && IMG.get((ep.img || []).find(x => IMG.has(x))));
    if (!it) return;
    document.querySelectorAll('.secintro').forEach(x => x.remove());
    let first = true;
    try { const seenK = JSON.parse(sessionStorage.getItem('goriot-plansze') || '[]'); first = !seenK.includes(k); if (first) { seenK.push(k); sessionStorage.setItem('goriot-plansze', JSON.stringify(seenK)); } } catch (e) { first = true; }
    const ov = mk('div', 'intro secintro' + (first ? '' : ' fast')); ov.setAttribute('aria-hidden', 'true');
    for (const side of ['l', 'r']) {
      const half = mk('div', 'ihalf ' + side), inner = mk('div', 'iimg');
      inner.style.backgroundImage = `url("${it.img.bg.src}")`; inner.style.backgroundPosition = m[2] || '50% 50%';
      half.append(inner); ov.append(half);
    }
    const t = mk('div', 'ititle');
    t.append(mk('span', 'ieyebrow', 'Ojciec Goriot'), mk('strong', '', NAMES[k] || ''));
    ov.append(t);
    document.body.append(ov);
    const open = () => { if (ov.classList.contains('go')) return; ov.classList.add('go'); setTimeout(() => ov.remove(), first ? 2600 : 900); };
    ov.addEventListener('click', open);
    const im = new Image(); im.src = it.img.bg.src;
    const go = () => setTimeout(open, first ? 900 : 250);
    (im.decode ? im.decode() : Promise.resolve()).then(go, go);
    setTimeout(open, 3500);
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
  if (deepLink) for (const p of panels.children) if (!p.hidden) seen.add(p);  // wejście z linku: bez planszy działu
  new MutationObserver(scan).observe(panels, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  scan();

})();
