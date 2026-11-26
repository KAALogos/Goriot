/* Moduły opracowania (zakładki). Dane: opracowanie.js (window.OPRAC); cytaty: window.GORIOT z atlas.js. */
(() => {
  'use strict';
  const O = window.OPRAC, Gx = window.GORIOT;
  if (!O || !Gx) return;
  const btn = (cls, txt, fn) => { const b = el('button', cls, txt); b.type = 'button'; b.onclick = fn; return b; };
  const SRC = new Map(O.sources.map(s => [s.id, s]));
  const CH = new Map(O.characters.map(c => [c.id, c]));
  const TH = new Map(O.theses.map(t => [t.id, t]));
  const TYP = { fakt: 'fakt', interpretacja: 'interpretacja', kontekst: 'kontekst' };
  const STATUS = {
    'tekst': ['zweryfikowano w tekście', 'ok'],
    'źródło': ['źródło odczytane', 'ok'],
    'źródło-fragment': ['odczytano część źródła', 'part'],
    'autorska': ['interpretacja autorska, bez źródła naukowego', 'own']
  };
  const srcShort = s => {
    const m = { 'S-BORT': 'Bortnowska 1881', 'S-BOY': 'Boy-Żeleński 1938', 'S-BOY-BALZAK': 'Boy-Żeleński, Balzak (1934), rozdz. 8', 'S-HZ2019': 'Hanotte-Zawiślak 2019', 'S-HZ2018': 'Hanotte-Zawiślak 2018', 'S-VINC': 'Vinciguerra 1970', 'S-PAISSE': 'Paisse 1968' };
    return m[s] || (SRC.get(s) || {}).title || s;
  };

  /* odsyłacz do cytatu: przycisk rozwija cytat w bieżącym przekładzie */
  function refList(refs) {
    const ids = (refs || []).filter(r => /^[GP]\d\d$/.test(r));
    if (!ids.length) return null;
    const wrap = el('div', 'refs'), chips = el('div', 'qchips'), slot = el('div');
    for (const id of ids) {
      const c = Gx.chip(id, () => {
        const openBox = slot.querySelector(`.qbox[data-q="${id}"]`);
        chips.querySelectorAll('.qchip').forEach(x => x.setAttribute('aria-expanded', 'false'));
        slot.replaceChildren();
        if (openBox) return;
        const h = el('p', 'qtitle', Gx.item(id).title);
        slot.append(h, Gx.quoteBox(id)); c.setAttribute('aria-expanded', 'true');
      });
      c.setAttribute('aria-expanded', 'false');
      chips.append(c);
    }
    wrap.append(chips, slot);
    return wrap;
  }
  function sourceLine(s) {
    if (!s) return null;
    const p = el('p', 'srcline');
    p.append(el('span', 'k', 'Źródło: '), document.createTextNode(`${srcShort(s.id)}, ${s.loc}`));
    if (s.quote) { const q = el('q', 'crit', s.quote); p.append(document.createTextNode(' — '), q); }
    return p;
  }
  function thesis(t, opts = {}) {
    const a = el('article', 'thesis'), head = el('div', 'thead');
    if (!opts.noTags) a.id = 'teza-' + t.id;
    const st = STATUS[t.status];
    head.append(el('span', 'tid', t.id), el('span', 'typ typ-' + t.typ, TYP[t.typ]), el('span', 'st st-' + st[1], st[0]));
    a.append(head, el('p', 'ttext', t.text));
    if (t.note) a.append(el('p', 'tnote', t.note));
    const s = sourceLine(t.source); if (s) a.append(s);
    const r = refList(t.refs); if (r) a.append(r);
    const tags = el('div', 'tags');
    for (const c of t.chars || []) tags.append(btn('', CH.get(c).name, () => { tab('bohaterowie'); focusChar(c); }));
    for (const [ar, row] of t.rows || []) tags.append(btn('', `${pad(ar)} · ${D.areas.find(x => x.id === ar).rows[row][0]}`, () => Gx.goRow(ar, row, null)));
    for (const [x, y] of t.links || []) tags.append(btn('', `${A.get(x).short} ↔ ${A.get(y).short}`, () => { tab('atlas'); select(x); $('map').scrollIntoView(); }));
    for (const ref of (t.refs || []).filter(x => TH.has(x))) tags.append(btn('', 'zob. ' + ref, () => showThesis(ref)));
    if (tags.children.length && !opts.noTags) a.append(tags);
    return a;
  }
  function showThesis(id) {
    tab(TH.get(id).mod);
    const n = document.getElementById('teza-' + id);
    if (n) { n.scrollIntoView({ behavior: 'instant', block: 'start' }); n.classList.add('flash'); setTimeout(() => n.classList.remove('flash'), 2000); }
  }
  const section = (title, sub, ...kids) => { const s = el('section', 'msec'), h = el('div', 'sectionhead'), d = el('div'); d.append(el('h2', '', title)); if (sub) d.append(el('p', '', sub)); h.append(d); s.append(h, ...kids.filter(Boolean)); return s; };
  const theses = mod => { const w = el('div', 'tlist'); O.theses.filter(t => t.mod === mod).forEach(t => w.append(thesis(t))); return w; };
  const areaButtons = ids => { const w = el('div', 'tags'); ids.forEach(a => w.append(btn('', `${pad(a)} · ${A.get(a).title}`, () => { tab('atlas'); jump(a); }))); return w; };

  /* ---------- moduły ---------- */
  const M = {};
  M.kontekst = () => {
    const tl = el('div', 'timelines');
    for (const [k, title] of [['world', 'Chronologia świata przedstawionego'], ['publication', 'Chronologia powstania i przekładów']]) {
      const col = el('div', 'tline'), ol = el('ol');
      col.append(el('h3', '', title));
      for (const e of O.timeline[k]) {
        const li = el('li'); li.append(el('strong', '', e.date), el('span', '', e.text));
        if (e.ref) { const r = refList([e.ref]); r && li.append(r); }
        if (e.source) li.append(el('span', 'srcline', `Źródło: ${srcShort(e.source.id)}, ${e.source.loc}`));
        ol.append(li);
      }
      col.append(ol); tl.append(col);
    }
    return [section('Kontekst historycznoliteracki', 'Restauracja, powstanie powieści, „Komedia ludzka” i powracające postacie.', tl), section('Tezy', null, theses('kontekst'))];
  };
  M.paryz = () => [
    section('Anatomia Paryża', 'Pensjonat, salony, finansjera, prowincja i pionowy układ przestrzeni jako wskaźnik pozycji.', theses('paryz')),
    section('Obyczaje związane z przestrzenią', 'Przykłady z katalogu obyczajów.', areaButtons([8, 1, 11, 12, 15]))
  ];
  let focusChar = () => { };
  M.bohaterowie = () => {
    const grid = el('div', 'chars'), relWrap = el('div'), filt = el('div', 'filterbar'), list = el('div', 'rels');
    let rtype = '', rchar = '';
    for (const c of O.characters) {
      const card = el('article', 'char'); card.id = 'postac-' + c.id;
      card.append(el('h3', '', c.name), el('p', '', c.role));
      const th = el('div', 'tags'); c.themes.forEach(x => th.append(el('span', 'tag', x))); card.append(th);
      const r = refList(c.refs); r && card.append(r);
      const ts = O.theses.filter(t => (t.chars || []).includes(c.id));
      if (ts.length) {
        const d = el('details', 'more'), s = el('summary', '', `Tezy o postaci (${ts.length})`);
        d.append(s); ts.forEach(t => d.append(thesis(t, { noTags: true }))); card.append(d);
      }
      const rb = btn('read', 'Relacje tej postaci ↓', () => { rchar = c.id; draw(); $('relacje').scrollIntoView({ block: 'start' }); });
      card.append(rb);
      grid.append(card);
    }
    const types = ['', 'pokrewieństwo', 'ekonomia', 'mentoring', 'erotyka', 'prestiż', 'przymus'];
    const fb = types.map(t => { const b = btn('filter', t || 'wszystkie', () => { rtype = t; draw(); }); b.dataset.t = t; return b; });
    filt.append(...fb);
    const who = el('p', 'count');
    function draw() {
      fb.forEach(b => { b.classList.toggle('on', b.dataset.t === rtype); b.setAttribute('aria-pressed', String(b.dataset.t === rtype)); });
      const rs = O.relations.filter(r => (!rtype || r.type === rtype) && (!rchar || r.from === rchar || r.to === rchar));
      who.replaceChildren(document.createTextNode(`${rs.length} z ${O.relations.length} relacji` + (rchar ? ` · postać: ${CH.get(rchar).name} ` : '')));
      if (rchar) who.append(btn('linkish', 'pokaż wszystkie', () => { rchar = ''; draw(); }));
      list.replaceChildren(...rs.map(r => {
        const a = el('article', 'rel'), h = el('div', 'rhead2');
        h.append(el('strong', '', CH.get(r.from).name), el('span', 'arrow', '→'), el('strong', '', CH.get(r.to).name), el('span', 'typ', r.type));
        a.append(h, el('p', '', r.label));
        const x = refList(r.refs); x && a.append(x);
        if (r.rows && r.rows.length) { const t = el('div', 'tags'); r.rows.forEach(([ar, row]) => t.append(btn('', `${pad(ar)} · ${D.areas.find(z => z.id === ar).rows[row][0]}`, () => Gx.goRow(ar, row, null)))); a.append(t); }
        return a;
      }));
    }
    focusChar = id => { const n = document.getElementById('postac-' + id); n && n.scrollIntoView({ block: 'start' }); };
    draw();
    relWrap.append(filt, who, list);
    const rs = section('Relacje kierunkowe', 'Strzałka wskazuje kierunek zależności. Opis relacji jest streszczeniem tekstu; interpretacje znajdują się w tezach.', relWrap); rs.id = 'relacje';
    return [section('Bohaterowie', 'Rola w fabule według tekstu, tezy z rozróżnieniem faktów i interpretacji.', grid), rs];
  };
  M.mechanizmy = () => {
    const mg = el('div', 'mechs');
    for (const m of O.mechanisms) {
      const a = el('article', 'mech'); a.append(el('h3', '', m.name), el('p', '', m.def), areaButtons(m.areas));
      const r = refList(m.refs); r && a.append(r); mg.append(a);
    }
    const ax = el('div', 'axes');
    for (const x of O.axes) {
      const a = el('article', 'axis'), ol = el('ol');
      a.append(el('h3', '', x.title));
      for (const s of x.steps) { const li = el('li'); li.append(el('span', '', s.text)); const r = refList([s.ref]); r && li.append(r); ol.append(li); }
      a.append(ol); ax.append(a);
    }
    return [section('Mechanizmy', 'Osiem mechanizmów, które łączą obyczaje z fabułą.', mg), section('Trzy osie i model uczciwego działania', 'Kolejne etapy z odsyłaczami do tekstu.', ax), section('Tezy', null, theses('mechanizmy'))];
  };
  M.poetyka = () => [section('Poetyka', 'Kompozycja, czas, narrator, portret i realizm.', theses('poetyka'))];
  M.sceny = () => {
    const w = el('div', 'scenes');
    for (const s of O.scenes) {
      const a = el('article', 'scene'); a.id = 'scena-' + s.id;
      a.append(el('h3', '', s.title), el('p', 'sfunc', s.function));
      const qs = el('div', 'squotes');
      s.refs.forEach(id => { qs.append(el('p', 'qtitle', Gx.item(id).title), Gx.quoteBox(id)); });
      a.append(qs);
      const d = el('details', 'more'); d.append(el('summary', '', `Interpretacje (${s.theses.length})`)); s.theses.forEach(id => d.append(thesis(TH.get(id), { noTags: true }))); a.append(d);
      const q = el('div', 'questions'); q.append(el('h4', '', 'Pytania')); const ol = el('ol'); s.questions.forEach(x => ol.append(el('li', '', x))); q.append(ol); a.append(q);
      w.append(a);
    }
    return [section('Sceny kluczowe', 'Fragment w wybranym przekładzie, funkcja w kompozycji, interpretacje i pytania.', w)];
  };
  M.konteksty = () => {
    const w = el('div', 'ctxs');
    for (const c of O.contexts) {
      const a = el('article', 'ctx'); a.append(el('h3', '', c.work), el('p', 'ctheme', c.theme));
      const dl = el('dl'); dl.append(el('dt', '', 'Wspólny problem'), el('dd', '', c.common), el('dt', '', 'Różnica'), el('dd', '', c.diff)); a.append(dl);
      const st = STATUS[c.status]; a.append(el('p', 'st st-' + st[1], st[0]));
      const s = sourceLine(c.source); s && a.append(s);
      const r = refList(c.refs); r && a.append(r);
      w.append(a);
    }
    return [section('Konteksty literackie', 'Porównanie pokazuje podobieństwo problemu. Nie jest dowodem wpływu jednego utworu na drugi.', w)];
  };
  M.czytanie = () => {
    const z = O.czz, art = el('article', 'czz'), s = SRC.get(z.source);
    art.append(el('p', 'srcline', `${s.title}. ${s.edition}, s. ${z.pages[0]}–${z.pages[1]}. Tekst w pisowni oryginału (domena publiczna).`));
    for (const p of z.paras) {
      const n = el('p'); let pos = 0;
      for (const [o, g] of p.brk) { n.append(p.text.slice(pos, o), el('span', 'pg', `[s. ${g}]`)); pos = o; }
      n.append(p.text.slice(pos)); art.append(n);
    }
    const q = el('div', 'questions'); q.append(el('h3', '', 'Pytania')); const ol = el('ol'); z.questions.forEach(x => ol.append(el('li', '', x))); q.append(ol);
    const k = el('details', 'more key'); k.append(el('summary', '', 'Klucz odpowiedzi')); const ko = el('ol'); z.key.forEach(x => ko.append(el('li', '', x))); k.append(ko);
    return [section('Czytanie ze zrozumieniem', `Tadeusz Boy-Żeleński o „Komedii ludzkiej” i epoce (s. ${z.pages[0]}–${z.pages[1]}).`, art), section('Zadania', null, q, k)];
  };
  M.zrodla = () => {
    const t = el('div', 'tablewrap'), tb = el('table'), th = el('thead'), tr = el('tr');
    ['Źródło', 'Stan', 'Uwagi'].forEach(h => { const x = el('th', '', h); x.scope = 'col'; tr.append(x); }); th.append(tr); tb.append(th);
    const body = el('tbody');
    for (const s of O.sources) {
      const r = el('tr'), c1 = el('td');
      c1.append(document.createTextNode(s.title + (s.edition ? '. ' + s.edition : '')));
      if (s.doi) c1.append(document.createTextNode(` DOI ${s.doi}.`));
      if (s.url) { c1.append(document.createTextNode(' ')); const a = el('a', '', 'link'); a.href = s.url; a.rel = 'noopener'; a.target = '_blank'; c1.append(a); }
      const n = O.theses.filter(x => x.source && x.source.id === s.id).length;
      r.append(c1, el('td', '', s.status + (n ? ` · ${n} tez` : '')), el('td', '', s.note || ''));
      body.append(r);
    }
    tb.append(body); t.append(tb);
    /* rejestr tez */
    const reg = el('div'), bar = el('div', 'toolbar'), inp = el('input', 'search'), selT = el('select', 'search'), selS = el('select', 'search'), out = el('div', 'tlist'), cnt = el('p', 'count');
    inp.type = 'search'; inp.placeholder = 'Szukaj w tezach…'; inp.setAttribute('aria-label', 'Szukaj w tezach');
    selT.setAttribute('aria-label', 'Typ tezy'); selS.setAttribute('aria-label', 'Status weryfikacji');
    [['', 'każdy typ'], ...Object.keys(TYP).map(k => [k, k])].forEach(([v, l]) => { const o = el('option', '', l); o.value = v; selT.append(o); });
    [['', 'każdy status'], ...Object.entries(STATUS).map(([k, v]) => [k, v[0]])].forEach(([v, l]) => { const o = el('option', '', l); o.value = v; selS.append(o); });
    bar.append(inp, selT, selS);
    const run = () => {
      const w = norm(inp.value.trim()).split(/\s+/).filter(Boolean);
      const ts = O.theses.filter(x => (!selT.value || x.typ === selT.value) && (!selS.value || x.status === selS.value) && w.every(k => norm(x.id + ' ' + x.text + ' ' + (x.chars || []).map(c => CH.get(c).name).join(' ')).includes(k)));
      cnt.textContent = `${ts.length} z ${O.theses.length} tez`;
      out.replaceChildren(...ts.map(x => { const a = thesis(x, { noTags: true }); a.removeAttribute('id'); const g = btn('linkish', `w module: ${NAMES[x.mod]} →`, () => showThesis(x.id)); a.append(g); return a; }));
    };
    inp.oninput = selT.onchange = selS.onchange = run; run();
    reg.append(bar, cnt, out);
    const legend = el('ul', 'legend2');
    Object.values(STATUS).forEach(([l, k]) => { const li = el('li'); li.append(el('span', 'st st-' + k, l)); legend.append(li); });
    return [section('Źródła', 'Stan odczytu każdego źródła. „Do pozyskania” oznacza, że żadna teza się na nie nie powołuje.', t), section('Rejestr tez', 'Wszystkie tezy z typem i statusem weryfikacji.', legend, reg)];
  };

  /* ---------- zakładki ---------- */
  const NAMES = { atlas: 'Atlas obyczajów', kontekst: 'Kontekst', paryz: 'Paryż', bohaterowie: 'Bohaterowie', mechanizmy: 'Mechanizmy', poetyka: 'Poetyka', sceny: 'Sceny', konteksty: 'Konteksty', czytanie: 'Czytanie ze zrozumieniem', zrodla: 'Źródła' };
  const bar = $('tabs'), panels = $('panels'), built = new Set(['atlas']);
  const tabs = Object.entries(NAMES).map(([k, v]) => {
    const b = el('button', 'tab', v); b.type = 'button'; b.id = 'tab-' + k; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'panel-' + k); b.dataset.k = k;
    b.onclick = () => { tab(k); history.replaceState(history.state, '', k === 'atlas' ? location.pathname + location.search : '#modul-' + k); };
    bar.append(b); return b;
  });
  bar.addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    let j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (j === undefined) return; e.preventDefault(); j = (j + tabs.length) % tabs.length; tabs[j].focus(); tabs[j].click();
  });
  let current = null;
  function tab(k) {
    if (!NAMES[k]) k = 'atlas';
    if (!built.has(k)) {
      const p = el('div', 'panel'); p.id = 'panel-' + k; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'tab-' + k); p.tabIndex = -1;
      p.append(...M[k]()); panels.append(p); built.add(k);
    }
    for (const b of tabs) { const on = b.dataset.k === k; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; }
    for (const p of panels.children) p.hidden = p.id !== 'panel-' + k;
    if (current !== k) { current = k; if (k === 'atlas') select(selected); }
    tabs.find(b => b.dataset.k === k).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  window.GORIOT_TAB = tab;
  const fromHash = () => { const m = /^#modul-(\w+)$/.exec(location.hash); if (m && m[1] !== current) { tab(m[1]); window.scrollTo(0, 0); } };
  window.addEventListener('hashchange', fromHash);
  tab('atlas'); fromHash();
})();
