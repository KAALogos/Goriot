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
    p.append(document.createTextNode(`${srcShort(s.id)}, ${s.loc}`));
    if (s.quote) p.title = s.quote;
    return p;
  }
  function thesis(t, opts = {}) {
    const a = el('article', 'thesis'), head = el('div', 'thead');
    if (!opts.noTags) a.id = 'teza-' + t.id;
    const st = STATUS[t.status];
    void st; head.append(el('span', 'typ typ-' + t.typ, TYP[t.typ]));
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
    for (const [k, title] of [['world', 'Chronologia wydarzeń w powieści']]) {
      const col = el('div', 'tline'), ol = el('ol');
      col.append(el('h3', '', title));
      for (const e of O.timeline[k]) {
        const li = el('li'); li.append(el('strong', '', e.date), el('span', '', e.text));
        if (e.ref) { const r = refList([e.ref]); r && li.append(r); }
        ol.append(li);
      }
      col.append(ol); tl.append(col);
    }
    return [section('Kontekst historycznoliteracki', 'Restauracja, powstanie powieści, „Komedia ludzka” i powracające postacie.', tl), section('Interpretacje', null, theses('kontekst'))];
  };
  function pension() {
    const P = O.pension, wrap = el('div', 'pens'), house = el('div', 'house'), side = el('aside', 'pdetail');
    side.setAttribute('aria-live', 'polite');
    house.append(el('div', 'roof'));
    const buttons = [];
    function show(r, f, b) {
      buttons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      wrap.querySelectorAll('.hroom').forEach(g => g.classList.toggle('on', g.dataset.room === r.id));
      const m = P.rooms[r.id];
      const head = el('div', 'mhead');
      head.append(el('span', 'eyebrow', f.name), el('h3', '', r.name)); if (f.note) head.append(el('p', 'pnote', f.note)); head.append(el('p', 'msynth', m.synth));
      const kids = [head, plan(m.plan, r.name)];
      const block = (title, id) => { const s = el('section', 'mblock'); s.append(el('h4', '', title)); if (id) s.append(el('p', 'qtitle', Gx.item(id).title), Gx.quoteBox(id)); return s; };
      if (m.char) kids.push(block(r.id === 'couture' ? 'Postać w tekście: Wiktoryna i pani Couture' : 'Postać w tekście', m.char));
      if (m.desc) kids.push(block('Pomieszczenie w tekście', m.desc));
      else { const s = block('Pomieszczenie w tekście'); s.append(el('p', 'nodesc', m.nodesc)); kids.push(s); }
      for (const id of m.extra || []) kids.push(block('Zob. też', id));
      if (r.char) kids.push(btn('read', 'Karta postaci →', () => { tab('bohaterowie'); focusChar(r.char); }));
      side.replaceChildren(...kids);
    }
    /* rzut z góry: SVG z elementów planu; „t” = przedmiot wymieniony w tekście, „r” = rekonstrukcja */
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (tag, at) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); return n; };
    let planId = 0;
    /* materiały: [wypełnienie główne, detal]; nazwy bez # to wzory z DEFS */
    const MAT = {
      default: ['#efe4cf', '#f8f1e3'], rosewood: ['#8b4a3c', '#a35b4a'], walnut: ['#6f4b34', '#86603f'], wood: ['#a77b52', '#bb8f63'],
      'check-red': ['check'], wicker: ['wicker', '#d9bb84'], 'poor-linen': ['#d8ccb6', '#eee6d6'], 'wood-jug': ['#a07a52', '#f4f1ea'],
      'cold-stone': ['#cfc6b8', '#8f877c'], leather: ['#4a3428', '#5d4436'], marble: ['marble', '#ffffff'], horsehair: ['horsehair', 'horsehair'],
      'marble-fire': ['#bdb8b2', '#8f8a84'], oilcloth: ['#a89470', '#bba886'], green: ['#5f8a5a', '#78a170'], straw: ['straw'],
      plush: ['#a5737a', '#b98a90'], paper: ['#fffdf8'], 'wax-wood': ['#b88a55', '#c99c66']
    };
    const DEFS = `<defs>
      <filter id="shadow-UID" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale=".28" result="d"/><feDropShadow in="d" dx=".7" dy=".9" stdDeviation=".55" flood-color="#3b2a1a" flood-opacity=".38"/></filter>
      <pattern id="fl-boards-UID" width="40" height="5" patternUnits="userSpaceOnUse"><rect width="40" height="5" fill="#d8b98a"/><path d="M0 4.8H40M12 0V4.8M31 0V4.8" stroke="#b99062" stroke-width=".35"/><path d="M2 1.6H9M17 3H27M33 1.4H38" stroke="#caa678" stroke-width=".25"/></pattern>
      <pattern id="fl-dusty-UID" width="40" height="5" patternUnits="userSpaceOnUse"><rect width="40" height="5" fill="#b9ab94"/><path d="M0 4.8H40M14 0V4.8M33 0V4.8" stroke="#958670" stroke-width=".35"/><circle cx="6" cy="2" r=".35" fill="#8a7d6a"/><circle cx="24" cy="3.2" r=".3" fill="#8a7d6a"/><circle cx="36" cy="1.2" r=".25" fill="#a1937e"/></pattern>
      <pattern id="fl-red-UID" width="40" height="5" patternUnits="userSpaceOnUse"><rect width="40" height="5" fill="#b0553f"/><path d="M0 4.8H40M10 0V4.8M29 0V4.8" stroke="#8f3f2e" stroke-width=".35"/><ellipse cx="20" cy="2.4" rx="3" ry=".8" fill="#9c4a37" opacity=".7"/></pattern>
      <pattern id="fl-stone-UID" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#cfc7b8"/><path d="M0 11.8H12M11.8 0V12" stroke="#a89f90" stroke-width=".4"/></pattern>
      <pattern id="fl-attic-UID" width="50" height="7" patternUnits="userSpaceOnUse"><rect width="50" height="7" fill="#c9a97c"/><path d="M0 6.8H50M20 0V6.8" stroke="#a9875b" stroke-width=".4"/></pattern>
      <pattern id="grain-UID" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="2" r=".18" fill="#5b4630" opacity=".25"/><circle cx="6.2" cy="6.8" r=".14" fill="#5b4630" opacity=".2"/><circle cx="4" cy="4.4" r=".1" fill="#fff" opacity=".4"/></pattern>
      <pattern id="w-wood-UID" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#7a5537"/><path d="M0 1.5H3" stroke="#946a47" stroke-width=".5"/></pattern>
      <pattern id="w-paper-UID" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#9fb59e"/><circle cx="2" cy="2" r=".7" fill="#d8c48e"/></pattern>
      <pattern id="w-peel-UID" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#bdb29c"/><path d="M1 1l1.5 1.2M4 4l1 .8" stroke="#8e826d" stroke-width=".4"/></pattern>
      <pattern id="check-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#fff"/><rect width="1" height="1" fill="#b23a3a"/><rect x="1" y="1" width="1" height="1" fill="#b23a3a"/></pattern>
      <pattern id="horsehair-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#2f2b28"/><rect width=".9" height="2" fill="#57514b"/></pattern>
      <pattern id="marble-UID" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#e9e5dd"/><path d="M0 7C3 5 5 8 10 4M2 0C3 3 6 2 7 5" stroke="#b9b2a6" stroke-width=".3" fill="none"/></pattern>
      <pattern id="wicker-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#c9a36a"/><path d="M0 0L2 2M2 0L0 2" stroke="#a9834e" stroke-width=".3"/></pattern>
      <pattern id="straw-UID" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="#d9c27a"/><path d="M0 1H2" stroke="#b9a05a" stroke-width=".35"/></pattern>
    </defs>`;
    function plan(p, name) {
      const fig = el('figure', 'plan'), W = p.w, H = p.h, pad = 7;
      const svg = sv('svg', { viewBox: `${-pad} ${-pad} ${W + 2 * pad} ${H + 2 * pad}`, role: 'img', 'aria-label': `Rzut z góry: ${name}` });
      const uid = 'p' + (++planId), U = id => `url(#${id}-${uid})`;
      svg.insertAdjacentHTML('afterbegin', DEFS.replace(/-UID/g, '-' + uid));
      const gt = sv('g', { filter: U('shadow') }), gr = sv('g', { class: 'grec' }), go = sv('g', {}), marks = sv('g', {});
      const fl = p.floor || { type: 'boards', src: 'r' };
      svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: U('fl-' + fl.type) }));
      if (fl.src === 'r') svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: '#fbf7ef', opacity: .45 }));
      if (p.walls) svg.append(sv('rect', { x: 1.6, y: 1.6, width: W - 3.2, height: H - 3.2, fill: 'none', 'stroke-width': 2.4, stroke: U(p.walls === 'wood' ? 'w-wood' : p.walls === 'paper' ? 'w-paper' : 'w-peel') }));
      svg.append(sv('rect', { x: 0, y: 0, width: W, height: H, fill: U('grain'), opacity: .5 }));
      const legend = [];
      let n = 0;
      const cls = it => it.src === 't' ? 'pt' : 'pr';
      for (const it of p.items) {
        const c = cls(it), x = it.x, y = it.y, w = it.w || 0, h = it.h || 0;
        const g = ['window', 'glassdoor', 'door', 'wall', 'paper', 'label'].includes(it.k) ? go : it.src === 't' ? gt : gr;
        const before = g.childNodes.length;
        const R = (a) => g.append(sv('rect', Object.assign({ class: c }, a)));
        switch (it.k) {
          case 'bed': R({ x, y, width: w, height: h, rx: 1 }); g.append(sv('rect', { x: x + 2, y: y + 2, width: w - 4, height: Math.min(7, h / 4), rx: 1.5, class: c })); break;
          case 'rtable': g.append(sv('ellipse', { cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2, class: c })); break;
          case 'table': case 'desk': case 'nightstand': case 'commode': case 'box': R({ x, y, width: w, height: h }); if (it.k === 'commode') g.append(sv('line', { x1: x, y1: y + h / 2, x2: x + w, y2: y + h / 2, class: c })); break;
          case 'chair': R({ x, y, width: w, height: h, rx: .8 }); g.append(sv('line', { x1: x, y1: y + 1.2, x2: x + w, y2: y + 1.2, class: c + ' thick' })); break;
          case 'armchair': R({ x, y, width: w, height: h, rx: 2.5 }); g.append(sv('rect', { x: x + 2, y: y + 2, width: w - 4, height: h - 4, rx: 1.5, class: c })); break;
          case 'stool': g.append(sv('circle', { cx: x + w / 2, cy: y + h / 2, r: w / 2, class: c })); g.append(sv('circle', { cx: x + w / 2, cy: y + h / 2, r: w / 4, class: c })); break;
          case 'shoes': g.append(sv('ellipse', { cx: x + w * .3, cy: y + h / 2, rx: w * .2, ry: h / 2, class: c })); g.append(sv('ellipse', { cx: x + w * .72, cy: y + h / 2, rx: w * .2, ry: h / 2, class: c })); break;
          case 'fireplace': R({ x, y, width: w, height: h }); g.append(sv('rect', { x: x + 2, y: y + 4, width: w - 4, height: h - 8, class: c + ' hearth' })); break;
          case 'stove': R({ x, y, width: w, height: h, rx: 2 }); g.append(sv('circle', { cx: x + w / 2, cy: y + h / 2, r: Math.min(w, h) / 4, class: c })); break;
          case 'shelf': R({ x, y, width: w, height: h, class: c + ' hatch' }); break;
          case 'stairs': R({ x, y, width: w, height: h }); for (let s = y + 4; s < y + h; s += 4) g.append(sv('line', { x1: x, y1: s, x2: x + w, y2: s, class: c })); break;
          case 'mat': R({ x, y, width: w, height: h, class: c + ' dots' }); break;
          case 'mess': for (let i = 0; i < 6; i++) g.append(sv('rect', { x: x + (i * 4.3) % w, y: y + (i % 3) * 3, width: 5, height: 3.4, transform: `rotate(${(i * 37) % 50 - 25} ${x + (i * 4.3) % w} ${y})`, class: c })); break;
          case 'curtain': g.append(sv('line', { x1: x, y1: y, x2: x + w, y2: y, class: c + ' curtain' })); break;
          case 'line': g.append(sv('line', { x1: x, y1: y, x2: x + w, y2: y, class: c + ' cord' })); break;
          case 'picture': if (it.h) g.append(sv('line', { x1: x, y1: y, x2: x, y2: y + it.h, class: c + ' thick' })); else g.append(sv('line', { x1: x, y1: y, x2: x + w, y2: y, class: c + ' thick' })); break;
          case 'lamp': g.append(sv('circle', { cx: x, cy: y, r: 2.4, class: c })); g.append(sv('path', { d: `M${x - 2.4} ${y}H${x + 2.4}M${x} ${y - 2.4}V${y + 2.4}`, class: c })); break;
          case 'clock': g.append(sv('circle', { cx: x, cy: y, r: 2.6, class: c })); g.append(sv('path', { d: `M${x} ${y}V${y - 1.8}M${x} ${y}H${x + 1.4}`, class: c })); break;
          case 'wall': g.append(sv('line', { x1: x, y1: y, x2: x, y2: y + (it.h || H), class: 'pwall inner ' + c })); break;
          case 'window': case 'glassdoor': {
            const vert = it.vertical, wy = y;
            g.append(sv('rect', { x: vert ? x - 1.4 : x, y: vert ? wy : wy - 1.4, width: vert ? 2.8 : w, height: vert ? w : 2.8, class: 'gap' }));
            g.append(sv('path', { d: vert ? `M${x - .7} ${wy}v${w}M${x + .7} ${wy}v${w}` : `M${x} ${wy - .7}h${w}M${x} ${wy + .7}h${w}`, class: c + (it.k === 'glassdoor' ? ' glass' : ' win') }));
            break; }
          case 'door': {
            const vert = it.vertical, s = w;
            if (vert) { const inward = x === 0 ? 1 : -1; g.append(sv('rect', { x: x - 1.4, y, width: 2.8, height: s, class: 'gap' })); g.append(sv('path', { d: `M${x} ${y}l${inward * s} 0A${s} ${s} 0 0 ${inward > 0 ? 1 : 0} ${x} ${y + s}`, class: c + ' door' })); }
            else { const inward = y === 0 ? 1 : -1; g.append(sv('rect', { x, y: y - 1.4, width: s, height: 2.8, class: 'gap' })); g.append(sv('path', { d: `M${x} ${y}l0 ${inward * s}A${s} ${s} 0 0 ${inward > 0 ? 0 : 1} ${x + s} ${y}`, class: c + ' door' })); }
            break; }
          case 'paper': break;
          case 'label': g.append(Object.assign(sv('text', { x, y, class: 'plabel', 'text-anchor': 'middle' }), { textContent: it.label })); break;
        }
        if (it.src === 't' && !['window', 'glassdoor', 'door', 'wall', 'paper', 'label', 'curtain', 'line', 'picture'].includes(it.k)) {
          const f = MAT[it.m] || MAT.default;
          [...g.childNodes].slice(before).forEach((n2, i) => { const fill = i === 0 ? f[0] : (f[1] || f[0]); n2.style.fill = fill.startsWith('#') ? fill : U(fill); });
        }
        if (it.src === 't' && it.m === 'curtain-yellow' && it.k === 'window') g.append(sv('rect', { x, y: y + 1.4, width: w, height: 2.2, fill: '#e2c25a' }));
        if (it.src === 't' && it.m === 'mural') [...g.childNodes].slice(before).forEach(n2 => { n2.style.stroke = '#5f8a73'; });
        if (it.label && it.k !== 'label') {
          n++;
          legend.push([n, it]);
          if (it.k !== 'paper') {
            let cx = x + (w || 0) / 2, cy = y + (h || 0) / 2;
            if (['window', 'glassdoor'].includes(it.k)) cy = it.vertical ? y + w / 2 : (y === 0 ? y + 4.6 : y - 4.6), cx = it.vertical ? (x === 0 ? 4.6 : x - 4.6) : x + w / 2;
            if (it.k === 'door') { if (it.vertical) { cx = x === 0 ? 4 : x - 4; cy = y + w / 2; } else { cx = x + w / 2; cy = y === 0 ? 4 : y - 4; } }
            if (it.k === 'curtain' || it.k === 'line' || (it.k === 'picture' && !it.h)) { cy = y + (y < 4 ? 3.6 : -3.6); if (it.k === 'curtain') { cx = x + w - 4; cy = y; } }
            if (it.k === 'picture' && it.h) cx = x + 3.6;
            if (it.k === 'wall') { cx = x; cy = 6; }
            const mk = sv('g', { class: 'mk ' + (it.src === 't' ? 'mt' : 'mr') });
            mk.append(sv('circle', { cx, cy, r: 2.9 }), Object.assign(sv('text', { x: cx, y: cy + 1.15, 'text-anchor': 'middle' }), { textContent: n }));
            marks.append(mk);
          }
        }
      }
      for (const [x1, y1, x2, y2] of [[0, 0, W, 0], [W, 0, W, H], [W, H, 0, H], [0, H, 0, 0]]) svg.append(sv('line', { x1, y1, x2, y2, class: 'pwall' }));
      svg.append(gr, gt, go, marks);
      const key = el('div', 'pkey'); key.append(el('span', 'kt', 'przedmiot wymieniony w tekście'), el('span', 'kr', 'rekonstrukcja umowna'));
      const ol = el('ol', 'plegend');
      for (const [i, it] of legend) {
        const li = el('li', it.src === 't' ? 'lt' : 'lr'); li.value = i;
        li.append(document.createTextNode(it.label));
        if (it.pos) li.append(el('span', 'lpos', ' · położenie: ' + it.pos));
        if (it.k === 'paper') li.append(el('span', 'lpos', ' · cechy ścian i podłogi'));
        ol.append(li);
      }
      if (fl.note) { const li = el('li', 'nonum'); li.append(document.createTextNode('Podłoga i ściany (z tekstu): ' + fl.note)); ol.append(li); }
      const cap = el('figcaption');
      cap.append(document.createTextNode('Rzut z góry; rozmieszczenie umowne.'));
      fig.append(svg, key, ol, cap);
      return fig;
    }
    let first = null;
    const groups = new Map();
    for (const f of P.floors) {
      const row = el('div', 'floor'), lab = el('div', 'flabel'), rooms = el('div', 'rooms');
      lab.append(el('strong', '', f.name)); if (f.note) lab.append(el('span', '', f.note));
      for (const r of f.rooms) {
        const b = btn('room' + (r.char ? ' person' : ''), '', () => { show(r, f, b); if (innerWidth < 1000) side.scrollIntoView({ block: 'start' }); });
        b.append(el('strong', '', r.name), el('span', '', r.who));
        b.setAttribute('aria-pressed', 'false'); buttons.push(b); rooms.append(b);
        if (r.name === 'Ojciec Goriot') first = [r, f, b];
        groups.set(r.id, [r, f, b]);
      }
      row.append(lab, rooms); house.append(row);
    }
    const drawing = houseDrawing(groups, (r, f, b) => { show(r, f, b); if (innerWidth < 1000) side.scrollIntoView({ block: 'start' }); });
    const moves = el('div', 'moves');
    for (const m of P.moves) {
      const a = el('article', 'move'), ol = el('ol');
      a.append(el('h4', '', m.who));
      for (const s of m.steps) { const li = el('li'); li.append(el('span', '', s.text), Gx.chip(s.ref)); ol.append(li); }
      a.append(ol); moves.append(a);
    }
    const left = el('div', 'hcol'); left.append(drawing, house);
    wrap.append(left, side);
    show(...first);
    /* duże fragmenty */
    const longs = el('div', 'longs');
    for (const id of P.long) { const a = el('article', 'long'); a.id = 'dlugi-' + id; a.append(el('h3', '', Gx.item(id).title), Gx.quoteBox(id)); longs.append(a); }
    const s1 = section('Pensjonat pani Vauquer', 'Dom na początku akcji, w 1819 roku. Kliknij pokój.', wrap);
    return [s1,
      section('Zmiany miejsc w toku powieści', null, moves),
      section('Duże fragmenty tekstu', 'Najważniejsze opisy domu w całości.', longs)];
  }

  /* ---------- rysunek przekroju domu (SVG) ---------- */
  function houseDrawing(groups, pick) {
    const NS = 'http://www.w3.org/2000/svg';
    const S = (tag, at, txt) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); if (txt != null) n.textContent = txt; return n; };
    const svg = S('svg', { viewBox: '0 0 900 880', class: 'hdraw', role: 'group', 'aria-label': 'Przekrój pensjonatu pani Vauquer; pokoje można wybrać' });
    svg.insertAdjacentHTML('afterbegin', `<defs>
      <pattern id="hpaper" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#efe3c8"/><circle cx="5" cy="5" r=".9" fill="#d8c79f"/></pattern>
      <pattern id="hpaper2" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#e4e6cf"/><path d="M0 6h12" stroke="#d3d6b8" stroke-width="1"/></pattern>
      <pattern id="hpoor" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#e6dccb"/><path d="M2 3l3 2M9 10l2 1" stroke="#c9bba3" stroke-width="1"/></pattern>
      <pattern id="hslate" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill="#6f6a66"/><path d="M0 8h16M8 0v8" stroke="#5c5753" stroke-width="1"/></pattern>
      <pattern id="hstone" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#e2cf9c"/><path d="M0 20h40M20 0v10M0 10h40M40 10v10" stroke="#cdb67b" stroke-width="1"/></pattern>
      <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe2"/><stop offset="1" stop-color="#ece4cf"/></linearGradient>
    </defs>`);
    svg.append(S('rect', { x: 0, y: 0, width: 900, height: 880, fill: 'url(#hsky)' }));
    // ogródek: lipy i okrągły stół
    const gar = S('g', { class: 'hgarden' });
    gar.append(S('rect', { x: 0, y: 800, width: 900, height: 80, fill: '#cdbf98' }));
    for (const [x, r] of [[48, 46], [112, 38]]) { gar.append(S('rect', { x: x - 4, y: 690, width: 8, height: 112, fill: '#7a5b3c' })); gar.append(S('ellipse', { cx: x, cy: 660, rx: r, ry: r * 1.15, fill: '#8ea06f', stroke: '#6f8456', 'stroke-width': 2 })); }
    gar.append(S('ellipse', { cx: 80, cy: 790, rx: 26, ry: 6, fill: '#6f8a5f' }));
    gar.append(S('rect', { x: 77, y: 790, width: 6, height: 12, fill: '#5d6f50' }));
    gar.append(S('text', { x: 82, y: 840, 'text-anchor': 'middle', class: 'hcap' }, 'ogródek'));
    svg.append(gar);
    // bryła: mansarda, kominy, lukarny
    const B = { x0: 170, x1: 850 };
    svg.append(S('path', { d: `M${B.x0 - 10} 240 L${B.x0 + 40} 96 L${B.x1 - 40} 96 L${B.x1 + 10} 240 Z`, fill: 'url(#hslate)', stroke: '#3d3833', 'stroke-width': 3 }));
    svg.append(S('path', { d: `M${B.x0 + 40} 96 L${B.x0 + 80} 52 L${B.x1 - 80} 52 L${B.x1 - 40} 96 Z`, fill: '#7d7873', stroke: '#3d3833', 'stroke-width': 3 }));
    for (const x of [B.x0 + 70, B.x1 - 110]) { svg.append(S('rect', { x, y: 14, width: 40, height: 42, fill: '#b57a5a', stroke: '#3d3833', 'stroke-width': 2.5 })); svg.append(S('rect', { x: x - 4, y: 10, width: 48, height: 8, fill: '#8f5d43' })); }
    svg.append(S('rect', { x: B.x0, y: 240, width: B.x1 - B.x0, height: 560, fill: 'url(#hstone)', stroke: '#3d3833', 'stroke-width': 3 }));
    for (const y of [240, 380, 520, 660]) svg.append(S('rect', { x: B.x0 - 6, y: y - 5, width: B.x1 - B.x0 + 12, height: 9, fill: '#c9b27a', stroke: '#3d3833', 'stroke-width': 1.5 }));
    // pokoje: [id, x0, x1, y0, y1, typ wnętrza]
    const FL = { attic: [118, 232], f3: [252, 375], f2: [392, 515], f1: [532, 655], g: [672, 795] };
    const ROOMS = [
      ['krzysztof', 230, 380, ...FL.attic, 'bed'], ['suszarnia', 380, 640, ...FL.attic, 'lines'], ['sylwia', 640, 790, ...FL.attic, 'bed'],
      ['michonneau', 180, 320, ...FL.f3, 'bed'], ['goriot', 320, 470, ...FL.f3, 'poor'], ['rastignac', 470, 610, ...FL.f3, 'desk'], ['wolny', 680, 840, ...FL.f3, 'empty'],
      ['poiret', 180, 395, ...FL.f2, 'bed'], ['vautrin', 395, 610, ...FL.f2, 'bed'],
      ['vauquer', 180, 360, ...FL.f1, 'salonik'], ['couture', 360, 610, ...FL.f1, 'bed2'], ['couture', 680, 840, ...FL.f1, 'bed'],
      ['salon', 180, 395, ...FL.g, 'salon'], ['jadalnia', 395, 610, ...FL.g, 'dining'], ['kuchnia', 680, 840, ...FL.g, 'kitchen']
    ];
    // klatka schodowa i sień (między jadalnią a kuchnią)
    const st = S('g', { class: 'hstairs' });
    st.append(S('rect', { x: 610, y: 252, width: 70, height: 543, fill: '#d9c9a6', stroke: '#3d3833', 'stroke-width': 2 }));
    for (let y = 262; y < 795; y += 14) st.append(S('line', { x1: 616, y1: y, x2: 674, y2: y + 8, stroke: '#9b8461', 'stroke-width': 2 }));
    st.append(S('text', { x: 645, y: 790, 'text-anchor': 'middle', class: 'hcap' }, 'sień'));
    svg.append(st);
    const furn = (g, k, x0, x1, y0, y1) => {
      const w = x1 - x0, fl = y1 - 6, c = (x0 + x1) / 2;
      const P = (d, f = '#a77b52') => g.append(S('path', { d, fill: f, stroke: '#3d3833', 'stroke-width': 1.6 }));
      const win = (x) => { g.append(S('rect', { x: x - 16, y: y0 + 14, width: 32, height: 46, fill: '#cfe0e4', stroke: '#3d3833', 'stroke-width': 1.6 })); g.append(S('path', { d: `M${x} ${y0 + 14}v46M${x - 16} ${y0 + 37}h32`, stroke: '#3d3833', 'stroke-width': 1.2 })); };
      if (k !== 'lines' && k !== 'kitchen') win(x0 + w * .72);
      if (k === 'bed' || k === 'bed2') { P(`M${x0 + 12} ${fl}v-26h${Math.min(70, w * .45)}v26z`, '#e9e1d2'); P(`M${x0 + 12} ${fl - 26}v-14h10v14z`); }
      if (k === 'bed2') P(`M${x0 + 120} ${fl}v-26h70v26z`, '#e9e1d2');
      if (k === 'poor') { P(`M${x0 + 10} ${fl}v-22h62v22z`, '#d4c7b0'); P(`M${x0 + 90} ${fl}v-24h26v24z`, '#8b4a3c'); g.append(S('path', { d: `M${x0 + 10} ${fl - 36}h62`, stroke: '#a33a3a', 'stroke-width': 3, 'stroke-dasharray': '4 3' })); }
      if (k === 'desk') { P(`M${x0 + 14} ${fl}v-26h50v26z`); g.append(S('path', { d: `M${x0 + 18} ${fl - 30}l14-6 10 4 8-5`, stroke: '#fff', 'stroke-width': 3, fill: 'none' })); }
      if (k === 'salonik') { P(`M${c - 30} ${fl}v-18h24v18z`, '#a5737a'); g.append(S('ellipse', { cx: c + 14, cy: fl - 16, rx: 14, ry: 4, fill: '#a77b52', stroke: '#3d3833' })); }
      if (k === 'salon') { g.append(S('ellipse', { cx: c, cy: fl - 18, rx: 34, ry: 6, fill: '#e9e5dd', stroke: '#3d3833', 'stroke-width': 1.6 })); P(`M${c - 2} ${fl}v-12h4v12z`); P(`M${x0 + 14} ${fl}v-24h22v24z`, '#2f2b28'); P(`M${x1 - 36} ${fl}v-24h22v24z`, '#2f2b28'); g.append(S('rect', { x: x0 + 40, y: y0 + 16, width: 54, height: 30, fill: '#9fb59e', stroke: '#3d3833' })); }
      if (k === 'dining') { P(`M${x0 + 24} ${fl - 18}h${w - 48}v6h-${w - 48}z`, '#a89470'); for (let i = 0; i < 4; i++) P(`M${x0 + 40 + i * 40} ${fl}v-16h10v16z`); P(`M${x1 - 30} ${fl}v-42h18v42z`, '#5f8a5a'); }
      if (k === 'kitchen') { P(`M${x0 + 14} ${fl}v-40h56v40z`, '#cfc6b8'); g.append(S('path', { d: `M${x0 + 20} ${fl - 40}v-20h10v20`, fill: '#8f877c', stroke: '#3d3833' })); g.append(S('rect', { x: x1 - 52, y: y0 + 24, width: 34, height: 40, fill: '#cfe0e4', stroke: '#3d3833', 'stroke-width': 1.6 })); }
      if (k === 'lines') for (const y of [y0 + 34, y0 + 60]) { g.append(S('path', { d: `M${x0 + 16} ${y}H${x1 - 16}`, stroke: '#7a6b57', 'stroke-width': 1.2 })); for (let x = x0 + 40; x < x1 - 30; x += 46) P(`M${x} ${y}h22v18h-22z`, '#fffaf0'); }
    };
    const wallFill = { goriot: 'url(#hpoor)', salon: 'url(#hpaper2)', jadalnia: '#c9a37a', kuchnia: '#e3ddd2', suszarnia: '#e2d2b0', krzysztof: '#e2d2b0', sylwia: '#e2d2b0', couture: 'url(#hpaper)', vauquer: 'url(#hpaper)' };
    const made = new Map();
    for (const [id, x0, x1, y0, y1, k] of ROOMS) {
      const info = groups.get(id); if (!info) continue;
      let g = made.get(id);
      if (!g) {
        g = S('g', { class: 'hroom', tabindex: 0, role: 'button', 'data-room': id, 'aria-label': `${info[0].name} — ${info[1].name}` });
        g.addEventListener('click', () => pick(...info));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(...info); } });
        made.set(id, g); svg.append(g);
      }
      g.append(S('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: wallFill[id] || '#ece2cb', class: 'hwall' }));
      g.append(S('rect', { x: x0, y: y1 - 6, width: x1 - x0, height: 6, fill: id === 'jadalnia' ? '#b0553f' : '#b38b5d' }));
      furn(g, k, x0, x1, y0, y1);
      g.append(S('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: 'none', class: 'hframe' }));
      if (!g.querySelector('.hname')) {
        const LBL = { michonneau: 'Michonneau', goriot: 'Goriot', rastignac: 'Rastignac', wolny: 'wolny', poiret: 'Poiret', vautrin: 'Vautrin', vauquer: 'pani Vauquer', couture: 'Couture i Wiktoryna', krzysztof: 'Krzysztof', sylwia: 'Sylwia', suszarnia: 'suszarnia', salon: 'salon', jadalnia: 'jadalnia', kuchnia: 'kuchnia' };
        const lab = S('text', { x: x0 + 8, y: y0 + 26, class: 'hname' }, LBL[id] || info[0].name);
        g.append(lab);
      }
    }
    // podpisy pięter
    for (const [t, y] of [['poddasze', 180], ['3. piętro', 318], ['2. piętro', 458], ['1. piętro', 598], ['parter', 738]]) svg.append(S('text', { x: 862, y, class: 'hcap', 'text-anchor': 'start', transform: `rotate(90 862 ${y})` }, t));
    const fig = document.createElement('figure'); fig.className = 'hfig'; fig.append(svg);
    return fig;
  }
  M.paryz = () => [
    ...pension(),
    section('Anatomia Paryża', 'Pensjonat, salony, finansjera, prowincja i pionowy układ przestrzeni jako wskaźnik pozycji.', theses('paryz')),
    section('Obyczaje związane z przestrzenią', 'Przykłady z katalogu obyczajów.', areaButtons([8, 1, 11, 12, 15]))
  ];
  let focusChar = () => { };
  M.bohaterowie = () => {
    const grid = el('div', 'pcards'), relWrap = el('div'), filt = el('div', 'filterbar'), list = el('div', 'rels');
    let rtype = '', rchar = '';
    const ROOMNAME = {}; O.pension.floors.forEach(f => f.rooms.forEach(r => { ROOMNAME[r.id] = [r.name, f.name]; }));
    const AX = new Map(O.axes.map(a => [a.id, a]));
    for (const c of O.cards) {
      const ch = CH.get(c.id), card = el('article', 'pcard'); card.id = 'postac-' + c.id;
      const ini = ch.name.replace(/^(Ojciec|Pani|Panna|Wicehrabina|Baron|Hrabia)\s+/, '').replace(/\(.*\)/, '').trim();
      const med = el('div', 'pmed'); med.append(el('span', '', ini.split(/\s+/).filter(w => /^[A-ZŻŹĆŚŁÓ]/.test(w)).map(w => w[0]).slice(0, 2).join('')));
      const head = el('header', 'phead'); head.append(med, el('h3', '', ch.name));
      card.append(head, el('p', 'prole', ch.role), el('p', 'pshort', c.short));
      const q = el('div', 'pquote'); q.append(Gx.quoteBox(c.text)); card.append(q);
      const facts = el('div', 'pfacts');
      if (c.room) facts.append(btn('pchip', `Mieszka: ${ROOMNAME[c.room][1]} →`, () => { tab('paryz'); setTimeout(() => { const g = document.querySelector(`#panel-paryz .hroom[data-room="${c.room}"]`); g && g.dispatchEvent(new Event('click')); g && g.scrollIntoView({ block: 'center' }); }, 30); }));
      if (c.arc) facts.append(btn('pchip', `Przemiana: ${AX.get(c.arc).title} →`, () => { tab('mechanizmy'); setTimeout(() => { const n = [...document.querySelectorAll('.axis h3')].find(h => h.textContent === AX.get(c.arc).title); n && n.scrollIntoView({ block: 'start' }); }, 30); }));
      const rel = O.relations.filter(r => r.from === c.id || r.to === c.id);
      const others = [...new Set(rel.map(r => r.from === c.id ? r.to : r.from))].filter(id => O.cards.some(x => x.id === id));
      if (others.length) { const w = el('div', 'prel'); w.append(el('span', 'plab', 'Powiązania:')); others.forEach(id => w.append(btn('pname', CH.get(id).name.replace(/^(Ojciec|Pani|Panna|Wicehrabina) /, ''), () => { const n = document.getElementById('postac-' + id); n.scrollIntoView({ block: 'center' }); n.classList.add('flash'); setTimeout(() => n.classList.remove('flash'), 1500); }))); facts.append(w); }
      card.append(facts);
      const fr = refList(c.refs); if (fr) { const d = el('details', 'more'); d.append(el('summary', '', 'Fragmenty')); d.append(fr); card.append(d); }
      grid.append(card);
    }
    const types = ['', 'pokrewieństwo', 'ekonomia', 'mentoring', 'erotyka', 'prestiż', 'przymus'];
    const fb = types.map(t => { const b = btn('filter', t || 'wszystkie', () => { rtype = t; draw(); }); b.dataset.t = t; return b; });
    filt.append(...fb);
    const who = el('p', 'count');
    function draw() {
      fb.forEach(b => { b.classList.toggle('on', b.dataset.t === rtype); b.setAttribute('aria-pressed', String(b.dataset.t === rtype)); });
      const rs = O.relations.filter(r => (!rtype || r.type === rtype) && (!rchar || r.from === rchar || r.to === rchar));
      who.replaceChildren(document.createTextNode(rchar ? `Postać: ${CH.get(rchar).name} ` : ''));
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
    const rs = section('Kto od kogo zależy', 'Strzałka wskazuje kierunek zależności.', relWrap); rs.id = 'relacje';
    return [section('Postacie', null, grid), rs];
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
    return [section('Mechanizmy', 'Osiem mechanizmów, które łączą obyczaje z fabułą.', mg), section('Trzy osie i model uczciwego działania', 'Kolejne etapy z odsyłaczami do tekstu.', ax), section('Interpretacje', null, theses('mechanizmy'))];
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
    return [section('Sceny kluczowe', 'Jedenaście scen, które warto omówić na lekcji.', w)];
  };
  M.konteksty = () => {
    const w = el('div', 'ctxs');
    for (const c of O.contexts) {
      const a = el('article', 'ctx'); a.append(el('h3', '', c.work), el('p', 'ctheme', c.theme));
      const dl = el('dl'); dl.append(el('dt', '', 'Wspólny problem'), el('dd', '', c.common), el('dt', '', 'Różnica'), el('dd', '', c.diff)); a.append(dl);
      const s = sourceLine(c.source); s && a.append(s);
      const r = refList(c.refs); r && a.append(r);
      w.append(a);
    }
    return [section('Konteksty literackie', 'Utwory, które warto zestawić z „Ojcem Goriot”.', w)];
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
  M.ikonografia = () => {
    const K = window.IKONO, intro = el('div', 'ikintro');
    const q = el('div', 'ikquote');
    for (const id of K.intro.refs) q.append(el('p', 'qtitle', Gx.item(id).title), Gx.quoteBox(id));
    const hyp = el('aside', 'ikhyp'); hyp.append(el('h3', '', K.intro.hypothesis_title));
    const ul = el('ul'); K.intro.points.forEach(t => ul.append(el('li', '', t))); hyp.append(ul);
    intro.append(q, hyp);
    const out = [section('Tapeta z „Telemakiem”', K.intro.lead, intro)];
    for (const g of K.groups) {
      const items = K.items.filter(e => e.group === g.id);
      if (!items.length) continue;
      const grid = el('div', 'ikgrid' + (items.length > 1 ? ' multi' : ''));
      for (const e of items) {
        const f = el('figure', 'ikfig'), a = el('a'), pic = el('img');
        a.href = e.img.full.src; a.target = '_blank'; a.rel = 'noopener';
        a.setAttribute('aria-label', `${e.title} — otwórz w większym rozmiarze`);
        pic.src = e.img.web.src; pic.width = e.img.web.w; pic.height = e.img.web.h; pic.loading = 'lazy'; pic.decoding = 'async'; pic.alt = e.alt;
        a.append(pic);
        const cap = el('figcaption');
        cap.append(el('strong', 'iktitle', e.title), el('span', 'ikcap', e.caption));
        const det = el('details', 'ikdet'); det.append(el('summary', '', 'Źródło i licencja'));
        const meta = el('p', 'ikmeta');
        meta.append(document.createTextNode(e.credit + '. '));
        const src = el('a', '', 'Źródło'); src.href = e.source; src.target = '_blank'; src.rel = 'noopener';
        meta.append(src, document.createTextNode(' · '));
        if (e.license_url) { const l = el('a', '', e.license); l.href = e.license_url; l.target = '_blank'; l.rel = 'noopener'; meta.append(l); }
        else meta.append(document.createTextNode(e.license));
        meta.append(document.createTextNode(` · Przekształcenia: ${e.changes}`));
        if (e.img.room) { const rl = el('a', '', 'zdjęcie wnętrza'); rl.href = e.img.room.full.src; rl.target = '_blank'; rl.rel = 'noopener'; meta.append(document.createTextNode(' '), rl, document.createTextNode('.')); }
        if (e.derivative_license) meta.append(document.createTextNode(` Wersje pochodne: ${e.derivative_license}.`));
        det.append(meta); cap.append(det);

        f.append(a, cap); grid.append(f);
      }
      out.push(section(g.title, g.lead, grid));
    }
    const t = el('div', 'tablewrap'), tb = el('table'), th = el('thead'), tr = el('tr');
    ['Plik', 'Licencja oryginału', 'Master (oryginał)'].forEach(h => { const x = el('th', '', h); x.scope = 'col'; tr.append(x); }); th.append(tr); tb.append(th);
    const body = el('tbody');
    for (const e of K.items) {
      const r = el('tr');
      r.append(el('td', '', e.title), el('td', '', e.license + (e.derivative_license ? ` (pochodne: ${e.derivative_license})` : '')), el('td', '', `${e.master.file}, ${e.master.w}×${e.master.h} px, SHA-256 ${e.master.sha256.slice(0, 16)}…`));
      body.append(r);
    }
    tb.append(body); t.append(tb);
    void t;
    return out;
  };
  M.start = () => {
    const K = window.IKONO || { items: [], modules: {} }, IMG = new Map(K.items.map(i => [i.id, i]));
    const hero = el('div', 'shero');
    hero.append(el('p', 'slead', 'Paryż, rok 1819. W pensjonacie pani Vauquer mieszkają obok siebie zubożały ojciec, ambitny student i zbiegły galernik. Wybierz, od czego zaczynasz.'));
    const tiles = el('div', 'tiles'), mini = el('div', 'tiles mini');
    const T = [
      ['czytaj', 'Czytaj powieść', 'Cały tekst w przekładzie Bortnowskiej i Boya-Żeleńskiego.', '01_laval_6761', '30% 78%', () => Gx.openPage(Gx.ED[Gx.mode() === 'boy' ? 'boy' : 'bort'].first, Gx.mode() === 'boy' ? 'boy' : 'bort'), 'big'],
      ['paryz', 'Pensjonat pani Vauquer', 'Wejdź do domu: kto gdzie mieszka i za ile.', null, null, null, 'big house'],
      ['bohaterowie', 'Postacie', 'Karty bohaterów i ich zależności.', '06_wismar_04', '45% 86%', null, ''],
      ['sceny', 'Sceny kluczowe', 'Jedenaście scen z pytaniami.', '05_wismar_03', '42% 88%', null, ''],
      ['atlas', 'Obyczaje epoki', 'Mapa i katalog obyczajów z cytatami.', '03_wismar_01', '40% 82%', null, ''],
      ['mechanizmy', 'Pieniądz i awans', 'Posag, dług, protekcja: jak działa ten świat.', '04_wismar_02', '62% 88%', null, ''],
      ['kontekst', 'Epoka i powieść', 'Restauracja, „Komedia ludzka”.', null, null, null, 'small'],
      ['poetyka', 'Jak to jest napisane', 'Narrator, kompozycja, realizm.', null, null, null, 'small'],
      ['konteksty', 'Porównania', '„Lalka”, „Król Lear” i inne.', null, null, null, 'small'],
      ['ikonografia', 'Tapeta z „Telemakiem”', 'Ilustracje epoki na stronie.', null, null, null, 'small'],
      ['czytanie', 'Czytanie ze zrozumieniem', 'Tekst Boya o Balzaku z zadaniami.', null, null, null, 'small']
    ];
    for (const [k, title, desc, img, pos, act, cls] of T) {
      const b = el('button', 'tile ' + (cls || '')); b.type = 'button';
      const pic = el('div', 'tpic');
      if (img && IMG.get(img)) { pic.style.backgroundImage = `url("${IMG.get(img).img.bg.src}")`; pic.style.backgroundPosition = pos; }
      else if (k !== 'paryz') pic.classList.add('tplain');
      const tx = el('div', 'ttext'); tx.append(el('strong', '', title), el('span', '', desc));
      b.append(pic, tx);
      b.addEventListener('click', act || (() => { tab(k); scrollTo(0, 0); }));
      (cls === 'small' ? mini : tiles).append(b);
      if (k === 'paryz') b.dataset.house = '1';
    }
    // miniatura rysunku domu w kaflu pensjonatu
    const houseTile = tiles.querySelector('[data-house] .tpic');
    if (houseTile) {
      const groups = new Map(); O.pension.floors.forEach(f => f.rooms.forEach(r => groups.set(r.id, [r, f, null])));
      const fig = houseDrawing(groups, () => { tab('paryz'); scrollTo(0, 0); });
      fig.querySelectorAll('.hroom').forEach(g => { g.removeAttribute('tabindex'); g.removeAttribute('role'); });
      fig.querySelector('svg').setAttribute('aria-hidden', 'true');
      houseTile.append(fig); houseTile.classList.add('thouse');
    }
    return [section('Od czego zacząć', null, hero, tiles, mini)];
  };
  M.zrodla = () => {
    const ul = el('ul', 'biblio');
    for (const src of O.sources.filter(x => !/nieodczytany|niedostępny|tylko opis/.test(x.status))) {
      const li = el('li');
      li.append(document.createTextNode(src.title + (src.edition ? '. ' + src.edition : '') + (src.doi ? `. DOI ${src.doi}` : '') + ' '));
      if (src.url) { const a = el('a', '', 'link'); a.href = src.url; a.target = '_blank'; a.rel = 'noopener'; li.append(a); }
      ul.append(li);
    }
    return [section('Źródła', 'Teksty powieści i opracowania wykorzystane na stronie.', ul)];
  };

  /* ---------- zakładki ---------- */
  const NAMES = { start: 'Start', atlas: 'Atlas obyczajów', kontekst: 'Kontekst', paryz: 'Paryż', bohaterowie: 'Postacie', mechanizmy: 'Mechanizmy', poetyka: 'Poetyka', sceny: 'Sceny', konteksty: 'Konteksty', ikonografia: 'Ikonografia', czytanie: 'Czytanie ze zrozumieniem', zrodla: 'Źródła' };
  if (!window.IKONO) delete NAMES.ikonografia;
  const bar = $('tabs'), panels = $('panels'), built = new Set(['atlas']);
  const tabs = Object.entries(NAMES).map(([k, v]) => {
    const b = el('button', 'tab', v); b.type = 'button'; b.id = 'tab-' + k; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', 'panel-' + k); b.dataset.k = k;
    b.onclick = () => { tab(k); history.replaceState(history.state, '', k === 'start' ? location.pathname + location.search : '#modul-' + k); };
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
  tab(/^#(boy-)?(cytat|fragment|strona)-/.test(location.hash) ? 'atlas' : 'start'); fromHash();
})();
